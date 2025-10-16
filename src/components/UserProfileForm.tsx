import React from 'react';
import { Mail, Calendar } from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';
import { formatDateForDisplay } from '../utils/dateUtils';

interface UserForm {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  avatar: string;
}

interface UserProfileFormProps {
  isEditing: boolean;
  userForm: UserForm;
  setUserForm: (form: UserForm) => void;
  user: any;
  ageError: string;
  onDateOfBirthChange: (date: string) => void;
  onAvatarClick: () => void;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({
  isEditing,
  userForm,
  setUserForm,
  user,
  ageError,
  onDateOfBirthChange,
  onAvatarClick
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <AvatarDisplay
          user={user}
          isUser={true}
          isEditing={isEditing}
          avatar={userForm.avatar}
          firstName={userForm.firstName}
          lastName={userForm.lastName}
          onAvatarClick={onAvatarClick}
        />
        <div>
          <h3 className="font-semibold text-gray-900">
            {user ? `${userForm.firstName} ${userForm.lastName}` : 'Usuário'}
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
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Nascimento *
            </label>
            <input
              type="date"
              value={userForm.dateOfBirth}
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
  );
};