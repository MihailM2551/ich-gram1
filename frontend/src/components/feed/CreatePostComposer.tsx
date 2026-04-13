import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ImagePlus, X } from "lucide-react";
import { postApi } from "../../api/services";
import type { Post } from "../../types";
import { Button } from "../common/Button";

interface CreatePostComposerProps {
  open: boolean;
  onClose: () => void;
  onCreated: (post: Post) => void;
}

export const CreatePostComposer = ({ open, onClose, onCreated }: CreatePostComposerProps) => {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!open) {
      setCaption("");
      setFile(null);
      setError("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async () => {
    if (!file) {
      setError("Select an image for your post.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption);

    try {
      setSubmitting(true);
      setError("");
      const createdPost = await postApi.create(formData);
      onCreated(createdPost);
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        const message =
          typeof requestError.response?.data?.message === "string"
            ? requestError.response.data.message
            : "";
        setError(message || "Your post could not be published.");
        return;
      }

      setError("Your post could not be published.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-neutral-950/55 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[2rem] bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.26)] md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">Create</p>
            <h2 className="mt-2 text-3xl font-semibold text-neutral-950">Create a new post</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Your image is uploaded to cloud storage and then saved in the database.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-neutral-100 p-2 text-neutral-500">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr,0.9fr]">
          <label className="feed-image flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-neutral-300 p-6 text-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Post preview" className="h-full max-h-[420px] w-full rounded-[1.2rem] object-cover" />
            ) : (
              <>
                <ImagePlus size={36} className="text-neutral-500" />
                <p className="mt-4 text-base font-semibold text-neutral-900">Choose an image</p>
                <p className="mt-2 text-sm text-neutral-500">JPEG, PNG or WebP. No local storage on the server.</p>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>

          <div className="space-y-4">
            <div className="rounded-[1.5rem] bg-neutral-50 p-4">
              <label className="text-sm font-semibold text-neutral-900" htmlFor="caption">
                Caption
              </label>
              <textarea
                id="caption"
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="Write something memorable about this post..."
                rows={8}
                className="mt-3 w-full resize-none rounded-[1.2rem] border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 outline-none focus:border-neutral-900"
              />
            </div>

            {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSubmit} loading={submitting}>
                Publish
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
