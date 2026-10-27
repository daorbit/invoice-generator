import { NavLink } from 'react-router-dom';
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
    <nav className={classes.nav} aria-label="Invoicing">
      {GROUPS.map((group) => (
        <div key={group.label} className={classes.group}>
          <span className={classes.groupLabel}>{group.label}</span>
          {group.sections.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={classes.link}>
              <Icon size={16} className={classes.icon} />
              {label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
