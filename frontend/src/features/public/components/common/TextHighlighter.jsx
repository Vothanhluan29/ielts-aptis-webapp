import React, { useEffect, useRef } from 'react';
import Highlighter from 'web-highlighter';

const TextHighlighter = ({ 
  content,       // Đoạn HTML cần hiển thị
  storageKey,    // MÃ ĐỘC NHẤT để lưu LocalStorage (Rất quan trọng)
  activeTool,    // Màu bút hiện tại ('yellow', 'green', 'red', hoặc null)
  customClass = "prose prose-slate prose-lg max-w-none text-justify font-serif leading-relaxed text-slate-800" // Class CSS mặc định
}) => {
  const containerRef = useRef(null);
  const highlighterRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    // 1. Khởi tạo Bút dạ
    const highlighter = new Highlighter({
      $root: containerRef.current,
      className: 'highlight-yellow', 
      exceptSelectors: ['pre', 'code', 'img', 'input', 'button'] // Bỏ qua các thẻ không được bôi đen
    });
    highlighterRef.current = highlighter;

    // 2. Khôi phục Highlight cũ từ LocalStorage
    let currentHighlights = [];
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        currentHighlights = JSON.parse(savedData);
        currentHighlights.forEach((h) => {
          highlighter.fromStore(h.startMeta, h.endMeta, h.text, h.id, h.extra);
        });
      } catch (err) {
        console.error("Lỗi parse highlight cũ:", err);
      }
    }

    // 3. Lắng nghe sự kiện Bôi đen (Lưu vào máy)
    highlighter.on(Highlighter.event.CREATE, ({ sources }) => {
      currentHighlights = [...currentHighlights, ...sources];
      localStorage.setItem(storageKey, JSON.stringify(currentHighlights));
    });

    // 4. Lắng nghe sự kiện Xóa (Cập nhật lại máy)
    highlighter.on(Highlighter.event.REMOVE, ({ ids }) => {
      currentHighlights = currentHighlights.filter(h => !ids.includes(h.id));
      localStorage.setItem(storageKey, JSON.stringify(currentHighlights));
    });

    // 5. Cục tẩy siêu tốc: Click vào là xóa!
    highlighter.on(Highlighter.event.CLICK, ({ id }) => {
      highlighter.remove(id);
    });

    // Cleanup khi Component bị hủy hoặc nội dung đổi
    return () => {
      highlighter.dispose();
    };
  }, [content, storageKey]);

  // ====================================================
  // Logic Đổi màu bút hoặc Cất bút
  // ====================================================
  useEffect(() => {
    if (!highlighterRef.current) return;

    if (!activeTool) {
      highlighterRef.current.stop(); // Cất bút, chỉ cho phép click để xóa
    } else {
      highlighterRef.current.run();  // Cầm bút lên
      
      if (activeTool === 'yellow') highlighterRef.current.setOption({ className: 'highlight-yellow' });
      if (activeTool === 'green') highlighterRef.current.setOption({ className: 'highlight-green' });
      if (activeTool === 'red') highlighterRef.current.setOption({ className: 'highlight-red' });
    }
  }, [activeTool]);

  return (
    <>
      <style>{`
        .highlight-yellow { background-color: #fef08a !important; cursor: pointer; border-radius: 3px; padding: 2px 0; }
        .highlight-green { background-color: #bbf7d0 !important; cursor: pointer; border-radius: 3px; padding: 2px 0; }
        .highlight-red { background-color: #fecaca !important; cursor: pointer; border-radius: 3px; padding: 2px 0; }
        .highlight-yellow:hover, .highlight-green:hover, .highlight-red:hover { opacity: 0.8; }
      `}</style>
      
      <div
        ref={containerRef}
        className={customClass}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </>
  );
};

export default TextHighlighter;