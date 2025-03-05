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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Serviços de manicure e cuidados com as unhas por Rafaela Santos." />
        <meta name="keywords" content="manicure, unhas, cuidados, Rafaela Silva, estética, beleza" />
        <meta name="author" content="Rafaela Santos" />
        <meta property="og:title" content="Manicure Rafaela Santos - Cuidados e Estilo para suas Unhas" />
        <meta property="og:description" content="Agende seu horário para cuidados de unhas com a especialista Rafaela Silva." />
        <meta property="og:image" content="URL da imagem para visualização em redes sociais" />
        <meta property="og:url" content="URL da página" />
        <link rel="icon" href="/caminho/para/favicon.ico" />
        <title>Manicure Rafaela Silva</title>
      </head>
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
