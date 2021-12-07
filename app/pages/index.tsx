import deployment from '@reimbursement-token/contracts/deploys/hardhat.json';

const Index = () => {
  return (
    <div>
      <p>Contract deployments:</p>
      <ul>
        {Object.entries(deployment).map(([key, val]) => (
          <li key={key}>
            {key}: {val}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Index;
