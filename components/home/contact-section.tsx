import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function ContactSection() {
  return (
    <section id="contato" className="w-full py-12 md:py-14 lg:py-16 bg-gradient-to-r from-pink-50 to-purple-50">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Informações de Contato */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Entre em Contato
              </h2>
              <p className="text-gray-600">Estamos disponíveis para atender você e responder suas dúvidas.</p>
            </div>
            <div className="space-y-4">
              {/* Endereço com link para o Google Maps */}
              <a
                href="https://www.google.com/maps/place/Rua+Julio+Guidolin,+44,+Jardim+Santa+Rosa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-pink-600 transition-colors"
              >
                <MapPin className="h-5 w-5 text-pink-600" />
                <span>Rua Julio Guidolin, 44, Jardim Santa Rosa</span>
              </a>
              {/* Telefone com link para o WhatsApp */}
              <a
                href="https://wa.me/5541992496391"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-pink-600 transition-colors"
              >
                <Phone className="h-5 w-5 text-pink-600" />
                <span>(41) 9-9249-6391</span>
              </a>
              {/* Email */}
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-pink-600" />
                <span>rafaduda2004@hotmail.com</span>
              </div>
              {/* Horário de Funcionamento */}
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-pink-600" />
                <span>Segunda a Sábado: 9h às 19h</span>
              </div>
            </div>
          </div>

          {/* Formulário de Contato */}
          <div className="space-y-4">
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Nome
                  </label>
                  <input
                    id="name"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Seu email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className="text-sm font-medium text-gray-700"
                >
                  Mensagem
                </label>
                <textarea
                  id="message"
                  className="flex min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Digite sua mensagem"
                />
              </div>
              <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                Enviar Mensagem
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}