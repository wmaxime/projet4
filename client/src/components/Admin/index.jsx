import useEth from "../../contexts/EthContext/useEth";
import { useState } from "react";
import DisplayPool from "../display/displayPool";
import {Box, Heading, Button, Stack} from '@chakra-ui/react';
import CreatePool from "./createPool";
import ManagePool from "./managePool";
import ManageVault from "./manageVault";

function Admin() {
  const { state: { isOwner } } = useEth();
  const [createPoolStatus, setCreatePoolStatus] = useState(false);
  const [managePoolStatus, setManagePoolStatus] = useState(false);
  const [manageVault, setManageVault] = useState(false);
  const [displayPools, setDisplayPools] = useState(false);

  const ClickOnCreatePool = async (event) => {
    setCreatePoolStatus(true);
    setManagePoolStatus(false);
    setManageVault(false);
    setDisplayPools(false);
  }

  const ClickOnManagePool = async (event) => {
    setManagePoolStatus(true);
    setCreatePoolStatus(false);
    setManageVault(false);
    setDisplayPools(false);
  }

  const ClickManageVault = async (event) => {
    setManageVault(true);
    setCreatePoolStatus(false);
    setManagePoolStatus(false);
    setDisplayPools(false);
  }

  const ClickDisplayPool = async (event) => {
    setDisplayPools(true);
    setCreatePoolStatus(false);
    setManagePoolStatus(false);
    setManageVault(false);
  }

  function Menu() {
    return (
    <Box py={12}>
      <Stack spacing={4} direction='row' align='center' justify="center">
      <Button colorScheme='whatsapp' onClick={ClickOnCreatePool}>Create Pool</Button>
      <Button colorScheme='whatsapp' onClick={ClickOnManagePool}>Manage Pools</Button>
      <Button colorScheme='whatsapp' onClick={ClickManageVault}>Manage Vault</Button>
      <Button colorScheme='whatsapp' onClick={ClickDisplayPool}>Display Pools</Button>
      </Stack>
    </Box>
    );
  }

 // console.log("CREATE POOL STATUS ========= " + createPoolStatus);

  return (
    <div><center><p>
      {isOwner
        ? <div>
          <Heading as="h1" fontSize="4xl">Staking Management</Heading><Menu />
          </div>
        : ''
      }
      </p></center>
      {createPoolStatus === true
        ? <CreatePool /> : <p></p>
      }
      {displayPools === true
        ? <DisplayPool /> : <p></p>
      }
       {managePoolStatus === true
        ? <ManagePool /> : <p></p>
      }
       {manageVault === true
        ? <ManageVault /> : <p></p>
      }
      <p></p>
    </div>
  );
}

export default Admin;
