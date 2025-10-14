import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './components/Login';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import Travels from './components/Travels';
import Wishes from './components/Wishes';
import Notes from './components/Notes';
import Photos from './components/Photos';
import Notifications from './components/Notifications';
import Settings from './components/SettingsComponent';
import UpdatePassword from './components/UpdatePassword'; // Importe o novo componente

/**
 * Componente principal da aplicação com roteamento por seções
 * Gerencia a navegação entre diferentes funcionalidades do app
 */
function AppContent() {
  const { state } = useApp();
  const [currentSection, setCurrentSection] = useState('dashboard');
  
  // Rota para a página de atualização de senha
  if (window.location.pathname === '/update-password') {
    return <UpdatePassword />;
  }

  // Redireciona para login se não estiver autenticado
  if (!state.auth.isAuthenticated) {
    return <Login />;
  }

  // Redireciona para configuração de perfil se não há parceiro cadastrado
  if (!state.auth.partner) {
    return <ProfileSetup />;
  }

  /**
   * Renderiza o componente apropriado baseado na seção atual
   */
  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <Calendar />;
      case 'travels':
        return <Travels />;
      case 'wishes':
        return <Wishes />;
      case 'notes':
        return <Notes />;
      case 'photos':
        return <Photos />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentSection={currentSection} onSectionChange={setCurrentSection}>
      {renderSection()}
    </Layout>
  );
}

/**
 * Componente raiz da aplicação com providers e configurações globais
 */
function App() {
  return (
    <AppProvider>
      <AppContent />
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #10b981',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: {
              border: '1px solid #ef4444',
            },
          },
        }}
      />
      
      <Analytics />
    </AppProvider>
  );
}

export default App;