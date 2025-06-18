import { NextRequest, NextResponse } from 'next/server';
import { updateUserScore, getUserScore } from '@/lib/supabase';

// 处理NFT铸造成功后的分数扣减
export async function POST(request: NextRequest) {
  try {
    const { walletAddress, level, score, tokenId } = await request.json();

    if (!walletAddress || !level) {
      return NextResponse.json(
        { error: 'Missing walletAddress or level' },
        { status: 400 }
      );
    }

    console.log(`Processing NFT minted event: wallet=${walletAddress}, level=${level}, score=${score}, tokenId=${tokenId}`);

    // 获取当前用户分数
    const currentScore = await getUserScore(walletAddress);
    
    if (currentScore === null) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 根据铸造的NFT等级确定扣减分数
    let scoreToDeduct = 0;
    switch (level) {
      case 'Silver':
        scoreToDeduct = 100;
        break;
      case 'Gold':
        scoreToDeduct = 300;
        break;
      case 'Diamond':
        scoreToDeduct = 500;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid NFT level' },
          { status: 400 }
        );
    }

    // 计算新分数
    const newScore = Math.max(0, Number(currentScore) - scoreToDeduct);

    // 更新用户分数
    const success = await updateUserScore(walletAddress, newScore);

    if (success) {
      return NextResponse.json({
        message: 'Score updated successfully',
        previousScore: currentScore,
        newScore,
        scoreDeducted: scoreToDeduct,
        walletAddress,
        level,
        tokenId
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to update score' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing NFT minted event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}