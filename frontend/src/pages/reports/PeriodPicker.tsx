import { useState } from 'react';
import { Button, Menu, Popover } from '@mantine/core';
import { DatePicker, type DatesRangeValue } from '@mantine/dates';
import { CalendarRange, CheckIcon, ChevronDownIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { PERIOD_OPTIONS, rangeFor, rangeLabel, toRange, type PeriodId } from '@/lib/reportPeriods';
import type { ReportRange } from '@/types/report';
import classes from './Reports.module.css';

interface Props {
  period: PeriodId;
  range: ReportRange;
  onChange: (period: PeriodId, range: ReportRange) => void;
}

export function PeriodPicker({ period, range, onChange }: Props) {
  const [customOpen, setCustomOpen] = useState(false);
  const [custom, setCustom] = useState<DatesRangeValue<string>>([null, null]);
  const preset = PERIOD_OPTIONS.find((option) => option.id === period);

  const pickCustom = (value: DatesRangeValue<string>) => {
    setCustom(value);
    const [start, end] = value;
    if (!start || !end) return;
    onChange('custom', toRange(dayjs(start), dayjs(end)));
    setCustomOpen(false);
  };

  return (
    <Popover opened={customOpen} onChange={setCustomOpen} position="bottom-end" shadow="lg" radius="lg">
      <Popover.Target>
        <div>
          <Menu position="bottom-end" width={230}>
            <Menu.Target>
              <Button
                variant="default"
                leftSection={<CalendarRange size={15} />}
                rightSection={<ChevronDownIcon size={14} />}
              >
                <span className={classes.periodLabel}>{preset?.label ?? 'Custom'}</span>
                <span className={classes.periodRange}>{rangeLabel(range)}</span>
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Period</Menu.Label>
              {PERIOD_OPTIONS.map((option) => (
                <Menu.Item
                  key={option.id}
                  rightSection={option.id === period ? <CheckIcon size={14} /> : undefined}
                  onClick={() => onChange(option.id, toRange(...rangeFor(option.id)))}
                >
                  {option.label}
                </Menu.Item>
              ))}
              <Menu.Divider />
              <Menu.Item
                rightSection={period === 'custom' ? <CheckIcon size={14} /> : undefined}
                onClick={() => setCustomOpen(true)}
              >
                Custom range
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        <DatePicker type="range" numberOfColumns={1} allowSingleDateInRange value={custom} onChange={pickCustom} />
      </Popover.Dropdown>
    </Popover>
  );
}
