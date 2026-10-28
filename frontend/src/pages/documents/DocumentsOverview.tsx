import { useState } from 'react';
import { Skeleton } from '@mantine/core';
import { SplitMeter } from '@/components/ui/SplitMeter';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import type { DashboardStats, DocumentKind } from '@/types/document';
import { overviewFor } from './overviewFigures';
import classes from './DocumentsOverview.module.css';

interface Props {
  kind: DocumentKind;
  stats: DashboardStats | null;
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

export function DocumentsOverview({ kind, stats }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  if (!stats) return <OverviewSkeleton />;

  const currency = selected && stats.byCurrency[selected] ? selected : stats.currency;
  const currencyStats = stats.byCurrency[currency] ?? stats;
  const model = overviewFor(kind, currencyStats);
  const hasMultipleCurrencies = stats.currencies.length > 1;

  return (
    <section className={classes.root} aria-label={model.eyebrow}>
      <div className={classes.primary}>
        <div className={classes.headerRow}>
          <span className={classes.eyebrow}>{model.eyebrow}</span>
          {hasMultipleCurrencies && (
            <SegmentedTabs
              value={currency}
              onChange={setSelected}
              ariaLabel="Currency"
              size="sm"
              data={stats.currencies.map((code) => ({ value: code, label: code }))}
            />
          )}
        </div>
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
