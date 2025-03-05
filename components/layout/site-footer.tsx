import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="w-full border-t py-6">
      <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © 2024 PH.Tech Todos os direitos reservados.
        </p>
        <div className="flex gap-4">
          <Link href="#" className="text-sm font-medium hover:underline">
            Termos de Serviço
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline">
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  )
}

