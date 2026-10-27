import type { ReactNode } from 'react';
import classes from './EditorSection.module.css';

interface Props {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function EditorSection({ title, action, children }: Props) {
  return (
    <section className={classes.section}>
      <div className={classes.head}>
        <span className={classes.title}>{title}</span>
        {action}
      </div>
      <div className={classes.body}>{children}</div>
    </section>
  );
}
