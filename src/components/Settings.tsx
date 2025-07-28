import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { User, InviteCode } from '../types';
import { 
  Settings, 
  User as UserIcon, 
  Save, 
  Edit3, 
  Mail, 
  Calendar, 
  Heart, 
  Camera, 
  UserPlus,
  Copy,
  Check,
  X,
  Shield,
  Trash2
} from 'lucide-react';

export default function SettingsComponent() {
  const { state, dispatch } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  
  const userAvatarInputRef = useRef<HTMLInputElement>(null);
  const partnerAvatarInputRef = useRef<HTMLInputElement>(null);
  
  const [userForm, setUserForm] = useState({
    firstName: state.auth.user?.firstName || '',
    lastName: state.auth.user?.lastName || '',
    email: state.auth.user?.email || '',
    dateOfBirth: state.auth.user?.dateOfBirth || '',
    gender: state.auth.user?.gender || 'male',
    avatar: state.auth.user?.avatar || '',
  });
  
  const [partnerForm, setPartnerForm] = useState({
    firstName: state.auth.partner?.firstName || '',
    lastName: state.auth.partner?.lastName || '',
    email: state.auth.partner?.email || '',
    dateOfBirth: state.auth.partner?.dateOfBirth || '',
    gender: state.auth.partner?.gender || 'female',
    avatar: state.auth.partner?.avatar || '',
  });
  
  const [relationshipStartDate, setRelationshipStartDate] = useState(
    state.auth.relationshipStartDate || ''
  );

  const [ageErrors, setAgeErrors] = useState({
    user: '',
    partner: ''
  });

  const [relationshipDateError, setRelationshipDateError] = useState('');

  // Função auxiliar para criar data local a partir de string YYYY-MM-DD
  const createLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month é 0-indexed
  };

  // Função para validar idade mínima de 18 anos
  const validateAge = (dateOfBirth: string): boolean => {
    if (!dateOfBirth) return true; // Permite vazio
    
    const today = new Date();
    const birthDate = createLocalDate(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Verifica se ainda não fez aniversário este ano
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return (age - 1) >= 18;
    }
    
    return age >= 18;
  };

  // Função para validar e atualizar data de nascimento do usuário
  const handleUserDateOfBirthChange = (date: string) => {
    setUserForm({ ...userForm, dateOfBirth: date });
    
    if (date && !validateAge(date)) {
      setAgeErrors({ ...ageErrors, user: 'Você deve ter pelo menos 18 anos para usar este aplicativo.' });
    } else {
      setAgeErrors({ ...ageErrors, user: '' });
    }
  };

  // Função para validar e atualizar data de nascimento do parceiro
  const handlePartnerDateOfBirthChange = (date: string) => {
    setPartnerForm({ ...partnerForm, dateOfBirth: date });
    
    if (date && !validateAge(date)) {
      setAgeErrors({ ...ageErrors, partner: 'Seu(sua) parceiro(a) deve ter pelo menos 18 anos para usar este aplicativo.' });
    } else {
      setAgeErrors({ ...ageErrors, partner: '' });
    }
  };

  // Função para validar data de relacionamento
  const validateRelationshipDate = (date: string): boolean => {
    if (!date) return true; // Permite vazio
    
    const selectedDate = createLocalDate(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Final do dia atual
    
    return selectedDate <= today;
  };

  // Função para validar e atualizar data de relacionamento
  const handleRelationshipDateChange = (date: string) => {
    setRelationshipStartDate(date);
    
    if (date && !validateRelationshipDate(date)) {
      setRelationshipDateError('A data de início do relacionamento não pode ser no futuro.');
    } else {
      setRelationshipDateError('');
    }
  };

  // Função para verificar status completo do casal
  const getCoupleStatus = () => {
    const missingInfo = [];
    
    // Verificar se existe parceiro
    if (!state.auth.partner) {
      return {
        isComplete: false,
        status: 'Incompleto',
        issues: ['Parceiro(a) não adicionado ao perfil']
      };
    }

    // Verificar dados do usuário
    if (!state.auth.user?.firstName) missingInfo.push('Seu nome');
    if (!state.auth.user?.lastName) missingInfo.push('Seu sobrenome');
    if (!state.auth.user?.email) missingInfo.push('Seu email');
    if (!state.auth.user?.dateOfBirth) missingInfo.push('Sua data de nascimento');

    // Verificar dados do parceiro
    if (!state.auth.partner?.firstName) missingInfo.push('Nome do(a) parceiro(a)');
    if (!state.auth.partner?.lastName) missingInfo.push('Sobrenome do(a) parceiro(a)');
    if (!state.auth.partner?.email) missingInfo.push('Email do(a) parceiro(a)');
    if (!state.auth.partner?.dateOfBirth) missingInfo.push('Data de nascimento do(a) parceiro(a)');

    // Verificar data de relacionamento
    if (!state.auth.relationshipStartDate) missingInfo.push('Data de início do relacionamento');
    else if (!validateRelationshipDate(state.auth.relationshipStartDate)) {
      missingInfo.push('Data de início do relacionamento não pode ser no futuro');
    }

    // Verificar idades válidas
    if (state.auth.user?.dateOfBirth && !validateAge(state.auth.user.dateOfBirth)) {
      missingInfo.push('Sua idade deve ser maior que 18 anos');
    }
    if (state.auth.partner?.dateOfBirth && !validateAge(state.auth.partner.dateOfBirth)) {
      missingInfo.push('Idade do(a) parceiro(a) deve ser maior que 18 anos');
    }

    return {
      isComplete: missingInfo.length === 0,
      status: missingInfo.length === 0 ? 'Completo' : 'Informações incompletas',
      issues: missingInfo
    };
  };

  // Gerar código de convite
  const generateInviteCode = () => {
    if (state.auth.partner) {
      alert('O casal já está completo! Apenas duas pessoas podem fazer parte do perfil.');
      return;
    }

    if (!getCoupleStatus().isComplete) {
      alert('Complete todas as suas informações no perfil antes de gerar um código de convite.');
      return;
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const inviteCode: InviteCode = {
      id: Date.now().toString(),
      code,
      createdBy: state.auth.user?.id || '',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      used: false,
    };

    dispatch({ type: 'GENERATE_INVITE_CODE', payload: inviteCode });
    setShowInviteModal(true);
  };

  // Usar código de convite
  const useInviteCode = () => {
    if (!inviteCodeInput.trim()) {
      alert('Por favor, digite um código de convite.');
      return;
    }

    const validCode = state.inviteCodes.find(
      code => code.code === inviteCodeInput.toUpperCase() && 
              !code.used && 
              new Date(code.expiresAt) > new Date()
    );

    if (!validCode) {
      alert('Código de convite inválido ou expirado.');
      return;
    }

    const newPartner: User = {
      id: Date.now().toString(),
      firstName: 'Novo',
      lastName: 'Parceiro',
      email: '',
      dateOfBirth: '',
      gender: state.auth.user?.gender === 'male' ? 'female' : 'male',
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'USE_INVITE_CODE', payload: { code: validCode.code, user: newPartner } });
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        title: 'Parceiro(a) Adicionado!',
        message: `${newPartner.firstName} ${newPartner.lastName} se juntou ao seu perfil de casal! 💕`,
        type: 'achievement',
        date: new Date().toISOString(),
        read: false,
        createdAt: new Date().toISOString(),
      },
    });

    setInviteCodeInput('');
    alert('Parceiro(a) adicionado com sucesso!');
  };

  // Copiar código para clipboard
  const copyInviteCode = () => {
    if (state.auth.inviteCode) {
      navigator.clipboard.writeText(state.auth.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleImageUpload = (
    file: File, 
    isUser: boolean, 
    callback: (base64: string) => void
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      callback(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleUserAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      handleImageUpload(file, true, (base64) => {
        setUserForm({ ...userForm, avatar: base64 });
      });
    }
  };

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
    if (!state.auth.relationshipStartDate) return null;
    
    const start = createLocalDate(state.auth.relationshipStartDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    const diffMonths = Math.floor((diffDays % 365) / 30);
    const remainingDays = diffDays % 30;
    
    if (diffYears > 0) {
      return `${diffYears} ano${diffYears > 1 ? 's' : ''}, ${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'} e ${remainingDays} ${remainingDays === 1 ? 'dia' : 'dias'}`;
    } else if (diffMonths > 0) {
      return `${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'} e ${remainingDays} ${remainingDays === 1 ? 'dia' : 'dias'}`;
    } else {
      return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
    }
  };

  // Função auxiliar para formatar datas para exibição
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = createLocalDate(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Função auxiliar para formatar datas para exibição longa
  const formatDateLongForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = createLocalDate(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleSave = () => {
    // Verificar se há erros de idade ou data de relacionamento antes de salvar
    if (ageErrors.user || ageErrors.partner || relationshipDateError) {
      alert('Por favor, corrija os erros antes de salvar.');
      return;
    }

    if (state.auth.user) {
      const updatedUser: User = {
        ...state.auth.user,
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        name: `${userForm.firstName} ${userForm.lastName}`.trim(),
        email: userForm.email,
        dateOfBirth: userForm.dateOfBirth,
        gender: userForm.gender,
        avatar: userForm.avatar,
      };
      dispatch({ type: 'UPDATE_USER_PROFILE', payload: updatedUser });
    }

    if (state.auth.partner) {
      const updatedPartner: User = {
        ...state.auth.partner,
        firstName: partnerForm.firstName,
        lastName: partnerForm.lastName,
        name: `${partnerForm.firstName} ${partnerForm.lastName}`.trim(),
        email: partnerForm.email,
        dateOfBirth: partnerForm.dateOfBirth,
        gender: partnerForm.gender,
        avatar: partnerForm.avatar,
      };
      dispatch({ type: 'UPDATE_PARTNER_PROFILE', payload: updatedPartner });
    }

    if (relationshipStartDate) {
      dispatch({ type: 'SET_RELATIONSHIP_START_DATE', payload: relationshipStartDate });
    }

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
    setUserForm({
      firstName: state.auth.user?.firstName || '',
      lastName: state.auth.user?.lastName || '',
      email: state.auth.user?.email || '',
      dateOfBirth: state.auth.user?.dateOfBirth || '',
      gender: state.auth.user?.gender || 'male',
      avatar: state.auth.user?.avatar || '',
    });
    setPartnerForm({
      firstName: state.auth.partner?.firstName || '',
      lastName: state.auth.partner?.lastName || '',
      email: state.auth.partner?.email || '',
      dateOfBirth: state.auth.partner?.dateOfBirth || '',
      gender: state.auth.partner?.gender || 'female',
      avatar: state.auth.partner?.avatar || '',
    });
    setRelationshipStartDate(state.auth.relationshipStartDate || '');
    setAgeErrors({ user: '', partner: '' });
    setRelationshipDateError('');
    setIsEditing(false);
  };

  const renderAvatar = (user: User | null, isUser: boolean) => {
    if (!user) return null;

    const avatar = isUser ? userForm.avatar : partnerForm.avatar;
    const firstName = isUser ? userForm.firstName : partnerForm.firstName;
    const lastName = isUser ? userForm.lastName : partnerForm.lastName;
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    const gradient = user.gender === 'male' 
      ? 'from-blue-500 to-indigo-600' 
      : 'from-pink-500 to-rose-600';

    return (
      <div className="relative w-20 h-20 rounded-full overflow-hidden group">
        <div className="w-full h-full">
          {avatar ? (
            <img
              src={avatar}
              alt={`Avatar de ${firstName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-r ${gradient} flex items-center justify-center`}>
              <span className="text-white text-xl font-bold">{initials}</span>
            </div>
          )}
        </div>
        
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

      {/* Gestão do Casal - Só aparece se tiver parceiro E informações incompletas */}
      {state.auth.partner && !getCoupleStatus().isComplete && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Gestão do Casal</h2>
            <Shield className="text-gray-500" size={20} />
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-900">Status do Casal</p>
                  <p className="text-sm text-gray-600">
                    {getCoupleStatus().status}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getCoupleStatus().isComplete ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  ) : (
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </div>
              
              {!getCoupleStatus().isComplete && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-800 mb-2">Informações pendentes:</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {getCoupleStatus().issues.map((issue, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {!state.auth.isCoupleFull && (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <button
                    onClick={generateInviteCode}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <UserPlus size={16} className="mr-2" />
                    Gerar Código de Convite
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inviteCodeInput}
                    onChange={(e) => setInviteCodeInput(e.target.value)}
                    placeholder="Digite um código de convite"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={6}
                  />
                  <button
                    onClick={useInviteCode}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Usar
                  </button>
                </div>
              </div>
            )}

            {state.auth.inviteCode && !state.auth.isCoupleFull && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">Seu Código de Convite:</p>
                <div className="flex items-center justify-between">
                  <code className="text-lg font-bold text-blue-700">{state.auth.inviteCode}</code>
                  <button
                    onClick={copyInviteCode}
                    className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                    <span className="ml-1 text-sm">{copiedCode ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Compartilhe este código com seu(sua) parceiro(a) para que possam se juntar ao perfil.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Informações do Casal - SEÇÃO EXPANDIDA */}
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
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
              >
                <Save className="mr-2" size={16} />
                Salvar
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Usuário Principal */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {renderAvatar(state.auth.user, true)}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {state.auth.user ? `${userForm.firstName} ${userForm.lastName}` : 'Usuário'}
                </h3>
                <p className="text-sm text-gray-600">Usuário Principal</p>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primeiro Nome *
                    </label>
                    <input
                      type="text"
                      value={userForm.firstName}
                      onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                      placeholder="Digite seu primeiro nome"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sobrenome *
                    </label>
                    <input
                      type="text"
                      value={userForm.lastName}
                      onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                      placeholder="Digite seu sobrenome"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço de Email
                  </label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="exemplo@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    value={userForm.dateOfBirth}
                    onChange={(e) => handleUserDateOfBirthChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      ageErrors.user ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {ageErrors.user && (
                    <p className="text-red-500 text-sm mt-1">{ageErrors.user}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gênero
                  </label>
                  <select
                    value={userForm.gender}
                    onChange={(e) => setUserForm({ ...userForm, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Mail size={16} className="mr-2" />
                  <span>{userForm.email || 'Email não informado'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar size={16} className="mr-2" />
                  <span>
                    {userForm.dateOfBirth 
                      ? formatDateForDisplay(userForm.dateOfBirth)
                      : 'Data de nascimento não informada'
                    }
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Parceiro */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {state.auth.partner ? renderAvatar(state.auth.partner, false) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserPlus className="text-gray-400" size={24} />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {state.auth.partner ? `${partnerForm.firstName} ${partnerForm.lastName}` : 'Sem parceiro(a)'}
                </h3>
                <p className="text-sm text-gray-600">
                  {state.auth.partner ? 'Parceiro(a)' : 'Use um código de convite para adicionar'}
                </p>
              </div>
            </div>

            {state.auth.partner && isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primeiro Nome do(a) Parceiro(a) *
                    </label>
                    <input
                      type="text"
                      value={partnerForm.firstName}
                      onChange={(e) => setPartnerForm({ ...partnerForm, firstName: e.target.value })}
                      placeholder="Nome do(a) parceiro(a)"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sobrenome do(a) Parceiro(a) *
                    </label>
                    <input
                      type="text"
                      value={partnerForm.lastName}
                      onChange={(e) => setPartnerForm({ ...partnerForm, lastName: e.target.value })}
                      placeholder="Sobrenome do(a) parceiro(a)"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email do(a) Parceiro(a)
                  </label>
                  <input
                    type="email"
                    value={partnerForm.email}
                    onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                    placeholder="email@parceiro.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento do(a) Parceiro(a) *
                  </label>
                  <input
                    type="date"
                    value={partnerForm.dateOfBirth}
                    onChange={(e) => handlePartnerDateOfBirthChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      ageErrors.partner ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {ageErrors.partner && (
                    <p className="text-red-500 text-sm mt-1">{ageErrors.partner}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gênero do(a) Parceiro(a)
                  </label>
                  <select
                    value={partnerForm.gender}
                    onChange={(e) => setPartnerForm({ ...partnerForm, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                  </select>
                </div>
              </div>
            ) : state.auth.partner && (
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Mail size={16} className="mr-2" />
                  <span>{partnerForm.email || 'Email não informado'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar size={16} className="mr-2" />
                  <span>
                    {partnerForm.dateOfBirth 
                      ? formatDateForDisplay(partnerForm.dateOfBirth)
                      : 'Data de nascimento não informada'
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Data do Relacionamento */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <Heart className="text-rose-500" size={20} />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início do Relacionamento
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="date"
                    value={relationshipStartDate}
                    onChange={(e) => handleRelationshipDateChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      relationshipDateError ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {relationshipDateError && (
                    <p className="text-red-500 text-sm mt-1">{relationshipDateError}</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-gray-900">
                    {state.auth.relationshipStartDate 
                      ? formatDateLongForDisplay(state.auth.relationshipStartDate)
                      : 'Data não definida'
                    }
                  </p>
                  {state.auth.relationshipStartDate && (
                    <div className="mt-2 p-3 bg-rose-50 rounded-lg border border-rose-200">
                      <p className="text-sm text-rose-700 font-medium">
                        💕 Juntos há: {calculateRelationshipDuration()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Informações da Conta - SEÇÃO MANTIDA */}
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

      {/* Zona de Perigo - SEÇÃO MANTIDA */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-red-200">
        <h2 className="text-xl font-bold text-red-900 mb-4">Zona de Perigo</h2>
        <p className="text-gray-600 mb-4">
          Ações irreversíveis que afetam permanentemente seus dados.
        </p>
        <button
          onClick={() => {
            if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
              localStorage.removeItem('couples-app-data');
              dispatch({ type: 'LOGOUT' });
            }
          }}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 size={16} className="mr-2" />
          Limpar Todos os Dados
        </button>
      </div>

      {/* Modal de Convite - NOVO MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Código de Convite Gerado!</h3>
              <p className="text-gray-600 mb-4">
                Compartilhe este código com seu(sua) parceiro(a):
              </p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <code className="text-2xl font-bold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg">
                  {state.auth.inviteCode}
                </code>
                <button
                  onClick={copyInviteCode}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {copiedCode ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Este código expira em 7 dias e só pode ser usado uma vez.
              </p>
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}