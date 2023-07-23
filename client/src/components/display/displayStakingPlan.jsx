import React from "react";
import {Box, Stack, Heading, Text, VStack, useColorModeValue, List, ListItem, ListIcon, Button} from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

function DisplayStakingPlan() {
  return (
    <Box py={12}>

    <VStack spacing={2} textAlign="center">

      <Heading as="h1" fontSize="4xl">
        Plans that fit your need
      </Heading>
      <Text fontSize="lg" color={'gray.500'}>
        A locked plan to get the best rewards.<br />A flexible plan that let you free to manage you tokens depending your charging experience.
      </Text>
    </VStack>

    <Stack direction={{ base: 'column', md: 'row' }} textAlign="center" justify="center" spacing={{ base: 4, lg: 10 }} py={10}>
    
      <Box mb={4} shadow="base" borderWidth="1px" alignSelf={{ base: 'center', lg: 'flex-start' }} borderColor={useColorModeValue('gray.200', 'gray.500')} borderRadius={'xl'}>
        <Box py={4} px={12}>
          <Text fontWeight="500" fontSize="2xl">
            Flexible Plan
          </Text>
        </Box>
        <VStack bg={useColorModeValue('gray.50', 'gray.700')} py={4}borderBottomRadius={'xl'}>
          <List spacing={3} textAlign="start" px={12}>
            <ListItem>
              <ListIcon as={FaCheckCircle} color="green.500" />
              unlocked when you need it
            </ListItem>
            <ListItem>
              <ListIcon as={FaCheckCircle} color="green.500" />
              until 15% APR
            </ListItem>
            <ListItem>
              <ListIcon as={FaCheckCircle} color="green.500" />
              bonus bonus bonus
            </ListItem>
          </List>
          <Box w="80%" pt={7}>
          <NavLink to="/mystakingplan"><Button w="full" colorScheme="red" variant="outline">
              Stake
            </Button></NavLink>
          </Box>
        </VStack>
        </Box>

<Box mb={4} shadow="base" borderWidth="1px" alignSelf={{ base: 'center', lg: 'flex-start' }} borderColor={useColorModeValue('gray.200', 'gray.500')} borderRadius={'xl'}>
        <Box position="relative">
          <Box py={4} px={12}>
            <Text fontWeight="500" fontSize="2xl">
              Locked Plan
            </Text>
          </Box>
          <VStack bg={useColorModeValue('gray.50', 'gray.700')} py={4} borderBottomRadius={'xl'}>
            <List spacing={3} textAlign="start" px={12}>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                locked for a period of 12 month
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                best apr, until 150%
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                rewards usable for charging credits
              </ListItem>
            </List>
            <Box w="80%" pt={7}>
              <Button w="full" colorScheme="red" variant="outline">
                Stake
              </Button>
            </Box>
          </VStack>
        </Box>
</Box>
    </Stack>
  </Box>
  );
}

export default DisplayStakingPlan;
