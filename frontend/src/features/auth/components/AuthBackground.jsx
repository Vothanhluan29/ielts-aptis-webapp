import { useEffect, useRef } from 'react';

export default function AuthBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animFrame;
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      // Normalized coordinates from -1 to 1
      targetX = (e.clientX / rect.width) * 2 - 1;
      targetY = (e.clientY / rect.height) * 2 - 1;
    };

    const animate = () => {
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      const orbs = container.querySelectorAll('.parallax-orb');
      orbs.forEach((orb, i) => {
        const speed = (i + 1) * 15; // subtle parallax speed
        orb.style.transform = `translate(${mouseX * speed}px, ${mouseY * speed}px)`;
      });

      animFrame = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none bg-[#030712]" // Deep modern dark slate
    >
      {/* Noise Overlay for premium texture */}
      <div 
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Grid Background (Subtle) */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)'
        }}
      />

      {/* ── Glowing Abstract Orbs (Aurora / Mesh Gradient Effect) ── */}
      <div className="absolute inset-0 z-0">
        {/* Orb 1: Bright Cyan/Blue */}
        <div
          className="parallax-orb absolute rounded-full mix-blend-screen opacity-50 animate-blob"
          style={{
            top: '-10%', left: '10%',
            width: '800px', height: '800px',
            background: 'radial-gradient(circle, rgba(56,189,248,0.3) 0%, rgba(59,130,246,0) 70%)',
            filter: 'blur(90px)',
            animationDelay: '0s'
          }}
        />
        
        {/* Orb 2: Deep Purple/Indigo */}
        <div
          className="parallax-orb absolute rounded-full mix-blend-screen opacity-40 animate-blob"
          style={{
            bottom: '-20%', right: '-10%',
            width: '900px', height: '900px',
            background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(79,70,229,0) 70%)',
            filter: 'blur(100px)',
            animationDelay: '2s'
          }}
        />

        {/* Orb 3: Royal Blue center */}
        <div
          className="parallax-orb absolute rounded-full mix-blend-screen opacity-40 animate-blob"
          style={{
            top: '30%', left: '40%',
            width: '600px', height: '600px',
            background: 'radial-gradient(circle, rgba(37,99,235,0.35) 0%, rgba(29,78,216,0) 70%)',
            filter: 'blur(80px)',
            animationDelay: '4s'
          }}
        />
      </div>

      {/* ── Floating Glowing Dust Particles ── */}
      <div className="absolute inset-0 z-0">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.1,
              boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(96, 165, 250, 0.6)`,
              animation: `floatUp ${15 + Math.random() * 25}s linear infinite`,
              animationDelay: `-${Math.random() * 20}s`
            }}
          />
        ))}
      </div>

      {/* ── Subtle Light Beams ── */}
      <div
        className="absolute top-[-30%] left-[20%] w-[1px] h-[160%] bg-gradient-to-b from-transparent via-blue-400/20 to-transparent rotate-[-30deg] transform-gpu"
        style={{ animation: 'beamFade 8s ease-in-out infinite' }}
      />
      <div
        className="absolute top-[-20%] right-[30%] w-[2px] h-[140%] bg-gradient-to-b from-transparent via-indigo-400/10 to-transparent rotate-[20deg] transform-gpu"
        style={{ animation: 'beamFade 12s ease-in-out infinite 3s' }}
      />

      {/* CSS Keyframe Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -60px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 18s infinite alternate ease-in-out;
        }
        @keyframes floatUp {
          0% { transform: translateY(100vh) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-20vh) translateX(30px); opacity: 0; }
        }
        @keyframes beamFade {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
