import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Heart, Calendar, Trophy, Check, X } from 'lucide-react';

export default function Notifications() {
  const { state, dispatch } = useApp();

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

  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Notificações
          </h1>
          {unreadCount > 0 && (
            <p className="text-gray-600 mt-1">
              {unreadCount} nova{unreadCount !== 1 ? 's' : ''} notificação{unreadCount !== 1 ? 'ões' : ''}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
            <Bell className="text-white" size={16} />
          </div>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        {sortedNotifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">Nenhuma notificação ainda</p>
            <p className="text-gray-400 mt-2">
              Quando houver eventos ou atividades, você será notificado aqui
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  notification.read
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-rose-200 bg-rose-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {unreadCount > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                state.notifications.forEach(notification => {
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                });
              }}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
            >
              <Check className="mr-2" size={16} />
              Marcar Todas como Lidas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}