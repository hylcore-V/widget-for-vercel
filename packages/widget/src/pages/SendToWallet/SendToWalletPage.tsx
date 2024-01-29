import ErrorIcon from '@mui/icons-material/Error';
import HistoryIcon from '@mui/icons-material/History';
import TurnedInIcon from '@mui/icons-material/TurnedIn';
import WalletIcon from '@mui/icons-material/Wallet';
import { Tooltip } from '@mui/material';
import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { BottomSheetBase } from '../../components/BottomSheet';
import { CardButton } from '../../components/Card';
import {
  useAccount,
  useAddressValidation,
  useChain,
  useToAddressRequirements,
} from '../../hooks';
import type { Bookmark } from '../../stores';
import { useBookmarkActions, useBookmarks, useFieldValues } from '../../stores';
import { navigationRoutes } from '../../utils';
import { BookmarkAddressSheet } from './BookmarkAddressSheet';
import { ConfirmAddressSheet } from './ConfirmAddressSheet';
import {
  AddressInput,
  SendToWalletButton,
  SendToWalletButtonRow,
  SendToWalletCard,
  SendToWalletIconButton,
  SendToWalletPageContainer,
  ValidationAlert,
  WalletNumber,
} from './SendToWalletPage.style';

export const SendToWalletPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { bookmarks, recentWallets } = useBookmarks();
  const { addBookmark, getBookmark, setSelectedBookmark, addRecentWallet } =
    useBookmarkActions();
  const bookmarkAddressSheetRef = useRef<BottomSheetBase>(null);
  const confirmAddressSheetRef = useRef<BottomSheetBase>(null);
  const [inputAddressValue, setInputAddressValue] = useState('');
  const [validatedWallet, setValidatedWallet] = useState<Bookmark>();
  const [errorMessage, setErrorMessage] = useState('');
  const { validateAddress, isValidating } = useAddressValidation();
  const { accounts } = useAccount();
  const connectedWallets = accounts.filter((account) => account.isConnected);
  const { requiredToChainType } = useToAddressRequirements();
  const [toChainId] = useFieldValues('toChain');
  const { chain: toChain } = useChain(toChainId);

  const handleInputChange = (e: ChangeEvent) => {
    if (errorMessage) {
      setErrorMessage('');
    }
    setInputAddressValue((e.target as HTMLInputElement).value.trim());
  };

  const handleDone = async () => {
    if (isValidating) {
      return;
    }
    if (!inputAddressValue) {
      setErrorMessage(t('error.title.addressRequired'));
      return;
    }

    const validationResult = await validateAddress(inputAddressValue);
    if (!validationResult.isValid) {
      setErrorMessage(validationResult.error);
      return;
    }

    if (
      requiredToChainType &&
      requiredToChainType !== validationResult.chainType
    ) {
      setErrorMessage(
        t('error.title.walletChainTypeInvalid', {
          chainName: toChain?.name,
        }),
      );
      return;
    }

    setValidatedWallet({
      name:
        validationResult.addressType === 'ENS' ? inputAddressValue : undefined,
      address: validationResult.address,
      chainType: validationResult.chainType,
    });
    confirmAddressSheetRef.current?.open();
  };

  const handleBookmarkAddress = async () => {
    if (isValidating) {
      return;
    }
    if (!inputAddressValue) {
      setErrorMessage(t('error.title.addressRequired'));
      return;
    }

    const existingBookmarkWallet = getBookmark(inputAddressValue);
    if (existingBookmarkWallet) {
      setErrorMessage(
        t('error.title.bookmarkAlreadyExists', {
          name: existingBookmarkWallet.name,
        }),
      );
      return;
    }

    const validationResult = await validateAddress(inputAddressValue);

    if (validationResult.isValid) {
      setValidatedWallet({
        name:
          validationResult.addressType === 'ENS'
            ? inputAddressValue
            : undefined,
        address: validationResult.address,
        chainType: validationResult.chainType,
      });
      bookmarkAddressSheetRef.current?.open();
    } else {
      setErrorMessage(validationResult.error);
    }
  };

  const handleRecentWalletsClick = () => {
    navigate(navigationRoutes.recentWallets);
  };

  const handleConnectedWalletsClick = () => {
    navigate(navigationRoutes.connectedWallets);
  };
  const handleBookmarkedWalletsClick = () => {
    navigate(navigationRoutes.bookmarks);
  };

  const handleAddBookmark = (bookmark: Bookmark) => {
    addBookmark(bookmark);
    navigate(navigationRoutes.bookmarks);
  };

  const handleOnConfirm = (confirmedWallet: Bookmark) => {
    setSelectedBookmark(confirmedWallet);
    addRecentWallet(confirmedWallet);
  };

  return (
    <SendToWalletPageContainer topBottomGutters>
      <SendToWalletCard mb={6} variant={errorMessage ? 'error' : 'default'}>
        <AddressInput
          size="small"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          onChange={handleInputChange}
          value={inputAddressValue}
          placeholder={t('sendToWallet.enterAddress')}
          aria-label={t('sendToWallet.enterAddress')}
          maxRows={2}
          inputProps={{ maxLength: 128 }}
          multiline
        />
        {errorMessage ? (
          <ValidationAlert icon={<ErrorIcon />} sx={{ pb: 2, paddingX: 2 }}>
            {errorMessage}
          </ValidationAlert>
        ) : null}
        <SendToWalletButtonRow sx={{ paddingX: 2, paddingBottom: 2 }}>
          <SendToWalletButton
            variant="text"
            onClick={handleDone}
            sx={{ flexGrow: 1 }}
          >
            {t('button.done')}
          </SendToWalletButton>
          <Tooltip title={t('button.bookmark')} arrow>
            <SendToWalletIconButton onClick={handleBookmarkAddress}>
              <TurnedInIcon fontSize="small" />
            </SendToWalletIconButton>
          </Tooltip>
        </SendToWalletButtonRow>
        <ConfirmAddressSheet
          ref={confirmAddressSheetRef}
          validatedBookmark={validatedWallet}
          onConfirm={handleOnConfirm}
        />
        <BookmarkAddressSheet
          ref={bookmarkAddressSheetRef}
          validatedWallet={validatedWallet}
          onAddBookmark={handleAddBookmark}
        />
      </SendToWalletCard>
      <CardButton
        title={t('header.recentWallets')}
        icon={<HistoryIcon />}
        onClick={handleRecentWalletsClick}
      >
        {!!recentWallets.length && (
          <WalletNumber>{recentWallets.length}</WalletNumber>
        )}
      </CardButton>
      <CardButton
        title={t('sendToWallet.connectedWallets')}
        icon={<WalletIcon />}
        onClick={handleConnectedWalletsClick}
      >
        {!!connectedWallets.length && (
          <WalletNumber>{connectedWallets.length}</WalletNumber>
        )}
      </CardButton>
      <CardButton
        title={t('header.bookmarkedWallets')}
        icon={<TurnedInIcon />}
        onClick={handleBookmarkedWalletsClick}
      >
        {!!bookmarks.length && <WalletNumber>{bookmarks.length}</WalletNumber>}
      </CardButton>
    </SendToWalletPageContainer>
  );
};
