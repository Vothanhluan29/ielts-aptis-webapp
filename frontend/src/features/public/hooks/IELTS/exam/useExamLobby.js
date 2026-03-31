import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message, Modal } from "antd"; 
import { examStudentApi } from '../../../api/IELTS/exam/examStudentApi';

const { confirm } = Modal;

const useExamLobby = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const [isAudioTested, setIsAudioTested] = useState(false);
  const [isMicTested, setIsMicTested] = useState(false);
  const [micPermission, setMicPermission] = useState(null);

  /* ================= FETCH TEST ================= */
  useEffect(() => {
    const fetchTestDetail = async () => {
      try {
        const response = await examStudentApi.getTestDetailPublic(id);
        const data = response?.data || response;
        setTest(data);
      } catch (error) {
        console.error("Fetch exam detail error:", error);
        message.error("Test not found or unavailable.");
        navigate("/exam/library"); 
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTestDetail();
  }, [id, navigate]);

  /* ================= AUDIO TEST ================= */
  const handleTestAudio = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .then(() => {
        setIsAudioTested(true);
        message.success("Playing sample sound...");
      })
      .catch((err) => {
        console.error("Audio playback error:", err);
        message.error("Audio playback failed. Please check your browser settings.");
      });
  }, []);

  /* ================= MIC TEST ================= */
  const handleTestMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      setMicPermission("granted");
      setIsMicTested(true);
      message.success("Microphone is working properly.");

      // Dừng track ngay sau khi test thành công để không giữ mic liên tục
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Mic error:", error);
      setMicPermission("denied");
      message.error("Microphone permission denied. You cannot take the Speaking section.");
    }
  }, []);

  /* ================= START EXAM ================= */
  // 🔥 FIX: Bọc proceedToStart vào useCallback
  const proceedToStart = useCallback(async () => {
    setStarting(true);
    try {
      const response = await examStudentApi.startExam(parseInt(id));
      const submission = response?.data || response;
      
      message.success("Entering exam room...");
      navigate(`/exam/taking/${submission.id}`, { replace: true });
    } catch (error) {
      console.error("Start exam error:", error);
      
      if (error.response) {
        const errorMessage = error.response.data?.detail || error.response.data?.message;
        
        if (error.response.status === 402) {
          message.warning("Daily full test limit reached. Please upgrade your plan or try again tomorrow.");
        } else if (error.response.status === 403) {
          message.error(errorMessage || "You don't have permission to take this test.");
        } else {
          message.error(errorMessage || "Failed to start exam. Please try again.");
        }
      } else {
         message.error("Network error. Please check your connection.");
      }
      setStarting(false);
    }
  }, [id, navigate]); // Khai báo id và navigate vào mảng dependency

  const handleStartExam = useCallback(() => {
    if (!isAudioTested || !isMicTested) {
      confirm({
        title: 'System Check Incomplete',
        content: "You haven't completed the Audio and Microphone check. Are you sure you want to continue?",
        okText: 'Continue Anyway',
        cancelText: 'Cancel',
        okButtonProps: { danger: true },
        onOk() {
          proceedToStart();
        },
      });
      return;
    }

    proceedToStart();
  }, [isAudioTested, isMicTested, proceedToStart]); 

  return {
    audioRef,

    test,
    loading,
    starting,

    isAudioTested,
    isMicTested,
    micPermission,

    handleTestAudio,
    handleTestMic,
    handleStartExam,
  };
};

export default useExamLobby;