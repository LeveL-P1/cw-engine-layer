import type { Metadata } from "next"
import { AuthProvider } from "@/context/auth-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "Whiteboard App",
  description: "Collaborative Whiteboard for Real-time Co-creation"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
