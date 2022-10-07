import type { Theme } from '@mui/material';
import { Box } from '@mui/material';
import { alpha, darken, lighten, styled } from '@mui/material/styles';
import type { MouseEventHandler } from 'react';

type CardVariant = 'default' | 'selected' | 'error';

const getBackgroundColor = (
  theme: Theme,
  variant?: CardVariant,
  selectionColor?: 'primary' | 'secondary',
) =>
  variant === 'selected'
    ? selectionColor === 'primary'
      ? theme.palette.mode === 'light'
        ? alpha(theme.palette.primary.main, 0.04)
        : alpha(theme.palette.primary.main, 0.42)
      : alpha(
          theme.palette.secondary.main,
          theme.palette.mode === 'light' ? 0.08 : 0.12,
        )
    : theme.palette.background.paper;

export const Card = styled(Box, {
  shouldForwardProp: (prop) =>
    !['dense', 'variant', 'indented', 'selectionColor'].includes(
      prop as string,
    ),
})<{
  variant?: CardVariant;
  selectionColor?: 'primary' | 'secondary';
  dense?: boolean;
  indented?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}>(
  ({
    theme,
    variant,
    selectionColor = 'primary',
    dense,
    indented,
    onClick,
  }) => {
    const backgroundColor = getBackgroundColor(theme, variant, selectionColor);
    return {
      backgroundColor,
      border: `1px solid`,
      borderColor:
        variant === 'error'
          ? theme.palette.error.main
          : variant === 'selected'
          ? selectionColor === 'primary'
            ? theme.palette.primary.main
            : alpha(theme.palette.secondary.main, 0.48)
          : theme.palette.mode === 'light'
          ? theme.palette.grey[300]
          : theme.palette.grey[800],
      borderRadius: dense
        ? theme.shape.borderRadiusSecondary
        : theme.shape.borderRadius,
      overflow: 'hidden',
      position: 'relative',
      padding: indented ? theme.spacing(2) : 0,
      boxSizing: 'border-box',
      '&:hover': {
        cursor: onClick ? 'pointer' : 'default',
        backgroundColor: onClick
          ? theme.palette.mode === 'light'
            ? darken(backgroundColor, 0.02)
            : lighten(backgroundColor, 0.02)
          : backgroundColor,
      },
      transition: theme.transitions.create(['background-color'], {
        duration: theme.transitions.duration.enteringScreen,
        easing: theme.transitions.easing.easeOut,
      }),
    };
  },
);
