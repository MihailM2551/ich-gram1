import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { postApi } from "../api/services";
import { Loader } from "../components/common/Loader";
import { PostDetailModal } from "../components/feed/PostDetailModal";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { profilePath } from "../lib/routes";
import type { Post } from "../types";

export const ExplorePage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const loadExplore = useCallback(async (nextPage: number, reset = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await postApi.explore(nextPage);
      setPosts((current) =>
        reset ? data.items : [...current, ...data.items.filter((item) => !current.some((post) => post.id === item.id))],
      );
      setHasMore(data.hasMore);
      setPage(nextPage + 1);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadExplore(1, true);
  }, [loadExplore]);

  const handlePostChange = (updatedPost: Post) => {
    setPosts((current) => current.map((item) => (item.id === updatedPost.id ? updatedPost : item)));
    setSelectedPost(updatedPost);
  };

  const sentinelRef = useInfiniteScroll(hasMore && !loading && !loadingMore, () => {
    void loadExplore(page);
  });

  if (loading) {
    return <Loader label="Preparing Explore..." />;
  }

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-[2rem] border border-white/70 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
        <h1 className="mt-2 text-3xl font-semibold text-neutral-950">Explore</h1>
      </div>

      <div className="masonry-grid">
        {posts.map((post, index) => (
          <article
            key={post.id}
            className="masonry-item group overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]"
          >
            <div
              className={`feed-image relative overflow-hidden ${
                index % 5 === 0 ? "aspect-[4/6]" : index % 3 === 0 ? "aspect-square" : "aspect-[4/5]"
              }`}
            >
              <button type="button" onClick={() => setSelectedPost(post)} className="block h-full w-full text-left">
                <img
                  src={post.image.url}
                  alt={post.caption}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </button>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-5 text-white">
                <Link
                  to={profilePath(post.user.username)}
                  onClick={(event) => event.stopPropagation()}
                  className="relative z-10 text-sm font-semibold hover:underline"
                >
                  {post.user.username}
                </Link>
                <p className="mt-1 line-clamp-2 text-xs text-white/80">{post.caption}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div ref={sentinelRef} className="h-1" />
      {loadingMore ? <Loader label="Loading more posts..." /> : null}

      <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} onChange={handlePostChange} />
    </section>
  );
};
