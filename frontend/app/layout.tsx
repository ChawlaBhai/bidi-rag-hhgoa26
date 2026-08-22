import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Voice RAG — Voice-Enabled Indic RAG over MSMARCO-XI',
  description: 'Sub-200ms Voice-Enabled Retrieval Augmented Generation over ai4bharat/MSMARCO-XI dataset with 5 Chunking Strategies, P50/70/100 Analytics, Model Harness, and 4-Layer Guardrails.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-retro-grid min-h-screen selection:bg-pink-hot selection:text-white">
        {children}
      </body>
    </html>
  )
}
