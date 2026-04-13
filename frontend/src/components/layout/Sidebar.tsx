import {
  Bell,
  Compass,
  House,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import type { AuthenticatedUser } from "../../types";
import { profilePath } from "../../lib/routes";
import { Avatar } from "../common/Avatar";
import { Button } from "../common/Button";

interface SidebarProps {
  user: AuthenticatedUser;
  onOpenComposer: () => void;
  onLogout: () => void;
}

const linkBase = "flex items-center gap-3 px-0 py-3 text-[14px] text-[#262626] transition";

export const Sidebar = ({ user, onOpenComposer, onLogout }: SidebarProps) => (
  <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] border-r border-[#dbdbdb] bg-white px-6 py-7 lg:flex lg:flex-col">
    <div>
      <p className="login-logo text-[34px] leading-none text-black">ICHGRAM</p>
    </div>

    <nav className="mt-10 space-y-1">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `${linkBase} ${isActive ? "font-semibold" : "font-normal"}`}
      >
        <House size={18} />
        Home
      </NavLink>
      <NavLink
        to="/search"
        className={({ isActive }) => `${linkBase} ${isActive ? "font-semibold" : "font-normal"}`}
      >
        <Search size={18} />
        Search
      </NavLink>
      <NavLink
        to="/explore"
        className={({ isActive }) => `${linkBase} ${isActive ? "font-semibold" : "font-normal"}`}
      >
        <Compass size={18} />
        Explore
      </NavLink>
      <NavLink
        to="/messages"
        className={({ isActive }) => `${linkBase} ${isActive ? "font-semibold" : "font-normal"}`}
      >
        <MessageCircle size={18} />
        Messages
      </NavLink>
      <NavLink
        to="/notifications"
        className={({ isActive }) => `${linkBase} ${isActive ? "font-semibold" : "font-normal"}`}
      >
        <Bell size={18} />
        Notifications
      </NavLink>
      <button type="button" className={`${linkBase} w-full font-normal`} onClick={onOpenComposer}>
        <PlusSquare size={18} />
        Create
      </button>
    </nav>

    <div className="mt-auto space-y-4">
      <NavLink
        to={profilePath(user.username)}
        className={({ isActive }) => `${linkBase} ${isActive ? "font-semibold" : "font-normal"}`}
      >
        <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
        Profile
      </NavLink>
      <Button
        variant="ghost"
        className="w-full justify-start rounded-none px-0 py-0 text-[14px] font-normal text-[#262626] shadow-none hover:bg-transparent"
        onClick={onLogout}
      >
        <LogOut size={18} className="mr-3" />
        Logout
      </Button>
    </div>
  </aside>
);
