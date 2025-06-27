'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NFTNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  nftData: {
    level: string;
    scoreDeducted: number;
    newScore: number;
    tokenId: number;
  } | null;
}

export default function NFTNotification({ isVisible, onClose, nftData }: NFTNotificationProps) {
  // 移除自动关闭逻辑，改为手动点击关闭

  if (!nftData) return null;

  const getLevelEmoji = (level: string) => {
    switch (level) {
      case 'Diamond': return '💎';
      case 'Gold': return '🥇';
      case 'Silver': return '🥈';
      default: return '🎖️';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Diamond': return 'from-cyan-400 to-blue-500';
      case 'Gold': return 'from-yellow-400 to-orange-500';
      case 'Silver': return 'from-gray-300 to-gray-500';
      default: return 'from-purple-400 to-pink-500';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 p-8 relative overflow-hidden">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-2xl"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-xl"></div>
            
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors duration-200 z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 内容 */}
            <div className="relative z-10">
              {/* 标题 */}
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-4 animate-bounce">
                  {getLevelEmoji(nftData.level)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    NFT Minted Successfully!
                  </h3>
                  <p className={`text-base font-semibold bg-gradient-to-r ${getLevelColor(nftData.level)} bg-clip-text text-transparent`}>
                    {nftData.level} Level NFT
                  </p>
                </div>
              </div>

              {/* 详细信息 */}
              <div className="space-y-3 text-base">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-base">Token ID:</span>
                  <span className="text-cyan-400 font-mono text-base">#{nftData.tokenId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-base">Score Deducted:</span>
                  <span className="text-red-400 font-bold text-base">-{nftData.scoreDeducted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-base">Score Remaining:</span>
                  <span className="text-emerald-400 font-bold text-base">{nftData.newScore}</span>
                </div>
              </div>


            </div>

            {/* 粒子效果 */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    scale: [0, 1, 0],
                    x: [0, Math.random() * 100 - 50],
                    y: [0, Math.random() * 100 - 50]
                  }}
                  transition={{ 
                    duration: 2, 
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                  style={{
                    left: `${20 + i * 10}%`,
                    top: `${30 + (i % 2) * 20}%`
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}