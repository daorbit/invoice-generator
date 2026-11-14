import { CircleAlert } from 'lucide-react';
import { SectionPage } from '@/components/layout/SectionPage';
import { SettingsGroupSkeleton, SettingsStack } from '@/components/settings/SettingsGroup';
import { PageHeader } from '@/components/ui/PageHeader';
import { DocsButton } from '@/components/ui/DocsButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { HostNotificationsBell } from '@/components/ui/HostNotificationsBell';
import { useHostPhone } from '@/hooks/useHostPhone';
import { useBusinessProfileDraft } from '@/hooks/useBusinessProfileDraft';
import { IS_EMBEDDED } from '@/lib/bootParams';
import { DOCS } from '@/lib/docs';
import { BusinessSection } from './settings/BusinessSection';
import { StyleSection } from './settings/StyleSection';
import { NumbersSection } from './settings/NumbersSection';
import { PaymentSection } from './settings/PaymentSection';
import { DefaultsSection } from './settings/DefaultsSection';
import { SaveBar } from './settings/SaveBar';
import classes from './settings/SettingsPage.module.css';

export function SettingsPage() {
  const hostPhone = useHostPhone();
  const profile = useBusinessProfileDraft();
  const { draft, setField } = profile;

  return (
    <SectionPage>
      <PageHeader
        title="Settings"
        description="Your business details, numbering, payment details and defaults for every quotation and invoice."
        actions={
          <>
            {!hostPhone && <DocsButton path={DOCS.invoicing} />}
            {IS_EMBEDDED && <HostNotificationsBell />}
          </>
        }
      />

      {profile.loading ? (
        <div className={classes.form}>
          <div className={classes.columns}>
            <SettingsStack>
              <SettingsGroupSkeleton title="Your business" rows={6} />
              <SettingsGroupSkeleton title="Payment details" rows={5} />
            </SettingsStack>
            <SettingsStack>
              <SettingsGroupSkeleton title="Logo and style" rows={2} />
              <SettingsGroupSkeleton title="Numbers and payment terms" rows={4} />
              <SettingsGroupSkeleton title="Defaults" rows={2} />
            </SettingsStack>
          </div>
        </div>
      ) : profile.failed || !draft ? (
        <EmptyState
          icon={CircleAlert}
          title="Settings could not be loaded"
          description="Reload the page to try again."
        />
      ) : (
        <div className={classes.form}>
          {!profile.complete && (
            <p className={classes.lead}>Add your business name, billing email and address to start sending documents.</p>
          )}
          <div className={classes.columns}>
            <SettingsStack>
              <BusinessSection draft={draft} setField={setField} />
              <PaymentSection draft={draft} setField={setField} />
            </SettingsStack>
            <SettingsStack>
              <StyleSection draft={draft} setField={setField} />
              <NumbersSection draft={draft} setField={setField} />
              <DefaultsSection draft={draft} setField={setField} />
            </SettingsStack>
          </div>
          {profile.dirty && (
            <SaveBar saving={profile.saving} onSave={() => void profile.save()} onDiscard={profile.discard} />
          )}
        </div>
      )}
    </SectionPage>
  );
}
