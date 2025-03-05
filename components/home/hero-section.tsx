import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-12 bg-gradient-to-r from-pink-50 to-purple-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Beleza nas suas mãos
              </h1>
              <p className="max-w-[600px] text-gray-600 md:text-xl mx-auto lg:mx-0">
                Serviços de manicure e pedicure profissionais para realçar sua beleza natural.
              </p>
            </div>
            <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center lg:justify-start">
              <Link href="/agendamento">
                <Button size="lg" className="bg-pink-600 hover:bg-pink-700 text-white">
                  Agendar Agora
                </Button>
              </Link>
              <Link href="#servicos">
                <Button size="lg" variant="outline" className="border-pink-600 text-pink-600 hover:bg-pink-50">
                  Ver Serviços
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="relative group">
              {/* Efeito de luz */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-pink-400/30 to-purple-400/30 blur-2xl rounded-full w-full h-full group-hover:opacity-100 opacity-0 transition-opacity duration-500"></div>
              {/* Imagem */}
              <img
                src="/logo.jpg"
                alt="Serviços de manicure"
                className="relative object-cover rounded-full shadow-lg w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}