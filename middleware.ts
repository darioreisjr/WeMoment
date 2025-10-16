import { NextResponse, NextRequest } from 'next/server';

export const config = {
  /*
   * O 'matcher' diz ao middleware para rodar APENAS nas requisições 
   * que começam com /api/
   */
  matcher: '/api/:path*',
};

export function middleware(request: NextRequest) {
  // Pega o caminho da requisição (ex: /api/profile/avatar)
  const path = request.nextUrl.pathname;

  // Pega a URL da API a partir das variáveis de ambiente (configuradas no painel da Vercel)
  const apiUrl = process.env.VITE_API_URL;

  if (!apiUrl) {
    // Se a variável não estiver configurada, retorna um erro para debug
    return new Response('A variável de ambiente VITE_API_URL não está configurada.', { status: 500 });
  }

  // Monta a URL de destino completa para o seu backend
  // Ex: https://sua-api.com/api/profile/avatar
  // Note que o '/api' do path original é removido e o '/api' da apiUrl é usado.
  const destinationUrl = `${apiUrl}${path.replace('/api', '')}`;

  // Reescreve (redireciona no servidor) a requisição para a API de backend
  return NextResponse.rewrite(new URL(destinationUrl));
}