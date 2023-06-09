import type { ExchangeRateUpdateParams } from '@lifi/sdk';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Tooltip } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import type { BottomSheetBase } from '../../components/BottomSheet';
import { ContractComponent } from '../../components/ContractComponent';
import { GasMessage } from '../../components/GasMessage';
import { useHeaderStore } from '../../components/Header';
import { Insurance } from '../../components/Insurance';
import { getStepList } from '../../components/Step';
import {
  useNavigateBack,
  useRouteExecution,
  useWidgetEvents,
} from '../../hooks';
import { SwapFormKey, useWidgetConfig } from '../../providers';
import { RouteExecutionStatus } from '../../stores';
import { WidgetEvent } from '../../types/events';
import { formatTokenAmount } from '../../utils';
import type { ExchangeRateBottomSheetBase } from './ExchangeRateBottomSheet';
import { ExchangeRateBottomSheet } from './ExchangeRateBottomSheet';
import { StartIdleSwapButton, StartSwapButton } from './StartSwapButton';
import { StatusBottomSheet } from './StatusBottomSheet';
import { Container } from './SwapPage.style';
import {
  TokenValueBottomSheet,
  getTokenValueLossThreshold,
} from './TokenValueBottomSheet';
import { calcValueLoss } from './utils';

export const SwapPage: React.FC = () => {
  const { t } = useTranslation();
  const { setValue } = useFormContext();
  const emitter = useWidgetEvents();
  const { navigateBack } = useNavigateBack();
  const { variant, insurance } = useWidgetConfig();
  const { state }: any = useLocation();
  const stateRouteId = state?.routeId;
  const [routeId, setRouteId] = useState<string>(stateRouteId);

  const tokenValueBottomSheetRef = useRef<BottomSheetBase>(null);
  const exchangeRateBottomSheetRef = useRef<ExchangeRateBottomSheetBase>(null);

  const onAcceptExchangeRateUpdate = (
    resolver: (value: boolean) => void,
    data: ExchangeRateUpdateParams,
  ) => {
    exchangeRateBottomSheetRef.current?.open(resolver, data);
  };

  const { route, status, executeRoute, restartRoute, deleteRoute } =
    useRouteExecution({
      routeId: routeId,
      onAcceptExchangeRateUpdate,
    });

  useEffect(() => {
    if (route && variant !== 'nft') {
      const transactionType =
        route.fromChainId === route.toChainId ? 'Swap' : 'Bridge';
      return useHeaderStore
        .getState()
        .setTitle(
          status === RouteExecutionStatus.Idle
            ? t(`button.review${transactionType}`)
            : t(`header.${transactionType.toLowerCase() as 'swap' | 'bridge'}`),
        );
    }
  }, [route, status, t, variant]);

  if (!route) {
    return null;
  }

  const tokenValueLossThresholdExceeded = getTokenValueLossThreshold(route);

  const handleExecuteRoute = () => {
    if (tokenValueBottomSheetRef.current?.isOpen()) {
      emitter.emit(WidgetEvent.RouteHighValueLoss, {
        fromAmountUsd: route.fromAmountUSD,
        gasCostUSD: route.gasCostUSD,
        toAmountUSD: route.toAmountUSD,
        valueLoss: calcValueLoss(route),
      });
    }
    tokenValueBottomSheetRef.current?.close();
    executeRoute();
    setValue(SwapFormKey.FromAmount, '');
  };

  const handleSwapClick = async () => {
    if (status === RouteExecutionStatus.Idle) {
      if (tokenValueLossThresholdExceeded && variant !== 'nft') {
        tokenValueBottomSheetRef.current?.open();
      } else {
        handleExecuteRoute();
      }
    }
    if (status === RouteExecutionStatus.Failed) {
      restartRoute();
    }
  };

  const handleRemoveRoute = () => {
    navigateBack();
    deleteRoute();
  };

  const getSwapButtonText = () => {
    switch (status) {
      case RouteExecutionStatus.Idle:
        switch (variant) {
          case 'nft':
            return t('button.buyNow');
          case 'refuel':
            return t('button.startBridging');
          default:
            const transactionType =
              route.fromChainId === route.toChainId ? 'Swapping' : 'Bridging';
            return t(`button.start${transactionType}`);
        }
      case RouteExecutionStatus.Failed:
        return t('button.tryAgain');
      default:
        return '';
    }
  };

  const insuredRoute = route.insurance?.state === 'INSURED';
  const insurableRoute =
    insurance &&
    variant !== 'refuel' &&
    status === RouteExecutionStatus.Idle &&
    route.insurance?.state === 'INSURABLE';

  const insuranceAvailable = insuredRoute || insurableRoute;

  const SwapButton = insurableRoute ? StartIdleSwapButton : StartSwapButton;

  const getInsuranceCoverageId = () =>
    route.steps[0].execution?.process
      .filter((process) => process.type !== 'TOKEN_ALLOWANCE')
      .find((process) => process.txHash)?.txHash ?? route.fromAddress;

  return (
    <Container>
      {getStepList(route)}
      {variant === 'nft' ? <ContractComponent mt={2} /> : null}
      {insuranceAvailable ? (
        <Insurance
          mt={2}
          status={status}
          insurableRouteId={stateRouteId}
          feeAmountUsd={route.insurance.feeAmountUsd}
          insuredAmount={formatTokenAmount(
            route.toAmountMin,
            route.toToken.decimals,
          )}
          insuredTokenSymbol={route.toToken.symbol}
          insuranceCoverageId={getInsuranceCoverageId()}
          onChange={setRouteId}
        />
      ) : null}
      {status === RouteExecutionStatus.Idle ||
      status === RouteExecutionStatus.Failed ? (
        <>
          <GasMessage mt={2} route={route} />
          <Box mt={2} display="flex">
            <SwapButton
              text={getSwapButtonText()}
              onClick={handleSwapClick}
              route={route}
              insurableRouteId={stateRouteId}
            />
            {status === RouteExecutionStatus.Failed ? (
              <Tooltip
                title={t('button.removeTransaction')}
                placement="bottom-end"
                enterDelay={400}
                arrow
              >
                <Button
                  onClick={handleRemoveRoute}
                  sx={{
                    minWidth: 48,
                    marginLeft: 1,
                  }}
                >
                  <DeleteIcon />
                </Button>
              </Tooltip>
            ) : null}
          </Box>
        </>
      ) : null}
      {status ? <StatusBottomSheet status={status} route={route} /> : null}
      {tokenValueLossThresholdExceeded && variant !== 'nft' ? (
        <TokenValueBottomSheet
          route={route}
          ref={tokenValueBottomSheetRef}
          onContinue={handleExecuteRoute}
        />
      ) : null}
      <ExchangeRateBottomSheet ref={exchangeRateBottomSheetRef} />
    </Container>
  );
};
