import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { Photo } from '../types';
import { Camera, Plus, X, Upload, Calendar, User, Trash2, Edit3, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export default function Photos() {
  const { state, dispatch } = useApp();
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCalendarFilter, setShowCalendarFilter] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [photoForm, setPhotoForm] = useState({
    title: '',
    description: '',
  });

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
  });

  // Mock photos from Pexels for demonstration
  const mockPhotos = [
    'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1024994/pexels-photo-1024994.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1024995/pexels-photo-1024995.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1024996/pexels-photo-1024996.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1024997/pexels-photo-1024997.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1024998/pexels-photo-1024998.jpeg?auto=compress&cs=tinysrgb&w=800',
  ];

  // Filtrar fotos por data selecionada
  const filteredPhotos = useMemo(() => {
    if (!selectedDate) return state.photos;
    return state.photos.filter(photo => photo.date === selectedDate);
  }, [state.photos, selectedDate]);

  // Gerar dados do calendário
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Primeiro dia do mês e último dia do mês
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Primeiro dia da semana (domingo = 0)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Último dia da semana
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasPhotos = state.photos.some(photo => photo.date === dateStr);
      const isCurrentMonth = currentDate.getMonth() === month;
      
      days.push({
        date: new Date(currentDate),
        dateStr,
        hasPhotos,
        isCurrentMonth,
        isToday: dateStr === new Date().toISOString().split('T')[0]
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [currentMonth, state.photos]);

  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.auth.user) return;

    // Usar a data atual automaticamente
    const today = new Date().toISOString().split('T')[0];
    
    // Simulate photo upload by using a random mock photo
    const randomPhoto = mockPhotos[Math.floor(Math.random() * mockPhotos.length)];

    const newPhoto: Photo = {
      id: Date.now().toString(),
      url: randomPhoto,
      title: photoForm.title,
      description: photoForm.description,
      date: today, // Data automática do dia atual
      uploadedBy: state.auth.user.id,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_PHOTO', payload: newPhoto });
    
    toast.success(`Foto "${photoForm.title}" adicionada! 📸`, {
      duration: 3000,
    });
    
    // Add notification
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        title: 'Nova foto adicionada!',
        message: `"${photoForm.title}" foi adicionada à galeria`,
        type: 'achievement',
        date: new Date().toISOString(),
        read: false,
        createdAt: new Date().toISOString(),
      },
    });

    setShowPhotoModal(false);
    setPhotoForm({
      title: '',
      description: '',
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    const updatedPhoto: Photo = {
      ...editingPhoto,
      title: editForm.title,
      description: editForm.description,
    };

    dispatch({ type: 'UPDATE_PHOTO', payload: updatedPhoto });
    
    toast.success(`Foto "${editForm.title}" atualizada! ✏️`, {
      duration: 3000,
    });

    setShowEditModal(false);
    setEditingPhoto(null);
    setEditForm({ title: '', description: '' });
  };

  const handleDeletePhoto = (photoId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta foto?')) {
      dispatch({ type: 'DELETE_PHOTO', payload: photoId });
      
      toast.success('Foto excluída com sucesso! 🗑️', {
        duration: 2000,
      });
    }
  };

  const openPhotoModal = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowViewModal(true);
  };

  const openEditModal = (photo: Photo) => {
    setEditingPhoto(photo);
    setEditForm({
      title: photo.title,
      description: photo.description,
    });
    setShowEditModal(true);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
    setShowCalendarFilter(false);
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  const getUploadedByName = (userId: string) => {
    if (state.auth.user?.id === userId) {
      return `${state.auth.user.firstName} ${state.auth.user.lastName}`;
    }
    if (state.auth.partner?.id === userId) {
      return `${state.auth.partner.firstName} ${state.auth.partner.lastName}`;
    }
    return 'Desconhecido';
  };

  return (
    <div className="space-y-6">
      {/* Header - Layout Responsivo */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
          Galeria de Fotos
        </h1>
        
        {/* Botões - Desktop: lado a lado, Mobile: abaixo do título */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={() => setShowCalendarFilter(true)}
            className="flex items-center justify-center px-4 py-3 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm sm:text-base"
          >
            <Filter className="mr-2" size={20} />
            Filtrar por Data
          </button>
          <button
            onClick={() => setShowPhotoModal(true)}
            className="flex items-center justify-center px-4 py-3 sm:py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all text-sm sm:text-base"
          >
            <Plus className="mr-2" size={20} />
            Adicionar Foto
          </button>
        </div>
      </div>

      {/* Filtro Ativo */}
      {selectedDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="text-blue-600 mr-2" size={20} />
              <span className="text-blue-800 font-medium">
                Mostrando fotos de: {new Date(selectedDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <button
              onClick={clearDateFilter}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Limpar filtro
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Fotos</p>
              <p className="text-2xl font-bold text-gray-900">{filteredPhotos.length}</p>
            </div>
            <Camera className="text-emerald-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Este Mês</p>
              <p className="text-2xl font-bold text-blue-600">
                {state.photos.filter(p => 
                  new Date(p.createdAt).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
            <Calendar className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Últimas 7 Dias</p>
              <p className="text-2xl font-bold text-purple-600">
                {state.photos.filter(p => 
                  new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
              </p>
            </div>
            <User className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {selectedDate ? 'Nenhuma foto nesta data' : 'Nenhuma foto ainda'}
            </h3>
            <p className="text-gray-500">
              {selectedDate 
                ? 'Tente selecionar outra data no calendário' 
                : 'Comecem a registrar seus momentos especiais!'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPhotos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => openPhotoModal(photo)}
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium">Clique para ampliar</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{photo.title}</h3>
                  {photo.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{photo.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{new Date(photo.date).toLocaleDateString('pt-BR')}</span>
                    <span>Por {getUploadedByName(photo.uploadedBy)}</span>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => openEditModal(photo)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar foto"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir foto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Visualização Ampliada */}
      {showViewModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full w-full">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <X size={24} />
            </button>
            
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl max-h-full">
              <div className="relative">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="w-full max-h-[70vh] object-contain"
                />
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedPhoto.title}</h2>
                {selectedPhoto.description && (
                  <p className="text-gray-600 mb-4">{selectedPhoto.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Data: {new Date(selectedPhoto.date).toLocaleDateString('pt-BR')}</span>
                  <span>Adicionada por: {getUploadedByName(selectedPhoto.uploadedBy)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Filtro por Calendário */}
      {showCalendarFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Filtrar por Data</h3>
              <button
                onClick={() => setShowCalendarFilter(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Header do Calendário */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h4 className="text-lg font-semibold">
                {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h4>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Dias da Semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendário */}
            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((day, index) => (
                <button
                  key={index}
                  onClick={() => day.isCurrentMonth ? handleDateSelect(day.dateStr) : null}
                  disabled={!day.isCurrentMonth}
                  className={`
                    relative p-2 text-sm transition-all rounded-lg
                    ${!day.isCurrentMonth 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'hover:bg-gray-100 cursor-pointer'
                    }
                    ${day.isToday ? 'bg-blue-100 text-blue-600 font-bold' : ''}
                    ${selectedDate === day.dateStr ? 'bg-rose-500 text-white' : ''}
                    ${day.hasPhotos && day.isCurrentMonth ? 'font-bold' : ''}
                  `}
                >
                  {day.date.getDate()}
                  {day.hasPhotos && day.isCurrentMonth && (
                    <div className={`
                      absolute bottom-1 right-1 w-2 h-2 rounded-full
                      ${selectedDate === day.dateStr ? 'bg-white' : 'bg-rose-500'}
                    `} />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <div className="flex items-center mb-1">
                <div className="w-2 h-2 bg-rose-500 rounded-full mr-2"></div>
                <span>Dias com fotos</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span>Hoje</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Adicionar Foto</h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePhotoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Foto
                </label>
                <input
                  type="text"
                  value={photoForm.title}
                  onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Dê um título para este momento"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={photoForm.description}
                  onChange={(e) => setPhotoForm({ ...photoForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descreva este momento especial..."
                />
              </div>

              <div className="bg-rose-50 p-4 rounded-lg">
                <div className="flex items-center justify-center text-rose-600">
                  <Calendar className="mr-2" size={20} />
                  <span className="text-sm">Data será automaticamente hoje: {new Date().toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="bg-rose-50 p-4 rounded-lg">
                <div className="flex items-center justify-center text-rose-600">
                  <Camera className="mr-2" size={20} />
                  <span className="text-sm">Uma foto aleatória será adicionada</span>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(false)}
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

      {/* Edit Photo Modal */}
      {showEditModal && editingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Editar Foto</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Foto
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Título da foto"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descrição da foto..."
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center text-blue-600 text-sm">
                  <Calendar className="mr-2" size={16} />
                  <span>Data da foto: {new Date(editingPhoto.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="text-blue-500 text-xs mt-1">
                  A data não pode ser alterada
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}