import { OrbitMark } from '@/components/orbit/OrbitMark';
import { studioClasses } from '@/components/studio/StudioModal';
import { KIND_META } from '@/lib/documentMeta';
import { OrbitComposer } from './OrbitComposer';
import { OrbitSuggestions } from './OrbitSuggestions';
import { OrbitThread } from './OrbitThread';
import { orbitSuggestions } from './suggestionPrompts';
import type { OrbitStudioState } from './useOrbitStudio';
import classes from './OrbitStudio.module.css';

export function OrbitPanel({ studio }: { studio: OrbitStudioState }) {
  const { draft, blank } = studio;
  const label = KIND_META[draft.kind].singular.toLowerCase();
  const hasItems = draft.items.some((item) => item.description.trim());

  return (
    <aside className={`${studioClasses.panel} ${classes.panel}`}>
      <header className={classes.head}>
        <OrbitMark size={24} />
        <div className={classes.headText}>
          <span className={classes.headTitle}>Orbit</span>
          <span className={classes.headSubtitle}>Changes show on the {label} as you go</span>
        </div>
      </header>

      <OrbitThread
        turns={studio.turns}
        introTitle={blank ? `What is this ${label} for?` : `What should change?`}
        introText={
          blank
            ? `Describe it in a sentence, or attach a photo or PDF of a purchase order, quote or old invoice. Orbit fills in the client and items from your saved customers and items.`
            : `Ask for a change in plain words, or let Orbit suggest HSN/SAC codes and GST rates for your items.`
        }
      />

      <OrbitSuggestions
        studio={studio}
        prompts={studio.turns.length ? [] : orbitSuggestions(draft.kind, blank)}
        showGst={!blank && hasItems && draft.currency === 'INR'}
      />

      <OrbitComposer
        studio={studio}
        placeholder={blank ? `Describe the ${label}, or attach a photo or PDF` : 'Ask for a change, like “add 2 hours of support at 1,500”'}
      />
    </aside>
  );
}
