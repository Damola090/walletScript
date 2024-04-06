const ethers = require("ethers");


const goerli = {
  chainId: "5",
  name: "Goerli",
  blockExplorerUrl: "https://goerli.etherscan.io",
  rpcUrl: "https://goerli.infura.io/v3/59b59e23bb7c44d799b5db4a1b83e4ee",
};

const mainnet = {
  chainId: "1",
  name: "Ethereum",
  blockExplorerUrl: "https://etherscan.io",
  rpcUrl: "https://mainnet.infura.io/v3/59b59e23bb7c44d799b5db4a1b83e4ee",
};

const ganache = {
  chainId: "1337",
  name: "Ganache",
  blockExplorerUrl: "https://ganache.iguess.io",
  rpcUrl: "http://127.0.0.1:8545",
};

const CHAINS_CONFIG = {
  [goerli.chainId]: goerli,
  [mainnet.chainId]: mainnet,
  [ganache.chainId]: ganache,
};

class CoinwaveTransaction {
  constructor() {}

  async sendToken(amount, from, to, privateKey) {
    const chain = CHAINS_CONFIG[ganache.chainId];

    // Create a provider using the Infura RPC URL for Goerli
    // Create a provider using the Ganache RPC URL for Gnache
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
    

    // Create a wallet instance from the sender's private key
    const wallet = new ethers.Wallet(privateKey, provider);

    // Construct the transaction object
    const tx = {
      to,
      value: ethers.utils.parseEther(amount.toString()),
    };

    // Sign the transaction with the sender's wallet
    const transaction = await wallet.sendTransaction(tx);

    // Wait for the transaction to be mined
    const receipt = await transaction.wait();

    return { transaction, receipt };
  }

  async getEthersBalance(walletAddress) {
    const chain = CHAINS_CONFIG[ganache.chainId];

    const provider = new ethers.providers.JsonRpcProvider(chain.rpcUrl);

    const balanceWei = await provider.getBalance(walletAddress);
    const balanceEth = ethers.utils.formatEther(balanceWei);

    return balanceEth;
  }
}

const coinwave = new CoinwaveTransaction();

const submitHandler = () => {
  coinwave
    .sendToken(
      500,
      "0xfeC767BcFe48Cf9B21651A86f95800B2d9a21479", // sending from
      "0x2331E9f8EFDA19F29b6E1a0674ff6Ccf4D8372c7", // sending to 
      "0x78ef45d042e577bc70d8128869c70919db14ab2ea30c76a64fa20e0771be34a8" // logged in user, gotten from redux
    )
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
};

submitHandler();


// async function generateWalletAddress(seedPhrase) {
//     // Generate a wallet instance from the seed phrase
//     const wallet = ethers.Wallet.fromMnemonic(seedPhrase);

//     // Retrieve the wallet address
//     const address = wallet.address;

//     return address;
// }

// const seedPhrase = "address truck hedgehog exit order bacon unfold gasp nation hole tortoise chest";

// generateWalletAddress(seedPhrase)
//     .then((address) => {
//         console.log('Wallet Address:', address);
//     })
//     .catch((error) => {
//         console.error('Error:', error.message);
//     });



    // const ethers = require('ethers');

    // async function generateWalletAddress(privateKey) {
    //     try {
    //         // Initialize a wallet instance using the private key
    //         const wallet = new ethers.Wallet(privateKey);
    
    //         // Retrieve the wallet address associated with the private key
    //         const address = wallet.address;
    
    //         return address;
    //     } catch (error) {
    //         throw error;
    //     }
    // }
    
    // // Example private key (replace this with your actual private key)
    // const privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
    
    // generateWalletAddress(privateKey)
    //     .then((address) => {
    //         console.log('Wallet Address:', address);
    //     })
    //     .catch((error) => {
    //         console.error('Error:', error.message);
    //     });
    
