/**
 * Gallery component — lightbox with keyboard nav and touch swipe
 */

export function initGallery() {
  const grid = document.querySelector("[data-gallery]");
  const lightbox = document.querySelector("[data-lightbox]");
  if (!grid || !lightbox) return;

  const triggers = Array.from(grid.querySelectorAll("[data-lightbox-trigger]"));
  if (!triggers.length) return;

  const image = lightbox.querySelector("[data-lightbox-image]");
  const caption = lightbox.querySelector("[data-lightbox-caption]");
  const closeBtn = lightbox.querySelector("[data-lightbox-close]");
  const prevBtn = lightbox.querySelector("[data-lightbox-prev]");
  const nextBtn = lightbox.querySelector("[data-lightbox-next]");

  let currentIndex = 0;
  let lastFocused = null;

  const items = triggers.map((trigger) => {
    const img = trigger.querySelector("img");
    return {
      src: img.src,
      alt: img.alt,
      label: trigger.dataset.label || "",
    };
  });

  function render(index) {
    const item = items[index];
    image.src = item.src;
    image.alt = item.alt;
    caption.textContent = `${item.label} — ${index + 1} / ${items.length}`;
  }

  function open(index) {
    currentIndex = index;
    lastFocused = document.activeElement;
    render(currentIndex);
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add("is-open"));
    document.body.style.overflow = "hidden";
    closeBtn.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function close() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKeydown);
    window.setTimeout(() => {
      lightbox.hidden = true;
      image.src = "";
    }, 250);
    if (lastFocused) lastFocused.focus();
  }

  function show(delta) {
    currentIndex = (currentIndex + delta + items.length) % items.length;
    render(currentIndex);
  }

  function onKeydown(event) {
    if (event.key === "Escape") close();
    if (event.key === "ArrowRight") show(1);
    if (event.key === "ArrowLeft") show(-1);
  }

  triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => open(index));
  });

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => show(-1));
  nextBtn.addEventListener("click", () => show(1));

  lightbox.querySelectorAll("[data-lightbox-close]").forEach((el) => {
    el.addEventListener("click", close);
  });

  // Touch swipe support
  let touchStartX = 0;
  const figure = lightbox.querySelector(".lightbox__figure");

  figure.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.touches[0].clientX;
    },
    { passive: true }
  );

  figure.addEventListener(
    "touchend",
    (event) => {
      const deltaX = event.changedTouches[0].clientX - touchStartX;
      const threshold = 40;
      if (deltaX > threshold) show(-1);
      else if (deltaX < -threshold) show(1);
    },
    { passive: true }
  );
}
