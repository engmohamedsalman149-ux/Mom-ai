/**
 * Roadmap component — glowing timeline line that grows to meet each
 * step as it scrolls into view.
 */

export function initRoadmap() {
  const track = document.querySelector("[data-roadmap-fill]");
  const trackWrap = document.querySelector("[data-roadmap-track]");
  const steps = document.querySelectorAll("[data-roadmap-step]");
  if (!track || !trackWrap || !steps.length) return;

  function fillTo(step) {
    const node = step.querySelector(".roadmap__node");
    const wrapRect = trackWrap.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const centerY = nodeRect.top + nodeRect.height / 2 - wrapRect.top;
    track.style.height = `${Math.max(0, centerY)}px`;
  }

  if (!("IntersectionObserver" in window)) {
    fillTo(steps[steps.length - 1]);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) fillTo(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  steps.forEach((step) => observer.observe(step));
}
