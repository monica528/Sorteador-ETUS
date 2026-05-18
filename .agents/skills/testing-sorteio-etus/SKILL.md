# Testing Sorteio ETUS Platform

## Overview
Sorteio ETUS is a corporate raffle platform built with Vite + React 19 + Firebase (Firestore). It has two roles: RH (admin) and Participant (collaborador).

## Devin Secrets Needed
No secrets required for local testing — mock auth bypasses Google OAuth.

For production testing, you would need Firebase project credentials (already in `src/firebase.js`).

## Local Dev Setup
```bash
cd /home/ubuntu/repos/Sorteador-ETUS
npm install
npx vite --host 0.0.0.0 --port 5174
```

## Mock Auth for Testing
Since the app uses Google OAuth restricted to `@etus.com.br` and `@bhaz.com.br` domains, you need mock auth for local testing.

### How to Set Up Mock Auth
Modify `src/AuthContext.jsx` to add mock users:

1. Add mock user objects before the `AuthProvider` component:
```javascript
const MOCK_USERS = {
  rh: {
    uid: 'mock-rh-001',
    email: 'monica@etus.com.br',
    displayName: 'Monica RH',
  },
  participante: {
    uid: 'mock-part-001',
    email: 'joao@etus.com.br',
    displayName: 'Joao Silva',
  },
};

function getMockRole() {
  const params = new URLSearchParams(window.location.search);
  return params.get('mock') || 'rh';
}
```

2. In the `useEffect` of `AuthProvider`, add mock login before the real `onAuthStateChanged`:
```javascript
const mockRole = getMockRole();
if (window.location.search.includes('mock=')) {
  setUser(MOCK_USERS[mockRole]);
  setLoading(false);
  return;
}
```

3. Access different roles via URL params:
   - **RH (admin)**: `http://localhost:5174/?mock=rh`
   - **Participant**: `http://localhost:5174/?mock=participante`

**Important**: Revert mock auth changes before committing/merging.

## Key Test Scenarios

### Full E2E Flow (10 tests)
1. **RH Dashboard** (`/rh?mock=rh`) — Verify 8 sidebar nav items, 4 metric cards, user info
2. **Create Event** (`/rh/criar`) — Fill form with name, type (9 types available), dates, tickets, winners
3. **Participant Joins** (`/?mock=participante`) — See events, click "Participar", status changes to "Participando"
4. **Single-Raffle Restriction** — Create 2nd event, try to join → alert: "Voce ja esta participando de outro sorteio ativo"
5. **Draw Winners** (`/rh/sortear`) — Select event, click "Realizar Sorteio", see 🎲 "Sorteando..." animation (~2.5s), winners shown with 🏆
6. **Results & Celebration** (`/?mock=participante`) — "Resultados Recentes" section, click "Voce ganhou!" → confetti modal
7. **Rankings** (`/rankings`) — 2 tabs: "Maiores Ganhadores" and "Maior Participacao"
8. **Historico** (`/historico`) — Search filter + type dropdown, finished events with winner badges
9. **RH Settings** (`/rh/configuracoes`) — 4 admin emails, 2 authorized domains, admin action logs
10. **Meus Sorteios** (`/meus-sorteios`) — 4 stat cards, event history with result badges

## RH Admin Emails
- `rh@etus.com.br`
- `monica@etus.com.br`
- `felipe.moreira@etus.com.br`
- `vanessa.teixeira@etus.com.br`

## Authorized Domains
- `@etus.com.br`
- `@bhaz.com.br`

## Firebase Collections
- `events` — Event documents with name, type, dates, status
- `event_participants` — Participation records linking users to events
- `admin_logs` — Audit trail of admin actions (create_event, draw_event)

## Common Issues
- **Date input format**: Browser date inputs use `mm/dd/yyyy` format. Type dates as `MMDDYYYY` (e.g., `05012026` for May 1, 2026).
- **Event type dropdown**: Defaults to Cinema. Make sure to change it if testing a different type.
- **Firestore indexes**: On first run, Firestore might require composite indexes. Check browser console for index creation links.
- **Google OAuth `auth/unauthorized-domain`**: The Netlify domain must be added to Firebase Console → Authentication → Settings → Authorized domains.
- **Deploy preview domains**: Each deploy preview has a unique subdomain that also needs to be authorized in Firebase if testing OAuth there.

## Event Types
Cinema (🎬), Show (🎤), Teatro (🎭), Curso (📚), Palestra (🎙️), Feira (🎪), Viagem (✈️), Kits (🎁), Outros (🎉)

## Deploy
- **Production**: https://transcendent-dolphin-1d34ae.netlify.app
- **Deploy previews**: `https://deploy-preview-{N}--transcendent-dolphin-1d34ae.netlify.app`
