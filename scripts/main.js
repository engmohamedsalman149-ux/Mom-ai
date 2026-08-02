/**
 * Entry point — "أم ذكية"
 * Component scripts will be imported and initialized here as they are built.
 */

import { initHeader } from "../components/header/header.js";
import { initHero } from "../components/hero/hero.js";
import { initScrollReveal } from "../components/features/features.js";
import { initGallery } from "../components/gallery/gallery.js";
import { initRoadmap } from "../components/roadmap/roadmap.js";

document.documentElement.classList.add("js-enabled");

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("is-ready");
  initHeader();
  initHero();
  initScrollReveal();
  initGallery();
  initRoadmap();
});
