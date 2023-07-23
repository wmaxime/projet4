import useEth from "../../contexts/EthContext/useEth";
import { useEffect, useState } from "react";

function ManageVault() {
  const { state: { contract, accounts } } = useEth();
  const [vaultAddress, setVaultAddress] = useState();

  // Recuperation des events
  useEffect (() => {

    async function getVault() {
        const vault = await contract.methods.getMyVault().call({ from: accounts[0] });
        setVaultAddress(vault);
        //alert("vaultAddress : " + vault);
        //console.log("VAULT ADRESS ============ " + vault);
    }

    getVault();

  }, [contract, accounts])


  return (
<main>VAULT MANAGEMENT</main>
  );
}

export default ManageVault;