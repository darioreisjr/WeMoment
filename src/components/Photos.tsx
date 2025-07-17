import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Photo } from '../types';
import { Camera, Plus, X, Upload, Calendar, User, Trash2 } from 'lucide-react';

export default function Photos() {
  const { state, dispatch } = useApp();
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photoForm, setPhotoForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
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

  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.auth.user) return;

    // Simulate photo upload by using a random mock photo
    const randomPhoto = mockPhotos[Math.floor(Math.random() * mockPhotos.length)];

    const newPhoto: Photo = {
      id: Date.now().toString(),
      url: randomPhoto,
      title: photoForm.title,
      description: photoForm.description,
      date: photoForm.date,
      uploadedBy: state.auth.user.id,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_PHOTO', payload: newPhoto });
    
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
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleDeletePhoto = (photoId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta foto?')) {
      dispatch({ type: 'DELETE_PHOTO', payload: photoId });
    }
  };

  const openPhotoModal = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
          Galeria de Fotos
        </h1>
        <button
          onClick={() => setShowPhotoModal(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
        >
          <Plus className="mr-2" size={20} />
          Adicionar Foto
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Fotos</p>
              <p className="text-2xl font-bold text-gray-900">{state.photos.length}</p>
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
        {state.photos.length === 0 ? (
          <div className="text-center py-16">
            <Camera className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">Nenhuma foto ainda</p>
            <p className="text-gray-400 mt-2">Comecem a registrar seus momentos especiais!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {state.photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-48 object-cover rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => openPhotoModal(photo)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg transition-all">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="font-medium truncate">{photo.title}</p>
                    <p className="text-sm text-gray-200 truncate">{photo.description}</p>
                    <p className="text-xs text-gray-300 mt-1">
                      {new Date(photo.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                  placeholder="Conte sobre este momento especial..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data da Foto
                </label>
                <input
                  type="date"
                  value={photoForm.date}
                  onChange={(e) => setPhotoForm({ ...photoForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-center">
                  <Upload className="text-gray-400 mr-2" size={20} />
                  <span className="text-sm text-gray-600">
                    Simulação: Uma foto aleatória será adicionada
                  </span>
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
                  Adicionar Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{selectedPhoto.title}</h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.title}
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                  <p className="text-gray-600">{selectedPhoto.description || 'Sem descrição'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Data</h4>
                  <p className="text-gray-600">
                    {new Date(selectedPhoto.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Adicionado por</h4>
                  <p className="text-gray-600">
                    {state.auth.user?.id === selectedPhoto.uploadedBy ? 
                      state.auth.user?.name : 
                      state.auth.partner?.name
                    }
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Adicionado em</h4>
                  <p className="text-gray-600">
                    {new Date(selectedPhoto.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}