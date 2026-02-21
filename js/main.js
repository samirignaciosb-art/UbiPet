import { initAuthPage } from "./login.js";
import { initPerfilPage } from "./perfil.js";
import { initRescatePage } from "./rescate.js";

export function initApp() {
  const page = document.body.dataset.page;

  if (page === "index") initAuthPage();
  if (page === "perfil") initPerfilPage();
  if (page === "rescate") initRescatePage();
}
