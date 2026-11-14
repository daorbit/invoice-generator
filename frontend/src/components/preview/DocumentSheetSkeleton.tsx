import classes from './DocumentSheetSkeleton.module.css';

const ITEM_ROWS = 4;
const PARTY_LINES = ['w60', 'w80', 'w50'];

function Bar({ width, tall = false }: { width: string; tall?: boolean }) {
  return <span className={`${classes.bar} ${classes[width]}`} data-tall={tall || undefined} />;
}

export function DocumentSheetSkeleton() {
  return (
    <div className={classes.sheet} aria-busy="true" aria-label="Loading document">
      <div className={classes.top}>
        <span className={classes.logo} />
        <div className={classes.titleBlock}>
          <Bar width="w100" tall />
          <Bar width="w60" />
        </div>
      </div>

      <div className={classes.parties}>
        {[0, 1].map((side) => (
          <div key={side} className={classes.party}>
            <Bar width="w30" />
            {PARTY_LINES.map((w) => (
              <Bar key={w} width={w} />
            ))}
          </div>
        ))}
      </div>

      <div className={classes.items}>
        <div className={classes.itemHead}>
          <Bar width="w30" />
          <Bar width="w20" />
          <Bar width="w20" />
        </div>
        {Array.from({ length: ITEM_ROWS }).map((_, i) => (
          <div key={i} className={classes.itemRow}>
            <Bar width={i % 2 ? 'w50' : 'w70'} />
            <Bar width="w20" />
            <Bar width="w30" />
          </div>
        ))}
      </div>

      <div className={classes.totals}>
        <Bar width="w60" />
        <Bar width="w80" />
        <Bar width="w100" tall />
      </div>

      <div className={classes.foot}>
        <Bar width="w40" />
        <Bar width="w70" />
      </div>
    </div>
  );
}
