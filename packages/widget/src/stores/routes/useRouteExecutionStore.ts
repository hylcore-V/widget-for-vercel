import type { Route } from '@lifi/sdk';
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { RouteExecutionStore } from './types';
import { isRouteCompleted, isRouteFailed } from './utils';

export const useRouteExecutionStore = create<RouteExecutionStore>()(
  persist(
    immer((set) => ({
      routes: {},
      setExecutableRoute: (route: Route) =>
        set((state: RouteExecutionStore) => {
          if (!state.routes[route.id]) {
            // clean previous idle routes that were not executed
            Object.keys(state.routes)
              .filter((routeId) => state.routes[routeId]?.status === 'idle')
              .forEach((routeId) => delete state.routes[routeId]);
            state.routes[route.id] = {
              route,
              status: 'idle',
            };
          }
        }),
      updateRoute: (route: Route) =>
        set((state: RouteExecutionStore) => {
          if (state.routes[route.id]) {
            state.routes[route.id]!.route = route;
            const isFailed = isRouteFailed(route);
            if (isFailed) {
              state.routes[route.id]!.status = 'error';
              return;
            }
            const isDone = isRouteCompleted(route);
            if (isDone) {
              state.routes[route.id]!.status = 'success';
              return;
            }
            const isLoading = route.steps.some((step) => step.execution);
            if (isLoading) {
              state.routes[route.id]!.status = 'loading';
            }
          }
        }),
      restartRoute: (routeId: string) =>
        set((state: RouteExecutionStore) => {
          state.routes[routeId]!.status = 'loading';
        }),
      deleteRoute: (routeId: string) =>
        set((state: RouteExecutionStore) => {
          if (state.routes[routeId]) {
            delete state.routes[routeId];
          }
        }),
      deleteRoutes: (type) =>
        set((state: RouteExecutionStore) => {
          Object.keys(state.routes)
            .filter((routeId) =>
              type === 'completed'
                ? state.routes[routeId]?.status === 'success'
                : state.routes[routeId]?.status !== 'success',
            )
            .forEach((routeId) => delete state.routes[routeId]);
        }),
    })),
    {
      name: 'li.fi-widget-routes',
      partialize: (state) => ({ routes: state.routes }),
      merge: (persistedState: any, currentState: RouteExecutionStore) => {
        const state = { ...currentState, ...persistedState };
        try {
          const routeString = localStorage.getItem('routes');
          if (routeString) {
            const routes = JSON.parse(routeString) as Array<Route>;
            routes.forEach((route) => {
              if (state.routes[route.id]) {
                return;
              }
              state.routes[route.id] = {
                route,
                status: 'idle',
              };
              const isFailed = isRouteFailed(route);
              if (isFailed) {
                state.routes[route.id]!.status = 'error';
                return;
              }
              const isDone = isRouteCompleted(route);
              if (isDone) {
                state.routes[route.id]!.status = 'success';
                return;
              }
              const isLoading = route.steps.some((step) => step.execution);
              if (isLoading) {
                state.routes[route.id]!.status = 'loading';
              }
            });
          }
          localStorage.removeItem('routes');
        } catch (error) {
          console.log(error);
        }
        return state;
      },
    },
  ),
);
