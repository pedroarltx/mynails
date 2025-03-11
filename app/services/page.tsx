"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/hooks/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus } from "lucide-react";

// Esquema de validação para Serviço
const serviceSchema = z.object({
  title: z.string().min(1, "O título do serviço é obrigatório"),
  description: z.string().optional(), // Descrição é opcional
  duration: z.number().min(1, "A duração é obrigatória"),
  price: z.number().min(0, "O preço é obrigatório"),
  image: z.string().optional(), // Imagem é opcional
});

// Tipo inferido a partir do esquema Zod
type ServiceFormData = z.infer<typeof serviceSchema>;

// Interface para Serviço
interface Service {
  id: string;
  title: string;
  description?: string; // Descrição é opcional
  duration: number;
  price: number;
  image?: string; // Imagem é opcional
  createdAt: string;
}

export default function ConfiguracoesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 0,
      price: 0,
      image: "",
    },
  });

  // Buscar serviços do Firebase
  useEffect(() => {
    const servicesRef = collection(db, "services");
    const unsubscribe = onSnapshot(servicesRef, (querySnapshot) => {
      const services = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];
      setServices(services);
    });

    return () => unsubscribe();
  }, []);

  // Fechar modal e resetar formulário
  const handleCloseModal = () => {
    setIsModalOpen(false);
    reset({
      title: "",
      description: "",
      duration: 0,
      price: 0,
      image: "",
    });
    setEditingService(null);
  };

  // Salvar ou atualizar serviço
  const onSubmit = async (data: ServiceFormData) => {
    try {
      const serviceData = {
        title: data.title,
        description: data.description || "",
        duration: data.duration,
        price: data.price,
        image: data.image || "",
        createdAt: editingService ? editingService.createdAt : new Date().toISOString(),
      };

      if (editingService) {
        const docRef = doc(db, "services", editingService.id);
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists()) {
          await updateDoc(docRef, serviceData);
          toast.success("Serviço atualizado com sucesso!");
        } else {
          toast.error("Documento não encontrado. Criando um novo...");
          await addDoc(collection(db, "services"), serviceData);
        }
      } else {
        await addDoc(collection(db, "services"), serviceData);
        toast.success("Serviço cadastrado com sucesso!");
      }
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      toast.error("Erro ao salvar serviço. Tente novamente.");
    }
  };

  // Editar serviço
  const handleEditService = (service: Service) => {
    setEditingService(service);
    reset(service);
    setIsModalOpen(true);
  };

  // Excluir serviço
  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este serviço?")) {
      try {
        await deleteDoc(doc(db, "services", serviceId));
        toast.success("Serviço excluído com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir serviço. Tente novamente.");
      }
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout title="Configurações">
        <ToastContainer />
        <div className="p-4 space-y-4 flex-1">
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Serviço
          </Button>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Duração (min)</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Imagem</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.title}</TableCell>
                  <TableCell>{service.description || "N/A"}</TableCell>
                  <TableCell>{service.duration}</TableCell>
                  <TableCell>{service.price}</TableCell>
                  <TableCell>
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditService(service)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Modal de Serviço */}
          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={editingService ? "Editar Serviço" : "Novo Serviço"}
            description="Preencha os detalhes do serviço"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title">Título do Serviço</label>
                <Input id="title" {...register("title")} />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="description">Descrição</label>
                <Input id="description" {...register("description")} />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="duration">Duração (minutos)</label>
                <Input
                  id="duration"
                  type="number"
                  {...register("duration", { valueAsNumber: true })}
                />
                {errors.duration && (
                  <p className="text-red-500 text-sm">{errors.duration.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="price">Preço</label>
                <Input
                  id="price"
                  type="number"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="image">URL da Imagem</label>
                <Input id="image" {...register("image")} />
                {errors.image && (
                  <p className="text-red-500 text-sm">{errors.image.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </form>
          </Modal>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}