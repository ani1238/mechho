import type { Metadata } from 'next'
import CheckoutSuccessClient from './CheckoutSuccessClient'

export const metadata: Metadata = {
  title: 'Order Placed! 🎉 | Mechho',
  description: 'Your Mechho order has been successfully placed. We will WhatsApp you with updates.',
}

interface Props {
  searchParams: { orderId?: string }
}

export default function CheckoutSuccessPage({ searchParams }: Props) {
  return <CheckoutSuccessClient orderId={searchParams.orderId ?? ''} />
}
