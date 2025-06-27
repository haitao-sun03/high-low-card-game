'use client';

import { useState, useEffect } from 'react';
import WalletConnect from '@/components/WalletConnect';
import Game from '@/components/Game';
import NFTMint from '@/components/NFTMint';
import NFTNotification from '@/components/NFTNotification';
import { startNFTMintedEventListener } from '@/lib/eventListener';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [userScore, setUserScore] = useState<number>(0);
  const [showNFTNotification, setShowNFTNotification] = useState(false);
  const [nftNotificationData, setNftNotificationData] = useState<any>(null);
  
  // 从本地存储中恢复令牌
  useEffect(() => {
    const storedToken = localStorage.getItem('jwt');
    if (storedToken) {
      setToken(storedToken);
      fetchUserScore(storedToken);
    }
    
    // 启动NFT事件监听器
    const unwatch = startNFTMintedEventListener(
      // 分数更新回调
      (newScore: number) => {
        setUserScore(newScore);
      },
      // NFT铸造通知回调
      (nftData: any) => {
        setNftNotificationData(nftData);
        setShowNFTNotification(true);
      }
    );
    
    // 清理函数
    return () => {
      unwatch();
    };
  }, []);

  // 处理认证成功
  const handleAuthenticated = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('jwt', newToken);
    fetchUserScore(newToken);
  };

  // 处理钱包断开连接
  const handleWalletDisconnected = () => {
    setToken(null);
    localStorage.removeItem('jwt');
    setUserScore(0);
  };

  // 获取用户分数
  const fetchUserScore = async (authToken: string) => {
    try {
      const response = await fetch('/api/scores', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data && typeof data.data.score === 'number') {
          setUserScore(data.data.score);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user score:', error);
    }
  };

  // 处理分数更新
  const handleScoreUpdate = (newScore: number) => {
    setUserScore(newScore);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 动态背景效果 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        {/* 网格背景 */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        {/* 静态粒子效果 */}
        <div className="absolute inset-0">
          <div className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float" style={{left: '10%', top: '20%', animationDelay: '0s'}}></div>
          <div className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float" style={{left: '25%', top: '60%', animationDelay: '1s'}}></div>
          <div className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float" style={{left: '40%', top: '15%', animationDelay: '2s'}}></div>
          <div className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float" style={{left: '60%', top: '80%', animationDelay: '0.5s'}}></div>
          <div className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float" style={{left: '75%', top: '35%', animationDelay: '1.5s'}}></div>
          <div className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float" style={{left: '85%', top: '70%', animationDelay: '2.5s'}}></div>
          <div className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float" style={{left: '15%', top: '85%', animationDelay: '3s'}}></div>
          <div className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float" style={{left: '90%', top: '25%', animationDelay: '0.8s'}}></div>
          <div className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float" style={{left: '5%', top: '50%', animationDelay: '1.8s'}}></div>
          <div className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float" style={{left: '70%', top: '10%', animationDelay: '2.8s'}}></div>
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 标题 */}
        <header className="mb-16 text-center">
          <div className="relative">
            <h1 className="text-7xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl animate-pulse-slow">
              High-Low Card Game
          </h1>
          <div className="absolute -top-2 -left-2 text-7xl font-black text-purple-500/20 -z-10">
            High-Low Card Game
            </div>
          </div>
          <p className="text-2xl text-cyan-100 max-w-3xl mx-auto leading-relaxed font-medium tracking-wide">
            🎮 Guess if the next card is higher or lower, consecutive correct guesses earn more points! 🎮
          </p>

        </header>

        {/* 钱包连接区域 - 始终显示 */}
        <div className="max-w-md mx-auto mb-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-purple-500/20">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">🔗 Connect Wallet</h2>
          <WalletConnect 
            onAuthenticated={handleAuthenticated} 
            onWalletDisconnected={handleWalletDisconnected}
            isAuthenticated={!!token} 
          />
          
          {token && (
            <div className="mt-6 pt-4 border-t border-purple-500/30">
              <div className="flex items-center justify-center text-emerald-400 animate-pulse">
                <svg className="w-6 h-6 mr-2 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-bold text-lg tracking-wide"> Account Verified</span>
              </div>
            </div>
          )}
        </div>

        {/* 只有在验证通过后才显示游戏 */}
        {token ? (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* 游戏区域 */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-cyan-500/20">
              <h2 className="text-4xl font-bold mb-10 text-center drop-shadow-lg">
                <span className="text-4xl">🎮</span>
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> Game Area</span>
              </h2>
              <Game 
                userToken={token} 
                userScore={userScore}
                onScoreUpdate={handleScoreUpdate} 
              />
            </div>
            
            {/* NFT铸造区域 */}
            <div>
              <NFTMint 
                userScore={userScore} 
                userToken={token} 
                onScoreUpdate={handleScoreUpdate}
                hideSuccessMessage={showNFTNotification}
              />
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center">
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-gray-500/30">
              <div className="text-gray-400 mb-6">
                <svg className="w-20 h-20 mx-auto mb-6 opacity-60 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xl text-gray-300 font-medium tracking-wide">
                🔐 Please connect and verify your wallet to start the game
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* NFT铸造成功通知 */}
      <NFTNotification
        isVisible={showNFTNotification}
        onClose={() => {
          setShowNFTNotification(false);
          // 通知NFTMint组件清除成功消息
          setNftNotificationData(null);
        }}
        nftData={nftNotificationData}
      />
    </div>
  );
}
