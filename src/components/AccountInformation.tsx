import React from 'react';
import { Calendar } from 'lucide-react';

interface AccountInformationProps {
  user: any;
  eventsCount: number;
  wishItemsCount: number;
  notesCount: number;
  photosCount: number;
}

export const AccountInformation: React.FC<AccountInformationProps> = ({
  user,
  eventsCount,
  wishItemsCount,
  notesCount,
  photosCount
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Informações da Conta</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Criação
            </label>
            <div className="flex items-center space-x-2">
              <Calendar className="text-gray-400" size={16} />
              <p className="text-gray-900">
                {user?.createdAt && new Date(user.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dados Armazenados
          </label>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• {eventsCount} eventos salvos</p>
            <p>• {wishItemsCount} desejos na lista</p>
            <p>• {notesCount} anotações criadas</p>
            <p>• {photosCount} fotos na galeria</p>
          </div>
        </div>
      </div>
    </div>
  );
};



