import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Spin, message, Steps, Divider, Alert } from 'antd';
import { ArrowLeftOutlined, PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { ClipboardList, BookOpen, Headphones, PenTool, Mic } from 'lucide-react';

import examAptisStudentApi from '../../../api/APTIS/exam/examAptisStudentApi';

const { Title, Text } = Typography;

const APTIS_SKILLS_STEPS = [
  { id: 'GRAMMAR_VOCAB', title: 'Grammar & Vocab', icon: <ClipboardList size={20} />, time: '25 mins' },
  { id: 'READING', title: 'Reading', icon: <BookOpen size={20} />, time: '35 mins' },
  { id: 'LISTENING', title: 'Listening', icon: <Headphones size={20} />, time: '40 mins' },
  { id: 'WRITING', title: 'Writing', icon: <PenTool size={20} />, time: '50 mins' },
  { id: 'SPEAKING', title: 'Speaking', icon: <Mic size={20} />, time: '12 mins' },
];

const ExamAptisLobbyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [testDetail, setTestDetail] = useState(null);
  const [activeSubmission, setActiveSubmission] = useState(null);

  const fetchLobbyData = useCallback(async () => {
    setLoading(true);
    try {
      const testRes = await examAptisStudentApi.getLibraryTestDetail(id);
      setTestDetail(testRes.data || testRes);

      const historyRes = await examAptisStudentApi.getMyExamHistory();
      const history = historyRes.data || historyRes || [];
      
      const inProgressSub = history.find(
        (sub) => sub.test_id === Number(id) && sub.status === 'IN_PROGRESS'
      );
      
      if (inProgressSub) {
        const progressRes = await examAptisStudentApi.getCurrentProgress(inProgressSub.id);
        setActiveSubmission(progressRes.data || progressRes);
      }

    } catch (error) {
      console.error("Lobby Error:", error);
      message.error("Unable to load exam lobby data!");
      navigate('/aptis/exam');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchLobbyData();
  }, [fetchLobbyData]);

  const getSkillUrl = (stepId, submissionId) => {
    return `/aptis/exam/taking/${submissionId}`;
  };

  const handleStartOrResume = async () => {
    setStarting(true);
    try {
      if (activeSubmission) {
        const currentStep = activeSubmission.current_step || 'GRAMMAR_VOCAB';
        message.info(`Resuming exam at section: ${currentStep.replace('_', ' ')}`);
        navigate(getSkillUrl(currentStep, activeSubmission.id));
      } else {
        const startRes = await examAptisStudentApi.startExam(id);
        const newSubmission = startRes.data || startRes;
        message.success("Full test started!");
        navigate(getSkillUrl('GRAMMAR_VOCAB', newSubmission.id));
      }
    } catch (error) {
      console.error("Start Error:", error);
      message.error("Unable to start the exam. Please try again!");
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spin size="large" />
        <Text className="mt-4 text-slate-500 font-medium">Preparing the exam lobby...</Text>
      </div>
    );
  }

  if (!testDetail) return null;

  let currentStepIndex = 0;
  if (activeSubmission && activeSubmission.current_step) {
    currentStepIndex = APTIS_SKILLS_STEPS.findIndex(s => s.id === activeSubmission.current_step);
    if (currentStepIndex === -1) currentStepIndex = 0;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <Card className="rounded-3xl border-slate-200 shadow-xl overflow-hidden p-0" styles={{ body: { padding: 0 } }}>
        
        <div className="bg-linear-to-r from-indigo-600 via-blue-600 to-purple-600 p-10 text-center">
          <Title level={2} className="text-white! m-0! mb-2! font-black tracking-wide">
            {testDetail.title}
          </Title>
          <Text className="text-indigo-100 text-base font-medium opacity-90">
            Total Time: ~160 Minutes • 5 Core Skills
          </Text>
        </div>

        <div className="p-8 md:p-10 bg-white">
          <Alert
            message="Full Test Instructions" 
            description={
              <ul className="list-disc pl-5 mt-2 text-slate-600 space-y-1">
                <li>The test includes 5 continuous sections. The system will <b>automatically save</b> after each skill.</li>
                <li>Please prepare <b>Headphones</b> and a <b>Microphone</b> for the Listening & Speaking sections.</li>
                <li>If you accidentally close the browser, you can return to this page and choose <b>Resume Exam</b>.</li>
                <li>Each skill has its own countdown timer. When time runs out, the test will automatically submit and move to the next section.</li>
              </ul>
            }
            type="info"
            showIcon
            className="mb-10 rounded-xl border-indigo-200 bg-indigo-50/50"
          />

          <Divider orientation="left">
            <Text className="text-lg font-bold text-slate-700">Your Exam Progress</Text>
          </Divider>

          <div className="py-8 px-4 overflow-x-auto">
            <Steps
              current={currentStepIndex}
              items={APTIS_SKILLS_STEPS.map((skill, index) => ({
                title: <span className="font-bold text-sm">{skill.title}</span>,
                description: <span className="text-xs text-slate-500 font-medium">{skill.time}</span>, 
                icon: (
                  <div className={`p-2 rounded-full ${
                    index < currentStepIndex ? 'bg-emerald-100 text-emerald-600' : 
                    index === currentStepIndex ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {skill.icon}
                  </div>
                )
              }))}
            />
          </div>

          {activeSubmission && (
            <div className="text-center mt-4 mb-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Text className="text-amber-800 font-medium">
                The system detected that you stopped at: <strong className="uppercase">{activeSubmission.current_step?.replace('_', ' ')}</strong>
              </Text>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-100">
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/aptis/exam')}
              className="h-14 px-8 text-base font-semibold rounded-2xl border-slate-300 text-slate-600 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all w-full sm:w-auto"
            >
              Back to Exam List
            </Button>

            <Button
              type="primary"
              size="large"
              loading={starting}
              onClick={handleStartOrResume}
              icon={activeSubmission ? <ReloadOutlined /> : <PlayCircleOutlined />}
              className={`h-14 px-10 text-base font-bold rounded-2xl shadow-lg transition-transform hover:-translate-y-1 w-full sm:w-auto ${
                activeSubmission 
                  ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-200 border-0' 
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200 border-0'
              }`}
            >
              {activeSubmission ? 'RESUME INCOMPLETE EXAM' : 'START NEW EXAM'}
            </Button>
          </div>

        </div>
      </Card>
    </div>
  );
};

export default ExamAptisLobbyPage;