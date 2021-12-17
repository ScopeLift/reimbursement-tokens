import deployment from '@reimbursement-token/contracts/deploys/localhost.json';

const Index = () => {
  return (
    <div>
      <p>Contract deployments:</p>
      <ul>{JSON.stringify(deployment)}</ul>
    </div>
  );
};

export default Index;
