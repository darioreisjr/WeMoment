import React, { useRef, useState } from 'react';
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
  
  // Estado para armazenar o arquivo de avatar selecionado para upload posterior
  const [avatarFileToUpload, setAvatarFileToUpload] = useState<File | null>(null);

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

  // Função de upload movida para ser chamada pelo handleSave
  const uploadAvatar = async (file: File): Promise<string | null> => {
    const token = state.auth.token;
    if (!token) {
      toast.error('Sessão expirada. Faça login novamente.');
      return null;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const loadingToast = toast.loading('Enviando nova imagem...');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao enviar o avatar.');
      }
      
      toast.success('Imagem enviada com sucesso!', { id: loadingToast });
      return data.avatarUrl;

    } catch (error) {
      console.error("Erro no upload do avatar:", error);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
      toast.error(errorMessage, { id: loadingToast });
      return null;
    }
  };
  
  // Atualiza o estado local para preview da imagem
  const handleUserAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      setAvatarFileToUpload(file);
      const previewUrl = URL.createObjectURL(file);
      setUserForm({ ...userForm, avatar: previewUrl });
    }
  };

  const handlePartnerAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.error('A atualização do avatar do parceiro ainda não foi implementada.');
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
    
    let newAvatarUrl = userForm.avatar;

    // 1. Se uma nova imagem foi selecionada, faça o upload primeiro
    if (avatarFileToUpload) {
        const uploadedUrl = await uploadAvatar(avatarFileToUpload);
        if (uploadedUrl) {
            newAvatarUrl = uploadedUrl;
        } else {
            // Se o upload falhar, interrompe o processo de salvar
            toast.error('Não foi possível salvar devido a um erro no upload da imagem.', { id: loadingToast });
            return;
        }
    }

    // 2. Prossiga para salvar os dados do perfil (incluindo a nova URL do avatar, se houver)
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            // Envia todos os dados, incluindo a nova URL do avatar
            body: JSON.stringify({
                firstName: userForm.firstName,
                lastName: userForm.lastName,
                gender: userForm.gender,
                avatar_url: newAvatarUrl // O backend espera 'avatar_url'
            })
        });

        if (!response.ok) {
            throw new Error('Falha ao salvar os dados do perfil.');
        }

        // 3. Atualize o estado global com os novos dados
        if (state.auth.user) {
            const updatedUser: User = {
                ...state.auth.user,
                firstName: userForm.firstName,
                lastName: userForm.lastName,
                name: `${userForm.firstName} ${userForm.lastName}`.trim(),
                email: userForm.email,
                dateOfBirth: userForm.dateOfBirth,
                gender: userForm.gender,
                avatar: newAvatarUrl, // Use a URL final (nova ou antiga)
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
        setAvatarFileToUpload(null); // Limpa o arquivo após o sucesso

    } catch (error) {
        console.error("Erro ao salvar:", error);
        toast.error('Não foi possível salvar as alterações. Tente novamente.', { id: loadingToast });
    }
  };

  const handleCancelEdit = () => {
    resetForms();
    clearErrors();
    setAvatarFileToUpload(null); // Limpa qualquer arquivo selecionado
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