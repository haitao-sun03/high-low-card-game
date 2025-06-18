import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_BASE_URL || "";
const supabaseKey = process.env.SUPABASE_API_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

// 创建用户分数表的类型定义
// export type UserScore = {
//   id: string;
//   user_address: string;
//   score: number;
//   highest_score: number;
//   created_at: string;
//   updated_at: string;
// };

// 获取用户分数
export async function getUserScore(
  userAddress: string
): Promise<number | null> {
  const { data, error } = await supabase
    .from("high_low")
    .select("score")
    .eq("player", userAddress)
    .single();

  if (error) {
    console.error("Error fetching user score:", error);
    return null;
  }

  return data?.score ?? null;
}

// 更新用户分数
export async function updateUserScore(
  userAddress: string,
  newScore: number
): Promise<boolean> {
  const existingScore = await getUserScore(userAddress);

  if (existingScore !== null) {
    const { error } = await supabase
      .from("high_low")
      .update({
        score: newScore,
        updated_at: new Date().toISOString(),
      })
      .eq("player", userAddress);

    if (error) {
      console.error('Error updating user score:', error);
      return false;
    }
    return true;
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

    if (error) {
      console.error('Error creating user score:', error);
      return false;
    }
    return true;
  }
}
