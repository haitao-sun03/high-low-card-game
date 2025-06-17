'use client';

import { useState, useEffect } from 'react';
import Card from './Card';
import { createDeck, shuffleDeck, Card as CardType, compareCards } from '@/lib/cards';

interface GameProps {
  userToken: string | null;
  onScoreUpdate?: (score: number) => void;
}

export default function Game({userToken, onScoreUpdate}: GameProps) {
  // 游戏状态
  const [deck, setDeck] = useState<CardType[]>([]);
  const [currentCard, setCurrentCard] = useState<CardType | null>(null);
  const [nextCard, setNextCard] = useState<CardType | null>(null);
  const [isNextCardRevealed, setIsNextCardRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 初始化游戏
  function initGame (score : Number) : void {
    const newDeck = shuffleDeck(createDeck());
    setDeck(newDeck);
    setCurrentCard(newDeck[0]);
    setNextCard(newDeck[1]);
    setIsNextCardRevealed(false);
    setScore(Number(score));
    setStreak(0);
    setGameOver(false);
    setMessage('Guess if the next card is higher or lower?');
  };

  // 重新开始游戏 - 立即重新初始化，异步获取最新分数
  const restartGame = async () => {
    if (!userToken) return;

    // 立即重新初始化游戏，使用当前分数
    initGame(score);
    setIsLoading(true);

    // 异步获取最新分数并更新
    try {
      const response = await fetch('/api/scores', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const latestScore = result.data?.score || 0;
        // 只有当分数不同时才更新
        if (latestScore !== score) {
          setScore(latestScore);
        }
      }
    } catch (error) {
      console.error('Failed to fetch latest score:', error);
      // 获取失败时保持当前分数，不影响游戏体验
    } finally {
      setIsLoading(false);
    }
  };

  // 组件挂载时初始化游戏
  useEffect(() => {
    // 如果没有userToken，清除游戏状态
    if (!userToken) {
      setDeck([]);
      setCurrentCard(null);
      setNextCard(null);
      setIsNextCardRevealed(false);
      setScore(0);
      setStreak(0);
      setGameOver(false);
      setMessage('');
      setIsLoading(false);
      return;
    }

    // 立即初始化游戏界面，避免等待API响应
    const newDeck = shuffleDeck(createDeck());
    setDeck(newDeck);
    setCurrentCard(newDeck[0]);
    setNextCard(newDeck[1]);
    setIsNextCardRevealed(false);
    setStreak(0);
    setGameOver(false);
    setMessage('Guess if the next card is higher or lower?');
    setIsLoading(true);

    // 异步获取用户分数
    (async function fetchScores() {
      try {
        const response = await fetch('/api/scores', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          const userScore = result.data?.score || 0;
          setScore(userScore);
          
          // 如果是首次用户（没有分数记录），异步创建初始记录
          if (!result.data) {
            fetch('/api/scores', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
              },
              body: JSON.stringify({ score: 0 })
            }).catch(error => console.error('Failed to create score record:', error));
          }
        } else {
          // 如果获取失败，设置为0分并尝试创建记录
          setScore(0);
          fetch('/api/scores', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ score: 0 })
          }).catch(error => console.error('Failed to create score record:', error));
        }
      } catch (error) {
        console.error('Failed to fetch scores:', error);
        setScore(0);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [userToken]);

  // 处理猜测
  const handleGuess = async (guess: 'higher' | 'lower') => {
    if (!currentCard || !nextCard || gameOver) return;

    // 显示下一张牌
    setIsNextCardRevealed(true);

    // 比较牌的大小
    const result = compareCards(nextCard, currentCard);

    // 判断猜测结果
    if (result === guess) {
      // 猜对了
      const newStreak = streak + 1;
      const pointsEarned = 5 * newStreak; // 连续猜对得分翻倍
      const newScore = score + pointsEarned;
      
      setStreak(newStreak);
      setScore(newScore);
      setMessage(`Correct! +${pointsEarned} points, streak: ${newStreak} times`);
      
      // 通知父组件分数更新
      if (onScoreUpdate) {
        onScoreUpdate(newScore);
      }
      
      // 更新分数到服务器
      if (userToken) {
        try {
          setIsLoading(true);
          await updateScore(newScore);
        } catch (error) {
          console.error('Failed to update score:', error);
        } finally {
          setIsLoading(false);
        }
      }

      // 延迟后继续游戏
      setTimeout(() => {
        // 移除已使用的牌
        const newDeck = [...deck];
        newDeck.splice(0, 2);
        
        // 如果牌组用完，重新洗牌
        if (newDeck.length < 2) {
          const freshDeck = shuffleDeck(createDeck());
          setDeck(freshDeck);
          setCurrentCard(freshDeck[0]);
          setNextCard(freshDeck[1]);
        } else {
          setDeck(newDeck);
          setCurrentCard(nextCard);
          setNextCard(newDeck[0]);
        }
        
        setIsNextCardRevealed(false);
      }, 1500);
    } else {
      // 猜错了，扣分并重置连击
      const pointsLost = Math.min(10, score); // 扣除10分，但不能低于0分
      const newScore = Math.max(0, score - pointsLost);
      
      setScore(newScore);
      setStreak(0); // 重置连击
      setMessage(`Wrong! -${pointsLost} points, streak reset`);
      
      // 通知父组件分数更新
      if (onScoreUpdate) {
        onScoreUpdate(newScore);
      }
      
      // 更新分数到服务器
      if (userToken) {
        try {
          setIsLoading(true);
          await updateScore(newScore);
        } catch (error) {
          console.error('Failed to update score:', error);
        } finally {
          setIsLoading(false);
        }
      }
      
      // 延迟后继续游戏
      setTimeout(() => {
        // 移除已使用的牌
        const newDeck = [...deck];
        newDeck.splice(0, 2);
        
        // 如果牌组用完，重新洗牌
        if (newDeck.length < 2) {
          const freshDeck = shuffleDeck(createDeck());
          setDeck(freshDeck);
          setCurrentCard(freshDeck[0]);
          setNextCard(freshDeck[1]);
        } else {
          setDeck(newDeck);
          setCurrentCard(nextCard);
          setNextCard(newDeck[0]);
        }
        
        setIsNextCardRevealed(false);
        setMessage('Guess if the next card is higher or lower?');
      }, 1500);
    }
  };

  // 更新分数到服务器
  const updateScore = async (newScore: number) => {
    if (!userToken) return;
    
    const response = await fetch('/api/scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ score: newScore })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update score');
    }
    
    return response.json();
  };

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-4xl mx-auto">
      {/* 分数显示 */}
      <div className="score-display">
        <div className="text-center">
          <div className="text-lg font-medium text-cyan-300 mb-2">🏆 Your Score</div>
          <div className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">{score}</div>
          {streak > 0 && (
            <div className="text-sm font-bold text-purple-300 mt-2 animate-pulse">
              🔥 Streak {streak} times!
            </div>
          )}
        </div>
      </div>
      
      {/* 消息显示 */}
      <div className="game-message min-h-[3rem] flex items-center justify-center">
        {message}
      </div>
      
      {/* 卡片区域 */}
      <div className="flex justify-center gap-16 w-full">
        {/* 当前牌 */}
        <div className="flex flex-col items-center gap-6">
          <span className="card-label px-6 py-3 rounded-2xl bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-cyan-500/30 shadow-lg">🃏 Current Card</span>
          <Card card={currentCard} isRevealed={true} />
        </div>
        
        {/* 下一张牌 */}
        <div className="flex flex-col items-center gap-6">
          <span className="card-label px-6 py-3 rounded-2xl bg-gradient-to-r from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-purple-500/30 shadow-lg">❓ Next Card</span>
          <Card card={nextCard} isRevealed={isNextCardRevealed} />
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex gap-8 mt-10">
        {!gameOver ? (
          <>
            <button
              onClick={() => handleGuess('higher')}
              disabled={ isLoading || isNextCardRevealed}
              className="game-button game-button-higher disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              📈 Higher
            </button>
            <button
              onClick={() => handleGuess('lower')}
              disabled={ isLoading || isNextCardRevealed}
              className="game-button game-button-lower disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              📉 Lower
            </button>
          </>
        ) : (
          <button
            onClick={restartGame}
            disabled={isLoading}
            className="game-button game-button-restart disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? '⏳ Loading...' : '🔄 Restart'}
          </button>
        )}
      </div>
      

    </div>
  );
}