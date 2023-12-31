import { EthProvider } from "./contexts/EthContext";
import { Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Eva from "./components/Eva";
import Staking from "./components/Staking";
import Token from "./components/Token";
import Admin from "./components/Admin";
import MyStakingPlan from "./components/StakingPlan";

function App() {
  return (
    <EthProvider>
      <ChakraProvider>
        <div>
        <Header />
        <Routes>
            <Route path="*" element={<di>404</di>} />
            <Route path="/" element={<Home />} />
            <Route path="/eva" element={<Eva />} />
            <Route path="/staking" element={<Staking />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/token" element={<Token />} />
            <Route path="/mystakingplan" element={<MyStakingPlan />} />
        </Routes>
        <Footer />
      </div>
      </ChakraProvider>
    </EthProvider>
  );
}

export default App;
