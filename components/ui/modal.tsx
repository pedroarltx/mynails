import * as Dialog from "@radix-ui/react-dialog";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string; // Add description as an optional prop
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, description}: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose} >
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Conteúdo do Modal */}
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-[90vw] sm:max-w-[95vw] max-h-[70vh] overflow-y-auto">
          {/* Título do Modal */}
          <Dialog.Title className="text-lg font-bold mb-4">{title}</Dialog.Title>

          {/* Conteúdo Filho */}
          {children}

          {/* Botão de Fechar */}
          <Dialog.Close className="absolute top-4 right-4">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              ×
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
