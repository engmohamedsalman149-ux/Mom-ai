/**
 * Testimonials component — syncs the mobile slider dots to the
 * currently-snapped card, and lets a dot click jump to its card.
 */

export function initTestimonialsSlider() {
  const grid = document.querySelector("[data-testimonials-grid]");
  const dotsWrap = document.querySelector("[data-testimonials-dots]");
  if (!grid || !dotsWrap) return;

  const cards = Array.from(grid.querySelectorAll(".testimonial-card"));
  const dots = Array.from(dotsWrap.querySelectorAll("[data-testimonials-dot]"));
  if (!cards.length || cards.length !== dots.length) return;

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      cards[index].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  });

  if (!("IntersectionObserver" in window)) {
    dots[0].classList.add("is-active");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = cards.indexOf(entry.target);
          dots.forEach((dot) => dot.classList.remove("is-active"));
          dots[index].classList.add("is-active");
        }
      });
    },
    { root: grid, threshold: 0.6 }
  );

  cards.forEach((card) => observer.observe(card));
}
