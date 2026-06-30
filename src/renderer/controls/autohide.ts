// Proximity auto-hide for the bottom control island.
//
// Behaviour: the island is visible at launch, fades out after `launchMs`,
// reappears whenever the pointer comes within `proximity` px of it (or it
// gains keyboard focus), and fades again `lingerMs` after the pointer moves
// away. The island can pin itself visible (e.g. while its panel is expanded)
// by setting data-island-pinned="true" on the node. Setting localStorage
// "mark-rover.island-autohide" to "off" pins it visible — the smoke tests use
// this, mirroring the pretext-probe kill switch.

export interface AutoHideOptions {
  proximity?: number;
  launchMs?: number;
  lingerMs?: number;
}

const disabled = () => localStorage.getItem("mark-rover.island-autohide") === "off";

export function autoHide(node: HTMLElement, options: AutoHideOptions = {}): { destroy(): void } {
  const proximity = options.proximity ?? 140;
  const launchMs = options.launchMs ?? 3200;
  const lingerMs = options.lingerMs ?? 500;

  let hideTimer: ReturnType<typeof setTimeout> | null = null;
  let settled = false;
  let focusWithin = false;

  const pinned = () => node.dataset.islandPinned === "true";

  function show(): void {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    node.classList.remove("island-hidden");
  }

  function hide(): void {
    if (disabled() || pinned() || focusWithin) return;
    node.classList.add("island-hidden");
  }

  function scheduleHide(delay: number = lingerMs): void {
    if (!settled || hideTimer) return;
    hideTimer = setTimeout(() => {
      hideTimer = null;
      hide();
    }, delay);
  }

  function nearPointer(event: MouseEvent): boolean {
    const rect = node.getBoundingClientRect();
    const dx = Math.max(rect.left - event.clientX, event.clientX - rect.right, 0);
    const dy = Math.max(rect.top - event.clientY, event.clientY - rect.bottom, 0);
    return Math.hypot(dx, dy) < proximity;
  }

  function handlePointerMove(event: MouseEvent): void {
    if (nearPointer(event)) {
      show();
    } else {
      scheduleHide();
    }
  }

  function handleFocusIn(): void {
    focusWithin = true;
    show();
  }

  function handleFocusOut(event: FocusEvent): void {
    focusWithin = node.contains(event.relatedTarget as Node | null);
    if (!focusWithin) scheduleHide();
  }

  const launchTimer = setTimeout(() => {
    settled = true;
    scheduleHide(0);
  }, launchMs);

  window.addEventListener("mousemove", handlePointerMove, { passive: true });
  node.addEventListener("focusin", handleFocusIn);
  node.addEventListener("focusout", handleFocusOut);

  return {
    destroy(): void {
      clearTimeout(launchTimer);
      if (hideTimer) clearTimeout(hideTimer);
      window.removeEventListener("mousemove", handlePointerMove);
      node.removeEventListener("focusin", handleFocusIn);
      node.removeEventListener("focusout", handleFocusOut);
    }
  };
}
