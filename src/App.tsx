import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './components/Login';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import Wishes from './components/Wishes';
import Notes from './components/Notes';
import Photos from './components/Photos';
import Notifications from './components/Notifications';
import Settings from './components/Settings';

function AppContent() {
  const { state } = useApp();
  const [currentSection, setCurrentSection] = useState('dashboard');

  if (!state.auth.isAuthenticated) {
    return <Login />;
  }

  if (!state.auth.partner) {
    return <ProfileSetup />;
  }

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <Calendar />;
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

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;