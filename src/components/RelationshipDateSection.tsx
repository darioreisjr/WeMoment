import React from 'react';
import { Heart } from 'lucide-react';
import { formatDateLongForDisplay, calculateRelationshipDuration } from '../utils/dateUtils';

interface RelationshipDateSectionProps {
  isEditing: boolean;
  relationshipStartDate: string;
  setRelationshipStartDate: (date: string) => void;
  relationshipDateError: string;
  onDateChange: (date: string) => void;
}

export const RelationshipDateSection: React.FC<RelationshipDateSectionProps> = ({
  isEditing,
  relationshipStartDate,
  relationshipDateError,
  onDateChange
}) => {
  return (
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
                onChange={(e) => onDateChange(e.target.value)}
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
                {relationshipStartDate 
                  ? formatDateLongForDisplay(relationshipStartDate)
                  : 'Data não definida'
                }
              </p>
              {relationshipStartDate && (
                <div className="mt-2 p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <p className="text-sm text-rose-700 font-medium">
                    💕 Juntos há: {calculateRelationshipDuration(relationshipStartDate)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
