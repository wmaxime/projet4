import React from "react";
import {Button, FormControl, FormLabel, Input } from '@chakra-ui/react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react'


function UnStake() {
    // MODAL PART
    const { isOpen, onOpen, onClose } = useDisclosure()
    const initialRef = React.useRef(null)
    const finalRef = React.useRef(null)
    // END MODAL PART

    return (
      <>
        <Button onClick={onOpen} bg={'green.400'} color={'white'} rounded={'xl'} boxShadow={'0 5px 20px 0px rgb(72 187 120 / 43%)'} _hover={{ bg: 'green.500', }} _focus={{ bg: 'green.500', }}>
          Open Modal</Button>
        <Button ml={4} ref={finalRef}>
          I'll receive focus on close
        </Button>
  
        <Modal
          initialFocusRef={initialRef}
          finalFocusRef={finalRef}
          isOpen={isOpen}
          onClose={onClose}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Unstaking</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel>Amount</FormLabel>
                <Input ref={initialRef} placeholder='0' />
              </FormControl>
            </ModalBody>
            <ModalFooter>
            <Button colorScheme='blue' mr={3}>
                 Get it
            </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  }

  export default UnStake;