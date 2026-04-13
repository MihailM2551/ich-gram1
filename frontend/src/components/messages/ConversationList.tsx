import { Search } from "lucide-react";
import type { Conversation, UserSummary } from "../../types";
import { formatRelativeTime } from "../../lib/format";
import { Avatar } from "../common/Avatar";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  currentUserId: string;
  currentUsername: string;
  searchOpen: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onToggleSearch: () => void;
  searchResults: UserSummary[];
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: (participantId: string) => void;
}

const getCounterpart = (conversation: Conversation, currentUserId: string) =>
  conversation.participants.find((participant) => participant.id !== currentUserId) ?? conversation.participants[0];

const getPreview = (conversation: Conversation, currentUserId: string) => {
  if (!conversation.lastMessage?.text) {
    return "Start a conversation";
  }

  return conversation.lastMessage.senderId === currentUserId
    ? `You: ${conversation.lastMessage.text}`
    : conversation.lastMessage.text;
};

export const ConversationList = ({
  conversations,
  activeConversationId,
  currentUserId,
  currentUsername,
  searchOpen,
  searchQuery,
  onSearchQueryChange,
  onToggleSearch,
  searchResults,
  onSelectConversation,
  onCreateConversation,
}: ConversationListProps) => (
  <aside className="flex min-h-[760px] flex-col border-r border-[#dbdbdb] bg-white">
    <div className="border-b border-[#dbdbdb] px-6 py-7">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-[#262626]">{currentUsername}</h1>
        <button
          type="button"
          onClick={onToggleSearch}
          className="text-[13px] font-semibold text-[#0095f6] transition hover:text-[#1877f2]"
        >
          {searchOpen ? "Close" : "New chat"}
        </button>
      </div>

      {searchOpen ? (
        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 rounded-[12px] border border-[#dbdbdb] bg-[#fafafa] px-4 py-3">
            <Search size={16} className="text-[#8e8e8e]" />
            <input
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search users"
              className="w-full bg-transparent text-[14px] text-[#262626] outline-none placeholder:text-[#8e8e8e]"
            />
          </div>

          {searchQuery.trim() ? (
            <div className="max-h-[220px] space-y-1 overflow-y-auto rounded-[16px] border border-[#efefef] bg-white p-2">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => onCreateConversation(result.id)}
                  className="flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left transition hover:bg-[#fafafa]"
                >
                  <Avatar name={result.fullName || result.username} src={result.avatarUrl} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[#262626]">{result.username}</p>
                    <p className="truncate text-[13px] text-[#8e8e8e]">{result.fullName || result.username}</p>
                  </div>
                </button>
              ))}
              {!searchResults.length ? (
                <p className="px-3 py-4 text-[13px] text-[#8e8e8e]">No users found.</p>
              ) : null}
            </div>
          ) : (
            <p className="text-[13px] text-[#8e8e8e]">Type a username to start a real conversation.</p>
          )}
        </div>
      ) : null}
    </div>

    <div className="flex-1 overflow-y-auto py-2">
      {conversations.map((conversation) => {
        const counterpart = getCounterpart(conversation, currentUserId);

        if (!counterpart) {
          return null;
        }

        return (
          <button
            key={conversation.id}
            type="button"
            onClick={() => onSelectConversation(conversation.id)}
            className={`flex w-full items-center gap-3 px-6 py-3 text-left transition ${
              activeConversationId === conversation.id ? "bg-[#f2f2f2]" : "bg-white hover:bg-[#fafafa]"
            }`}
          >
            <Avatar name={counterpart.fullName || counterpart.username} src={counterpart.avatarUrl} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-medium text-[#262626]">{counterpart.username}</p>
              <p className="mt-1 truncate text-[13px] text-[#8e8e8e]">
                {getPreview(conversation, currentUserId)}
                {conversation.lastMessage?.createdAt ? ` · ${formatRelativeTime(conversation.lastMessage.createdAt)}` : ""}
              </p>
            </div>
          </button>
        );
      })}

      {!conversations.length ? (
        <div className="px-6 py-8">
          <p className="text-[14px] font-medium text-[#262626]">No messages yet</p>
          <p className="mt-2 max-w-[240px] text-[13px] leading-5 text-[#8e8e8e]">
            Open a new chat and the conversation will be stored in the database for real users.
          </p>
        </div>
      ) : null}
    </div>
  </aside>
);
