'use client'

import { MemberstackProvider as _MemberstackProvider } from '@memberstack/react'
import { MEMBERSTACK_APP_ID } from '@/lib/memberstack'

export function MemberstackProvider({ children }: { children: React.ReactNode }) {
  return (
    <_MemberstackProvider config={{ publicKey: MEMBERSTACK_APP_ID }}>
      {children}
    </_MemberstackProvider>
  )
}
