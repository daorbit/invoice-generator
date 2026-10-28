import { useInlineCommit } from './InlineEditContext';
import { EditableText, type InlineTextProps } from './EditableText';

export function InlineText(props: InlineTextProps) {
  const commit = useInlineCommit();
  const text = props.display ?? props.value;
  if (commit && (text || props.fallback || props.placeholder)) return <EditableText {...props} commit={commit} />;
  if (!text && !props.fallback) return null;
  const Tag = props.block ? 'div' : 'span';
  return <Tag className={props.className}>{text || props.fallback}</Tag>;
}
