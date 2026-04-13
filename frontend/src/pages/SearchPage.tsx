import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usersApi } from "../api/services";
import { Avatar } from "../components/common/Avatar";
import { Loader } from "../components/common/Loader";
import { profilePath } from "../lib/routes";
import type { UserSummary } from "../types";

export const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSummary[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const loadHistory = async () => {
      const data = await usersApi.getSearchHistory();
      setHistory(data);
    };

    void loadHistory();
  }, []);

  useEffect(() => {
    const trimmed = deferredQuery.trim();

    if (!trimmed) {
      setResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        const data = await usersApi.search(trimmed);
        startTransition(() => setResults(data));
        await usersApi.saveSearchHistory(trimmed);
        setHistory((current) => [trimmed, ...current.filter((entry) => entry !== trimmed)].slice(0, 10));
      } finally {
        setLoading(false);
      }
    }, 320);

    return () => window.clearTimeout(timeout);
  }, [deferredQuery]);

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
      <div className="space-y-6">
        <div className="glass-panel rounded-[2rem] border border-white/70 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Discovery</p>
          <h1 className="mt-2 text-3xl font-semibold text-neutral-950">Search</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Real-time search with debounce, powered directly by the database.
          </p>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by username or name"
            className="mt-5 w-full rounded-[1.5rem] border border-neutral-200 bg-white/80 px-5 py-4 text-sm outline-none focus:border-neutral-900"
          />
        </div>

        {loading ? <Loader label="Searching users..." /> : null}

        {results.length ? (
          <div className="space-y-3">
            {results.map((user) => (
              <Link
                key={user.id}
                to={profilePath(user.username)}
                className="glass-panel flex items-center gap-4 rounded-[2rem] border border-white/70 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5"
              >
                <Avatar name={user.fullName} src={user.avatarUrl} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-neutral-950">{user.username}</p>
                  <p className="truncate text-sm text-neutral-500">{user.fullName}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : query.trim() && !loading ? (
          <div className="glass-panel rounded-[2rem] border border-white/70 p-8 text-sm text-neutral-500 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
            No users found for "{query}".
          </div>
        ) : null}
      </div>

      <aside className="glass-panel rounded-[2rem] border border-white/70 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold text-neutral-950">Search history</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {history.length ? (
            history.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setQuery(entry)}
                className="rounded-full bg-white px-4 py-2 text-sm text-neutral-600 shadow-sm ring-1 ring-neutral-200"
              >
                {entry}
              </button>
            ))
          ) : (
            <p className="text-sm text-neutral-500">Your history will appear after your first real searches.</p>
          )}
        </div>
      </aside>
    </section>
  );
};
