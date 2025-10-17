import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import logo from './../assents/Logo.png';

interface SignUpProps {
    onBackToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onBackToLogin }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: 'male' as 'male' | 'female',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = (): boolean => {
        if (formData.firstName.trim().length < 2) {
            toast.error('O nome deve ter pelo menos 2 caracteres');
            return false;
        }
        if (formData.lastName.trim().length < 2) {
            toast.error('O sobrenome deve ter pelo menos 2 caracteres');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        const toastId = toast.loading("Criando sua conta...");

        try {
            // CORREÇÃO: Usando caminho relativo para o proxy.
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    gender: formData.gender,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || data.message || 'Erro ao criar conta. Tente novamente.');
            }

            toast.success('Conta criada! Verifique seu e-mail para confirmar o cadastro.', { id: toastId });
            setTimeout(() => onBackToLogin(), 2000);

        } catch (error: any) {
            toast.error(error.message, { id: toastId });
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
                        Criar Conta
                    </h1>
                    <p className="text-gray-600">Comece sua jornada no WeMoment</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                    placeholder="João"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sobrenome</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                placeholder="Silva"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gênero</label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center">
                                <input type="radio" value="male" checked={formData.gender === 'male'} onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })} className="sr-only"/>
                                <div className={`w-full p-3 rounded-lg border-2 text-center cursor-pointer transition-all ${formData.gender === 'male' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <span className="text-xl mr-2">👨</span>
                                    <span className="text-sm font-medium">Masculino</span>
                                </div>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" value="female" checked={formData.gender === 'female'} onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })} className="sr-only"/>
                                <div className={`w-full p-3 rounded-lg border-2 text-center cursor-pointer transition-all ${formData.gender === 'female' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <span className="text-xl mr-2">👩</span>
                                    <span className="text-sm font-medium">Feminino</span>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all" placeholder="seuemail@exemplo.com" required/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all" placeholder="Mínimo 6 caracteres" required/>
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all" placeholder="Repita sua senha" required/>
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                        </div>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-rose-600 hover:to-pink-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                        {isLoading ? 'Criando conta...' : 'Criar Conta'}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-gray-600">Já tem uma conta?{' '} <button onClick={onBackToLogin} className="text-rose-600 hover:text-rose-700 font-semibold transition-colors">Fazer login</button></p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;