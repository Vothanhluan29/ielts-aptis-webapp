// import { useState, useRef } from "react";

// const useAudioRecorder = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [audioURL, setAudioURL] = useState(null);
//   const [audioBlob, setAudioBlob] = useState(null);
//   const mediaRecorderRef = useRef(null);
//   const chunksRef = useRef([]);

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorderRef.current = new MediaRecorder(stream);
//       chunksRef.current = [];

//       mediaRecorderRef.current.ondataavailable = (e) => {
//         if (e.data.size > 0) chunksRef.current.push(e.data);
//       };

//       mediaRecorderRef.current.onstop = () => {
//         const blob = new Blob(chunksRef.current, { type: "audio/webm" });
//         const url = URL.createObjectURL(blob);
//         setAudioBlob(blob);
//         setAudioURL(url);
//       };

//       mediaRecorderRef.current.start();
//       setIsRecording(true);
//     } catch (err) {
//       console.error("Error accessing microphone:", err);
//       alert("Không thể truy cập Microphone. Vui lòng kiểm tra quyền truy cập.");
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//       // Stop all tracks to release microphone
//       mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
//     }
//   };

//   const resetRecording = () => {
//     setAudioURL(null);
//     setAudioBlob(null);
//     setIsRecording(false);
//   };

//   return { isRecording, startRecording, stopRecording, resetRecording, audioURL, audioBlob };
// };

// export default useAudioRecorder;