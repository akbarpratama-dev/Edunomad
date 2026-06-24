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

export interface Discussion {
  id: string;
  type: DiscussionType;
  projectId: string | null;
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

  async createGroupDiscussion(projectId: string, members?: string[]): Promise<Discussion> {
    const res = await apiClient.post<Envelope<Discussion>>(`/projects/${projectId}/discussions`, {
      members,
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
