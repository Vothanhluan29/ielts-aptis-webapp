import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd'; 
import { speakingStudentApi } from '../../../api/IELTS/speaking/speakingStudentApi'; 

export const useSpeakingExam = (propTestId = null, onFinish = null) => {
  const { id: urlId } = useParams(); 
  const navigate = useNavigate();

  const activeTestId = propTestId || urlId;
  const isFullTest = !!propTestId; 

  const STORAGE_KEY = `speaking_progress_${activeTestId}`;
  const savedProgress = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};

  // --- 1. DATA STATES ---
  const [testDetail, setTestDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- 2. NAVIGATION STATES ---
  const [currentPartIdx, setCurrentPartIdx] = useState(savedProgress.partIdx || 0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(savedProgress.questionIdx || 0);
  const [submissionId, setSubmissionId] = useState(savedProgress.subId || null);

  // --- 3. RECORDING STATES ---
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null); 
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // --- 4. PREPARATION STATES (Dành riêng cho Part 2) ---
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepTimeLeft, setPrepTimeLeft] = useState(60);
  const [hasPrepared, setHasPrepared] = useState(false); // Cờ đánh dấu đã chuẩn bị xong chưa (Tránh lặp lại khi Retake)

  // =================================================================
  // 🛡️ SHIELD 1: SAVE PROGRESS TO SESSION STORAGE
  // =================================================================
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      partIdx: currentPartIdx,
      questionIdx: currentQuestionIdx,
      subId: submissionId
    }));
  }, [currentPartIdx, currentQuestionIdx, submissionId, STORAGE_KEY]);

  // =================================================================
  // 🛡️ SHIELD 2: WARN USER BEFORE TAB CLOSE / REFRESH
  // =================================================================
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isRecording || audioBlob) {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isRecording, audioBlob]);

  // =================================================================
  // FETCH DATA
  // =================================================================
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        const res = await speakingStudentApi.getTestById(activeTestId);
        const data = res?.data || res;
        
        if (data.parts) {
          data.parts.sort((a, b) => a.part_number - b.part_number);
          data.parts.forEach(p => {
            if (p.questions) {
              p.questions.sort((a, b) => a.sort_order - b.sort_order);
            }
          });
        }
        setTestDetail(data);
      } catch (error) {
        console.error("Load test error:", error);
        message.error("Cannot load the test. Please try again later.");
        if (!isFullTest) navigate('/speaking');
      } finally {
        setLoading(false);
      }
    };
    if (activeTestId) fetchTest();
  }, [activeTestId, navigate, isFullTest]);

  // =================================================================
  // COMPUTED PROPERTIES
  // =================================================================
  const currentPart = useMemo(() => {
    if (!testDetail?.parts) return null;
    return testDetail.parts[currentPartIdx];
  }, [testDetail, currentPartIdx]);

  const currentQuestion = useMemo(() => {
    if (!currentPart?.questions) return null;
    return currentPart.questions[currentQuestionIdx];
  }, [currentPart, currentQuestionIdx]);

  const isLastQuestionOfTest = useMemo(() => {
    if (!testDetail?.parts || !currentPart) return false;
    const isLastPart = currentPartIdx === testDetail.parts.length - 1;
    const isLastQInPart = currentQuestionIdx === currentPart.questions.length - 1;
    return isLastPart && isLastQInPart;
  }, [testDetail, currentPartIdx, currentQuestionIdx, currentPart]);

  // =================================================================
  // AUDIO RECORDING LOGIC
  // (Được bọc bằng useCallback để tái sử dụng an toàn trong useEffect)
  // =================================================================
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Mic access denied:", err);
      message.error("Please allow microphone access to take the test!");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  }, [isRecording]);

  const discardRecording = useCallback(() => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  }, []);

  // =================================================================
  // PREPARATION LOGIC (PART 2)
  // =================================================================
  
  // 1. Reset cờ hasPrepared khi qua câu hỏi mới
  useEffect(() => {
    setHasPrepared(false);
  }, [currentPartIdx, currentQuestionIdx]);

  // 2. Kích hoạt đếm ngược nếu là Part 2 và chưa từng chuẩn bị
  useEffect(() => {
    if (currentPart?.part_number === 2 && !audioBlob && !isRecording && !hasPrepared) {
      setIsPreparing(true);
      setPrepTimeLeft(60);
    } else {
      setIsPreparing(false);
    }
  }, [currentPart, audioBlob, isRecording, hasPrepared]);

  // 3. Logic đếm ngược 60 giây
  useEffect(() => {
    let timer;
    if (isPreparing && prepTimeLeft > 0) {
      timer = setInterval(() => {
        setPrepTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isPreparing && prepTimeLeft === 0) {
      // Hết giờ -> Tắt form chuẩn bị, set cờ đã chuẩn bị, tự động ghi âm
      setIsPreparing(false);
      setHasPrepared(true);
      startRecording();
    }
    return () => clearInterval(timer);
  }, [isPreparing, prepTimeLeft, startRecording]);

  // 4. Hàm bỏ qua chuẩn bị
  const handleSkipPreparation = useCallback(() => {
    setIsPreparing(false);
    setHasPrepared(true);
    startRecording();
  }, [startRecording]);

  // =================================================================
  // NAVIGATION & SUBMISSION LOGIC
  // =================================================================
  const handleNextOrSubmit = async () => {
    if (!audioBlob) {
      return message.warning("Please record your answer before continuing!");
    }
    if (recordingTime < 10) {
      return message.warning("Recording time must be at least 10 seconds!");
    }
    if (audioBlob.size < 8192) { 
      return message.warning("Audio file size must be at least 8KB!");
    }

    setSaving(true);
    let hideLoading = null;

    try {
      const uploadRes = await speakingStudentApi.uploadAudio(audioBlob);
      const audioPublicUrl = uploadRes?.data?.url || uploadRes?.url;

      const payload = {
        test_id: parseInt(activeTestId),
        question_id: currentQuestion.id,
        audio_url: audioPublicUrl,
        submission_id: submissionId, 
        is_full_test_only: isFullTest
      };

      const saveRes = await speakingStudentApi.saveQuestion(payload);
      const newSubId = saveRes?.data?.submission_id || saveRes?.submission_id;
      
      if (!submissionId && newSubId) {
        setSubmissionId(newSubId);
      }

      if (isLastQuestionOfTest) {
        hideLoading = message.loading("Submitting your test and waiting for AI grading...", 0);
        await speakingStudentApi.finishTest(newSubId || submissionId);
        
        sessionStorage.removeItem(STORAGE_KEY);
        
        hideLoading();
        message.success("Speaking section submitted successfully!");
        
        if (onFinish) {
           onFinish(newSubId || submissionId);
        } else {
           navigate(`/speaking/result/${newSubId || submissionId}`, { replace: true });
        }
        
      } else {
        discardRecording(); 

        if (currentQuestionIdx < currentPart.questions.length - 1) {
          setCurrentQuestionIdx(prev => prev + 1);
        } else {
          setCurrentPartIdx(prev => prev + 1);
          setCurrentQuestionIdx(0);
          message.success(`Moving to Part ${testDetail.parts[currentPartIdx + 1].part_number}`);
        }
      }

    } catch (error) {
      console.error(error);
      if (hideLoading) hideLoading();
      
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || "An error occurred while saving your answer. Please try again!";
      message.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return {
    testDetail,
    loading,
    saving,
    currentPart,
    currentQuestion,
    currentPartIdx,
    currentQuestionIdx,
    isLastQuestionOfTest,
    isRecording,
    audioBlob,
    audioUrl,
    recordingTime,
    startRecording,
    stopRecording,
    discardRecording,
    handleNextOrSubmit,
    
    // Xuất khẩu các state & function mới phục vụ Part 2
    isPreparing,
    prepTimeLeft,
    handleSkipPreparation
  };
};