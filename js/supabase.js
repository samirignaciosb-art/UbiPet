const noopAuthResponse = { data: null, error: null };
const USE_REMOTE_SUPABASE = false;

function createFallbackClient() {
  return {
    auth: {
      async signUp() {
        return noopAuthResponse;
      },
      async signInWithPassword() {
        return noopAuthResponse;
      },
      async signOut() {
        return noopAuthResponse;
      }
    }
  };
}

let supabaseClient = createFallbackClient();

if (USE_REMOTE_SUPABASE) {
  try {
    if (typeof supabase !== "undefined" && typeof supabase.createClient === "function") {
      supabaseClient = supabase.createClient(
        "https://exeeqykieytuvlzdbsnn.supabase.co",
        "sb_publishable_ffBzZEwygXXuyMDNDWVVoA_qxExK9bl"
      );
    } else {
      console.warn("Supabase SDK no disponible. Se usará modo local.");
    }
  } catch (error) {
    console.warn("No se pudo inicializar Supabase. Se usará modo local.", error);
  }
}

export default supabaseClient;
