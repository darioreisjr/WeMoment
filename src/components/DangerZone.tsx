import React from 'react';
import { Trash2 } from 'lucide-react';

interface DangerZoneProps {
  onClearAllData: () => void;
}

export const DangerZone: React.FC<DangerZoneProps> = ({ onClearAllData }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-red-200">
      <h2 className="text-xl font-bold text-red-900 mb-4">Zona de Perigo</h2>
      <p className="text-gray-600 mb-4">
        Ações irreversíveis que afetam permanentemente seus dados.
      </p>
      <button
        onClick={onClearAllData}
        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <Trash2 size={16} className="mr-2" />
        Limpar Todos os Dados
      </button>
    </div>
  );
};