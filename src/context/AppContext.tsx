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
  | { type: 'UPDATE_PHOTO'; payload: Photo } // Nova action para atualizar foto
  | { type: 'DELETE_PHOTO'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'LOAD_DATA'; payload: AppState }
  | { type: 'LOAD_MOCK_DATA' }; // Nova action para carregar dados mockup

// Função para gerar dados mockup de fotos
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
      date: '2025-07-01',
      uploadedBy: 'user1',
      createdAt: '2025-07-01T10:45:00Z',
    },
    {
      id: 'mock4',
      url: 'https://images.pexels.com/photos/1024996/pexels-photo-1024996.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Cinema em Casa',
      description: 'Sessão pipoca assistindo nosso filme favorito. Que aconchego!',
      date: '2025-06-28',
      uploadedBy: 'partner1',
      createdAt: '2025-06-28T21:00:00Z',
    },
    {
      id: 'mock5',
      url: 'https://images.pexels.com/photos/1024997/pexels-photo-1024997.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Café da Manhã Especial',
      description: 'Preparamos juntos um café da manhã incrível no domingo. Panquecas deliciosas!',
      date: '2025-06-22',
      uploadedBy: 'user1',
      createdAt: '2025-06-22T09:30:00Z',
    },
    {
      id: 'mock6',
      url: 'https://images.pexels.com/photos/1024998/pexels-photo-1024998.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Show de Música',
      description: 'Que noite fantástica no show da nossa banda favorita! Cantamos muito!',
      date: '2025-06-18',
      uploadedBy: 'partner1',
      createdAt: '2025-06-18T23:15:00Z',
    },
    {
      id: 'mock7',
      url: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Piquenique no Jardim',
      description: 'Tarde perfeita ao ar livre com frutas, sanduíches e muito carinho.',
      date: '2025-06-10',
      uploadedBy: 'user1',
      createdAt: '2025-06-10T15:20:00Z',
    },
    {
      id: 'mock8',
      url: 'https://images.pexels.com/photos/1051837/pexels-photo-1051837.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Cozinhando Juntos',
      description: 'Experimentando uma nova receita italiana. Ficou uma delícia!',
      date: '2025-06-05',
      uploadedBy: 'partner1',
      createdAt: '2025-06-05T19:45:00Z',
    },
    {
      id: 'mock9',
      url: 'https://images.pexels.com/photos/1051836/pexels-photo-1051836.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Tarde de Jogos',
      description: 'Competição acirrada no videogame! Quem será o campeão hoje?',
      date: '2025-05-30',
      uploadedBy: 'user1',
      createdAt: '2025-05-30T16:10:00Z',
    },
    {
      id: 'mock10',
      url: 'https://images.pexels.com/photos/1051835/pexels-photo-1051835.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Selfie do Amor',
      description: 'Apenas nós dois sendo felizes! Este sorriso não sai do meu rosto.',
      date: '2025-05-25',
      uploadedBy: 'partner1',
      createdAt: '2025-05-25T14:22:00Z',
    }
  ];
  
  return mockPhotos;
};

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

// Reducer function que processa todas as actions e atualiza o estado
// É o coração do gerenciamento de estado da aplicação
function appReducer(state: AppState, action: Action): AppState {
  console.log('🔄 Action dispatched:', action.type, action.payload);
  
  switch (action.type) {
    case 'LOGIN':
      console.log('✅ Login realizado:', action.payload);
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
      console.log('📸 Foto atualizada:', action.payload);
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
    case 'LOAD_MOCK_DATA':
      console.log('🎭 Carregando dados mockup para testes');
      return {
        ...state,
        photos: [...state.photos, ...generateMockPhotos()],
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
          notification.id === action.payload ?
            { ...notification, read: true } : notification
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
    
    // Carregar dados mockup apenas se não houver fotos no localStorage
    // Isso evita duplicar dados a cada reload
    const existingData = savedData ? JSON.parse(savedData) : null;
    if (!existingData || !existingData.photos || existingData.photos.length === 0) {
      console.log('🎭 Carregando dados mockup para demonstração...');
      dispatch({ type: 'LOAD_MOCK_DATA' });
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