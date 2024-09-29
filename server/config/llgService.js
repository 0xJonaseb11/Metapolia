require('dotenv').config();
const ethers = require('ethers');

function LLGService() {
    const contractAbi = require('../abi/llgAbi.json'); // BSC contract ABI
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL); // using a local network fork from BSC
    const contract = new ethers.Contract(process.env.LLG_CONTRACT, contractAbi, provider);

    return Object.freeze({
        getBalance: async function(address) {
            try {
                const balance = await contract.balanceOf(address);
                const symbol = await contract.symbol();

                return {
                    balance: ethers.formatUnits(balance, 9), // 9 decimals for LLG
                    symbol: symbol // LLG
                }
            } catch(err){
                console.log(err);
                return {
                    balance: 0,
                    symbol: 'LLG'
                }
            }
        },
        transfer: async function(to, amount) {
            const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
            const contractWithSigner = contract.connect(signer);

            try {
                const tx = await contractWithSigner.transfer(to, ethers.parseUnits(amount, 9)); // 9 decimals for LLG
                const result = await tx.wait();
                
                return {
                    message: 'Transfer successful',
                    hash: result.hash
                }
            } catch (err) {
                console.log(err);
                return {
                    message: 'Transfer failed'
                }
            }
        }
    })
}

module.exports = LLGService;