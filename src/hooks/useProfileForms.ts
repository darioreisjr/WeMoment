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

  useEffect(() => {
    if (user) {
      setUserForm(prevForm => ({
        ...prevForm,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || 'male',
        avatar: user.avatar || '',
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