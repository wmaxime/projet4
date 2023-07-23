import useEth from "../../contexts/EthContext/useEth";
import { useState, useEffect } from "react";

function GetPoolInfo() {
  const { state: { contract, accounts } } = useEth();
  const [listePools, setListePools] = useState([]);

  // Recuperation des events
  useEffect (() => {
    async function getListePools() {
      // recuperation depuis les events
      const ListePoolsEvent = await contract.getPastEvents(
        "PoolCreated",
        {
          fromBlock: 0,
          toBlock: "latest",
        }
      );

      let poolsTokenAddress = ListePoolsEvent.map((address) => address.returnValues.tokenAddress);
      
      let arrPools = [];
      for (const pta of poolsTokenAddress) {
          const data = await contract.methods.getPoolData(pta).call({ from: accounts[0] });
          arrPools.push({
            id: pta,
            address: pta,
            symbol: data.symbol,
            apr: data.apr,
            fees: data.fees,
            minimumClaim: data.minimumClaim,
            paused: data.paused.toString(),
            totalValueLocked: data.totalValueLocked
          });
      }

      setListePools(arrPools);
    }

    getListePools();

  }, [contract, accounts])
  
  return ( listePools );

}

export default GetPoolInfo;