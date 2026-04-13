import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { messagesApi, usersApi } from "../api/services";
import { useAuth } from "../context/AuthContext";
import { formatCompactNumber } from "../lib/format";
import type { AppShellOutletContext, ProfilePayload } from "../types";
import { EmptyState } from "../components/common/EmptyState";
import { Loader } from "../components/common/Loader";
import { resolveAvatarSrc } from "../components/common/Avatar";
import { PostDetailModal } from "../components/feed/PostDetailModal";
import type { Post } from "../types";

const profileLinks = ["Home", "Search", "Explore", "Messages", "Notifications", "Create"];

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user } = useAuth();
  const { refreshKey, requestRefresh } = useOutletContext<AppShellOutletContext>();
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const targetUsername = username ?? user?.username ?? "";

  useEffect(() => {
    if (!targetUsername) {
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        const payload = await usersApi.profile(targetUsername);
        setProfile(payload);
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [targetUsername, refreshKey]);

  const handleFollowToggle = async () => {
    if (!profile || profile.user.isCurrentUser) {
      return;
    }

    try {
      setFollowLoading(true);
      const updatedUser = await usersApi.toggleFollow(profile.user.id);
      setProfile((current) => (current ? { ...current, user: updatedUser } : current));
      requestRefresh();
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessageStart = async () => {
    if (!profile || profile.user.isCurrentUser) {
      return;
    }

    try {
      setMessageLoading(true);
      const conversation = await messagesApi.createConversation(profile.user.id);
      navigate("/messages", {
        state: {
          conversationId: conversation.id,
        },
      });
    } finally {
      setMessageLoading(false);
    }
  };

  const handlePostChange = (updatedPost: Post) => {
    setProfile((current) =>
      current
        ? {
            ...current,
            posts: current.posts.map((item) => (item.id === updatedPost.id ? updatedPost : item)),
          }
        : current,
    );
    setSelectedPost(updatedPost);
  };

  if (loading) {
    return <Loader label="Loading profile..." />;
  }

  if (!profile) {
    return (
      <EmptyState
        title="Profile not found"
        description="Check the username and try again."
      />
    );
  }

  const ownProfile = profile.user.isCurrentUser;
  const displayName =
    profile.user.fullName && profile.user.fullName !== profile.user.username ? profile.user.fullName : "";
  const bioLines = (profile.user.bio || "").split("\n").map((line) => line.trim()).filter(Boolean);
  const website = profile.user.website?.trim();
  const websiteHref = website ? (/^https?:\/\//.test(website) ? website : `https://${website}`) : "";

  return (
    <section className="pb-12">
      <div className="mx-auto max-w-[900px] px-2 pt-2 sm:px-4 lg:px-6">
        <div className="grid gap-10 border-b border-[#dbdbdb] pb-12 md:grid-cols-[180px,minmax(0,1fr)] md:gap-10">
          <div className="flex justify-center md:justify-start">
            <div className="flex h-[150px] w-[150px] items-center justify-center rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#feda75_0deg,#fa7e1e_90deg,#d62976_180deg,#962fbf_270deg,#4f5bd5_360deg)] p-[3px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white p-[8px]">
                <img
                  src={resolveAvatarSrc(profile.user.avatarUrl)}
                  alt={profile.user.username}
                  className="h-full w-full rounded-full border border-[#dbdbdb] object-cover"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <h1 className="text-[29px] font-normal text-[#262626]">{profile.user.username}</h1>

              {ownProfile ? (
                <button
                  type="button"
                  onClick={() => navigate("/profile/edit")}
                  className="inline-flex h-[32px] min-w-[140px] items-center justify-center rounded-[8px] bg-[#efefef] px-4 text-[14px] font-semibold text-[#262626] transition hover:bg-[#e2e2e2]"
                >
                  Edit profile
                </button>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleFollowToggle()}
                    disabled={followLoading}
                    className="inline-flex h-[32px] min-w-[120px] items-center justify-center rounded-[8px] bg-[#0095f6] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1877f2] disabled:opacity-60"
                  >
                    {followLoading ? "Saving..." : profile.user.isFollowing ? "Following" : "Follow"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleMessageStart()}
                    disabled={messageLoading}
                    className="inline-flex h-[32px] min-w-[130px] items-center justify-center rounded-[8px] bg-[#efefef] px-4 text-[14px] font-semibold text-[#262626] transition hover:bg-[#e2e2e2] disabled:opacity-60"
                  >
                    {messageLoading ? "Opening..." : "Message"}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-x-12 gap-y-3 text-[16px] text-[#262626]">
              <span>
                <strong className="font-semibold">{formatCompactNumber(profile.posts.length)}</strong>
                {" posts"}
              </span>
              <span>
                <strong className="font-semibold">{formatCompactNumber(profile.user.followersCount)}</strong>
                {" followers"}
              </span>
              <span>
                <strong className="font-semibold">{formatCompactNumber(profile.user.followingCount)}</strong>
                {" following"}
              </span>
            </div>

            <div className="mt-4 max-w-[520px] space-y-1 text-[13px] leading-5 text-[#262626]">
              {displayName ? <p className="font-semibold">{displayName}</p> : null}
              {bioLines.length ? (
                bioLines.map((line) => (
                  <p key={line}>{line}</p>
                ))
              ) : (
                <p className="text-[#8e8e8e]">No bio yet.</p>
              )}
              {website ? (
                <a href={websiteHref} target="_blank" rel="noreferrer" className="font-semibold text-[#00376b]">
                  {website}
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {profile.posts.length ? (
          <div className="mx-auto mt-10 grid max-w-[730px] grid-cols-2 gap-[5px] sm:grid-cols-3 sm:gap-[5px]">
            {profile.posts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedPost(post)}
                className="group relative aspect-square overflow-hidden bg-[#fafafa] text-left"
              >
                <img
                  src={post.image.url}
                  alt={post.caption || `${profile.user.username} post`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
                  <div className="rounded-full bg-white/90 px-4 py-2 text-[13px] font-semibold text-[#262626] shadow-sm">
                    {formatCompactNumber(post.likesCount)} likes
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState
              title="No posts yet"
              description={ownProfile ? "Publish your first post to fill your profile." : "This user has not published anything yet."}
            />
          </div>
        )}

        <footer className="mt-20 hidden border-t border-[#dbdbdb] px-6 py-6 text-center text-[12px] text-[#8e8e8e] lg:block">
          <div className="flex flex-wrap items-center justify-center gap-8">
            {profileLinks.map((link) => (
              <span key={link}>{link}</span>
            ))}
          </div>
          <p className="mt-6">© 2024 ICHgram</p>
        </footer>
      </div>
      <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} onChange={handlePostChange} />
    </section>
  );
};
