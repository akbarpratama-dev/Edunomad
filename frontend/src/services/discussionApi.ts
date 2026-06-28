import { apiClient } from "@/lib/apiClient";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

// Paginated endpoints (messages) return { data, meta } directly (no success envelope).
export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  lastPage: number;
}
interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export type DiscussionType = "GROUP" | "DIRECT";

export interface DiscussionMember {
  user: { id: string; name: string; email: string; role: string };
}

// Phase 12 — forum categories (discussions.category). Labels in Indonesian.
export type DiscussionCategory =
  | "ANNOUNCEMENT"
  | "QUESTION"
  | "IDEA"
  | "BLOCKER"
  | "MENTOR_REVIEW"
  | "UPDATE";

export const DISCUSSION_CATEGORY_META: Record<
  DiscussionCategory,
  { label: string; className: string }
> = {
  ANNOUNCEMENT: { label: "Pengumuman", className: "bg-[#eef7d6] text-[#5f8c00]" },
  QUESTION: { label: "Pertanyaan", className: "bg-sky-100 text-sky-700" },
  IDEA: { label: "Ide", className: "bg-violet-100 text-violet-700" },
  BLOCKER: { label: "Kendala", className: "bg-rose-100 text-rose-700" },
  MENTOR_REVIEW: { label: "Review Mentor", className: "bg-amber-100 text-amber-700" },
  UPDATE: { label: "Pembaruan", className: "bg-zinc-100 text-zinc-700" },
};

export interface Discussion {
  id: string;
  type: DiscussionType;
  projectId: string | null;
  title?: string | null;
  category?: DiscussionCategory | null;
  isPinned?: boolean;
  members: DiscussionMember[];
  _count?: { messages: number };
  updatedAt?: string;
}

export interface DiscussionMessage {
  id: string;
  message: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

export const discussionApi = {
  // === Group discussions (Workflow 7) ===
  async listProjectDiscussions(projectId: string): Promise<Discussion[]> {
    const res = await apiClient.get<Envelope<Discussion[]>>(`/projects/${projectId}/discussions`);
    return res.data.data;
  },

  async createGroupDiscussion(
    projectId: string,
    input: { title: string; category: DiscussionCategory; members?: string[] }
  ): Promise<Discussion> {
    const res = await apiClient.post<Envelope<Discussion>>(`/projects/${projectId}/discussions`, input);
    return res.data.data;
  },

  // Phase 12 — pin/unpin a forum topic (senior lead / UMKM owner).
  async pinDiscussion(discussionId: string, pinned: boolean): Promise<Discussion> {
    const res = await apiClient.post<Envelope<Discussion>>(`/discussions/${discussionId}/pin`, {
      pinned,
    });
    return res.data.data;
  },

  async listMessages(discussionId: string, page = 1, limit = 30): Promise<Paginated<DiscussionMessage>> {
    const res = await apiClient.get<Paginated<DiscussionMessage>>(
      `/discussions/${discussionId}/messages`,
      { params: { page, limit } }
    );
    return res.data;
  },

  async sendMessage(discussionId: string, message: string): Promise<DiscussionMessage> {
    const res = await apiClient.post<Envelope<DiscussionMessage>>(
      `/discussions/${discussionId}/messages`,
      { message }
    );
    return res.data.data;
  },

  // === Direct messages (Workflow 7) ===
  async createOrGetDirectChat(userId: string): Promise<Discussion> {
    const res = await apiClient.post<Envelope<Discussion>>(`/users/${userId}/direct-chat`);
    return res.data.data;
  },

  async listDirectMessages(chatId: string, page = 1, limit = 30): Promise<Paginated<DiscussionMessage>> {
    const res = await apiClient.get<Paginated<DiscussionMessage>>(
      `/direct-chat/${chatId}/messages`,
      { params: { page, limit } }
    );
    return res.data;
  },

  async sendDirectMessage(chatId: string, message: string): Promise<DiscussionMessage> {
    const res = await apiClient.post<Envelope<DiscussionMessage>>(
      `/direct-chat/${chatId}/messages`,
      { message }
    );
    return res.data.data;
  },
};
