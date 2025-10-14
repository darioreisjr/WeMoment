import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import logo from './../assents/Logo.png';
import { supabase } from '../supabaseClient'; 

const UpdatePassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        // O Supabase irá detectar o token na URL e criar uma sessão
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                toast.error('Token inválido ou expirado. Por favor, solicite um novo link.');
            } else {
                setSession(session);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('As senhas não coincidem');
            return;
        }

        setIsLoading(true);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            toast.error(error.message || 'Erro ao atualizar a senha.');
        } else {
            toast.success('Senha atualizada com sucesso! Você já pode fazer login.');
            // Opcional: deslogar o usuário para que ele precise logar com a nova senha
            await supabase.auth.signOut();
            // Redireciona para a página de login após um tempo
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }

        setIsLoading(false);
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 flex items-center justify-center p-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
                    <h2 className="text-xl font-bold text-gray-800">Verificando token...</h2>
                    <p className="text-gray-600 mt-2">Se você não for redirecionado, seu link pode ter expirado.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <img src={logo} alt="Logo da aplicação" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        Criar Nova Senha
                    </h1>
                    <p className="text-gray-600">
                        Escolha uma nova senha para sua conta.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Nova Senha */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nova Senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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

                    {/* Confirmar Nova Senha */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Nova Senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                placeholder="Repita sua nova senha"
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

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 rounded-lg font-semibold 
                                     hover:from-rose-600 hover:to-pink-700 transform hover:scale-[1.02] transition-all duration-200 
                                     shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdatePassword;