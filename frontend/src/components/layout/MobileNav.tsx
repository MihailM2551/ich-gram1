import { Bell, Compass, House, LogOut, MessageCircle, Search, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { AuthenticatedUser } from "../../types";
import { profilePath } from "../../lib/routes";

interface MobileNavProps {
  user: AuthenticatedUser;
  onLogout: () => void;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition ${
    isActive ? "bg-neutral-950 text-white" : "text-neutral-600"
  }`;

export const MobileNav = ({ user, onLogout }: MobileNavProps) => (
  <nav className="glass-panel fixed inset-x-3 bottom-3 z-30 flex items-center gap-1 rounded-[1.8rem] border border-white/70 p-2 shadow-[0_18px_50px_rgba(15,23,42,0.14)] lg:hidden">
    <NavLink to="/" end className={linkClass}>
      <House size={18} />
      Home
    </NavLink>
    <NavLink to="/search" className={linkClass}>
      <Search size={18} />
      Search
    </NavLink>
    <button
      type="button"
      onClick={onLogout}
      className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold text-neutral-600"
    >
      <LogOut size={18} />
      Logout
    </button>
    <NavLink to="/explore" className={linkClass}>
      <Compass size={18} />
      Explore
    </NavLink>
    <NavLink to="/messages" className={linkClass}>
      <MessageCircle size={18} />
      Chat
    </NavLink>
    <NavLink to="/notifications" className={linkClass}>
      <Bell size={18} />
      Alerts
    </NavLink>
    <NavLink to={profilePath(user.username)} className={linkClass}>
      <UserRound size={18} />
      Profile
    </NavLink>
  </nav>
);
