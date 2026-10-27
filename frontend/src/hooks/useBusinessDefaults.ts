import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { applyBusinessDefaults } from '../store/invoiceSlice';
import { applyQuotationBusinessDefaults } from '../store/quotationSlice';
import { businessProfileApi } from '../api/businessProfile';
import type { BusinessDefaults, BusinessProfile } from '../types/businessProfile';
import type { DocumentMode } from '../components/DocumentGenerator/types';

function defaultsFrom(profile: BusinessProfile): BusinessDefaults {
  return {
    from: {
      name: profile.businessName,
      email: profile.email,
      address: profile.gstin ? `${profile.address}\nGSTIN: ${profile.gstin}` : profile.address,
      phone: profile.phone,
      website: profile.website,
    },
    currency: profile.currency,
    notes: profile.defaultNotes,
    terms: profile.defaultTerms,
  };
}

export function useBusinessDefaults(mode: DocumentMode) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;
    businessProfileApi
      .get()
      .then(({ profile, complete }) => {
        if (cancelled || !complete) return;
        const defaults = defaultsFrom(profile);
        dispatch(mode === 'invoice' ? applyBusinessDefaults(defaults) : applyQuotationBusinessDefaults(defaults));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [dispatch, mode]);
}
