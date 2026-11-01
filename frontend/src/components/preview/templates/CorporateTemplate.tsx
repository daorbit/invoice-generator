import type { DocumentView } from '../useDocumentView';
import { pageClasses } from './PageShell';
import { ClientAddress, ClientName, DetailRows, ItemRows, NotesAndSignature, PaymentStrip, TotalLines } from './Extras';
import classes from './Corporate.module.css';

export function CorporateTemplate({ view }: { view: DocumentView }) {
  const { from, client } = view;

  return (
    <>
      <div className={classes.strip} />

      <div className={classes.head}>
        <div className={classes.org}>
          {view.logo && <img src={view.logo} alt="" className={classes.logo} />}
          <div className={classes.orgName}>{from.name || 'Your business'}</div>
          {from.address && <div className={classes.lines}>{from.address}</div>}
          {from.gstin && <div className={classes.lines}>GSTIN {from.gstin}</div>}
          {view.fromContact && <div className={classes.lines}>{view.fromContact}</div>}
        </div>
        <div className={classes.titleBlock}>
          <div className={classes.title}>{view.heading}</div>
          <div className={classes.number}>{view.number}</div>
        </div>
      </div>

      <div className={classes.boxes}>
        <div className={classes.box}>
          <div className={classes.label}>{view.clientLabel}</div>
          <ClientName view={view} className={classes.clientName} />
          <ClientAddress view={view} className={classes.lines} />
          {client.gstin && <div className={classes.lines}>GSTIN {client.gstin}</div>}
          {view.clientContact && <div className={classes.lines}>{view.clientContact}</div>}
        </div>
        <div className={classes.box}>
          <div className={classes.label}>Details</div>
          <DetailRows rows={view.meta} />
        </div>
        <div className={`${classes.box} ${classes.dueBox}`}>
          <div className={classes.dueLabel}>{view.headlineLabel}</div>
          <div className={classes.dueAmount}>{view.headline}</div>
          {view.dueText && <div className={classes.dueDate}>{view.dueText}</div>}
        </div>
      </div>

      <table className={classes.items}>
        <thead>
          <tr>
            <th className={classes.index}>#</th>
            <th>Description</th>
            <th className={classes.num}>Qty</th>
            <th className={classes.num}>Rate</th>
            <th className={classes.num}>Amount</th>
          </tr>
        </thead>
        <tbody>
          <ItemRows view={view} numClass={classes.num} indexClass={classes.index} />
        </tbody>
      </table>

      <div className={classes.summary}>
        <div>
          <div className={classes.label}>Amount in words</div>
          <div className={classes.words}>{view.words}</div>
        </div>
        <div className={classes.totals}>
          <TotalLines view={view} rowClass={classes.totalRow} />
          <div className={`${classes.totalRow} ${classes.grandRow}`}>
            <span>{view.headlineLabel}</span>
            <span>{view.headline}</span>
          </div>
        </div>
      </div>

      <PaymentStrip view={view} />

      <div className={pageClasses.push}>
        <div className={classes.footer}>
          <NotesAndSignature view={view} signedFor />
        </div>
      </div>
    </>
  );
}
