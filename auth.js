// =========================================================
// B2J — Authentification & permissions (PROTOTYPE côté client)
// ---------------------------------------------------------
// ATTENTION : ce fichier est un prototype de démonstration.
// Les identifiants sont stockés dans le navigateur (localStorage),
// pas sur un serveur. Ils sont visibles par quiconque ouvre les
// outils de développement. Ne jamais utiliser de vrais mots de
// passe sensibles tant qu'un vrai backend n'a pas remplacé ce
// système. Les données ne sont pas partagées entre appareils.
// =========================================================

const B2J_USERS_KEY = 'b2j_users';
const B2J_SESSION_KEY = 'b2j_session';

const ROLE_LABELS = {
  direction: 'Direction',
  secretaire: 'Secrétaire',
  employe: 'Employé',
};

const ROLE_DEFAULT_PERMISSIONS = {
  direction: { fichiers: true, planning: true, devis: true, photos: true, admin: true },
  secretaire: { fichiers: true, planning: true, devis: true, photos: false, admin: false },
  employe: { fichiers: false, planning: true, devis: false, photos: true, admin: false },
};

function seedUsersIfEmpty() {
  const existing = localStorage.getItem(B2J_USERS_KEY);
  if (existing) return;
  const defaults = [
    { id: 'u1', nom: 'Direction B2J', username: 'direction', password: 'direction2026', role: 'direction', permissions: { ...ROLE_DEFAULT_PERMISSIONS.direction } },
    { id: 'u2', nom: 'Secrétariat', username: 'secretaire', password: 'secretaire2026', role: 'secretaire', permissions: { ...ROLE_DEFAULT_PERMISSIONS.secretaire } },
    { id: 'u3', nom: 'Équipe terrain', username: 'employe', password: 'employe2026', role: 'employe', permissions: { ...ROLE_DEFAULT_PERMISSIONS.employe } },
  ];
  localStorage.setItem(B2J_USERS_KEY, JSON.stringify(defaults));
}

function getUsers() {
  seedUsersIfEmpty();
  try { return JSON.parse(localStorage.getItem(B2J_USERS_KEY)) || []; }
  catch (e) { return []; }
}

function saveUsers(users) {
  localStorage.setItem(B2J_USERS_KEY, JSON.stringify(users));
}

function findUserByUsername(username) {
  return getUsers().find(u => u.username.toLowerCase() === String(username).toLowerCase());
}

function attemptLogin(username, password) {
  const user = findUserByUsername(username);
  if (!user || user.password !== password) return null;
  const session = {
    id: user.id, nom: user.nom, username: user.username,
    role: user.role, permissions: user.permissions,
  };
  sessionStorage.setItem(B2J_SESSION_KEY, JSON.stringify(session));
  return session;
}

function getSession() {
  try { return JSON.parse(sessionStorage.getItem(B2J_SESSION_KEY)); }
  catch (e) { return null; }
}

function logout() {
  sessionStorage.removeItem(B2J_SESSION_KEY);
  window.location.href = 'login.html';
}

// Call at the top of any protected page.
// requiredPermission: e.g. 'admin' — pass null to just require "logged in".
function requireSession(requiredPermission) {
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  if (requiredPermission && !session.permissions[requiredPermission]) {
    window.location.href = 'portail.html?refuse=1';
    return null;
  }
  return session;
}

function roleLabel(role) {
  return ROLE_LABELS[role] || role;
}

// ---- Generic demo data collections (planning / devis / fichiers / photos) ----
function getCollection(key, seedFn) {
  const existing = localStorage.getItem(key);
  if (existing) {
    try { return JSON.parse(existing); } catch (e) { /* fall through to reseed */ }
  }
  const seeded = seedFn ? seedFn() : [];
  localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

function saveCollection(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
}

function uid() {
  return 'id' + Math.random().toString(36).slice(2, 10);
}
