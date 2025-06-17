import { NextRequest, NextResponse } from "next/server";
import { getUserScore, updateUserScore, getLeaderboard } from "@/lib/supabase";
import { verifyToken, extractTokenFromHeader } from "@/lib/jwt";

// 获取用户分数
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userData = verifyToken(token);
    if (!userData) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userScore = await getUserScore(userData.address);
    return NextResponse.json({
      data: userScore || { score: 0 },
    });
  } catch (error) {
    console.error("Error handling score request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// 更新用户分数
export async function POST(request: NextRequest) {
  try {
    // 验证JWT令牌
    const authHeader = request.headers.get("Authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userData = verifyToken(token);
    if (!userData) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 解析请求体
    const body = await request.json();
    const { score } = body;

    if (typeof score !== "number") {
      return NextResponse.json(
        { error: "Invalid score value" },
        { status: 400 }
      );
    }
console.log(`userData is ${userData.address},score is ${score} `)
    // 更新分数
    const success = await updateUserScore(userData.address, score);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update score" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating score:", error);
    return NextResponse.json(
      { error: "Failed to update score" },
      { status: 500 }
    );
  }
}
