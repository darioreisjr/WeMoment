import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User, Event, WishItem, Note, Photo, Notification, InviteCode } from '../types';

interface AppState {
  auth: AuthState;
  events: Event[];
  wishItems: WishItem[];
  notes: Note[];
  photos: Photo[];
  notifications: Notification[];
  inviteCodes: InviteCode[];
}

type Action = 
  | { type: 'LOGIN'; payload: { user: User; partner?: User } }
  | { type: 'LOGOUT' }
  | { type: 'SET_PARTNER'; payload: User }
  | { type: 'UPDATE_USER_PROFILE'; payload: User }
  | { type: 'UPDATE_PARTNER_PROFILE'; payload: User }
  | { type: 'SET_RELATIONSHIP_START_DATE'; payload: string }
  | { type: 'GENERATE_INVITE_CODE'; payload: InviteCode }
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
  | { type: 'LOAD_MOCK_DATA' };

// Função para gerar código de convite único
const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const generateMockPhotos = (): Photo[] => {
  const mockPhotos = [
    {
      id: 'mock1',
      url: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Nossa Primeira Viagem',
      description: 'Que momento incrível que vivemos juntos na praia! O pôr do sol estava perfeito.',
      date: '2025-07-15',
      uploadedBy: 'user1',
      createdAt: '2025-07-15T18:30:00Z',
    },
    {
      id: 'mock2',
      url: 'https://images.pexels.com/photos/1024994/pexels-photo-1024994.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Jantar Romântico',
      description: 'Nosso primeiro encontro em um restaurante especial. A comida estava deliciosa!',
      date: '2025-07-08',
      uploadedBy: 'partner1',
      createdAt: '2025-07-08T20:15:00Z',
    },
    {
      id: 'mock3',
      url: 'https://images.pexels.com/photos/1024995/pexels-photo-1024995.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Caminhada no Parque',
      description: 'Que manhã linda explorando a natureza juntos. Os pássaros cantavam!',
      date: '2025-06-20',
      uploadedBy: 'user1',
      createdAt: '2025-06-20T08:45:00Z',
    }
  ];
  return mockPhotos;
};

const initialState: AppState = {
  auth: {
    isAuthenticated: false,
    user: null,
    partner: null,
    relationshipStartDate: undefined,
    inviteCode: undefined,
    isCoupleFull: false,
  },
  events: [],
  wishItems: [],
  notes: [],
  photos: [],
  notifications: [],
  inviteCodes: [],
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

function appReducer(state: AppState, action: Action): AppState {
  console.log('🔄 Action dispatched:', action.type, action.payload);
  
  switch (action.type) {
    case 'LOGIN':
      console.log('✅ Login realizado:', action.payload);
      const isCoupleFull = !!(action.payload.user && action.payload.partner);
      return {
        ...state,
        auth: {
          isAuthenticated: true,
          user: action.payload.user,
          partner: action.payload.partner || null,
          relationshipStartDate: state.auth.relationshipStartDate,
          inviteCode: state.auth.inviteCode,
          isCoupleFull,
        },
      };
    case 'LOGOUT':
      console.log('👋 Logout realizado');
      return {
        ...initialState,
      };
    case 'SET_PARTNER':
      console.log('💕 Partner definido:', action.payload);
      return {
        ...state,
        auth: {
          ...state.auth,
          partner: action.payload,
          isCoupleFull: true, // Quando adiciona parceiro, marca como completo
        },
      };
    case 'UPDATE_USER_PROFILE':
      console.log('👤 Perfil do usuário atualizado:', action.payload);
      return {
        ...state,
        auth: {
          ...state.auth,
          user: action.payload,
        },
      };
    case 'UPDATE_PARTNER_PROFILE':
      console.log('👥 Perfil do parceiro atualizado:', action.payload);
      return {
        ...state,
        auth: {
          ...state.auth,
          partner: action.payload,
        },
      };
    case 'SET_RELATIONSHIP_START_DATE':
      console.log('💝 Data de início do relacionamento definida:', action.payload);
      return {
        ...state,
        auth: {
          ...state.auth,
          relationshipStartDate: action.payload,
        },
      };
    case 'GENERATE_INVITE_CODE':
      console.log('🔗 Código de convite gerado:', action.payload);
      return {
        ...state,
        auth: {
          ...state.auth,
          inviteCode: action.payload.code,
        },
        inviteCodes: [...state.inviteCodes, action.payload],
      };
    case 'USE_INVITE_CODE':
      console.log('✅ Código de convite usado:', action.payload);
      const updatedCodes = state.inviteCodes.map(code =>
        code.code === action.payload.code
          ? { ...code, used: true, usedBy: action.payload.user.id, usedAt: new Date().toISOString() }
          : code
      );
      return {
        ...state,
        auth: {
          ...state.auth,
          partner: action.payload.user,
          isCoupleFull: true,
        },
        inviteCodes: updatedCodes,
      };
    case 'INVALIDATE_INVITE_CODE':
      console.log('❌ Código de convite invalidado:', action.payload);
      return {
        ...state,
        auth: {
          ...state.auth,
          inviteCode: undefined,
        },
        inviteCodes: state.inviteCodes.filter(code => code.code !== action.payload),
      };
    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload],
      };
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(event =>
          event.id === action.payload.id ? action.payload : event
        ),
      };
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload),
      };
    case 'ADD_WISH_ITEM':
      return {
        ...state,
        wishItems: [...state.wishItems, action.payload],
      };
    case 'UPDATE_WISH_ITEM':
      return {
        ...state,
        wishItems: state.wishItems.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'DELETE_WISH_ITEM':
      return {
        ...state,
        wishItems: state.wishItems.filter(item => item.id !== action.payload),
      };
    case 'ADD_NOTE':
      return {
        ...state,
        notes: [...state.notes, action.payload],
      };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(note =>
          note.id === action.payload.id ? action.payload : note
        ),
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload),
      };
    case 'ADD_PHOTO':
      return {
        ...state,
        photos: [...state.photos, action.payload],
      };
    case 'UPDATE_PHOTO':
      return {
        ...state,
        photos: state.photos.map(photo =>
          photo.id === action.payload.id ? action.payload : photo
        ),
      };
    case 'DELETE_PHOTO':
      return {
        ...state,
        photos: state.photos.filter(photo => photo.id !== action.payload),
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
      };
    case 'LOAD_DATA':
      console.log('📥 Carregando dados do localStorage:', action.payload);
      return {
        ...action.payload,
        auth: {
          ...action.payload.auth,
          relationshipStartDate: action.payload.auth.relationshipStartDate || undefined,
          isCoupleFull: !!(action.payload.auth.user && action.payload.auth.partner),
        },
      };
    case 'LOAD_MOCK_DATA':
      return {
        ...state,
        photos: generateMockPhotos(),
      };
    default:
      console.log('⚠️ Action não reconhecida:', action.type);
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    console.log('🔄 Tentando carregar dados do localStorage...');
    const savedData = localStorage.getItem('couples-app-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('📖 Dados carregados do localStorage:', parsedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      } catch (error) {
        console.error('❌ Erro ao carregar dados do localStorage:', error);
      }
    } else {
      console.log('📋 Nenhum dado encontrado no localStorage');
    }
    
    const existingData = savedData ? JSON.parse(savedData) : null;
    if (!existingData || !existingData.photos || existingData.photos.length === 0) {
      console.log('🎭 Carregando dados mockup para demonstração...');
      dispatch({ type: 'LOAD_MOCK_DATA' });
    }
  }, []);

  useEffect(() => {
    console.log('💾 Salvando estado atual no localStorage:', state);
    try {
      localStorage.setItem('couples-app-data', JSON.stringify(state));
      console.log('✅ Dados salvos com sucesso no localStorage');
    } catch (error) {
      console.error('❌ Erro ao salvar no localStorage:', error);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}