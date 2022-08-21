const ethers = require("ethers");
const fs = require("fs-extra");
require("dotenv").config();

async function main() {
  // http://127.0.0.1:7545 this is the rpc URL of ganache
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

  // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  // const wallet = new ethers.Wallet(
  //   "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  //   provider
  // );
  const encryptedJson = fs.readFileSync("./.encryptedKey.json", "utf-8");
  let wallet = new ethers.Wallet.fromEncryptedJsonSync(
    encryptedJson,
    process.env.PRIVATE_KEY_PASSWORD
  );
  wallet = await wallet.connect(provider);

  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8");
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf8"
  );
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
  console.log("Deploying, please wait...");

  const contract = await contractFactory.deploy();
  await contract.deployTransaction.wait(1);
  // console.log(`Contract deployed to ${contract.address}`);
  const currentFavoriteNumber = await contract.retrieve();
  console.log(`Current Favorite Number: ${currentFavoriteNumber.toString()}`);
  const transactionResponse = await contract.store("7");
  const transactionReceipt = await transactionResponse.wait(1);
  const updatedFavoriteNumber = await contract.retrieve();
  console.log(`Updated Favorite Number: ${updatedFavoriteNumber}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
