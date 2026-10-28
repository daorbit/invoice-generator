import { SegmentedControl, Tooltip } from '@mantine/core';
import { LaptopIcon, SmartphoneIcon, TabletIcon } from 'lucide-react';
import type { DeviceId } from 'da-frame-set';
import classes from './PreviewStudio.module.css';

export type PreviewDevice = 'laptop' | 'tablet' | 'phone';

export const DEVICE_FRAME: Record<PreviewDevice, DeviceId> = {
  laptop: 'macbook-air',
  tablet: 'ipad-air',
  phone: 'iphone-pro',
};

const DEVICES: { value: PreviewDevice; label: string; Icon: typeof LaptopIcon }[] = [
  { value: 'laptop', label: 'Laptop', Icon: LaptopIcon },
  { value: 'tablet', label: 'Tablet', Icon: TabletIcon },
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
