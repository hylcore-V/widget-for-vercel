import type { Process } from '@lifi/sdk';
import {
  Done as DoneIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { darken } from '@mui/material/styles';
import {
  CircularIcon,
  CircularProgressPending
} from './CircularProgress.style';

export function CircularProgress({ process }: { process: Process }) {
  return (
    <CircularIcon status={process.status} substatus={process.substatus}>
      {process.status === 'STARTED' || process.status === 'PENDING' ? (
        <CircularProgressPending size={32} thickness={3} />
      ) : null}
      {process.status === 'ACTION_REQUIRED' ? (
        <InfoIcon
          color="info"
          sx={{
            position: 'absolute',
            fontSize: '1rem',
          }}
        />
      ) : null}
      {process.status === 'DONE' &&
      (process.substatus === 'PARTIAL' || process.substatus === 'REFUNDED') ? (
        <WarningIcon
          sx={(theme) => ({
            position: 'absolute',
            fontSize: '1rem',
            color: darken(theme.palette.warning.main, 0.32),
          })}
        />
      ) : process.status === 'DONE' ? (
        <DoneIcon
          color="success"
          sx={{
            position: 'absolute',
            fontSize: '1rem',
          }}
        />
      ) : null}
      {process.status === 'FAILED' ? (
        <WarningIcon
          color="error"
          sx={{
            position: 'absolute',
            fontSize: '1rem',
          }}
        />
      ) : null}
    </CircularIcon>
  );
}
