/**
 * Final CTA component — a lightweight countdown (days/hours/minutes)
 * reinforcing the limited-time offer. Updates once a minute, not every
 * second, to stay calm/non-distracting and cheap to run.
 */

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function initCountdown() {
  const root = document.querySelector("[data-countdown]");
  if (!root) return;

  const daysEl = root.querySelector("[data-countdown-days]");
  const hoursEl = root.querySelector("[data-countdown-hours]");
  const minutesEl = root.querySelector("[data-countdown-minutes]");
  const target = Date.now() + THREE_DAYS_MS;

  function render() {
    const remaining = Math.max(0, target - Date.now());
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");

    if (remaining <= 0) clearInterval(timer);
  }

  render();
  const timer = setInterval(render, 60000);
}
