import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { Settings } from 'lucide-react';
import toast from 'react-hot-toast';

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
  
  const userAvatarInputRef = useRef<HTMLInputElement>(null);
  const partnerAvatarInputRef = useRef<HTMLInputElement>(null);
  
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

  const getCoupleStatus = () => {
    const missingInfo = [];
    if (!state.auth.partner) {
      return { isComplete: false, status: 'Incompleto', issues: ['Parceiro(a) não adicionado ao perfil'] };
    }
    if (!state.auth.user?.firstName) missingInfo.push('Seu nome');
    if (!state.auth.user?.lastName) missingInfo.push('Seu sobrenome');
    if (!state.auth.user?.email) missingInfo.push('Seu email');
    if (!state.auth.user?.dateOfBirth) missingInfo.push('Sua data de nascimento');
    if (!state.auth.partner?.firstName) missingInfo.push('Nome do(a) parceiro(a)');
    if (!state.auth.partner?.lastName) missingInfo.push('Sobrenome do(a) parceiro(a)');
    if (!state.auth.partner?.email) missingInfo.push('Email do(a) parceiro(a)');
    if (!state.auth.partner?.dateOfBirth) missingInfo.push('Data de nascimento do(a) parceiro(a)');
    if (!state.auth.relationshipStartDate) missingInfo.push('Data de início do relacionamento');
    else if (!validateRelationshipDate(state.auth.relationshipStartDate)) {
      missingInfo.push('Data de início do relacionamento não pode ser no futuro');
    }
    if (state.auth.user?.dateOfBirth && !validateAge(state.auth.user.dateOfBirth)) {
      missingInfo.push('Sua idade deve ser maior que 18 anos');
    }
    if (state.auth.partner?.dateOfBirth && !validateAge(state.auth.partner.dateOfBirth)) {
      missingInfo.push('Idade do(a) parceiro(a) deve ser maior que 18 anos');
    }
    return { isComplete: missingInfo.length === 0, status: missingInfo.length === 0 ? 'Completo' : 'Informações incompletas', issues: missingInfo };
  };

  const handleImageUpload = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      callback(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUserAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      handleImageUpload(file, (base64) => setUserForm({ ...userForm, avatar: base64 }));
    }
  };

  const handlePartnerAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      handleImageUpload(file, (base64) => setPartnerForm({ ...partnerForm, avatar: base64 }));
    }
  };

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

  // ==================================================================
  //  ATUALIZAÇÃO PRINCIPAL - FUNÇÃO DE SALVAR (handleSave)
  // ==================================================================
  const handleSave = async () => {
    if (hasErrors()) {
      toast.error('Por favor, corrija os erros antes de salvar.');
      return;
    }

    const token = state.auth.token;
    if (!token) {
        toast.error('Sessão expirada. Por favor, faça login novamente.');
        return;
    }

    const loadingToast = toast.loading('Salvando alterações...');

    try {
        // Envia os dados do usuário principal para a API
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                firstName: userForm.firstName,
                lastName: userForm.lastName,
                gender: userForm.gender
            })
        });

        if (!response.ok) {
            throw new Error('Falha ao salvar os dados do perfil.');
        }

        // Se a chamada à API for bem-sucedida, atualiza o estado local
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
    
        toast.success('Perfis atualizados com sucesso!', { id: loadingToast });
        setIsEditing(false);

    } catch (error) {
        console.error("Erro ao salvar:", error);
        toast.error('Não foi possível salvar as alterações. Tente novamente.', { id: loadingToast });
    }
  };

  const handleCancelEdit = () => {
    resetForms();
    clearErrors();
    setIsEditing(false);
  };

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

      <input ref={userAvatarInputRef} type="file" accept="image/*" onChange={handleUserAvatarChange} className="hidden" />
      <input ref={partnerAvatarInputRef} type="file" accept="image/*" onChange={handlePartnerAvatarChange} className="hidden" />

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

      <AccountInformation
        user={state.auth.user}
        eventsCount={state.events.length}
        wishItemsCount={state.wishItems.length}
        notesCount={state.notes.length}
        photosCount={state.photos.length}
      />

      <DangerZone onClearAllData={handleClearAllData} />

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