import { useState, type FormEvent } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { commentsApi, likesApi } from "../../api/services";
import { useAuth } from "../../context/AuthContext";
import { formatRelativeTime } from "../../lib/format";
import { profilePath } from "../../lib/routes";
import type { Comment, Post } from "../../types";
import { Avatar } from "../common/Avatar";

interface PostCardProps {
  post: Post;
  onChange: (post: Post) => void;
}

const numberFormatter = new Intl.NumberFormat("en-US");

export const PostCard = ({ post, onChange }: PostCardProps) => {
  const { user } = useAuth();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentValue, setCommentValue] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const loadComments = async (toggle = true) => {
    if (commentsLoading) {
      return;
    }

    if (commentsLoaded) {
      if (toggle) {
        setCommentsOpen((current) => !current);
      } else {
        setCommentsOpen(true);
      }
      return;
    }

    try {
      setCommentsLoading(true);
      const data = await commentsApi.list(post.id);
      setComments(data.items);
      setCommentsLoaded(true);
      setCommentsOpen(true);
    } finally {
      setCommentsLoading(false);
    }
  };

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
      setComments((current) => [response.comment, ...current]);
      setCommentValue("");
      setCommentsLoaded(true);
      setCommentsOpen(true);
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
    <article className="border-b border-[#dbdbdb] pb-8">
      <div className="flex items-center justify-between gap-3 pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link to={profilePath(post.user.username)} className="shrink-0">
            <Avatar name={post.user.fullName} src={post.user.avatarUrl} size="sm" />
          </Link>
          <div className="flex min-w-0 items-center gap-2 text-[12px] text-[#262626]">
            <Link to={profilePath(post.user.username)} className="truncate font-semibold hover:opacity-70">
              {post.user.username}
            </Link>
            <span className="text-[#8e8e8e]">•</span>
            <p className="truncate text-[#8e8e8e]">{formatRelativeTime(post.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="aspect-square w-full overflow-hidden bg-[#f4f4f4]">
        <img
          src={post.image.url}
          alt={post.caption || post.user.username}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void handleToggleLike()}
              className={`${post.likedByMe ? "text-[#ed4956]" : "text-[#262626]"} transition hover:opacity-70`}
            >
              <Heart size={22} className={post.likedByMe ? "fill-current" : ""} />
            </button>
            <button
              type="button"
              onClick={() => void loadComments()}
              className="text-[#262626] transition hover:opacity-70"
            >
              <MessageCircle size={22} />
            </button>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="text-[#262626] transition hover:opacity-70"
            >
              <Send size={21} />
            </button>
          </div>
        </div>

        <p className="mt-2 text-[12px] font-semibold text-[#262626]">
          {numberFormatter.format(post.likesCount)} likes
        </p>

        <p className="mt-1 text-[12px] leading-5 text-[#262626]">
          <Link to={profilePath(post.user.username)} className="mr-1 font-semibold hover:opacity-70">
            {post.user.username}
          </Link>
          {post.caption || ""}
        </p>

        {post.commentsCount > 0 ? (
          <button
            type="button"
            onClick={() => void loadComments(false)}
            className="mt-1 text-[12px] text-[#8e8e8e]"
          >
            View all comments ({numberFormatter.format(post.commentsCount)})
          </button>
        ) : null}

        {commentsOpen ? (
          <div className="mt-3 space-y-3">
            {commentsLoading ? (
              <p className="text-[12px] text-[#8e8e8e]">Loading comments...</p>
            ) : comments.length ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Link to={profilePath(comment.user.username)} className="shrink-0">
                      <Avatar name={comment.user.fullName} src={comment.user.avatarUrl} size="sm" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-[12px]">
                        <Link to={profilePath(comment.user.username)} className="font-semibold text-[#262626] hover:opacity-70">
                          {comment.user.username}
                        </Link>
                        <span className="text-[#8e8e8e]">{formatRelativeTime(comment.createdAt)}</span>
                        {comment.user.id === user?.id ? (
                          <button
                            type="button"
                            onClick={() => void handleDeleteComment(comment.id)}
                            className="text-[#ed4956]"
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-1 text-[12px] leading-5 text-[#262626]">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-[#8e8e8e]">No comments yet.</p>
            )}

            <form onSubmit={handleCommentSubmit} className="flex items-center gap-3 border-t border-[#efefef] pt-3">
              <input
                value={commentValue}
                onChange={(event) => setCommentValue(event.target.value)}
                placeholder="Add a comment..."
                className="min-w-0 flex-1 border-0 bg-transparent px-0 text-[12px] text-[#262626] outline-none placeholder:text-[#8e8e8e]"
              />
              <button
                type="submit"
                disabled={commentSubmitting || !commentValue.trim()}
                className="text-[12px] font-semibold text-[#0095f6] disabled:opacity-50"
              >
                {commentSubmitting ? "Posting..." : "Post"}
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </article>
  );
};
