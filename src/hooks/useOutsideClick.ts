import { useEffect, useRef } from "react";

/**
 * Hook that calls a handler when a click or touch event occurs outside of the referenced element.
 * Listens to `pointerdown`, `touchstart`, and `mousedown` to ensure full compatibility with touch devices (iOS Safari).
 */
export function useOutsideClick<T extends HTMLElement = HTMLElement>(
  handler: (event: Event) => void,
  enabled: boolean = true,
) {
  const ref = useRef<T>(null);
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    const listener = (event: MouseEvent | TouchEvent | PointerEvent) => {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handlerRef.current(event);
    };

    // Capture phase + passive: iOS Safari never fires `click` for taps on
    // non-interactive elements, and ancestors that stop propagation would
    // otherwise swallow the event before it reaches `document`.
    const options: AddEventListenerOptions = { capture: true, passive: true };
    document.addEventListener("pointerdown", listener, options);
    document.addEventListener("touchstart", listener, options);
    document.addEventListener("mousedown", listener, options);

    return () => {
      document.removeEventListener("pointerdown", listener, options);
      document.removeEventListener("touchstart", listener, options);
      document.removeEventListener("mousedown", listener, options);
    };
  }, [enabled]);

  return ref;
}
