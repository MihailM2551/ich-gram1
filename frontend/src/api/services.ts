import { API_ORIGIN } from "../lib/env";
import { storage } from "../lib/storage";
import type {
  AuthResponse,
  Comment,
  Conversation,
  Message,
  NotificationItem,
  PaginatedResponse,
  Post,
  ProfilePayload,
  UserSummary,
} from "../types";
import { http } from "./http";

const toId = (value: unknown) => String(value ?? "");

const toAbsoluteUrl = (value?: string) => {
  if (!value) {
    return undefined;
  }

  return /^https?:\/\//.test(value) ? value : `${API_ORIGIN}${value}`;
};

const normalizeUserSummary = (user: any): UserSummary => ({
  id: toId(user?.id ?? user?._id),
  username: user?.username ?? "",
  fullName: user?.fullName ?? user?.username ?? "",
  avatarUrl: toAbsoluteUrl(user?.avatarUrl ?? user?.avatar),
  bio: user?.bio ?? "",
  website: user?.website ?? "",
});

const normalizeAuthenticatedUser = (user: any) => ({
  ...normalizeUserSummary(user),
  email: user?.email ?? "",
  followersCount: Array.isArray(user?.followers) ? user.followers.length : user?.followersCount ?? 0,
  followingCount: Array.isArray(user?.following) ? user.following.length : user?.followingCount ?? 0,
  savedPostIds: Array.isArray(user?.savedPosts)
    ? user.savedPosts.map((item: unknown) => toId(item))
    : user?.savedPostIds ?? [],
});

const normalizePost = (post: any): Post => {
  const likes: string[] = Array.isArray(post?.likes)
    ? post.likes.map((item: unknown) => toId(item))
    : [];
  const comments = Array.isArray(post?.comments) ? post.comments : [];
  const currentUserId = storage.getUser()?.id ?? "";

  return {
    id: toId(post?.id ?? post?._id),
    user: normalizeUserSummary(post?.user ?? {}),
    image: {
      url: toAbsoluteUrl(post?.image?.url ?? post?.image) ?? "",
    },
    caption: post?.caption ?? "",
    likesCount: typeof post?.likesCount === "number" ? post.likesCount : likes.length,
    commentsCount: typeof post?.commentsCount === "number" ? post.commentsCount : comments.length,
    createdAt: post?.createdAt ?? new Date().toISOString(),
    likedByMe: currentUserId
      ? likes.some((item: string) => item === currentUserId)
      : Boolean(post?.likedByMe),
    savedByMe: Boolean(post?.savedByMe),
  };
};

const normalizeComment = (comment: any, postId: string): Comment => ({
  id: toId(comment?.id ?? comment?._id),
  postId,
  user: normalizeUserSummary(comment?.user ?? {}),
  text: comment?.text ?? "",
  createdAt: comment?.createdAt ?? new Date().toISOString(),
});

const normalizeConversation = (conversation: any): Conversation => ({
  id: toId(conversation?.id ?? conversation?._id),
  participants: Array.isArray(conversation?.participants)
    ? conversation.participants.map(normalizeUserSummary)
    : [],
  lastMessage: conversation?.lastMessage?.text
    ? {
        text: conversation.lastMessage.text,
        senderId: toId(conversation.lastMessage?.senderId ?? conversation.lastMessage?.sender),
        createdAt: conversation.lastMessage?.createdAt ?? conversation?.updatedAt ?? new Date().toISOString(),
      }
    : undefined,
  unreadCount: typeof conversation?.unreadCount === "number" ? conversation.unreadCount : 0,
  updatedAt: conversation?.updatedAt ?? conversation?.lastMessage?.createdAt ?? new Date().toISOString(),
});

const normalizeMessage = (message: any): Message => ({
  id: toId(message?.id ?? message?._id),
  conversationId: toId(message?.conversationId ?? message?.conversation),
  sender: normalizeUserSummary(message?.sender ?? {}),
  text: message?.text ?? "",
  createdAt: message?.createdAt ?? new Date().toISOString(),
});

const normalizeNotification = (notification: any): NotificationItem => ({
  id: toId(notification?._id ?? notification?.id),
  type: notification?.type ?? "like",
  actor: normalizeUserSummary(notification?.actor ?? notification?.sender ?? {}),
  recipientId: toId(notification?.recipient),
  post: notification?.post
    ? {
        id: toId(notification.post?._id ?? notification.post?.id),
        image: {
          url: toAbsoluteUrl(notification.post?.image?.url ?? notification.post?.image) ?? "",
        },
      }
    : undefined,
  comment: notification?.comment
    ? {
        id: toId(notification.comment?._id ?? notification.comment?.id),
        text: notification.comment?.text ?? "",
      }
    : undefined,
  messagePreview: notification?.messagePreview,
  read: Boolean(notification?.read),
  createdAt: notification?.createdAt ?? new Date().toISOString(),
});

const normalizePostsResponse = (data: any): PaginatedResponse<Post> => {
  if (Array.isArray(data)) {
    return {
      items: data.map(normalizePost),
      page: 1,
      hasMore: false,
      total: data.length,
    };
  }

  return {
    items: Array.isArray(data?.items) ? data.items.map(normalizePost) : [],
    page: data?.page ?? 1,
    hasMore: Boolean(data?.hasMore),
    total: data?.total,
  };
};

const normalizeProfilePayload = (data: any): ProfilePayload => ({
  user: {
    ...normalizeAuthenticatedUser(data?.user ?? {}),
    isCurrentUser: Boolean(data?.user?.isCurrentUser),
    isFollowing: Boolean(data?.user?.isFollowing),
  },
  posts: Array.isArray(data?.posts) ? data.posts.map(normalizePost) : [],
});

export const authApi = {
  login: async (payload: { identifier: string; email: string; password: string }) => {
    const { data } = await http.post<{ token: string; user: any }>("/auth/login", payload);

    return {
      token: data.token,
      user: normalizeAuthenticatedUser(data.user),
    } satisfies AuthResponse;
  },
  register: async (payload: {
    email: string;
    password: string;
    username: string;
    fullName: string;
  }) => {
    const { data } = await http.post<{ token: string; user: any }>("/auth/register", payload);

    return {
      token: data.token,
      user: normalizeAuthenticatedUser(data.user),
    } satisfies AuthResponse;
  },
  me: async () => {
    const { data } = await http.get<any>("/auth/me");
    return normalizeAuthenticatedUser(data);
  },
};

export const postApi = {
  feed: async (_page = 1, _limit = 10) => {
    const { data } = await http.get<any>("/posts/feed");
    return normalizePostsResponse(data);
  },
  explore: async (_page = 1, _limit = 18) => {
    const { data } = await http.get<any>("/posts/explore");
    return normalizePostsResponse(data);
  },
  create: async (payload: FormData) => {
    const { data } = await http.post<any>("/posts", payload);
    return normalizePost(data);
  },
  update: async (postId: string, payload: { caption: string }) => {
    const { data } = await http.put<any>(`/posts/${postId}`, payload);
    return normalizePost(data);
  },
  remove: async (postId: string) => {
    await http.delete(`/posts/${postId}`);
  },
  toggleSave: async (postId: string) => {
    const { data } = await http.post<any>(`/posts/${postId}/save`);
    return normalizePost(data);
  },
};

export const likesApi = {
  toggle: async (postId: string) => {
    const { data } = await http.put<any>(`/posts/${postId}/like`);
    return normalizePost(data);
  },
};

export const commentsApi = {
  list: async (postId: string) => {
    const { data } = await http.get<any>(`/posts/${postId}/comments`);
    const items = Array.isArray(data)
      ? data.map((item: any) => normalizeComment(item, postId))
      : [];

    return {
      items,
      page: 1,
      hasMore: false,
      total: items.length,
    } satisfies PaginatedResponse<Comment>;
  },
  create: async (postId: string, payload: { text: string }) => {
    const { data } = await http.post<any>(`/posts/${postId}/comments`, payload);

    return {
      comment: normalizeComment(data.comment, postId),
      post: normalizePost(data.post),
    };
  },
  remove: async (postId: string, commentId: string) => {
    const { data } = await http.delete<any>(`/posts/${postId}/comments/${commentId}`);
    return {
      post: normalizePost(data.post),
    };
  },
};

export const notificationsApi = {
  list: async () => {
    const { data } = await http.get<any[]>("/posts/notifications");
    return data.map(normalizeNotification);
  },
  markRead: async (notificationId: string) => {
    const items = await notificationsApi.list();
    const item = items.find((entry) => entry.id === notificationId);

    if (!item) {
      throw new Error("Notification not found");
    }

    return {
      ...item,
      read: true,
    };
  },
};

export const usersApi = {
  search: async (query: string) => {
    const { data } = await http.get<any[]>("/posts/search", {
      params: { q: query },
    });
    return data.map(normalizeUserSummary);
  },
  getSearchHistory: async () => {
    return [];
  },
  saveSearchHistory: async (query: string) => {
    void query;
  },
  profile: async (username: string) => {
    const { data } = await http.get<any>(`/users/profile/${encodeURIComponent(username)}`);
    return normalizeProfilePayload(data);
  },
  updateMe: async (payload: FormData) => {
    const { data } = await http.put<any>("/users/me", payload);
    return normalizeAuthenticatedUser(data);
  },
  toggleFollow: async (userId: string) => {
    const { data } = await http.post<any>(`/users/${userId}/follow`);
    return {
      ...normalizeAuthenticatedUser(data),
      isCurrentUser: Boolean(data?.isCurrentUser),
      isFollowing: Boolean(data?.isFollowing),
    } satisfies ProfilePayload["user"];
  },
};

export const messagesApi = {
  conversations: async () => {
    const { data } = await http.get<any[]>("/messages/conversations");
    return Array.isArray(data) ? data.map(normalizeConversation) : [];
  },
  createConversation: async (participantId: string) => {
    const { data } = await http.post<any>("/messages/conversations", {
      participantId,
    });
    return normalizeConversation(data);
  },
  list: async (conversationId: string, page = 1, limit = 50) => {
    const { data } = await http.get<any>(`/messages/conversations/${conversationId}`, {
      params: { page, limit },
    });

    return {
      items: Array.isArray(data?.items) ? data.items.map(normalizeMessage) : [],
      page: data?.page ?? page,
      hasMore: Boolean(data?.hasMore),
      total: data?.total,
    } satisfies PaginatedResponse<Message>;
  },
  send: async (payload: { conversationId: string; text: string }) => {
    const { data } = await http.post<any>("/messages", payload);
    return normalizeMessage(data);
  },
};
