/**
 * Entry point — "أم ذكية"
 * Component scripts will be imported and initialized here as they are built.
 */

import { initHeader } from "../components/header/header.js";
import { initHero } from "../components/hero/hero.js";

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("is-ready");
  initHeader();
  initHero();
});
