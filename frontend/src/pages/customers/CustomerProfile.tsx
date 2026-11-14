import { Skeleton } from '@mantine/core';
import { stateLabel } from '@/lib/gst';
import type { Customer } from '@/types/catalog';
import classes from './CustomerDetail.module.css';

const SKELETON_LABELS = ['GSTIN', 'State', 'Billing address', 'Website'];

function rows(customer: Customer): [string, string][] {
  return (
    [
      ['GSTIN', customer.gstin || 'Not registered'],
      ['State', stateLabel(customer.stateCode)],
      ['Billing address', customer.address],
      ['Shipping address', customer.shippingAddress],
      ['Website', customer.website],
      ['Notes', customer.notes],
    ] as [string, string][]
  ).filter(([, value]) => Boolean(value));
}

export function CustomerProfile({ customer }: { customer: Customer | null }) {
  return (
    <section className={classes.card} aria-label="Customer details">
      <div className={classes.cardTitle}>Details</div>
      {customer ? (
        <dl className={classes.details}>
          {rows(customer).map(([label, value]) => (
            <div key={label} className={classes.detail}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <dl className={classes.details} aria-busy="true">
          {SKELETON_LABELS.map((label, index) => (
            <div key={label} className={classes.detail}>
              <dt>{label}</dt>
              <dd>
                <Skeleton height={12} width={`${70 - index * 10}%`} radius="sm" mt={4} />
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
