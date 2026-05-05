'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SurveyResponse } from '@/types'
import { cn } from '@/lib/utils'
import { Download, Users, Fish, ChefHat, MapPin, AlertCircle, BarChart2 } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countOccurrences(arr: string[][]): Record<string, number> {
  const map: Record<string, number> = {}
  arr.forEach((list) => list.forEach((v) => { map[v] = (map[v] ?? 0) + 1 }))
  return map
}

function countField(arr: (string | null | undefined)[]): Record<string, number> {
  const map: Record<string, number> = {}
  arr.forEach((v) => {
    if (v) map[v] = (map[v] ?? 0) + 1
  })
  return map
}

function topEntry(counts: Record<string, number>): string {
  const entries = Object.entries(counts)
  if (!entries.length) return '—'
  return entries.sort((a, b) => b[1] - a[1])[0][0]
}

function downloadCSV(data: SurveyResponse[]) {
  const headers = [
    'Name', 'Phone', 'Pincode', 'Fish Types', 'Preparations',
    'Portion Size', 'Price Band', 'Frequency', 'Comments', 'Date',
  ]
  const rows = data.map((r) => [
    r.name ?? '',
    r.phone ?? '',
    r.pincode,
    r.fish_types.join('; '),
    r.preparations.join('; '),
    r.portion_size ?? '',
    r.price_band ?? '',
    r.frequency ?? '',
    r.comments ?? '',
    r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '',
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mechho-survey-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Bar chart ────────────────────────────────────────────────────────────────

function BarChart({
  data,
  color = 'bg-mechho-blue-mid',
  max,
}: {
  data: [string, number][]
  color?: string
  max?: number
}) {
  const maxVal = max ?? Math.max(...data.map(([, n]) => n), 1)
  return (
    <div className="space-y-2">
      {data.map(([label, count]) => (
        <div key={label} className="flex items-center gap-3">
          <span className="w-36 text-xs text-gray-600 text-right truncate flex-shrink-0">{label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', color)}
              style={{ width: `${Math.max((count / maxVal) * 100, 2)}%` }}
            />
          </div>
          <span className="w-8 text-xs font-semibold text-gray-700 text-right flex-shrink-0">{count}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon, iconBg,
}: {
  label: string; value: string; icon: React.ReactNode; iconBg: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-bold text-gray-900 text-base leading-tight truncate">{value}</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SurveyPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = useRef(createClient()).current

  const fetchResponses = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) {
      setError(err.message)
    } else {
      setResponses((data ?? []) as SurveyResponse[])
      setError(null)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchResponses() }, [fetchResponses])

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      </div>
    )
  }

  // Compute stats
  const fishCounts = countOccurrences(responses.map((r) => r.fish_types))
  const prepCounts = countOccurrences(responses.map((r) => r.preparations))
  const priceCounts = countField(responses.map((r) => r.price_band))
  const freqCounts = countField(responses.map((r) => r.frequency))
  const pincodeCounts = countField(responses.map((r) => r.pincode))

  const topFish = topEntry(fishCounts)
  const topPrep = topEntry(prepCounts)
  const topPrice = topEntry(priceCounts)
  const topPincode = topEntry(pincodeCounts)

  const fishRanking = Object.entries(fishCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
  const prepRanking = Object.entries(prepCounts).sort((a, b) => b[1] - a[1])
  const priceRanking = Object.entries(priceCounts).sort((a, b) => b[1] - a[1])
  const freqRanking = Object.entries(freqCounts).sort((a, b) => b[1] - a[1])
  const pincodeRanking = Object.entries(pincodeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Survey Results</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {responses.length} total response{responses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => downloadCSV(responses)}
          disabled={responses.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-mechho-blue text-white rounded-xl text-sm font-medium hover:bg-mechho-blue-mid transition disabled:opacity-50"
        >
          <Download size={15} />
          Download CSV
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          label="Total Responses"
          value={responses.length.toString()}
          iconBg="bg-blue-50"
          icon={<Users size={18} className="text-blue-600" />}
        />
        <StatCard
          label="Most Popular Fish"
          value={topFish}
          iconBg="bg-mechho-blue/10"
          icon={<Fish size={18} className="text-mechho-blue" />}
        />
        <StatCard
          label="Top Preparation"
          value={topPrep}
          iconBg="bg-orange-50"
          icon={<ChefHat size={18} className="text-orange-500" />}
        />
        <StatCard
          label="Common Price Band"
          value={topPrice}
          iconBg="bg-green-50"
          icon={<BarChart2 size={18} className="text-green-600" />}
        />
        <StatCard
          label="Top Pincode"
          value={topPincode}
          iconBg="bg-violet-50"
          icon={<MapPin size={18} className="text-violet-600" />}
        />
      </div>

      {/* Charts grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Fish types */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Fish size={16} className="text-mechho-blue" />
            Fish Type Preferences
          </h2>
          {fishRanking.length > 0 ? (
            <BarChart data={fishRanking} color="bg-mechho-blue" />
          ) : (
            <p className="text-gray-400 text-sm">No data yet</p>
          )}
        </div>

        {/* Preparations */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ChefHat size={16} className="text-orange-500" />
            Preparation Methods
          </h2>
          {prepRanking.length > 0 ? (
            <BarChart data={prepRanking} color="bg-mechho-coral" />
          ) : (
            <p className="text-gray-400 text-sm">No data yet</p>
          )}
        </div>

        {/* Frequency */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-green-600" />
            Order Frequency
          </h2>
          {freqRanking.length > 0 ? (
            <BarChart data={freqRanking} color="bg-mechho-green" />
          ) : (
            <p className="text-gray-400 text-sm">No data yet</p>
          )}
        </div>

        {/* Price band */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-mechho-mustard" />
            Price Band Distribution
          </h2>
          {priceRanking.length > 0 ? (
            <BarChart data={priceRanking} color="bg-mechho-mustard" />
          ) : (
            <p className="text-gray-400 text-sm">No data yet</p>
          )}
        </div>
      </div>

      {/* Pincodes */}
      {pincodeRanking.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-violet-600" />
            Responses by Pincode
          </h2>
          <BarChart data={pincodeRanking} color="bg-violet-400" />
        </div>
      )}

      {/* Full responses table */}
      {responses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">All Responses</h2>
            <span className="text-xs text-gray-400">{responses.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    'Date', 'Name', 'Phone', 'Pincode',
                    'Fish Types', 'Preparations', 'Portion', 'Price Band', 'Frequency', 'Comments',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {responses.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap text-xs">
                      {r.created_at
                        ? new Date(r.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-gray-900 whitespace-nowrap">
                      {r.name ?? <span className="text-gray-300 italic">anon</span>}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{r.phone ?? '—'}</td>
                    <td className="px-3 py-2.5 text-gray-600 font-mono">{r.pincode}</td>
                    <td className="px-3 py-2.5 text-gray-600 max-w-[160px]">
                      <div className="flex flex-wrap gap-1">
                        {r.fish_types.map((f) => (
                          <span key={f} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 max-w-[160px]">
                      <div className="flex flex-wrap gap-1">
                        {r.preparations.map((p) => (
                          <span key={p} className="text-xs bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{r.portion_size ?? '—'}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {r.price_band ? (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          {r.price_band}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{r.frequency ?? '—'}</td>
                    <td className="px-3 py-2.5 text-gray-500 max-w-[200px]">
                      <span className="line-clamp-2 text-xs">{r.comments ?? '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {responses.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <BarChart2 size={40} className="mx-auto mb-3 opacity-25" />
          <p className="font-medium text-gray-500">No survey responses yet</p>
          <p className="text-sm mt-1">Responses will appear here once customers submit the survey</p>
        </div>
      )}
    </div>
  )
}
