import { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Tooltip } from '@mantine/core';
import { ChartColumn, FileText, Package, ReceiptText, UsersRound, type LucideIcon } from 'lucide-react';
import classes from './SectionNav.module.css';

interface Section {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const GROUPS: { label: string; sections: Section[] }[] = [
  {
    label: 'Sales',
    sections: [
      { to: '/', label: 'Invoices', icon: ReceiptText, end: true },
      { to: '/quotations', label: 'Quotations', icon: FileText, end: true },
    ],
  },
  {
    label: 'Contacts',
    sections: [
      { to: '/customers', label: 'Customers', icon: UsersRound },
      { to: '/items', label: 'Items', icon: Package },
    ],
  },
  {
    label: 'Insights',
    sections: [{ to: '/reports', label: 'Reports', icon: ChartColumn }],
  },
];

export function SectionNav() {
  return (
    <nav className={classes.rail} aria-label="Invoicing">
      {GROUPS.map((group, index) => (
        <Fragment key={group.label}>
          {index > 0 && <span className={classes.divider} aria-hidden />}
          <div className={classes.group} role="group" aria-label={group.label}>
            {group.sections.map(({ to, label, icon: Icon, end }) => (
              <Tooltip key={to} label={label} position="left" withArrow openDelay={120}>
                <NavLink to={to} end={end} className={classes.link} aria-label={label}>
                  <Icon size={18} strokeWidth={1.9} />
                </NavLink>
              </Tooltip>
            ))}
          </div>
        </Fragment>
      ))}
    </nav>
  );
}
