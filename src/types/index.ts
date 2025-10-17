export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  gender: 'male' | 'female';
  avatar?: string;
  createdAt: string;
  name?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  partner: User | null;
  relationshipStartDate?: string;
  inviteCode?: string;
  isCoupleFull: boolean;
  token?: string;
}

export interface InviteCode {
  id: string;
  code: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  usedBy?: string;
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
  couple_id?: string; // Adicionado para referência do backend
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
  couple_id?: string; // Adicionado para referência do backend
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  couple_id?: string; // Adicionado para referência do backend
}

export interface Photo {
  id: string;
  url: string;
  title: string;
  description: string;
  date: string;
  uploadedBy: string;
  createdAt: string;
  couple_id?: string; // Adicionado para referência do backend
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

export interface Travel {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  estimatedBudget: number;
  participants: string[];
  checklist: TravelChecklist[];
  expenses: TravelExpense[];
  photos: Photo[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  couple_id?: string; // Adicionado para referência do backend
}

export interface TravelChecklist {
  id: string;
  item: string;
  category: | 'bagagem' | 'documentos' | 'medicamentos' | 'eletronicos' | 'outros';
  completed: boolean;
  createdAt: string;
}

export interface TravelExpense {
  id: string;
  description: string;
  amount: number;
  category: | 'transporte' | 'hospedagem' | 'alimentacao' | 'atividades' | 'compras' | 'outros';
  date: string;
  createdAt: string;
}

export interface AppState {
  auth: AuthState;
  events: Event[];
  wishItems: WishItem[];
  notes: Note[];
  photos: Photo[];
  notifications: Notification[];
  inviteCodes: InviteCode[];
  travels: Travel[];
}

// Objeto com todos os dados compartilhados que virão da API
interface SharedData {
  events: Event[];
  travels: Travel[];
  wishItems: WishItem[];
  notes: Note[];
  photos: Photo[];
}

export type Action =
  // ATUALIZADO: A action de LOGIN agora espera a estrutura completa da API
  | { type: 'LOGIN'; payload: { user: User; partner?: User | null; token: string; sharedData?: SharedData } }
  | { type: 'LOGOUT' }
  | { type: 'SET_PARTNER'; payload: User }
  | { type: 'UPDATE_USER_PROFILE'; payload: User }
  | { type: 'UPDATE_PARTNER_PROFILE'; payload: User }
  | { type: 'SET_RELATIONSHIP_START_DATE'; payload: string }
  | { type: 'GENERATE_INVITE_CODE'; payload: InviteCode } // Será ajustado para apenas receber o código
  | { type: 'USE_INVITE_CODE'; payload: { code: string; user: User } }
  | { type: 'INVALIDATE_INVITE_CODE'; payload: string }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'ADD_WISH_ITEM'; payload: WishItem }
  | { type: 'UPDATE_WISH_ITEM'; payload: WishItem }
  | { type: 'DELETE_WISH_ITEM'; payload: string }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'ADD_PHOTO'; payload: Photo }
  | { type: 'UPDATE_PHOTO'; payload: Photo }
  | { type: 'DELETE_PHOTO'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'LOAD_DATA'; payload: AppState }
  | { type: 'LOAD_MOCK_DATA' }
  | { type: 'ADD_TRAVEL'; payload: Travel }
  | { type: 'UPDATE_TRAVEL'; payload: Travel }
  | { type: 'DELETE_TRAVEL'; payload: string };