import { Box } from '@mui/material';
import { ActiveSwaps } from '../../components/ActiveSwaps';
import { GasSufficiencyMessage } from '../../components/GasSufficiencyMessage';
import { SelectChainAndToken } from '../../components/SelectChainAndToken';
import {
  SendToWallet,
  SendToWalletButton,
} from '../../components/SendToWallet';
import { SwapInput } from '../../components/SwapInput';
import { SwapRoutes } from '../../components/SwapRoutes';
import { FormContainer } from './MainPage.style';
import { MainSwapButton } from './MainSwapButton';

export const MainPage: React.FC = () => {
  return (
    <FormContainer disableGutters>
      <ActiveSwaps mx={3} mt={1} mb={2} />
      <SelectChainAndToken mt={1} mx={3} mb={3} />
      <Box mx={3} mb={3}>
        <SwapInput formType="from" />
      </Box>
      <SwapRoutes mx={3} mb={3} />
      <GasSufficiencyMessage mx={3} mb={3} />
      <Box mx={3} mb={1}>
        <SendToWallet mb={3} />
        <Box sx={{ display: 'flex' }}>
          <MainSwapButton />
          <SendToWalletButton />
        </Box>
      </Box>
    </FormContainer>
  );
};
