import React from 'react';
import { Shield, UserPlus, Send } from 'lucide-react';
import { CoupleStatusIndicator } from './CoupleStatusIndicator';

interface CoupleStatus {
  isComplete: boolean;
  status: string;
  issues: string[];
}

interface CoupleManagementProps {
  coupleStatus: CoupleStatus;
  hasPartner: boolean;
  inviteCodeInput: string;
  setInviteCodeInput: (value: string) => void;
  onGenerateInviteCode: () => void;
  onUseInviteCode: () => void;
}

export const CoupleManagement: React.FC<CoupleManagementProps> = ({
  coupleStatus,
  hasPartner,
  inviteCodeInput,
  setInviteCodeInput,
  onGenerateInviteCode,
  onUseInviteCode
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Gestão do Casal</h2>
        <Shield className="text-gray-500" size={20} />
      </div>

      <div className="space-y-4">
        <CoupleStatusIndicator coupleStatus={coupleStatus} />

        {/* CORREÇÃO: Mostra a seção de convites SE o usuário NÃO tiver um parceiro. */}
        {!hasPartner && (
          <div className="space-y-3 pt-4 border-t border-gray-200">
             <p className="text-sm text-center text-gray-600">
                Você ainda não está conectado(a) a um parceiro. <br/>
                Gere um código para convidá-lo(a) ou insira um código que você recebeu.
             </p>
            
            {/* Botão para gerar código */}
            <button
              onClick={onGenerateInviteCode}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <UserPlus size={16} className="mr-2" />
              Gerar Código de Convite
            </button>
            
            {/* Campo para usar código */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                placeholder="Inserir código recebido"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center font-mono"
                maxLength={8}
              />
              <button
                onClick={onUseInviteCode}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                aria-label="Usar código"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};