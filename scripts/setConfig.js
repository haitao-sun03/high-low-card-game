const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// 读取secrets配置信息
const donSecretsInfo = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'donSecretsInfo.txt'), 'utf8'));

// 合约地址和ABI
const CONTRACT_ADDRESS = process.env.BUSS_CONTRACT_ADDRESS;
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "_secretsSlotId",
        "type": "uint8"
      },
      {
        "internalType": "uint64",
        "name": "_secretsVersion",
        "type": "uint64"
      },
      {
        "internalType": "uint64",
        "name": "_subId",
        "type": "uint64"
      }
    ],
    "name": "setConfig",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

async function setConfig() {
  try {
    // 检查环境变量
    if (!CONTRACT_ADDRESS) {
      throw new Error('BUSS_CONTRACT_ADDRESS not found in environment variables');
    }
    
    if (!process.env.EVM_PRIVATE_KEY) {
      throw new Error('EVM_PRIVATE_KEY not found in environment variables');
    }

    // 创建provider和wallet
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_PROVIDER || 'https://rpc.sepolia.org');
    const wallet = new ethers.Wallet(process.env.EVM_PRIVATE_KEY, provider);
    
    // 创建合约实例
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    
    // 从donSecretsInfo.txt读取配置
    const secretsSlotId = parseInt(donSecretsInfo.slotId);
    const secretsVersion = parseInt(donSecretsInfo.donHostedSecretsVersion);
    const subId = 3074; // Chainlink Functions subscription ID
    
    console.log('Setting config with:');
    console.log('- secretsSlotId:', secretsSlotId);
    console.log('- secretsVersion:', secretsVersion);
    console.log('- subId:', subId);
    
    // 调用setConfig函数
    const tx = await contract.setConfig(secretsSlotId, secretsVersion, subId);
    console.log('Transaction sent:', tx.hash);
    
    // 等待交易确认
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);
    console.log('✅ Config set successfully!');
    
  } catch (error) {
    console.error('❌ Error setting config:', error.message);
    process.exit(1);
  }
}

// 运行脚本
setConfig();