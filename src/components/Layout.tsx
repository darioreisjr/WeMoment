import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  Calendar,
  Heart,
  FileText,
  Camera,
  Bell,
  Settings,
  Menu,
  X,
  User,
  LogOut
} from 'lucide-react';
import logo from './../assents/Logo.png';


interface LayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export default function Layout({ children, currentSection, onSectionChange }: LayoutProps) {
  const { state, dispatch } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadNotifications = state.notifications.filter(n => !n.read).length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'wishes', label: 'Lista de Desejos', icon: Heart },
    { id: 'notes', label: 'Anotações', icon: FileText },
    { id: 'photos', label: 'Galeria', icon: Camera },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('couples-app-data');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-rose-100 transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center space-x-2 ml-2 md:ml-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center">
                  <img src={logo} alt="Logo da aplicação" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  WeMoment
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {state.auth.user && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {state.auth.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {state.auth.partner && (
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {state.auth.partner.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  <User size={20} />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium">{state.auth.user?.name}</p>
                      <p className="text-xs text-gray-500">{state.auth.user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} className="mr-2" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 fixed md:static inset-y-0 left-0 z-30 w-64 bg-white/80 backdrop-blur-sm border-r border-rose-200/50 transition-transform duration-300 ease-in-out`}>
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onSectionChange(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${isActive
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-rose-100'
                        }`}
                    >
                      <Icon size={20} className="mr-3" />
                      {item.label}
                      {item.id === 'notifications' && unreadNotifications > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadNotifications}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}