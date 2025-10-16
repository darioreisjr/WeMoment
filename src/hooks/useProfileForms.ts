import { useState, useEffect } from 'react';
import { User } from '../types';

interface UseProfileFormsProps {
  user: User | null;
  partner: User | null;
  relationshipStartDate: string;
}

export const useProfileForms = ({ user, partner, relationshipStartDate }: UseProfileFormsProps) => {
  const [userForm, setUserForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || 'male',
    avatar: user?.avatar || '',
  });
  
  const [partnerForm, setPartnerForm] = useState({
    firstName: partner?.firstName || '',
    lastName: partner?.lastName || '',
    email: partner?.email || '',
    dateOfBirth: partner?.dateOfBirth || '',
    gender: partner?.gender || 'female',
    avatar: partner?.avatar || '',
  });
  
  const [relationshipDate, setRelationshipDate] = useState(relationshipStartDate || '');

  // ADICIONADO: Sincroniza o estado do formulário quando os dados do usuário/parceiro mudam.
  // Isso garante que o avatar (e outros dados) seja atualizado na tela após o upload.
  useEffect(() => {
    if (user) {
      setUserForm(prevForm => ({
        ...prevForm, // Mantém os dados que o usuário pode estar editando
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || 'male',
        avatar: user.avatar || '', // Atualiza o avatar com a nova URL
      }));
    }
    if (partner) {
      setPartnerForm(prevForm => ({
        ...prevForm,
        firstName: partner.firstName || '',
        lastName: partner.lastName || '',
        email: partner.email || '',
        dateOfBirth: partner.dateOfBirth || '',
        gender: partner.gender || 'female',
        avatar: partner.avatar || '',
      }));
    }
    setRelationshipDate(relationshipStartDate || '');
  }, [user, partner, relationshipStartDate]);


  const resetForms = () => {
    setUserForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || 'male',
      avatar: user?.avatar || '',
    });
    setPartnerForm({
      firstName: partner?.firstName || '',
      lastName: partner?.lastName || '',
      email: partner?.email || '',
      dateOfBirth: partner?.dateOfBirth || '',
      gender: partner?.gender || 'female',
      avatar: partner?.avatar || '',
    });
    setRelationshipDate(relationshipStartDate || '');
  };

  return {
    userForm,
    setUserForm,
    partnerForm,
    setPartnerForm,
    relationshipDate,
    setRelationshipDate,
    resetForms
  };
};