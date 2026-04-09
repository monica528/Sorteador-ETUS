# 🎟️ Sorteio RH — Guia de Configuração Firebase

## Arquivos do projeto
```
rh.html            → Painel do RH (login + gestão)
participante.html  → Página pública dos participantes
firestore.rules    → Regras de segurança do banco
SETUP.md           → Este guia
```

---

## Passo 1 — Criar projeto no Firebase

1. Acesse https://console.firebase.google.com
2. Clique em **"Adicionar projeto"**
3. Dê um nome (ex: `sorteio-rh-empresa`)
4. Desative o Google Analytics (opcional)
5. Clique em **"Criar projeto"**

---

## Passo 2 — Ativar Firestore

1. No menu lateral, clique em **Firestore Database**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar no modo de produção"**
4. Selecione a região **`southamerica-east1`** (São Paulo)
5. Clique em **"Ativar"**

---

## Passo 3 — Configurar regras do Firestore

1. No Firestore, clique na aba **"Regras"**
2. Substitua o conteúdo pelo arquivo `firestore.rules`
3. Clique em **"Publicar"**

---

## Passo 4 — Ativar Authentication

1. No menu lateral, clique em **Authentication**
2. Clique em **"Começar"**
3. Vá na aba **"Sign-in method"**
4. Ative o provedor **"E-mail/senha"**
5. Clique em **"Salvar"**

### Criar conta do RH:
1. Ainda em Authentication, clique na aba **"Usuários"**
2. Clique em **"Adicionar usuário"**
3. Informe o e-mail do RH (ex: `rh@etus.com.br`) e uma senha segura
4. Repita para cada membro do RH que precisar de acesso

---

## Passo 5 — Obter credenciais do Firebase

1. No console Firebase, clique na **engrenagem ⚙️** → **"Configurações do projeto"**
2. Role até **"Seus apps"** e clique em **"</>"** (Web)
3. Registre o app (dê um nome, ex: `sorteio-web`)
4. Copie o objeto `firebaseConfig`

---

## Passo 6 — Configurar os arquivos HTML

Abra **`rh.html`** e **`participante.html`** e localize o bloco:

```javascript
// =============================================
// 🔥 CONFIGURAÇÃO FIREBASE — SUBSTITUA AQUI
// =============================================
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO_ID",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

Substitua pelos valores que você copiou no Passo 5. **Faça isso nos dois arquivos.**

---

## Passo 7 — Hospedar no Firebase Hosting

### Instalar Firebase CLI:
```bash
npm install -g firebase-tools
```

### Fazer login:
```bash
firebase login
```

### Iniciar projeto na pasta:
```bash
cd pasta-do-projeto
firebase init hosting
```

Responda as perguntas:
- **Projeto**: selecione o projeto criado
- **Pasta pública**: `.` (ponto — usa a pasta atual)
- **SPA (single-page app)?**: `N`
- **Sobrescrever index.html?**: `N`

### Publicar:
```bash
firebase deploy --only hosting
```

Ao final você receberá uma URL como:
`https://sorteio-rh-empresa.web.app`

---

## Passo 8 — Compartilhar os links

| Página | Link |
|--------|------|
| Painel RH | `https://SEU-PROJETO.web.app/rh.html` |
| Participantes | `https://SEU-PROJETO.web.app/participante.html?sorteio=ID_DO_SORTEIO` |

> O link com o ID do sorteio é gerado automaticamente no painel do RH após criar um sorteio.

---

## Fluxo de uso

### RH:
1. Acessa `rh.html` e faz login
2. Cria sorteio (nome, tema, opções, período, quantidade de ganhadores)
3. Copia o link de participação e envia para os colaboradores
4. Acompanha inscritos em tempo real
5. Após o encerramento, clica em **"Realizar sorteio"**
6. Os ganhadores são exibidos publicamente

### Participante:
1. Acessa o link enviado pelo RH
2. Preenche nome, sobrenome, e-mail corporativo e escolhe a opção
3. Confirma inscrição (apenas 1 vez por sorteio)
4. Pode acompanhar a lista de inscritos e resultado em tempo real

---

## Regras de negócio implementadas

- ✅ E-mail válido: apenas @etus.com.br, @brius.com.br, @bhaz.com.br
- ✅ Participação única por sorteio (identificada pelo e-mail)
- ✅ Trava de horário (início e fim configuráveis pelo RH)
- ✅ Opções: seleção única ou múltipla escolha
- ✅ Lista de participantes visível publicamente
- ✅ Ganhadores exibidos após o sorteio
- ✅ Sorteio aleatório justo (Fisher-Yates shuffle)
- ✅ Dados salvos no Firestore (nuvem Google)
- ✅ Atualização em tempo real (onSnapshot)
