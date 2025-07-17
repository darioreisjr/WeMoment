# 💕 Aplicativo Web para Casais - "WeMoment"

Um aplicativo web moderno e romântico desenvolvido especialmente para casais registrarem, planejarem e celebrarem seus momentos especiais juntos. Com design responsivo e interface intuitiva, o app oferece uma experiência completa para organizar a vida a dois.

## ✨ Funcionalidades Principais

### 🔐 Sistema de Autenticação
- **Login Simulado**: Sistema de autenticação com credenciais fixas
- **Credenciais de Acesso**:
  - Email: `admin@casal.com.br`
  - Senha: `casal@3214`

### 👥 Gestão de Perfis
- **Cadastro de Casal**: Criação de dois perfis (masculino e feminino)
- **Perfis Personalizados**: Cada pessoa pode ter seu próprio avatar e informações
- **Acesso Exclusivo**: Apenas o casal cadastrado pode acessar o aplicativo

### 🏠 Dashboard Inteligente
- **Visão Geral**: Estatísticas completas de eventos, desejos, anotações e fotos
- **Próximos Eventos**: Lista dos eventos mais próximos com detalhes
- **Momentos Recentes**: Galeria das fotos mais recentes
- **Ações Rápidas**: Botões para criação rápida de conteúdo

### 📅 Calendário Interativo
- **Visualização Mensal**: Calendário completo com navegação intuitiva
- **Tipos de Eventos**: Encontros, aniversários, viagens e eventos personalizados
- **Criação Rápida**: Modal para adicionar eventos diretamente no calendário
- **Indicadores Visuais**: Cores diferentes para cada tipo de evento

### 💝 Lista de Desejos Compartilhada
- **Categorias Organizadas**: Viagens, restaurantes, atividades, sonhos e outros
- **Sistema de Prioridades**: Baixa, média e alta prioridade
- **Status de Conclusão**: Marcar desejos como realizados
- **Estatísticas**: Acompanhamento de desejos realizados vs pendentes

### 📝 Sistema de Anotações
- **Bloco de Notas**: Espaço para ideias, lembretes e recados
- **Busca Inteligente**: Pesquisa por título e conteúdo
- **Edição Completa**: Criar, editar e excluir anotações
- **Identificação de Autor**: Mostra quem criou cada anotação

### 📸 Galeria de Fotos
- **Upload Simulado**: Sistema de upload com fotos de demonstração
- **Descrições Detalhadas**: Título, descrição e data para cada foto
- **Visualização Ampliada**: Modal para ver fotos em tamanho completo
- **Estatísticas**: Contadores de fotos por período

### 🔔 Sistema de Notificações
- **Lembretes Automáticos**: Notificações para eventos e atividades
- **Tipos Variados**: Eventos, conquistas e lembretes gerais
- **Gerenciamento**: Marcar como lidas e visualizar histórico
- **Contador Visual**: Badge com número de notificações não lidas

## 🎨 Design e Experiência

### 🌈 Paleta de Cores Romântica
- **Cores Primárias**: Tons de rosa, roxo e dourado
- **Gradientes Suaves**: Transições harmoniosas entre cores
- **Contraste Adequado**: Legibilidade garantida em todos os elementos

### 📱 Responsividade Completa
- **Mobile First**: Otimizado para dispositivos móveis
- **Breakpoints Inteligentes**: Adaptação perfeita para tablet e desktop
- **Touch Friendly**: Botões e elementos dimensionados para toque

### ✨ Micro-interações
- **Hover States**: Efeitos suaves ao passar o mouse
- **Transições**: Animações fluidas entre estados
- **Feedback Visual**: Confirmações visuais para ações do usuário

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18**: Biblioteca principal com hooks modernos
- **TypeScript**: Tipagem estática para maior segurança
- **Tailwind CSS**: Framework CSS utilitário para estilização
- **Lucide React**: Biblioteca de ícones moderna e consistente

### Gerenciamento de Estado
- **React Context**: Gerenciamento global de estado
- **useReducer**: Lógica complexa de estado centralizada
- **localStorage**: Persistência de dados local

### Ferramentas de Desenvolvimento
- **Vite**: Build tool rápido e moderno
- **ESLint**: Linting para qualidade de código
- **PostCSS**: Processamento de CSS
- **Autoprefixer**: Compatibilidade cross-browser

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone [url-do-repositorio]

# Entre no diretório
cd aplicativo-casais

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

### Acesso
1. Abra o navegador em `http://localhost:5173`
2. Use as credenciais de login:
   - Email: `admin@casal.com.br`
   - Senha: `casal@3214`
3. Configure os perfis do casal
4. Explore todas as funcionalidades!

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Layout.tsx      # Layout principal com navegação
│   ├── Login.tsx       # Tela de autenticação
│   ├── ProfileSetup.tsx # Configuração de perfis
│   ├── Dashboard.tsx   # Página inicial
│   ├── Calendar.tsx    # Calendário de eventos
│   ├── Wishes.tsx      # Lista de desejos
│   ├── Notes.tsx       # Sistema de anotações
│   ├── Photos.tsx      # Galeria de fotos
│   └── Notifications.tsx # Central de notificações
├── context/            # Gerenciamento de estado
│   └── AppContext.tsx  # Context principal
├── types/              # Definições TypeScript
│   └── index.ts        # Interfaces e tipos
├── App.tsx             # Componente raiz
└── main.tsx           # Ponto de entrada
```

## 💾 Persistência de Dados

O aplicativo utiliza `localStorage` para simular um backend completo:

- **Autenticação**: Estado de login persistido
- **Perfis**: Informações do casal salvas localmente
- **Eventos**: Calendário completo armazenado
- **Desejos**: Lista de desejos com status
- **Anotações**: Todas as notas do casal
- **Fotos**: Metadados das imagens
- **Notificações**: Histórico completo

## 🎯 Funcionalidades Especiais

### Ações Rápidas no Dashboard
- **Evento Rápido**: Criação simplificada de eventos
- **Desejo Rápido**: Adição rápida à lista de desejos
- **Anotação Rápida**: Criação instantânea de notas
- **Foto Rápida**: Upload simulado com descrição

### Sistema de Notificações Inteligente
- **Notificações Automáticas**: Geradas automaticamente para ações
- **Tipos Diferenciados**: Ícones e cores específicas por tipo
- **Gerenciamento Completo**: Marcar como lida e limpar histórico

### Experiência Mobile Otimizada
- **Menu Lateral**: Navegação adaptada para mobile
- **Modais Responsivos**: Formulários otimizados para toque
- **Gestos Intuitivos**: Interações naturais em dispositivos móveis

## 🔮 Possíveis Expansões Futuras

### Backend Integration
- API REST para persistência real
- Autenticação JWT
- Upload real de imagens
- Sincronização entre dispositivos

### Funcionalidades Avançadas
- **Lembretes Push**: Notificações do navegador
- **Compartilhamento**: Exportar eventos e fotos
- **Temas Personalizados**: Múltiplas paletas de cores
- **Backup/Restore**: Exportar/importar dados

### Integrações
- **Calendário Google**: Sincronização de eventos
- **Redes Sociais**: Compartilhamento de momentos
- **Mapas**: Localização de eventos e lugares
- **Weather API**: Previsão do tempo para eventos

## 🤝 Contribuição

Este projeto foi desenvolvido como demonstração de um aplicativo completo para casais. Sugestões e melhorias são sempre bem-vindas!

### Como Contribuir
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

---

**Desenvolvido com 💕 para casais que querem organizar e celebrar seus momentos especiais juntos!**