import React from "react";
//import Web3 from 'web3';
import {Box, Center, Text, Stack, List, ListItem, ListIcon, Button, useColorModeValue, VStack, FormControl, FormLabel, Input,InputGroup } from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';
import useEth from "../../contexts/EthContext/useEth";
import { useEffect, useState } from "react";

function MyStakingPlan() {
  const { state: { contract, accounts } } = useEth();
  const [addressEVCT, setAddressEVCT] = useState();
  const [symbolEVCT, setSymbolEVCT] = useState();
  const [aprEVCT, setAprEVCT] = useState();
  const [feesEVCT, setFeesEVCT] = useState();
  const [totalValueLockedEVCT, setTotalValueLockedEVCT] = useState();
  const [userBalancelEVCT, setUserBalanceEVCT] = useState();
  const [userRewards, setUserRewards] = useState();
  const [amountToStake, setAmountToStake] = useState();
  const [contractAddress, setContractAddress] = useState(contract.options.address);
  

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
      setAddressEVCT(findEVCT.address);
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
    setContractAddress(contract.options.address);

  }, [contract, accounts])

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.target.reset();
  }

  const OnClickStake = async (event) => {
    if (amountToStake === "") {
        alert("Please enter an amount to stake !");
        window.location.reload(false);
        return;
    }
    if (amountToStake.length > 2000) {
        alert("You want to stake more than your wallet balance !");
        window.location.reload(false);
        return;
    }
    
    await contract.methods.deposit(amountToStake, addressEVCT).send({ from: accounts[0] });
    window.location.reload(true);
  }

  const OnClickApprove = async (event) => {
      const res = await contract.methods.approveEVCT(addressEVCT, 9999999999).send({ from: accounts[0] });
      console.log("APPROVE RESULT ======================> " + res);
  }

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
          <br></br>
          <VStack spacing={5}><form onSubmit={handleSubmit}>
              <FormControl id="name">
                <FormLabel>Amount to Stake</FormLabel>
                <InputGroup borderColor="#E0E1E7">
                  <Input type="text" placeholder="less than in your Wallet" size="md" onChange={event => setAmountToStake(event.currentTarget.value)} />
                </InputGroup>
              </FormControl>
              <FormControl id="name" float="right">
                <Button mt={10} w={'full'} bg={'green.400'} color={'white'} rounded={'xl'} boxShadow={'0 5px 20px 0px rgb(72 187 120 / 43%)'} _hover={{ bg: 'green.500', }} _focus={{ bg: 'green.500', }} onClick={OnClickStake}>
                 Stake
                </Button>
              </FormControl></form>
            </VStack>
            <Button mt={10} w={'full'} bg={'green.400'} color={'white'} rounded={'xl'} boxShadow={'0 5px 20px 0px rgb(72 187 120 / 43%)'} _hover={{ bg: 'green.500', }} _focus={{ bg: 'green.500', }} onClick={OnClickApprove}>
                 Approve
            </Button>
        </Box>
      </Box>
    </Center>
  );
}

export default MyStakingPlan;
