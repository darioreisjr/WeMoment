import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { Event, WishItem, Note, Photo } from '../types';
import { Calendar, Heart, FileText, Camera, Plus, Clock, Star, X } from 'lucide-react';

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showQuickEventModal, setShowQuickEventModal] = useState(false);
  const [showQuickWishModal, setShowQuickWishModal] = useState(false);
  const [showQuickNoteModal, setShowQuickNoteModal] = useState(false);
  const [showQuickPhotoModal, setShowQuickPhotoModal] = useState(false);

  const [quickEventForm, setQuickEventForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'date' as Event['type'],
  });

  const [quickWishForm, setQuickWishForm] = useState({
    title: '',
    category: 'activity' as WishItem['category'],
    priority: 'medium' as WishItem['priority'],
  });

  const [quickNoteForm, setQuickNoteForm] = useState({
    title: '',
    content: '',
  });

  const [quickPhotoForm, setQuickPhotoForm] = useState({
    title: '',
    description: '',
  });

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Eventos de hoje
  const todayEvents = state.events
    .filter(event => event.date.startsWith(todayStr))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Próximos eventos (excluindo os de hoje)
  const upcomingEvents = state.events
    .filter(event => new Date(event.date) > today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Eventos filtrados por ano e mês
  const filteredEvents = state.events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getFullYear() === selectedYear && 
           eventDate.getMonth() + 1 === selectedMonth;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Gerar opções de anos (últimos 2 anos + próximos 3 anos)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = currentYear - 2; year <= currentYear + 3; year++) {
    yearOptions.push(year);
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const recentPhotos = state.photos
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const completedWishes = state.wishItems.filter(item => item.completed).length;
  const totalWishes = state.wishItems.length;

  const stats = [
    {
      label: 'Eventos Marcados',
      value: state.events.length,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Desejos Realizados',
      value: `${completedWishes}/${totalWishes}`,
      icon: Heart,
      color: 'from-rose-500 to-pink-500',
    },
    {
      label: 'Anotações',
      value: state.notes.length,
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
    },
    {
      label: 'Fotos',
      value: state.photos.length,
      icon: Camera,
      color: 'from-emerald-500 to-emerald-600',
    },
  ];

  const handleQuickEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.auth.user) return;

    const newEvent: Event = {
      id: Date.now().toString(),
      title: quickEventForm.title,
      description: quickEventForm.description,
      date: new Date(quickEventForm.date).toISOString(),
      type: quickEventForm.type,
      createdBy: state.auth.user.id,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_EVENT', payload: newEvent });
    
    // Substituído por toast notification
    toast.success(`Evento "${quickEventForm.title}" criado com sucesso! 📅`, {
      duration: 3000,
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        title: 'Evento criado rapidamente!',
        message: `${quickEventForm.title} foi adicionado ao calendário`,
        type: 'event',
        date: new Date().toISOString(),
        read: false,
        createdAt: new Date().toISOString(),
      },
    });

    setShowQuickEventModal(false);
    setQuickEventForm({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'date',
    });
  };

  const handleQuickWishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.auth.user) return;

    const newWish: WishItem = {
      id: Date.now().toString(),
      title: quickWishForm.title,
      description: '',
      category: quickWishForm.category,
      priority: quickWishForm.priority,
      completed: false,
      createdBy: state.auth.user.id,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_WISH_ITEM', payload: newWish });
    
    // Substituído por toast notification
    toast.success(`Desejo "${quickWishForm.title}" adicionado! 💕`, {
      duration: 3000,
    });
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        title: 'Desejo adicionado rapidamente!',
        message: `"${quickWishForm.title}" foi adicionado à lista de desejos`,
        type: 'achievement',
        date: new Date().toISOString(),
        read: false,
        createdAt: new Date().toISOString(),
      },
    });

    setShowQuickWishModal(false);
    setQuickWishForm({
      title: '',
      category: 'activity',
      priority: 'medium',
    });
  };

  const handleQuickNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.auth.user) return;

    const newNote: Note = {
      id: Date.now().toString(),
      title: quickNoteForm.title,
      content: quickNoteForm.content,
      createdBy: state.auth.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_NOTE', payload: newNote });
    
    // Substituído por toast notification
    toast.success(`Anotação "${quickNoteForm.title}" criada! 📝`, {
      duration: 3000,
    });
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        title: 'Anotação criada rapidamente!',
        message: `"${quickNoteForm.title}" foi adicionada às anotações`,
        type: 'achievement',
        date: new Date().toISOString(),
        read: false,
        createdAt: new Date().toISOString(),
      },
    });

    setShowQuickNoteModal(false);
    setQuickNoteForm({
      title: '',
      content: '',
    });
  };

  const handleQuickPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.auth.user) return;

    const mockPhotos = [
      'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1024994/pexels-photo-1024994.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1024995/pexels-photo-1024995.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1024996/pexels-photo-1024996.jpeg?auto=compress&cs=tinysrgb&w=800',
    ];

    const randomPhoto = mockPhotos[Math.floor(Math.random() * mockPhotos.length)];

    const newPhoto: Photo = {
      id: Date.now().toString(),
      url: randomPhoto,
      title: quickPhotoForm.title,
      description: quickPhotoForm.description,
      date: new Date().toISOString(),
      uploadedBy: state.auth.user.id,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_PHOTO', payload: newPhoto });
    
    // Substituído por toast notification
    toast.success(`Foto "${quickPhotoForm.title}" adicionada! 📸`, {
      duration: 3000,
    });
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        title: 'Foto adicionada rapidamente!',
        message: `"${quickPhotoForm.title}" foi adicionada à galeria`,
        type: 'achievement',
        date: new Date().toISOString(),
        read: false,
        createdAt: new Date().toISOString(),
      },
    });

    setShowQuickPhotoModal(false);
    setQuickPhotoForm({
      title: '',
      description: '',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Bem-vindos, {state.auth.user?.firstName} e {state.auth.partner?.firstName}!
        </h1>
        <p className="text-gray-600 text-lg">
          Seu espaço especial para planejar e registrar momentos únicos juntos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setShowQuickEventModal(true)}
            className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            <Plus size={24} className="mb-2" />
            <span className="text-sm font-medium">Novo Evento</span>
          </button>
          <button 
            onClick={() => setShowQuickWishModal(true)}
            className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 transition-all"
          >
            <Heart size={24} className="mb-2" />
            <span className="text-sm font-medium">Adicionar Desejo</span>
          </button>
          <button 
            onClick={() => setShowQuickNoteModal(true)}
            className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all"
          >
            <FileText size={24} className="mb-2" />
            <span className="text-sm font-medium">Nova Anotação</span>
          </button>
          <button 
            onClick={() => setShowQuickPhotoModal(true)}
            className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all"
          >
            <Camera size={24} className="mb-2" />
            <span className="text-sm font-medium">Adicionar Foto</span>
          </button>
        </div>
      </div>

      {/* Today's Events or Upcoming Events */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {todayEvents.length > 0 ? 'Eventos de Hoje' : 'Próximos Eventos'}
          </h2>
          <Clock className="text-gray-500" size={20} />
        </div>
        
        {todayEvents.length > 0 ? (
          <div className="space-y-3">
            {todayEvents.map((event) => (
              <div key={event.id} className="flex items-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border-2 border-emerald-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2 py-1 bg-emerald-500 text-white text-xs rounded-full font-medium">
                      HOJE
                    </span>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  {event.location && (
                    <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>
                  )}
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  event.type === 'anniversary' ? 'bg-rose-500' :
                  event.type === 'trip' ? 'bg-blue-500' :
                  event.type === 'date' ? 'bg-purple-500' : 'bg-gray-500'
                }`} />
              </div>
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum evento próximo. Que tal planejar algo especial?
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  {event.location && (
                    <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(event.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  event.type === 'anniversary' ? 'bg-rose-500' :
                  event.type === 'trip' ? 'bg-blue-500' :
                  event.type === 'date' ? 'bg-purple-500' : 'bg-gray-500'
                }`} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Events Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Filtrar Eventos</h2>
          <Calendar className="text-gray-500" size={20} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ano
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mês
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              {monthNames.map((month, index) => (
                <option key={index + 1} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum evento encontrado para {monthNames[selectedMonth - 1]} de {selectedYear}
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-3">
              {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''} em {monthNames[selectedMonth - 1]} de {selectedYear}
            </p>
            {filteredEvents.map((event) => (
              <div key={event.id} className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      event.type === 'anniversary' ? 'bg-rose-100 text-rose-800' :
                      event.type === 'trip' ? 'bg-blue-100 text-blue-800' :
                      event.type === 'date' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.type === 'anniversary' ? 'Aniversário' :
                       event.type === 'trip' ? 'Viagem' :
                       event.type === 'date' ? 'Encontro' : 'Outro'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  {event.location && (
                    <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(event.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      weekday: 'long'
                    })}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  event.type === 'anniversary' ? 'bg-rose-500' :
                  event.type === 'trip' ? 'bg-blue-500' :
                  event.type === 'date' ? 'bg-purple-500' : 'bg-gray-500'
                }`} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Photos */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Momentos Recentes</h2>
          <Camera className="text-gray-500" size={20} />
        </div>
        {recentPhotos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma foto ainda. Comecem a registrar seus momentos!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-32 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all">
                  <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs font-medium truncate">{photo.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Event Modal */}
      {showQuickEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Evento Rápido</h3>
              <button
                onClick={() => setShowQuickEventModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleQuickEventSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={quickEventForm.title}
                  onChange={(e) => setQuickEventForm({ ...quickEventForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome do evento"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  value={quickEventForm.description}
                  onChange={(e) => setQuickEventForm({ ...quickEventForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descrição (opcional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={quickEventForm.date}
                  onChange={(e) => setQuickEventForm({ ...quickEventForm, date: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={quickEventForm.type}
                  onChange={(e) => setQuickEventForm({ ...quickEventForm, type: e.target.value as Event['type'] })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Encontro</option>
                  <option value="anniversary">Aniversário</option>
                  <option value="trip">Viagem</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowQuickEventModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Wish Modal */}
      {showQuickWishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Desejo Rápido</h3>
              <button
                onClick={() => setShowQuickWishModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleQuickWishSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={quickWishForm.title}
                  onChange={(e) => setQuickWishForm({ ...quickWishForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="O que vocês querem fazer?"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={quickWishForm.category}
                  onChange={(e) => setQuickWishForm({ ...quickWishForm, category: e.target.value as WishItem['category'] })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="activity">🎯 Atividade</option>
                  <option value="travel">✈️ Viagem</option>
                  <option value="restaurant">🍽️ Restaurante</option>
                  <option value="dream">💭 Sonho</option>
                  <option value="other">📝 Outro</option>
                </select>
                <select
                  value={quickWishForm.priority}
                  onChange={(e) => setQuickWishForm({ ...quickWishForm, priority: e.target.value as WishItem['priority'] })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowQuickWishModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Note Modal */}
      {showQuickNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Anotação Rápida</h3>
              <button
                onClick={() => setShowQuickNoteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleQuickNoteSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={quickNoteForm.title}
                  onChange={(e) => setQuickNoteForm({ ...quickNoteForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Título da anotação"
                  required
                />
              </div>

              <div>
                <textarea
                  value={quickNoteForm.content}
                  onChange={(e) => setQuickNoteForm({ ...quickNoteForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  placeholder="Escreva sua anotação aqui..."
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowQuickNoteModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Photo Modal */}
      {showQuickPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Foto Rápida</h3>
              <button
                onClick={() => setShowQuickPhotoModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleQuickPhotoSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={quickPhotoForm.title}
                  onChange={(e) => setQuickPhotoForm({ ...quickPhotoForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Título da foto"
                  required
                />
              </div>

              <div>
                <textarea
                  value={quickPhotoForm.description}
                  onChange={(e) => setQuickPhotoForm({ ...quickPhotoForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descreva este momento especial..."
                />
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg">
                <div className="flex items-center justify-center text-emerald-600">
                  <Camera className="mr-2" size={20} />
                  <span className="text-sm">Uma foto aleatória será adicionada</span>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowQuickPhotoModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}