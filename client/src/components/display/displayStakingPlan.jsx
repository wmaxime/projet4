import useEth from "../../contexts/EthContext/useEth";
import { useState, useEffect } from "react";
import {Box, Heading, Text, VStack} from '@chakra-ui/react';

function DisplayStakingPlan() {
  const { state: { contract, accounts } } = useEth();
  const [ListProposals, setListProposals] = useState([]);

  // Recuperation des events
  useEffect (() => {
    async function getListProposals() {
      // recuperation depuis les events
      const ListProposalsEvent = await contract.getPastEvents(
        "ProposalRegistered",
        {
          fromBlock: 0,
          toBlock: "latest",
        }
      );
      // Recuperation des Proposals ID pour pourvoir requeter les Descriptions ensuites
      let proposalsId = ListProposalsEvent.map((proposal) => proposal.returnValues.proposalId);
      //setListProposalsID(proposalsId); // => ça ne marche pas de recuperer via useState ListProposalsID pour l'utiliser à l'intérieur de la fonction, il faut utiliser proposalsId
      //console.log(proposalsId);
      
      let arrProposals = [];
      for (const ID of proposalsId) { // Foreach ne marche pas aussi
          const data = await contract.methods.getOneProposal(parseInt(ID)).call({ from: accounts[0] });
          arrProposals.push({
            id: ID,
            description: data.description,
            voteCount: data.voteCount,
          });
      }
      
      setListProposals(arrProposals);
    }

    getListProposals();

  }, [contract, accounts])

  //console.log(ListProposals);
  //console.log(ListProposals.length);

  return (
 
    <Box py={12}>
      <VStack spacing={2} textAlign="center">
        <Heading as="h1" fontSize="2xl">
          Display Staking Plan
        </Heading>
        <Text fontSize="lg" color={'gray.500'}>
          Here all the Staking Plan
        </Text>
      </VStack>
    </Box>

  );
}

export default DisplayStakingPlan;