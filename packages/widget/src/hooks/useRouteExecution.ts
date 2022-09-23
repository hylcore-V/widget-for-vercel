import type { Route } from '@lifi/sdk';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import shallow from 'zustand/shallow';
import { useLiFi, useWallet } from '../providers';
import {
  getUpdatedProcess,
  isRouteActive,
  isRouteCompleted,
  isRouteFailed,
  useRouteExecutionStore,
} from '../stores';
import { WidgetEvent } from '../types/events';
import { deepClone } from '../utils';
import { useWidgetEvents } from './useWidgetEvents';

export const useRouteExecution = (
  routeId: string,
  executeInBackground?: boolean,
) => {
  const lifi = useLiFi();
  const { account, switchChain } = useWallet();
  const resumedAfterMount = useRef(false);
  const emitter = useWidgetEvents();
  const routeExecution = useRouteExecutionStore(
    (state) => state.routes[routeId],
  );
  const [updateRoute, restartRoute, deleteRoute] = useRouteExecutionStore(
    (state) => [state.updateRoute, state.restartRoute, state.deleteRoute],
    shallow,
  );

  const updateCallback = (updatedRoute: Route) => {
    const routeExecution =
      useRouteExecutionStore.getState().routes[updatedRoute.id];
    if (!routeExecution) {
      return;
    }
    const clonedUpdatedRoute = deepClone(updatedRoute);
    updateRoute(clonedUpdatedRoute);
    const process = getUpdatedProcess(routeExecution.route, clonedUpdatedRoute);
    if (process) {
      emitter.emit(WidgetEvent.RouteExecutionUpdated, {
        route: clonedUpdatedRoute,
        process,
      });
    }
    if (isRouteCompleted(clonedUpdatedRoute)) {
      emitter.emit(WidgetEvent.RouteExecutionCompleted, clonedUpdatedRoute);
    }
    if (isRouteFailed(clonedUpdatedRoute) && process) {
      emitter.emit(WidgetEvent.RouteExecutionFailed, {
        route: clonedUpdatedRoute,
        process,
      });
    }
    console.log('Route updated.', clonedUpdatedRoute);
  };

  const switchChainHook = async (requiredChainId: number) => {
    if (!account.isActive || !account.signer) {
      return account.signer;
    }
    const currentChainId = await account.signer.getChainId();
    if (currentChainId !== requiredChainId) {
      const switched = await switchChain(requiredChainId);
      if (!switched) {
        throw new Error('Chain was not switched.');
      }
    }
    return account.signer;
  };

  const executeRouteMutation = useMutation(
    () => {
      if (!account.signer) {
        throw Error('Account signer not found.');
      }
      if (!routeExecution?.route) {
        throw Error('Execution route not found.');
      }
      return lifi.executeRoute(account.signer, routeExecution.route, {
        updateCallback,
        switchChainHook,
        infiniteApproval: false,
        executeInBackground,
      });
    },
    {
      onMutate: () => {
        console.log('Execution started.', routeId);
        if (routeExecution) {
          emitter.emit(WidgetEvent.RouteExecutionStarted, routeExecution.route);
        }
      },
    },
  );

  const resumeRouteMutation = useMutation(
    (resumedRoute?: Route) => {
      if (!account.signer) {
        throw Error('Account signer not found.');
      }
      if (!routeExecution?.route) {
        throw Error('Execution route not found.');
      }
      return lifi.resumeRoute(
        account.signer,
        resumedRoute ?? routeExecution.route,
        {
          updateCallback,
          switchChainHook,
          infiniteApproval: false,
          executeInBackground,
        },
      );
    },
    {
      onMutate: () => {
        console.log('Resumed to execution.', routeId);
      },
    },
  );

  const executeRoute = useCallback(() => {
    executeRouteMutation.mutateAsync(undefined, {
      onError: () => {
        console.warn('Execution failed!', routeId);
        // Notification.showNotification(NotificationType.SwapExecution_ERROR);
      },
      onSuccess: (route: Route) => {
        console.log('Executed successfully!', route);
        // Notification.showNotification(NotificationType.TRANSACTION_SUCCESSFULL);
      },
    });
  }, [executeRouteMutation, routeId]);

  const resumeRoute = useCallback(
    (route?: Route) => {
      resumeRouteMutation.mutateAsync(route, {
        onError: () => {
          console.warn('Resumed execution failed.', routeId);
        },
        onSuccess: (route) => {
          console.log('Resumed execution successful.', route);
        },
      });
    },
    [resumeRouteMutation, routeId],
  );

  const restartRouteMutation = useCallback(() => {
    restartRoute(routeId);
    resumeRoute(routeExecution?.route);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeRoute, routeExecution?.route, routeId]);

  const deleteRouteMutation = useCallback(() => {
    deleteRoute(routeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId]);

  // Resume route execution after page reload
  useEffect(() => {
    // Check if route is eligible for automatic resuming
    if (
      isRouteActive(routeExecution?.route) &&
      account.isActive &&
      !resumedAfterMount.current
    ) {
      resumedAfterMount.current = true;
      resumeRoute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.isActive]);

  useEffect(() => {
    return () => {
      const route = useRouteExecutionStore.getState().routes[routeId]?.route;
      if (!route || !isRouteActive(route)) {
        return;
      }
      lifi.updateRouteExecution(route, { executeInBackground: true });
      console.log('Move route execution to background.', routeId);
      resumedAfterMount.current = false;
    };
  }, [lifi, routeId]);

  return {
    executeRoute,
    restartRoute: restartRouteMutation,
    deleteRoute: deleteRouteMutation,
    route: routeExecution?.route,
    status: routeExecution?.status,
  };
};
