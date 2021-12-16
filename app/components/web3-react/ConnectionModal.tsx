import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { injected } from './connectors';

enum ConnectorNames {
  Injected = 'Metamask',
}

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
  [ConnectorNames.Injected]: { connector: injected, icon: '/static/images/metamask-fox.svg' },
};

export const ConnectionModal = ({ props }) => {
  const { connector, activate, deactivate } = useWeb3React<Web3Provider>();
  const { activatingConnector } = props;

  return (
    <div className="pb-2">
      <div className="flex flex-col px-2 justify-center items-center">
        <div className="my-2 mx-auto">Choose your web3 provider:</div>
        {Object.keys(connectorsByName).map((connectorName) => {
          // @ts-ignore
          const { connector: currentConnector, icon } = connectorsByName[connectorName];
          const activating = currentConnector === activatingConnector;
          const connected = currentConnector === connector;
          if (connectorName === 'Network') return <div key={connectorName}></div>;
          return (
            <div key={connectorName} className="flex mb-2 p-2 rounded items-center content-between">
              <button
                type="button"
                className={`inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 ${
                  connected ? 'bg-green-100' : 'bg-white'
                } hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                onClick={async () => {
                  console.log(connected, activating, connectorName);
                  if (connected) return deactivate();
                  // if connector is injected, set the activating connector
                  if (!activating && connectorName === ConnectorNames.Injected) {
                    await activate(currentConnector);
                  }
                }}
              >
                <img src={icon} className="mr-4" /> {connectorName}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
