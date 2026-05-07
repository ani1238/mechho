'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from '@react-google-maps/api'
import { X, MapPin, Search, Navigation } from 'lucide-react'

const LIBRARIES: ('places')[] = ['places']
const DEFAULT_CENTER = { lat: 22.5726, lng: 88.3639 } // Kolkata

type LatLng = { lat: number; lng: number }

export type MapLocationResult = {
  address: string
  pincode: string
  lat: number
  lng: number
}

type Props = {
  onConfirm: (result: MapLocationResult) => void
  onClose: () => void
}

export default function MapPinPicker({ onConfirm, onClose }: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: LIBRARIES,
  })

  const [markerPos, setMarkerPos] = useState<LatLng>(DEFAULT_CENTER)
  const [mapCenter, setMapCenter] = useState<LatLng>(DEFAULT_CENTER)
  const [addressText, setAddressText] = useState('')
  const [pincode, setPincode] = useState('')
  const [geocoding, setGeocoding] = useState(false)
  const [locating, setLocating] = useState(false)

  const mapRef = useRef<google.maps.Map | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  // ── Reverse geocode ────────────────────────────────────────────────────────
  const reverseGeocode = useCallback((pos: LatLng) => {
    setGeocoding(true)
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ location: pos }, (results, status) => {
      setGeocoding(false)
      if (status === 'OK' && results?.[0]) {
        const r = results[0]
        setAddressText(r.formatted_address ?? '')
        const pc = r.address_components?.find((c) =>
          c.types.includes('postal_code')
        )
        setPincode(pc?.long_name ?? '')
      }
    })
  }, [])

  // ── Use current GPS location ───────────────────────────────────────────────
  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setMarkerPos(p)
        setMapCenter(p)
        mapRef.current?.panTo(p)
        mapRef.current?.setZoom(17)
        reverseGeocode(p)
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 8000 }
    )
  }, [reverseGeocode])

  // On first load — try to geolocate automatically
  useEffect(() => {
    if (isLoaded) handleGeolocate()
  }, [isLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Map click ─────────────────────────────────────────────────────────────
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return
      const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() }
      setMarkerPos(pos)
      reverseGeocode(pos)
    },
    [reverseGeocode]
  )

  // ── Marker drag ───────────────────────────────────────────────────────────
  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return
      const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() }
      setMarkerPos(pos)
      reverseGeocode(pos)
    },
    [reverseGeocode]
  )

  // ── Autocomplete place selected ────────────────────────────────────────────
  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace()
    if (!place?.geometry?.location) return

    const pos = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    }
    setMarkerPos(pos)
    setMapCenter(pos)
    mapRef.current?.panTo(pos)
    mapRef.current?.setZoom(17)

    setAddressText(place.formatted_address ?? place.name ?? '')
    const pc = place.address_components?.find((c) =>
      c.types.includes('postal_code')
    )
    setPincode(pc?.long_name ?? '')
    // If no postal code in place details, reverse geocode to get it
    if (!pc) reverseGeocode(pos)
  }, [reverseGeocode])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        style={{ height: 'min(92dvh, 580px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-mechho-blue" />
            <h2 className="font-bold text-mechho-blue text-sm">Pick Delivery Location</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {!isLoaded ? (
          <div className="flex items-center justify-center h-72 text-gray-400 text-sm">
            Loading map…
          </div>
        ) : (
          <>
            {/* Search bar */}
            <div className="px-3 py-2 border-b bg-gray-50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Autocomplete
                  onLoad={(ref) => { autocompleteRef.current = ref }}
                  onPlaceChanged={handlePlaceChanged}
                  options={{ componentRestrictions: { country: 'in' } }}
                  className="flex-1"
                >
                  <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-mechho-blue/40 transition">
                    <Search size={14} className="text-gray-400 flex-shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search area, street, landmark…"
                      className="flex-1 text-sm outline-none bg-transparent min-w-0"
                    />
                  </div>
                </Autocomplete>

                {/* GPS button */}
                <button
                  onClick={handleGeolocate}
                  disabled={locating}
                  title="Use my current location"
                  className="flex-shrink-0 p-2.5 bg-mechho-blue/10 hover:bg-mechho-blue/20 text-mechho-blue rounded-xl transition disabled:opacity-50"
                >
                  <Navigation size={16} className={locating ? 'animate-pulse' : ''} />
                </button>
              </div>
            </div>

            {/* Map */}
            <div style={{ height: '280px', flexShrink: 0 }}>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}
                zoom={15}
                onClick={handleMapClick}
                onLoad={(map) => { mapRef.current = map }}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                  zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_CENTER,
                  },
                }}
              >
                <Marker
                  position={markerPos}
                  draggable
                  onDragEnd={handleMarkerDragEnd}
                  animation={google.maps.Animation.DROP}
                />
              </GoogleMap>
            </div>

            {/* Address preview + confirm */}
            <div className="px-4 py-3 space-y-3 flex-shrink-0 border-t bg-white">
              <div className="bg-gray-50 rounded-xl px-3 py-2.5 min-h-[52px] flex items-center">
                {geocoding ? (
                  <p className="text-sm text-gray-400">Getting address…</p>
                ) : addressText ? (
                  <div>
                    <p className="text-sm text-gray-800 font-medium leading-snug">
                      {addressText}
                    </p>
                    {pincode && (
                      <p className="text-xs text-gray-500 mt-0.5">📮 Pincode: {pincode}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    Tap on the map or drag the pin to set your location
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  if (addressText)
                    onConfirm({ address: addressText, pincode, lat: markerPos.lat, lng: markerPos.lng })
                }}
                disabled={!addressText || geocoding}
                className="w-full py-3 bg-mechho-blue text-white rounded-xl font-semibold text-sm disabled:opacity-50 hover:opacity-90 active:scale-[0.98] transition"
              >
                ✓ Use This Location
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
