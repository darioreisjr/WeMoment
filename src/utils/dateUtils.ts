export const createLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month é 0-indexed
};

export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  const date = createLocalDate(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatDateLongForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  const date = createLocalDate(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

export const calculateRelationshipDuration = (startDate: string): string | null => {
  if (!startDate) return null;
  
  const start = createLocalDate(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffYears = Math.floor(diffDays / 365);
  const diffMonths = Math.floor((diffDays % 365) / 30);
  const remainingDays = diffDays % 30;
  
  if (diffYears > 0) {
    return `${diffYears} ano${diffYears > 1 ? 's' : ''}, ${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'} e ${remainingDays} ${remainingDays === 1 ? 'dia' : 'dias'}`;
  } else if (diffMonths > 0) {
    return `${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'} e ${remainingDays} ${remainingDays === 1 ? 'dia' : 'dias'}`;
  } else {
    return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
  }
};

