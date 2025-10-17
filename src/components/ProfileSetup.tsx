import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserPlus, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import logo from './../assents/Logo.png';

export default function ProfileSetup() {
  const { state, dispatch } = useApp();
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Função para usar um código de convite e vincular a conta, chamando a API.
   */
  const handleUseCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      return toast.error("Por favor, insira o código de convite.");
    }
    setIsLoading(true);
    const toastId = toast.loading("Vinculando contas...");

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invite/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.auth.token}`
            },
            body: JSON.stringify({ code: inviteCode })
        });
        
        const data = await response.json();

        if (response.ok) {
            toast.success("Perfis vinculados! Faça login novamente para começar.", { id: toastId, duration: 4000 });
            // Força o logout para que o usuário precise logar novamente e carregar os dados do casal
            setTimeout(() => {
                dispatch({ type: 'LOGOUT' });
            }, 2000);
        } else {
            throw new Error(data.error || "Não foi possível usar o código. Verifique se ele está correto.");
        }
    } catch (error: any) {
        toast.error(error.message, { id: toastId });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="Logo WeMoment" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Junte-se ao seu Amor
          </h1>
          <p className="text-gray-600">
            Insira o código de convite que você recebeu para conectar seus perfis.
          </p>
        </div>

        <form onSubmit={handleUseCode} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Convite
              </label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 transition-all tracking-widest text-center font-mono text-lg"
                  placeholder="CÓDIGO"
                  maxLength={8}
                  required
                />
              </div>
            </div>
            <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center
                         hover:from-rose-600 hover:to-pink-600 transform hover:scale-[1.02] transition-all duration-200 
                         shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Conectando..." : "Conectar Contas"}
              {!isLoading && <ArrowRight className="ml-2" size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}