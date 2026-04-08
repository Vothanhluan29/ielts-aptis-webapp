import React, { useRef, useState } from 'react';
import { Typography, Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, HolderOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const ReorderQuestion = ({ 
  questionId, 
  questionNumber, 
  questionText, 
  options, 
  selectedValue, 
  onChange 
}) => {
  // References để lưu vị trí phần tử đang kéo và phần tử bị kéo đè lên
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [draggingIndex, setDraggingIndex] = useState(null);

  if (!options || !Array.isArray(options) || options.length === 0) return null;

  let currentOrder = [];
  
  if (selectedValue && typeof selectedValue === 'string' && selectedValue.includes('-')) {
    const selectedLetters = selectedValue.split('-');
    currentOrder = selectedLetters.map(letter => LETTERS.indexOf(letter.toUpperCase()));
    
    if (currentOrder.some(idx => idx === -1 || idx >= options.length)) {
       currentOrder = options.map((_, i) => i);
    }
  } else {
    currentOrder = options.map((_, i) => i);
  }

  const items = currentOrder.map(idx => ({
    originalIndex: idx,
    letter: LETTERS[idx],
    text: options[idx]
  }));

  // Logic cũ: Sắp xếp bằng nút bấm
  const moveItem = (index, direction) => {
    const newItems = [...items];
    
    if (direction === 'UP' && index > 0) {
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    } else if (direction === 'DOWN' && index < newItems.length - 1) {
      [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    } else {
      return;
    }
    
    updateAnswer(newItems);
  };

  // Logic mới: Kéo thả (Drag & Drop)
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    setDraggingIndex(index);
    // Thay đổi hiệu ứng con trỏ chuột
    e.dataTransfer.effectAllowed = "move";
    // Thêm một chút delay để UI mượt hơn khi element bị nhấc lên
    setTimeout(() => {
      e.target.classList.add('opacity-40', 'border-dashed', 'border-orange-400');
    }, 0);
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = (e) => {
    // Gỡ bỏ style khi thả tay ra
    e.target.classList.remove('opacity-40', 'border-dashed', 'border-orange-400');
    setDraggingIndex(null);

    // Nếu vị trí kéo và thả hợp lệ và có sự thay đổi
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newItems = [...items];
      // Cắt phần tử đang kéo ra khỏi mảng
      const draggedItemContent = newItems.splice(dragItem.current, 1)[0];
      // Chèn phần tử đó vào vị trí mới
      newItems.splice(dragOverItem.current, 0, draggedItemContent);
      
      updateAnswer(newItems);
    }

    // Reset references
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Hàm gọi onChange để cập nhật state tổng
  const updateAnswer = (newItems) => {
    if (onChange) {
      const newAnswerString = newItems.map(item => item.letter).join('-');
      onChange(questionId, newAnswerString);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 mb-6 shadow-sm transition-all hover:border-orange-200 hover:shadow-md">
      
      <div className="flex gap-4 items-start mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100 text-orange-600 font-black text-lg shrink-0">
          {questionNumber}
        </div>
        <div className="flex-1 mt-1">
          <Paragraph className="text-slate-800 text-base md:text-lg font-bold m-0 leading-relaxed">
            {questionText || "Arrange the following sentences in the correct order to form a meaningful paragraph:"}
          </Paragraph>
        </div>
      </div>

      <div className="flex flex-col gap-3 pl-0 md:pl-14">
        {items.map((item, idx) => (
          <div 
            key={item.originalIndex}
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragEnter={(e) => handleDragEnter(e, idx)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()} // Bắt buộc phải có để cho phép Drop
            className={`flex items-center gap-3 p-3 bg-slate-50 border rounded-xl transition-all hover:bg-orange-50/50 hover:border-orange-200 cursor-move ${
              draggingIndex === idx ? 'opacity-40 border-dashed border-orange-400 bg-orange-50' : 'border-slate-200'
            }`}
          >
             {/* Icon Tay cầm để kéo thả */}
             <div className="flex items-center justify-center px-1 text-slate-300 hover:text-orange-500 shrink-0">
                <HolderOutlined className="text-lg" />
             </div>

             {/* Cột Nút bấm điều hướng (Giữ lại cho Mobile / Khả năng truy cập) */}
             <div className="flex flex-col gap-1 shrink-0">
                <Button 
                  size="small" 
                  type="text" 
                  icon={<ArrowUpOutlined />} 
                  onClick={() => moveItem(idx, 'UP')} 
                  disabled={idx === 0}
                  className="text-slate-400 hover:text-orange-500"
                />
                <Button 
                  size="small" 
                  type="text" 
                  icon={<ArrowDownOutlined />} 
                  onClick={() => moveItem(idx, 'DOWN')} 
                  disabled={idx === items.length - 1}
                  className="text-slate-400 hover:text-orange-500"
                />
             </div>
             
             {/* Ký tự chữ cái (A, B, C...) */}
             <div className="flex items-center justify-center min-w-9 h-9 font-bold text-orange-600 bg-orange-100 rounded-lg shrink-0">
                {item.letter}
             </div>
             
             {/* Nội dung câu */}
             <div className="flex-1 text-slate-700 text-sm md:text-base leading-relaxed select-none">
                {item.text}
             </div>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default ReorderQuestion;