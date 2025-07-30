import React from 'react';
import { Camera } from 'lucide-react';
import { User } from '../types';

interface AvatarDisplayProps {
  user: User | null;
  isUser: boolean;
  isEditing: boolean;
  avatar: string;
  firstName: string;
  lastName: string;
  onAvatarClick: () => void;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  user,
  isUser,
  isEditing,
  avatar,
  firstName,
  lastName,
  onAvatarClick
}) => {
  if (!user) return null;

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
          onClick={onAvatarClick}
          className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
        >
          <Camera size={12} />
        </button>
      )}
    </div>
  );
};