import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Heart, MessageCircle, Send, X } from "lucide-react";
import { Link } from "react-router-dom";
import { commentsApi, likesApi } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import { formatRelativeTime } from "../../lib/format";
import { profilePath } from "../../lib/routes";
import type { Comment, Post } from "../../types";
import { Avatar } from "../common/Avatar";

interface PostDetailModalProps {
  post: Post | null;
  onClose: () => void;
  onChange: (post: Post) => void;
}

const numberFormatter = new Intl.NumberFormat("en-US");

export const PostDetailModal = ({ post, onClose, onChange }: PostDetailModalProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentValue, setCommentValue] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    if (!post) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [post]);

  useEffect(() => {
    if (!post) {
      setComments([]);
      setCommentValue("");
      return;
    }

    const loadComments = async () => {
      try {
        setCommentsLoading(true);
        const response = await commentsApi.list(post.id);
        setComments(
          [...response.items].sort(
            (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
          ),
        );
      } finally {
        setCommentsLoading(false);
      }
    };

    void loadComments();
  }, [post]);

  const commentItems = useMemo(() => comments, [comments]);

  if (!post) {
    return null;
  }

  const handleToggleLike = async () => {
    const updatedPost = await likesApi.toggle(post.id);
    onChange(updatedPost);
  };

  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!commentValue.trim()) {
      return;
    }

    try {
      setCommentSubmitting(true);
      const response = await commentsApi.create(post.id, { text: commentValue.trim() });
      setComments((current) => [...current, response.comment]);
      setCommentValue("");
      onChange(response.post);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const response = await commentsApi.remove(post.id, commentId);
    setComments((current) => current.filter((item) => item.id !== commentId));
    onChange(response.post);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 py-6" onClick={onClose}>
      <div
        className="relative flex max-h-[92vh] w-full max-w-[1120px] overflow-hidden rounded-[4px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white transition hover:bg-black/50"
          aria-label="Close post"
        >
          <X size={18} />
        </button>

        <div className="hidden min-h-[680px] flex-1 bg-[#111111] md:flex md:items-center md:justify-center">
          <img src={post.image.url} alt={post.caption || post.user.username} className="max-h-[92vh] w-full object-contain" />
        </div>

        <section className="flex w-full max-w-[420px] flex-col bg-white md:w-[420px]">
          <header className="flex items-center gap-3 border-b border-[#dbdbdb] px-4 py-3">
            <Link to={profilePath(post.user.username)} className="shrink-0">
              <Avatar name={post.user.fullName || post.user.username} src={post.user.avatarUrl} size="sm" />
            </Link>
            <Link to={profilePath(post.user.username)} className="text-[14px] font-semibold text-[#262626] hover:opacity-70">
              {post.user.username}
            </Link>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="flex gap-3 border-b border-[#efefef] px-4 py-4">
              <Link to={profilePath(post.user.username)} className="shrink-0">
                <Avatar name={post.user.fullName || post.user.username} src={post.user.avatarUrl} size="sm" />
              </Link>
              <div className="min-w-0 flex-1 text-[14px] leading-6 text-[#262626]">
                <p>
                  <Link to={profilePath(post.user.username)} className="mr-2 font-semibold hover:opacity-70">
                    {post.user.username}
                  </Link>
                  <span className="whitespace-pre-line break-words">{post.caption || ""}</span>
                </p>
                <p className="mt-1 text-[12px] uppercase tracking-[0.02em] text-[#8e8e8e]">
                  {formatRelativeTime(post.createdAt)}
                </p>
              </div>
            </div>

            <div className="px-4 py-3">
              {commentsLoading ? (
                <p className="text-[13px] text-[#8e8e8e]">Loading comments...</p>
              ) : commentItems.length ? (
                <div className="space-y-4">
                  {commentItems.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Link to={profilePath(comment.user.username)} className="shrink-0">
                        <Avatar name={comment.user.fullName || comment.user.username} src={comment.user.avatarUrl} size="sm" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] leading-6 text-[#262626]">
                          <Link
                            to={profilePath(comment.user.username)}
                            className="mr-2 font-semibold hover:opacity-70"
                          >
                            {comment.user.username}
                          </Link>
                          <span className="break-words">{comment.text}</span>
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-[12px] text-[#8e8e8e]">
                          <span>{formatRelativeTime(comment.createdAt)}</span>
                          {comment.user.id === user?.id ? (
                            <button
                              type="button"
                              onClick={() => void handleDeleteComment(comment.id)}
                              className="font-semibold text-[#8e8e8e] transition hover:text-[#262626]"
                            >
                              Delete
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[#8e8e8e]">No comments yet.</p>
              )}
            </div>
          </div>

          <div className="border-t border-[#dbdbdb]">
            <div className="flex items-center gap-4 px-4 pb-2 pt-3 text-[#262626]">
              <button type="button" onClick={() => void handleToggleLike()} className="transition hover:opacity-70">
                <Heart size={24} className={post.likedByMe ? "fill-[#ed4956] text-[#ed4956]" : ""} />
              </button>
              <button type="button" className="transition hover:opacity-70">
                <MessageCircle size={24} />
              </button>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="transition hover:opacity-70"
              >
                <Send size={22} />
              </button>
            </div>

            <div className="px-4 pb-3">
              <p className="text-[14px] font-semibold text-[#262626]">
                {numberFormatter.format(post.likesCount)} likes
              </p>
              <p className="mt-1 text-[12px] text-[#8e8e8e]">{formatRelativeTime(post.createdAt)}</p>
            </div>

            <form onSubmit={handleCommentSubmit} className="flex items-center gap-3 border-t border-[#dbdbdb] px-4 py-3">
              <input
                value={commentValue}
                onChange={(event) => setCommentValue(event.target.value)}
                placeholder="Add comment"
                className="min-w-0 flex-1 border-0 bg-transparent text-[14px] text-[#262626] outline-none placeholder:text-[#8e8e8e]"
              />
              <button
                type="submit"
                disabled={commentSubmitting || !commentValue.trim()}
                className="text-[14px] font-semibold text-[#0095f6] disabled:opacity-50"
              >
                {commentSubmitting ? "Posting..." : "Send"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};
