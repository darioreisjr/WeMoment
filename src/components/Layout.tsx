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
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plane,
  Trophy,
  Check,
} from 'lucide-react';
import logo from './../assents/Logo.png';

interface LayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const getRelationshipPreposition = (userGender?: string, partnerGender?: string): string => {
  if (!userGender || !partnerGender) return 'Com';

  const userSex = userGender.toLowerCase();
  const partnerSex = partnerGender.toLowerCase();

  if (
    (userSex === 'male' && partnerSex === 'female') ||
    (userSex === 'female' && partnerSex === 'female')
  ) {
    return 'da';
  } else if (
    (userSex === 'female' && partnerSex === 'male') ||
    (userSex === 'male' && partnerSex === 'male')
  ) {
    return 'do';
  }

  return 'Com';
};

export default function Layout({ children, currentSection, onSectionChange }: LayoutProps) {
  const { state, dispatch } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const unreadNotifications = state.notifications.filter(n => !n.read).length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'travels', label: 'Viagens', icon: Plane },
    { id: 'wishes', label: 'Lista de Desejos', icon: Heart },
    { id: 'notes', label: 'Anotações', icon: FileText },
    { id: 'photos', label: 'Galeria', icon: Camera },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('couples-app-data');
  };

  const markAsRead = (notificationId: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="text-blue-500" size={20} />;
      case 'achievement':
        return <Trophy className="text-yellow-500" size={20} />;
      case 'reminder':
        return <Bell className="text-purple-500" size={20} />;
      default:
        return <Heart className="text-rose-500" size={20} />;
    }
  };

  const sortedNotifications = [...state.notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-rose-200/50 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo e Toggle Mobile */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>

            <div className="flex items-center space-x-2">
              <img src={logo} alt="WeMoment" className="w-8 h-8" />
              <span className="font-bold text-xl bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                WeMoment
              </span>
            </div>
          </div>

          {/* User Menu & Notifications */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Bell size={24} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 justify-center items-center text-white text-[10px]">
                      {unreadNotifications}
                    </span>
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Notificações</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {sortedNotifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500 text-sm">Nenhuma notificação ainda.</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {sortedNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 transition-all ${
                              !notification.read ? 'bg-rose-50' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm text-gray-900">
                                    {notification.title}
                                  </h4>
                                  <p className="text-gray-600 text-sm mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 rounded-full hover:bg-green-100 transition-colors"
                                  title="Marcar como lida"
                                >
                                  <Check className="text-green-600" size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                {state.auth.user?.avatar ? (
                  <img
                    src={state.auth.user.avatar}
                    alt={state.auth.user.firstName || state.auth.user.name || 'Usuário'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {(state.auth.user?.firstName || state.auth.user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:block font-medium">
                  {state.auth.user?.firstName || state.auth.user?.name || 'Usuário'}
                </span>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      onSectionChange('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User size={16} className="mr-3" />
                    Configurações
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} className="mr-3" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex flex-col bg-white/80 backdrop-blur-sm border-r border-rose-200/50 fixed left-0 top-0 h-screen z-40 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}>
          <nav className="flex-1 p-4 pt-20">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={`w-full flex items-center px-3 py-3 rounded-xl font-medium transition-all group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                  >
                    <Icon size={20} className={`${isSidebarCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
                    {!isSidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    
                    {/* Tooltip for collapsed sidebar */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* User Profile in Sidebar */}
          {!isSidebarCollapsed && state.auth.partner && (
            <div className="p-4 border-t border-rose-200/50">
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  {state.auth.user?.avatar ? (
                    <img
                      src={state.auth.user.avatar}
                      alt={state.auth.user.firstName || state.auth.user.name || 'Usuário'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                      {(state.auth.user?.firstName || state.auth.user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {state.auth.user?.firstName || state.auth.user?.name || 'Usuário'}
                    </div>
                  <div className="text-gray-500">
                    💕 {getRelationshipPreposition(state.auth.user?.gender, state.auth.partner?.gender)} {state.auth.partner?.firstName || state.auth.partner?.name || 'Parceiro(a)'}
                  </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <aside className="relative flex flex-col w-80 max-w-sm bg-white border-r border-rose-200/50">
              <div className="flex items-center justify-between p-4 border-b border-rose-200/50">
                <div className="flex items-center space-x-2">
                  <img src={logo} alt="WeMoment" className="w-8 h-8" />
                  <span className="font-bold text-xl bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    WeMoment
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex-1 p-4">
                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentSection === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSectionChange(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                            : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                        }`}
                      >
                        <Icon size={20} className="mr-3" />
                        <span className="flex-1 text-left">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* User Profile in Mobile Menu */}
              {state.auth.partner && (
                <div className="p-4 border-t border-rose-200/50">
                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      {state.auth.user?.avatar ? (
                        <img
                          src={state.auth.user.avatar}
                          alt={state.auth.user.firstName || state.auth.user.name || 'Usuário'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                          {(state.auth.user?.firstName || state.auth.user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {state.auth.user?.firstName || state.auth.user?.name || 'Usuário'}
                        </div>
                        <div className="text-gray-500">
                          💕 {getRelationshipPreposition(state.auth.user?.gender, state.auth.partner?.gender)} {state.auth.partner?.firstName || state.auth.partner?.name || 'Parceiro(a)'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}>
          <div className="h-screen overflow-y-auto pt-16">
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setShowUserMenu(false)
            setShowNotifications(false)
          }}
        />
      )}
    </div>
  );
}