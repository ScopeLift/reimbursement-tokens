import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { useContext, useEffect, useState } from 'react';
import { ModalContext } from '../modal';
import { ToastContext } from '../toast/ToastContext';
import { useEagerConnect, useInactiveListener } from './hooks';
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';
import { ConnectionModal } from '.';

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.';
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network. " + error.message;
  } else if (error instanceof UserRejectedRequestErrorInjected) {
    return 'Please authorize this website to access your Ethereum account.';
  } else {
    console.error(error);
    return 'An unknown error occurred. Check the console for more details.';
  }
}

export const ConnectionWidget = () => {
  const { connector, account, active, error } = useWeb3React<Web3Provider>();
  const { setModal, clearModal } = useContext(ModalContext);
  const { setToast } = useContext(ToastContext);
  useEffect(() => {
    if (error) {
      console.log(error);
      setToast({
        type: 'error',
        content: getErrorMessage(error),
        timeout: 5000,
      });
    }
  }, [error]);

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has granted access already
  const triedEager = useEagerConnect();

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = useState<any>();
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  // clear modal after successful connection
  useEffect(() => {
    if (active) clearModal();
  }, [active, connector]);

  // handle logic to connect in reaction to certain events on the injected ethereum provider, if it exists
  useInactiveListener(!triedEager || !!activatingConnector);

  const showConnectionModal = () => {
    setModal({
      content: (
        <ConnectionModal
          props={{
            activatingConnector,
            setActivatingConnector,
            triedEager,
          }}
        />
      ),
      style: 'sm:w-3/4 md:w-1/2 lg:w-1/3',
    });
  };

  return (
    <>
      <button className="flex items-center w-full h-full px-4 py-2" onClick={() => showConnectionModal()}>
        <div
          className={
            'h-3 w-3 border-2 rounded-full mr-2 ' +
            (active && account ? 'bg-green-400' : activatingConnector ? 'bg-yellow-600' : 'bg-red-600')
          }
        ></div>

        {active && account ? (
          <span className="font-mono">{account}</span>
        ) : activatingConnector ? (
          'Activating...'
        ) : (
          'Connect Wallet'
        )}
      </button>
    </>
  );
};
