import React from 'react';
import { ChevronRight, GraduationCap, Library, TrendingUp } from 'lucide-react';
import SkillPieChart from './SkillPieChart';

export function DashboardStatCard({ item, value }) {
  const Icon = item.icon;

  return (
    <div className="group flex h-[150px] flex-col justify-between rounded-[20px] bg-white p-6 shadow-sm ring-1 ring-zinc-200/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-zinc-300">
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">{item.title}</span>
        <div className={`rounded-2xl p-2.5 ${item.bg} ${item.ring} ring-1 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon size={20} className={item.color} />
        </div>
      </div>
      <div>
        <h3 className="text-4xl font-black tracking-tight text-zinc-900">{value ?? 0}</h3>
        {item.desc && <p className="mt-0.5 text-xs font-medium text-zinc-400">{item.desc}</p>}
      </div>
    </div>
  );
}

export function DashboardWelcomeBanner({ userName }) {
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="relative mb-8 overflow-hidden rounded-[24px]" style={{ background: 'linear-gradient(135deg, #2d3f73 0%, #445A95 50%, #5b70b0 100%)' }}>
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/5 blur-2xl" />
      <div className="absolute right-48 top-4 h-2 w-2 rounded-full bg-white/30" />
      <div className="absolute right-36 top-10 h-1 w-1 rounded-full bg-white/20" />
      <div className="relative flex items-center justify-between px-8 py-7">
        <div>
          <p className="mb-1 text-sm font-medium text-white/60">{date}</p>
          <h1 className="mb-1 text-2xl font-black tracking-tight text-white md:text-3xl">{greeting}, {userName || 'Teacher'}! 👋</h1>
          <p className="text-sm font-medium text-white/70">Overview of your APTIS teaching workspace</p>
        </div>
        <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm md:flex">
          <GraduationCap size={40} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export function SkillBankRows({ skills, data, navigate }) {
  const total = skills.reduce((sum, skill) => sum + (data?.[skill.key] || 0), 0);

  return (
    <div className="flex h-full flex-col rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-zinc-200/60">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black tracking-tight text-zinc-800">APTIS Test Library</h3>
          <p className="mt-0.5 text-xs font-medium text-zinc-400">{total} tests total</p>
        </div>
        <div className="rounded-xl bg-[#445A95]/10 p-2"><Library size={16} className="text-[#445A95]" /></div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {skills.map(skill => {
          const Icon = skill.icon;
          const count = data?.[skill.key] || 0;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <button key={skill.key} onClick={() => skill.route && navigate(skill.route)} className="group flex w-full items-center gap-3 rounded-[14px] p-3 text-left transition-all duration-200 hover:bg-zinc-50 hover:ring-1 hover:ring-zinc-200 focus:outline-none">
              <div className={`shrink-0 rounded-xl p-2 ${skill.bg} transition-transform duration-300 group-hover:scale-110`}>
                <Icon size={16} className={skill.color} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[13px] font-bold text-zinc-700 group-hover:text-zinc-900">{skill.label || skill.key}</span>
                  <span className="tabular-nums text-[13px] font-black text-zinc-800">{count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${percentage}%`, backgroundColor: skill.fill }} />
                </div>
              </div>
              <ChevronRight size={14} className="shrink-0 text-zinc-300 transition-colors group-hover:text-zinc-500" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SkillBankGrid({ title, skills, data }) {
  return (
    <div className="flex h-full flex-col rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-zinc-200/60">
      <h3 className="mb-6 text-lg font-black tracking-tight text-zinc-800">{title}</h3>
      <div className="grid flex-1 grid-cols-2 gap-4">
        {skills.map(skill => {
          const Icon = skill.icon;
          return (
            <div key={skill.key} className="group flex items-center justify-between rounded-[20px] bg-zinc-50/50 p-4 ring-1 ring-zinc-100 transition-all duration-300 hover:bg-white hover:ring-zinc-200 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2.5 ${skill.bg} transition-transform duration-300 group-hover:scale-110`}><Icon size={18} className={skill.color} /></div>
                <span className="text-[13px] font-bold text-zinc-600 transition-colors group-hover:text-zinc-900">{skill.label || skill.key}</span>
              </div>
              <div className="tabular-nums text-lg font-black text-zinc-800">{data?.[skill.key] || 0}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SkillDistributionCard({ title, description, skills, compact = false }) {
  const cardStyle = compact ? 'rounded-[24px] p-7' : 'rounded-[28px] p-8';
  const titleStyle = compact ? 'text-base' : 'text-lg';
  const chartHeight = compact ? 'h-[260px]' : 'h-[280px]';

  return (
    <div className={`bg-white ${cardStyle} shadow-sm ring-1 ring-zinc-200/60`}>
      <div className="flex items-center justify-between">
        <h3 className={`${titleStyle} font-black tracking-tight text-zinc-800`}>{title}</h3>
        {compact && <TrendingUp size={16} className="text-zinc-400" />}
      </div>
      <p className={`${compact ? 'mb-5' : 'mb-6'} mt-1 text-sm font-medium text-zinc-500`}>{description}</p>
      <div className={chartHeight}><SkillPieChart skills={skills} /></div>
    </div>
  );
}
