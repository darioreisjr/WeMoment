import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { Settings, User as UserIcon, Save, Edit3, Mail, Calendar, Upload, Heart, Camera } from 'lucide-react';

export default function SettingsComponent() {
  const { state, dispatch } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  
  // Refs para inputs de arquivo - isso permite acessar o input file de forma programática
  const userAvatarInputRef = useRef<HTMLInputElement>(null);
  const partnerAvatarInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para formulários separando firstName e lastName
  const [userForm, setUserForm] = useState({
    firstName: state.auth.user?.firstName || '',
    lastName: state.auth.user?.lastName || '',
    email: state.auth.user?.email || '',
    gender: state.auth.user?.gender || 'male',
    avatar: state.auth.user?.avatar || '',
  });
  
  const [partnerForm, setPartnerForm] = useState({
    firstName: state.auth.partner?.firstName || '',
    lastName: state.auth.partner?.lastName || '',
    gender: state.auth.partner?.gender || 'female',
    avatar: state.auth.partner?.avatar || '',
  });
  
  // CORREÇÃO: Garantimos que o estado seja inicializado corretamente
  // e sempre reflita o valor atual do contexto global
  const [relationshipStartDate, setRelationshipStartDate] = useState(
    state.auth.relationshipStartDate || ''
  );

  // Função para converter arquivo de imagem para base64
  // Base64 é uma forma de representar dados binários (como imagens) em texto
  const handleImageUpload = (
    file: File, 
    isUser: boolean, 
    callback: (base64: string) => void
  ) => {
    const reader = new FileReader();
    
    // Quando a leitura terminar, convertemos para base64
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      callback(base64);
    };
    
    // Iniciamos a leitura do arquivo como Data URL (que inclui o base64)
    reader.readAsDataURL(file);
  };

  // Função para processar upload de avatar do usuário
  const handleUserAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validação simples do tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Convertemos a imagem para base64 e atualizamos o estado
      handleImageUpload(file, true, (base64) => {
        setUserForm({ ...userForm, avatar: base64 });
      });
    }
  };

  // Função para processar upload de avatar do parceiro
  const handlePartnerAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      handleImageUpload(file, false, (base64) => {
        setPartnerForm({ ...partnerForm, avatar: base64 });
      });
    }
  };

  // Função para calcular tempo de relacionamento
  const calculateRelationshipDuration = () => {
    if (!relationshipStartDate) return null;
    
    const start = new Date(relationshipStartDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    const diffMonths = Math.floor((diffDays % 365) / 30);
    const remainingDays = diffDays % 30;
    
    // Retornamos uma string formatada com o tempo de relacionamento
    if (diffYears > 0) {
      return `${diffYears} ano${diffYears > 1 ? 's' : ''}, ${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'} e ${remainingDays} ${remainingDays === 1 ? 'dia' : 'dias'}`;
    } else if (diffMonths > 0) {
      return `${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'} e ${remainingDays} ${remainingDays === 1 ? 'dia' : 'dias'}`;
    } else {
      return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
    }
  };

  const handleSaveChanges = () => {
    if (!state.auth.user || !state.auth.partner) return;

    // Criamos objetos User atualizados com os novos campos
    const updatedUser: User = {
      ...state.auth.user,
      firstName: userForm.firstName,
      lastName: userForm.lastName,
      email: userForm.email,
      gender: userForm.gender as 'male' | 'female',
      avatar: userForm.avatar,
    };

    const updatedPartner: User = {
      ...state.auth.partner,
      firstName: partnerForm.firstName,
      lastName: partnerForm.lastName,
      gender: partnerForm.gender as 'male' | 'female',
      avatar: partnerForm.avatar,
    };

    // Dispatch das ações para atualizar o estado global
    dispatch({ type: 'UPDATE_USER_PROFILE', payload: updatedUser });
    dispatch({ type: 'UPDATE_PARTNER_PROFILE', payload: updatedPartner });
    
    // CORREÇÃO PRINCIPAL: Sempre fazemos o dispatch da data de relacionamento
    // independentemente de estar vazia ou preenchida. Isso garante que
    // qualquer mudança (incluindo limpeza da data) seja persistida
    dispatch({ type: 'SET_RELATIONSHIP_START_DATE', payload: relationshipStartDate });

    // Notificação de sucesso
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        title: 'Perfis atualizados!',
        message: 'As informações do casal foram atualizadas com sucesso',
        type: 'achievement',
        date: new Date().toISOString(),
        read: false,
        createdAt: new Date().toISOString(),
      },
    });

    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // CORREÇÃO: Resetamos todos os formulários para os valores originais do estado global
    // Isso garante que cancelar sempre volte ao estado atual salvo
    setUserForm({
      firstName: state.auth.user?.firstName || '',
      lastName: state.auth.user?.lastName || '',
      email: state.auth.user?.email || '',
      gender: state.auth.user?.gender || 'male',
      avatar: state.auth.user?.avatar || '',
    });
    setPartnerForm({
      firstName: state.auth.partner?.firstName || '',
      lastName: state.auth.partner?.lastName || '',
      gender: state.auth.partner?.gender || 'female',
      avatar: state.auth.partner?.avatar || '',
    });
    
    // CORREÇÃO: Também resetamos a data para o valor atual do estado global
    setRelationshipStartDate(state.auth.relationshipStartDate || '');
    setIsEditing(false);
  };

  // Função para renderizar avatar (foto ou iniciais)
  const renderAvatar = (user: any, isEditing: boolean, isUser: boolean) => {
    const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
    const avatar = isUser ? userForm.avatar : partnerForm.avatar;
    const gradient = isUser ? 'from-blue-400 to-purple-500' : 'from-pink-400 to-rose-500';
    
    return (
      <div className="relative">
        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
          {avatar ? (
            <img
              src={avatar}
              alt={`Avatar de ${user.firstName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-r ${gradient} flex items-center justify-center`}>
              <span className="text-white text-xl font-bold">{initials}</span>
            </div>
          )}
        </div>
        
        {/* Botão para alterar foto apenas quando editando */}
        {isEditing && (
          <button
            onClick={() => isUser ? userAvatarInputRef.current?.click() : partnerAvatarInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
          >
            <Camera size={12} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
          Configurações
        </h1>
        <div className="flex items-center space-x-2">
          <Settings className="text-gray-500" size={24} />
        </div>
      </div>

      {/* Inputs ocultos para upload de arquivos */}
      <input
        ref={userAvatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleUserAvatarChange}
        className="hidden"
      />
      <input
        ref={partnerAvatarInputRef}
        type="file"
        accept="image/*"
        onChange={handlePartnerAvatarChange}
        className="hidden"
      />

      {/* Profile Information */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Informações do Casal</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <Edit3 className="mr-2" size={16} />
              Editar
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveChanges}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
              >
                <Save className="mr-2" size={16} />
                Salvar
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Profile */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4 mb-4">
              {renderAvatar(
                isEditing ? userForm : state.auth.user,
                isEditing,
                true
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Seu Perfil</h3>
                <p className="text-sm text-gray-500">Suas informações pessoais</p>
              </div>
            </div>

            {/* Nome e Sobrenome separados */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{state.auth.user?.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sobrenome
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Sobrenome"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{state.auth.user?.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              {isEditing ? (
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{state.auth.user?.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gênero
              </label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="male"
                      checked={userForm.gender === 'male'}
                      onChange={(e) => setUserForm({ ...userForm, gender: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`w-full p-3 rounded-lg border-2 text-center cursor-pointer transition-all ${
                      userForm.gender === 'male' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="text-lg mb-1">👨</div>
                      <div className="text-xs font-medium">Masculino</div>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="female"
                      checked={userForm.gender === 'female'}
                      onChange={(e) => setUserForm({ ...userForm, gender: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`w-full p-3 rounded-lg border-2 text-center cursor-pointer transition-all ${
                      userForm.gender === 'female' 
                        ? 'border-pink-500 bg-pink-50 text-pink-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="text-lg mb-1">👩</div>
                      <div className="text-xs font-medium">Feminino</div>
                    </div>
                  </label>
                </div>
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  {state.auth.user?.gender === 'male' ? '👨 Masculino' : '👩 Feminino'}
                </p>
              )}
            </div>
          </div>

          {/* Partner Profile */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4 mb-4">
              {renderAvatar(
                isEditing ? partnerForm : state.auth.partner,
                isEditing,
                false
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Perfil do(a) Parceiro(a)</h3>
                <p className="text-sm text-gray-500">Informações do seu amor</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={partnerForm.firstName}
                    onChange={(e) => setPartnerForm({ ...partnerForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Nome"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{state.auth.partner?.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sobrenome
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={partnerForm.lastName}
                    onChange={(e) => setPartnerForm({ ...partnerForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Sobrenome"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{state.auth.partner?.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gênero
              </label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="male"
                      checked={partnerForm.gender === 'male'}
                      onChange={(e) => setPartnerForm({ ...partnerForm, gender: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`w-full p-3 rounded-lg border-2 text-center cursor-pointer transition-all ${
                      partnerForm.gender === 'male' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="text-lg mb-1">👨</div>
                      <div className="text-xs font-medium">Masculino</div>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="female"
                      checked={partnerForm.gender === 'female'}
                      onChange={(e) => setPartnerForm({ ...partnerForm, gender: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`w-full p-3 rounded-lg border-2 text-center cursor-pointer transition-all ${
                      partnerForm.gender === 'female' 
                        ? 'border-pink-500 bg-pink-50 text-pink-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="text-lg mb-1">👩</div>
                      <div className="text-xs font-medium">Feminino</div>
                    </div>
                  </label>
                </div>
              ) : (
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  {state.auth.partner?.gender === 'male' ? '👨 Masculino' : '👩 Feminino'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Information - Expandida com novas funcionalidades */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Informações da Conta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Criação
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="text-gray-400" size={16} />
                <p className="text-gray-900">
                  {state.auth.user?.createdAt && new Date(state.auth.user.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            
            {/* Nova seção: Início do Namoro */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Início do Namoro
              </label>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Heart className="text-rose-400" size={16} />
                  <input
                    type="date"
                    value={relationshipStartDate}
                    onChange={(e) => setRelationshipStartDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Heart className="text-rose-400" size={16} />
                  <p className="text-gray-900">
                    {/* CORREÇÃO: Usamos o valor do estado global diretamente para garantir
                        que sempre mostremos a informação mais atual salva */}
                    {state.auth.relationshipStartDate 
                      ? new Date(state.auth.relationshipStartDate).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Não informado'
                    }
                  </p>
                </div>
              )}
              
              {/* Mostrar tempo de relacionamento se a data estiver definida */}
              {/* CORREÇÃO: Usamos o estado global para calcular, não o estado local */}
              {state.auth.relationshipStartDate && !isEditing && (
                <div className="mt-2 p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <p className="text-sm text-rose-700 font-medium">
                    💕 Juntos há: {calculateRelationshipDuration()}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dados Armazenados
            </label>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• {state.events.length} eventos salvos</p>
              <p>• {state.wishItems.length} desejos na lista</p>
              <p>• {state.notes.length} anotações criadas</p>
              <p>• {state.photos.length} fotos na galeria</p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-red-200">
        <h2 className="text-xl font-bold text-red-900 mb-4">Zona de Perigo</h2>
        <p className="text-gray-600 mb-4">
          Ações irreversíveis que afetam permanentemente seus dados.
        </p>
        <button
          onClick={() => {
            if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
              localStorage.removeItem('couples-app-data');
              window.location.reload();
            }
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Limpar Todos os Dados
        </button>
      </div>
    </div>
  );
}