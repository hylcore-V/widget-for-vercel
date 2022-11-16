import type { QueryClientProviderProps } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import type { FC, PropsWithChildren } from 'react';
import { Fragment } from 'react';
import { MemoryRouter, useInRouterContext } from 'react-router-dom';
import { queryClient } from './config/queryClient';
import {
  I18nProvider,
  SDKProvider,
  SwapFormProvider,
  TelemetryProvider,
  ThemeProvider,
  WalletProvider,
  WidgetProvider,
} from './providers';
import type { WidgetProps } from './types';

const QueryProvider = QueryClientProvider as FC<
  PropsWithChildren<QueryClientProviderProps>
>;

export const AppProvider: React.FC<PropsWithChildren<WidgetProps>> = ({
  children,
  config,
}) => {
  return (
    <QueryProvider client={queryClient}>
      <WidgetProvider config={config}>
        <SDKProvider>
          <TelemetryProvider>
            <ThemeProvider>
              <I18nProvider>
                <WalletProvider>
                  <SwapFormProvider>
                    <AppRouter>{children}</AppRouter>
                  </SwapFormProvider>
                </WalletProvider>
              </I18nProvider>
            </ThemeProvider>
          </TelemetryProvider>
        </SDKProvider>
      </WidgetProvider>
    </QueryProvider>
  );
};

export const AppRouter: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const inRouterContext = useInRouterContext();
  const Router = inRouterContext ? Fragment : MemoryRouter;
  return <Router>{children}</Router>;
};
