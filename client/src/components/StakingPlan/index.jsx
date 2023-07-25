import React from "react";
import web3js from "web3";
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

        // refresh de page si changement de compte ou Network dans Metamask 
        if(window.ethereum) {
          window.ethereum.on('chainChanged', () => {
          window.location.reload();
          })
          window.ethereum.on('accountsChanged', () => {
          window.location.reload();
          })
      }

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
      const decimalRewards = parseFloat(web3js.utils.fromWei(userRewards)).toFixed(1);
      //console.log( "VALUE =================== " +  parseFloat(toto).toFixed(1) );
      //console.log("TYPEOF =================== " + typeof toto);
      console.log("VALUE DECIMAL ============ " + decimalRewards);
      if ( decimalRewards === "0.0") {
        setUserRewards("0");
      } else {
        setUserRewards(decimalRewards);
      };

    }

    getListePools();

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

  const ModalOnClickUnStake = async (event) => {
    if (amountToStake === "") {
        alert("Please enter an amount to unstake !");
        window.location.reload(false);
        return;
    }
    //alert(amountToStake);
    await contract.methods.withdraw(addressEVCT, amountToStake).send({ from: accounts[0] });
    window.location.reload(true);
  }

  const OnClickClaim = async (event) => {
    if (userRewards === "") {
        alert("No rewards to claim !");
        window.location.reload(false);
        return;
    }

    await contract.methods.claimReward(addressEVCT).send({ from: accounts[0] });
    window.location.reload(true);
  }

  return (
    <Center py={6}>
      <Box
        maxW={'350'}
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
          <Stack direction={'row'} align={'center'} justify={'center'}>
            <Text fontSize={'3xl'} > Rewards : </Text>
            <Text fontSize={'6xl'} fontWeight={600}>
              {userRewards}
            </Text>
            <Text color={'gray.500'}>{symbolEVCT}</Text>
          </Stack>
        </Stack>

        <Box bg={useColorModeValue('gray.50', 'gray.900')} px={6} py={10} >
          <List spacing={3}>
            <ListItem>
              <ListIcon as={FaCheckCircle} color="green.400" />
              Your Staking Balance : {userBalancelEVCT} EVCT
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
                <FormLabel>Amount</FormLabel>
                <InputGroup borderColor="#E0E1E7">
                  <Input type="text" placeholder="0" size="md" onChange={event => setAmountToStake(event.currentTarget.value)} />
                </InputGroup>
              </FormControl>
              <FormControl id="name" float="right">
                <Button mt={10} w={'full'} bg={'green.400'} color={'white'} rounded={'xl'} boxShadow={'0 5px 20px 0px rgb(72 187 120 / 43%)'} _hover={{ bg: 'green.500', }} _focus={{ bg: 'green.500', }} onClick={OnClickStake}>
                 Stake
                </Button>
              </FormControl></form>
              <Button onClick={ModalOnClickUnStake} bg={'green.400'} color={'white'} rounded={'xl'} boxShadow={'0 5px 20px 0px rgb(72 187 120 / 43%)'} _hover={{ bg: 'green.500', }} _focus={{ bg: 'green.500', }}>
              UnStake
              </Button>
              <Button onClick={OnClickClaim} bg={'green.400'} color={'white'} rounded={'xl'} boxShadow={'0 5px 20px 0px rgb(72 187 120 / 43%)'} _hover={{ bg: 'green.500', }} _focus={{ bg: 'green.500', }}>
              Claim
              </Button>
            </VStack>
        </Box>
      </Box>
    </Center>
  );
}

export default MyStakingPlan;
