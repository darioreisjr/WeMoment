export interface User {
  id: string;
  firstName: string; // Mudança: nome separado em firstName e lastName
  lastName: string;
  email: string;
  gender: 'male' | 'female';
  avatar?: string; // Nova propriedade: foto em base64
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  partner: User | null;
  relationshipStartDate?: string; // Nova propriedade: data de início do namoro
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