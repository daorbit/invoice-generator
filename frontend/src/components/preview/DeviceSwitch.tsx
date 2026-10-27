import { SegmentedControl, Tooltip } from '@mantine/core';
import { LaptopIcon, SmartphoneIcon } from 'lucide-react';
import classes from './PreviewStudio.module.css';

export type PreviewDevice = 'laptop' | 'phone';

const DEVICES: { value: PreviewDevice; label: string; Icon: typeof LaptopIcon }[] = [
  { value: 'laptop', label: 'Laptop', Icon: LaptopIcon },
  { value: 'phone', label: 'Phone', Icon: SmartphoneIcon },
];

export function DeviceSwitch({ value, onChange }: { value: PreviewDevice; onChange: (value: PreviewDevice) => void }) {
  return (
    <SegmentedControl
      size="sm"
      value={value}
      onChange={(next) => onChange(next as PreviewDevice)}
      data={DEVICES.map(({ value: id, label, Icon }) => ({
        value: id,
        label: (
          <Tooltip label={label} position="bottom" withArrow>
            <span className={classes.deviceIcon} aria-label={label}>
              <Icon size={20} strokeWidth={1.6} />
            </span>
          </Tooltip>
        ),
      }))}
    />
  );
}
