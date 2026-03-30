import React, { useState, useEffect } from 'react';
import { X, Minus, Maximize2, Save } from 'lucide-react';

const NotePad = ({ isOpen, onClose, initialContent, onSave }) => {
  const [content, setContent] = useState(initialContent || "");
  const [isMinimized, setIsMinimized] = useState(false);

  // Cập nhật nội dung nếu props thay đổi (ví dụ chuyển bài đọc khác thì load note khác)
  useEffect(() => {
    setContent(initialContent || "");
  }, [initialContent]);

  // Tự động lưu khi người dùng ngừng gõ 1 giây (Debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      onSave(content);
    }, 1000);
    return () => clearTimeout(timer);
  }, [content, onSave]);

  if (!isOpen) return null;

  // Giao diện khi bị thu nhỏ (chỉ hiện cái nút nhỏ)
  if (isMinimized) {
    return (
      <div className="absolute bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5">
        <button 
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-4 py-2 rounded-full shadow-lg font-bold hover:bg-yellow-200 transition"
        >
          <Maximize2 size={16} /> Mở Ghi Chú
        </button>
      </div>
    );
  }

  // Giao diện đầy đủ (Sticky Note)
  return (
    <div className="absolute bottom-4 right-6 w-80 z-40 flex flex-col shadow-2xl rounded-xl overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200 font-inter">
      {/* HEADER */}
      <div className="bg-yellow-400 px-4 py-2 flex justify-between items-center cursor-move select-none">
        <span className="font-bold text-yellow-900 text-sm flex items-center gap-2">
          <Save size={14} className="opacity-50"/> Ghi chú của bạn
        </span>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-yellow-500 rounded text-yellow-900 transition"
            title="Thu nhỏ"
          >
            <Minus size={16} />
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-yellow-500 rounded text-yellow-900 transition"
            title="Đóng"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* TEXTAREA */}
      <div className="bg-yellow-50 h-64 flex flex-col">
        <textarea 
          className="flex-1 w-full bg-transparent p-4 text-gray-800 placeholder:text-gray-400 resize-none outline-none font-medium text-sm leading-relaxed custom-scrollbar"
          placeholder="Viết ghi chú nhanh vào đây..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
        />
        <div className="px-3 py-1 text-[10px] text-gray-400 text-right bg-yellow-50/50 border-t border-yellow-100">
           {content.length} ký tự
        </div>
      </div>
    </div>
  );
};

export default NotePad;