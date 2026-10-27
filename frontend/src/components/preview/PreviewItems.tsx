import { formatMoney } from '@/lib/format';
import type { DocumentDraft } from '@/types/document';
import classes from './DocumentPreview.module.css';

export function PreviewItems({ draft }: { draft: DocumentDraft }) {
  const items = draft.items.filter((item) => item.description || item.amount);
  const money = (value: number) => formatMoney(value, draft.currency);

  return (
    <table className={classes.table}>
      <thead>
        <tr>
          <th className={classes.index}>#</th>
          <th>Item</th>
          <th className={classes.num}>Qty</th>
          <th className={classes.num}>Rate</th>
          <th className={classes.num}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.id}>
            <td className={classes.index}>{index + 1}</td>
            <td>{item.description}</td>
            <td className={classes.num}>{item.quantity}</td>
            <td className={classes.num}>{money(item.rate)}</td>
            <td className={classes.num}>{money(item.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
