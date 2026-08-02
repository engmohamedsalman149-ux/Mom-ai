/**
 * FAQ component — accordion where opening one question closes the rest.
 * Height animation is handled entirely by CSS (grid-template-rows),
 * so this only toggles state/ARIA attributes.
 */

export function initFaq() {
  const items = document.querySelectorAll("[data-faq-item]");
  if (!items.length) return;

  items.forEach((item) => {
    const trigger = item.querySelector("[data-faq-trigger]");
    const answer = item.querySelector("[data-faq-answer]");

    trigger.addEventListener("click", () => {
      const wasOpen = item.classList.contains("is-open");

      items.forEach((other) => {
        other.classList.remove("is-open");
        other.querySelector("[data-faq-trigger]").setAttribute("aria-expanded", "false");
        other.querySelector("[data-faq-answer]").setAttribute("aria-hidden", "true");
      });

      if (!wasOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        answer.setAttribute("aria-hidden", "false");
      }
    });
  });
}
