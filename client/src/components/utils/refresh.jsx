import { useEffect } from "react";

function Refresh() {
    useEffect(() => {
        // refresh de page si changement de compte ou Network dans Metamask 
        if(window.ethereum) {
            window.ethereum.on('chainChanged', () => {
            window.location.reload();
            })
            window.ethereum.on('accountsChanged', () => {
            window.location.reload();
            })
        }
    });
};

export default Refresh;