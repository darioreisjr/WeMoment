import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import logo from './../assents/Logo.png';
import SignUp from './SignUp';
import ForgotPassword from './ForgotPassword';

export default function Login() {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (showSignUp) {
    return <SignUp onBackToLogin={() => setShowSignUp(false)} />;
  }

  if (showForgotPassword) {
    return <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Fazer o login para obter o token
      const loginResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        const token: string = loginData.token;
        localStorage.setItem('authToken', token);

        // 2. Com o token, buscar os dados completos do perfil
        const profileResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const userProfileData = await profileResponse.json();

        if (profileResponse.ok) {
            // O userProfileData agora contém todos os dados, incluindo a data de nascimento
            const user: User = {
                id: userProfileData.id,
                email: userProfileData.email,
                firstName: userProfileData.firstName,
                lastName: userProfileData.lastName,
                gender: userProfileData.gender,
                createdAt: userProfileData.created_at,
                avatar: userProfileData.avatar,
                dateOfBirth: userProfileData.dateOfBirth, // CORREÇÃO APLICADA AQUI
            };
            
            // 3. Despachar a action LOGIN com os dados completos do usuário
            dispatch({ type: 'LOGIN', payload: { user, token } });
            toast.success('Login realizado com sucesso!');
        } else {
             // Se falhar em buscar o perfil, ainda faz o login com dados básicos
             console.error("Falha ao buscar perfil completo:", userProfileData.error);
             dispatch({ type: 'LOGIN', payload: { user: loginData.user, token } });
             toast.error('Login realizado, mas não foi possível carregar o perfil completo.');
        }
        
      } else {
        toast.error(loginData.error || 'Email ou senha incorretos');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      toast.error('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <img src={logo} alt="Logo da aplicação" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
            WeMoment
          </h1>
          <p className="text-gray-600">
            Entre no seu espaço especial
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="seuemail@exemplo.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="Sua senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-lg font-semibold 
                     hover:from-rose-600 hover:to-pink-700 transform hover:scale-[1.02] transition-all duration-200 
                     shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => setShowForgotPassword(true)}
            className="text-rose-600 hover:text-rose-700 text-sm transition-colors"
          >
            Esqueceu sua senha?
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          <button
            onClick={() => setShowSignUp(true)}
            type="button"
            className="w-full border-2 border-rose-500 text-rose-600 py-3 rounded-lg font-semibold 
                     hover:bg-rose-50 transform hover:scale-[1.02] transition-all duration-200"
          >
            Criar nova conta
          </button>
        </div>
      </div>
    </div>
  );
}