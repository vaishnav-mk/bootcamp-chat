import { useEffect } from "react";

export function useLowercase() {
  useEffect(() => {
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        const selectionStart = target.selectionStart;
        const selectionEnd = target.selectionEnd;

        target.value = target.value.toLowerCase();

        if (selectionStart !== null && selectionEnd !== null) {
          target.setSelectionRange(selectionStart, selectionEnd);
        }
      }
    };

    document.addEventListener("input", handleInput);

    return () => {
      document.removeEventListener("input", handleInput);
    };
  }, []);
}
