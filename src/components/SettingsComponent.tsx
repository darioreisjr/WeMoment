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

export default function SettingsComponent() {
  const { state, dispatch } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const userAvatarInputRef = useRef<HTMLInputElement>(null);

  // Hooks para validação, formulários e lógica de convite
  const { ageErrors, relationshipDateError, validateUserAge, validatePartnerAge, validateRelationshipDateFunc, clearErrors, hasErrors } = useFormValidation();
  const { userForm, setUserForm, partnerForm, setPartnerForm, relationshipDate, setRelationshipDate, resetForms } = useProfileForms({
    user: state.auth.user,
    partner: state.auth.partner,
    relationshipStartDate: state.auth.relationshipStartDate || ''
  });

  const {
    showInviteModal,
    setShowInviteModal,
    inviteCodeInput,
    setInviteCodeInput,
    generatedCode,
    copiedCode,
    generateInviteCode,
    useInviteCodeFunc,
    copyInviteCode
  } = useInviteCode();

  const getCoupleStatus = () => {
    if (!state.auth.partner) {
      return { isComplete: false, status: 'Incompleto', issues: ['Vincule a conta do seu parceiro(a) usando um código de convite.'] };
    }
    return { isComplete: true, status: 'Completo', issues: [] };
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
    
    try {
      // Usa o caminho relativo '/api/profile' que será pego pelo proxy
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          gender: userForm.gender,
          date_of_birth: userForm.dateOfBirth || null
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao salvar os dados do perfil.');
      }
      
      if (state.auth.user) {
        const updatedUser: Partial<User> = {
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          dateOfBirth: userForm.dateOfBirth,
          gender: userForm.gender as 'male' | 'female',
        };
        dispatch({ type: 'UPDATE_USER_PROFILE', payload: updatedUser as User });
      }
      
      if (relationshipDate) {
        dispatch({ type: 'SET_RELATIONSHIP_START_DATE', payload: relationshipDate });
      }
      
      toast.success('Seu perfil foi atualizado com sucesso!', { id: loadingToast });
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const handleCancelEdit = () => {
    resetForms();
    clearErrors();
    setIsEditing(false);
  };

  const handleClearAllData = () => {
    if (window.confirm('Tem certeza? Esta ação limpará todos os dados salvos no navegador e irá deslogar você.')) {
      dispatch({ type: 'LOGOUT' });
      toast.success('Todos os dados locais foram limpos.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">Configurações</h1>
        <Settings className="text-gray-500" size={24} />
      </div>

      <CoupleManagement
        coupleStatus={getCoupleStatus()}
        hasPartner={!!state.auth.partner}
        inviteCodeInput={inviteCodeInput}
        setInviteCodeInput={setInviteCodeInput}
        onGenerateInviteCode={generateInviteCode}
        onUseInviteCode={useInviteCodeFunc}
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
        onUserDateOfBirthChange={(date) => { setUserForm({ ...userForm, dateOfBirth: date }); validateUserAge(date); }}
        onUserAvatarClick={() => toast.error("Upload de avatar ainda não implementado.")}
        partner={state.auth.partner}
        partnerForm={partnerForm}
        setPartnerForm={setPartnerForm}
        partnerAgeError={ageErrors.partner}
        onPartnerDateOfBirthChange={(date) => toast.error("A data de nascimento do parceiro(a) deve ser editada pelo próprio usuário.")}
        onPartnerAvatarClick={() => toast.error("O avatar do parceiro(a) deve ser editado pelo próprio usuário.")}
        relationshipStartDate={relationshipDate}
        setRelationshipStartDate={setRelationshipDate}
        relationshipDateError={relationshipDateError}
        onRelationshipDateChange={validateRelationshipDateFunc}
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
        inviteCode={generatedCode}
        copiedCode={copiedCode}
        onCopyCode={copyInviteCode}
      />
    </div>
  );
}