import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

// Local fonts - no network dependency during build
const dmSans = localFont({
  src: [
    { path: "../fonts/DMSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/DMSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/DMSans-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/DMSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
})

const jetbrainsMono = localFont({
  src: [
    { path: "../fonts/JetBrainsMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/JetBrainsMono-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
})

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
