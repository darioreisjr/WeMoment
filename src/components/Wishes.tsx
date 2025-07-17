import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WishItem } from '../types';
import { Heart, Plus, X, Check, Star, MapPin } from 'lucide-react';

export default function Wishes() {
  const { state, dispatch } = useApp();
  const [showWishModal, setShowWishModal] = useState(false);
  const [wishForm, setWishForm] = useState({
    title: '',
    description: '',
    category: 'activity' as WishItem['category'],
    priority: 'medium' as WishItem['priority'],
  });

  const handleWishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.auth.user) return;

    const newWish: WishItem = {
      id: Date.now().toString(),
      title: wishForm.title,
      description: wishForm.description,
      category: wishForm.category,
      priority: wishForm.priority,
      completed: false,
      createdBy: state.auth.user.id,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_WISH_ITEM', payload: newWish });
    
    // Add notification
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        title: 'Novo desejo adicionado!',
        message: `"${wishForm.title}" foi adicionado à lista de desejos`,
        type: 'achievement',
        date: new Date().toISOString(),
        read: false,
        createdAt: new Date().toISOString(),
      },
    });

    setShowWishModal(false);
    setWishForm({
      title: '',
      description: '',
      category: 'activity',
      priority: 'medium',
    });
  };

  const toggleWishCompleted = (wishId: string) => {
    const wish = state.wishItems.find(w => w.id === wishId);
    if (wish) {
      const updatedWish = { ...wish, completed: !wish.completed };
      dispatch({ type: 'UPDATE_WISH_ITEM', payload: updatedWish });
      
      if (updatedWish.completed) {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now().toString(),
            title: 'Desejo realizado! 🎉',
            message: `Parabéns! Vocês realizaram: "${wish.title}"`,
            type: 'achievement',
            date: new Date().toISOString(),
            read: false,
            createdAt: new Date().toISOString(),
          },
        });
      }
    }
  };

  const getCategoryIcon = (category: WishItem['category']) => {
    switch (category) {
      case 'travel':
        return '✈️';
      case 'restaurant':
        return '🍽️';
      case 'activity':
        return '🎯';
      case 'dream':
        return '💭';
      default:
        return '📝';
    }
  };

  const getPriorityColor = (priority: WishItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = [
    { value: 'travel', label: 'Viagem', icon: '✈️' },
    { value: 'restaurant', label: 'Restaurante', icon: '🍽️' },
    { value: 'activity', label: 'Atividade', icon: '🎯' },
    { value: 'dream', label: 'Sonho', icon: '💭' },
    { value: 'other', label: 'Outro', icon: '📝' },
  ];

  const completedWishes = state.wishItems.filter(w => w.completed);
  const pendingWishes = state.wishItems.filter(w => !w.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
          Lista de Desejos
        </h1>
        <button
          onClick={() => setShowWishModal(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
        >
          <Plus className="mr-2" size={20} />
          Novo Desejo
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Desejos</p>
              <p className="text-2xl font-bold text-gray-900">{state.wishItems.length}</p>
            </div>
            <Heart className="text-rose-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Realizados</p>
              <p className="text-2xl font-bold text-green-600">{completedWishes.length}</p>
            </div>
            <Check className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-orange-600">{pendingWishes.length}</p>
            </div>
            <Star className="text-orange-500" size={32} />
          </div>
        </div>
      </div>

      {/* Pending Wishes */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Desejos Pendentes</h2>
        {pendingWishes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum desejo pendente. Que tal adicionar algo especial que querem fazer juntos?
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingWishes.map((wish) => (
              <div key={wish.id} className="p-4 border-2 border-gray-200 rounded-lg hover:border-rose-300 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getCategoryIcon(wish.category)}</span>
                    <h3 className="font-semibold text-gray-900">{wish.title}</h3>
                  </div>
                  <button
                    onClick={() => toggleWishCompleted(wish.id)}
                    className="p-1 rounded-full hover:bg-green-100 transition-colors"
                  >
                    <Check className="text-green-600" size={20} />
                  </button>
                </div>
                <p className="text-gray-600 text-sm mb-3">{wish.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(wish.priority)}`}>
                    {wish.priority === 'high' ? 'Alta' : wish.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(wish.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Wishes */}
      {completedWishes.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Desejos Realizados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedWishes.map((wish) => (
              <div key={wish.id} className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getCategoryIcon(wish.category)}</span>
                    <h3 className="font-semibold text-gray-900">{wish.title}</h3>
                  </div>
                  <Check className="text-green-600" size={20} />
                </div>
                <p className="text-gray-600 text-sm mb-3">{wish.description}</p>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Realizado
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(wish.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wish Modal */}
      {showWishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Novo Desejo</h3>
              <button
                onClick={() => setShowWishModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleWishSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={wishForm.title}
                  onChange={(e) => setWishForm({ ...wishForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="O que vocês querem fazer?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={wishForm.description}
                  onChange={(e) => setWishForm({ ...wishForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  rows={3}
                  placeholder="Conte mais sobre este desejo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={wishForm.category}
                  onChange={(e) => setWishForm({ ...wishForm, category: e.target.value as WishItem['category'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridade
                </label>
                <select
                  value={wishForm.priority}
                  onChange={(e) => setWishForm({ ...wishForm, priority: e.target.value as WishItem['priority'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWishModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
                >
                  Adicionar Desejo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}