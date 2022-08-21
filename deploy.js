const ethers = require("ethers");
const fs = require("fs-extra");
require("dotenv").config();

async function main() {
  // http://127.0.0.1:7545 this is the rpc URL of ganache
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  // const wallet = new ethers.Wallet(
  //   "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  //   provider
  // );
  // const encryptedJson = fs.readFileSync("./.encryptedKey.json", "utf-8");
  // let wallet = new ethers.Wallet.fromEncryptedJson(
  //   encryptedJson,
  //   process.env.PRIVATE_KEY_PASSWORD
  // );

  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8");
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf8"
  );
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
  console.log("Deploying, please wait...");

  const contract = await contractFactory.deploy();
  const deploymentReceipt = await contract.deployTransaction.wait(1);
  console.log(`Contract deployed to ${contract.address}`);
  
  const favouriteNumber = await contract.retrieve()
  console.log(`favouriteNumber: ${favouriteNumber.toString()}`)

  const storeFavouriteNumber = await contract.store("10")
  await storeFavouriteNumber.wait(1)

  const updatedFavouriteNumber = await contract.retrieve()
  console.log(`updatedFavouriteNumber: ${updatedFavouriteNumber.toString()}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
