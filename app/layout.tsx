import type { Metadata } from 'next'
import {
  Cormorant_Garamond,
  Great_Vibes,
  Playfair_Display,
  Montserrat,
  Lora,
} from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { MemberstackProvider } from '@/components/providers/MemberstackProvider'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-serif',
  display: 'swap',
})

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

// Geometric sans — MCM architecture feel
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

// Serif for long-form reading
const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-reading',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'The Collections',
  description: 'A curated digital reading experience. The Qassandra Collection and beyond.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'The Collections',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={[
        cormorant.variable,
        greatVibes.variable,
        playfair.variable,
        montserrat.variable,
        lora.variable,
      ].join(' ')}
    >
      <body>
        <MemberstackProvider>
          <ThemeProvider>
            <div className="grain-overlay" aria-hidden="true" />
            {children}
          </ThemeProvider>
        </MemberstackProvider>
      </body>
    </html>
  )
}
