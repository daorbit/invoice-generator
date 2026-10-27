import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SectionPage } from '@/components/layout/SectionPage';
import { PageHeader } from '@/components/ui/PageHeader';
import { DocsButton } from '@/components/ui/DocsButton';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { HostNotificationsBell } from '@/components/ui/HostNotificationsBell';
import { useHostPhone } from '@/hooks/useHostPhone';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { IS_EMBEDDED } from '@/lib/bootParams';
import { DOCS } from '@/lib/docs';
import { rangeFor, toRange, type PeriodId } from '@/lib/reportPeriods';
import type { ReportRange } from '@/types/report';
import { PeriodPicker } from './reports/PeriodPicker';
import { OverviewReport } from './reports/OverviewReport';
import { ReceivablesReport } from './reports/ReceivablesReport';
import { SalesReport } from './reports/SalesReport';
import { PaymentsReport } from './reports/PaymentsReport';
import { GstReport } from './reports/GstReport';
import classes from './reports/Reports.module.css';

type ReportTab = 'overview' | 'receivables' | 'sales' | 'payments' | 'gst';

const TAB_PARAM = 'report';

const TABS: { value: ReportTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'receivables', label: 'Receivables' },
  { value: 'sales', label: 'Sales' },
  { value: 'payments', label: 'Payments' },
  { value: 'gst', label: 'GST' },
];

function readTab(value: string | null, gst: boolean): ReportTab {
  const tab = TABS.find((entry) => entry.value === value)?.value ?? 'overview';
  return tab === 'gst' && !gst ? 'overview' : tab;
}

export function ReportsPage() {
  const hostPhone = useHostPhone();
  const { profile } = useBusinessProfile();
  const [params, setParams] = useSearchParams();
  const [period, setPeriod] = useState<PeriodId>('this-month');
  const [range, setRange] = useState<ReportRange>(() => toRange(...rangeFor('this-month')));
  const currency = profile?.currency || 'INR';
  const gst = currency === 'INR' && Boolean(profile?.gstin);
  const tab = readTab(params.get(TAB_PARAM), gst);
  const scope = useMemo(() => ({ currency }), [currency]);
  const tabs = gst ? TABS : TABS.filter((entry) => entry.value !== 'gst');

  const changePeriod = (id: PeriodId, next: ReportRange) => {
    setPeriod(id);
    setRange(next);
  };

  return (
    <SectionPage>
      <PageHeader
        title="Reports"
        description={`What you billed, collected and are still owed, in ${currency}.`}
        actions={
          <>
            {tab !== 'receivables' && <PeriodPicker period={period} range={range} onChange={changePeriod} />}
            {!hostPhone && <DocsButton path={DOCS.invoicing} />}
            {IS_EMBEDDED && <HostNotificationsBell />}
          </>
        }
      />

      <div className={classes.tabs}>
        <SegmentedTabs
          ariaLabel="Report"
          value={tab}
          onChange={(next) => setParams(next === 'overview' ? {} : { [TAB_PARAM]: next }, { replace: true })}
          data={tabs}
        />
      </div>

      {profile && (
        <>
          {tab === 'overview' && <OverviewReport scope={scope} range={range} />}
          {tab === 'receivables' && <ReceivablesReport scope={scope} />}
          {tab === 'sales' && <SalesReport scope={scope} range={range} />}
          {tab === 'payments' && <PaymentsReport scope={scope} range={range} />}
          {tab === 'gst' && <GstReport scope={scope} range={range} />}
        </>
      )}
    </SectionPage>
  );
}
