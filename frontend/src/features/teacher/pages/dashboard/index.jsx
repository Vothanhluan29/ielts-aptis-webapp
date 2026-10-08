import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardStatCard, DashboardWelcomeBanner, LoadingState, PageContainer, SkillBankRows, SkillDistributionCard } from '../../../../common-ui';
import { useAdminDashboard } from '../../../admin/hooks/dashboard/useAdminDashboard';
import { APTIS_SKILLS, TEACHER_STAT_CARDS } from '../../../admin/components/dashboard/dashboardConfig';
import useAuthStore from '../../../../store/authStore';

export default function TeacherDashboardPage() {
  const { stats, loading } = useAdminDashboard();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  if (loading) return <LoadingState label="Loading dashboard..." minHeight="min-h-[60vh]" />;

  return (
    <PageContainer className="pb-8">
      <div className="animate-in fade-in zoom-in-95 duration-500 slide-in-from-bottom-4">
        <DashboardWelcomeBanner userName={user?.full_name} />
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {TEACHER_STAT_CARDS.map(item => <DashboardStatCard key={item.key} item={item} value={stats?.[item.key]} />)}
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SkillDistributionCard title="APTIS Test Distribution" description="Breakdown of questions by skill" skills={stats?.aptis_skills} compact />
          <SkillBankRows skills={APTIS_SKILLS} data={stats?.aptis_skills} navigate={navigate} />
        </div>
      </div>
    </PageContainer>
  );
}
