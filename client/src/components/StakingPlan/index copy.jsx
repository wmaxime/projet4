import React from "react";
//import DisplayStakingPlan from "../display/displayStakingPlan";
//import GetPoolInfo from "../utils/getPoolInfo";
import {Box,Center,Text,Stack,List,ListItem,ListIcon,Button,useColorModeValue,} from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';

import useEth from "../../contexts/EthContext/useEth";
import { useEffect, useState } from "react";

function MyStakingPlan() {
  const { state: { contract, accounts } } = useEth();
  const [symbolEVCT, setSymbolEVCT] = useState();
  const [aprEVCT, setAprEVCT] = useState();
  const [feesEVCT, setFeesEVCT] = useState();
  const [totalValueLockedEVCT, setTotalValueLockedEVCT] = useState();
  const [userBalancelEVCT, setUserBalanceEVCT] = useState();
  const [userRewards, setUserRewards] = useState();
  

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

      const poolsTokenAddress = ListePoolsEvent.map((address) => address.returnValues.tokenAddress);
      
      const arrPools = [];
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

      const findEVCT = arrPools.find(obj => {return obj.symbol === "EVCT"});
      setSymbolEVCT(findEVCT.symbol);
      setAprEVCT(findEVCT.apr);
      setFeesEVCT(findEVCT.fees);
      setTotalValueLockedEVCT(findEVCT.totalValueLocked);
      const userInfo = await contract.methods.userInfo(findEVCT.address, accounts[0]).call({ from: accounts[0] });
      setUserBalanceEVCT(userInfo.stakedAmount);
      const userRewards = await contract.methods.calculateReward(findEVCT.address, accounts[0]).call({ from: accounts[0] });
      setUserRewards(userRewards);

    }

    getListePools();



  }, [contract, accounts])


  return (
<Center py={6}>
      <Box
        maxW={'330px'}
        w={'full'}
        bg={useColorModeValue('white', 'gray.800')}
        boxShadow={'2xl'}
        rounded={'md'}
        overflow={'hidden'}>
        <Stack
          textAlign={'center'}
          p={6}
          color={useColorModeValue('gray.800', 'white')}
          align={'center'}>
          <Text
            fontSize={'sm'}
            fontWeight={500}
            bg={useColorModeValue('green.50', 'green.900')}
            p={2}
            px={3}
            color={'green.500'}
            rounded={'full'}>
            EVCT Token
          </Text>
          <Stack direction={'row'} align={'center'} justify={'center'}>
            <Text fontSize={'3xl'}>Rewards : </Text>
            <Text fontSize={'6xl'} fontWeight={800}>
              {userRewards}
            </Text>
            <Text color={'gray.500'}>{symbolEVCT}</Text>
          </Stack>
        </Stack>

        <Box bg={useColorModeValue('gray.50', 'gray.900')} px={6} py={10}>
          <List spacing={3}>
            <ListItem>
              <ListIcon as={FaCheckCircle} color="green.400" />
              Your Balance : {userBalancelEVCT}
            </ListItem>
            <ListItem>
              <ListIcon as={FaCheckCircle} color="green.400" />
              APR : {aprEVCT} %
            </ListItem>
            <ListItem>
              <ListIcon as={FaCheckCircle} color="green.400" />
              Fees : {feesEVCT} %
            </ListItem>
            <ListItem>
              <ListIcon as={FaCheckCircle} color="green.400" />
              Pool TVL : {totalValueLockedEVCT}
            </ListItem>
          </List>

          <Button
            mt={10}
            w={'full'}
            bg={'green.400'}
            color={'white'}
            rounded={'xl'}
            boxShadow={'0 5px 20px 0px rgb(72 187 120 / 43%)'}
            _hover={{
              bg: 'green.500',
            }}
            _focus={{
              bg: 'green.500',
            }}>
            Stake
          </Button>
        </Box>
      </Box>
    </Center>
  );
}

export default MyStakingPlan;
