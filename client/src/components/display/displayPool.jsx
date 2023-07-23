import useEth from "../../contexts/EthContext/useEth";
import { useEffect, useState } from "react";
import {TableContainer, Thead, Table, Tr, Th, Td, Tbody, Center} from '@chakra-ui/react';

function DisplayPool() {
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

//  console.log(listePools[0]);
//  console.log(listePools.length);

  return (
    <div className="App"><Center>
      <TableContainer>
        <Table variant="unstyled" colorScheme="whatsapp" textAlign="center" className="liste">
          <Thead>
            <Tr>
              <Th>Token</Th>
              <Th>Symbol</Th>
              <Th>APR</Th>
              <Th>Fees</Th>
              <Th>Minimum to Claim</Th>
              <Th>Total Value Locked</Th>
              <Th>Paused</Th>
            </Tr>
          </Thead>
          <Tbody>
            {listePools?.map((item) => (
              <Tr key={item.id}>
                <Td textAlign="center">{item.address}</Td>
                <Td textAlign="center">{item.symbol}</Td>
                <Td textAlign="center">{item.apr}</Td>
                <Td textAlign="center">{item.fees}</Td>
                <Td textAlign="center">{item.minimumClaim}</Td>
                <Td textAlign="center">{item.totalValueLocked}</Td>
                <Td textAlign="center">{item.paused}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer></Center>
    </div>
  );
}

export default DisplayPool;