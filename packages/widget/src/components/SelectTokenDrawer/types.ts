import { DrawerProps } from '@mui/material';
import { RefObject } from 'react';
import { SwapFormDirection } from '../../providers/SwapFormProvider';

export type SelectTokenDrawerProps = DrawerProps & {
  containerRef: RefObject<Element>;
};

export interface SelectTokenDrawerBase {
  openDrawer(type: SwapFormDirection): void;
  closeDrawer(): void;
}

export enum TokenFilterType {
  My,
  All,
}
