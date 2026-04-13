import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { notificationsApi } from "../api/services";
import { Avatar } from "../components/common/Avatar";
import { Loader } from "../components/common/Loader";
import { profilePath } from "../lib/routes";
import type { NotificationItem } from "../types";

const notificationText: Record<NotificationItem["type"], string> = {
  like: "liked your photo.",
  comment: "commented on your photo.",
  follow: "started following you.",
  message: "sent you a message.",
};

const formatNotificationTime = (dateString: string) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.max(Math.floor(diffMs / (1000 * 60)), 0);

  if (minutes < 1) {
    return "now";
  }

  if (minutes < 60) {
    return `${minutes} m`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} h`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} d`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    return `${weeks} wk`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} mo`;
  }

  const years = Math.floor(days / 365);
  return `${years} y`;
};

export const NotificationsPage = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await notificationsApi.list();
        setItems(data);
      } finally {
        setLoading(false);
      }
    };

    void loadNotifications();
  }, []);

  const handleRead = async (notificationId: string) => {
    const updated = await notificationsApi.markRead(notificationId);
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  };

  return (
    <section className="max-w-[620px] border-l border-[#dbdbdb] bg-white px-4 pb-8 pt-4 sm:px-6 lg:min-h-[calc(100vh-32px)]">
      <header>
        <h1 className="text-[36px] font-semibold tracking-[-0.03em] text-[#111111]">Notifications</h1>
        <p className="mt-5 text-[18px] font-semibold text-[#111111]">New</p>
      </header>

      {loading ? <Loader label="Loading notifications..." /> : null}

      {!loading && !items.length ? (
        <div className="py-8 text-[14px] text-[#8e8e8e]">No notifications yet.</div>
      ) : null}

      {!loading ? (
        <div className="mt-4 space-y-1">
          {items.map((item) => (
            <Link
              key={item.id}
              to={profilePath(item.actor.username)}
              onClick={() => void handleRead(item.id)}
              className="flex items-center gap-3 rounded-[12px] px-2 py-3 transition hover:bg-[#fafafa]"
            >
              <Avatar name={item.actor.fullName || item.actor.username} src={item.actor.avatarUrl} size="md" />

              <div className="min-w-0 flex-1 text-[15px] leading-5 text-[#262626]">
                <p>
                  <span className="font-semibold">{item.actor.username}</span>
                  {" "}
                  {notificationText[item.type]}
                  {" "}
                  <span className="text-[#8e8e8e]">{formatNotificationTime(item.createdAt)}</span>
                </p>
              </div>

              {item.post?.image.url ? (
                <img
                  src={item.post.image.url}
                  alt="Post preview"
                  className="h-11 w-11 rounded-[8px] object-cover"
                />
              ) : (
                <div className="h-11 w-11 shrink-0" />
              )}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
};
