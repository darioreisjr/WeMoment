import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { Settings } from 'lucide-react';

// Hooks
import { useFormValidation } from '../hooks/useFormValidation';
import { useProfileForms } from '../hooks/useProfileForms';
import { useInviteCode } from '../hooks/useInviteCode';

// Components
import { CoupleManagement } from './CoupleManagement';
import { CoupleInformation } from './CoupleInformation';
import { AccountInformation } from './AccountInformation';
import { DangerZone } from './DangerZone';
import { InviteModal } from './InviteModal';

// Utils
import { validateAge, validateRelationshipDate } from '../utils/validationUtils';

export default function SettingsComponent() {
  const { state, dispatch } = useApp();
  const [isEditing, setIsEditing] = React.useState(false);
  
  // Refs para inputs de arquivo
  const userAvatarInputRef = useRef<HTMLInputElement>(null);
  const partnerAvatarInputRef = useRef<HTMLInputElement>(null);
  
  // Hooks customizados
  const {
    ageErrors,
    relationshipDateError,
    validateUserAge,
    validatePartnerAge,
    validateRelationshipDateFunc,
    clearErrors,
    hasErrors
  } = useFormValidation();

  const {
    userForm,
    setUserForm,
    partnerForm,
    setPartnerForm,
    relationshipDate,
    setRelationshipDate,
    resetForms
  } = useProfileForms({
    user: state.auth.user,
    partner: state.auth.partner,
    relationshipStartDate: state.auth.relationshipStartDate || ''
  });

  const {
    showInviteModal,
    setShowInviteModal,
    inviteCodeInput,
    setInviteCodeInput,
    copiedCode,
    generateInviteCode,
    useInviteCodeFunc,
    copyInviteCode
  } = useInviteCode();

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

  // Handlers para upload de imagem
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

  // Handlers para validação de datas
  const handleUserDateOfBirthChange = (date: string) => {
    setUserForm({ ...userForm, dateOfBirth: date });
    validateUserAge(date);
  };

  const handlePartnerDateOfBirthChange = (date: string) => {
    setPartnerForm({ ...partnerForm, dateOfBirth: date });
    validatePartnerAge(date);
  };

  const handleRelationshipDateChange = (date: string) => {
    setRelationshipDate(date);
    validateRelationshipDateFunc(date);
  };

  // Handler para salvar alterações
  const handleSave = () => {
    // Verificar se há erros antes de salvar
    if (hasErrors()) {
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

    if (relationshipDate) {
      dispatch({ type: 'SET_RELATIONSHIP_START_DATE', payload: relationshipDate });
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

  // Handler para cancelar edição
  const handleCancelEdit = () => {
    resetForms();
    clearErrors();
    setIsEditing(false);
  };

  // Handler para limpar todos os dados
  const handleClearAllData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('couples-app-data');
      dispatch({ type: 'LOGOUT' });
    }
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

      {/* Inputs ocultos para upload de avatar */}
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

      {/* Gestão do Casal */}
      <CoupleManagement
        coupleStatus={getCoupleStatus()}
        hasPartner={!!state.auth.partner}
        isCoupleFull={!!state.auth.isCoupleFull}
        inviteCode={state.auth.inviteCode}
        inviteCodeInput={inviteCodeInput}
        setInviteCodeInput={setInviteCodeInput}
        copiedCode={copiedCode}
        onGenerateInviteCode={generateInviteCode}
        onUseInviteCode={useInviteCodeFunc}
        onCopyInviteCode={copyInviteCode}
      />

      {/* Informações do Casal */}
      <CoupleInformation
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        onSave={handleSave}
        onCancel={handleCancelEdit}
        user={state.auth.user}
        userForm={userForm}
        setUserForm={setUserForm}
        userAgeError={ageErrors.user}
        onUserDateOfBirthChange={handleUserDateOfBirthChange}
        onUserAvatarClick={() => userAvatarInputRef.current?.click()}
        partner={state.auth.partner}
        partnerForm={partnerForm}
        setPartnerForm={setPartnerForm}
        partnerAgeError={ageErrors.partner}
        onPartnerDateOfBirthChange={handlePartnerDateOfBirthChange}
        onPartnerAvatarClick={() => partnerAvatarInputRef.current?.click()}
        relationshipStartDate={relationshipDate}
        setRelationshipStartDate={setRelationshipDate}
        relationshipDateError={relationshipDateError}
        onRelationshipDateChange={handleRelationshipDateChange}
      />

      {/* Informações da Conta */}
      <AccountInformation
        user={state.auth.user}
        eventsCount={state.events.length}
        wishItemsCount={state.wishItems.length}
        notesCount={state.notes.length}
        photosCount={state.photos.length}
      />

      {/* Zona de Perigo */}
      <DangerZone onClearAllData={handleClearAllData} />

      {/* Modal de Convite */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        inviteCode={state.auth.inviteCode}
        copiedCode={copiedCode}
        onCopyCode={copyInviteCode}
      />
    </div>
  );
}