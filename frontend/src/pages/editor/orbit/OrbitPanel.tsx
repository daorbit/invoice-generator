import { OrbitMark } from '@/components/orbit/OrbitMark';
import { plural } from '@/lib/format';
import { OrbitComposer } from './OrbitComposer';
import { OrbitSuggestions } from './OrbitSuggestions';
import { OrbitThread } from './OrbitThread';
import { draftPrompts, editPrompts } from './suggestionPrompts';
import type { OrbitStudioState } from './useOrbitStudio';
import classes from './OrbitStudio.module.css';

export function OrbitPanel({ studio }: { studio: OrbitStudioState }) {
  const { draft, blank, busy, turns } = studio;
  const hasItems = draft.items.some((item) => item.description.trim());

  return (
    <section className={classes.pane} aria-label="Orbit">
      <header className={classes.paneHead}>
        <OrbitMark size={18} />
        <span className={classes.paneTitle}>Orbit</span>
        {turns.length > 0 && <span className={classes.count}>{plural(turns.length, 'ask')}</span>}
      </header>

      <OrbitThread
        turns={turns}
        intro="Ask for a change in plain words, like “add 2 hours of support at 1,500”, or let Orbit suggest HSN/SAC codes and GST rates for your items."
        followUps={
          !busy && (
            <OrbitSuggestions
              studio={studio}
              layout="followUps"
              prompts={blank ? draftPrompts(draft.kind) : editPrompts()}
              showGst={!blank && hasItems && draft.currency === 'INR'}
            />
          )
        }
      />

      <OrbitComposer
        compact
        studio={studio}
        placeholder={blank ? 'Describe it, or attach a photo or PDF' : 'Ask for a change'}
      />
    </section>
  );
}
