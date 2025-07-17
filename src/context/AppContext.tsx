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

type Action = 
  | { type: 'LOGIN'; payload: { user: User; partner?: User } }
  | { type: 'LOGOUT' }
  | { type: 'SET_PARTNER'; payload: User }
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

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        auth: {
          isAuthenticated: true,
          user: action.payload.user,
          partner: action.payload.partner || null,
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
      return action.payload;
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedData = localStorage.getItem('couples-app-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('couples-app-data', JSON.stringify(state));
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