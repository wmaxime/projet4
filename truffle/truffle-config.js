const HDWalletProvider = require('@truffle/hdwallet-provider'); 
require('dotenv').config();

module.exports = {

  contracts_build_directory: "../client/src/contracts",
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
      },
  
      goerli:{
      provider : function() {return new HDWalletProvider({mnemonic:{phrase:`${process.env.MNEMONIC}`},providerOrUrl:`https://goerli.infura.io/v3/${process.env.INFURA_ID}`})},
      network_id:5,
      },
  
      sepolia:{
        provider : function() {return new HDWalletProvider({mnemonic:{phrase:`${process.env.MNEMONIC}`},providerOrUrl:`https://sepolia.infura.io/v3/${process.env.SEPOLIA_ID}`})},
        network_id:11155111,
        },
  
      mumbai:{
      provider : function() {return new HDWalletProvider({mnemonic:{phrase:`${process.env.MNEMONIC}`},providerOrUrl:`https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_ID}`})},
      network_id:80001,
      },
  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.18",
    }
  },


};
  