import React from "react";
import { Center, Box, Tabs, TabList, Tab } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

function Header() {
    return (
        <Box><Center>
            <Tabs variant='unstyled'>
                <TabList>
                <NavLink to="/"><Tab _selected={{ color: 'white', bg: 'blue.500' }}>Home</Tab></NavLink>
                <NavLink to="/eva"><Tab _selected={{ color: 'white', bg: 'green.400' }}>Token</Tab></NavLink>
                <NavLink to="/staking"><Tab _selected={{ color: 'white', bg: 'green.400' }}>Staking</Tab></NavLink>
                <NavLink to="/admin"><Tab _selected={{ color: 'white', bg: 'green.400' }}>Connect</Tab></NavLink>
                <NavLink to="/connect"><Tab _selected={{ color: 'white', bg: 'green.400' }}>Connect</Tab></NavLink>
                </TabList>
         {/*       <TabPanels>
                    <TabPanel>
                    </TabPanel>
                    <TabPanel>
                    </TabPanel>
                </TabPanels>  */} 
            </Tabs>
            </Center></Box>
            

    );
  }
  
  export default Header;
  