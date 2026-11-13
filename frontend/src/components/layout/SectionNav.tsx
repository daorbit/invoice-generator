import { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Tooltip } from '@mantine/core';
import invoicesIcon from '@/assets/rail-icons/invoices.svg';
import quotationsIcon from '@/assets/rail-icons/quotations.svg';
import customersIcon from '@/assets/rail-icons/customers.svg';
import itemsIcon from '@/assets/rail-icons/items.svg';
import reportsIcon from '@/assets/rail-icons/reports.svg';
import settingsIcon from '@/assets/rail-icons/settings.svg';
import classes from './SectionNav.module.css';

interface Section {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}

const GROUPS: { label: string; sections: Section[] }[] = [
  {
    label: 'Sales',
    sections: [
      { to: '/', label: 'Invoices', icon: invoicesIcon, end: true },
      { to: '/quotations', label: 'Quotations', icon: quotationsIcon, end: true },
    ],
  },
  {
    label: 'Contacts',
    sections: [
      { to: '/customers', label: 'Customers', icon: customersIcon },
      { to: '/items', label: 'Items', icon: itemsIcon },
    ],
  },
  {
    label: 'Insights',
    sections: [{ to: '/reports', label: 'Reports', icon: reportsIcon }],
  },
];

const SETTINGS: Section = { to: '/settings', label: 'Settings', icon: settingsIcon };

function RailLink({ to, label, icon, end }: Section) {
  return (
    <Tooltip label={label} position="left" withArrow openDelay={120}>
      <NavLink to={to} end={end} className={classes.link} aria-label={label}>
        <img src={icon} alt="" className={classes.icon} width={26} height={26} />
      </NavLink>
    </Tooltip>
  );
}

export function SectionNav() {
  return (
    <nav className={classes.rail} aria-label="Invoicing">
      {GROUPS.map((group, index) => (
        <Fragment key={group.label}>
          {index > 0 && <span className={classes.divider} aria-hidden />}
          <div className={classes.group} role="group" aria-label={group.label}>
            {group.sections.map((section) => (
              <RailLink key={section.to} {...section} />
            ))}
          </div>
        </Fragment>
      ))}
      <div className={classes.footer}>
        <RailLink {...SETTINGS} />
      </div>
    </nav>
  );
}
