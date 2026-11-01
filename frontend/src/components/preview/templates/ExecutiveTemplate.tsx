import type { DocumentView } from '../useDocumentView';
import { pageClasses } from './PageShell';
import { ClientAddress, ClientName, DetailRows, ItemRows, NotesAndSignature, PaymentStrip, TotalLines } from './Extras';
import classes from './Executive.module.css';

export function ExecutiveTemplate({ view }: { view: DocumentView }) {
  const { from, client } = view;
  const contact = [view.fromContact, from.gstin ? `GSTIN ${from.gstin}` : ''].filter(Boolean).join(' · ');

  return (
    <>
      <div className={classes.letterhead}>
        {view.logo && <img src={view.logo} alt="" className={classes.logo} />}
        <div className={classes.firm}>{from.name || 'Your business'}</div>
        {from.address && <div className={classes.firmLines}>{from.address}</div>}
        {contact && <div className={classes.firmLines}>{contact}</div>}
      </div>

      <div className={classes.heading}>
        <div className={classes.title}>{view.heading}</div>
        <div className={classes.number}>No. {view.number}</div>
      </div>

      <div className={classes.parties}>
        <div>
          <div className={classes.label}>{view.clientLabel}</div>
          <ClientName view={view} className={classes.clientName} />
          <ClientAddress view={view} className={classes.lines} />
          {client.gstin && <div className={classes.lines}>GSTIN {client.gstin}</div>}
          {view.clientContact && <div className={classes.lines}>{view.clientContact}</div>}
        </div>
        <DetailRows rows={view.meta} />
      </div>

      <table className={classes.items}>
        <thead>
          <tr>
            <th className={classes.index}>#</th>
            <th>Particulars</th>
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
