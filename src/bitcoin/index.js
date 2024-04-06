const { PrivateKey } = require("bitcore-lib");
const { mainnet, testnet } = require("bitcore-lib/lib/networks");
const Mnemonic = require("bitcore-mnemonic");

const axios = require("axios");
const bitcore = require("bitcore-lib");

const TESTNET = true;

// var privateKey = new PrivateKey();
// var address = privateKey.toAddress();

// const createHDWallet = (network = testnet) => {
//   let passPhrase = new Mnemonic(Mnemonic.Words.ENGLISH);
//   let xpriv = passPhrase.toHDPrivateKey(passPhrase.toString(), network);

//   return {
//     xpub: xpriv.xpubkey,
//     privateKey: xpriv.privateKey.toString(),
//     address: xpriv.publicKey.toAddress().toString(),
//     mnemonic: passPhrase.toString(),
//   };
// };

// const wallet = createHDWallet()
// console.log(wallet, "the wallet");

const sendBitcoin = async (recieverAddress, amountToSend) => {
  try {
    const privateKey =
      "26e41cbaf1ab46a9ef50a9efd4e7defa62ff23bab2af480500fad90c7f199db6";
    const sourceAddress = "n4dCLkCz24EC3ndNBU6Sacq9qZ6R9fz3oS";
    const satoshiToSend = amountToSend * 100000000;

    let fee = 0;
    let inputCount = 0;
    let outputCount = 2;

    console.log("this line runs");

    const recommendedFee = {
      data: {
        hourFee: 0.01,
      },
    };

    // const recommendedFee = await axios.get(
    //     "https://bitcoinfees.earn.com/api/v1/fees/recommended"
    //   );

    console.log(recommendedFee);
    console.log("loading..........1");

    const transaction = new bitcore.Transaction();
    let totalAmountAvailable = 0;

    let inputs = [];

    console.log("loading..........2");

    // fetches the unspent transaction outputs (UTXOs) associated with the source address (sourceAddress) from a testnet API.
    const resp = await axios({
      method: "GET",
      url: `https://blockstream.info/testnet/api/address/${sourceAddress}/utxo`,
    });
    const utxos = resp.data;

    console.log(utxos);
    console.log("loading..........3");

    for (const utxo of utxos) {
      let input = {};
      input.satoshis = utxo.value;
      input.script =
        bitcore.Script.buildPublicKeyHashOut(sourceAddress).toHex();
      input.address = sourceAddress;
      input.txId = utxo.txid;
      input.outputIndex = utxo.vout;
      totalAmountAvailable += utxo.value;
      inputCount += 1;
      inputs.push(input);
      console.log(input, "input");
    }

    /**
     * In a bitcoin transaction, the inputs contribute 180 bytes each to the transaction,
     * while the output contributes 34 bytes each to the transaction. Then there is an extra 10 bytes you add or subtract
     * from the transaction as well.
     * */

    //  It calculates the transaction fee based on the transaction size and the recommended fee from the Bitcoin fees API.
    const transactionSize =
      inputCount * 180 + outputCount * 34 + 10 - inputCount;

    fee = (transactionSize * recommendedFee.data.hourFee) / 3; // satoshi per byte
    if (TESTNET) {
      fee = transactionSize * 1; // 1 sat/byte is fine for testnet
    }
    if (totalAmountAvailable - satoshiToSend - fee < 0) {
      throw new Error("Balance is too low for this transaction");
    }
    //Set transaction input
    transaction.from(inputs);

    // set the recieving address and the amount to send
    transaction.to(recieverAddress, satoshiToSend);

    // Set change address - Address to receive the left over funds after transfer
    transaction.change(sourceAddress);

    //manually set transaction fees: 20 satoshis per byte
    transaction.fee(Math.round(fee));

    // Sign transaction with your private key
    transaction.sign(privateKey);

    // serialize Transactions
    const serializedTransaction = transaction.serialize();

    console.log("loading..........4");
    console.log(transaction);

    // Send transaction
    const result = await axios({
      method: "POST",
      url: `https://blockstream.info/testnet/api/tx`,
      data: serializedTransaction,
    });

    console.log(result.data, "transaction Response");

    return result.data;
  } catch (error) {
    console.log(error, "something went wrong");
    return error;
  }
};

// sendBitcoin("n3j37nf9kgwFg9uKYbLEmHRbqK12uoqXN3", 4000);

// {
// xpub: 'tpubD6NzVbkrYhZ4XFp8nxqgU5Lv9CqeV8wKWmWjqZpUEbdN5mszkW5AR4zvWJxv2Jxr3CkVVKQyqCLJLpTDrKosos5vK474NSBSnTGtVjC9K5v',
// privateKey: '26e41cbaf1ab46a9ef50a9efd4e7defa62ff23bab2af480500fad90c7f199db6',
// address: 'n4dCLkCz24EC3ndNBU6Sacq9qZ6R9fz3oS',
// mnemonic: 'museum know october load kangaroo crumble proud pink party primary obvious level'
// }
//-------------------------------------------------------------------------------------------------------------------------------------------
// {
// xpub: 'tpubD6NzVbkrYhZ4XV1MFphjKdtK3YvA92eZEarUMusvNwsZ8fJaYaDrnRtaGLEr2g3zkBU9NL96u3rw4qEBzX2qVb7cixFLsXYTBGTvmYWpLFS',
// privateKey: 'e6c5573e299083e4cc96d2f50f46d470b8287527ec3dd41160f4441a5b47e5d6',
// address: 'moQQQF4E15d6kdgNVxUGXzPXgX7xF8FbnN',
// mnemonic: 'when marble describe remove unit broken cupboard know world tuition impose pear'
// }
//-------------------------------------------------------------------------------------------------------------------------------------------
// {
// xpub: 'tpubD6NzVbkrYhZ4XMqHhNAwKkpt8TGWeoGCk4B9DN5QAz3RiGVWmWnAkMEGbj94pPVaVTLjxWhogHZiMXDP5vEixhXBbtdG1g9ykLmf638cDyD',
// privateKey: 'eb36aa2c01774e5ffa95077f79a98606e3da9c8a20b0ebd357e7898c58ef7dd1',
// address: 'n3j37nf9kgwFg9uKYbLEmHRbqK12uoqXN3',
// mnemonic: 'crawl apology atom tray reward trip army seek train voyage opera wet'
// }
//-------------------------------------------------------------------------------------------------------------------------------------------
// {
// xpub: 'tpubD6NzVbkrYhZ4YQRdf3HBH6GkzzYkPQMvXihGBhyB9GaT71DwbVxD4DGuJHirsL2C8JFyEQjDPyJ39JFxZ7JpqqRyfmKP4s3ndumrsNYqtRA',
// privateKey: '28aab3e8b398093e6028deecab5c5143dfa79da35819ae4a02b7e9d5049bf523',
// address: 'mkdeyHX5K6jVf5Pj9ABvZ3E5Jah5UmXrgJ',
// mnemonic: 'direct trip half work airport energy alcohol people nest reopen device model'
// }
//-------------------------------------------------------------------------------------------------------------------------------------------
// {
// xpub: 'tpubD6NzVbkrYhZ4YMnLw9VJ1UvoQgTPmVumZn43U21RYzGs6VwRNgbqghG4q85Yovr3YtU4w3etFWuH6qvx9pyet1ePmxD9FTwHDTQgnMm5aY7',
// privateKey: '5b758a08d0eca6c62c6e97ff84e3a9504e4776c57faeabdd4acf850d3db0c218',
// address: 'mzkyRKR66LTTEjSsUfaNKJz2ZTJX93JNCd',
// mnemonic: 'swamp life join taste old torch sample desk paper small whip faith'
// }
//-------------------------------------------------------------------------------------------------------------------------------------------
// {
// xpub: 'tpubD6NzVbkrYhZ4XjLoDSLFjijgHK6aA4RfKdkKVFqBHnfwz5fivwLtorNH78jCTRTqCPbXDAV6wa5aA8gBNBjfrEyyyxZWXyj6odhk2Dch8Po',
// privateKey: 'b29c8161b37addf30e375f7c31c5768413058c43c453ae96e416602c3810ed7e',
// address: 'mrndavZsx6ay3AbqJiMfYzQ18LGZyV12s8',
// mnemonic: 'release attract dragon fever like mandate horror doctor enforce lecture toy day'
// }
//-------------------------------------------------------------------------------------------------------------------------------------------

class BitcoinWallet {
  constructor(network) {
    this.passPhrase;
    this.xpub;
    this.privateKey;
    this.publicAddress;
    this.network = network;
  }

  createHDWallet() {
    this.passPhrase = new Mnemonic(Mnemonic.Words.ENGLISH);
    let xpriv = this.passPhrase.toHDPrivateKey(
      this.passPhrase.toString(),
      this.network
    );

    this.xpub = xpriv.xpubkey;
    this.publicAddress = xpriv.publicKey.toAddress().toString();
    this.passPhrase = this.passPhrase.toString();

    return {
      xpub: xpriv.xpubkey,
      privateKey: xpriv.privateKey.toString(),
      publicAddress: xpriv.publicKey.toAddress().toString(),
      mnemonic: this.passPhrase.toString(),
    };
  }

  RecoverHDwallet (privateKey) {
    const privateKey_ = bitcore.PrivateKey(privateKey);
    const address = privateKey_.toAddress();
    const publicKey = privateKey_.toAddress();

    console.log(address.toString(), publicKey.toString())
  }

  sendBitcoin(recieverAddress, satoshiToSend) {
    const transaction = new Transaction(this.privateKey, this.publicAddress);
    transaction.createTransactionToSendBTC(recieverAddress, satoshiToSend)
  }
}

class Transaction {
  constructor(privateKey, sourceAddress) {
    this.privateKey = privateKey;
    this.sourceAddress = sourceAddress;
    this.fee = 0;
    this.inputCount = 0;
    this.outputCount = 2;
    this.recommendedFee;
    this.totalAmountAvailable;
    this.input = {};
    this.inputs = [];
  }

  /**
   * In a bitcoin transaction, the inputs contribute 180 bytes each to the transaction,
   * while the output contributes 34 bytes each to the transaction. Then there is an extra 10 bytes you add or subtract
   * from the transaction as well.
   * */

  async fetchUTXO() {
    // fetches the unspent transaction outputs (UTXOs) associated with the source address (sourceAddress) from a testnet API.
    const resp = await axios({
      method: "GET",
      url: `https://blockstream.info/testnet/api/address/${this.sourceAddress}/utxo`,
    });

    const utxos = resp.data;

    for (const utxo of utxos) {
      this.input.satoshis = utxo.value;
      this.input.script =
        bitcore.Script.buildPublicKeyHashOut(sourceAddress).toHex();
      this.input.address = sourceAddress;
      this.input.txId = utxo.txid;
      this.input.outputIndex = utxo.vout;
      this.totalAmountAvailable += utxo.value;
      this.inputCount += 1;
      this.inputs.push(input);
    }
  }

  calculateFee() {
    let TESTNET = true;
    let transactionSize =
      this.inputCount * 180 + this.outputCount * 34 + 10 - this.inputCount;
    this.fee = (transactionSize * recommendedFee.data.hourFee) / 3; // satoshi per byte
    if (TESTNET) {
      this.fee = transactionSize * 1; // 1 sat/byte is fine for testnet
    }
  }

  async createTransactionToSendBTC(recieverAddress, satoshiToSend) {

    try {
      const transaction = new bitcore.Transaction();

      if (this.totalAmountAvailable - satoshiToSend - this.fee < 0) {
        throw new Error("Balance is too low for this transaction");
      }

      //Set transaction input
      transaction.from(this.inputs);

      // set the recieving address and the amount to send
      transaction.to(recieverAddress, satoshiToSend);

      // Set change address - Address to receive the left over funds after transfer
      transaction.change(this.sourceAddress);

      //manually set transaction fees: 20 satoshis per byte
      transaction.fee(Math.round(this.fee));

      // Sign transaction with your private key
      transaction.sign(this.privateKey);

      // serialize Transactions
      const serializedTransaction = transaction.serialize();

      // Send transaction
      const result = await axios({
        method: "POST",
        url: `https://blockstream.info/testnet/api/tx`,
        data: serializedTransaction,
      });

      console.log(result.data, "transaction Response");

      return result.data;
    } catch (err) {
      console.log(err);
    }
  }
}

const wallet = new BitcoinWallet(testnet)
wallet.RecoverHDwallet('eb36aa2c01774e5ffa95077f79a98606e3da9c8a20b0ebd357e7898c58ef7dd1')

// console.log(wallet, "new Wallet");
