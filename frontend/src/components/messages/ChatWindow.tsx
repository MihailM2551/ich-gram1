import { ChevronLeft } from "lucide-react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { profilePath } from "../../lib/routes";
import type { Conversation, Message, UserSummary } from "../../types";
import { Avatar } from "../common/Avatar";

interface ChatWindowProps {
  conversation?: Conversation;
  counterpart?: UserSummary;
  currentUser: UserSummary;
  messages: Message[];
  draft: string;
  setDraft: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack?: () => void;
  sending: boolean;
}

const formatThreadDate = (value?: string) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export const ChatWindow = ({
  conversation,
  counterpart,
  currentUser,
  messages,
  draft,
  setDraft,
  onSubmit,
  onBack,
  sending,
}: ChatWindowProps) => {
  if (!conversation || !counterpart) {
    return (
      <div className="flex min-h-[760px] items-center justify-center bg-white px-8">
        <div className="max-w-[320px] text-center">
          <div className="mx-auto flex h-[96px] w-[96px] items-center justify-center rounded-full border border-[#262626]">
            <span className="text-[36px]">✉</span>
          </div>
          <h2 className="mt-6 text-[22px] font-semibold text-[#262626]">Your messages</h2>
          <p className="mt-3 text-[14px] leading-6 text-[#8e8e8e]">
            Select a conversation or start a new chat.
          </p>
        </div>
      </div>
    );
  }

  const heroDate = formatThreadDate(messages[0]?.createdAt ?? conversation.lastMessage?.createdAt ?? conversation.updatedAt);

  return (
    <section className="flex min-h-[760px] flex-col bg-white">
      <header className="flex items-center gap-3 border-b border-[#dbdbdb] px-5 py-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="mr-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-[#262626] transition hover:bg-[#f5f5f5] lg:hidden"
            aria-label="Back to conversations"
          >
            <ChevronLeft size={20} />
          </button>
        ) : null}
        <Avatar name={counterpart.fullName || counterpart.username} src={counterpart.avatarUrl} size="md" />
        <div>
          <p className="text-[16px] font-semibold text-[#262626]">{counterpart.username}</p>
          <p className="text-[13px] text-[#8e8e8e]">{counterpart.fullName || counterpart.username}</p>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="flex flex-col items-center pb-10 text-center">
            <Avatar name={counterpart.fullName || counterpart.username} src={counterpart.avatarUrl} size="xl" />
            <h2 className="mt-4 text-[18px] font-semibold text-[#262626]">{counterpart.username}</h2>
            <p className="mt-1 text-[14px] text-[#8e8e8e]">
              {counterpart.fullName || counterpart.username}
              {" · ICHgram"}
            </p>
            <Link
              to={profilePath(counterpart.username)}
              className="mt-5 inline-flex rounded-[10px] bg-[#efefef] px-5 py-2.5 text-[14px] font-semibold text-[#262626] transition hover:bg-[#e2e2e2]"
            >
              View profile
            </Link>
          </div>

          {heroDate ? (
            <p className="pb-8 text-center text-[12px] text-[#8e8e8e]">{heroDate}</p>
          ) : null}

          <div className="mx-auto flex max-w-[760px] flex-col gap-4">
            {messages.map((message) => {
              const mine = message.sender.id === currentUser.id;

              return (
                <div key={message.id} className={`flex items-end gap-3 ${mine ? "justify-end" : "justify-start"}`}>
                  {!mine ? (
                    <Avatar
                      name={message.sender.fullName || message.sender.username}
                      src={message.sender.avatarUrl}
                      size="sm"
                    />
                  ) : null}

                  <div
                    className={`max-w-[70%] rounded-[22px] px-4 py-3 text-[14px] leading-6 shadow-sm ${
                      mine
                        ? "bg-[linear-gradient(135deg,#2b5cff_0%,#7d12ff_100%)] text-white"
                        : "border border-[#d6d6d6] bg-[#e2e2e2] text-[#262626]"
                    }`}
                  >
                    {message.text}
                  </div>

                  {mine ? (
                    <Avatar
                      name={currentUser.fullName || currentUser.username}
                      src={currentUser.avatarUrl}
                      size="sm"
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={onSubmit} className="border-t border-[#dbdbdb] px-4 py-4">
          <div className="mx-auto max-w-[760px]">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Write message"
              aria-label="Write message"
              disabled={sending}
              className="h-[44px] w-full rounded-full border border-[#dbdbdb] px-5 text-[14px] text-[#262626] outline-none transition placeholder:text-[#8e8e8e] focus:border-[#c7c7c7]"
            />
          </div>
        </form>
      </div>
    </section>
  );
};
