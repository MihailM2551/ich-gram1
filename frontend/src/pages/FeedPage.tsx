import { Check } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { postApi } from "../api/services";
import { EmptyState } from "../components/common/EmptyState";
import { Loader } from "../components/common/Loader";
import { PostCard } from "../components/feed/PostCard";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import type { AppShellOutletContext, Post } from "../types";

export const FeedPage = () => {
  const { openComposer, refreshKey } = useOutletContext<AppShellOutletContext>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPosts = useCallback(async (nextPage: number, reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await postApi.feed(nextPage);
      setPosts((current) =>
        reset
          ? response.items
          : [
              ...current,
              ...response.items.filter((item) => !current.some((post) => post.id === item.id)),
            ],
      );
      setHasMore(response.hasMore);
      setPage(nextPage + 1);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts(1, true);
  }, [loadPosts, refreshKey]);

  const sentinelRef = useInfiniteScroll(hasMore && !loading && !loadingMore, () => {
    void loadPosts(page);
  });

  const updatePost = (nextPost: Post) => {
    setPosts((current) => current.map((item) => (item.id === nextPost.id ? nextPost : item)));
  };

  if (loading) {
    return <Loader label="Loading feed..." />;
  }

  return (
    <section className="mx-auto max-w-[1080px] pb-10 pt-2">
      {posts.length ? (
        <>
          <div className="grid gap-x-8 gap-y-10 lg:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onChange={updatePost} />
            ))}
          </div>

          <div ref={sentinelRef} className="h-1" />
          {loadingMore ? <Loader label="Loading more posts..." /> : null}

          {!hasMore ? (
            <div className="flex flex-col items-center px-4 pb-10 pt-14 text-center">
              <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full border border-[#ff5f9e]">
                <Check size={28} className="text-[#ff5f9e]" />
              </div>
              <p className="mt-5 text-[22px] font-medium text-[#262626]">You've seen all the updates</p>
              <p className="mt-1 text-sm text-[#8e8e8e]">You have viewed all new publications</p>

              <div className="mt-14 hidden items-center justify-center gap-8 text-[11px] text-[#8e8e8e] md:flex">
                <span>Home</span>
                <span>Search</span>
                <span>Explore</span>
                <span>Messages</span>
                <span>Notifications</span>
                <span>Create</span>
              </div>
              <p className="mt-6 hidden text-[10px] text-[#b3b3b3] md:block">© 2024 ICHgram</p>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState
          title="No posts yet"
          description="Share your first post to get started."
          actionLabel="Create post"
          onAction={openComposer}
        />
      )}
    </section>
  );
};
