export class TextReplacer {
  /**
   * Replace selected text in the DOM.
   * Handles: <input>, <textarea>, contenteditable, and plain selection.
   */
  static replace(newText: string): boolean {
    const activeEl = document.activeElement as HTMLElement | null;

    // Handle <input> and <textarea>
    if (
      activeEl instanceof HTMLInputElement ||
      activeEl instanceof HTMLTextAreaElement
    ) {
      return this.replaceInInput(activeEl, newText);
    }

    // Handle contenteditable
    if (activeEl?.isContentEditable) {
      return this.replaceInContentEditable(newText);
    }

    // Fallback: plain selection replacement (read-only pages, etc.)
    return this.replaceWithExecCommand(newText);
  }

  private static replaceInInput(
    el: HTMLInputElement | HTMLTextAreaElement,
    newText: string
  ): boolean {
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const value = el.value;

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set;

    const setter =
      el instanceof HTMLInputElement ? nativeInputValueSetter : nativeTextareaValueSetter;

    if (setter) {
      setter.call(el, value.slice(0, start) + newText + value.slice(end));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // Direct assignment fallback
      el.value = value.slice(0, start) + newText + value.slice(end);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Restore cursor position after replacement
    const newCursorPos = start + newText.length;
    el.setSelectionRange(newCursorPos, newCursorPos);
    return true;
  }

  private static replaceInContentEditable(newText: string): boolean {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(newText);
    range.insertNode(textNode);

    // Move cursor to end of inserted text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    // Dispatch input event for frameworks like React/Vue
    const el = selection.anchorNode?.parentElement;
    if (el) {
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    return true;
  }

  private static replaceWithExecCommand(newText: string): boolean {
    try {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      return document.execCommand('insertText', false, newText);
    } catch {
      return false;
    }
  }
}
