/* eslint-disable react/no-array-index-key */
import type { Step as StepType, TokenAmount } from '@lifi/sdk';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Card, CardTitle } from '../../components/Card';
import { StepActions } from '../../components/StepActions';
import { Token } from '../../components/Token';
import { GasStepProcess } from './GasStepProcess';
import { StepProcess } from './StepProcess';
import { StepTimer } from './StepTimer';

export const Step: React.FC<{
  step: StepType;
  fromToken?: TokenAmount;
  toToken?: TokenAmount;
}> = ({ step, fromToken, toToken }) => {
  const { t } = useTranslation();

  const stepHasError = step.execution?.process.some(
    (process) => process.status === 'FAILED',
  );

  const getCardTitle = () => {
    switch (step.type) {
      case 'lifi':
        if (step.includedSteps.every((step) => step.type === 'cross')) {
          return t('swap.stepBridge');
        }
        if (step.includedSteps.every((step) => step.type === 'swap')) {
          return t('swap.stepSwap');
        }
        return t('swap.stepSwapAndBridge');
      case 'swap':
        return t('swap.stepSwap');
      case 'cross':
        return t('swap.stepBridge');
      default:
        return t('swap.stepSwap');
    }
  };

  return (
    <Card variant={stepHasError ? 'error' : 'default'}>
      <Box
        sx={{
          display: 'flex',
          flex: 1,
        }}
      >
        <CardTitle flex={1}>{getCardTitle()}</CardTitle>
        <CardTitle sx={{ fontWeight: 500 }}>
          <StepTimer step={step} />
        </CardTitle>
      </Box>
      <Box py={1}>
        {fromToken ? <Token token={fromToken} px={2} py={1} /> : null}
        <StepActions step={step} px={2} py={1} dense />
        {step.execution?.process.map((process, index) => (
          <StepProcess key={index} step={step} process={process} />
        ))}
        <GasStepProcess step={step} />
        {toToken ? <Token token={toToken} px={2} py={1} /> : null}
      </Box>
    </Card>
  );
};
