export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string; // Voltando para dateOfBirth
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
  token?: string; // Adicionado para armazenar o token de autenticação
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
  user_id: string; // Adicionado para corresponder ao banco de dados
  title: string;
  description: string;
  date: string;
  location?: string;
  type: 'date' | 'anniversary' | 'trip' | 'other';
  created_at: string; // Renomeado de createdAt
}

export interface WishItem {
  id: string;
  user_id: string; // Alinhado com a API
  title: string;
  description: string;
  category: 'travel' | 'restaurant' | 'activity' | 'dream' | 'other';
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  created_at: string; // Alinhado com a API
  updated_at: string; // Alinhado com a API
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
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

// ==================== NOVAS INTERFACES PARA VIAGENS ====================

/**
 * Interface principal para representar uma viagem completa
 */
export interface Travel {
  id: string;
  name: string;                    // Nome da viagem (ex: "Lua de mel em Paris")
  destination: string;             // Destino da viagem (ex: "Paris, França")
  startDate: string;              // Data de início (ISO string)
  endDate: string;                // Data de fim (ISO string)
  description: string;            // Descrição detalhada da viagem
  estimatedBudget: number;        // Orçamento estimado em reais
  participants: string[];         // IDs dos participantes (usuário e parceiro)
  checklist: TravelChecklist[];  // Lista de itens para levar/fazer
  expenses: TravelExpense[];      // Controle de gastos da viagem
  photos: Photo[];               // Fotos específicas da viagem
  createdBy: string;             // ID de quem criou a viagem
  createdAt: string;             // Data de criação (ISO string)
  updatedAt: string;             // Data da última atualização (ISO string)
}

/**
 * Interface para itens do checklist de uma viagem
 */
export interface TravelChecklist {
  id: string;
  item: string;                   // Descrição do item (ex: "Passaporte", "Protetor solar")
  category:
  | 'bagagem'                   // Itens de bagagem geral
  | 'documentos'                // Documentos necessários
  | 'medicamentos'              // Remédios e produtos de saúde
  | 'eletronicos'               // Eletrônicos e acessórios
  | 'outros';                   // Outros itens diversos
  completed: boolean;             // Se o item foi providenciado/completado
  createdAt: string;             // Data de criação do item (ISO string)
}

/**
 * Interface para controle de gastos/despesas da viagem
 */
export interface TravelExpense {
  id: string;
  description: string;            // Descrição do gasto (ex: "Passagem aérea", "Hotel")
  amount: number;                 // Valor gasto em reais
  category:
  | 'transporte'                // Passagens, táxi, aluguel de carro, etc.
  | 'hospedagem'                // Hotel, pousada, Airbnb, etc.
  | 'alimentacao'               // Restaurantes, mercado, bebidas
  | 'atividades'                // Tours, ingressos, passeios
  | 'compras'                   // Souvenirs, roupas, presentes
  | 'outros';                   // Outros gastos diversos
  date: string;                   // Data do gasto (YYYY-MM-DD)
  createdAt: string;             // Data de registro do gasto (ISO string)
}

/**
 * Estado global da aplicação incluindo viagens
 */
export interface AppState {
  auth: AuthState;
  events: Event[];
  wishItems: WishItem[];
  notes: Note[];
  photos: Photo[];
  notifications: Notification[];
  inviteCodes: InviteCode[];
  travels: Travel[];              // Nova propriedade para viagens
}

/**
 * Actions do reducer incluindo ações para viagens
 */
export type Action =
  // Actions existentes
  | { type: 'LOGIN'; payload: { user: User; partner?: User; token?: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_PARTNER'; payload: User }
  | { type: 'UPDATE_USER_PROFILE'; payload: User }
  | { type: 'UPDATE_PARTNER_PROFILE'; payload: User }
  | { type: 'SET_RELATIONSHIP_START_DATE'; payload: string }
  | { type: 'GENERATE_INVITE_CODE'; payload: InviteCode }
  | { type: 'USE_INVITE_CODE'; payload: { code: string; user: User } }
  | { type: 'INVALIDATE_INVITE_CODE'; payload: string }
  | { type: 'SET_EVENTS'; payload: Event[] } 
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'SET_WISHES'; payload: WishItem[] } // Nova action para carregar desejos
  | { type: 'ADD_WISH_ITEM'; payload: WishItem }
  | { type: 'UPDATE_WISH_ITEM'; payload: WishItem }
  | { type: 'DELETE_WISH_ITEM'; payload: string }
  | { type: 'SET_NOTES'; payload: Note[] }
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
  // Novas actions para viagens
  | { type: 'ADD_TRAVEL'; payload: Travel }           // Adicionar nova viagem
  | { type: 'UPDATE_TRAVEL'; payload: Travel }        // Atualizar viagem existente
  | { type: 'DELETE_TRAVEL'; payload: string };       // Remover viagem (por ID)