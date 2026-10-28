import { OrbitMark } from '@/components/orbit/OrbitMark';
import { KIND_META } from '@/lib/documentMeta';
import { OrbitComposer } from './OrbitComposer';
import { OrbitSuggestions } from './OrbitSuggestions';
import { draftPrompts } from './suggestionPrompts';
import type { OrbitStudioState } from './useOrbitStudio';
import classes from './OrbitStudio.module.css';

export function OrbitHero({ studio }: { studio: OrbitStudioState }) {
  const { kind } = studio.draft;
  const label = KIND_META[kind].singular.toLowerCase();

  return (
    <div className={classes.hero}>
      <div className={classes.heroHead}>
        <OrbitMark size={64} />
        <h2 className={classes.heroTitle}>What is this {label} for?</h2>
        <p className={classes.heroText}>
          Describe it in a sentence, or attach a photo or PDF of a purchase order, quote or old invoice. Orbit
          fills in the client and items and matches your saved customers and items.
        </p>
      </div>
      <div className={classes.heroComposer}>
        <OrbitComposer studio={studio} placeholder={`Describe the ${label}, or attach a photo or PDF`} />
      </div>
      <OrbitSuggestions studio={studio} layout="starters" prompts={draftPrompts(kind)} />
    </div>
  );
}
