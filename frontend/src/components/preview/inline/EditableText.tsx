import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { InlineCommit } from './InlineEditContext';
import type { InlineTarget } from './inlineTargets';
import classes from './EditableText.module.css';

export interface InlineTextProps {
  target: InlineTarget;
  value: string;
  label: string;
  display?: string;
  fallback?: string;
  placeholder?: string;
  multiline?: boolean;
  block?: boolean;
  className?: string;
}

function selectAll(node: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(node);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function readText(node: HTMLElement, multiline: boolean): string {
  const text = (node.textContent ?? '').replace(/ /g, ' ');
  return multiline ? text.replace(/\s+$/, '') : text.trim();
}

export function EditableText({
  target,
  value,
  label,
  display,
  fallback,
  placeholder,
  multiline = false,
  block = false,
  className,
  commit,
}: InlineTextProps & { commit: InlineCommit }) {
  const node = useRef<HTMLSpanElement>(null);
  const cancelled = useRef(false);
  const [editing, setEditing] = useState(false);
  const [revision, setRevision] = useState(0);
  const shown = editing ? value : display ?? value;

  useLayoutEffect(() => {
    const el = node.current;
    if (!el) return;
    if (el.textContent !== shown) el.textContent = shown;
    if (editing && display !== undefined && document.activeElement === el) selectAll(el);
  }, [shown, revision, editing, display]);

  const finish = () => {
    const el = node.current;
    setEditing(false);
    setRevision((count) => count + 1);
    if (!el || cancelled.current) {
      cancelled.current = false;
      return;
    }
    const next = readText(el, multiline);
    if (next !== value) commit(target, next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Escape') {
      cancelled.current = true;
      event.currentTarget.blur();
      return;
    }
    if (event.key === 'Enter' && (!multiline || event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  return (
    <span
      ref={node}
      className={className ? `${className} ${classes.editable}` : classes.editable}
      data-block={block || undefined}
      data-multiline={multiline || undefined}
      data-placeholder={fallback ?? placeholder}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      role="textbox"
      aria-label={label}
      aria-multiline={multiline || undefined}
      onFocus={() => setEditing(true)}
      onBlur={finish}
      onKeyDown={onKeyDown}
    />
  );
}
