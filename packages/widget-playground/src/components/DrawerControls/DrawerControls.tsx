import { useState } from 'react';
import TabContext from '@mui/lab/TabContext';
import CloseIcon from '@mui/icons-material/Close';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Box, IconButton, Tooltip } from '@mui/material';
import {
  useConfigActions,
  useEditToolsActions,
  useEditToolsValues,
} from '../../store';
import { Tabs, Tab } from '../Tabs';
import { ExpandableCardAccordion } from '../Card';
import {
  Drawer,
  DrawerContentContainer,
  Header,
  HeaderRow,
  TabContentContainer,
  tooltipPopperZIndex,
} from './DrawerControls.style';
import {
  AppearanceControl,
  ButtonRadiusControl,
  CardRadiusControl,
  SubvariantControl,
  VariantControl,
  ColorControl,
  FontsControl,
  WalletManagementControl,
} from './DesignControls';

export const DrawerControls = () => {
  const [controlsTabsState, setControlsTabsState] = useState<'design' | 'code'>(
    'design',
  );
  const { isDrawerOpen } = useEditToolsValues();
  const { setDrawerOpen } = useEditToolsActions();
  const { resetConfig } = useConfigActions();

  return (
    <Drawer variant="persistent" anchor="left" open={isDrawerOpen}>
      <DrawerContentContainer>
        <HeaderRow>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Header>Widget</Header>
            <Tooltip
              title="Reset config"
              PopperProps={{ style: { zIndex: tooltipPopperZIndex } }}
              arrow
            >
              <IconButton onClick={() => resetConfig()}>
                <RestartAltIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Tooltip
            title="Close tools"
            PopperProps={{ style: { zIndex: tooltipPopperZIndex } }}
            arrow
          >
            <IconButton onClick={() => setDrawerOpen(!isDrawerOpen)}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </HeaderRow>
        <Tabs
          value={controlsTabsState}
          aria-label="tabs"
          indicatorColor="primary"
          onChange={(_, value) => setControlsTabsState(value)}
        >
          <Tab
            icon={<DesignServicesIcon />}
            iconPosition="start"
            label={'Design'}
            value="design"
            disableRipple
          />
          <Tab
            icon={<IntegrationInstructionsIcon />}
            iconPosition="start"
            label={'Code'}
            value="code"
            disableRipple
            disabled
          />
        </Tabs>
        <TabContext value={controlsTabsState}>
          <TabContentContainer value="design">
            <ExpandableCardAccordion>
              <VariantControl />
              <SubvariantControl />
              <AppearanceControl />
              <ColorControl />
              <FontsControl />
              <CardRadiusControl />
              <ButtonRadiusControl />
              <WalletManagementControl />
            </ExpandableCardAccordion>
          </TabContentContainer>
          <TabContentContainer value="code">
            <p>TODO: code controls</p>
          </TabContentContainer>
        </TabContext>
      </DrawerContentContainer>
    </Drawer>
  );
};
