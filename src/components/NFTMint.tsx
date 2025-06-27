'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  getAvailableNFTLevel, 
  mintNFT, 
  getNFTLevelByScore, 
  getHighestMintableLevel,
  getNFTRulesDescription,
  NFT_LEVELS,
  type NFTLevel
} from '@/lib/nft';

interface NFTMintProps {
  userScore: number;
  userToken: string | null;
  onScoreUpdate?: (newScore: number) => void;
  hideSuccessMessage?: boolean;
  onNotificationClosed?: () => void;
}

export default function NFTMint({ userScore, userToken, onScoreUpdate, hideSuccessMessage = false, onNotificationClosed }: NFTMintProps) {
  const { address } = useAccount();
  const [availableLevel, setAvailableLevel] = useState<{ level: string; canMint: boolean; levelInfo: NFTLevel | null }>({ level: '', canMint: false, levelInfo: null });
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [hasShownNotification, setHasShownNotification] = useState(false);

  // 检查可用的NFT等级
  useEffect(() => {
    const checkAvailableLevel = async () => {
      if (address && userScore >= 100) {
        try {
          const result = await getAvailableNFTLevel(address as `0x${string}`, userScore);
          setAvailableLevel(result);
        } catch (error) {
          console.error('Error checking available level:', error);
        }
      } else {
        setAvailableLevel({ level: '', canMint: false, levelInfo: null });
      }
    };

    checkAvailableLevel();
  }, [address, userScore]);

  // 监听NFTNotification显示状态
  useEffect(() => {
    if (hideSuccessMessage && mintResult?.success && !hasShownNotification) {
      // 当NFTNotification首次显示时，标记已显示过
      setHasShownNotification(true);
    }
  }, [hideSuccessMessage, mintResult?.success, hasShownNotification]);

  // 当NFTNotification关闭后，如果已经显示过通知，则清除成功消息
  useEffect(() => {
    if (!hideSuccessMessage && hasShownNotification && mintResult?.success) {
      setMintResult(null);
    }
  }, [hideSuccessMessage, hasShownNotification, mintResult?.success]);

  // 处理NFT铸造
  const handleMintNFT = async () => {
    if (!address || !userToken || userScore < 100) {
      setMintResult({ success: false, message: 'Score below 100, cannot mint NFT' });
      return;
    }

    // 获取将要铸造的等级信息
    const { level, levelName } = getHighestMintableLevel(userScore);
    if (!level) {
      setMintResult({ success: false, message: 'Insufficient score to mint any NFT' });
      return;
    }

    setIsMinting(true);
    setMintResult(null);

    try {
      const result = await mintNFT(address as `0x${string}`, userScore);
      
      if (result.success) {
        setHasShownNotification(false); // 重置通知显示状态
        setMintResult({ 
          success: true, 
          message: `🎉 NFT minting request submitted! Expected level: ${result.expectedLevel}. Transaction: ${result.txHash?.slice(0, 10)}... ⏳ Please wait for Chainlink Oracle to process and mint your NFT.` 
        });
        // 注意：不立即更新分数和等级，因为实际铸造由合约异步处理
        // 用户需要等待Chainlink Oracle完成处理
      } else {
        setMintResult({ 
          success: false, 
          message: `❌ Minting failed: ${result.error}` 
        });
      }
    } catch (error: any) {
      setMintResult({ 
        success: false, 
        message: `❌ Minting failed: ${error.message || 'Unknown error'}` 
      });
    } finally {
      setIsMinting(false);
    }
  };

  // 获取当前分数对应的NFT等级信息
  const currentLevelInfo = getNFTLevelByScore(userScore);
  
  // 获取可铸造的最高等级信息
  const { level: mintableLevel, levelName: mintableLevelName } = getHighestMintableLevel(userScore);

  // 如果分数不足100，显示提示
  if (userScore < 100) {
    return (
      <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-500/30">
        <div className="text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-gray-300 mb-2">NFT Minting</h3>
          <p className="text-gray-400 mb-4">Reach 100 points to mint NFT</p>
          <div className="text-sm text-gray-500">
            Current Score: {userScore} / 100
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((userScore / 100) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="text-xl">🎨</span>
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">NFT Minting</span>
        </h3>
        
        {/* 规则说明图标 */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowRules(true)}
            onMouseLeave={() => setShowRules(false)}
            className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold hover:scale-110 transition-transform duration-200"
          >
            ?
          </button>
          
          {/* 规则弹出框 */}
          {showRules && (
            <div className="absolute right-0 top-10 w-80 bg-slate-900/95 backdrop-blur-xl rounded-xl p-4 border border-purple-500/50 shadow-2xl z-50">
              <h4 className="font-bold text-cyan-400 mb-3">🏆 NFT Minting Rules</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥈</span>
                  <span className="font-medium bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                    Silver
                  </span>
                  <span className="text-gray-400">:</span>
                  <span className="text-gray-300">100-299 points</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥇</span>
                  <span className="font-medium bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                    Gold
                  </span>
                  <span className="text-gray-400">:</span>
                  <span className="text-gray-300">300-499 points</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">💎</span>
                  <span className="font-medium bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                    Diamond
                  </span>
                  <span className="text-gray-400">:</span>
                  <span className="text-gray-300">500+ points</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-600 text-xs text-gray-400">
                💡 Mint NFTs based on your score achievements
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 当前等级信息 */}
      {currentLevelInfo && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-slate-700/50 to-slate-800/50 border border-gray-600/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentLevelInfo.icon}</span>
            <div>
              <div className={`font-bold bg-gradient-to-r ${currentLevelInfo.color} bg-clip-text text-transparent`}>
                {currentLevelInfo.name} Level
              </div>
              <div className="text-sm text-gray-400">{currentLevelInfo.description}</div>
            </div>
          </div>
        </div>
      )}

      {/* 铸造按钮 */}
      <div className="space-y-4">
        {userScore >= 100 ? (
          <button
            onClick={handleMintNFT}
            disabled={isMinting || !address || !userToken || !mintableLevel}
            className="w-full py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
          >
            {isMinting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Minting...
              </div>
            ) : mintableLevel ? (
              <div className="flex items-center justify-center gap-2">
                <span>{mintableLevel.icon}</span>
                <span>Mint {mintableLevelName} NFT</span>
                <span className="text-sm opacity-80">(-{mintableLevel.minScore} pts)</span>
              </div>
            ) : (
              `🎨 Mint NFT`
            )}
          </button>
        ) : (
          <div className="text-center py-3 px-6 rounded-xl bg-gray-700/50 border border-gray-600/30">
            <div className="text-gray-400">
              Insufficient score to mint NFT
            </div>
          </div>
        )}

        {/* 铸造结果显示 */}
        {mintResult && !(mintResult.success && hideSuccessMessage) && (
          <div className={`p-3 rounded-xl border ${
            mintResult.success 
              ? 'bg-green-900/30 border-green-500/50 text-green-300' 
              : 'bg-red-900/30 border-red-500/50 text-red-300'
          }`}>
            {mintResult.message}
            {mintResult.success && (
              <button
                onClick={() => setMintResult(null)}
                className="ml-2 text-green-400 hover:text-green-300 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* 分数进度 */}
      <div className="mt-4 pt-4 border-t border-gray-600/30">
        <div className="text-sm text-gray-400 mb-2">Current Score: {userScore}</div>
        
        {/* 下一个等级进度 */}
        {userScore < 500 && (
          <div className="space-y-2">
            {userScore < 300 && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>🥇 Gold Progress</span>
                  <span>{userScore}/300</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((userScore / 300) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {userScore >= 300 && userScore < 500 && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>💎 Diamond Progress</span>
                  <span>{userScore}/500</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((userScore / 500) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}