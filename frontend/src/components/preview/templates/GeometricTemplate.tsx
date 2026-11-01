import type { DocumentView } from '../useDocumentView';
import { pageClasses } from './PageShell';
import { AmountWords, ClientAddress, ClientName, DetailRows, ItemRows, NotesAndSignature, PaymentStrip, TotalLines } from './Extras';
import classes from './Geometric.module.css';

export function GeometricTemplate({ view }: { view: DocumentView }) {
  const { from, client } = view;

  return (
    <>
      <span className={classes.circleLarge} aria-hidden="true" />
      <span className={classes.circleSmall} aria-hidden="true" />
      <span className={classes.diamond} aria-hidden="true" />

      <div className={classes.content}>
        <div className={classes.head}>
          {view.logo && <img src={view.logo} alt="" className={classes.logo} />}
          <div className={classes.title}>
            {view.heading}
            <span className={classes.dot}>.</span>
          </div>
          <div className={classes.number}>{view.number}</div>
        </div>

        <div className={classes.grid}>
          <div className={classes.cell}>
            <div className={classes.label}>Billed by</div>
            <div className={classes.name}>{from.name || 'Your business'}</div>
            {from.address && <div className={classes.lines}>{from.address}</div>}
            {from.gstin && <div className={classes.lines}>GSTIN {from.gstin}</div>}
            {view.fromContact && <div className={classes.lines}>{view.fromContact}</div>}
          </div>
          <div className={classes.cell}>
            <div className={classes.label}>{view.clientLabel}</div>
            <ClientName view={view} className={classes.name} />
            <ClientAddress view={view} className={classes.lines} />
            {client.gstin && <div className={classes.lines}>GSTIN {client.gstin}</div>}
            {view.clientContact && <div className={classes.lines}>{view.clientContact}</div>}
          </div>
          <div className={classes.cell}>
            <div className={classes.label}>Details</div>
            <DetailRows rows={view.meta} />
          </div>
        </div>

        <table className={classes.items}>
          <thead>
            <tr>
              <th>Item</th>
              <th className={classes.num}>Qty</th>
              <th className={classes.num}>Rate</th>
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
      </div>
    </>
  );
}
