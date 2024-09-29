const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");

function parseContract(path) {
  const file = fs.readFileSync(path);
  return JSON.parse(file);
}

describe("Interact with contract on BSC fork", function () {
  const contractAddress = "0x4691F60c894d3f16047824004420542E4674E621";
  const abi = parseContract("abi/llgAbi.json");

  it("Should get the token name correctly", async function () {
    await helpers.mine();

    const [signer] = await ethers.getSigners();
    const llg = new ethers.Contract(contractAddress, abi, signer);

    expect(await llg.name()).to.equal("MetaMateGem");
  });


  it("Should transfer some LLG to my account", async function () {
    const to = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const ownerAddress = "0xD1D7280D3598B8D8Ad43090e0430b3DCAD7bB0F3";
    const ownerSigner = await ethers.getImpersonatedSigner(ownerAddress);

    const llgAbi = parseContract("abi/llgAbi.json");
    const llgAddress = "0x4691F60c894d3f16047824004420542E4674E621";

    const llgContract = new ethers.Contract(llgAddress, llgAbi);

    const tx = await llgContract
      .connect(ownerSigner)
      .transfer(to, ethers.parseEther("0.0000001"));

    console.log("transaction hash: ", (await tx.wait()).hash);
  });

  it("Should get the pair ", async function () {
    await helpers.mine();

    // ABIs
    const factoryV2Abi = parseContract("abi/factoryv2.json");
    const wbnbAbi = parseContract("abi/wbnb.json");
    const pancakeRouterV2 = parseContract("abi/routerv2.json");
    const llgAbi = parseContract("abi/llgAbi.json");

    // Addresses
    const wbnbTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
    const llgAddress = "0x4691F60c894d3f16047824004420542E4674E621";
    const factoryv2Address = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73";
    const pancakeSwapRouterAddress =
      "0x10ED43C718714eb63d5aA57B78B54704E256024E";
    const ownerAddress = "0xD1D7280D3598B8D8Ad43090e0430b3DCAD7bB0F3";

    // signers
    const ownerSigner = await ethers.getImpersonatedSigner(ownerAddress);
    const [signer] = await ethers.getSigners();
    
    // contracts
    const llgContract = new ethers.Contract(llgAddress, llgAbi, signer);
    const factoryContract = new ethers.Contract(factoryv2Address, factoryV2Abi);
    const wbnbContract = new ethers.Contract(wbnbTokenAddress, wbnbAbi, signer);
    const routerV2Contract = new ethers.Contract(
      pancakeSwapRouterAddress,
      pancakeRouterV2,
      signer
    );
    
    const pancakeSwapPoolAddress = await factoryContract
    .connect(ownerSigner)
    .getPair(wbnbTokenAddress, llgAddress);

    console.log("pool address: ", pancakeSwapPoolAddress);

    const balance = await wbnbContract.balanceOf(await signer.getAddress());
    console.log("wbnb balance: ", ethers.formatUnits(balance, "ether"), "WBNB");

    const signerBalance = await ethers.provider.getBalance(
      await signer.getAddress()
    );
    console.log(
      "signer BNB balance: ",
      ethers.formatUnits(signerBalance, "ether"),
      "BNB"
    );
    

    const wbnbtoken = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
    const llgtoken = "0x4691F60c894d3f16047824004420542E4674E621";
    const path = [wbnbtoken, llgtoken];

    const [signer1, signer2] = await ethers.getSigners();

    const amountIn = ethers.parseEther("0.01");
    const amountsOut = await routerV2Contract.getAmountsOut(amountIn, path);

    const amountsOutMin = (amountsOut[1] * 90n) / 100n;

    const tx = await routerV2Contract
      .connect(signer2)
      .swapExactETHForTokens(
        amountsOutMin,
        path,
        await signer2.getAddress(),
        Math.floor(Date.now() / 100) + 60 * 10,
        {
          value: ethers.parseEther("0.01"),
        }
      );

    console.log((await tx.wait()).hash);
  });
});
