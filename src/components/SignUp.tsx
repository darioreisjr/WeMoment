import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import logo from './../assents/Logo.png';

interface SignUpProps {
    onBackToLogin: () => void;
}

/**
 * Componente de cadastro de nova conta
 * Integrado com a API WeMoment para criar novos usuários
 */
const SignUp: React.FC<SignUpProps> = ({ onBackToLogin }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Valida os dados do formulário antes de enviar
     */
    const validateForm = (): boolean => {
        if (formData.fullName.trim().length < 3) {
            toast.error('O nome completo deve ter pelo menos 3 caracteres');
            return false;
        }

        if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            toast.error('Por favor, insira um email válido');
            return false;
        }

        if (formData.password.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('As senhas não coincidem');
            return false;
        }

        return true;
    };

    /**
     * Processa o cadastro do novo usuário na API
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Separa o nome completo em firstName e lastName
            const nameParts = formData.fullName.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '';

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName: firstName,
                    lastName: lastName,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro.');
                // Aguarda 2 segundos antes de voltar ao login
                setTimeout(() => {
                    onBackToLogin();
                }, 2000);
            } else {
                // Mensagens de erro personalizadas baseadas na resposta da API
                if (data.message) {
                    toast.error(data.message);
                } else if (response.status === 409) {
                    toast.error('Este email já está cadastrado');
                } else {
                    toast.error('Erro ao criar conta. Tente novamente.');
                }
            }
        } catch (error) {
            console.error('Erro ao criar conta:', error);
            toast.error('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md">

                {/* Cabeçalho */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <img src={logo} alt="Logo da aplicação" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        Criar Conta
                    </h1>
                    <p className="text-gray-600">
                        Comece sua jornada no WeMoment
                    </p>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Nome Completo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome Completo
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                placeholder="João Silva"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
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

                    {/* Senha */}
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
                                placeholder="Mínimo 6 caracteres"
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

                    {/* Confirmar Senha */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                placeholder="Repita sua senha"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Botão de Cadastro */}
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
                                Criando conta...
                            </span>
                        ) : (
                            'Criar Conta'
                        )}
                    </button>
                </form>

                {/* Link para Login */}
                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Já tem uma conta?{' '}
                        <button
                            onClick={onBackToLogin}
                            className="text-rose-600 hover:text-rose-700 font-semibold transition-colors"
                        >
                            Fazer login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;