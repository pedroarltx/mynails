import type React from "react";
import { CalendarDays, Clock, CreditCard } from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function FeaturesSection() {
  const features: Feature[] = [
    {
      title: "Produtos de Qualidade",
      description: "Utilizamos apenas produtos de alta qualidade e marcas reconhecidas.",
      icon: <CreditCard className="h-8 w-8" />,
    },
    {
      title: "Higiene Garantida",
      description: "Todos os instrumentos são esterilizados e descartáveis quando necessário.",
      icon: <CalendarDays className="h-8 w-8" />,
    },
    {
      title: "Profissional Experiente",
      description: "Profissionais altamente qualificada e experiente.",
      icon: <Clock className="h-8 w-8" />,
    },
  ];

  return (
    <section className="w-full py-12 md:py-14 lg:py-16 bg-gradient-to-r from-pink-50 to-purple-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Por que nos escolher?
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Compromisso com qualidade, higiene e satisfação do cliente.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 mt-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-2"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}