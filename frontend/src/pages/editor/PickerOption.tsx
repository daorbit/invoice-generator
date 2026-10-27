import classes from './PickerOption.module.css';

export function PickerOption({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className={classes.option}>
      <span className={classes.title}>{title}</span>
      {detail && <span className={classes.detail}>{detail}</span>}
    </div>
  );
}
