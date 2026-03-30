import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Target, ArrowRight } from "lucide-react";

const modes = [
  {
    id: "IELTS",
    title: "IELTS Preparation",
    description:
      "Master Listening, Speaking, Reading and Writing with a structured academic learning roadmap.",
    icon: BookOpen,
    route: "/dashboard",
    accent: "#4f46e5",
    iconBg: "#eef2ff",
  },
  {
    id: "APTIS",
    title: "APTIS Preparation",
    description:
      "Practice all five language skills and reach your CEFR goals such as B1, B2 or C.",
    icon: Target,
    route: "/aptis/dashboard",
    accent: "#7c3aed",
    iconBg: "#f5f3ff",
  },
];

const ModeSelectionPage = () => {
  const navigate = useNavigate();

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
          background: #fff;
          border: 1.5px solid #e0e7ff;
          border-radius: 20px;
          padding: 36px;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: fadeUp 0.5s ease both;
        }
        .mode-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.15);
          border-color: #a5b4fc;
        }
        .mode-card:nth-child(2) { animation-delay: 0.12s; }
        .cta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 4px;
          transition: gap 0.2s ease;
        }
        .mode-card:hover .cta { gap: 14px; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 50%, #e9d5ff 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        <div style={{ width: "100%", maxWidth: "780px" }}>

          {/* Header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "48px",
              animation: "fadeUp 0.45s ease both",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(28px, 5vw, 44px)",
                fontWeight: 800,
                color: "#1e1b4b",
                margin: "0 0 12px",
                letterSpacing: "-0.03em",
              }}
            >
              Welcome Back
            </h1>
            <p style={{ color: "#6366f1", fontSize: "16px", margin: 0, fontWeight: 500 }}>
              Choose the certification you want to focus on today.
            </p>
          </div>

          {/* Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
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
                      width: "52px",
                      height: "52px",
                      borderRadius: "14px",
                      background: mode.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={24} color={mode.accent} strokeWidth={2} />
                  </div>

                  {/* Text */}
                  <div>
                    <h2
                      style={{
                        fontSize: "22px",
                        fontWeight: 700,
                        color: "#1e1b4b",
                        margin: "0 0 8px",
                      }}
                    >
                      {mode.title}
                    </h2>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        margin: 0,
                        lineHeight: 1.65,
                      }}
                    >
                      {mode.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="cta" style={{ color: mode.accent }}>
                    Enter Learning Space
                    <ArrowRight size={16} strokeWidth={2.5} />
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