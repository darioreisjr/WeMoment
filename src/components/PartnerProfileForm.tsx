import React from 'react';
import { Mail, Calendar, UserPlus } from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';
import { formatDateForDisplay } from '../utils/dateUtils';

interface PartnerForm {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  avatar: string;
}

interface PartnerProfileFormProps {
  isEditing: boolean;
  partnerForm: PartnerForm;
  setPartnerForm: (form: PartnerForm) => void;
  partner: any;
  ageError: string;
  onDateOfBirthChange: (date: string) => void;
  onAvatarClick: () => void;
}

export const PartnerProfileForm: React.FC<PartnerProfileFormProps> = ({
  isEditing,
  partnerForm,
  setPartnerForm,
  partner,
  ageError,
  onDateOfBirthChange,
  onAvatarClick
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {partner ? (
          <AvatarDisplay
            user={partner}
            isUser={false}
            isEditing={isEditing}
            avatar={partnerForm.avatar}
            firstName={partnerForm.firstName}
            lastName={partnerForm.lastName}
            onAvatarClick={onAvatarClick}
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <UserPlus className="text-gray-400" size={24} />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900">
            {partner ? `${partnerForm.firstName} ${partnerForm.lastName}` : 'Sem parceiro(a)'}
          </h3>
          <p className="text-sm text-gray-600">
            {partner ? 'Parceiro(a)' : 'Use um código de convite para adicionar'}
          </p>
        </div>
      </div>

      {partner && isEditing ? (
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
              onChange={(e) => onDateOfBirthChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                ageError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {ageError && (
              <p className="text-red-500 text-sm mt-1">{ageError}</p>
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
      ) : partner && (
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
  );
};
