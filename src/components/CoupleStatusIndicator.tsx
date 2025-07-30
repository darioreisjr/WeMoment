import React from 'react';
import { Shield } from 'lucide-react';

interface CoupleStatus {
  isComplete: boolean;
  status: string;
  issues: string[];
}

interface CoupleStatusIndicatorProps {
  coupleStatus: CoupleStatus;
}

export const CoupleStatusIndicator: React.FC<CoupleStatusIndicatorProps> = ({ coupleStatus }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-medium text-gray-900">Status do Casal</p>
          <p className="text-sm text-gray-600">{coupleStatus.status}</p>
        </div>
        <div className="flex items-center space-x-2">
          {coupleStatus.isComplete ? (
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          ) : (
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          )}
        </div>
      </div>
      
      {!coupleStatus.isComplete && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm font-medium text-red-800 mb-2">Informações pendentes:</p>
          <ul className="text-sm text-red-700 space-y-1">
            {coupleStatus.issues.map((issue, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
