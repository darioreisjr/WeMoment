import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './components/Login';
import ProfileSetup from './components/ProfileSetup'; // Manteremos o import caso seja usado em outro fluxo
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import Travels from './components/Travels';
import Wishes from './components/Wishes';
import Notes from './components/Notes';
import Photos from './components/Photos';
import Notifications from './components/Notifications';
import Settings from './components/SettingsComponent';
import UpdatePassword from './components/UpdatePassword';

/**
 * Componente que gerencia a renderização principal da aplicação.
 */
function AppContent() {
  const { state } = useApp();
  const [currentSection, setCurrentSection] = useState('dashboard');
  
  // Rota especial para a página de atualização de senha via link de e-mail.
  if (window.location.pathname === '/update-password') {
    return <UpdatePassword />;
  }

  // Se o usuário não estiver autenticado, mostra a tela de Login.
  if (!state.auth.isAuthenticated) {
    return <Login />;
  }

  // CORREÇÃO: Removemos a verificação do parceiro aqui.
  // AGORA, qualquer usuário autenticado vai direto para o painel principal.
  // A lógica de convite será tratada na tela de Configurações.

  /**
   * Renderiza a seção apropriada do painel principal.
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

  // Se o usuário está autenticado, ele sempre verá o Layout principal.
  return (
    <Layout currentSection={currentSection} onSectionChange={setCurrentSection}>
      {renderSection()}
    </Layout>
  );
}

/**
 * Componente raiz da aplicação com todos os providers e configurações globais.
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
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Analytics />
    </AppProvider>
  );
}

export default App;