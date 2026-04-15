import React, { useRef, useState, useEffect, useMemo } from 'react';
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
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [draggingIndex, setDraggingIndex] = useState(null);

  // 1. Tạo một thứ tự lộn xộn ngẫu nhiên (chỉ chạy 1 lần khi load options)
  const initialShuffledOrder = useMemo(() => {
    if (!options || !Array.isArray(options)) return [];
    const order = options.map((_, i) => i);
    // Thuật toán xáo trộn ngẫu nhiên Fisher-Yates
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }, [options]);

  // 2. Gửi ngay đáp án lộn xộn này lên Form State (để nếu hs nộp luôn thì sẽ bị sai)
  useEffect(() => {
    if ((!selectedValue || selectedValue.trim() === '') && initialShuffledOrder.length > 0) {
      const shuffledString = initialShuffledOrder.map(idx => LETTERS[idx]).join('-');
      if (onChange) {
        onChange(questionId, shuffledString);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialShuffledOrder]); // Chỉ chạy khi initialShuffledOrder được tạo ra

  if (!options || !Array.isArray(options) || options.length === 0) return null;

  // 3. Logic lấy currentOrder: Lấy từ Form (nếu có) hoặc dùng mảng lộn xộn
  let currentOrder = [];
  if (selectedValue && typeof selectedValue === 'string' && selectedValue.includes('-')) {
    const selectedLetters = selectedValue.split('-');
    currentOrder = selectedLetters.map(letter => LETTERS.indexOf(letter.toUpperCase()));
    
    // Nếu dữ liệu bị lỗi, fallback về mảng lộn xộn
    if (currentOrder.some(idx => idx === -1 || idx >= options.length)) {
       currentOrder = initialShuffledOrder;
    }
  } else {
    currentOrder = initialShuffledOrder; // 🔥 Thay thế logic cũ (options.map)
  }

  const items = currentOrder.map(idx => ({
    originalIndex: idx,
    letter: LETTERS[idx],
    text: options[idx]
  }));

  // Logic sắp xếp bằng nút bấm
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

  // Logic kéo thả (Drag & Drop)
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      e.target.classList.add('opacity-40', 'border-dashed', 'border-orange-400');
    }, 0);
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-40', 'border-dashed', 'border-orange-400');
    setDraggingIndex(null);

    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newItems = [...items];
      const draggedItemContent = newItems.splice(dragItem.current, 1)[0];
      newItems.splice(dragOverItem.current, 0, draggedItemContent);
      updateAnswer(newItems);
    }

    dragItem.current = null;
    dragOverItem.current = null;
  };

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
            onDragOver={(e) => e.preventDefault()}
            className={`flex items-center gap-3 p-3 bg-slate-50 border rounded-xl transition-all hover:bg-orange-50/50 hover:border-orange-200 cursor-move ${
              draggingIndex === idx ? 'opacity-40 border-dashed border-orange-400 bg-orange-50' : 'border-slate-200'
            }`}
          >
             <div className="flex items-center justify-center px-1 text-slate-300 hover:text-orange-500 shrink-0">
                <HolderOutlined className="text-lg" />
             </div>

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
             
             <div className="flex items-center justify-center min-w-9 h-9 font-bold text-orange-600 bg-orange-100 rounded-lg shrink-0">
                {item.letter}
             </div>
             
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