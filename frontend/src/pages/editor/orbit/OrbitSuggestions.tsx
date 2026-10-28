import { GST_ASK, type OrbitStudioState } from './useOrbitStudio';
import classes from './OrbitStudio.module.css';

interface Props {
  studio: OrbitStudioState;
  prompts: string[];
  showGst?: boolean;
  layout: 'starters' | 'followUps';
}

export function OrbitSuggestions({ studio, prompts, showGst = false, layout }: Props) {
  if (!prompts.length && !showGst) return null;
  return (
    <div className={classes[layout]}>
      {showGst && (
        <button type="button" className={classes.chip} disabled={studio.busy} onClick={studio.checkGst}>
          {GST_ASK}
        </button>
      )}
      {prompts.map((prompt) => (
        <button key={prompt} type="button" className={classes.chip} disabled={studio.busy} onClick={() => studio.send(prompt)}>
          {prompt}
        </button>
      ))}
    </div>
  );
}
