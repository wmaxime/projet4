import useEth from "../../contexts/EthContext/useEth";
import { useEffect, useState } from "react";
import {TableContainer, Thead, Table, Tr, Th, Td, Tbody, Center} from '@chakra-ui/react';

function DisplayVault() {
  const { state: { contract, accounts } } = useEth();

  // Recuperation des events
  useEffect (() => {
    async function getVault() {
        const vaultAddress = await contract.methods.getMyVault().call({ from: accounts[0] });
        alert("vaultAddress : ${vaultAddress}");
        console.log("VAULT ADRESS ============ " + vaultAddress);
    }

  }, [contract, accounts])


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

export default DisplayVault;