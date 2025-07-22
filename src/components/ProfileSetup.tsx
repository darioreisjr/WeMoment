import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { Heart, User as UserIcon, Save } from 'lucide-react';
import logo from './../assents/Logo.png';


export default function ProfileSetup() {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [userProfile, setUserProfile] = useState({
    name: '',
    gender: 'male' as 'male' | 'female',
  });
  const [partnerProfile, setPartnerProfile] = useState({
    name: '',
    gender: 'female' as 'male' | 'female',
  });

  const handleUserProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = {
      ...state.auth.user!,
      name: userProfile.name,
      gender: userProfile.gender,
    };
    dispatch({ type: 'LOGIN', payload: { user: updatedUser } });
    setStep(2);
  };

  const handlePartnerProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const partner: User = {
      id: '2',
      name: partnerProfile.name,
      email: '',
      gender: partnerProfile.gender,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'SET_PARTNER', payload: partner });
    
    // Add welcome notification
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        title: 'Bem-vindos!',
        message: `${userProfile.name} e ${partnerProfile.name}, que comecem os momentos especiais juntos! 💕`,
        type: 'achievement',
        date: new Date().toISOString(),
        read: false,
        createdAt: new Date().toISOString(),
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <img src={logo} alt="Logo da aplicação" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Configuração do Casal
          </h1>
          <p className="text-gray-600">
            {step === 1 ? 'Primeiro, conte-nos sobre você' : 'Agora, sobre seu(sua) parceiro(a)'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleUserProfileSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seu nome
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={userProfile.name}
                  onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  placeholder="Digite seu nome"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gênero
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="male"
                    checked={userProfile.gender === 'male'}
                    onChange={(e) => setUserProfile({ ...userProfile, gender: e.target.value as 'male' | 'female' })}
                    className="sr-only"
                  />
                  <div className={`w-full p-4 rounded-lg border-2 text-center cursor-pointer transition-all ${
                    userProfile.gender === 'male' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="text-2xl mb-1">👨</div>
                    <div className="text-sm font-medium">Masculino</div>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="female"
                    checked={userProfile.gender === 'female'}
                    onChange={(e) => setUserProfile({ ...userProfile, gender: e.target.value as 'male' | 'female' })}
                    className="sr-only"
                  />
                  <div className={`w-full p-4 rounded-lg border-2 text-center cursor-pointer transition-all ${
                    userProfile.gender === 'female' 
                      ? 'border-pink-500 bg-pink-50 text-pink-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="text-2xl mb-1">👩</div>
                    <div className="text-sm font-medium">Feminino</div>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-rose-600 hover:to-pink-600 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all"
            >
              Continuar
            </button>
          </form>
        ) : (
          <form onSubmit={handlePartnerProfileSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do(a) parceiro(a)
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={partnerProfile.name}
                  onChange={(e) => setPartnerProfile({ ...partnerProfile, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  placeholder="Digite o nome do(a) parceiro(a)"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gênero
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="male"
                    checked={partnerProfile.gender === 'male'}
                    onChange={(e) => setPartnerProfile({ ...partnerProfile, gender: e.target.value as 'male' | 'female' })}
                    className="sr-only"
                  />
                  <div className={`w-full p-4 rounded-lg border-2 text-center cursor-pointer transition-all ${
                    partnerProfile.gender === 'male' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="text-2xl mb-1">👨</div>
                    <div className="text-sm font-medium">Masculino</div>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="female"
                    checked={partnerProfile.gender === 'female'}
                    onChange={(e) => setPartnerProfile({ ...partnerProfile, gender: e.target.value as 'male' | 'female' })}
                    className="sr-only"
                  />
                  <div className={`w-full p-4 rounded-lg border-2 text-center cursor-pointer transition-all ${
                    partnerProfile.gender === 'female' 
                      ? 'border-pink-500 bg-pink-50 text-pink-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="text-2xl mb-1">👩</div>
                    <div className="text-sm font-medium">Feminino</div>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-rose-600 hover:to-pink-600 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all flex items-center justify-center"
            >
              <Save className="mr-2" size={20} />
              Finalizar Configuração
            </button>
          </form>
        )}
      </div>
    </div>
  );
}