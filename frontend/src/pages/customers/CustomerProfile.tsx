import { Skeleton } from '@mantine/core';
import { stateLabel } from '@/lib/gst';
import type { Customer } from '@/types/catalog';
import classes from './CustomerDetail.module.css';

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
        <div className={classes.details}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} height={14} radius="sm" my={10} />
          ))}
        </div>
      )}
    </section>
  );
}
