import { supabase } from "../supabase.ts";
import { RandomUser } from "../types/randomUser.ts";
import { NiveauAcces } from "../types/niveauAcces.ts";

export async function testAddRandomUser(
  collectiviteId: number,
  niveau: NiveauAcces,
): Promise<RandomUser> {
  const { data } = await supabase.rpc(
    "test_add_random_user",
    { "cgu_acceptees": true, "collectivite_id": collectiviteId, "niveau": niveau },
  ).single();
  if (!data) {
    throw `La RPC 'test_add_random_user' devrait renvoyer un utilisateur.`;
  }

  // @ts-ignore
  return data as RandomUser;
}
