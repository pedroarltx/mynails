import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-16 lg:py-12 bg-gradient-to-r from-pink-50 to-purple-50">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">Beleza nas suas mãos</h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Serviços de manicure e pedicure profissionais para realçar sua beleza natural.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/agendamento">
                <Button size="lg" className="bg-pink-600 hover:bg-pink-700">
                  Agendar Agora
                </Button>
              </Link>
              <Link href="#servicos">
                <Button size="lg" variant="outline">
                  Ver Serviços
                </Button>
              </Link>
            </div>
          </div>
          <img
            src="/logo.jpeg"
            alt="Serviços de manicure"
            className="mx-auto w-1/2 rounded-xl object-cover sm:w-full lg:w-2/3"
          />
        </div>
      </div>
    </section>
  )
}

