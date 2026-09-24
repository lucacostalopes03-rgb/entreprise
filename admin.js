// =========================================================
// B2J — Administration des utilisateurs (PROTOTYPE côté client)
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  const session = getSession();
  if (!session) return;

  document.getElementById('userName').textContent = session.nom;
  document.getElementById('userRole').textContent = roleLabel(session.role);
  document.getElementById('logoutBtn').addEventListener('click', logout);

  const tbody = document.querySelector('#usersTable tbody');
  const backdrop = document.getElementById('formBackdrop');
  const form = document.getElementById('userForm');
  const formTitle = document.getElementById('formTitle');
  const roleSelect = document.getElementById('f-role');
  const permInputs = Array.from(document.querySelectorAll('.perm-check input'));

  function renderTable() {
    const users = getUsers();
    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${u.nom}</td>
        <td>${u.username}</td>
        <td>${roleLabel(u.role)}</td>
        <td class="perm-cell">
          ${Object.entries(u.permissions).filter(([, v]) => v).map(([k]) => `<span class="perm-tag">${permLabel(k)}</span>`).join(' ') || '<span class="perm-tag perm-tag--none">Aucun</span>'}
        </td>
        <td class="admin-actions">
          <button type="button" class="link-btn" data-edit="${u.id}">Modifier</button>
          <button type="button" class="link-btn link-btn--danger" data-del="${u.id}">Supprimer</button>
        </td>
      </tr>`).join('');

    tbody.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openForm(btn.dataset.edit)));
    tbody.querySelectorAll('[data-del]').forEach(btn => btn.addEventListener('click', () => deleteUser(btn.dataset.del)));
  }

  function permLabel(key) {
    return { planning: 'Planning', devis: 'Devis', fichiers: 'Fichiers', photos: 'Photos', admin: 'Admin' }[key] || key;
  }

  function deleteUser(id) {
    const users = getUsers();
    const target = users.find(u => u.id === id);
    if (!target) return;
    const admins = users.filter(u => u.permissions.admin);
    if (target.permissions.admin && admins.length <= 1) {
      alert("Impossible de supprimer le dernier compte disposant des droits d'administration.");
      return;
    }
    if (!confirm(`Supprimer le compte « ${target.nom} » ?`)) return;
    saveUsers(users.filter(u => u.id !== id));
    renderTable();
  }

  function applyRoleDefaults() {
    const defaults = ROLE_DEFAULT_PERMISSIONS[roleSelect.value] || {};
    permInputs.forEach(input => {
      input.checked = !!defaults[input.dataset.perm];
    });
  }

  roleSelect.addEventListener('change', applyRoleDefaults);

  function openForm(editId) {
    form.reset();
    document.getElementById('f-id').value = editId || '';

    if (editId) {
      const user = getUsers().find(u => u.id === editId);
      formTitle.textContent = 'Modifier l\u2019utilisateur';
      document.getElementById('f-nom').value = user.nom;
      document.getElementById('f-username').value = user.username;
      document.getElementById('f-password').value = user.password;
      roleSelect.value = user.role;
      permInputs.forEach(input => { input.checked = !!user.permissions[input.dataset.perm]; });
    } else {
      formTitle.textContent = 'Nouvel utilisateur';
      roleSelect.value = 'employe';
      applyRoleDefaults();
    }
    backdrop.hidden = false;
  }

  function closeForm() { backdrop.hidden = true; }

  document.getElementById('newUserBtn').addEventListener('click', () => openForm(null));
  document.getElementById('cancelFormBtn').addEventListener('click', closeForm);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeForm(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('f-id').value;
    const nom = document.getElementById('f-nom').value.trim();
    const username = document.getElementById('f-username').value.trim();
    const password = document.getElementById('f-password').value;
    const role = roleSelect.value;
    const permissions = {};
    permInputs.forEach(input => { permissions[input.dataset.perm] = input.checked; });

    const users = getUsers();
    const clash = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.id !== id);
    if (clash) {
      alert('Cet identifiant est déjà utilisé par un autre compte.');
      return;
    }

    if (id) {
      const idx = users.findIndex(u => u.id === id);
      users[idx] = { ...users[idx], nom, username, password, role, permissions };
    } else {
      users.push({ id: uid(), nom, username, password, role, permissions });
    }
    saveUsers(users);
    closeForm();
    renderTable();
  });

  renderTable();
});
