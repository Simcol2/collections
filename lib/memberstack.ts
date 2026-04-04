// Memberstack config and helper constants
// The SDK is initialized via <MemberstackProvider> in layout.tsx

export const MEMBERSTACK_APP_ID = process.env.NEXT_PUBLIC_MEMBERSTACK_PUBLIC_KEY ?? 'pk_03d608e60a365322507a'

export const PLANS = {
  QASSANDRA: 'pln_the-qassandra-collection-g02f0a00',
  COMPLIMENTARY: 'pln_complimentary-access-fzsa0exp',
} as const

export const PRICES = {
  QASSANDRA_ONE_TIME: 'prc_one-time-purchase-qassandra-5s400d3p',
} as const
