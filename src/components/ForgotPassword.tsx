import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import logo from './../assents/Logo.png';

interface ForgotPasswordProps {
    onBackToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error('Por favor, insira um email válido');
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("Enviando link...");

        try {
            // CORREÇÃO: Usando caminho relativo para o proxy.
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao enviar o email. Tente novamente.');
            }
            
            toast.success('Um email com o link para redefinição de senha foi enviado.', { id: toastId });
            setIsSent(true);

        } catch (error: any) {
            console.error('Erro ao solicitar redefinição de senha:', error);
            toast.error(error.message || 'Não foi possível conectar ao servidor.', { id: toastId });
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
                        Redefinir Senha
                    </h1>
                    <p className="text-gray-600">
                        {isSent
                            ? 'Verifique sua caixa de entrada (e spam) para continuar.'
                            : 'Insira seu e-mail para receber o link de redefinição.'}
                    </p>
                </div>

                {!isSent ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                    placeholder="seuemail@exemplo.com"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-lg font-semibold 
                                     hover:from-rose-600 hover:to-pink-700 transform hover:scale-[1.02] transition-all duration-200 
                                     shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <p className="text-gray-700">
                            Se o e-mail estiver correto, você receberá um link para criar uma nova senha.
                        </p>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <button
                        onClick={onBackToLogin}
                        className="text-rose-600 hover:text-rose-700 font-semibold transition-colors flex items-center justify-center w-full"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Voltar para o Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;