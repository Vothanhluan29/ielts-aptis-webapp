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
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * -30;
    };

    const animate = () => {
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      const cubes = container.querySelectorAll('.floating-cube');
      cubes.forEach((cube, i) => {
        const factor = (i % 3 + 1) * 0.4;
        cube.style.transform = `
          rotateX(${mouseY * factor}deg)
          rotateY(${mouseX * factor}deg)
          ${cube.dataset.baseTransform || ''}
        `;
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
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ perspective: '1000px', perspectiveOrigin: '50% 50%' }}
    >
      {/* Deep gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #000d3d 0%, #001a70 40%, #002299 70%, #001060 100%)',
        }}
      />

      {/* Radial glow center */}
      <div
        className="absolute"
        style={{
          top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px', height: '800px',
          background: 'radial-gradient(circle, rgba(100,140,255,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* 3D GRID FLOOR */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '50%',
          background: `
            linear-gradient(transparent 0%, rgba(0,50,150,0.15) 100%),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 80px,
              rgba(100,150,255,0.08) 80px,
              rgba(100,150,255,0.08) 81px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 80px,
              rgba(100,150,255,0.08) 80px,
              rgba(100,150,255,0.08) 81px
            )
          `,
          transform: 'perspective(800px) rotateX(60deg)',
          transformOrigin: 'bottom center',
        }}
      />

      {/* ── 3D Floating Cubes ── */}
      {/* Cube 1 - Top Left */}
      <div
        className="floating-cube absolute"
        data-base-transform="translateZ(0)"
        style={{
          top: '10%', left: '8%',
          width: '80px', height: '80px',
          transformStyle: 'preserve-3d',
          animation: 'float3d1 8s ease-in-out infinite',
        }}
      >
        {['front','back','left','right','top','bottom'].map((face) => (
          <div key={face} className={`cube-face-${face}`} style={getCubeFaceStyle(face, 80, 'rgba(100,150,255,0.12)', 'rgba(150,200,255,0.25)')} />
        ))}
      </div>

      {/* Cube 2 - Top Right */}
      <div
        className="floating-cube absolute"
        data-base-transform="translateZ(0)"
        style={{
          top: '8%', right: '10%',
          width: '60px', height: '60px',
          transformStyle: 'preserve-3d',
          animation: 'float3d2 10s ease-in-out infinite',
        }}
      >
        {['front','back','left','right','top','bottom'].map((face) => (
          <div key={face} style={getCubeFaceStyle(face, 60, 'rgba(80,120,255,0.15)', 'rgba(180,210,255,0.3)')} />
        ))}
      </div>

      {/* Cube 3 - Bottom Left */}
      <div
        className="floating-cube absolute"
        data-base-transform="translateZ(0)"
        style={{
          bottom: '15%', left: '5%',
          width: '100px', height: '100px',
          transformStyle: 'preserve-3d',
          animation: 'float3d3 12s ease-in-out infinite',
        }}
      >
        {['front','back','left','right','top','bottom'].map((face) => (
          <div key={face} style={getCubeFaceStyle(face, 100, 'rgba(60,100,220,0.12)', 'rgba(120,170,255,0.22)')} />
        ))}
      </div>

      {/* Cube 4 - Bottom Right */}
      <div
        className="floating-cube absolute"
        data-base-transform="translateZ(0)"
        style={{
          bottom: '20%', right: '6%',
          width: '50px', height: '50px',
          transformStyle: 'preserve-3d',
          animation: 'float3d4 9s ease-in-out infinite',
        }}
      >
        {['front','back','left','right','top','bottom'].map((face) => (
          <div key={face} style={getCubeFaceStyle(face, 50, 'rgba(100,160,255,0.18)', 'rgba(200,220,255,0.35)')} />
        ))}
      </div>

      {/* Cube 5 - Mid Left */}
      <div
        className="floating-cube absolute"
        data-base-transform="translateZ(0)"
        style={{
          top: '45%', left: '3%',
          width: '40px', height: '40px',
          transformStyle: 'preserve-3d',
          animation: 'float3d2 7s ease-in-out infinite 2s',
        }}
      >
        {['front','back','left','right','top','bottom'].map((face) => (
          <div key={face} style={getCubeFaceStyle(face, 40, 'rgba(140,180,255,0.2)', 'rgba(200,230,255,0.4)')} />
        ))}
      </div>

      {/* Cube 6 - Mid Right */}
      <div
        className="floating-cube absolute"
        data-base-transform="translateZ(0)"
        style={{
          top: '40%', right: '3%',
          width: '70px', height: '70px',
          transformStyle: 'preserve-3d',
          animation: 'float3d1 11s ease-in-out infinite 1s',
        }}
      >
        {['front','back','left','right','top','bottom'].map((face) => (
          <div key={face} style={getCubeFaceStyle(face, 70, 'rgba(80,130,255,0.13)', 'rgba(160,200,255,0.28)')} />
        ))}
      </div>

      {/* ── Floating Rings ── */}
      <div
        className="absolute"
        style={{
          top: '20%', left: '15%',
          width: '200px', height: '200px',
          border: '1px solid rgba(150,200,255,0.15)',
          borderRadius: '50%',
          animation: 'ringFloat1 15s linear infinite',
          boxShadow: '0 0 30px rgba(100,150,255,0.1) inset',
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: '25%', right: '15%',
          width: '150px', height: '150px',
          border: '1px solid rgba(150,200,255,0.12)',
          borderRadius: '50%',
          animation: 'ringFloat2 12s linear infinite',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '60%', left: '25%',
          width: '80px', height: '80px',
          border: '2px solid rgba(200,220,255,0.1)',
          borderRadius: '50%',
          animation: 'ringFloat1 8s linear infinite reverse',
        }}
      />

      {/* ── Glowing Particles ── */}
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `rgba(${150 + Math.floor(Math.random() * 80)}, ${180 + Math.floor(Math.random() * 60)}, 255, ${0.4 + Math.random() * 0.6})`,
            boxShadow: `0 0 ${4 + Math.random() * 8}px rgba(150,200,255,0.8)`,
            animation: `particleDrift ${8 + Math.random() * 12}s ease-in-out infinite ${Math.random() * 8}s`,
          }}
        />
      ))}

      {/* ── Light Beams ── */}
      <div
        className="absolute"
        style={{
          top: '-20%', left: '20%',
          width: '2px', height: '80%',
          background: 'linear-gradient(to bottom, transparent, rgba(150,200,255,0.2), transparent)',
          transform: 'rotate(-15deg)',
          animation: 'beamPulse 6s ease-in-out infinite',
        }}
      />
      <div
        className="absolute"
        style={{
          top: '-20%', right: '25%',
          width: '1px', height: '70%',
          background: 'linear-gradient(to bottom, transparent, rgba(120,170,255,0.15), transparent)',
          transform: 'rotate(10deg)',
          animation: 'beamPulse 8s ease-in-out infinite 2s',
        }}
      />

      {/* ── Corner Accent Glows ── */}
      <div
        className="absolute top-0 left-0"
        style={{
          width: '350px', height: '350px',
          background: 'radial-gradient(circle at top left, rgba(80,120,255,0.2) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 right-0"
        style={{
          width: '350px', height: '350px',
          background: 'radial-gradient(circle at bottom right, rgba(100,150,255,0.15) 0%, transparent 70%)',
        }}
      />

      {/* CSS Keyframe Animations */}
      <style>{`
        @keyframes float3d1 {
          0%, 100% { transform: translateY(0px) rotateX(20deg) rotateY(20deg); }
          33%       { transform: translateY(-25px) rotateX(40deg) rotateY(-10deg); }
          66%       { transform: translateY(-10px) rotateX(10deg) rotateY(40deg); }
        }
        @keyframes float3d2 {
          0%, 100% { transform: translateY(0px) rotateX(-15deg) rotateY(30deg); }
          50%       { transform: translateY(-30px) rotateX(25deg) rotateY(-20deg); }
        }
        @keyframes float3d3 {
          0%, 100% { transform: translateY(0px) rotateX(30deg) rotateY(-20deg); }
          40%       { transform: translateY(-20px) rotateX(-10deg) rotateY(40deg); }
          80%       { transform: translateY(-35px) rotateX(20deg) rotateY(10deg); }
        }
        @keyframes float3d4 {
          0%, 100% { transform: translateY(0px) rotateX(10deg) rotateY(45deg); }
          60%       { transform: translateY(-28px) rotateX(-20deg) rotateY(-15deg); }
        }
        @keyframes ringFloat1 {
          0%   { transform: rotateX(75deg) rotateZ(0deg); }
          100% { transform: rotateX(75deg) rotateZ(360deg); }
        }
        @keyframes ringFloat2 {
          0%   { transform: rotateX(70deg) rotateZ(0deg); }
          100% { transform: rotateX(70deg) rotateZ(-360deg); }
        }
        @keyframes particleDrift {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
          25%       { transform: translateY(-20px) translateX(10px); opacity: 1; }
          75%       { transform: translateY(10px) translateX(-15px); opacity: 0.6; }
        }
        @keyframes beamPulse {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function getCubeFaceStyle(face, size, bg, border) {
  const half = size / 2;
  const faces = {
    front:  { transform: `translateZ(${half}px)`,                       width: size, height: size, top: 0, left: 0 },
    back:   { transform: `rotateY(180deg) translateZ(${half}px)`,       width: size, height: size, top: 0, left: 0 },
    left:   { transform: `rotateY(-90deg) translateZ(${half}px)`,       width: size, height: size, top: 0, left: 0 },
    right:  { transform: `rotateY(90deg) translateZ(${half}px)`,        width: size, height: size, top: 0, left: 0 },
    top:    { transform: `rotateX(90deg) translateZ(${half}px)`,        width: size, height: size, top: 0, left: 0 },
    bottom: { transform: `rotateX(-90deg) translateZ(${half}px)`,       width: size, height: size, top: 0, left: 0 },
  };
  return {
    position: 'absolute',
    ...faces[face],
    background: bg,
    border: `1px solid ${border}`,
    backdropFilter: 'blur(2px)',
    boxSizing: 'border-box',
  };
}
