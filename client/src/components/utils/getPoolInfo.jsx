import useEth from "../../../contexts/EthContext/useEth";
import { useState, useEffect } from "react";

function GetPoolInfo() {
  const { state: { accounts, contract, artifact } } = useEth();
  const [PoolData, setPoolData] = useState(0);

  useEffect(() => {
    async function _getPoolInfo() {
      if (artifact) {
        const storage = await contract.methods.poolData().call({ from: accounts[0] });
        setPoolData(storage);
      }
    }
    _getPoolInfo();
  }, [accounts, contract, artifact]);


  return ( PoolData );
}

export default GetPoolInfo;