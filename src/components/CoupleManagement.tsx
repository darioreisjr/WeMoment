import React from 'react';
import { Shield, UserPlus } from 'lucide-react';
import { CoupleStatusIndicator } from './CoupleStatusIndicator';

interface CoupleStatus {
  isComplete: boolean;
  status: string;
  issues: string[];
}

interface CoupleManagementProps {
  coupleStatus: CoupleStatus;
  hasPartner: boolean;
  isCoupleFull: boolean;
  inviteCode: string | null;
  inviteCodeInput: string;
  setInviteCodeInput: (value: string) => void;
  copiedCode: boolean;
  onGenerateInviteCode: () => void;
  onUseInviteCode: () => void;
  onCopyInviteCode: () => void;
}

export const CoupleManagement: React.FC<CoupleManagementProps> = ({
  coupleStatus,
  hasPartner,
  isCoupleFull,
  inviteCode,
  inviteCodeInput,
  setInviteCodeInput,
  copiedCode,
  onGenerateInviteCode,
  onUseInviteCode,
  onCopyInviteCode
}) => {
  // Só renderiza se tiver parceiro E informações incompletas
  if (!hasPartner || coupleStatus.isComplete) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Gestão do Casal</h2>
        <Shield className="text-gray-500" size={20} />
      </div>

      <div className="space-y-4">
        <CoupleStatusIndicator coupleStatus={coupleStatus} />

        {!isCoupleFull && (
          <div className="space-y-3">
            <div className="flex space-x-2">
              <button
                onClick={onGenerateInviteCode}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <UserPlus size={16} className="mr-2" />
                Gerar Código de Convite
              </button>
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value)}
                placeholder="Digite um código de convite"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={6}
              />
              <button
                onClick={onUseInviteCode}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Usar
              </button>
            </div>
          </div>
        )}

        {inviteCode && !isCoupleFull && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Seu Código de Convite:</p>
            <div className="flex items-center justify-between">
              <code className="text-lg font-bold text-blue-700">{inviteCode}</code>
              <button
                onClick={onCopyInviteCode}
                className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                <span className="ml-1 text-sm">{copiedCode ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Compartilhe este código com seu(sua) parceiro(a) para que possam se juntar ao perfil.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
