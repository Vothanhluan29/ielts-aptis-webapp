import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd'; // 🔥 Dùng Ant Design message thay vì toast
import { speakingStudentApi } from '../../api/speakingStudentApi'; // Kiểm tra lại đường dẫn API

// 🔥 Bổ sung propTestId và onFinish để phục vụ Full Test
export const useSpeakingExam = (propTestId = null, onFinish = null) => {
  const { id: urlId } = useParams(); 
  const navigate = useNavigate();

  // 🔥 Ưu tiên testId truyền từ Component cha (ExamTakingPage), nếu không có mới lấy từ URL
  const activeTestId = propTestId || urlId;
  const isFullTest = !!propTestId; // Xác định đang thi Full Test hay thi lẻ

  // Restore progress from sessionStorage (if available)
  const STORAGE_KEY = `speaking_progress_${activeTestId}`;
  const savedProgress = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};

  // --- 1. DATA STATES ---
  const [testDetail, setTestDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- 2. NAVIGATION STATES (restored from Storage) ---
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
      // Warn only if recording or an audio file has not been submitted
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
        // 🔥 Dùng activeTestId thay vì id
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

  // COMPUTED PROPERTIES
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
  // =================================================================
  const startRecording = async () => {
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
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const discardRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

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
    if (audioBlob.size < 8192) { // 8KB limit
      return message.warning("Audio file size must be at least 8KB!");
    }


    setSaving(true);
    let hideLoading = null;

    try {
      // 1. Upload file âm thanh
      const uploadRes = await speakingStudentApi.uploadAudio(audioBlob);
      const audioPublicUrl = uploadRes?.data?.url || uploadRes?.url;

      // 2. Lưu câu trả lời
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

      // 3. Nếu là câu cuối cùng của bài thi
      if (isLastQuestionOfTest) {
        hideLoading = message.loading("Submitting your test and waiting for AI grading...", 0);
        
        await speakingStudentApi.finishTest(newSubId || submissionId);
        
        // Dọn dẹp session storage
        sessionStorage.removeItem(STORAGE_KEY);
        
        hideLoading();
        message.success("Speaking section submitted successfully!");
        
        // 🔥 BÁO CÁO CHO FULL TEST NẾU ĐANG LÀM FULL TEST
        if (onFinish) {
           onFinish(newSubId || submissionId);
        } else {
           navigate(`/speaking/result/${newSubId || submissionId}`, { replace: true });
        }
        
      } else {
        // Chưa xong -> Dọn dẹp recording và qua câu tiếp theo
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
    handleNextOrSubmit
  };
};