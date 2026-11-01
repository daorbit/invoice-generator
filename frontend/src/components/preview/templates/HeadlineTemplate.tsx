import type { DocumentView } from '../useDocumentView';
import { pageClasses } from './PageShell';
import { AmountWords, ClientAddress, ClientName, DetailRows, ItemRows, NotesAndSignature, PaymentStrip, TotalLines } from './Extras';
import classes from './Headline.module.css';

export function HeadlineTemplate({ view }: { view: DocumentView }) {
  const { from, client } = view;
  const details: [string, string][] = [[view.isInvoice ? 'Invoice No.' : 'Quote No.', view.number], ...view.meta];

  return (
    <>
      <div className={classes.top}>
        <div className={classes.title}>{view.heading}</div>
        {view.logo ? (
          <img src={view.logo} alt="" className={classes.logo} />
        ) : (
          <span className={classes.brand}>{from.name || 'Your business'}</span>
        )}
      </div>

      <div className={classes.hero}>
        <div className={classes.amount}>{view.headline}</div>
        <div className={classes.heroText}>
          {view.dueText ? `${view.headlineLabel} · ${view.dueText}` : view.headlineLabel}
        </div>
      </div>

      <div className={classes.columns}>
        <div>
          <div className={classes.label}>From</div>
          <div className={classes.name}>{from.name || 'Your business'}</div>
          {from.address && <div className={classes.lines}>{from.address}</div>}
          {from.gstin && <div className={classes.lines}>GSTIN {from.gstin}</div>}
          {view.fromContact && <div className={classes.lines}>{view.fromContact}</div>}
        </div>
        <div>
          <div className={classes.label}>{view.clientLabel}</div>
          <ClientName view={view} className={classes.name} />
          <ClientAddress view={view} className={classes.lines} />
          {client.gstin && <div className={classes.lines}>GSTIN {client.gstin}</div>}
          {view.clientContact && <div className={classes.lines}>{view.clientContact}</div>}
        </div>
        <div>
          <div className={classes.label}>Details</div>
          <DetailRows rows={details} />
        </div>
      </div>

      <table className={classes.items}>
        <thead>
          <tr>
            <th>Description</th>
            <th className={classes.num}>Qty</th>
            <th className={classes.num}>Unit price</th>
            <th className={classes.num}>Amount</th>
          </tr>
        </thead>
        <tbody>
          <ItemRows view={view} numClass={classes.num} />
        </tbody>
      </table>

      <div className={classes.totals}>
        <TotalLines view={view} rowClass={classes.totalRow} />
        <div className={`${classes.totalRow} ${classes.grandRow}`}>
          <span>{view.headlineLabel}</span>
          <span>{view.headline}</span>
        </div>
      </div>
      <AmountWords view={view} />
      <PaymentStrip view={view} />

      <div className={pageClasses.push}>
        <div className={classes.footer}>
          <NotesAndSignature view={view} />
        </div>
      </div>
    </>
  );
}
