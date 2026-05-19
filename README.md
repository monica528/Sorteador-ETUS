# ETUS Academy

Plataforma interna de Gestão de Desenvolvimento e Acompanhamento de Aulas — ETUS Media.

## Funcionalidades

### Gestão de Aulas de Inglês
- **Turmas**: Cadastro e visualização de turmas com professor, alunos e horários
- **Aulas**: Registro de aulas com tópico, descrição e data
- **Lista de Presença**: Controle de frequência por aula com dashboard de presença
- **Feedbacks**: Feedback mensal dos alunos sobre as aulas (nota geral, conteúdo, professor)
- **Avaliações**: Avaliação bimestral do professor sobre cada aluno (speaking, listening, reading, writing, participação)
- **Relatórios**: Relatório bimestral do professor com resumo, conquistas, desafios, recomendações e próximos passos

### Acompanhamento de Desempenho
- **Metas**: Criação e acompanhamento de metas de desenvolvimento
- **Progresso**: Acompanhamento visual de progresso por colaborador
- **Categorias**: Inglês, Liderança, Técnico, Soft Skills

### Dashboard
- Visão geral com KPIs: total de alunos, aulas, taxa de presença, nota média
- Gráficos de presença por turma, média de habilidades, status de metas
- Dashboard personalizado para cada perfil de acesso

### Perfis de Acesso
- **RH / Admin**: Visão completa, dashboards, relatórios e gestão
- **Professor**: Gerenciar presenças, avaliações e relatórios
- **Aluno**: Acompanhar progresso e enviar feedbacks

## Stack Tecnológica

- **React 19** + **TypeScript**
- **Tailwind CSS 4** (design system customizado)
- **React Router** (navegação SPA)
- **Recharts** (gráficos e visualizações)
- **Lucide React** (ícones)
- **Firebase** (preparado para autenticação e Firestore)
- **Vite** (build tool)

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173` no navegador.

## Build para produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`.

## Deploy

A aplicação é um site estático e pode ser deployada em qualquer hosting:
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting
