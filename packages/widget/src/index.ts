import { App } from './App';
import { AppDrawer } from './AppDrawer';
import './fonts/inter.css';
import { configureReactI18next } from './i18n';

export type { WidgetDrawer, WidgetDrawerProps } from './AppDrawer';
export { useWidgetEvents } from './hooks';
export * from './types';

configureReactI18next();
// ClassNameGenerator.configure((componentName) =>
//   componentName.replace('Mui', 'LiFi'),
// );

export const LiFiWidget = App;
export const LiFiWidgetDrawer = AppDrawer;
