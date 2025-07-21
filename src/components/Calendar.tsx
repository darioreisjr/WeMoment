import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Event } from '../types';
import { ChevronLeft, ChevronRight, Plus, X, MapPin, Calendar as CalendarIcon, Edit3, Trash2, MoreHorizontal } from 'lucide-react';

export default function Calendar() {
  const { state, dispatch } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    location: '',
    type: 'date' as Event['type'],
  });

  const today = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  const days = [];
  const current = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'July', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return state.events.filter(event => event.date.startsWith(dateStr));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      location: '',
      type: 'date',
    });
    setShowEventModal(true);
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique no evento dispare o clique na data
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setSelectedDate(new Date(event.date));
    setEventForm({
      title: event.title,
      description: event.description,
      location: event.location || '',
      type: event.type,
    });
    setShowEventDetailsModal(false);
    setShowEventModal(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      dispatch({ type: 'DELETE_EVENT', payload: eventId });
      
      // Add notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          title: 'Evento excluído',
          message: `O evento foi removido do calendário`,
          type: 'event',
          date: new Date().toISOString(),
          read: false,
          createdAt: new Date().toISOString(),
        },
      });
      
      setShowEventDetailsModal(false);
    }
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !state.auth.user) return;

    if (editingEvent) {
      // Atualizar evento existente
      const updatedEvent: Event = {
        ...editingEvent,
        title: eventForm.title,
        description: eventForm.description,
        location: eventForm.location,
        type: eventForm.type,
        date: selectedDate.toISOString(),
      };

      dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent });
      
      // Add notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          title: 'Evento atualizado!',
          message: `${eventForm.title} foi atualizado com sucesso`,
          type: 'event',
          date: selectedDate.toISOString(),
          read: false,
          createdAt: new Date().toISOString(),
        },
      });
    } else {
      // Criar novo evento
      const newEvent: Event = {
        id: Date.now().toString(),
        title: eventForm.title,
        description: eventForm.description,
        location: eventForm.location,
        type: eventForm.type,
        date: selectedDate.toISOString(),
        createdBy: state.auth.user.id,
        createdAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_EVENT', payload: newEvent });
      
      // Add notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now().toString(),
          title: 'Novo evento criado!',
          message: `${eventForm.title} foi adicionado ao calendário para ${selectedDate.toLocaleDateString('pt-BR')}`,
          type: 'event',
          date: selectedDate.toISOString(),
          read: false,
          createdAt: new Date().toISOString(),
        },
      });
    }

    setShowEventModal(false);
    setEditingEvent(null);
    setEventForm({
      title: '',
      description: '',
      location: '',
      type: 'date',
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'anniversary':
        return 'bg-rose-500';
      case 'trip':
        return 'bg-blue-500';
      case 'date':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventTypeColorLight = (type: Event['type']) => {
    switch (type) {
      case 'anniversary':
        return 'bg-rose-100 hover:bg-rose-200';
      case 'trip':
        return 'bg-blue-100 hover:bg-blue-200';
      case 'date':
        return 'bg-purple-100 hover:bg-purple-200';
      default:
        return 'bg-gray-100 hover:bg-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
          Calendário
        </h1>
        <button
          onClick={() => {
            setSelectedDate(new Date());
            setEditingEvent(null);
            setEventForm({
              title: '',
              description: '',
              location: '',
              type: 'date',
            });
            setShowEventModal(true);
          }}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
        >
          <Plus className="mr-2" size={20} />
          Novo Evento
        </button>
      </div>

      {/* Calendar Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const events = getEventsForDate(day);
            const isToday = day.toDateString() === today.toDateString();
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            
            return (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                className={`p-2 min-h-[100px] cursor-pointer rounded-lg transition-all hover:bg-rose-50 ${
                  !isCurrentMonth ? 'text-gray-300' : 'text-gray-900'
                } ${isToday ? 'bg-rose-100 ring-2 ring-rose-500' : ''}`}
              >
                <div className="text-sm font-medium mb-1">{day.getDate()}</div>
                <div className="space-y-1">
                  {events.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => handleEventClick(event, e)}
                      className={`text-xs px-2 py-1 rounded text-white cursor-pointer transition-all ${getEventTypeColor(event.type)} hover:opacity-80`}
                      title={event.title}
                    >
                      {event.title.length > 12 ? `${event.title.substring(0, 12)}...` : event.title}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{events.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventDetailsModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Detalhes do Evento</h3>
              <button
                onClick={() => setShowEventDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium text-white ${getEventTypeColor(selectedEvent.type)}`}>
                    {selectedEvent.type === 'anniversary' ? 'Aniversário' :
                     selectedEvent.type === 'trip' ? 'Viagem' :
                     selectedEvent.type === 'date' ? 'Encontro' : 'Outro'}
                  </span>
                </div>
                <h4 className="text-xl font-semibold text-gray-900">{selectedEvent.title}</h4>
              </div>

              {selectedEvent.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <p className="text-gray-600">{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.location && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                  <div className="flex items-center space-x-1">
                    <MapPin size={16} className="text-gray-500" />
                    <p className="text-gray-600">{selectedEvent.location}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <div className="flex items-center space-x-1">
                  <CalendarIcon size={16} className="text-gray-500" />
                  <p className="text-gray-600">
                    {new Date(selectedEvent.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      weekday: 'long'
                    })}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Criado por</label>
                <p className="text-gray-600">
                  {state.auth.user?.id === selectedEvent.createdBy ? 
                    `${state.auth.user?.firstName} ${state.auth.user?.lastName}` : 
                    `${state.auth.partner?.firstName} ${state.auth.partner?.lastName}`
                  }
                </p>
              </div>
            </div>

            <div className="flex space-x-3 pt-6">
              <button
                onClick={() => handleEditEvent(selectedEvent)}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                <Edit3 className="mr-2" size={16} />
                Editar
              </button>
              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
              >
                <Trash2 className="mr-2" size={16} />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Modal (Create/Edit) */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingEvent ? 'Editar Evento' : 'Novo Evento'} - {selectedDate?.toLocaleDateString('pt-BR')}
              </h3>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setEditingEvent(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Local
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Onde será?"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Evento
                </label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as Event['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
                  onClick={() => {
                    setShowEventModal(false);
                    setEditingEvent(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
                >
                  {editingEvent ? 'Salvar Alterações' : 'Criar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}