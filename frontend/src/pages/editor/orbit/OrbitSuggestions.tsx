import { GST_ASK, type OrbitStudioState } from './useOrbitStudio';
import classes from './OrbitStudio.module.css';

interface Props {
  studio: OrbitStudioState;
  prompts: string[];
  showGst: boolean;
}

export function OrbitSuggestions({ studio, prompts, showGst }: Props) {
  return (
    <div className={classes.suggestions}>
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
