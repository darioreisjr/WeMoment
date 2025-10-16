import React from 'react';
import { Edit3, Save } from 'lucide-react';
import { UserProfileForm } from './UserProfileForm';
import { PartnerProfileForm } from './PartnerProfileForm';
import { RelationshipDateSection } from './RelationshipDateSection';

// ... (interfaces internas permanecem as mesmas)

// Renomeando props para clareza
interface CoupleInformationProps {
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  // User form props
  user: any;
  userForm: any;
  setUserForm: any;
  userAgeError: string; // Mantido
  onUserDateOfBirthChange: (date: string) => void; // Mantido
  onUserAvatarClick: () => void;
  // Partner form props
  partner: any;
  partnerForm: any;
  setPartnerForm: any;
  partnerAgeError: string; // Mantido
  onPartnerDateOfBirthChange: (date: string) => void; // Mantido
  onPartnerAvatarClick: () => void;
  // Relationship date props
  relationshipStartDate: string;
  setRelationshipStartDate: (date: string) => void;
  relationshipDateError: string;
  onRelationshipDateChange: (date: string) => void;
}

export const CoupleInformation: React.FC<CoupleInformationProps> = ({
  isEditing,
  setIsEditing,
  onSave,
  onCancel,
  user,
  userForm,
  setUserForm,
  userAgeError,
  onUserDateOfBirthChange,
  onUserAvatarClick,
  partner,
  partnerForm,
  setPartnerForm,
  partnerAgeError,
  onPartnerDateOfBirthChange,
  onPartnerAvatarClick,
  relationshipStartDate,
  setRelationshipStartDate,
  relationshipDateError,
  onRelationshipDateChange
}) => {
  return (
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
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
            >
              <Save className="mr-2" size={16} />
              Salvar
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserProfileForm
          isEditing={isEditing}
          userForm={userForm}
          setUserForm={setUserForm}
          user={user}
          ageError={userAgeError}
          onDateOfBirthChange={onUserDateOfBirthChange}
          onAvatarClick={onUserAvatarClick}
        />

        <PartnerProfileForm
          isEditing={isEditing}
          partnerForm={partnerForm}
          setPartnerForm={setPartnerForm}
          partner={partner}
          ageError={partnerAgeError}
          onDateOfBirthChange={onPartnerDateOfBirthChange}
          onAvatarClick={onPartnerAvatarClick}
        />
      </div>

      <RelationshipDateSection
        isEditing={isEditing}
        relationshipStartDate={relationshipStartDate}
        setRelationshipStartDate={setRelationshipStartDate}
        relationshipDateError={relationshipDateError}
        onDateChange={onRelationshipDateChange}
      />
    </div>
  );
};