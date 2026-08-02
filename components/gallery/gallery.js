/**
 * Gallery component — lightbox with zoom/pan, keyboard nav, swipe and preloading
 */

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const TAP_ZOOM_SCALE = 2.2;

export function initGallery() {
  const grid = document.querySelector("[data-gallery]");
  const lightbox = document.querySelector("[data-lightbox]");
  if (!grid || !lightbox) return;

  const triggers = Array.from(grid.querySelectorAll("[data-lightbox-trigger]"));
  if (!triggers.length) return;

  const figure = lightbox.querySelector("[data-lightbox-figure]");
  const image = lightbox.querySelector("[data-lightbox-image]");
  const caption = lightbox.querySelector("[data-lightbox-caption]");
  const counter = lightbox.querySelector("[data-lightbox-counter]");
  const closeBtn = lightbox.querySelector("[data-lightbox-close]");
  const prevBtn = lightbox.querySelector("[data-lightbox-prev]");
  const nextBtn = lightbox.querySelector("[data-lightbox-next]");
  const zoomToggleBtn = lightbox.querySelector("[data-lightbox-zoom-toggle]");

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

  // ---- Zoom / pan state ----
  let scale = 1;
  let panX = 0;
  let panY = 0;

  function applyTransform(animate) {
    image.style.transition = animate ? "" : "none";
    image.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    figure.classList.toggle("is-zoomed", scale > 1.01);
  }

  function clampPan() {
    const maxX = Math.max(0, (image.clientWidth * (scale - 1)) / 2);
    const maxY = Math.max(0, (image.clientHeight * (scale - 1)) / 2);
    panX = Math.min(maxX, Math.max(-maxX, panX));
    panY = Math.min(maxY, Math.max(-maxY, panY));
  }

  function resetZoom(animate) {
    scale = 1;
    panX = 0;
    panY = 0;
    applyTransform(animate);
  }

  function zoomAt(clientX, clientY, targetScale, animate) {
    targetScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, targetScale));
    // `figure` itself is never transformed, so its rect is a stable
    // reference for the image's untransformed center — the fixed point
    // that `scale()` (transform-origin: center, the default) scales
    // around. Keeping the cursor's point fixed on screen while scale
    // changes from `scale` to `targetScale` requires:
    //   newPan = oldPan - (targetScale - scale) * (cursor - origin)
    const rect = figure.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const deltaScale = targetScale - scale;

    panX -= deltaScale * (clientX - originX);
    panY -= deltaScale * (clientY - originY);
    scale = targetScale;

    clampPan();
    applyTransform(animate);
  }

  function toggleZoomAt(clientX, clientY) {
    if (scale > 1.01) resetZoom(true);
    else zoomAt(clientX, clientY, TAP_ZOOM_SCALE, true);
  }

  // ---- Preload ----
  function preload(src) {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  }

  function render(index) {
    resetZoom(false);
    const item = items[index];
    image.src = item.src;
    image.alt = item.alt;
    caption.textContent = item.label;
    counter.textContent = `${index + 1} / ${items.length}`;
    preload(items[(index + 1) % items.length].src);
    preload(items[(index - 1 + items.length) % items.length].src);
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
      resetZoom(false);
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
  lightbox.querySelector(".lightbox__backdrop").addEventListener("click", close);

  zoomToggleBtn.addEventListener("click", () => {
    const rect = image.getBoundingClientRect();
    toggleZoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });

  // ---- Desktop: wheel zoom ----
  figure.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const factor = event.deltaY < 0 ? 1.15 : 1 / 1.15;
      zoomAt(event.clientX, event.clientY, scale * factor, false);
    },
    { passive: false }
  );

  // ---- Unified pointer handling: pan, pinch, swipe, tap/double-click ----
  // A single pointer-based path handles double-click (desktop) and
  // double-tap (mobile) identically, avoiding a separate native
  // `dblclick` listener — once `setPointerCapture` is active, browsers
  // retarget compatibility mouse events, which caused double firing.
  const activePointers = new Map();
  let pinchState = null;
  let tapState = null;
  let lastTap = null;

  function points() {
    return Array.from(activePointers.values());
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function midpoint(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  // A single-pointer gesture is only classified as a tap, a pan, or a
  // swipe once it ends — not by the zoom level when it started. That
  // way a click/tap on an already-zoomed image can still register as a
  // "second tap" and toggle the zoom back off, while a real drag still
  // pans live as it moves.
  figure.addEventListener("pointerdown", (event) => {
    figure.setPointerCapture(event.pointerId);
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (activePointers.size === 2) {
      tapState = null;
      figure.classList.remove("is-dragging");
      const [a, b] = points();
      pinchState = { startDist: distance(a, b), startScale: scale };
    } else if (activePointers.size === 1) {
      tapState = {
        startClientX: event.clientX,
        startClientY: event.clientY,
        startTime: Date.now(),
        startPanX: panX,
        startPanY: panY,
        wasZoomed: scale > 1.01,
        pointerType: event.pointerType,
      };
      if (tapState.wasZoomed) figure.classList.add("is-dragging");
    }
  });

  figure.addEventListener("pointermove", (event) => {
    if (!activePointers.has(event.pointerId)) return;
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (activePointers.size === 2 && pinchState) {
      const [a, b] = points();
      const ratio = distance(a, b) / pinchState.startDist;
      const mid = midpoint(a, b);
      zoomAt(mid.x, mid.y, pinchState.startScale * ratio, false);
    } else if (activePointers.size === 1 && tapState && tapState.wasZoomed) {
      panX = tapState.startPanX + (event.clientX - tapState.startClientX);
      panY = tapState.startPanY + (event.clientY - tapState.startClientY);
      clampPan();
      applyTransform(false);
    }
  });

  function endPointer(event) {
    activePointers.delete(event.pointerId);

    if (activePointers.size < 2) pinchState = null;

    if (activePointers.size < 1 && tapState) {
      const dx = event.clientX - tapState.startClientX;
      const dy = event.clientY - tapState.startClientY;
      const moved = Math.hypot(dx, dy);
      const elapsed = Date.now() - tapState.startTime;

      if (tapState.wasZoomed) {
        figure.classList.remove("is-dragging");
        applyTransform(true);
      }

      if (moved < 10 && elapsed < 300) {
        const now = Date.now();
        if (lastTap && now - lastTap.time < 350 && distance(lastTap, { x: event.clientX, y: event.clientY }) < 30) {
          toggleZoomAt(event.clientX, event.clientY);
          lastTap = null;
        } else {
          lastTap = { time: now, x: event.clientX, y: event.clientY };
        }
      } else if (!tapState.wasZoomed && tapState.pointerType !== "mouse" && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) show(-1);
        else show(1);
      }

      tapState = null;
    }
  }

  figure.addEventListener("pointerup", endPointer);
  figure.addEventListener("pointercancel", endPointer);
}
