import 'tailwindcss/tailwind.css';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { WithModal } from '../components/modal';
import { WithToast } from '../components/toast';
import deployment from '@reimbursement-token/contracts/deploys/localhost.json';
import { ConnectionWidget } from '../components/web3-react';

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

const Index = () => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <WithToast>
        <WithModal>
          <ConnectionWidget />
          <div>
            <p>Contract deployments:</p>
            {JSON.stringify(deployment)}
          </div>
        </WithModal>
      </WithToast>
    </Web3ReactProvider>
  );
};

export default Index;
