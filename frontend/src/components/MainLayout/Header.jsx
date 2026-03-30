import React from "react";
import {
  Menu,
  Target,
  User,
  LogOut,
  PenTool,
  Mic2,
  Zap,
  GraduationCap
} from "lucide-react";

import { Link } from "react-router-dom";
import useUserUsage from "../../hooks/MainLayout/useUserUsage";

/* ================================
   QUOTA CARD
================================ */

const QuotaCard = ({
  icon,
  title,
  value,
  color
}) => {

  const colorMap = {
    blue: "text-blue-600 bg-blue-50",
    pink: "text-pink-600 bg-pink-50",
    purple: "text-purple-600 bg-purple-50",
    indigo: "text-indigo-600 bg-indigo-50"
  };

  return (
    <div
      className="
      flex items-center gap-3
      px-4 py-2
      rounded-xl
      bg-white
      border border-slate-200
      shadow-sm
      "
    >

      <div
        className={`
        w-9 h-9
        rounded-lg
        flex items-center
        justify-center
        ${colorMap[color]}
        `}
      >

        {icon &&
          React.createElement(
            icon,
            {
              size: 18
            }
          )
        }

      </div>

      <div>

        <p
          className="
          text-[10px]
          uppercase
          text-slate-400
          font-bold
          tracking-wide
          "
        >
          {title}
        </p>

        <div
          className="
          flex items-center gap-1
          "
        >

          <span
            className="
            text-sm
            font-bold
            text-slate-700
            "
          >
            {value}
          </span>

          <Zap
            size={12}
            className="text-yellow-500"
          />

        </div>

      </div>

    </div>
  );
};


/* ================================
   HEADER
================================ */

const Header = ({
  pageTitle,
  sidebarOpen,
  setSidebarOpen,
  profileOpen,
  setProfileOpen,
  profileRef,
  user,
  loadingUser,
  handleLogout
}) => {

  const { usage } = useUserUsage();

  const targetBand =
    user?.target_band || 6.5;

  return (
    <header
      className="
      h-20
      bg-sky-50
      border-b border-slate-200
      flex items-center justify-between
      px-6
      sticky top-0 z-30
      "
    >

      {/* LEFT */}

      <div className="
        flex items-center gap-6
      ">

        {/* MOBILE MENU */}

        <button
          className="
          md:hidden
          p-2
          rounded-lg
          hover:bg-sky-100
          "
          onClick={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
        >
          <Menu size={20} />
        </button>

        {/* PAGE TITLE */}

        <h1
          className="
          text-lg
          font-bold
          text-slate-800
          "
        >
          {pageTitle}
        </h1>

        {/* TARGET + QUOTAS */}

        {!loadingUser && (

          <div
            className="
            hidden md:flex
            items-center gap-4
            border-l border-slate-200
            pl-6
            "
          >

            <QuotaCard
              icon={Target}
              title="Target"
              value={`Band ${targetBand}`}
              color="blue"
            />

            <QuotaCard
              icon={GraduationCap}
              title="Mock Exam"
              value={
                usage
                  ? `${usage.exam_used}/${usage.exam_limit}`
                  : "--/--"
              }
              color="indigo"
            />

            <QuotaCard
              icon={PenTool}
              title="Writing"
              value={
                usage
                  ? `${usage.writing_used}/${usage.writing_limit}`
                  : "--/--"
              }
              color="pink"
            />

            <QuotaCard
              icon={Mic2}
              title="Speaking"
              value={
                usage
                  ? `${usage.speaking_used}/${usage.speaking_limit}`
                  : "--/--"
              }
              color="purple"
            />

          </div>

        )}

      </div>

      {/* RIGHT PROFILE */}

      <div
        className="
        flex items-center gap-4 relative
        "
        ref={profileRef}
      >

        {/* PROFILE INFO */}

        <div
          className="
          hidden sm:block text-right
          "
        >

          <p
            className="
            text-sm
            font-semibold
            text-slate-800
            "
          >
            {user?.full_name}
          </p>

          <p
            className="
            text-xs
            text-blue-500
            uppercase
            font-bold
            "
          >
            IELTS Student
          </p>

        </div>

        {/* AVATAR */}

        <button
          onClick={() =>
            setProfileOpen(
              !profileOpen
            )
          }
          className="
          w-10 h-10
          rounded-full
          bg-blue-500
          text-white
          flex items-center
          justify-center
          font-bold
          shadow
          "
        >

          {user?.avatar_url ? (

            <img
              src={user.avatar_url}
              alt="avatar"
              className="
              w-full h-full
              object-cover
              rounded-full
              "
            />

          ) : (

            user?.full_name
              ?.charAt(0)
              .toUpperCase()

          )}

        </button>

        {/* DROPDOWN */}

        {profileOpen && (

          <div
            className="
            absolute
            right-0
            top-14
            w-60
            bg-white
            border border-slate-200
            rounded-xl
            shadow-lg
            "
          >

            <div
              className="
              p-4
              border-b border-slate-200
              "
            >

              <p
                className="
                text-sm
                font-semibold
                text-slate-900
                "
              >
                {user?.full_name}
              </p>

              <p
                className="
                text-xs
                text-slate-500
                "
              >
                {user?.email}
              </p>

            </div>

            <div className="p-2">

              <Link
                to="/profile"
                onClick={() =>
                  setProfileOpen(false)
                }
                className="
                flex items-center gap-2
                px-3 py-2
                text-sm
                rounded-lg
                hover:bg-sky-50
                "
              >
                <User size={16} />
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="
                w-full
                flex items-center gap-2
                px-3 py-2
                text-sm
                text-red-600
                rounded-lg
                hover:bg-red-50
                "
              >
                <LogOut size={16} />
                Sign out
              </button>

            </div>

          </div>

        )}

      </div>

    </header>
  );
};

export default Header;