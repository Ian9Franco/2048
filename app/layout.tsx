import type { Metadata } from "next"
import { Bangers, Comic_Neue } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const bangers = Bangers({ subsets: ["latin"], weight: "400" })
const comicNeue = Comic_Neue({ subsets: ["latin"], weight: ["400", "700"] })

export const metadata: Metadata = {
  title: "Comic 2048 — The Ultimate Hero Puzzle 💥",
  description:
    "Play 2048 like never before — comic-style action, animated tiles, and heroic sound effects! Created by Ian.",
  authors: [{ name: "Ian" }],
  keywords: [
    "2048",
    "comic game",
    "superhero puzzle",
    "animated 2048",
    "framer motion 2048",
  ],
  themeColor: "#ffcc00",
  openGraph: {
    title: "Comic 2048 — The Ultimate Hero Puzzle 💥",
    description:
      "A dynamic 2048 game with comic-style animations and explosive energy.",
    url: "https://comic2048.vercel.app",
    siteName: "Comic 2048",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Comic 2048 gameplay screenshot",
      },
    ],
    locale: "en_US",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
