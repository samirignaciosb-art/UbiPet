import supabaseClient from "./supabase.js";

export async function registrar() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Completa todos los campos");
    return;
  }

  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.origin + "/index.html" }
  });

  if (error) alert("Error: " + error.message);
  else alert("Revisa tu correo para confirmar la cuenta 📩");
}

export async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Completa todos los campos");
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) alert("Error: " + error.message);
  else {
    alert("Inicio de sesión correcto ✅");
    window.location.href = "perfil.html";
  }
}
