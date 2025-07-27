export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string; // Nova propriedade: data de nascimento
  gender: 'male' | 'female';
  avatar?: string;
  createdAt: string;
  name?: string; // Mantido para compatibilidade
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  partner: User | null;
  relationshipStartDate?: string;
  inviteCode?: string; // Código de convite gerado
  isCoupleFull: boolean; // Indica se o casal já está completo (2 pessoas)
}

export interface InviteCode {
  id: string;
  code: string;
  createdBy: string; // ID do usuário que criou o convite
  createdAt: string;
  expiresAt: string;
  used: boolean;
  usedBy?: string; // ID do usuário que usou o convite
  usedAt?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  type: 'date' | 'anniversary' | 'trip' | 'other';
  createdBy: string;
  createdAt: string;
}

export interface WishItem {
  id: string;
  title: string;
  description: string;
  category: 'travel' | 'restaurant' | 'activity' | 'dream' | 'other';
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdBy: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  url: string;
  title: string;
  description: string;
  date: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'event' | 'reminder' | 'achievement';
  date: string;
  read: boolean;
  createdAt: string;
}