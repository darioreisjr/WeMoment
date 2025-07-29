import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { Travel, TravelChecklist, TravelExpense } from '../types';
import { 
  MapPin, 
  Plus, 
  Calendar,
  Users,
  DollarSign,
  Camera,
  CheckSquare,
  Square,
  Edit3,
  Trash2,
  Clock,
  Plane,
  X,
  Upload,
  Filter,
  Search
} from 'lucide-react';

export default function Travels() {
  const { state, dispatch } = useApp();
  const [showTravelModal, setShowTravelModal] = useState(false);
  const [showTravelDetails, setShowTravelDetails] = useState(false);
  const [selectedTravel, setSelectedTravel] = useState<Travel | null>(null);
  const [editingTravel, setEditingTravel] = useState<Travel | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'completed'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const [travelForm, setTravelForm] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
    estimatedBudget: '',
    participants: [] as string[],
  });

  const [checklistForm, setChecklistForm] = useState({
    item: '',
    category: 'bagagem' as TravelChecklist['category'],
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'transporte' as TravelExpense['category'],
  });

  const [photoForm, setPhotoForm] = useState({
    title: '',
    description: '',
  });

  // Função para determinar status da viagem
  const getTravelStatus = (travel: Travel): 'upcoming' | 'ongoing' | 'completed' => {
    const today = new Date();
    const startDate = new Date(travel.startDate);
    const endDate = new Date(travel.endDate);
    
    if (today < startDate) return 'upcoming';
    if (today >= startDate && today <= endDate) return 'ongoing';
    return 'completed';
  };

  // Filtrar viagens por status e termo de busca
  const filteredTravels = state.travels
    .filter(travel => {
      const matchesTab = getTravelStatus(travel) === activeTab;
      const matchesSearch = travel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           travel.destination.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSubmitTravel = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!travelForm.name.trim() || !travelForm.destination.trim() || 
        !travelForm.startDate || !travelForm.endDate) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    if (new Date(travelForm.startDate) > new Date(travelForm.endDate)) {
      toast.error('Data de início deve ser anterior à data de fim!');
      return;
    }

    const travelData: Travel = {
      id: editingTravel?.id || Date.now().toString(),
      name: travelForm.name.trim(),
      destination: travelForm.destination.trim(),
      startDate: travelForm.startDate,
      endDate: travelForm.endDate,
      description: travelForm.description.trim(),
      estimatedBudget: parseFloat(travelForm.estimatedBudget) || 0,
      participants: [
        ...(state.auth.user ? [state.auth.user.id] : []),
        ...(state.auth.partner ? [state.auth.partner.id] : []),
      ],
      checklist: editingTravel?.checklist || [],
      expenses: editingTravel?.expenses || [],
      photos: editingTravel?.photos || [],
      createdBy: state.auth.user?.id || '',
      createdAt: editingTravel?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingTravel) {
      dispatch({ type: 'UPDATE_TRAVEL', payload: travelData });
      toast.success('Viagem atualizada com sucesso!');
    } else {
      dispatch({ type: 'ADD_TRAVEL', payload: travelData });
      
      // Adicionar evento no calendário
      const calendarEvent = {
        id: `travel-${travelData.id}`,
        title: `🧳 ${travelData.name}`,
        description: `Viagem para ${travelData.destination}`,
        date: travelData.startDate,
        location: travelData.destination,
        type: 'trip' as const,
        createdBy: state.auth.user?.id || '',
        createdAt: new Date().toISOString(),
      };
      
      dispatch({ type: 'ADD_EVENT', payload: calendarEvent });
      toast.success('Viagem criada e adicionada ao calendário!');
    }

    resetTravelForm();
    setShowTravelModal(false);
  };

  const handleDeleteTravel = (travelId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta viagem?')) {
      dispatch({ type: 'DELETE_TRAVEL', payload: travelId });
      
      // Remove também o evento do calendário
      const eventToRemove = state.events.find(event => event.id === `travel-${travelId}`);
      if (eventToRemove) {
        dispatch({ type: 'DELETE_EVENT', payload: eventToRemove.id });
      }
      
      toast.success('Viagem excluída com sucesso!');
      setShowTravelDetails(false);
      setSelectedTravel(null);
    }
  };

  const handleAddChecklist = () => {
    if (!selectedTravel || !checklistForm.item.trim()) {
      toast.error('Preencha o item do checklist!');
      return;
    }

    const newItem: TravelChecklist = {
      id: Date.now().toString(),
      item: checklistForm.item.trim(),
      category: checklistForm.category,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTravel = {
      ...selectedTravel,
      checklist: [...selectedTravel.checklist, newItem],
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'UPDATE_TRAVEL', payload: updatedTravel });
    setSelectedTravel(updatedTravel);
    setChecklistForm({ item: '', category: 'bagagem' });
    toast.success('Item adicionado ao checklist!');
  };

  const handleToggleChecklistItem = (itemId: string) => {
    if (!selectedTravel) return;

    const updatedChecklist = selectedTravel.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const updatedTravel = {
      ...selectedTravel,
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'UPDATE_TRAVEL', payload: updatedTravel });
    setSelectedTravel(updatedTravel);
  };

  const handleAddExpense = () => {
    if (!selectedTravel || !expenseForm.description.trim() || !expenseForm.amount) {
      toast.error('Preencha todos os campos da despesa!');
      return;
    }

    const newExpense: TravelExpense = {
      id: Date.now().toString(),
      description: expenseForm.description.trim(),
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    const updatedTravel = {
      ...selectedTravel,
      expenses: [...selectedTravel.expenses, newExpense],
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'UPDATE_TRAVEL', payload: updatedTravel });
    setSelectedTravel(updatedTravel);
    setExpenseForm({ description: '', amount: '', category: 'transporte' });
    toast.success('Gasto adicionado com sucesso!');
  };

  const handleAddPhoto = () => {
    if (!selectedTravel || !photoForm.title.trim()) {
      toast.error('Preencha pelo menos o título da foto!');
      return;
    }

    // Simular upload de foto (no projeto real seria com FileReader)
    const mockPhotoUrl = `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=800`;

    const newPhoto = {
      id: Date.now().toString(),
      url: mockPhotoUrl,
      title: photoForm.title.trim(),
      description: photoForm.description.trim(),
      date: new Date().toISOString().split('T')[0],
      uploadedBy: state.auth.user?.id || '',
      createdAt: new Date().toISOString(),
    };

    const updatedTravel = {
      ...selectedTravel,
      photos: [...selectedTravel.photos, newPhoto],
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'UPDATE_TRAVEL', payload: updatedTravel });
    setSelectedTravel(updatedTravel);
    setPhotoForm({ title: '', description: '' });
    toast.success('Foto adicionada à viagem!');
  };

  const resetTravelForm = () => {
    setTravelForm({
      name: '',
      destination: '',
      startDate: '',
      endDate: '',
      description: '',
      estimatedBudget: '',
      participants: [],
    });
    setEditingTravel(null);
  };

  const openEditModal = (travel: Travel) => {
    setEditingTravel(travel);
    setTravelForm({
      name: travel.name,
      destination: travel.destination,
      startDate: travel.startDate,
      endDate: travel.endDate,
      description: travel.description,
      estimatedBudget: travel.estimatedBudget.toString(),
      participants: travel.participants,
    });
    setShowTravelModal(true);
    setShowTravelDetails(false);
  };

  const getTotalExpenses = (travel: Travel) => {
    return travel.expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getCompletedChecklistCount = (travel: Travel) => {
    return travel.checklist.filter(item => item.completed).length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'from-blue-500 to-blue-600';
      case 'ongoing': return 'from-emerald-500 to-emerald-600';
      case 'completed': return 'from-gray-500 to-gray-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Futura';
      case 'ongoing': return 'Em Andamento';
      case 'completed': return 'Realizada';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Organizador de Viagens
          </h1>
          <p className="text-gray-600 mt-1">
            Planejem e registrem suas aventuras juntos
          </p>
        </div>
        
        <button
          onClick={() => {
            resetTravelForm();
            setShowTravelModal(true);
          }}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} className="mr-2" />
          Nova Viagem
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou destino..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['upcoming', 'ongoing', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {getStatusLabel(tab)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Travels Grid */}
      {filteredTravels.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-white/20 text-center">
          <Plane className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {activeTab === 'upcoming' && 'Nenhuma viagem futura planejada'}
            {activeTab === 'ongoing' && 'Nenhuma viagem em andamento'}
            {activeTab === 'completed' && 'Nenhuma viagem realizada'}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'upcoming' && 'Que tal planejar uma aventura especial juntos?'}
            {activeTab === 'ongoing' && 'Aproveitem o momento presente!'}
            {activeTab === 'completed' && 'Suas memórias de viagem aparecerão aqui.'}
          </p>
          {activeTab === 'upcoming' && (
            <button
              onClick={() => {
                resetTravelForm();
                setShowTravelModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all"
            >
              Criar Primeira Viagem
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTravels.map((travel) => {
            const status = getTravelStatus(travel);
            const totalExpenses = getTotalExpenses(travel);
            const checklistProgress = getCompletedChecklistCount(travel);
            
            return (
              <div
                key={travel.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => {
                  setSelectedTravel(travel);
                  setShowTravelDetails(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getStatusColor(status)} mb-2`}>
                      {getStatusLabel(status)}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{travel.name}</h3>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin size={14} className="mr-1" />
                      {travel.destination}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={14} className="mr-2" />
                    {new Date(travel.startDate).toLocaleDateString('pt-BR')} - {new Date(travel.endDate).toLocaleDateString('pt-BR')}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <CheckSquare size={14} className="mr-1" />
                      Checklist: {checklistProgress}/{travel.checklist.length}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign size={14} className="mr-1" />
                      R$ {totalExpenses.toFixed(2)}
                    </div>
                  </div>

                  {travel.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {travel.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-500">
                      <Camera size={12} className="mr-1" />
                      {travel.photos.length} fotos
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Users size={12} className="mr-1" />
                      {travel.participants.length} pessoas
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Travel Form Modal */}
      {showTravelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTravel ? 'Editar Viagem' : 'Nova Viagem'}
                </h2>
                <button
                  onClick={() => setShowTravelModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmitTravel} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Viagem *
                  </label>
                  <input
                    type="text"
                    value={travelForm.name}
                    onChange={(e) => setTravelForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Ex: Lua de mel em Paris"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destino *
                  </label>
                  <input
                    type="text"
                    value={travelForm.destination}
                    onChange={(e) => setTravelForm(prev => ({ ...prev, destination: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Ex: Paris, França"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      value={travelForm.startDate}
                      onChange={(e) => setTravelForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Fim *
                    </label>
                    <input
                      type="date"
                      value={travelForm.endDate}
                      onChange={(e) => setTravelForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={travelForm.description}
                    onChange={(e) => setTravelForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    rows={3}
                    placeholder="Descreva os detalhes da viagem..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orçamento Estimado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={travelForm.estimatedBudget}
                    onChange={(e) => setTravelForm(prev => ({ ...prev, estimatedBudget: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTravelModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
                  >
                    {editingTravel ? 'Atualizar' : 'Criar Viagem'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Travel Details Modal */}
      {showTravelDetails && selectedTravel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getStatusColor(getTravelStatus(selectedTravel))} mb-2`}>
                    {getStatusLabel(getTravelStatus(selectedTravel))}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedTravel.name}</h2>
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-1" />
                    {selectedTravel.destination}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(selectedTravel)}
                    className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Edit3 size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteTravel(selectedTravel.id)}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    onClick={() => setShowTravelDetails(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Travel Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="text-blue-600 mr-2" size={20} />
                    <span className="font-medium text-gray-900">Período</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedTravel.startDate).toLocaleDateString('pt-BR')} - {new Date(selectedTravel.endDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <DollarSign className="text-green-600 mr-2" size={20} />
                    <span className="font-medium text-gray-900">Orçamento</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Estimado: R$ {selectedTravel.estimatedBudget.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Gasto: R$ {getTotalExpenses(selectedTravel).toFixed(2)}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Users className="text-purple-600 mr-2" size={20} />
                    <span className="font-medium text-gray-900">Participantes</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedTravel.participants.length} pessoa{selectedTravel.participants.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedTravel.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
                  <p className="text-gray-600 bg-gray-50 rounded-lg p-4">{selectedTravel.description}</p>
                </div>
              )}

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { key: 'checklist', label: 'Checklist', count: selectedTravel.checklist.length },
                    { key: 'expenses', label: 'Gastos', count: selectedTravel.expenses.length },
                    { key: 'photos', label: 'Fotos', count: selectedTravel.photos.length },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap pb-4 px-1 text-sm font-medium"
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </nav>
              </div>

              {/* Checklist Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Checklist de Itens</h3>
                  <button
                    onClick={() => setShowChecklistModal(true)}
                    className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={16} className="mr-1" />
                    Adicionar Item
                  </button>
                </div>

                {selectedTravel.checklist.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum item no checklist ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedTravel.checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <button
                          onClick={() => handleToggleChecklistItem(item.id)}
                          className="mr-3 text-rose-500 hover:text-rose-600"
                        >
                          {item.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                        </button>
                        <div className="flex-1">
                          <span className={`${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {item.item}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.category} • {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expenses Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Controle de Gastos</h3>
                  <button
                    onClick={() => setShowExpenseModal(true)}
                    className="flex items-center px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                  >
                    <Plus size={16} className="mr-1" />
                    Adicionar Gasto
                  </button>
                </div>

                {selectedTravel.expenses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum gasto registrado ainda.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedTravel.expenses.map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="text-gray-900 font-medium">{expense.description}</span>
                          <div className="text-xs text-gray-500 mt-1">
                            {expense.category} • {new Date(expense.date).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <span className="font-semibold text-green-600">
                          R$ {expense.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Photos Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Galeria de Fotos</h3>
                  <button
                    onClick={() => setShowPhotoModal(true)}
                    className="flex items-center px-3 py-1 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors"
                  >
                    <Camera size={16} className="mr-1" />
                    Adicionar Foto
                  </button>
                </div>

                {selectedTravel.photos.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhuma foto da viagem ainda.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedTravel.photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-medium text-center px-2">
                            {photo.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Modal */}
      {showChecklistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Adicionar Item ao Checklist</h3>
                <button
                  onClick={() => setShowChecklistModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item
                  </label>
                  <input
                    type="text"
                    value={checklistForm.item}
                    onChange={(e) => setChecklistForm(prev => ({ ...prev, item: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Passaporte, Protetor solar..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={checklistForm.category}
                    onChange={(e) => setChecklistForm(prev => ({ ...prev, category: e.target.value as TravelChecklist['category'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="bagagem">Bagagem</option>
                    <option value="documentos">Documentos</option>
                    <option value="medicamentos">Medicamentos</option>
                    <option value="eletronicos">Eletrônicos</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowChecklistModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddChecklist}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Adicionar Gasto</h3>
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: Passagem aérea, Hotel..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value as TravelExpense['category'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="transporte">Transporte</option>
                    <option value="hospedagem">Hospedagem</option>
                    <option value="alimentacao">Alimentação</option>
                    <option value="atividades">Atividades</option>
                    <option value="compras">Compras</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowExpenseModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddExpense}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Adicionar Foto</h3>
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título da Foto
                  </label>
                  <input
                    type="text"
                    value={photoForm.title}
                    onChange={(e) => setPhotoForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Vista do hotel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={photoForm.description}
                    onChange={(e) => setPhotoForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Descreva o momento..."
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    📷 Simulação de upload (versão demo)
                  </p>
                  <p className="text-xs text-gray-500">
                    Uma foto de exemplo será adicionada automaticamente para demonstração.
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowPhotoModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddPhoto}
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Adicionar Foto
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}