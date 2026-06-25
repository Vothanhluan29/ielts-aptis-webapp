import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import speakingAptisStudentApi from '../../../api/APTIS/speaking/speakingAptisStudentApi';

// --- CONFIGURATIONS ---
// Per-part timing based on official APTIS Speaking specifications:
// Part 1: 30s answer per question (no prep phase)
// Part 2: 45s answer per question (no prep phase)
// Part 3: 45s answer per question (no prep phase)
// Part 4: 60s prep + 120s answer for ALL questions at once (single recording)
const PART_TIMING = {
  1: { prep: 0,  record: 30  },
  2: { prep: 0,  record: 45  },
  3: { prep: 0,  record: 45  },
  4: { prep: 60, record: 120 },
};
const DEFAULT_TIMING = { prep: 0, record: 45 };

const EXAM_STEPS = {
  INTRO: 'INTRO',
  PREP: 'PREP',
  RECORDING: 'RECORDING',
  UPLOADING: 'UPLOADING',
  DONE: 'DONE'
};

export const useSpeakingAptisExam = ({ isFullTest, testIdFromProps, onSkillFinish }) => {
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
  const [audioBlocked, setAudioBlocked] = useState(false);

  // --- REFS ---
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const examinerAudioRef = useRef(null);

  // --- DERIVED DATA ---
  const currentPart = testDetail?.parts?.[currentPartIdx];
  const currentQuestion = currentPart?.questions?.[currentQuestionIdx];
  const allQuestions = currentPart?.questions || [];

  // --- PER-PART TIMING ---
  const partNumber = currentPart?.part_number || 1;
  const isPart4 = partNumber === 4;
  const timing = PART_TIMING[partNumber] || DEFAULT_TIMING;
  const PREP_TIME = timing.prep;
  const RECORD_TIME = timing.record;

  // 1. DATA FETCHING EFFECT
  const fetchTest = useCallback(async () => {
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
  }, [testId, navigate]);

  useEffect(() => {
    fetchTest();
    // Cleanup Microphone on unmount
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [fetchTest]);

  // 2. AUDIO AUTOPLAY EFFECT
  useEffect(() => {
    if (step === EXAM_STEPS.INTRO && examinerAudioRef.current && currentQuestion?.audio_url) {
      setAudioBlocked(false);
      examinerAudioRef.current.pause();
      examinerAudioRef.current.currentTime = 0;
      
      const playPromise = examinerAudioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          setAudioBlocked(true);
        });
      }
    }
  }, [currentQuestionIdx, currentPartIdx, step, currentQuestion?.audio_url]);

  // 3. TIMER COUNTDOWN EFFECT
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

  // 4. ACTION HANDLERS
  const stopExaminerAudio = () => {
    if (examinerAudioRef.current) examinerAudioRef.current.pause();
  };

  const startPrep = () => {
    stopExaminerAudio();
    // If no prep time for this part, go straight to recording
    if (PREP_TIME === 0) {
      startRecording();
    } else {
      setStep(EXAM_STEPS.PREP);
      setTimer(PREP_TIME);
    }
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

      // Part 4: single recording covers all questions — stored at index 0
      // Parts 1–3: per-question recording uses actual index
      const payload = {
        test_id: testDetail.id,
        is_full_test_only: isFullTest, 
        part_id: currentPart.id,
        part_number: currentPart.part_number,
        question_index: isPart4 ? 0 : currentQuestionIdx,
        question_id: isPart4 ? null : currentQuestion?.id,
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
    // Part 4: single block — skip per-question iteration, go directly to next part / DONE
    if (isPart4) {
      if (currentPartIdx < testDetail.parts.length - 1) {
        setCurrentPartIdx(prev => prev + 1);
        setCurrentQuestionIdx(0);
        setStep(EXAM_STEPS.INTRO);
      } else {
        setStep(EXAM_STEPS.DONE);
      }
      return;
    }

    // Parts 1–3: per-question flow
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
      
      if (isFullTest && onSkillFinish) {
        onSkillFinish(submissionId || testId);
      } else {
        navigate(`/aptis/speaking/result/${submissionId || testId}`);
      }
      
    } catch (error) {
      let errorMsg = error?.response?.data?.detail || error?.response?.data?.message || 'Unknown server error';
      message.error({ content: `Unable to submit: ${errorMsg}`, key: 'finish', duration: 5 });
      setSubmitting(false);
    }
  };

  // 5. HELPER FORMAT
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return {
    loading,
    submitting,
    testDetail,
    currentPart,
    currentQuestion,
    currentPartIdx,
    currentQuestionIdx,
    allQuestions,
    isPart4,
    step,
    timer,
    audioBlocked,
    setAudioBlocked,
    examinerAudioRef,
    startPrep,
    startRecording,
    stopRecording,
    handleFinishTest,
    formatTime,
    PREP_TIME,
    RECORD_TIME,
    EXAM_STEPS
  };
};