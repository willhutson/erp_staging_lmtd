import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

import { DM_Sans, JetBrains_Mono } from 'next/font/google'

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "LMTD OS - Operating System for Agency Workflows",
  description: "Multi-tenant ERP platform for professional services agencies. Manage briefs, resources, time tracking, and client relationships.",
  generator: "SpokeStack",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "LMTD OS - Operating System for Agency Workflows",
    description: "Multi-tenant ERP platform for professional services agencies. Manage briefs, resources, time tracking, and client relationships.",
    type: "website",
    siteName: "LMTD OS",
  },
  twitter: {
    card: "summary_large_image",
    title: "LMTD OS - Operating System for Agency Workflows",
    description: "Multi-tenant ERP platform for professional services agencies.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-density="standard" data-surface="internal" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Theme initialization
                const storedTheme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
                // Density initialization
                const storedDensity = localStorage.getItem('density');
                if (storedDensity === 'compact' || storedDensity === 'standard' || storedDensity === 'comfortable') {
                  document.documentElement.dataset.density = storedDensity;
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased`} suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
