import { useState } from 'react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

export const useInviteCode = () => {
  const { state, dispatch } = useApp();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  /**
   * Função para gerar um código de convite chamando a API.
   * Isso cria a entidade 'couples' no backend.
   */
  const generateInviteCode = async () => {
    const token = state.auth.token;
    if (!token) {
      toast.error("Sessão inválida. Por favor, faça login novamente.");
      return;
    }
    
    if (state.auth.partner) {
      toast.error('O casal já está completo!');
      return;
    }

    const toastId = toast.loading("Gerando código de convite...");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invite/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Convite gerado com sucesso!", { id: toastId });
        setGeneratedCode(data.inviteCode);
        setShowInviteModal(true);
      } else {
        throw new Error(data.error || "Não foi possível gerar o convite.");
      }
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  /**
   * Função para usar um código de convite e vincular a conta, chamando a API.
   */
  const useInviteCodeFunc = async () => {
    const token = state.auth.token;
    if (!token) {
      toast.error("Sessão inválida. Por favor, faça login novamente.");
      return;
    }
    if (!inviteCodeInput.trim()) {
      toast.error("Por favor, digite um código de convite.");
      return;
    }

    const toastId = toast.loading("Vinculando contas...");
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invite/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ code: inviteCodeInput })
        });

        const data = await response.json();

        if (response.ok) {
            toast.success("Contas vinculadas com sucesso! Faça login novamente para sincronizar.", { id: toastId, duration: 4000 });
            // Força o logout para que o usuário faça login novamente e carregue os novos dados do casal
            setTimeout(() => {
                dispatch({ type: 'LOGOUT' });
            }, 2000);
        } else {
            throw new Error(data.error || "Código inválido, expirado ou já utilizado.");
        }
    } catch (error: any) {
        toast.error(error.message, { id: toastId });
    }
  };

  const copyInviteCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopiedCode(true);
      toast.success("Código copiado!");
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return {
    showInviteModal,
    setShowInviteModal,
    inviteCodeInput,
    setInviteCodeInput,
    generatedCode,
    copiedCode,
    generateInviteCode,
    useInviteCodeFunc,
    copyInviteCode
  };
};