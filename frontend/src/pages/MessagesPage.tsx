import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { messagesApi, usersApi } from "../api/services";
import { useAuth } from "../context/AuthContext";
import type { Conversation, Message, UserSummary } from "../types";
import { ChatWindow } from "../components/messages/ChatWindow";
import { ConversationList } from "../components/messages/ConversationList";

const getCounterpart = (conversation: Conversation, currentUserId: string) =>
  conversation.participants.find((participant) => participant.id !== currentUserId) ?? conversation.participants[0];

export const MessagesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);

  useEffect(() => {
    const loadConversations = async () => {
      const data = await messagesApi.conversations();
      setConversations(data);
      setActiveConversationId((current) => current ?? location.state?.conversationId ?? data[0]?.id);
    };

    void loadConversations();
  }, [location.state]);

  useEffect(() => {
    if (location.state?.conversationId) {
      setActiveConversationId(location.state.conversationId);
    }
  }, [location.state]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      const response = await messagesApi.list(activeConversationId);
      setMessages(response.items);
    };

    void loadMessages();
  }, [activeConversationId]);

  useEffect(() => {
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      const results = await usersApi.search(trimmed);
      setSearchResults(results.filter((entry) => entry.id !== user?.id));
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchQuery, user?.id]);

  if (!user) {
    return null;
  }

  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId);
  const counterpart = activeConversation ? getCounterpart(activeConversation, user.id) : undefined;

  const handleCreateConversation = async (participantId: string) => {
    const conversation = await messagesApi.createConversation(participantId);
    setConversations((current) => [conversation, ...current.filter((item) => item.id !== conversation.id)]);
    setActiveConversationId(conversation.id);
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setSearchOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.trim() || !activeConversationId) {
      return;
    }

    try {
      setSending(true);
      const created = await messagesApi.send({
        conversationId: activeConversationId,
        text: draft.trim(),
      });

      setDraft("");
      setMessages((current) => (current.some((message) => message.id === created.id) ? current : [...current, created]));
      setConversations((current) => {
        const updated = current.map((conversation) =>
          conversation.id === activeConversationId
            ? {
                ...conversation,
                lastMessage: {
                  text: created.text,
                  senderId: created.sender.id,
                  createdAt: created.createdAt,
                },
                updatedAt: created.createdAt,
              }
            : conversation,
        );

        return updated.sort(
          (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
        );
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="overflow-hidden border border-[#dbdbdb] bg-white">
      <div className="grid min-h-[760px] lg:grid-cols-[370px,minmax(0,1fr)]">
        <div className={`${activeConversationId ? "hidden lg:block" : "block"}`}>
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            currentUserId={user.id}
            currentUsername={user.username}
            searchOpen={searchOpen}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onToggleSearch={() => {
              setSearchOpen((current) => !current);
              setSearchQuery("");
              setSearchResults([]);
            }}
            searchResults={searchResults}
            onSelectConversation={handleSelectConversation}
            onCreateConversation={(participantId) => void handleCreateConversation(participantId)}
          />
        </div>

        <div className={`${activeConversationId ? "block" : "hidden lg:block"}`}>
          <ChatWindow
            conversation={activeConversation}
            counterpart={counterpart}
            currentUser={user}
            messages={messages}
            draft={draft}
            setDraft={setDraft}
            onSubmit={handleSubmit}
            onBack={activeConversationId ? () => setActiveConversationId(undefined) : undefined}
            sending={sending}
          />
        </div>
      </div>

      <footer className="hidden border-t border-[#dbdbdb] px-6 py-6 text-center text-[12px] text-[#8e8e8e] lg:block">
        <div className="flex flex-wrap items-center justify-center gap-8">
          <span>Home</span>
          <span>Search</span>
          <span>Explore</span>
          <span>Messages</span>
          <span>Notifications</span>
          <span>Create</span>
        </div>
        <p className="mt-6">© 2024 ICHgram</p>
      </footer>
    </section>
  );
};
