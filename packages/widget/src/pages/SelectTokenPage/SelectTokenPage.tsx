import { Box, Container, Divider, Typography } from '@mui/material';
import { FC, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TokenList } from '../../components/TokenList';
import { useContentHeight } from '../../hooks';
import { SwapFormDirection } from '../../providers/SwapFormProvider';
import { ElementId } from '../../utils/elements';
import { ChainSelect } from './ChainSelect';
import { SearchTokenInput } from './SearchTokenInput';

export const SelectTokenPage: FC<{ formType: SwapFormDirection }> = ({
  formType,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const contentHeight = useContentHeight();

  const handleTokenClick = () => {
    navigate(-1);
  };

  useLayoutEffect(() => {
    const element = document.getElementById(ElementId.ScrollableContainer);
    if (element) {
      element.style.overflowY = 'hidden';
    }
    return () => {
      if (element) {
        element.style.overflowY = 'scroll';
      }
    };
  }, []);

  return (
    <Container disableGutters>
      <Box p={3}>
        <SearchTokenInput />
      </Box>
      <Divider light />
      <Box mt={3} mx={3}>
        <Typography variant="subtitle1" noWrap fontWeight="500" mb={1}>
          {t(`swap.selectChain`)}
        </Typography>
        <ChainSelect formType={formType} />
        <Box
          mt={3}
          pb={1}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle1" fontWeight="500" noWrap>
            {t(`swap.selectToken`)}
          </Typography>
        </Box>
      </Box>
      <TokenList
        height={contentHeight - 258}
        onClick={handleTokenClick}
        formType={formType}
      />
    </Container>
  );
};
