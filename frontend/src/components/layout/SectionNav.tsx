import { NavLink } from 'react-router-dom';
import { ChartColumn, Package, ReceiptText, UsersRound, type LucideIcon } from 'lucide-react';
import classes from './SectionNav.module.css';

interface Section {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const SECTIONS: Section[] = [
  { to: '/', label: 'Invoices', icon: ReceiptText, end: true },
  { to: '/customers', label: 'Customers', icon: UsersRound },
  { to: '/items', label: 'Items', icon: Package },
  { to: '/reports', label: 'Reports', icon: ChartColumn },
];

export function SectionNav() {
  return (
    <nav className={classes.nav} aria-label="Invoicing">
      {SECTIONS.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={classes.link}>
          <Icon size={15} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
