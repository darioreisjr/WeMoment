import React from 'react';
import { UserPlus, Copy, Check } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-blue-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Código de Convite Gerado!</h3>
          <p className="text-gray-600 mb-4">
            Compartilhe este código com seu(sua) parceiro(a):
          </p>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <code className="text-2xl font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg">
              {inviteCode}
            </code>
            <button
              onClick={onCopyCode}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {copiedCode ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Este código expira em 7 dias e só pode ser usado uma vez.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};