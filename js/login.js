const USERS_KEY = "ubipet_users";
const SESSION_KEY = "ubipet_session";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getSession() {
  return readJson(SESSION_KEY, null);
}

export function closeSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function registrar() {
  const email = document.getElementById("email")?.value?.trim().toLowerCase();
  const password = document.getElementById("password")?.value ?? "";

  if (!email || !password) return alert("Completa correo y contraseña.");

  const users = readJson(USERS_KEY, []);
  if (users.some((u) => u.email === email)) return alert("Ese correo ya existe.");

  users.push({ email, password });
  writeJson(USERS_KEY, users);
  alert("Cuenta creada ✅");
}

export function login() {
  const email = document.getElementById("email")?.value?.trim().toLowerCase();
  const password = document.getElementById("password")?.value ?? "";

  if (!email || !password) return alert("Completa correo y contraseña.");

  const users = readJson(USERS_KEY, []);
  const ok = users.some((u) => u.email === email && u.password === password);
  if (!ok) return alert("Credenciales inválidas.");

  writeJson(SESSION_KEY, { email, ts: Date.now() });
  window.location.href = "perfil.html";
}

export function initAuthPage() {
  // Compatibilidad con HTML cacheado que aún use onclick="login()/registrar()"
  window.login = login;
  window.registrar = registrar;

  document.getElementById("btnRegistrar")?.addEventListener("click", registrar);
  document.getElementById("btnLogin")?.addEventListener("click", login);
}
