/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * https://trufflesuite.com/docs/truffle/reference/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

require('dotenv').config();
const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
const PrivateKeyProvider = require("@truffle/hdwallet-provider");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "35.239.20.185",
      port: 7545,
      network_id: "*", // Match any network id
      // gasPrice: 0,
      // gas: "0x1ffffffffffffe"
    },
    develop: {
      port: 8545,
      // gasPrice: 0,
      // gas: "0x1ffffffffffffe"
    },
    quickstartWallet: {
      provider: () => new PrivateKeyProvider(privateKey, "http://35.239.20.185:8545"),
      network_id: "*",
      // gasPrice: 0,
      // gas: "0x1ffffffffffffe"
    }
  },
  compilers: {
    solc: {
      version: "0.8.13",      // Fetch exact version from solc-bin
    }
  }
};
// truffle compile
// truffle migrate --network quickstartWallet
// truffle test --network quickstartWallet