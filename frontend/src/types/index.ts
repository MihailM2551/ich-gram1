export type NotificationType = "like" | "comment" | "follow" | "message";

export interface MediaResource {
  url: string;
  width?: number;
  height?: number;
  publicId?: string;
}

export interface UserSummary {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
}

export interface AuthenticatedUser extends UserSummary {
  email: string;
  followersCount: number;
  followingCount: number;
  savedPostIds: string[];
}

export interface Post {
  id: string;
  user: UserSummary;
  image: MediaResource;
  caption: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  likedByMe: boolean;
  savedByMe: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  user: UserSummary;
  text: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  actor: UserSummary;
  recipientId: string;
  post?: Pick<Post, "id" | "image">;
  comment?: Pick<Comment, "id" | "text">;
  messagePreview?: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: UserSummary[];
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: UserSummary;
  text: string;
  createdAt: string;
}

export interface ProfilePayload {
  user: AuthenticatedUser & {
    isCurrentUser: boolean;
    isFollowing: boolean;
  };
  posts: Post[];
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  hasMore: boolean;
  total?: number;
}

export interface AuthResponse {
  token: string;
  user: AuthenticatedUser;
}

export interface AppShellOutletContext {
  openComposer: () => void;
  refreshKey: number;
  requestRefresh: () => void;
}
