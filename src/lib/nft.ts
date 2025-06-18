import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';

// 智能合约 ABI（根据你的合约调整）
export const NFT_CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721IncorrectOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721InsufficientApproval",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOperator",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "ERC721InvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC721InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC721InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ERC721NonexistentToken",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "EmptyArgs",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "EmptySource",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NoInlineSecrets",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "OnlyRouterCanFulfill",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "requestId",
				"type": "bytes32"
			}
		],
		"name": "UnexpectedRequestID",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "approved",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "ApprovalForAll",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_fromTokenId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_toTokenId",
				"type": "uint256"
			}
		],
		"name": "BatchMetadataUpdate",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "requestId",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "response",
				"type": "bytes"
			},
			{
				"internalType": "bytes",
				"name": "err",
				"type": "bytes"
			}
		],
		"name": "handleOracleFulfillment",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_tokenId",
				"type": "uint256"
			}
		],
		"name": "MetadataUpdate",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "level",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "score",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "NFTMinted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			}
		],
		"name": "RequestFulfilled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			}
		],
		"name": "RequestSent",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "requestId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "response",
				"type": "bytes"
			},
			{
				"indexed": false,
				"internalType": "bytes",
				"name": "err",
				"type": "bytes"
			}
		],
		"name": "Response",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string[]",
				"name": "args",
				"type": "string[]"
			},
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			}
		],
		"name": "sendRequest",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "requestId",
				"type": "bytes32"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "setApprovalForAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
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
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "DON_ID",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "GAS_LIMIT",
		"outputs": [
			{
				"internalType": "uint32",
				"name": "",
				"type": "uint32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getApproved",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "isApprovedForAll",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "levelToMetaDataURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "ROUTER_ADDR",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "s_lastError",
		"outputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "s_lastRequestId",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "s_lastResponse",
		"outputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "secretsSlotId",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "secretsVersion",
		"outputs": [
			{
				"internalType": "uint64",
				"name": "",
				"type": "uint64"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "SOURCE",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "subId",
		"outputs": [
			{
				"internalType": "uint64",
				"name": "",
				"type": "uint64"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "tokenId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "tokenURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] as const;

// 合约地址（需要替换为实际部署的合约地址）
export const NFT_CONTRACT_ADDRESS = '0x7B8b4495CEf79e3253B0F919994EdaC6Eae95069' as const;

// NFT 等级定义
export interface NFTLevel {
  name: string;
  minScore: number;
  maxScore: number;
  icon: string;
  color: string;
  description: string;
  metadataURI: string;
}

export const NFT_LEVELS: Record<string, NFTLevel> = {
  Silver: {
    name: 'Silver',
    minScore: 100,
    maxScore: 299,
    icon: '🥈',
    color: 'from-gray-400 to-gray-600',
    description: 'Beginner Player Achievement',
    metadataURI: 'https://your-metadata-server.com/silver.json'
  },
  Gold: {
    name: 'Gold',
    minScore: 300,
    maxScore: 499,
    icon: '🥇',
    color: 'from-yellow-400 to-yellow-600',
    description: 'Intermediate Player Achievement',
    metadataURI: 'https://your-metadata-server.com/gold.json'
  },
  Diamond: {
    name: 'Diamond',
    minScore: 500,
    maxScore: Infinity,
    icon: '💎',
    color: 'from-blue-400 to-purple-600',
    description: 'Advanced Player Achievement',
    metadataURI: 'https://your-metadata-server.com/diamond.json'
  }
};

// 创建公共客户端
const publicClient = createPublicClient({
  chain: sepolia, // 或者使用 mainnet
  transport: http()
});

// 根据分数获取NFT等级
export function getNFTLevelByScore(score: number): NFTLevel | null {
  if (score >= 500) return NFT_LEVELS.Diamond;
  if (score >= 300) return NFT_LEVELS.Gold;
  if (score >= 100) return NFT_LEVELS.Silver;
  return null;
}

// 根据分数获取可铸造的最高等级NFT
export function getHighestMintableLevel(score: number): { level: NFTLevel | null; levelName: string } {
  if (score >= 500) return { level: NFT_LEVELS.Diamond, levelName: 'Diamond' };
  if (score >= 300) return { level: NFT_LEVELS.Gold, levelName: 'Gold' };
  if (score >= 100) return { level: NFT_LEVELS.Silver, levelName: 'Silver' };
  return { level: null, levelName: '' };
}

// 获取用户可以铸造的NFT等级
export async function getAvailableNFTLevel(userAddress: `0x${string}`, userScore: number): Promise<{ level: string; canMint: boolean; levelInfo: NFTLevel | null }> {
  try {
    const { level, levelName } = getHighestMintableLevel(userScore);
    
    if (!level) {
      return {
        level: '',
        canMint: false,
        levelInfo: null
      };
    }

    return {
      level: levelName,
      canMint: true,
      levelInfo: level
    };
  } catch (error) {
    console.error('Error checking available NFT level:', error);
    return {
      level: '',
      canMint: false,
      levelInfo: null
    };
  }
}

// 铸造NFT
export async function mintNFT(
  userAddress: `0x${string}`, 
  userScore: number
): Promise<{ success: boolean; txHash?: string; error?: string; expectedLevel?: string; expectedScoreDeduction?: number }> {
  try {
    // 检查是否有可用的钱包
    if (!window.ethereum) {
      throw new Error('Please install MetaMask wallet');
    }

    // 获取可铸造的最高等级
    const { level, levelName } = getHighestMintableLevel(userScore);
    
    if (!level) {
      throw new Error('Insufficient score to mint any NFT');
    }

    // 创建钱包客户端
    const walletClient = createWalletClient({
      chain: sepolia,
      transport: custom(window.ethereum)
    });

    // 调用合约的 sendRequest 方法来触发NFT铸造
    const txHash = await walletClient.writeContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: NFT_CONTRACT_ABI,
      functionName: 'sendRequest',
      args: [[userAddress], userAddress], // args数组和player地址
      account: userAddress
    });

    // 注意：不在这里立即扣减分数！
    // 因为合约的fulfillRequest会延迟执行，它会查询数据库中的实时分数
    // 如果我们提前扣减分数，可能导致合约查询到已扣减的分数而无法正确铸造NFT
    // 分数扣减应该在确认NFT铸造成功后进行，或者通过其他机制处理
    
    // 计算预期扣减的分数（用于显示）
    const scoreToDeduct = level.minScore;

    return {
      success: true,
      txHash,
      expectedLevel: levelName,
      expectedScoreDeduction: scoreToDeduct
    };
  } catch (error: any) {
    console.error('Error minting NFT:', error);
    return {
      success: false,
      error: error.message || 'Minting failed'
    };
  }
}

// 获取NFT规则描述
export function getNFTRulesDescription(): string {
  return `
🏆 NFT Minting Rules:

🥈 Silver NFT (100-299 points): Beginner player achievement, proving you've mastered the game basics
🥇 Gold NFT (300-499 points): Intermediate player achievement, showcasing your gaming skills
💎 Diamond NFT (500+ points): Advanced player achievement, symbolizing game master status

💡 Tips:
- Mint NFTs based on your score achievements
- Higher scores unlock higher tier NFTs
- NFT minting requires a small Gas fee
  `;
}

// 检查用户是否已经铸造过特定等级的NFT
export async function hasUserMintedLevel(userAddress: `0x${string}`, level: string): Promise<boolean> {
  try {
    // 这里应该实现检查用户是否已经铸造过特定等级NFT的逻辑
    // 可能需要合约提供相应的查询方法
    return false; // 简化实现
  } catch (error) {
    console.error('Error checking minted level:', error);
    return false;
  }
}

// 获取用户的NFT列表
export async function getUserNFTs(userAddress: `0x${string}`): Promise<any[]> {
  try {
    const balance = await publicClient.readContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: NFT_CONTRACT_ABI,
      functionName: 'balanceOf',
      args: [userAddress]
    });

    // 这里应该获取用户拥有的所有NFT的详细信息
    // 简化实现，返回空数组
    return [];
  } catch (error) {
    console.error('Error getting user NFTs:', error);
    return [];
  }
}