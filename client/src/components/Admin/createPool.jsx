import useEth from "../../contexts/EthContext/useEth";
import { useState, useEffect } from "react";
import {Box, Button, VStack, WrapItem, FormControl, FormLabel, Input, InputGroup, InputLeftElement, Textarea} from '@chakra-ui/react';

function CreatePool() {
    const { state: { accounts, contract } } = useEth();
    const [tokenAddress, setTokenAddress] = useState();
    const [apr, setAPR] = useState();
    const [fees, setFees] = useState();
    const [minimumClaim, setMinimumClaim] = useState();
    const [tokenSymbol, setTokenSymbol] = useState();


    return (
        <WrapItem>
        <Box bg="white" borderRadius="lg">
          <Box m={8} color="#0B0E3F">
            <VStack spacing={5}>
              <FormControl id="name">
                <FormLabel>Your Name</FormLabel>
                <InputGroup borderColor="#E0E1E7">
                  <InputLeftElement
                    pointerEvents="none"
                    
                  />
                  <Input type="text" size="md" />
                </InputGroup>
              </FormControl>
              <FormControl id="name">
                <FormLabel>Mail</FormLabel>
                <InputGroup borderColor="#E0E1E7">
                  <InputLeftElement
                    pointerEvents="none"
                    
                  />
                  <Input type="text" size="md" />
                </InputGroup>
              </FormControl>
              <FormControl id="name">
                <FormLabel>Message</FormLabel>
                <Textarea
                  borderColor="gray.300"
                  _hover={{
                    borderRadius: 'gray.300',
                  }}
                  placeholder="message"
                />
              </FormControl>
              <FormControl id="name" float="right">
                <Button
                  variant="solid"
                  bg="#0D74FF"
                  color="white"
                  _hover={{}}>
                  Send Message
                </Button>
              </FormControl>
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
