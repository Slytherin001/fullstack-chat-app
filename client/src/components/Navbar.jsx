import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import {
  Bell,
  CirclePlus,
  KeyRound,
  LogOut,
  MessageSquare,
  Settings,
} from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <>
      <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="flex items-center gap-2.5 hover:opacity-80 transition-all"
              >
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-lg font-bold">Let's Chat</h1>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                className={`btn btn-sm gap-2 transition-colors`}
              >
                <Settings className="size-4" />
                <span className="hidden sm:inline">Settings</span>
              </Link>

              {authUser && (
                <>
                  <Link to="/profile" className={`btn btn-sm gap-2`}>
                    <div className="relative mx-auto lg:mx-0">
                      <img
                        src={authUser.profilePic || "/avatar.png"}
                        alt={authUser.fullName}
                        className="size-8 object-cover rounded-full"
                      />
                      {authUser && (
                        <span
                          className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 
               rounded-full ring-2 ring-zinc-900"
                        />
                      )}
                    </div>
                    <span className="hidden sm:inline">
                      {authUser?.fullName}
                    </span>
                  </Link>

                  <Link
                    onClick={logout}
                    className={`btn btn-sm gap-2 transition-colors-red bg-red-500`}
                  >
                    <LogOut className="size-4 text-white" />
                    <span className="hidden sm:inline text-white">Logout</span>
                  </Link>
                </>
              )}
              {!authUser && (
                <>
                  <Link
                    to="/login"
                    className={`btn btn-sm gap-2 transition-colors`}
                  >
                    <KeyRound className="size-4" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    className={`btn btn-sm gap-2 transition-colors`}
                  >
                    <CirclePlus className="size-4" />
                    <span className="hidden sm:inline">Sign up</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
