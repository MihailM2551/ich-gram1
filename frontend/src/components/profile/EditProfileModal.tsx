import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { usersApi } from "../../api/services";
import type { AuthenticatedUser } from "../../types";
import { resolveAvatarSrc } from "../common/Avatar";
import { Button } from "../common/Button";

interface EditProfileModalProps {
  open: boolean;
  user: AuthenticatedUser;
  onClose: () => void;
  onUpdated: (user: AuthenticatedUser) => void;
}

export const EditProfileModal = ({ open, user, onClose, onUpdated }: EditProfileModalProps) => {
  const [username, setUsername] = useState(user.username);
  const [fullName, setFullName] = useState(user.fullName);
  const [bio, setBio] = useState(user.bio ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : resolveAvatarSrc(user.avatarUrl)),
    [file, user.avatarUrl],
  );

  useEffect(() => {
    if (!open) {
      setUsername(user.username);
      setFullName(user.fullName);
      setBio(user.bio ?? "");
      setFile(null);
      setError("");
    }
  }, [open, user]);

  useEffect(() => {
    return () => {
      if (file && preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [file, preview]);

  if (!open) {
    return null;
  }

  const handleSubmit = async () => {
    const payload = new FormData();
    payload.append("username", username);
    payload.append("fullName", fullName);
    payload.append("bio", bio);

    if (file) {
      payload.append("avatar", file);
    }

    try {
      setLoading(true);
      setError("");
      const nextUser = await usersApi.updateMe(payload);
      onUpdated(nextUser);
    } catch {
      setError("Your profile could not be updated.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-neutral-950/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.26)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Profile</p>
            <h2 className="mt-2 text-3xl font-semibold text-neutral-950">Edit profile</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-neutral-100 p-2 text-neutral-500">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[0.8fr,1.2fr]">
          <label className="feed-image flex cursor-pointer flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-neutral-300 p-6 text-center">
            <img src={preview} alt={fullName} className="h-44 w-44 rounded-full object-cover shadow-sm" />
            <p className="mt-4 text-sm font-semibold text-neutral-950">Change profile photo</p>
            <input type="file" accept="image/*" className="hidden" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </label>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-neutral-900">Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-neutral-900"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-neutral-900">Full name</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-neutral-900"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-neutral-900">Bio</span>
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={5}
                className="mt-2 w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-neutral-900"
              />
            </label>
            {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSubmit} loading={loading}>
                Save
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
