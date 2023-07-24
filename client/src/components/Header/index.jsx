import React from "react";
import useEth from "../../contexts/EthContext/useEth";
import { useState, useEffect } from "react";
import { Box, Tabs, TabList, Tab } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

function Header() {
    const { state: { accounts, isOwner, contract } } = useEth();
    const [userAddress, setUserAddress] = useState("");

    useEffect(() => {
        // calcul short address to display
        const updateUserAddress = () => {
            if(accounts !== null) {
                setUserAddress(accounts[0]);
            }        
        }
        updateUserAddress();

        // refresh de page si changement de compte ou Network dans Metamask 
        if(window.ethereum) {
            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            })
            window.ethereum.on('accountsChanged', () => {
                window.location.reload();
            })
        }

    }, [accounts, contract]);

    const shortAdd = (userAddress.substring(0, 5) + "....." + userAddress.substring(37));

    return (
        <Box>
            <Tabs variant='unstyled' align="center">
                <TabList>
                <NavLink to="/"><Tab _selected={{ color: 'white', bg: 'blue.500' }}>Home</Tab></NavLink>
                <NavLink to="/eva"><Tab _selected={{ color: 'white', bg: 'green.400' }}>Eva Card</Tab></NavLink>
                <NavLink to="/staking"><Tab _selected={{ color: 'white', bg: 'green.400' }}>Staking</Tab></NavLink>

                {isOwner
                    ? <NavLink to="/admin"><Tab _selected={{ color: 'white', bg: 'green.400' }}>Admin</Tab></NavLink>
                    : <Tab></Tab>
                }
                &emsp;&emsp;&emsp;
                {shortAdd && isOwner
                    ? <Tab _selected={{ color: 'white', bg: 'red.0' }} bg="RED" align="end">{shortAdd}</Tab>
                    : <Tab _selected={{ color: 'white', bg: 'green.400' }}>Connect</Tab>
                }
                </TabList>
            </Tabs>
        </Box>
    );
  }
  
  export default Header;
  