import React from 'react';
import { UserPlus, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string | null;
  copiedCode: boolean;
  onCopyCode: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  inviteCode,
  copiedCode,
  onCopyCode
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full animate-modal-enter">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-blue-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Código de Convite Gerado!</h3>
          <p className="text-gray-600 mb-4">
            Envie este código para seu/sua parceiro(a). Ele(a) deverá inseri-lo na tela de configurações para conectar os perfis.
          </p>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <code className="text-2xl font-bold tracking-widest text-blue-700 bg-blue-50 px-6 py-3 rounded-lg">
              {inviteCode}
            </code>
            <button
              onClick={() => {
                onCopyCode();
                toast.success("Código copiado!");
              }}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Copiar código"
            >
              {copiedCode ? <Check size={24} /> : <Copy size={24} />}
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Este código expira em 7 dias e só pode ser usado uma vez.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

// Se você não tiver essa animação, pode adicioná-la ao seu `src/index.css`
/*
@keyframes modal-enter {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-modal-enter {
  animation: modal-enter 0.2s ease-out forwards;
}
*/