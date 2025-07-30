import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InviteCode, User } from '../types';

export const useInviteCode = () => {
  const { state, dispatch } = useApp();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const generateInviteCode = () => {
    if (state.auth.partner) {
      alert('O casal já está completo! Apenas duas pessoas podem fazer parte do perfil.');
      return;
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const inviteCode: InviteCode = {
      id: Date.now().toString(),
      code,
      createdBy: state.auth.user?.id || '',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      used: false,
    };

    dispatch({ type: 'GENERATE_INVITE_CODE', payload: inviteCode });
    setShowInviteModal(true);
  };

  const useInviteCodeFunc = () => {
    if (!inviteCodeInput.trim()) {
      alert('Por favor, digite um código de convite.');
      return;
    }

    const validCode = state.inviteCodes.find(
      code => code.code === inviteCodeInput.toUpperCase() && 
              !code.used && 
              new Date(code.expiresAt) > new Date()
    );

    if (!validCode) {
      alert('Código de convite inválido ou expirado.');
      return;
    }

    const newPartner: User = {
      id: Date.now().toString(),
      firstName: 'Novo',
      lastName: 'Parceiro',
      email: '',
      dateOfBirth: '',
      gender: state.auth.user?.gender === 'male' ? 'female' : 'male',
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'USE_INVITE_CODE', payload: { code: validCode.code, user: newPartner } });
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        title: 'Parceiro(a) Adicionado!',
        message: `${newPartner.firstName} ${newPartner.lastName} se juntou ao seu perfil de casal! 💕`,
        type: 'achievement',
        date: new Date().toISOString(),
        read: false,
        createdAt: new Date().toISOString(),
      },
    });

    setInviteCodeInput('');
    alert('Parceiro(a) adicionado com sucesso!');
  };

  const copyInviteCode = () => {
    if (state.auth.inviteCode) {
      navigator.clipboard.writeText(state.auth.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return {
    showInviteModal,
    setShowInviteModal,
    inviteCodeInput,
    setInviteCodeInput,
    copiedCode,
    generateInviteCode,
    useInviteCodeFunc,
    copyInviteCode
  };
};
