'use client';

import { Card as CardType } from '@/lib/cards';
import Image from 'next/image';

interface CardProps {
  card: CardType | null;
  isRevealed?: boolean;
  className?: string;
}

export default function Card({ card, isRevealed = true, className = '' }: CardProps) {
  // 卡片背面的样式
  const cardBackStyle = 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 flex items-center justify-center shadow-inner border-2 border-slate-600';
  
  // 卡片花色的颜色
  const suitColor = card ? 
    (card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-slate-800') : 
    '';
  
  // 花色符号映射
  const suitSymbol = {
    'hearts': '♥',
    'diamonds': '♦',
    'clubs': '♣',
    'spades': '♠'
  };

  return (
    <div 
      className={`relative w-40 h-56 rounded-2xl shadow-2xl overflow-hidden ${className} group cursor-pointer`}
      style={{ perspective: '1200px' }}
    >
      <div 
        className={`w-full h-full transition-all duration-700 ease-in-out ${isRevealed ? 'rotate-y-0' : 'rotate-y-180'} group-hover:scale-105 group-hover:shadow-3xl`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 卡片正面 */}
        <div 
          className={`absolute w-full h-full bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-4 flex flex-col justify-between ${isRevealed ? 'backface-visible' : 'backface-hidden'} shadow-xl backdrop-blur-sm`}
        >
          {card ? (
            <>
              <div className={`text-3xl font-bold ${suitColor} drop-shadow-sm`}>
                {card.rank}
              </div>
              <div className={`text-6xl flex-grow flex items-center justify-center ${suitColor} drop-shadow-lg transform transition-transform group-hover:scale-110`}>
                {suitSymbol[card.suit]}
              </div>
              <div className={`text-3xl font-bold self-end rotate-180 ${suitColor} drop-shadow-sm`}>
                {card.rank}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg">
              No Card
            </div>
          )}
        </div>
        
        {/* 卡片背面 */}
        <div 
          className={`absolute w-full h-full bg-white rounded-2xl rotate-y-180 ${isRevealed ? 'backface-hidden' : 'backface-visible'} flex flex-col items-center justify-center border-2 border-gray-200 shadow-2xl`}
        >
          {/* 动态背景效果 */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent rounded-2xl"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5 rounded-2xl"></div>
          
          {/* Chainlink Logo 和文字 - 分行显示 */}
          <div className="flex flex-col items-center space-y-4 opacity-95 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105">
            {/* Chainlink 正六边形 Logo */}
            <div className="relative">
              <svg width="80" height="80" viewBox="0 0 60 60" className="drop-shadow-lg">
                {/* 主要正六边形 - 只有蓝色边框，内部白色，无其他图案 */}
                <polygon 
                  points="30,5 50,17.5 50,42.5 30,55 10,42.5 10,17.5" 
                  fill="white"
                  stroke="#375bd2"
                  strokeWidth="5"
                />
              </svg>
            </div>
            
            {/* Chainlink 文字 - 在logo下方 */}
            <div className="text-center">
              <div className="font-bold text-3xl tracking-wide">
                <span className="text-blue-600">Chain</span><span className="text-blue-700">link</span>
              </div>
            </div>
          </div>
          
          {/* 底部装饰线 */}
          <div className="mt-6 w-32 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-60 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}