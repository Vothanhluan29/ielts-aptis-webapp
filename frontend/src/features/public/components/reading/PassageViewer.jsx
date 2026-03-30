import React, { useRef, memo, useMemo } from 'react';

// --- PHẦN 1: COMPONENT TĨNH ---
const InnerContent = memo(({ html }) => {
  return (
    <div 
      className="prose prose-slate max-w-none text-gray-700 leading-8 font-serif text-justify select-text pb-20 text-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}, (prev, next) => prev.html === next.html);

// --- PHẦN 2: WRAPPER ---
const PassageViewer = ({ content, activeTool }) => {
  const contentRef = useRef(null);

  // 🔥 XỬ LÝ VĂN BẢN: Chuyển \n thành <br/> để hiển thị đúng HTML
  const formattedContent = useMemo(() => {
    if (!content) return '';
    // Nếu backend trả về plain text, ta replace \n bằng <br/>
    // Nếu backend đã trả về HTML (có thẻ p, div...) thì giữ nguyên
    if (content.includes('<p>') || content.includes('<div>')) return content;
    return content.replace(/\n/g, '<br/>');
  }, [content]);

  const handleMouseUp = () => {
    if (!activeTool) return; // Nếu không chọn màu thì không làm gì

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const container = contentRef.current;
    
    // Chỉ highlight nếu vùng chọn nằm trong bài đọc
    if (container && !container.contains(range.commonAncestorContainer)) return;

    try {
      const span = document.createElement('span');
      span.className = 'highlight-item';
      span.style.padding = '2px 0';
      span.style.cursor = 'pointer';
      span.style.borderRadius = '2px';
      
      // Màu sắc
      if (activeTool === 'yellow') {
          span.style.backgroundColor = '#fef08a'; // yellow-200
          span.style.color = '#000';
      } else if (activeTool === 'red') {
          span.style.backgroundColor = '#fecaca'; // red-200
          span.style.color = '#000';
      } else if (activeTool === 'green') {
          span.style.backgroundColor = '#bbf7d0'; // green-200
          span.style.color = '#000';
      }

      span.onclick = handleRemoveHighlight;

      range.surroundContents(span);
      selection.removeAllRanges();
    } catch (e) {
      console.warn("Không thể highlight qua nhiều đoạn văn (HTML structure limit):", e);
    }
  };

  const handleRemoveHighlight = (e) => {
    e.stopPropagation(); // Chỉ xóa, không kích hoạt highlight mới
    const span = e.target;
    // Đảm bảo chỉ xóa thẻ highlight
    if (span.classList.contains('highlight-item') || span.style.backgroundColor) {
      const text = document.createTextNode(span.textContent);
      span.parentNode.replaceChild(text, span);
    }
  };

  // CSS thay đổi màu bôi đen của chuột cho đồng bộ
  const getSelectionStyle = () => {
    if (!activeTool) return '';
    const colorMap = { yellow: '#fef08a', red: '#fecaca', green: '#bbf7d0' };
    return `
      ::selection {
        background-color: ${colorMap[activeTool]} !important;
        color: black !important;
      }
    `;
  };

  return (
    <div className="font-inter relative h-full" ref={contentRef}>
      <style>{getSelectionStyle()}</style>
      <div onMouseUp={handleMouseUp}>
         <InnerContent html={formattedContent} />
      </div>
    </div>
  );
};

export default PassageViewer;