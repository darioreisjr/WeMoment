import { createLocalDate } from './dateUtils';

export const validateAge = (dateOfBirth: string): boolean => {
  if (!dateOfBirth) return true; // Permite vazio
  
  const today = new Date();
  const birthDate = createLocalDate(dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Verifica se ainda não fez aniversário este ano
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return (age - 1) >= 18;
  }
  
  return age >= 18;
};

export const validateRelationshipDate = (date: string): boolean => {
  if (!date) return true; // Permite vazio
  
  const selectedDate = createLocalDate(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Final do dia atual
  
  return selectedDate <= today;
};