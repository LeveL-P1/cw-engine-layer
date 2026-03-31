import type { Metadata } from "next"
import { AuthProvider } from "@/context/auth-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "CW-Engine Governed Whiteboard",
  description:
    "Governed collaborative whiteboard with realtime facilitation controls and analytics.",
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground transition-colors">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
