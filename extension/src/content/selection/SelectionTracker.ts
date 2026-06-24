export interface SelectionInfo {
  text: string;
  rect: DOMRect;
}

export class SelectionTracker {
  private onSelect: (info: SelectionInfo | null) => void;
  private MIN_LENGTH = 10;

  constructor(onSelect: (info: SelectionInfo | null) => void) {
    this.onSelect = onSelect;
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
  }

  start(): void {
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('selectionchange', this.handleSelectionChange);
  }

  stop(): void {
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('selectionchange', this.handleSelectionChange);
  }

  private handleMouseUp(): void {
    // Small delay to ensure selection is finalized
    setTimeout(() => {
      this.checkSelection();
    }, 50);
  }

  private handleSelectionChange(): void {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length < this.MIN_LENGTH) {
      this.onSelect(null);
    }
  }

  private checkSelection(): void {
    const selection = window.getSelection();
    if (!selection) {
      this.onSelect(null);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < this.MIN_LENGTH) {
      this.onSelect(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
      this.onSelect(null);
      return;
    }

    this.onSelect({ text, rect });
  }
}
