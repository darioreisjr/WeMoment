# 💕 WeMoment

Aplicativo web moderno e romântico para casais registrarem, planejarem e celebrarem seus momentos especiais. Desenvolvido com React + TypeScript e foco em experiência mobile, o WeMoment reúne painel inteligente, calendário interativo, diário de desejos e memórias compartilhadas.

## 📚 Sumário

- [✨ Principais Funcionalidades](#-principais-funcionalidades)
- [🧠 Arquitetura & Persistência](#-arquitetura--persistência)
- [🛠️ Tecnologias](#️-tecnologias)
- [⚙️ Configuração do Ambiente](#️-configuração-do-ambiente)
- [🚀 Scripts Disponíveis](#-scripts-disponíveis)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🔌 Integrações Externas](#-integrações-externas)
- [🔮 Roadmap](#-roadmap)
- [🤝 Contribuição](#-contribuição)
- [📄 Licença](#-licença)

## ✨ Principais Funcionalidades

### 🔐 Autenticação conectada à API
- **Login real** com backend configurável via `VITE_API_URL`.
- **Cadastro completo** com nome, sobrenome e gênero.
- **Recuperação de senha** com fluxo de e-mail e página dedicada de redefinição (Supabase).
- **Sessões autenticadas** com armazenamento seguro do token JWT.

### 💑 Onboarding de Casal e Perfis
- Configuração guiada de dois perfis com campos separados para nome/sobrenome.
- Upload de avatar com conversão automática para Base64 e fallback com iniciais.
- Validações de idade mínima, datas e campos obrigatórios.
- Indicador visual do status do casal e central de convites para conectar parceiros.

### 🏠 Dashboard Inteligente
- Saudação personalizada usando os nomes do casal.
- Estatísticas instantâneas de eventos, desejos, notas, fotos e viagens.
- Atalhos para criação rápida de conteúdos e visão dos próximos eventos.

### 📅 Calendário Interativo
- Visualização mensal com eventos coloridos por tipo (encontros, aniversários, viagens, personalizados).
- Modais rápidos para criar, editar e excluir eventos.
- Sincronização automática com viagens registradas.

### 🧳 Planejamento de Viagens
- Gestão completa de viagens com destino, datas, orçamento estimado e participantes.
- Checklist categorizado (bagagem, documentos, eletrônicos etc.) com marcação visual.
- Controle de despesas por categoria e linha do tempo da viagem.
- Galeria de fotos específicas por viagem e integração com calendário.

### 💝 Lista de Desejos Compartilhada
- Categorias (viagens, restaurantes, atividades, sonhos e outros) com prioridades coloridas.
- Status de conclusão, estatísticas e notificações de conquistas.

### 📝 Sistema de Anotações
- Bloco de notas colaborativo com busca, edição e histórico de atualização.
- Identificação do autor e timestamps completos.

### 📸 Galeria de Fotos
- Upload simulado, dados mock para demonstração e filtro por calendário visual.
- Modal responsivo para visualização ampliada, edição e exclusão com confirmação.

### 🔔 Central de Notificações
- Lembretes automáticos, conquistas e alertas de eventos.
- Marcação individual ou em massa como lidas.

### ⚙️ Configurações Avançadas
- Edição completa dos perfis com validação em tempo real.
- Estatísticas da conta, zona de segurança para limpar dados locais e gerenciamento de convites.

## 🧠 Arquitetura & Persistência

- **State global** com Context API + `useReducer`, garantindo previsibilidade e escalabilidade.
- **Persistência local** automática em `localStorage`, permitindo funcionamento offline.
- **Mock data inteligente** para galeria de fotos quando o usuário inicia sem registros.
- **Token JWT** armazenado para chamadas autenticadas ao backend.
- **Supabase** utilizado no fluxo de redefinição de senha via links mágicos.

## 🛠️ Tecnologias

| Categoria        | Tecnologias |
|------------------|-------------|
| Framework        | React 18, Vite |
| Linguagem        | TypeScript |
| Estilização      | Tailwind CSS, CSS Modules utilitários |
| UI/UX            | Lucide React, animações e microinterações customizadas |
| Estado & Storage | Context API + Reducer, `localStorage` |
| Backend/Infra    | API REST externa (`VITE_API_URL`), Supabase Auth, Vercel Analytics |
| Feedback         | react-hot-toast |

## ⚙️ Configuração do Ambiente

### Pré-requisitos
- Node.js **>= 18**
- npm **>= 9** (ou pnpm/yarn, se preferir)

### Passo a passo
1. Clone o repositório
   ```bash
   git clone https://github.com/sua-conta/WeMoment.git
   cd WeMoment
   ```
2. Instale as dependências
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente criando um arquivo `.env` na raiz com os valores adequados:
   ```env
   VITE_API_URL=https://sua-api.com
   VITE_PUBLIC_SUPABASE_URL=https://sua-instancia.supabase.co
   VITE_PUBLIC_SUPABASE_ANON_KEY=chave_publica_supabase
   ```
4. Execute o servidor de desenvolvimento
   ```bash
   npm run dev
   ```
5. Acesse em `http://localhost:5173` e explore todas as funcionalidades.

> 💡 Caso deseje apenas visualizar o comportamento com dados de demonstração, mantenha as variáveis configuradas e utilize o login para carregar o painel com os mocks automáticos de fotos.

## 🚀 Scripts Disponíveis

| Comando        | Descrição |
|----------------|-----------|
| `npm run dev`      | Inicia o ambiente de desenvolvimento com Vite |
| `npm run build`    | Gera build otimizada para produção |
| `npm run preview`  | Serve a build de produção localmente |
| `npm run lint`     | Executa ESLint com regras para React + TypeScript |

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── Layout.tsx               # Layout principal com navegação responsiva
│   ├── Login.tsx                # Autenticação conectada à API
│   ├── SignUp.tsx               # Cadastro de novos usuários
│   ├── ForgotPassword.tsx       # Solicitação de redefinição de senha
│   ├── UpdatePassword.tsx       # Página para criação de nova senha (Supabase)
│   ├── ProfileSetup.tsx         # Configuração inicial do casal
│   ├── Dashboard.tsx            # Painel com estatísticas e atalhos
│   ├── Calendar.tsx             # Calendário completo de eventos
│   ├── Travels.tsx              # Planejamento e gestão de viagens
│   ├── Wishes.tsx               # Lista de desejos compartilhada
│   ├── Notes.tsx                # Sistema de anotações colaborativas
│   ├── Photos.tsx               # Galeria de fotos com filtros e modais
│   ├── Notifications.tsx        # Central de notificações inteligente
│   ├── SettingsComponent.tsx    # Configurações avançadas do casal
│   └── ...                      # Subcomponentes auxiliares (forms, modais, indicadores)
├── context/
│   └── AppContext.tsx           # Estado global, reducer e persistência
├── hooks/                       # Hooks customizados (formulários, convites, validações)
├── types/                       # Definições TypeScript para todos os domínios
├── utils/                       # Funções utilitárias e validações
├── supabaseClient.ts            # Cliente configurado do Supabase
├── App.tsx                      # Entrada principal com roteamento por seções
└── main.tsx                     # Bootstrap da aplicação
```

## 🔌 Integrações Externas

- **API REST própria**: endpoints `/api/auth/login`, `/api/auth/signup`, `/api/auth/forgot-password` e `/api/profile` para autenticação, cadastro e gestão de perfis.
- **Supabase Auth**: fluxo de redefinição de senha com verificação de token e atualização de credenciais.
- **Vercel Analytics**: coleta automática de métricas quando hospedado na Vercel.

> As integrações são configuráveis via variáveis de ambiente, permitindo apontar para diferentes ambientes (desenvolvimento, homologação, produção).

## 🔮 Roadmap

- Integração completa com backend (persistência real de eventos, notas e desejos).
- Upload real de fotos para armazenamento em nuvem.
- Notificações push e sincronização com Google Calendar.
- Temas personalizáveis e internacionalização.
- Exportação/backup em nuvem dos dados do casal.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b feature/NovaFeature`
3. Commit suas alterações: `git commit -m 'feat: adicionar NovaFeature'`
4. Faça push: `git push origin feature/NovaFeature`
5. Abra um Pull Request descrevendo suas mudanças

Padrões importantes:
- Utilize TypeScript com tipagem explícita e componentes funcionais.
- Execute `npm run lint` antes de abrir o PR.
- Prefira nomes descritivos (em português) para manter o contexto do domínio.

## 📄 Licença

Este projeto é open source sob a licença **MIT**. Sinta-se livre para usar, modificar e distribuir.

---

**Desenvolvido com 💕 para casais que querem organizar e celebrar seus momentos especiais juntos!**

_Versão 1.9.2 – Agora com módulo completo de viagens, convites inteligentes e fluxo de redefinição de senha via Supabase._
