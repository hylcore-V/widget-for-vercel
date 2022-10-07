import {
  Button,
  ListItem as MuiListItem,
  ListItemButton as MuiListItemButton,
} from '@mui/material';
import { listItemSecondaryActionClasses } from '@mui/material/ListItemSecondaryAction';
import { styled } from '@mui/material/styles';
import { getContrastAlphaColor } from '../../utils';

export const ListItemButton = styled(MuiListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadiusSecondary,
  paddingLeft: theme.spacing(1.5),
  paddingRight: theme.spacing(1.5),
  height: 64,
  '&:hover': {
    backgroundColor: getContrastAlphaColor(theme, '4%'),
  },
}));

export const ListItem = styled(MuiListItem, {
  shouldForwardProp: (prop) => prop !== 'disableRipple',
})(({ theme }) => ({
  padding: theme.spacing(0, 1.5),
  [`.${listItemSecondaryActionClasses.root}`]: {
    right: theme.spacing(3),
  },
  '&:hover': {
    cursor: 'pointer',
  },
}));

export const ShowAllButton = styled(Button)(({ theme }) => ({
  background: 'none',
  '&:hover': {
    background: 'none',
  },
}));
