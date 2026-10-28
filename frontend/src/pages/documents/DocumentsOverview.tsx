import { Skeleton } from '@mantine/core';
import { SplitMeter } from '@/components/ui/SplitMeter';
import type { DashboardStats, DocumentKind } from '@/types/document';
import { overviewFor } from './overviewFigures';
import classes from './DocumentsOverview.module.css';

interface Props {
  kind: DocumentKind;
  stats: DashboardStats | null;
  currency: string;
}

function OverviewSkeleton() {
  return (
    <section className={classes.root} aria-busy>
      <div className={classes.primary}>
        <Skeleton height={12} width={110} radius="sm" />
        <Skeleton height={30} width={200} radius="sm" mt={10} />
        <Skeleton height={8} radius="xl" mt={26} />
      </div>
      <div className={classes.aside}>
        {[0, 1].map((index) => (
          <div key={index} className={classes.figure}>
            <Skeleton height={12} width={70} radius="sm" />
            <Skeleton height={20} width={120} radius="sm" mt={8} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function DocumentsOverview({ kind, stats, currency }: Props) {
  if (!stats) return <OverviewSkeleton />;
  const model = overviewFor(kind, stats, currency);

  return (
    <section className={classes.root} aria-label={model.eyebrow}>
      <div className={classes.primary}>
        <span className={classes.eyebrow}>{model.eyebrow}</span>
        <span className={classes.headline}>{model.headline}</span>
        <span className={classes.caption}>{model.caption}</span>
        <div className={classes.meter}>
          <SplitMeter segments={model.segments} ariaLabel={model.meterLabel} />
        </div>
      </div>
      <div className={classes.aside}>
        {model.figures.map((figure) => (
          <div key={figure.label} className={classes.figure}>
            <span className={classes.eyebrow}>{figure.label}</span>
            <span className={classes.figureValue} data-tone={figure.tone}>
              {figure.value}
            </span>
            <span className={classes.caption}>{figure.hint}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
