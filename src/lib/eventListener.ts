import { createPublicClient, http, parseAbiItem } from 'viem';
import { sepolia } from 'viem/chains';
import { NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI } from './nft';

// 创建公共客户端用于监听事件
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org')
});

// NFTMinted事件监听器
export function startNFTMintedEventListener(
  onScoreUpdate?: (newScore: number) => void,
  onNFTMinted?: (nftData: any) => void
) {
  // 只在客户端运行
  if (typeof window === 'undefined') {
    console.log('Event listener skipped on server side');
    return () => {}; // 返回空的清理函数
  }
  
  console.log('Starting NFTMinted event listener...');
  
  // 监听NFTMinted事件
  const unwatch = publicClient.watchContractEvent({
    address: NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: NFT_CONTRACT_ABI,
    eventName: 'NFTMinted',
    onLogs: async (logs) => {
      console.log('NFTMinted event detected:', logs);
      
      for (const log of logs) {
        try {
          const { player, level, score, tokenId } = log.args as {
            player: string;
            level: string;
            score: bigint;
            tokenId: bigint;
          };
          
          console.log(`NFT minted for player ${player}, level: ${level}, score: ${score}, tokenId: ${tokenId}`);
          
          // 调用积分扣除API
          const response = await fetch('/api/nft-minted', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              walletAddress: player,
              level,
              score: Number(score),
              tokenId: Number(tokenId)
            }),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('Score deducted successfully:', result);
            
            // 调用分数更新回调
            if (onScoreUpdate && typeof result.newScore === 'number') {
              onScoreUpdate(result.newScore);
            }
            
            // 调用NFT铸造通知回调
            if (onNFTMinted) {
              onNFTMinted({
                level,
                scoreDeducted: result.scoreDeducted || 0,
                newScore: result.newScore || 0,
                tokenId: Number(tokenId)
              });
            }
          } else {
            console.error('Failed to deduct score:', await response.text());
          }
        } catch (error) {
          console.error('Error processing NFTMinted event:', error);
        }
      }
    },
    onError: (error) => {
      console.error('Error in NFTMinted event listener:', error);
    }
  });
  
  return unwatch;
}

// 停止事件监听器
export function stopNFTMintedEventListener(unwatch: () => void) {
  unwatch();
  console.log('NFTMinted event listener stopped');
}