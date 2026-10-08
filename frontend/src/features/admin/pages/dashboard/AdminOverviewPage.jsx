import React from 'react';
import { DashboardStatCard, LoadingState, PageContainer, SkillBankGrid, SkillDistributionCard } from '../../../../common-ui';
import { useAdminDashboard } from '../../hooks/dashboard/useAdminDashboard';
import { ADMIN_STAT_CARDS, APTIS_SKILLS, IELTS_SKILLS } from '../../components/dashboard/dashboardConfig';

export default function AdminOverviewPage() {
  const { stats, loading } = useAdminDashboard();
  if (loading) return <LoadingState label="Loading dashboard..." minHeight="min-h-[60vh]" />;

  return (
    <PageContainer className="pb-8">
      <div className="animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {ADMIN_STAT_CARDS.map(item => <DashboardStatCard key={item.key} item={item} value={stats?.[item.key]} />)}
        </div>
        <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SkillDistributionCard title="IELTS Distribution" description="Breakdown of IELTS questions by skill" skills={stats?.ielts_skills} />
          <SkillDistributionCard title="APTIS Distribution" description="Breakdown of APTIS questions by skill" skills={stats?.aptis_skills} />
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SkillBankGrid title="IELTS Exam Bank" skills={IELTS_SKILLS} data={stats?.ielts_skills} />
          <SkillBankGrid title="APTIS Exam Bank" skills={APTIS_SKILLS} data={stats?.aptis_skills} />
        </div>
      </div>
    </PageContainer>
  );
}
