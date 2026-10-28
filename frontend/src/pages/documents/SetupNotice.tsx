import { Button } from '@mantine/core';
import { Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import classes from './SetupNotice.module.css';

export function SetupNotice() {
  const navigate = useNavigate();

  return (
    <div className={classes.root}>
      <div className={classes.text}>
        <span className={classes.title}>Add your business details</span>
        <span className={classes.body}>Your name, address and GSTIN appear on every quotation and invoice.</span>
      </div>
      <Button variant="default" leftSection={<Building2 size={15} />} onClick={() => navigate('/settings')}>
        Business details
      </Button>
    </div>
  );
}
