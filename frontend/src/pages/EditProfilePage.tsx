import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import axios from "axios";
import { Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usersApi } from "../api/services";
import { resolveAvatarSrc } from "../components/common/Avatar";
import { useAuth } from "../context/AuthContext";

const footerLinks = ["Home", "Search", "Explore", "Messages", "Notifications", "Create"];

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    setUsername(user.username);
    setWebsite(user.website ?? "");
    setBio(user.bio ?? "");
  }, [user]);

  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : resolveAvatarSrc(user?.avatarUrl)),
    [file, user?.avatarUrl],
  );

  useEffect(() => {
    return () => {
      if (file && preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [file, preview]);

  if (!user) {
    return null;
  }

  const topCardText = bio.trim() || user.fullName || "Add a short bio for your profile.";
  const normalizedWebsite = website.trim();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = new FormData();
    payload.append("username", username);
    payload.append("fullName", user.fullName);
    payload.append("website", normalizedWebsite);
    payload.append("bio", bio);

    if (file) {
      payload.append("avatar", file);
    }

    try {
      setSaving(true);
      setError("");
      const nextUser = await usersApi.updateMe(payload);
      setUser(nextUser);
      navigate(`/profile/${nextUser.username}`);
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && typeof requestError.response?.data?.message === "string") {
        setError(requestError.response.data.message);
      } else {
        setError("Profile could not be updated.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="pb-12">
      <div className="mx-auto max-w-[980px] px-2 pt-2 sm:px-4 lg:px-6">
        <div className="mx-auto max-w-[560px]">
          <h1 className="text-[36px] font-semibold tracking-[-0.02em] text-[#111111]">Edit profile</h1>

          <form onSubmit={handleSubmit} className="mt-12 space-y-8">
            <div className="rounded-[22px] bg-[#f3f3f3] px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={preview}
                    alt={user.username}
                    className="h-[56px] w-[56px] rounded-full border border-[#dbdbdb] object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[18px] font-semibold text-[#262626]">{username || user.username}</p>
                    <p className="mt-1 line-clamp-2 max-w-[290px] text-[13px] leading-5 text-[#737373]">
                      {topCardText}
                    </p>
                  </div>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex h-[40px] min-w-[132px] items-center justify-center rounded-[10px] bg-[#0095f6] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1877f2]"
                  >
                    New photo
                  </button>
                </div>
              </div>
            </div>

            <label className="block">
              <span className="text-[14px] font-semibold text-[#262626]">Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-3 h-[44px] w-full rounded-[14px] border border-[#dbdbdb] bg-white px-4 text-[14px] text-[#262626] outline-none transition focus:border-[#b9b9b9]"
              />
            </label>

            <label className="block">
              <span className="text-[14px] font-semibold text-[#262626]">Website</span>
              <div className="relative mt-3">
                <Link2 size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#00376b]" />
                <input
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  placeholder="Add a website"
                  className="h-[44px] w-full rounded-[14px] border border-[#dbdbdb] bg-white pl-10 pr-4 text-[14px] font-medium text-[#00376b] outline-none transition placeholder:font-normal placeholder:text-[#8e8e8e] focus:border-[#b9b9b9]"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-[14px] font-semibold text-[#262626]">About</span>
              <div className="relative mt-3">
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={4}
                  maxLength={150}
                  className="min-h-[124px] w-full resize-none rounded-[14px] border border-[#dbdbdb] bg-white px-4 py-4 pr-20 text-[14px] leading-6 text-[#262626] outline-none transition focus:border-[#b9b9b9]"
                />
                <span className="absolute bottom-3 right-4 text-[12px] text-[#8e8e8e]">{bio.length} / 150</span>
              </div>
            </label>

            {error ? <p className="text-[14px] font-medium text-[#ed4956]">{error}</p> : null}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-[40px] w-full items-center justify-center rounded-[10px] bg-[#0095f6] px-6 text-[14px] font-semibold text-white transition hover:bg-[#1877f2] disabled:cursor-not-allowed disabled:opacity-70 sm:w-[246px]"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </form>

          <footer className="mt-28 hidden border-t border-[#dbdbdb] px-6 py-6 text-center text-[12px] text-[#8e8e8e] lg:block">
            <div className="flex flex-wrap items-center justify-center gap-8">
              {footerLinks.map((link) => (
                <span key={link}>{link}</span>
              ))}
            </div>
            <p className="mt-6">© 2024 ICHgram</p>
          </footer>
        </div>
      </div>
    </section>
  );
};
