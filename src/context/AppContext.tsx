import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Action, Photo, Event, WishItem, Note } from '../types';

// Estado inicial da aplicação incluindo viagens
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
  travels: [], // Nova propriedade para armazenar viagens
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

/**
 * Reducer principal da aplicação com suporte completo para viagens
 * Gerencia todas as actions do state global incluindo CRUD de viagens
 */
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
          token: action.payload.token,
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

    // ========== EVENTS ACTIONS ==========
    case 'SET_EVENTS':
      return {
        ...state,
        events: action.payload,
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

    // ========== WISH ITEMS ACTIONS ==========
    case 'SET_WISHES': // NOVA ACTION
      return {
        ...state,
        wishItems: action.payload,
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

    // ========== NOTES ACTIONS ==========
    case 'SET_NOTES':
        return { ...state, notes: action.payload };
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

    // ========== PHOTOS ACTIONS ==========
    case 'SET_PHOTOS':
      return {
        ...state,
        photos: action.payload,
      };
    case 'ADD_PHOTO':
      return {
        ...state,
        photos: [action.payload, ...state.photos],
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

    // ========== NOTIFICATIONS ACTIONS ==========
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

    // ========== TRAVELS ACTIONS (NOVAS) ==========
    case 'ADD_TRAVEL':
      console.log('🧳 Nova viagem adicionada:', action.payload);
      return {
        ...state,
        travels: [...state.travels, action.payload],
      };

    case 'UPDATE_TRAVEL':
      console.log('✏️ Viagem atualizada:', action.payload);
      return {
        ...state,
        travels: state.travels.map(travel =>
          travel.id === action.payload.id ? action.payload : travel
        ),
      };

    case 'DELETE_TRAVEL':
      console.log('🗑️ Viagem removida:', action.payload);
      return {
        ...state,
        travels: state.travels.filter(travel => travel.id !== action.payload),
        // Remove também eventos relacionados à viagem do calendário
        events: state.events.filter(event => event.id !== `travel-${action.payload}`),
      };

    // ========== DATA LOADING ACTIONS ==========
    case 'LOAD_DATA':
      console.log('📥 Carregando dados do localStorage:', action.payload);
      return {
        ...action.payload,
        auth: {
          ...action.payload.auth,
          relationshipStartDate: action.payload.auth.relationshipStartDate || undefined,
          isCoupleFull: !!(action.payload.auth.user && action.payload.auth.partner),
        },
        travels: action.payload.travels || [],
      };

    default:
      console.log('⚠️ Action não reconhecida:', action.type);
      return state;
  }
}

/**
 * Provider principal da aplicação com persistência automática
 * Gerencia o estado global e salva automaticamente no localStorage
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Effect para carregar dados do localStorage na inicialização
  useEffect(() => {
    console.log('🔄 Tentando carregar dados do localStorage...');
    const savedData = localStorage.getItem('couples-app-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log('📖 Dados carregados do localStorage:', parsedData);
        
        if (!parsedData.travels) {
          parsedData.travels = [];
        }
        
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      } catch (error) {
        console.error('❌ Erro ao carregar dados do localStorage:', error);
      }
    } else {
      console.log('📋 Nenhum dado encontrado no localStorage');
    }
  }, []);
  
  // Effect para buscar dados da API quando autenticado
  useEffect(() => {
    const fetchData = async () => {
      if (state.auth.isAuthenticated && state.auth.token) {
        console.log('🚀 Buscando dados da API...');
        const headers = { 'Authorization': `Bearer ${state.auth.token}` };

        // Fetch Events, Wishes, Notes, Photos
        const endpoints = {
          events: 'SET_EVENTS',
          wishes: 'SET_WISHES',
          notes: 'SET_NOTES',
          photos: 'SET_PHOTOS'
        };

        for (const [endpoint, actionType] of Object.entries(endpoints)) {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/${endpoint}`, { headers });
            if (response.ok) {
              const data = await response.json();
              dispatch({ type: actionType as any, payload: data });
              console.log(`✅ ${endpoint} carregados da API:`, data);
            } else {
              console.error(`Falha ao buscar ${endpoint}:`, response.statusText);
            }
          } catch (error) {
            console.error(`Erro ao conectar com a API de ${endpoint}:`, error);
          }
        }
      }
    };

    fetchData();
  }, [state.auth.isAuthenticated, state.auth.token]);


  // Effect para salvar dados no localStorage sempre que o estado mudar
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

/**
 * Hook customizado para acessar o contexto da aplicação
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}