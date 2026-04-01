import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Spin, message, Progress, Image, Tag } from 'antd';
import { Mic, StopCircle, CheckCircle2, Loader2, Send, Clock, PlayCircle } from 'lucide-react';
import { AudioOutlined } from '@ant-design/icons';
import speakingAptisStudentApi from '../../../api/APTIS/speaking/speakingAptisStudentApi';

const { Title, Text } = Typography;

// --- CONFIGURATIONS ---
const PREP_TIME = 15; 
const RECORD_TIME = 45;
const EXAM_STEPS = {
  INTRO: 'INTRO',
  PREP: 'PREP',
  RECORDING: 'RECORDING',
  UPLOADING: 'UPLOADING',
  DONE: 'DONE'
};

const SpeakingAptisExamPage = ({ 
  isFullTest = false, 
  testIdFromProps = null,
  onSkillFinish = null 
}) => {
  const navigate = useNavigate();
  const { id: urlId } = useParams();
  const testId = isFullTest ? testIdFromProps : urlId;

  // --- STATE: TEST DATA ---
  const [loading, setLoading] = useState(true);
  const [testDetail, setTestDetail] = useState(null);
  
  // --- STATE: PROGRESS ---
  const [currentPartIdx, setCurrentPartIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [submissionId, setSubmissionId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // --- STATE: EXAM ROOM ---
  const [step, setStep] = useState(EXAM_STEPS.INTRO);
  const [timer, setTimer] = useState(0);
  const [audioBlocked, setAudioBlocked] = useState(false); // State to check whether Autoplay is blocked

  // --- REFS ---
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const examinerAudioRef = useRef(null);

  // --- DERIVED DATA ---
  const currentPart = testDetail?.parts?.[currentPartIdx];
  const currentQuestion = currentPart?.questions?.[currentQuestionIdx];

  // ==========================================
  // 1. DATA FETCHING EFFECT
  // ==========================================
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        if (!testId) throw new Error("Speaking test ID not found!");

        const response = await speakingAptisStudentApi.getTestDetail(testId);
        const data = response.data || response;
        
        if (!data.parts || data.parts.length === 0) {
          message.error("This test has no content!");
          navigate('/aptis/speaking');
          return;
        }
        
        setTestDetail(data);
      } catch (error) {
        console.error("Error loading test:", error);
        message.error(`Unable to load the test: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTest();

    // Cleanup Microphone on unmount
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [testId, navigate]);

  // ==========================================
  // 2. AUDIO AUTOPLAY EFFECT
  // ==========================================
  useEffect(() => {
    if (step === EXAM_STEPS.INTRO && examinerAudioRef.current && currentQuestion?.audio_url) {
      setAudioBlocked(false);
      examinerAudioRef.current.pause();
      examinerAudioRef.current.currentTime = 0;
      
      const playPromise = examinerAudioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser blocks Autoplay -> Show manual play button
          setAudioBlocked(true);
        });
      }
    }
  }, [currentQuestionIdx, currentPartIdx, step, currentQuestion?.audio_url]);

  // ==========================================
  // 3. TIMER COUNTDOWN EFFECT
  // ==========================================
  useEffect(() => {
    let interval;
    if ((step === EXAM_STEPS.PREP || step === EXAM_STEPS.RECORDING) && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0) {
      if (step === EXAM_STEPS.PREP) startRecording(); 
      else if (step === EXAM_STEPS.RECORDING) stopRecording();  
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, timer]);

  // ==========================================
  // 4. ACTION HANDLERS
  // ==========================================
  const stopExaminerAudio = () => {
    if (examinerAudioRef.current) examinerAudioRef.current.pause();
  };

  const startPrep = () => {
    stopExaminerAudio();
    setStep(EXAM_STEPS.PREP);
    setTimer(PREP_TIME);
  };

  const startRecording = async () => {
    stopExaminerAudio();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const fileName = `speak_p${currentPartIdx + 1}_q${currentQuestionIdx + 1}_${Date.now()}.webm`;
        const audioFile = new File([audioBlob], fileName, { type: 'audio/webm' });
        
        await handleUploadAndSave(audioFile);
      };

      mediaRecorder.start();
      setStep(EXAM_STEPS.RECORDING);
      setTimer(RECORD_TIME);
    } catch (err) {
      message.error("Unable to access Microphone. Please check your permissions!", err);
      setStep(EXAM_STEPS.INTRO);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleUploadAndSave = async (file) => {
    setStep(EXAM_STEPS.UPLOADING);
    try {
      const uploadRes = await speakingAptisStudentApi.uploadAudio(file);
      const audioUrl = uploadRes.data?.url || uploadRes.url;

      const payload = {
        test_id: testDetail.id,
        is_full_test_only: isFullTest, 
        part_id: currentPart.id,
        part_number: currentPart.part_number,
        question_id: currentQuestion.id,
        audio_url: audioUrl,
        ...(submissionId && { submission_id: submissionId })
      };

      const saveRes = await speakingAptisStudentApi.savePart(payload);
      const newSubId = saveRes.data?.submission_id || saveRes.submission_id;
      
      if (!submissionId) setSubmissionId(newSubId);
      moveToNext();
    } catch (error) {
      message.error("File upload failed. Please try this question again!", error);
      setStep(EXAM_STEPS.INTRO); 
    }
  };

  const moveToNext = () => {
    if (currentQuestionIdx < currentPart.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setStep(EXAM_STEPS.INTRO);
    } else if (currentPartIdx < testDetail.parts.length - 1) {
      setCurrentPartIdx(prev => prev + 1);
      setCurrentQuestionIdx(0);
      setStep(EXAM_STEPS.INTRO);
    } else {
      setStep(EXAM_STEPS.DONE);
    }
  };

  const handleFinishTest = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
        message.loading({ content: isFullTest ? 'Finalizing full test submission...' : 'Submitting test...', key: 'finish' });
        await speakingAptisStudentApi.finishTest(submissionId);
        message.success({ content: 'Test submitted successfully!', key: 'finish' });
      
      if (isFullTest && onSkillFinish) onSkillFinish(submissionId);
      else navigate(`/aptis/speaking/result/${submissionId}`);
      
    } catch (error) {
      let errorMsg = error?.response?.data?.detail || error?.response?.data?.message || 'Unknown server error';
      message.error({ content: `Unable to submit: ${errorMsg}`, key: 'finish', duration: 5 });
      setSubmitting(false);
    }
  };

  // ==========================================
  // 5. RENDER HELPERS
  // ==========================================
  if (loading || !testDetail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Spin size="large" />
          <Text className="font-medium text-lg text-slate-500">Initializing recording system...</Text>
        </div>
      </div>
    );
  }

  if (step === EXAM_STEPS.DONE) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-10 rounded-3xl text-center max-w-md w-full shadow-xl border border-slate-100 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-50 text-green-500 flex items-center justify-center rounded-full mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <Title level={3} className="text-slate-800! mb-2">Recording complete!</Title>
          <Text className="text-slate-500 block mb-8">
            {isFullTest ? "Great job! You have completed the entire Speaking section, which is also the final skill." : "You have completed all recorded questions. Please click Submit to finish."}
          </Text>
          <Button 
            type="primary" size="large" block icon={<Send size={20} />} loading={submitting} onClick={handleFinishTest}
            className="flex items-center justify-center gap-2 h-14 bg-purple-600 hover:bg-purple-500 border-none font-bold text-lg rounded-xl shadow-md shadow-purple-200"
          >
            {isFullTest ? "Finish Full Test" : "Submit Test"}
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return <div className="text-slate-800 p-10">Question data error!</div>;

  const isPart3 = currentPart.part_number === 3;
  const image1 = currentQuestion.image_url || currentPart.image_url;
  const image2 = currentQuestion.image_url_2 || currentPart.image_url_2;
  const hasTwoImages = isPart3 && image1 && image2;
  
  const maxTime = step === EXAM_STEPS.PREP ? PREP_TIME : RECORD_TIME;
  const timePercent = (timer / maxTime) * 100;

  // ==========================================
  // 6. MAIN RENDER
  // ==========================================
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col font-sans">
      
      {/* HEADER BAR */}
      <div className="bg-white border-b border-slate-200 py-3 px-6 flex justify-between items-center z-10 shadow-sm shrink-0 h-16">
        <div className="flex items-center gap-3">
          {isFullTest ? <AudioOutlined className="text-purple-600 text-lg" /> : <div className="px-3 py-1 rounded-lg bg-purple-50 text-purple-600 font-bold border border-purple-100 text-sm">Part {currentPart.part_number}</div>}
          <Text strong={isFullTest} className={isFullTest ? "text-lg text-slate-700" : "text-slate-700 font-bold hidden sm:block"}>
            {isFullTest ? `Skill: Speaking - Part ${currentPart.part_number}` : testDetail.title}
          </Text>
        </div>
        <div className="px-3 py-1 bg-slate-100 rounded-lg text-slate-600 text-sm font-bold border border-slate-200">
          Question {currentQuestionIdx + 1} / {currentPart.questions.length}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="w-full max-w-6xl z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: QUESTION */}
            <div className="lg:col-span-7 bg-white border border-slate-200 p-8 md:p-10 rounded-3xl shadow-sm flex flex-col justify-center">
              
              {/* IMAGES */}
              {hasTwoImages ? (
                <div className="mb-6 grid grid-cols-2 gap-4 text-center">
                  <Image src={image1} className="max-h-72 object-contain rounded-xl mx-auto border border-slate-100 shadow-sm" />
                  <Image src={image2} className="max-h-72 object-contain rounded-xl mx-auto border border-slate-100 shadow-sm" />
                </div>
              ) : image1 ? (
                <div className="mb-6 text-center">
                  <Image src={image1} className="max-h-72 object-contain rounded-xl mx-auto border border-slate-100 shadow-sm" />
                </div>
              ) : null}

              {/* HIDDEN AUDIO & FALLBACK BUTTON */}
              {currentQuestion.audio_url && (
                <>
                  <audio ref={examinerAudioRef} src={currentQuestion.audio_url} className="hidden" />
                  {audioBlocked && (
                    <div className="mb-6 flex justify-center">
                      <Button 
                        type="primary" icon={<PlayCircle size={18} />} 
                        onClick={() => { examinerAudioRef.current?.play(); setAudioBlocked(false); }}
                        className="bg-indigo-600 hover:bg-indigo-500 font-bold h-10 px-6 rounded-lg shadow-md flex items-center gap-2"
                      >
                        Play question audio
                      </Button>
                    </div>
                  )}
                </>
              )}
              
              <Text className="text-purple-600 block mb-3 uppercase tracking-widest text-xs font-bold">Question</Text>
              <Title level={3} className="text-slate-800! m-0! leading-relaxed font-semibold whitespace-pre-wrap">
                {currentQuestion.question_text}
              </Title>
            </div>

            {/* RIGHT COLUMN: CONTROLS */}
            <div className="lg:col-span-5 bg-white border border-slate-200 p-8 md:p-10 rounded-3xl shadow-sm flex flex-col items-center justify-center min-h-100">
              
              {step === EXAM_STEPS.INTRO && (
                <div className="text-center w-full">
                  <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100"><Mic className="w-10 h-10" /></div>
                  <Title level={4} className="text-slate-700! mb-8!">Are you ready to answer this question?</Title>
                  <Button type="primary" size="large" onClick={startPrep} className="bg-purple-600 hover:bg-purple-500 border-none font-bold h-14 px-10 rounded-xl shadow-md shadow-purple-200 text-lg w-full">
                    Start ({PREP_TIME}s Preparation)
                  </Button>
                </div>
              )}

              {(step === EXAM_STEPS.PREP || step === EXAM_STEPS.RECORDING) && (
                <div className="w-full text-center">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    {step === EXAM_STEPS.PREP ? <Clock className="text-orange-500 w-8 h-8" /> : (
                      <div className="relative flex h-8 w-8 items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                      </div>
                    )}
                    <Text className={`text-5xl font-black tabular-nums tracking-tight ${step === EXAM_STEPS.PREP ? 'text-orange-500' : 'text-red-500'}`}>
                      00:{timer.toString().padStart(2, '0')}
                    </Text>
                  </div>

                  <Text className="block text-slate-600 font-semibold mb-8 text-lg">
                    {step === EXAM_STEPS.PREP ? 'Thinking time...' : 'Recording your answer...'}
                  </Text>

                  <Progress percent={timePercent} showInfo={false} strokeColor={step === EXAM_STEPS.PREP ? '#f97316' : '#ef4444'} trailColor="#f1f5f9" className="mb-10 px-2" size={["100%", 12]} />

                  {step === EXAM_STEPS.RECORDING && (
                    <Button type="default" icon={<StopCircle size={20} />} onClick={stopRecording} className="flex items-center justify-center gap-2 mx-auto bg-white text-slate-700 border-slate-300 hover:border-red-400 hover:text-red-500 font-bold h-14 px-8 rounded-xl transition-colors shadow-sm w-full text-base">
                      Stop Recording Early
                    </Button>
                  )}
                  {step === EXAM_STEPS.PREP && (
                    <Button type="link" onClick={startRecording} className="text-orange-500 hover:text-orange-400 font-semibold text-base">
                      Skip preparation, record now
                    </Button>
                  )}
                </div>
              )}

              {step === EXAM_STEPS.UPLOADING && (
                <div className="text-center w-full py-8">
                  <Loader2 className="text-purple-600 w-16 h-16 mx-auto mb-6 animate-spin" />
                  <Title level={4} className="text-slate-700! m-0!">Saving audio...</Title>
                  <Text className="text-slate-500 mt-3 block text-base">Please do not leave this page</Text>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakingAptisExamPage;