'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { SIGN_MESSAGE } from '@/lib/ethereum';

interface WalletConnectProps {
  onAuthenticated: (token: string) => void;
  onWalletDisconnected: () => void;
  isAuthenticated: boolean;
}

export default function WalletConnect({ onAuthenticated, onWalletDisconnected, isAuthenticated }: WalletConnectProps) {
  const { address, isConnected } = useAccount();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 使用Wagmi的签名钩子
  const { signMessageAsync, isPending } = useSignMessage();

  // 处理签名和验证的完整流程
  const handleSignAndVerify = async () => {
    try {
      console.log('Starting signature process...');
      
      // 请求签名
      const signature = await signMessageAsync({
        message: SIGN_MESSAGE,
      });
      
      console.log('Signature received:', signature);
      console.log('Sending verification request...');
      
      // 发送签名到后端验证
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: SIGN_MESSAGE,
          address,
          signature,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // 验证成功，获取JWT令牌
      console.log('Verification successful, token received');
      onAuthenticated(data.token);
      setError(null);
    } catch (err) {
      console.error('Sign and verify error:', err);
      if (err instanceof Error) {
        if (err.message.includes('User rejected')) {
          setError('User cancelled the signature');
        } else {
          setError(err.message);
        }
      } else {
        setError('Signature or verification failed');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // 处理验证按钮点击
  const handleVerify = async () => {
    console.log('Verify button clicked');
    console.log('isConnected:', isConnected, 'address:', address);
    
    if (!isConnected || !address) {
      console.log('Not connected or no address, returning');
      return;
    }
    
    console.log('Starting verification process...');
    setIsVerifying(true);
    setError(null);
    
    // 调用签名和验证流程
    await handleSignAndVerify();
  };

  // 当连接状态改变时，清除错误和处理断开连接
  useEffect(() => {
    if (!isConnected) {
      setError(null);
      // 如果钱包断开连接且之前已认证，则清除JWT
      if (isAuthenticated) {
        onWalletDisconnected();
      }
    }
  }, [isConnected, isAuthenticated, onWalletDisconnected]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 钱包连接按钮 */}
      <div className="w-full">
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            // 注意：mounted 是用来解决服务器端渲染问题的
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === 'authenticated');

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
                className="w-full"
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        type="button"
                        className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-cyan-500/50 hover:from-cyan-400 hover:to-purple-500"
                      >
                        <span>🔗</span> Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="w-full px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-500/50 hover:from-red-400 hover:to-rose-500"
                      >
                        ⚠️ Wrong Network
                      </button>
                    );
                  }

                  return (
                    <div className="flex flex-col w-full gap-2">
                      <div className="flex items-center justify-between w-full">
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-700/80 to-slate-800/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl font-medium text-cyan-100 transition-all duration-300 hover:from-slate-600/80 hover:to-slate-700/80 hover:border-cyan-400/50 shadow-lg"
                        >
                          {chain.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: 16,
                                height: 16,
                                borderRadius: 999,
                                overflow: 'hidden',
                                marginRight: 4,
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  style={{ width: 16, height: 16 }}
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </button>

                        <button
                          onClick={openAccountModal}
                          type="button"
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-700/80 to-slate-800/80 backdrop-blur-sm border border-purple-500/30 rounded-xl font-medium text-purple-100 transition-all duration-300 hover:from-slate-600/80 hover:to-slate-700/80 hover:border-purple-400/50 shadow-lg"
                        >
                          {account.displayBalance
                            ? `${account.displayBalance}`
                            : ''}
                          <span className="font-mono">
                            {account.displayName}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
      
      {/* 验证按钮 - 仅在连接钱包后且未验证时显示 */}
      {isConnected && !isAuthenticated && (
        <div className="w-full flex flex-col items-center gap-2 mt-4">
          <button
            onClick={handleVerify}
            disabled={isPending || isVerifying}
            className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-purple-500/50 hover:from-purple-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isPending || isVerifying ? '⏳ Verifying...' : 'Verify Account'}
          </button>
          
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>
      )}
      
    </div>
  );
}