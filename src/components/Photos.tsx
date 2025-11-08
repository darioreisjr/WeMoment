import React, { useState, useMemo, useRef } from 'react';
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

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoForm, setPhotoForm] = useState({
    title: '',
    description: '',
  });

  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
  });

  // CORREÇÃO: Ordena as fotos pela data de criação e filtra usando 'created_at'.
  const filteredPhotos = useMemo(() => {
    const sortedPhotos = [...state.photos].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (!selectedDate) return sortedPhotos;
    // A data selecionada (YYYY-MM-DD) é comparada com o início da string de data completa (created_at).
    return sortedPhotos.filter(photo => photo.created_at.startsWith(selectedDate));
  }, [state.photos, selectedDate]);


  // CORREÇÃO: Gera os dados do calendário verificando a existência de fotos com base em 'created_at'.
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    const days = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      // Verifica se existe alguma foto cuja data de criação comece com a data do dia no calendário.
      const hasPhotos = state.photos.some(photo => photo.created_at.startsWith(dateStr));
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile || !photoForm.title.trim() || !state.auth.token) {
      toast.error('Por favor, selecione uma foto e preencha o título.');
      return;
    }

    const formData = new FormData();
    formData.append('photo', photoFile);
    formData.append('title', photoForm.title);
    formData.append('description', photoForm.description);

    const loadingToast = toast.loading('Enviando foto...');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.auth.token}`,
        },
        body: formData,
      });

      const newPhoto = await response.json();

      if (!response.ok) {
        throw new Error(newPhoto.error || 'Falha ao enviar a foto.');
      }

      dispatch({ type: 'ADD_PHOTO', payload: newPhoto });
      toast.success(`Foto "${newPhoto.title}" adicionada! 📸`, { id: loadingToast });
      
      setShowPhotoModal(false);
      setPhotoForm({ title: '', description: '' });
      setPhotoFile(null);
      setPreviewUrl(null);
    } catch (error) {
      toast.error((error as Error).message, { id: loadingToast });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto || !state.auth.token) return;

    const loadingToast = toast.loading('Salvando alterações...');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/photos/${editingPhoto.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.auth.token}`,
        },
        body: JSON.stringify(editForm),
      });

      const updatedPhoto = await response.json();

      if (!response.ok) {
        throw new Error(updatedPhoto.error || 'Falha ao atualizar a foto.');
      }
      
      dispatch({ type: 'UPDATE_PHOTO', payload: updatedPhoto });
      toast.success(`Foto "${updatedPhoto.title}" atualizada! ✏️`, { id: loadingToast });

      setShowEditModal(false);
      setEditingPhoto(null);
    } catch (error) {
      toast.error((error as Error).message, { id: loadingToast });
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta foto?')) {
      if (!state.auth.token) return;

      const loadingToast = toast.loading('Excluindo foto...');

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/photos/${photoId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${state.auth.token}` },
        });

        if (!response.ok) {
          throw new Error('Falha ao excluir a foto.');
        }

        dispatch({ type: 'DELETE_PHOTO', payload: photoId });
        toast.success('Foto excluída com sucesso! 🗑️', { id: loadingToast });
      } catch (error) {
        toast.error((error as Error).message, { id: loadingToast });
      }
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
      description: photo.description || '',
    });
    setShowEditModal(true);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'prev' ? -1 : 1));
    setCurrentMonth(newMonth);
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
    setShowCalendarFilter(false);
  };

  const clearDateFilter = () => setSelectedDate(null);

  const getUploadedByName = (userId: string) => {
    if (state.auth.user?.id === userId) return `${state.auth.user.firstName} ${state.auth.user.lastName}`;
    if (state.auth.partner?.id === userId) return `${state.auth.partner.firstName} ${state.auth.partner.lastName}`;
    return 'Desconhecido';
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id);
    if (currentIndex === -1) return;

    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % filteredPhotos.length;
    } else {
      nextIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    }
    
    setSelectedPhoto(filteredPhotos[nextIndex]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Galeria de Fotos</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setShowCalendarFilter(true)} className="flex items-center justify-center px-4 py-3 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm sm:text-base"><Filter className="mr-2" size={20} />Filtrar por Data</button>
          <button onClick={() => setShowPhotoModal(true)} className="flex items-center justify-center px-4 py-3 sm:py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all text-sm sm:text-base"><Plus className="mr-2" size={20} />Adicionar Foto</button>
        </div>
      </div>

      {/* Filtro Ativo */}
      {selectedDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center"><Calendar className="text-blue-600 mr-2" size={20} /><span className="text-blue-800 font-medium">Mostrando fotos de: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span></div>
            <button onClick={clearDateFilter} className="text-blue-600 hover:text-blue-800 underline">Limpar filtro</button>
        </div>
      )}

      {/* Photos Grid */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-12"><Camera className="mx-auto text-gray-400 mb-4" size={64} /><h3 className="text-xl font-semibold text-gray-600 mb-2">{selectedDate ? 'Nenhuma foto nesta data' : 'Nenhuma foto ainda'}</h3><p className="text-gray-500">{selectedDate ? 'Tente selecionar outra data no calendário' : 'Comecem a registrar seus momentos especiais!'}</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPhotos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative group cursor-pointer" onClick={() => openPhotoModal(photo)}>
                  <img src={photo.url} alt={photo.title} className="w-full h-48 object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center"><div className="text-white opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-sm font-medium">Clique para ampliar</span></div></div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{photo.title}</h3>
                  {photo.description && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{photo.description}</p>}
                  {/* CORREÇÃO: Exibe a data usando 'created_at' */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3"><span>{new Date(photo.created_at).toLocaleDateString('pt-BR')}</span><span>Por {getUploadedByName(photo.user_id)}</span></div>
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => openEditModal(photo)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar foto"><Edit3 size={16} /></button>
                    <button onClick={() => handleDeletePhoto(photo.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir foto"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Visualização Ampliada */}
      {showViewModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={() => setShowViewModal(false)}>
          <div className="relative max-w-4xl max-h-full w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute -top-10 right-0 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all"
            >
              <X size={24} />
            </button>
            
            {/* Botão de Navegação - Anterior */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNavigation('prev');
              }}
              className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-black bg-opacity-30 text-white rounded-full hover:bg-opacity-50 transition-all"
              title="Foto anterior"
            >
              <ChevronLeft size={28} />
            </button>

            {/* Botão de Navegação - Próxima */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNavigation('next');
              }}
              className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-black bg-opacity-30 text-white rounded-full hover:bg-opacity-50 transition-all"
              title="Próxima foto"
            >
              <ChevronRight size={28} />
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
                {/* CORREÇÃO: Exibe a data de criação no modal */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Data: {new Date(selectedPhoto.created_at).toLocaleDateString('pt-BR')}</span>
                  <span>Adicionada por: {getUploadedByName(selectedPhoto.user_id)}</span>
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
            </div>
          </div>
        </div>
      )}

       {/* Modal de Adicionar Foto */}
       {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-gray-900">Adicionar Foto</h3><button onClick={() => setShowPhotoModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button></div>
            <form onSubmit={handlePhotoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Arquivo da Foto</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="space-y-1 text-center">
                    {previewUrl ? (<img src={previewUrl} alt="Pré-visualização" className="mx-auto h-24 w-auto"/>) : (<Upload className="mx-auto h-12 w-12 text-gray-400" />)}
                    <div className="flex text-sm text-gray-600"><p className="pl-1">{photoFile ? photoFile.name : 'Clique para selecionar uma imagem'}</p></div>
                  </div>
                  <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Título da Foto</label><input type="text" value={photoForm.title} onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent" placeholder="Dê um título para este momento" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label><textarea value={photoForm.description} onChange={(e) => setPhotoForm({ ...photoForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent" rows={3} placeholder="Descreva este momento especial..."/></div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowPhotoModal(false)} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Photo Modal */}
      {showEditModal && editingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-gray-900">Editar Foto</h3><button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button></div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
            <img src={editingPhoto.url} alt="Pré-visualização" className="w-full h-48 object-cover rounded-lg"/>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Título da Foto</label><input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label><textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={3}/></div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}