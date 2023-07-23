import useEth from "../../contexts/EthContext/useEth";
import { useState } from "react";
import DisplayPool from "../display/displayPool";
import {Box, Button, VStack, WrapItem, FormControl, FormLabel, Input,InputGroup, Center, Select } from '@chakra-ui/react';

function ManagePool() {
  const { state: { contract, accounts } } = useEth();
  const [tokenAddress, setTokenAddress] = useState();
  const [poolStatus, setPoolStatus] = useState("true");

  const handleSubmit = async (event) => {
    event.preventDefault();
    // 👇️ clear all input values in the form
    event.target.reset();
  }

  const OnClickUnlockPool = async (event) => {
    // alert(`apr: ${apr} & fees: ${fees}`);
    if (tokenAddress === "") {
        alert("Please enter an address !");
        window.location.reload(false);
        return;
    }
    if (tokenAddress.length > 42 || tokenAddress.length < 42) {
        alert("L'adresse doit faire 42 caractères !");
        window.location.reload(false);
        return;
    }
    
    // Set string to boolean method
    const boolStatus = (poolStatus.toLowerCase() === "true");
    //console.log("Pause value =================== " + boolStatus);
    await contract.methods.setPoolPaused(tokenAddress, boolStatus).send({ from: accounts[0] });
    window.location.reload(true);
  }

  return (
    <div className="App">
      <DisplayPool />
    <Center>
       <WrapItem justifyContent="Center">
        <Box bg="white" borderRadius="lg">
          <Box m={1} color="#0B0E3F">
            <VStack spacing={5}><form onSubmit={handleSubmit}>
              <FormControl id="name">
                <FormLabel>Token address</FormLabel>
                <InputGroup borderColor="#E0E1E7">
                  <Input type="text" placeholder="Example : 0xABCDE12345" size="md" onChange={event => setTokenAddress(event.currentTarget.value)} />
                </InputGroup>
              </FormControl>
              <br></br>
              <Select placeholder='' defaultValue="true" onChange={event => setPoolStatus(event.currentTarget.value)}>
              <option value='true'>Pause</option>
              <option value='false'>UnPause</option>
              </Select>
              <br></br>
              <FormControl id="name" float="right">
                <Button colorScheme='blue' onClick={OnClickUnlockPool}> Change
                </Button>
              </FormControl></form>
            </VStack>
          </Box>
        </Box>
      </WrapItem>
    </Center>
    </div>
  );
}

export default ManagePool;