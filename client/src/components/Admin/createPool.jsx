import useEth from "../../contexts/EthContext/useEth";
import { useState } from "react";
import {Box, Button, VStack, WrapItem, FormControl, FormLabel, Input, InputGroup, useToast } from '@chakra-ui/react';

function CreatePool() {
    const { state: { accounts, contract } } = useEth();
    const [tokenAddress, setTokenAddress] = useState();
    const [apr, setAPR] = useState();
    const [fees, setFees] = useState();
    const [minimumClaim, setMinimumClaim] = useState();
    const [tokenSymbol, setTokenSymbol] = useState();

    const handleSubmit = async (event) => {
        event.preventDefault();
        // 👇️ clear all input values in the form
        event.target.reset();
      }   

    const OnClickCreatePool = async (event) => {
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
        
        await contract.methods.createLiquidityPool(tokenAddress, apr, fees, minimumClaim, tokenSymbol).send({ from: accounts[0] });
        window.location.reload(true);
    }

    return (
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
              <FormControl id="name">
              <FormLabel>Token Symbol</FormLabel>
                <InputGroup borderColor="#E0E1E7">
                  <Input type="text" placeholder="Example : EVCT" size="md" onChange={event => setTokenSymbol(event.currentTarget.value)} />
                </InputGroup>
              </FormControl>
              <FormControl id="name">
                <FormLabel>APR</FormLabel>
                <InputGroup borderColor="#E0E1E7">
                  <Input type="text" placeholder="Example : 10 => 10%" size="md" onChange={event => setAPR(event.currentTarget.value)} />
                </InputGroup>
              </FormControl>
              <FormControl id="name">
                <FormLabel>Fees</FormLabel>
                <InputGroup borderColor="#E0E1E7">
                  <Input type="text" placeholder="Example : 3 => 3%" size="md" onChange={event => setFees(event.currentTarget.value)} />
                </InputGroup>
              </FormControl>
              <FormControl id="name">
                <FormLabel>Minimum amount to claim</FormLabel>
                <InputGroup borderColor="#E0E1E7">
                  <Input type="text" placeholder="Example : 200 => 200 Tokens" size="md" onChange={event => setMinimumClaim(event.currentTarget.value)} />
                </InputGroup>
              </FormControl><br></br>
              <FormControl id="name" float="right">
                {/* <Button variant="solid" bg="#0D74FF" color="white" _hover={{}} onClick={OnClickCreatePool}> Create */}
                <Button colorScheme='blue' onClick={OnClickCreatePool}> Create
                </Button>
              </FormControl></form>
            </VStack>
          </Box>
        </Box>
      </WrapItem>       
    );

/*  return (
    <div><hr className="hr_page"/>
      <form onSubmit={handleSubmit}>
        <div>
        <p><b>Create a Pool : </b></p>
        <input type="text" size="50" placeholder="Example : 0xABCDE123456..." onChange={handleChange} className="input-addr"/> &emsp;
        <button onClick={handleClick} type="submit">Ajouter</button>
        </div>
    </form>
    </div>
  ); */
}

export default CreatePool;
