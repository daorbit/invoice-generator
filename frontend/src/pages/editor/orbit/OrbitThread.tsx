import { useEffect, useRef } from 'react';
import { Loader } from '@mantine/core';
import { CircleAlert } from 'lucide-react';
import { OrbitMark } from '@/components/orbit/OrbitMark';
import { FileChip } from './FileChip';
import { GST_ASK, type OrbitTurn } from './useOrbitStudio';
import classes from './OrbitStudio.module.css';

interface Props {
  turns: OrbitTurn[];
  introTitle: string;
  introText: string;
}

function workingLabel(turn: OrbitTurn): string {
  if (turn.ask === GST_ASK) return 'Checking GST codes';
  return turn.attachment ? 'Reading the document' : 'Working on it';
}

export function OrbitThread({ turns, introTitle, introText }: Props) {
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [turns]);

  return (
    <div className={classes.thread}>
      {turns.length === 0 && (
        <div className={classes.intro}>
          <OrbitMark size={32} />
          <span className={classes.introTitle}>{introTitle}</span>
          <p className={classes.introText}>{introText}</p>
        </div>
      )}
      {turns.map((turn) => (
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
                  <Loader size={12} type="dots" />
                  {workingLabel(turn)}
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
      <div ref={end} />
    </div>
  );
}
