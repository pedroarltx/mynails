"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirestore } from "@/lib/useFirestore";

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
}

export function ServicesSection() {
  const { documents: services, loading, error } = useFirestore<Service>("services");

  if (loading) {
    return <div>Carregando serviços...</div>;
  }

  if (error) {
    return <div>Erro ao carregar serviços: {error}</div>;
  }

  return (
    <section id="servicos" className="w-full py-12 md:py-14 lg:py-16 bg-gradient-to-r from-pink-50 to-purple-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Nossos Serviços
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Oferecemos uma variedade de serviços para cuidar das suas unhas com qualidade e profissionalismo.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-2">
              <CardHeader>
                <CardTitle className="text-md font-semibold">{service.title}</CardTitle>
                <CardDescription className="text-gray-600">{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="relative group">
                  {/* Efeito de luz */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-pink-400/30 to-purple-400/30 blur-2xl rounded-md w-full h-full group-hover:opacity-100 opacity-0 transition-opacity duration-500"></div>
                  {/* Imagem */}
                  <img
                    src={service.image || "/placeholder.svg"}
                    alt={service.title}
                    className="w-full h-40 sm:h-48 md:h-56 object-cover rounded-md mb-4 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <p className="font-medium text-pink-600">R$ {service.price.toFixed(2)}</p>
                <Link href="/agendamento">
                  <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white">
                    Agendar
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}