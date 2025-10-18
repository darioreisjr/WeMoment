import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { Event, WishItem, Note, Photo } from '../types';
import { Calendar, Heart, FileText, Camera, Plus, Clock, Star, X, Plane, MapPin } from 'lucide-react';

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

  // ========== ESTATÍSTICAS DE VIAGENS ==========
  const getTravelStatus = (travel: any) => {
    const today = new Date();
    const startDate = new Date(travel.startDate);
    const endDate = new Date(travel.endDate);
    
    if (today < startDate) return 'upcoming';
    if (today >= startDate && today <= endDate) return 'ongoing';
    return 'completed';
  };

  const upcomingTravels = state.travels.filter(travel => getTravelStatus(travel) === 'upcoming');
  const ongoingTravels = state.travels.filter(travel => getTravelStatus(travel) === 'ongoing');
  const completedTravels = state.travels.filter(travel => getTravelStatus(travel) === 'completed');

  // Próxima viagem
  const nextTravel = upcomingTravels
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  // Viagem atual (se houver)
  const currentTravel = ongoingTravels[0];

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
    .slice(0, 6);

  const priorityWishes = state.wishItems
    .filter(wish => !wish.completed && wish.priority === 'high')
    .slice(0, 3);

  const recentNotes = state.notes
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  // Cálculo do tempo de relacionamento
  const getRelationshipTime = () => {
    if (!state.auth.relationshipStartDate) return null;
    
    const start = new Date(state.auth.relationshipStartDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;
    
    return { years, months, days, totalDays: diffDays };
  };

  const relationshipTime = getRelationshipTime();

  // Quick Actions Handlers
  const handleQuickEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEventForm.title.trim()) {
      toast.error('Título é obrigatório!');
      return;
    }
    if (!state.auth.token) {
      toast.error('Sessão expirada. Faça login novamente.');
      return;
    }

    const eventPayload = {
      title: quickEventForm.title.trim(),
      description: quickEventForm.description.trim(),
      date: `${quickEventForm.date}T12:00:00.000Z`,
      type: quickEventForm.type,
      location: '', 
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.auth.token}`,
        },
        body: JSON.stringify(eventPayload),
      });

      const newEvent = await response.json();

      if (!response.ok) {
        throw new Error(newEvent.error || 'Falha ao criar o evento.');
      }

      dispatch({ type: 'ADD_EVENT', payload: newEvent });
      toast.success('Evento adicionado!');
      setQuickEventForm({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 'date',
      });
      setShowQuickEventModal(false);

    } catch (error) {
      console.error('Erro ao criar evento rápido:', error);
      toast.error((error as Error).message || 'Não foi possível criar o evento.');
    }
  };

  const handleQuickWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickWishForm.title.trim()) {
      toast.error('Título é obrigatório!');
      return;
    }

    if (!state.auth.token) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
    }

    const wishPayload = {
      title: quickWishForm.title.trim(),
      description: '', // Descrição vazia para ação rápida
      category: quickWishForm.category,
      priority: quickWishForm.priority,
      completed: false,
    };

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.auth.token}`,
            },
            body: JSON.stringify(wishPayload),
        });

        const newWish = await response.json();

        if (!response.ok) {
            throw new Error(newWish.error || 'Falha ao adicionar o desejo.');
        }

        dispatch({ type: 'ADD_WISH_ITEM', payload: newWish });
        toast.success('Desejo adicionado!');
        setQuickWishForm({
            title: '',
            category: 'activity',
            priority: 'medium',
        });
        setShowQuickWishModal(false);

    } catch (error) {
        toast.error((error as Error).message || 'Ocorreu um erro desconhecido.');
    }
  };

  const handleQuickNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteForm.title.trim()) {
        toast.error('O título é obrigatório!');
        return;
    }
    if (!state.auth.token) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
    }

    const notePayload = {
        title: quickNoteForm.title.trim(),
        content: quickNoteForm.content.trim(),
    };

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.auth.token}`,
            },
            body: JSON.stringify(notePayload),
        });

        const newNote = await response.json();

        if (!response.ok) {
            throw new Error(newNote.error || 'Falha ao criar a anotação.');
        }

        dispatch({ type: 'ADD_NOTE', payload: newNote });
        toast.success('Anotação criada!');
        setQuickNoteForm({ title: '', content: '' });
        setShowQuickNoteModal(false);

    } catch (error) {
        toast.error((error as Error).message || 'Não foi possível criar a anotação.');
    }
  };

  const handleQuickPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPhotoForm.title.trim()) {
      toast.error('Título é obrigatório!');
      return;
    }

    // Simular upload de foto
    const mockPhotoUrl = `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=800`;

    const newPhoto: Photo = {
      id: Date.now().toString(),
      url: mockPhotoUrl,
      title: quickPhotoForm.title.trim(),
      description: quickPhotoForm.description.trim(),
      date: new Date().toISOString().split('T')[0],
      uploadedBy: state.auth.user?.id || '',
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_PHOTO', payload: newPhoto });
    toast.success('Foto adicionada!');
    setQuickPhotoForm({
      title: '',
      description: '',
    });
    setShowQuickPhotoModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Bem-vindos, {state.auth.user?.firstName || state.auth.user?.name} e {state.auth.partner?.firstName || state.auth.partner?.name}
            </h1>
            <p className="text-gray-600">
              Seu espaço especial para planejar e registrar momentos únicos juntos
            </p>
            {relationshipTime && (
              <p className="text-sm text-gray-500 mt-1">
                Juntos há {relationshipTime.years > 0 && `${relationshipTime.years} ano${relationshipTime.years > 1 ? 's' : ''}`}
                {relationshipTime.months > 0 && ` ${relationshipTime.months} mes${relationshipTime.months > 1 ? 'es' : ''}`}
                {relationshipTime.days > 0 && ` ${relationshipTime.days} dia${relationshipTime.days > 1 ? 's' : ''}`}
                {` (${relationshipTime.totalDays} dias) 🎉`}
              </p>
            )}
          </div>
          
          {/* Current or Next Travel Info */}
          {(currentTravel || nextTravel) && (
            <div className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              {currentTravel ? (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Plane className="text-blue-600 mr-2" size={20} />
                    <span className="font-medium text-blue-900">Viagem Atual</span>
                  </div>
                  <p className="font-bold text-blue-900">{currentTravel.name}</p>
                  <p className="text-sm text-blue-700">{currentTravel.destination}</p>
                </div>
              ) : nextTravel && (
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Plane className="text-purple-600 mr-2" size={20} />
                    <span className="font-medium text-purple-900">Próxima Viagem</span>
                  </div>
                  <p className="font-bold text-purple-900">{nextTravel.name}</p>
                  <p className="text-sm text-purple-700">{nextTravel.destination}</p>
                  <p className="text-xs text-purple-600 mt-1">
                    {new Date(nextTravel.startDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {state.events.length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Eventos</div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            {state.wishItems.length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Desejos</div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            {state.notes.length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Anotações</div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
            {state.photos.length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Fotos</div>
        </div>

        {/* Nova estatística de viagens */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
            {state.travels.length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Viagens</div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            {completedTravels.length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Realizadas</div>
        </div>
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

      {/* Upcoming Travels Section */}
      {upcomingTravels.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Próximas Viagens</h2>
            <Plane className="text-gray-500" size={20} />
          </div>
          
          <div className="space-y-3">
            {upcomingTravels.slice(0, 3).map((travel) => (
              <div key={travel.id} className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{travel.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin size={14} className="mr-1" />
                    {travel.destination}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(travel.startDate).toLocaleDateString('pt-BR')} - {new Date(travel.endDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="w-3 h-3 rounded-full bg-blue-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Eventos por Período</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              {monthNames.map((month, index) => (
                <option key={index + 1} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>

          {filteredEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              Nenhum evento em {monthNames[selectedMonth - 1]} de {selectedYear}.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredEvents.map((event) => (
                <div key={event.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(event.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    event.type === 'anniversary' ? 'bg-rose-500' :
                    event.type === 'trip' ? 'bg-blue-500' :
                    event.type === 'date' ? 'bg-purple-500' : 'bg-gray-500'
                  }`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Priority Wishes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Desejos Prioritários</h2>
          
          {priorityWishes.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              Nenhum desejo de alta prioridade no momento.
            </p>
          ) : (
            <div className="space-y-3">
              {priorityWishes.map((wish) => (
                <div key={wish.id} className="flex items-center p-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{wish.title}</h4>
                    <div className="flex items-center mt-1">
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium mr-2">
                        Alta Prioridade
                      </span>
                      <span className="text-xs text-gray-500">
                        {wish.category}
                      </span>
                    </div>
                  </div>
                  <Star className="text-rose-500" size={20} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Photos */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Fotos Recentes</h2>
          
          {recentPhotos.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              Nenhuma foto ainda. Que tal adicionar algumas memórias?
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {recentPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-medium text-center px-1">
                      {photo.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notes */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Anotações Recentes</h2>
          
          {recentNotes.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              Nenhuma anotação ainda. Registrem seus pensamentos!
            </p>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div key={note.id} className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-1">{note.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{note.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(note.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Event Modal */}
      {showQuickEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Evento Rápido</h3>
                <button
                  onClick={() => setShowQuickEventModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleQuickEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={quickEventForm.title}
                    onChange={(e) => setQuickEventForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome do evento"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={quickEventForm.description}
                    onChange={(e) => setQuickEventForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Descrição opcional"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data
                    </label>
                    <input
                      type="date"
                      value={quickEventForm.date}
                      onChange={(e) => setQuickEventForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={quickEventForm.type}
                      onChange={(e) => setQuickEventForm(prev => ({ ...prev, type: e.target.value as Event['type'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="date">Encontro</option>
                      <option value="anniversary">Aniversário</option>
                      <option value="trip">Viagem</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowQuickEventModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Criar Evento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Quick Wish Modal */}
      {showQuickWishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Desejo Rápido</h3>
                <button
                  onClick={() => setShowQuickWishModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleQuickWish} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={quickWishForm.title}
                    onChange={(e) => setQuickWishForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="O que desejam fazer?"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria
                    </label>
                    <select
                      value={quickWishForm.category}
                      onChange={(e) => setQuickWishForm(prev => ({ ...prev, category: e.target.value as WishItem['category'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    >
                      <option value="travel">Viagem</option>
                      <option value="restaurant">Restaurante</option>
                      <option value="activity">Atividade</option>
                      <option value="dream">Sonho</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridade
                    </label>
                    <select
                      value={quickWishForm.priority}
                      onChange={(e) => setQuickWishForm(prev => ({ ...prev, priority: e.target.value as WishItem['priority'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowQuickWishModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                  >
                    Adicionar Desejo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Quick Note Modal */}
      {showQuickNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Anotação Rápida</h3>
                <button
                  onClick={() => setShowQuickNoteModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleQuickNote} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={quickNoteForm.title}
                    onChange={(e) => setQuickNoteForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Título da anotação"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conteúdo
                  </label>
                  <textarea
                    value={quickNoteForm.content}
                    onChange={(e) => setQuickNoteForm(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={4}
                    placeholder="Escreva sua anotação aqui..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowQuickNoteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Salvar Anotação
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Quick Photo Modal */}
      {showQuickPhotoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Foto Rápida</h3>
                <button
                  onClick={() => setShowQuickPhotoModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleQuickPhoto} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={quickPhotoForm.title}
                    onChange={(e) => setQuickPhotoForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Título da foto"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={quickPhotoForm.description}
                    onChange={(e) => setQuickPhotoForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    rows={3}
                    placeholder="Descreva o momento..."
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    📷 Upload simulado (versão demo)
                  </p>
                  <p className="text-xs text-gray-500">
                    Uma foto de exemplo será adicionada automaticamente para demonstração.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowQuickPhotoModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Adicionar Foto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}