import { useEffect, useRef, type ReactNode } from 'react';
import { Loader } from '@mantine/core';
import { CircleAlert } from 'lucide-react';
import { OrbitMark } from '@/components/orbit/OrbitMark';
import { FileChip } from './FileChip';
import { GST_ASK, type OrbitTurn } from './useOrbitStudio';
import classes from './OrbitStudio.module.css';

interface Props {
  turns: OrbitTurn[];
  intro: string;
  followUps: ReactNode;
}

function workingLabel(turn: OrbitTurn, first: boolean): string {
  if (turn.ask === GST_ASK) return 'Checking GST codes';
  if (turn.attachment) return 'Reading the document';
  return first ? 'Drafting' : 'Updating';
}

export function OrbitThread({ turns, intro, followUps }: Props) {
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [turns]);

  return (
    <div className={classes.thread}>
      {turns.length === 0 && (
        <div className={classes.reply}>
          <OrbitMark size={20} />
          <div className={classes.replyBody}>{intro}</div>
        </div>
      )}
      {turns.map((turn, index) => (
        <div key={turn.id} className={classes.turn}>
          <div className={classes.ask}>
            {turn.attachment && <FileChip name={turn.attachment} />}
            {turn.ask && turn.ask !== turn.attachment && <div className={classes.askBubble}>{turn.ask}</div>}
          </div>
          <div className={classes.reply}>
            <OrbitMark size={20} />
            <div className={classes.replyBody}>
              {turn.pending ? (
                <span className={classes.working}>
                  <Loader size={12} type="dots" color="var(--accent)" />
                  {workingLabel(turn, index === 0)}
                </span>
              ) : (
                <span>{turn.reply}</span>
              )}
              {turn.notes.length > 0 && (
                <ul className={classes.notes}>
                  {turn.notes.map((note) => (
                    <li key={note} className={classes.note}>
                      <CircleAlert size={13} className={classes.noteIcon} />
                      {note}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ))}
      {followUps}
      <div ref={end} />
    </div>
  );
}
