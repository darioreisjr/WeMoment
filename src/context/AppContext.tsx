import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User, Event, WishItem, Note, Photo, Notification } from '../types';

interface AppState {
  auth: AuthState;
  events: Event[];
  wishItems: WishItem[];
  notes: Note[];
  photos: Photo[];
  notifications: Notification[];
}

// Expandimos as Actions para incluir as novas funcionalidades
// Cada action representa uma operação específica que pode modificar o estado da aplicação
type Action = 
  | { type: 'LOGIN'; payload: { user: User; partner?: User } }
  | { type: 'LOGOUT' }
  | { type: 'SET_PARTNER'; payload: User }
  | { type: 'UPDATE_USER_PROFILE'; payload: User }
  | { type: 'UPDATE_PARTNER_PROFILE'; payload: User }
  | { type: 'SET_RELATIONSHIP_START_DATE'; payload: string } // Nova action para data de namoro
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
  | { type: 'DELETE_PHOTO'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'LOAD_DATA'; payload: AppState };

const initialState: AppState = {
  auth: {
    isAuthenticated: false,
    user: null,
    partner: null,
    relationshipStartDate: undefined, // Inicializamos explicitamente como undefined
  },
  events: [],
  wishItems: [],
  notes: [],
  photos: [],
  notifications: [],
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

// O reducer é uma função pura que recebe o estado atual e uma action,
// e retorna um novo estado baseado na action recebida
function appReducer(state: AppState, action: Action): AppState {
  // ADICIONANDO LOG PARA DEBUG - isso nos ajuda a ver o que está acontecendo
  console.log('🔄 Reducer executando:', action.type, action.payload);
  
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        auth: {
          isAuthenticated: true,
          user: action.payload.user,
          partner: action.payload.partner || null,
          relationshipStartDate: state.auth.relationshipStartDate, // Preservamos a data existente
        },
      };
    case 'LOGOUT':
      return {
        ...initialState,
      };
    case 'SET_PARTNER':
      return {
        ...state,
        auth: {
          ...state.auth,
          partner: action.payload,
        },
      };
    
    // Novos cases para atualização de perfis
    // Quando atualizamos um perfil, mantemos todos os outros dados do auth intactos
    case 'UPDATE_USER_PROFILE':
      console.log('👤 Atualizando perfil do usuário:', action.payload);
      return {
        ...state,
        auth: {
          ...state.auth,
          user: action.payload,
        },
      };
    case 'UPDATE_PARTNER_PROFILE':
      console.log('💕 Atualizando perfil do parceiro:', action.payload);
      return {
        ...state,
        auth: {
          ...state.auth,
          partner: action.payload,
        },
      };
    
    // CORREÇÃO CRÍTICA: Nova funcionalidade para definir data de início do namoro
    // Esta é a parte que provavelmente estava causando o problema
    case 'SET_RELATIONSHIP_START_DATE':
      console.log('❤️ Definindo data de início do namoro:', action.payload);
      const newState = {
        ...state,
        auth: {
          ...state.auth,
          relationshipStartDate: action.payload, // Definimos diretamente o valor
        },
      };
      console.log('✅ Novo estado após definir data:', newState.auth.relationshipStartDate);
      return newState;
    
    // Os demais cases permanecem inalterados
    // Eles gerenciam eventos, desejos, notas, fotos e notificações
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
          notification.id === action.payload ? { ...notification, read: true } : notification
        ),
      };
    case 'LOAD_DATA':
      console.log('📥 Carregando dados do localStorage:', action.payload);
      // CORREÇÃO IMPORTANTE: Garantimos que a relationshipStartDate seja preservada
      return {
        ...action.payload,
        auth: {
          ...action.payload.auth,
          relationshipStartDate: action.payload.auth.relationshipStartDate || undefined,
        },
      };
    default:
      console.log('⚠️ Action não reconhecida:', action.type);
      return state;
  }
}

// O Provider é um componente que disponibiliza o estado e dispatch para toda a aplicação
// É uma implementação do padrão Context API do React para gerenciamento de estado global
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Effect para carregar dados do localStorage na inicialização
  // Isso permite que os dados persistam entre sessões do usuário
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
        // Se houver erro ao carregar dados, não fazemos nada - o app inicia limpo
      }
    } else {
      console.log('📋 Nenhum dado encontrado no localStorage');
    }
  }, []);

  // Effect para salvar dados no localStorage sempre que o estado mudar
  // Isso garante que as alterações sejam persistidas automaticamente
  useEffect(() => {
    console.log('💾 Salvando estado atual no localStorage:', state);
    // CORREÇÃO: Salvamos sempre que há mudanças, não apenas quando autenticado
    // Isso garante que a data de relacionamento seja sempre persistida
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

// Hook customizado para usar o contexto da aplicação
// Fornece type safety e um erro claro se usado fora do Provider
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}