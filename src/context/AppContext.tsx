import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Action, Photo } from '../types';

// Função para gerar fotos mockup para demonstração inicial
const generateMockPhotos = (): Photo[] => {
  // Esta função pode ser mantida se você quiser dados de exemplo para novos usuários
  return []; // Retornando vazio para priorizar os dados do backend
};

// O estado inicial da aplicação
const initialState: AppState = {
  auth: {
    isAuthenticated: false,
    user: null,
    partner: null,
    relationshipStartDate: undefined,
    inviteCode: undefined,
    isCoupleFull: false,
    token: undefined,
  },
  events: [],
  wishItems: [],
  notes: [],
  photos: [],
  notifications: [],
  inviteCodes: [],
  travels: [],
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

/**
 * Reducer principal da aplicação, agora preparado para a nova estrutura da API.
 */
function appReducer(state: AppState, action: Action): AppState {
  console.log('🔄 Ação Disparada:', action.type);

  switch (action.type) {
    case 'LOGIN':
      const { user, partner, token, sharedData } = action.payload;
      return {
        ...state,
        auth: {
          ...state.auth,
          isAuthenticated: true,
          user: user,
          partner: partner || null,
          isCoupleFull: !!(user && partner),
          token: token,
        },
        // Preenche o estado global com os dados compartilhados vindos da API.
        events: sharedData?.events || [],
        travels: sharedData?.travels || [],
        wishItems: sharedData?.wishItems || [],
        notes: sharedData?.notes || [],
        photos: sharedData?.photos || [],
      };

    case 'LOGOUT':
      // Limpa o localStorage e reseta para o estado inicial.
      localStorage.removeItem('couples-app-data');
      return { ...initialState };

    // As ações de CRUD (ADD, UPDATE, DELETE) permanecem as mesmas.
    // A API cuidará de associar os novos itens ao couple_id correto no backend.
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    case 'UPDATE_EVENT':
      return { ...state, events: state.events.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_EVENT':
      return { ...state, events: state.events.filter(e => e.id !== action.payload) };

    case 'ADD_TRAVEL':
        return { ...state, travels: [...state.travels, action.payload] };
    case 'UPDATE_TRAVEL':
        return { ...state, travels: state.travels.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TRAVEL':
        return { ...state, travels: state.travels.filter(t => t.id !== action.payload) };

    case 'ADD_WISH_ITEM':
        return { ...state, wishItems: [...state.wishItems, action.payload] };
    case 'UPDATE_WISH_ITEM':
        return { ...state, wishItems: state.wishItems.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_WISH_ITEM':
        return { ...state, wishItems: state.wishItems.filter(i => i.id !== action.payload) };

    case 'ADD_NOTE':
        return { ...state, notes: [...state.notes, action.payload] };
    case 'UPDATE_NOTE':
        return { ...state, notes: state.notes.map(n => n.id === action.payload.id ? action.payload : n) };
    case 'DELETE_NOTE':
        return { ...state, notes: state.notes.filter(n => n.id !== action.payload) };

    case 'ADD_PHOTO':
        return { ...state, photos: [...state.photos, action.payload] };
    case 'UPDATE_PHOTO':
        return { ...state, photos: state.photos.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PHOTO':
        return { ...state, photos: state.photos.filter(p => p.id !== action.payload) };
    
    case 'ADD_NOTIFICATION':
        return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATION_READ':
        return { ...state, notifications: state.notifications.map(n => n.id === action.payload ? { ...n, read: true } : n) };

    case 'UPDATE_USER_PROFILE':
        if (!state.auth.user) return state;
        return { ...state, auth: { ...state.auth, user: { ...state.auth.user, ...action.payload } } };

    case 'UPDATE_PARTNER_PROFILE':
        if (!state.auth.partner) return state;
        return { ...state, auth: { ...state.auth, partner: { ...state.auth.partner, ...action.payload } } };
    
    // Carrega o estado salvo no localStorage.
    case 'LOAD_DATA':
        return {
            ...action.payload,
            auth: {
                ...action.payload.auth,
                isCoupleFull: !!(action.payload.auth.user && action.payload.auth.partner),
            },
        };

    default:
      return state;
  }
}

/**
 * Provider principal da aplicação com persistência automática de sessão.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Carrega os dados do localStorage apenas uma vez, na inicialização.
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('couples-app-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Garante que o usuário ainda está autenticado antes de carregar
        if (parsedData.auth.isAuthenticated && parsedData.auth.token) {
          // Recarrega os dados da API para garantir que estão sincronizados
          // Esta é uma melhoria opcional, por agora vamos confiar no localStorage
          dispatch({ type: 'LOAD_DATA', payload: parsedData });
        } else {
          localStorage.removeItem('couples-app-data');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      localStorage.removeItem('couples-app-data');
    }
  }, []);

  // Salva os dados no localStorage sempre que o estado de autenticação mudar.
  useEffect(() => {
    try {
      // Só salva no localStorage se o usuário estiver autenticado.
      if (state.auth.isAuthenticated) {
        localStorage.setItem('couples-app-data', JSON.stringify(state));
      }
    } catch (error) {
      console.error('Erro ao salvar dados no localStorage:', error);
    }
  }, [state.auth]); // A dependência é apenas o estado de autenticação

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook customizado para acessar o contexto da aplicação.
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}