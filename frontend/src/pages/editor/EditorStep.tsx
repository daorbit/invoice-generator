import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import classes from './EditorStep.module.css';

interface Props {
  index: number;
  title: string;
  hint?: string;
  done?: boolean;
  action?: ReactNode;
  children: ReactNode;
}

export function EditorStep({ index, title, hint, done, action, children }: Props) {
  return (
    <section className={classes.step} data-done={done || undefined}>
      <span className={classes.number} aria-hidden>
        {done ? <Check size={15} /> : index}
      </span>
      <div>
        <div className={classes.head}>
          <div>
            <div className={classes.title}>{title}</div>
            {hint && <div className={classes.hint}>{hint}</div>}
          </div>
          {action}
        </div>
        <div className={classes.body}>{children}</div>
      </div>
    </section>
  );
}
