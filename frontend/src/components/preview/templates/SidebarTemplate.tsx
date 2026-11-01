import type { DocumentView } from '../useDocumentView';
import { UpiQr, pageClasses } from './PageShell';
import { AmountWords, ClientAddress, ClientName, DetailRows, ItemRows, NotesAndSignature, TotalLines } from './Extras';
import classes from './Sidebar.module.css';

export function SidebarTemplate({ view }: { view: DocumentView }) {
  const { from, client } = view;

  return (
    <div className={classes.layout}>
      <aside className={classes.side}>
        {view.logo ? (
          <img src={view.logo} alt="" className={classes.logo} />
        ) : (
          <div className={classes.brand}>{from.name || 'Your business'}</div>
        )}

        <div className={classes.block}>
          <div className={classes.label}>From</div>
          <div className={classes.name}>{from.name || 'Your business'}</div>
          {from.address && <div className={classes.lines}>{from.address}</div>}
          {from.gstin && <div className={classes.lines}>GSTIN {from.gstin}</div>}
          {view.fromContact && <div className={classes.lines}>{view.fromContact}</div>}
        </div>

        <div className={classes.block}>
          <div className={classes.label}>{view.clientLabel}</div>
          <ClientName view={view} className={classes.name} />
          <ClientAddress view={view} className={classes.lines} />
          {client.gstin && <div className={classes.lines}>GSTIN {client.gstin}</div>}
          {view.clientContact && <div className={classes.lines}>{view.clientContact}</div>}
        </div>

        <div className={classes.block}>
          <div className={classes.label}>Details</div>
          <DetailRows rows={view.meta} />
        </div>

        {view.payment.length > 0 && (
          <div className={`${classes.block} ${classes.pay}`}>
            <div className={classes.label}>Payment details</div>
            <DetailRows rows={view.payment} />
            <UpiQr src={view.qr} />
          </div>
        )}
      </aside>

      <div className={classes.main}>
        <div className={classes.title}>{view.heading}</div>
        <div className={classes.number}># {view.number}</div>

        <div className={classes.due}>
          <span className={classes.dueLabel}>{view.headlineLabel}</span>
          <span className={classes.dueAmount}>{view.headline}</span>
          {view.dueText && <span className={classes.dueDate}>{view.dueText}</span>}
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

        <div className={pageClasses.push}>
          <div className={classes.footer}>
            <NotesAndSignature view={view} />
          </div>
        </div>
      </div>
    </div>
  );
}
