import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Target, ArrowRight } from "lucide-react";
import authApi from "../api/authApi";

const modes = [
  {
    id: "IELTS",
    title: "IELTS Preparation",
    description:
      "Master Listening, Speaking, Reading and Writing with a structured academic learning roadmap.",
    icon: BookOpen,
    route: "/dashboard",
    accent: "#2563eb", // blue-600
    iconBg: "#eff6ff", // blue-50
  },
  {
    id: "APTIS",
    title: "APTIS Preparation",
    description:
      "Practice all five language skills and reach your CEFR goals such as B1, B2 or C.",
    icon: Target,
    route: "/aptis/dashboard",
    accent: "#0ea5e9", // sky-500
    iconBg: "#f0f9ff", // sky-50
  },
];

const ModeSelectionPage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authApi.getMe();
        if (user?.full_name) {
          setUserName(user.full_name);
        } else if (user?.email) {
          setUserName(user.email.split("@")[0]);
        }
      } catch (err) {
        console.error("Failed to fetch user info", err);
      }
    };
    fetchUser();
  }, []);

  const handleSelectMode = (mode, route) => {
    localStorage.setItem("student_exam_mode", mode);
    navigate(route);
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mode-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 24px;
          padding: 40px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 20px;
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        .mode-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px -10px rgba(14, 165, 233, 0.15), 0 10px 20px -5px rgba(14, 165, 233, 0.1);
          border-color: rgba(255, 255, 255, 0.8);
          background: #ffffff;
        }
        .mode-card:nth-child(2) { animation-delay: 0.15s; }
        .cta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 600;
          margin-top: 8px;
          transition: gap 0.3s ease;
        }
        .mode-card:hover .cta { gap: 16px; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #bae6fd 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ width: "100%", maxWidth: "840px" }}>

          {/* Header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "56px",
              animation: "fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
            }}
          >
            <div style={{ display: "inline-block", padding: "8px 16px", background: "rgba(255,255,255,0.6)", borderRadius: "30px", marginBottom: "20px", color: "#0284c7", fontWeight: 600, fontSize: "14px", border: "1px solid rgba(255,255,255,0.8)" }}>
              Select Your Path
            </div>
            <h1
              style={{
                fontSize: "clamp(32px, 5vw, 48px)",
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 16px",
                letterSpacing: "-0.02em",
              }}
            >
              Welcome Back{userName ? `, ${userName}` : ""}
            </h1>
            <p style={{ color: "#475569", fontSize: "18px", margin: 0, fontWeight: 500 }}>
              Choose the certification you want to focus on today.
            </p>
          </div>

          {/* Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "32px",
            }}
          >
            {modes.map((mode) => {
              const Icon = mode.icon;
              return (
                <div
                  key={mode.id}
                  className="mode-card"
                  onClick={() => handleSelectMode(mode.id, mode.route)}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "16px",
                      background: mode.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 4px 12px ${mode.accent}20`,
                    }}
                  >
                    <Icon size={28} color={mode.accent} strokeWidth={2.5} />
                  </div>

                  {/* Text */}
                  <div>
                    <h2
                      style={{
                        fontSize: "24px",
                        fontWeight: 800,
                        color: "#0f172a",
                        margin: "0 0 12px",
                        letterSpacing: "-0.01em"
                      }}
                    >
                      {mode.title}
                    </h2>
                    <p
                      style={{
                        fontSize: "15px",
                        color: "#64748b",
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      {mode.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="cta" style={{ color: mode.accent }}>
                    Enter Learning Space
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </>
  );
};

export default ModeSelectionPage;