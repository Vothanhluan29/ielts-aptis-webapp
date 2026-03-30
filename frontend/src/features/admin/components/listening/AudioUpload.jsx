import React, { useRef, useState, useEffect } from 'react';
import { Upload, Music, X, PlayCircle, FileAudio, Loader2 } from 'lucide-react'; // Thêm icon Loader2
import { listeningAdminApi } from '../../api/IELTS/listening/listeningAdminApi'; // Import API
import { toast } from 'react-toastify';

const AudioUpload = ({ audioUrl, onAudioChange }) => { // Đổi tên prop thành onAudioChange cho rõ nghĩa
  const fileInputRef = useRef(null);
  
  // State
  const [previewUrl, setPreviewUrl] = useState(audioUrl || '');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false); // State loading

  // Sync khi Edit Mode (AudioUrl từ DB đổ về)
  useEffect(() => {
    if (audioUrl && typeof audioUrl === 'string') {
      setPreviewUrl(audioUrl);
      // Lấy tên file từ URL để hiển thị cho đẹp
      const nameFromUrl = audioUrl.split('/').pop();
      setFileName(nameFromUrl);
    }
  }, [audioUrl]);

  // Cleanup Blob URL để tránh memory leak
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Tạo preview ngay lập tức cho mượt
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setFileName(file.name);

    // 2. Upload lên Server ngay lập tức
    setUploading(true);
    try {
      const response = await listeningAdminApi.uploadAudio(file);
      // Backend trả về { url: "..." } hoặc { data: { url: "..." } } tùy axios config
      const serverUrl = response.url || response.data?.url; 
      
      if (serverUrl) {
        onAudioChange(serverUrl); // 🔥 Trả về URL string cho Form cha
        toast.success("Audio uploaded!");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload audio. Please try again.");
      // Reset nếu lỗi
      handleRemove(e); 
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (e) => {
    if(e) e.stopPropagation();
    
    // Cleanup blob cũ
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl('');
    setFileName('');
    onAudioChange(''); // Trả về rỗng
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition ${uploading ? 'opacity-70 pointer-events-none' : ''}`}>
      <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
        <Music size={16} className="text-purple-600" />
        Audio File {uploading && <span className="text-purple-600 text-[10px] animate-pulse">(Uploading...)</span>}
      </h3>

      {!previewUrl ? (
        /* UPLOAD STATE */
        <div
          onClick={() => fileInputRef.current.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition group relative"
        >
          {uploading ? (
             <Loader2 className="animate-spin text-purple-600" size={32} />
          ) : (
            <>
              <div className="bg-gray-100 p-3 rounded-full mb-2 group-hover:bg-white group-hover:shadow-sm transition">
                <Upload size={24} className="text-gray-400 group-hover:text-purple-600" />
              </div>
              <p className="text-sm font-bold text-gray-600 group-hover:text-purple-700">
                Click to upload audio
              </p>
              <span className="text-xs text-gray-400 mt-1">
                Supported: .mp3, .wav – Max 10MB
              </span>
            </>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
      ) : (
        /* PREVIEW STATE */
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 flex flex-col gap-3 relative">
          
          {/* Overlay loading khi đang upload đè file mới */}
          {uploading && (
             <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-sm rounded-xl">
                 <Loader2 className="animate-spin text-purple-600" size={24} />
             </div>
          )}

          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-purple-700">
              <FileAudio size={18} />
              <span
                className="text-xs font-bold truncate max-w-[200px]"
                title={fileName || audioUrl}
              >
                {fileName || 'Audio File'}
              </span>
            </div>

            <button
              type="button" // Quan trọng: type button để không submit form cha
              onClick={handleRemove}
              className="text-gray-400 hover:text-red-500 transition p-1 rounded-full hover:bg-white shadow-sm"
              title="Remove audio"
            >
              <X size={16} />
            </button>
          </div>

          <audio controls className="w-full h-8" src={previewUrl} onError={() => toast.error("Cannot play audio")}>
            Your browser does not support audio playback.
          </audio>

          {!uploading && (
            <div className="flex items-center justify-center gap-1 text-[10px] text-green-600 font-bold mt-1">
               <span className="w-2 h-2 rounded-full bg-green-500"></span>
               Ready to use
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioUpload;