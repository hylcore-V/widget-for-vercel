import { useNavigate } from 'react-router-dom';
import { SwapButton } from '../../components/SwapButton';
import { useSwapRoutes } from '../../hooks';
import { useSetExecutableRoute } from '../../stores';
import { navigationRoutes } from '../../utils';

export const MainSwapButton: React.FC = () => {
  const navigate = useNavigate();
  const setExecutableRoute = useSetExecutableRoute();

  const { routes: swapRoutes, isLoading, isFetching } = useSwapRoutes();

  const currentRoute = swapRoutes?.[0];

  const handleClick = async () => {
    if (currentRoute) {
      setExecutableRoute(currentRoute);
      navigate(navigationRoutes.swap, {
        state: { routeId: currentRoute.id },
      });
    }
  };

  return (
    <SwapButton
      onClick={handleClick}
      currentRoute={currentRoute}
      loading={isLoading || isFetching}
    />
  );
};
