// =========================================================
// B2J — Portail équipe (PROTOTYPE côté client)
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  const session = getSession();
  if (!session) return; // requireSession() in the page already redirects

  if (new URLSearchParams(window.location.search).get('refuse')) {
    document.getElementById('deniedNotice').hidden = false;
  }

  document.getElementById('userName').textContent = session.nom;
  document.getElementById('userRole').textContent = roleLabel(session.role);
  if (session.permissions.admin) document.getElementById('adminLink').hidden = false;
  document.getElementById('logoutBtn').addEventListener('click', logout);

  // ---- Tabs: only show sections this user can access ----
  const tabsBar = document.getElementById('portalTabs');
  const tabs = Array.from(tabsBar.querySelectorAll('.portal-tab'));
  const panels = {
    planning: document.getElementById('panel-planning'),
    devis: document.getElementById('panel-devis'),
    fichiers: document.getElementById('panel-fichiers'),
    photos: document.getElementById('panel-photos'),
  };

  let firstAllowed = null;
  tabs.forEach(tab => {
    const key = tab.dataset.tab;
    if (!session.permissions[key]) {
      tab.remove();
      panels[key].remove();
      return;
    }
    if (!firstAllowed) firstAllowed = key;
    tab.addEventListener('click', () => activateTab(key));
  });

  function activateTab(key) {
    tabs.forEach(t => t.classList.toggle('is-active', t.dataset.tab === key));
    Object.entries(panels).forEach(([k, el]) => {
      if (el) el.classList.toggle('is-active', k === key);
    });
  }

  if (firstAllowed) activateTab(firstAllowed);

  // ---- Planning ----
  if (session.permissions.planning) {
    const KEY = 'b2j_planning';
    const tbody = document.querySelector('#planningTable tbody');

    function render() {
      const items = getCollection(KEY, () => ([
        { id: uid(), date: '2026-10-02', client: 'Famille Dubois', adresse: 'Le Locle', equipe: 'Équipe A' },
        { id: uid(), date: '2026-10-06', client: 'Cabinet Meier SA', adresse: 'La Chaux-de-Fonds', equipe: 'Équipe B' },
      ]));
      tbody.innerHTML = items.map(it => `
        <tr>
          <td>${it.date}</td><td>${it.client}</td><td>${it.adresse}</td><td>${it.equipe}</td>
          <td><button class="row-delete" data-id="${it.id}" aria-label="Supprimer">✕</button></td>
        </tr>`).join('') || '<tr><td colspan="5" class="empty-row">Aucune intervention planifiée.</td></tr>';

      tbody.querySelectorAll('.row-delete').forEach(btn => btn.addEventListener('click', () => {
        const next = getCollection(KEY).filter(i => i.id !== btn.dataset.id);
        saveCollection(KEY, next);
        render();
      }));
    }

    document.getElementById('addPlanningBtn').addEventListener('click', () => {
      const date = prompt('Date (AAAA-MM-JJ) :');
      if (!date) return;
      const client = prompt('Client :') || '—';
      const adresse = prompt('Adresse :') || '—';
      const equipe = prompt('Équipe :') || '—';
      const items = getCollection(KEY);
      items.push({ id: uid(), date, client, adresse, equipe });
      saveCollection(KEY, items);
      render();
    });

    render();
  }

  // ---- Devis ----
  if (session.permissions.devis) {
    const KEY = 'b2j_devis';
    const tbody = document.querySelector('#devisTable tbody');

    function render() {
      const items = getCollection(KEY, () => ([
        { id: uid(), client: 'Famille Dubois', prestation: 'Déménagement privé', montant: 'CHF 1 450.-', statut: 'Envoyé' },
        { id: uid(), client: 'Cabinet Meier SA', prestation: 'Déménagement de bureaux', montant: 'CHF 4 200.-', statut: 'Accepté' },
      ]));
      tbody.innerHTML = items.map(it => `
        <tr>
          <td>${it.client}</td><td>${it.prestation}</td><td>${it.montant}</td>
          <td><span class="status-pill status-${(it.statut || '').toLowerCase()}">${it.statut}</span></td>
          <td><button class="row-delete" data-id="${it.id}" aria-label="Supprimer">✕</button></td>
        </tr>`).join('') || '<tr><td colspan="5" class="empty-row">Aucun devis pour le moment.</td></tr>';

      tbody.querySelectorAll('.row-delete').forEach(btn => btn.addEventListener('click', () => {
        const next = getCollection(KEY).filter(i => i.id !== btn.dataset.id);
        saveCollection(KEY, next);
        render();
      }));
    }

    document.getElementById('addDevisBtn').addEventListener('click', () => {
      const client = prompt('Client :');
      if (!client) return;
      const prestation = prompt('Prestation :') || '—';
      const montant = prompt('Montant (ex. CHF 1 200.-) :') || '—';
      const statut = prompt('Statut (Envoyé / Accepté / Refusé) :') || 'Envoyé';
      const items = getCollection(KEY);
      items.push({ id: uid(), client, prestation, montant, statut });
      saveCollection(KEY, items);
      render();
    });

    render();
  }

  // ---- Fichiers ----
  if (session.permissions.fichiers) {
    const KEY = 'b2j_fichiers';
    const list = document.getElementById('fileList');
    const input = document.getElementById('fileInput');

    function render() {
      const items = getCollection(KEY, () => []);
      list.innerHTML = items.map(it => `
        <li class="file-item">
          <a href="${it.data}" download="${it.name}">${it.name}</a>
          <span class="file-meta">${it.size}</span>
          <button class="row-delete" data-id="${it.id}" aria-label="Supprimer">✕</button>
        </li>`).join('') || '<li class="empty-row">Aucun fichier importé.</li>';

      list.querySelectorAll('.row-delete').forEach(btn => btn.addEventListener('click', () => {
        const next = getCollection(KEY).filter(i => i.id !== btn.dataset.id);
        saveCollection(KEY, next);
        render();
      }));
    }

    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      if (file.size > 1.5 * 1024 * 1024) {
        alert('Prototype : merci de choisir un fichier de moins de 1,5 Mo.');
        input.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const items = getCollection(KEY);
        items.push({ id: uid(), name: file.name, size: Math.round(file.size / 1024) + ' Ko', data: reader.result });
        saveCollection(KEY, items);
        render();
        input.value = '';
      };
      reader.readAsDataURL(file);
    });

    render();
  }

  // ---- Photos ----
  if (session.permissions.photos) {
    const KEY = 'b2j_photos';
    const grid = document.getElementById('photoGrid');
    const input = document.getElementById('photoInput');

    function render() {
      const items = getCollection(KEY, () => []);
      grid.innerHTML = items.map(it => `
        <figure class="photo-tile">
          <img src="${it.data}" alt="${it.name}">
          <button class="photo-delete" data-id="${it.id}" aria-label="Supprimer">✕</button>
        </figure>`).join('') || '<p class="empty-row">Aucune photo pour le moment.</p>';

      grid.querySelectorAll('.photo-delete').forEach(btn => btn.addEventListener('click', () => {
        const next = getCollection(KEY).filter(i => i.id !== btn.dataset.id);
        saveCollection(KEY, next);
        render();
      }));
    }

    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      if (file.size > 1.5 * 1024 * 1024) {
        alert('Prototype : merci de choisir une image de moins de 1,5 Mo.');
        input.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const items = getCollection(KEY);
        items.push({ id: uid(), name: file.name, data: reader.result });
        saveCollection(KEY, items);
        render();
        input.value = '';
      };
      reader.readAsDataURL(file);
    });

    render();
  }
});
