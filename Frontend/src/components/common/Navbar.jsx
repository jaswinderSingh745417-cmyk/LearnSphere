import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { LayoutDashboard, LogOut, SquareUser, UserRound } from "lucide-react";
import { useUser } from "../../context/userContext";

const Navbar = () => {
  const { user, Logout } = useUser();
  const [open, setOpen] = useState(false);

  const navClass = ({ isActive }) =>
    `
    px-3 
    py-2
    rounded-lg
    text-sm
    font-medium
   
    ${
      isActive
        ? "text-primary  border-b-2 border-primary"
        : "text-text hover:text-primary hover:bg-text/5"
    }
    `;

  return (
    <nav className="w-full bg-surface/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo + Navigation */}
        <div className="flex items-center gap-10">
          <Link
            to="/"
            className="text-2xl font-bold text-primary flex items-center gap-2"
          >
            <span className="text-3xl">🎓</span> LearnSphere
          </Link>

          <div className="hidden md:flex gap-6">
            <NavLink className={navClass} to="/">
              Home
            </NavLink>
            <NavLink className={navClass} to="/courses">
              Courses
            </NavLink>
          </div>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 px-3 py-2 rounded-full border border-border hover:border-primary/50 transition-all duration-200 bg-surface/50 hover:bg-surface"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/30"
                    alt={user.fullName}
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <UserRound size={18} />
                  </div>
                )}
                <span className="text-text font-medium text-sm hidden sm:block">
                  {user.fullName}
                </span>
                <svg
                  className={`w-4 h-4 text-text transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {open && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-56 bg-surface border border-border rounded-xl shadow-xl p-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-2.5 text-text hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <SquareUser size={18} className="text-primary" />
                      <span className="text-sm font-medium">Profile</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-3 py-2.5 text-text hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <LayoutDashboard size={18} className="text-primary" />
                      <span className="text-sm font-medium">Dashboard</span>
                    </Link>

                    <div className="border-t border-border my-2" />

                    <button
                      onClick={() => {
                        Logout();
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-error hover:bg-error/10 hover:text-error-dark rounded-lg transition-colors"
                    >
                      <LogOut size={18} />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-text hover:text-primary transition-colors font-medium text-sm"
              >
                <UserRound size={18} />
                <span className="hidden sm:inline">Login</span>
              </Link>

              <Link
                to="/register"
                className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden border-t border-border">
        <div className="flex flex-col gap-1 px-6 py-3">
          <NavLink
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-text hover:bg-text/5"
              }`
            }
            to="/"
            onClick={() => setOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-text hover:bg-text/5"
              }`
            }
            to="/courses"
            onClick={() => setOpen(false)}
          >
            Courses
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-text hover:bg-text/5"
              }`
            }
            to="/about"
            onClick={() => setOpen(false)}
          >
            About
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-text hover:bg-text/5"
              }`
            }
            to="/contact"
            onClick={() => setOpen(false)}
          >
            Contact
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
