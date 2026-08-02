/**
 * Hero component — subtle pointer parallax on the background blobs
 */

export function initHero() {
  const hero = document.getElementById("hero");
  if (!hero) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(pointer: fine)").matches;
  if (prefersReducedMotion || !canHover) return;

  const blobs = hero.querySelectorAll(".hero__blob");
  if (!blobs.length) return;

  hero.addEventListener("pointermove", (event) => {
    const { innerWidth, innerHeight } = window;
    const x = (event.clientX / innerWidth - 0.5) * 2;
    const y = (event.clientY / innerHeight - 0.5) * 2;

    blobs.forEach((blob, index) => {
      const strength = (index + 1) * 8;
      blob.style.translate = `${x * strength}px ${y * strength}px`;
    });
  });
}
