import { createContext, useContext, type ReactNode } from 'react';

const BrandLogoContext = createContext('');

export function BrandLogoProvider({ logo, children }: { logo: string; children: ReactNode }) {
  return <BrandLogoContext.Provider value={logo}>{children}</BrandLogoContext.Provider>;
}

export function useBrandLogo(): string {
  return useContext(BrandLogoContext);
}
