"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useFirestore } from "@/lib/useFirestore"

interface Service {
  id: string
  title: string
  description: string
  price: number
  image: string
}

export function ServicesSection() {
  const { documents: services, loading, error } = useFirestore<Service>("services")

  if (loading) {
    return <div>Carregando serviços...</div>
  }

  if (error) {
    return <div>Erro ao carregar serviços: {error}</div>
  }

  return (
    <section id="servicos" className="w-full py-12 md:py-18 lg:py-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Nossos Serviços</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Oferecemos uma variedade de serviços para cuidar das suas unhas com qualidade e profissionalismo.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <img
                  src={service.image || "/placeholder.svg"}
                  alt={service.title}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="font-medium">R$ {service.price.toFixed(2)}</p>
                <Link href="/agendamento">
                  <Button size="sm">Agendar</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

