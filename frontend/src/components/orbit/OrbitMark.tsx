import { useComputedColorScheme } from '@mantine/core';
import darkMark from '@/assets/orbit-ai-dark.webp';
import lightMark from '@/assets/orbit-ai-light.webp';
import classes from './OrbitMark.module.css';

export function OrbitMark({ size = 20 }: { size?: number }) {
  const scheme = useComputedColorScheme('light', { getInitialValueInEffect: false });
  return (
    <img
      src={scheme === 'dark' ? darkMark : lightMark}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={classes.mark}
    />
  );
}
