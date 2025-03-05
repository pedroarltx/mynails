import type React from "react"
import { FirebaseProvider } from "@/components/firebase-provider"
import { SiteLayout } from "@/components/layout/site-layout"
import { ToastContainer } from "react-toastify";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning lang="pt-BR">
      <body>
        <FirebaseProvider>
          <SiteLayout>{children}</SiteLayout>
          <ToastContainer />
        </FirebaseProvider>
      </body>
    </html>
  )
}



import './globals.css'
