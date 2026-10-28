import type { SetProfileField } from '@/hooks/useBusinessProfileDraft';
import type { BusinessProfile } from '@/types/businessProfile';

export interface ProfileSectionProps {
  draft: BusinessProfile;
  setField: SetProfileField;
}
