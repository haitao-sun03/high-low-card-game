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
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Wrong Network
                      </button>
                    );
                  }

                  return (
                    <div className="flex flex-col w-full gap-2">
                      <div className="flex items-center justify-between w-full">
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
                          className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending || isVerifying ? 'Verifying...' : 'Verify Wallet'}
          </button>
          
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>
      )}
      
      {/* 验证成功提示 */}
      {/* {isAuthenticated && (
        <div className="w-full text-center text-green-500 font-medium mt-2">
          ✓ Wallet Verified
        </div>
      )} */}
    </div>
  );
}