import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zzukumylqmtazubhumyq.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6dWt1bXlscW10YXp1Ymh1bXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNjcwNzAsImV4cCI6MjA2NDc0MzA3MH0.IDY-E1NmPjjbEMxSKpHBT4glxIalHXaoAzTImeF6voE";

export const supabase = createClient(supabaseUrl, supabaseKey);

// 创建用户分数表的类型定义
export type UserScore = {
  id: string;
  user_address: string;
  score: number;
  highest_score: number;
  created_at: string;
  updated_at: string;
};

// 获取用户分数
export async function getUserScore(
  userAddress: string
): Promise<UserScore | null> {
  const { data, error } = await supabase
    .from("high_low")
    .select("*")
    .eq("player", userAddress)
    .single();

  if (error) {
    console.error("Error fetching user score:", error);
    return null;
  }

  return data;
}

// 更新用户分数
export async function updateUserScore(
  userAddress: string,
  newScore: number
): Promise<boolean> {
  const existingUser = await getUserScore(userAddress);

  if (existingUser) {
    const { error } = await supabase
      .from("high_low")
      .update({
        score: newScore,
        updated_at: new Date().toISOString(),
      })
      .eq("player", userAddress);

    return !error;
  } else {
    // 创建新用户分数记录
    const { error } = await supabase.from("high_low").insert([
      {
        player: userAddress,
        score: newScore,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    return !error;
  }
}

// 获取排行榜
export async function getLeaderboard(limit: number = 10): Promise<UserScore[]> {
  const { data, error } = await supabase
    .from("high_low")
    .select("*")
    .order("score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }

  return data || [];
}
