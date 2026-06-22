import { apiClient } from "@/lib/apiClient";

export interface Skill {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: string;
}

// GET /skills — paginated; for registration we just pull the full approved list.
export async function fetchSkills(): Promise<Skill[]> {
  const res = await apiClient.get<{ data: Skill[]; meta: { total: number } }>("/skills", {
    params: { status: "APPROVED", limit: 100 },
  });
  return res.data.data;
}
