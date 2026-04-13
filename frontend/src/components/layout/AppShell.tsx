import { useState } from "react";
import { LogOut } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { CreatePostComposer } from "../feed/CreatePostComposer";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

export const AppShell = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [composerOpen, setComposerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!user) {
    return null;
  }

  const requestRefresh = () => setRefreshKey((current) => current + 1);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <Sidebar user={user} onOpenComposer={() => setComposerOpen(true)} onLogout={handleLogout} />
      <MobileNav user={user} onLogout={handleLogout} />

      <div className="min-h-screen bg-white px-4 pb-28 pt-4 lg:pl-[220px] lg:pr-0">
        <div className="mx-auto max-w-[1200px]">
          <header className="mb-6 flex items-center justify-between border-b border-[#dbdbdb] bg-white px-1 pb-4 lg:hidden">
            <div>
              <p className="login-logo text-[32px] leading-none text-black">ICHGRAM</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#111111] px-4 py-2 text-sm font-semibold text-white"
            >
              <LogOut size={16} />
              Logout
            </button>
          </header>

          <Outlet
            context={{
              openComposer: () => setComposerOpen(true),
              refreshKey,
              requestRefresh,
            }}
          />
        </div>
      </div>

      <CreatePostComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onCreated={() => {
          setComposerOpen(false);
          requestRefresh();
          navigate("/");
        }}
      />
    </>
  );
};
