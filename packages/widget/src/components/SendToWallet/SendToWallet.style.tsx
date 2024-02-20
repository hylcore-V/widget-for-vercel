import { cardHeaderClasses, styled } from '@mui/material';
import { CardHeader } from '../Card/CardHeader.js';

export const SendToWalletCardHeader = styled(CardHeader, {
  shouldForwardProp: (prop) => !['selected'].includes(prop as string),
})<{ selected?: boolean }>(({ theme, selected }) => ({
  width: '100%',
  [`.${cardHeaderClasses.title}`]: {
    color: selected ? theme.palette.text.primary : theme.palette.text.secondary,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    width: selected ? 224 : 254,
    [theme.breakpoints.down(392)]: {
      width: selected ? 192 : 224,
    },
  },
  [`.${cardHeaderClasses.subheader}`]: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    width: selected ? 224 : 254,
    [theme.breakpoints.down(392)]: {
      width: selected ? 192 : 224,
    },
  },
  [`.${cardHeaderClasses.action}`]: {
    marginRight: 0,
  },
}));
