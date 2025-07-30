import { useState } from 'react';
import { validateAge, validateRelationshipDate } from '../utils/validationUtils';

export const useFormValidation = () => {
  const [ageErrors, setAgeErrors] = useState({
    user: '',
    partner: ''
  });
  
  const [relationshipDateError, setRelationshipDateError] = useState('');

  const validateUserAge = (date: string) => {
    if (date && !validateAge(date)) {
      setAgeErrors(prev => ({ 
        ...prev, 
        user: 'Você deve ter pelo menos 18 anos para usar este aplicativo.' 
      }));
    } else {
      setAgeErrors(prev => ({ ...prev, user: '' }));
    }
  };

  const validatePartnerAge = (date: string) => {
    if (date && !validateAge(date)) {
      setAgeErrors(prev => ({ 
        ...prev, 
        partner: 'Seu(sua) parceiro(a) deve ter pelo menos 18 anos para usar este aplicativo.' 
      }));
    } else {
      setAgeErrors(prev => ({ ...prev, partner: '' }));
    }
  };

  const validateRelationshipDateFunc = (date: string) => {
    if (date && !validateRelationshipDate(date)) {
      setRelationshipDateError('A data de início do relacionamento não pode ser no futuro.');
    } else {
      setRelationshipDateError('');
    }
  };

  const clearErrors = () => {
    setAgeErrors({ user: '', partner: '' });
    setRelationshipDateError('');
  };

  const hasErrors = () => {
    return ageErrors.user || ageErrors.partner || relationshipDateError;
  };

  return {
    ageErrors,
    relationshipDateError,
    validateUserAge,
    validatePartnerAge,
    validateRelationshipDateFunc,
    clearErrors,
    hasErrors
  };
};

