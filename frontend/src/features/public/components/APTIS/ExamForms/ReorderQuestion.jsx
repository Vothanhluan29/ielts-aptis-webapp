import React from 'react';
import { Typography, Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

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
  
  if (!options || !Array.isArray(options) || options.length === 0) return null;

  // 1. TÍNH TOÁN THỨ TỰ TRỰC TIẾP TỪ PROPS (Không dùng useState / useEffect)
  let currentOrder = [];
  
  if (selectedValue && typeof selectedValue === 'string' && selectedValue.includes('-')) {
    const selectedLetters = selectedValue.split('-');
    currentOrder = selectedLetters.map(letter => LETTERS.indexOf(letter.toUpperCase()));
    
    // Nếu có lỗi index (do data cũ), reset về mặc định
    if (currentOrder.some(idx => idx === -1 || idx >= options.length)) {
       currentOrder = options.map((_, i) => i);
    }
  } else {
    // Mặc định ban đầu chưa chọn gì: 0, 1, 2, 3...
    currentOrder = options.map((_, i) => i);
  }

  // 2. MAP RA DANH SÁCH ITEMS ĐỂ RENDER
  const items = currentOrder.map(idx => ({
    originalIndex: idx,
    letter: LETTERS[idx],
    text: options[idx]
  }));

  // 3. XỬ LÝ KHI BẤM DI CHUYỂN
  const moveItem = (index, direction) => {
    const newItems = [...items];
    
    if (direction === 'UP' && index > 0) {
      [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    } else if (direction === 'DOWN' && index < newItems.length - 1) {
      [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    } else {
      return; // Không đổi vị trí
    }
    
    // Gửi định dạng chuẩn "C-A-B-D" thẳng lên Parent thông qua onChange
    if (onChange) {
      const newAnswerString = newItems.map(item => item.letter).join('-');
      onChange(questionId, newAnswerString);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 mb-6 shadow-sm transition-all hover:border-orange-200 hover:shadow-md">
      
      {/* Tiêu đề câu hỏi */}
      <div className="flex gap-4 items-start mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100 text-orange-600 font-black text-lg shrink-0">
          {questionNumber}
        </div>
        <div className="flex-1 mt-1">
          <Paragraph className="text-slate-800 text-base md:text-lg font-bold m-0 leading-relaxed">
            {questionText || "Hãy sắp xếp các câu sau đây theo thứ tự đúng để tạo thành đoạn văn có nghĩa:"}
          </Paragraph>
        </div>
      </div>

      {/* Danh sách các câu để sắp xếp */}
      <div className="flex flex-col gap-3 pl-0 md:pl-14">
        {items.map((item, idx) => (
          <div 
            key={item.originalIndex} 
            className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl transition-all hover:bg-orange-50/50 hover:border-orange-200"
          >
             {/* Nút điều hướng Lên/Xuống */}
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
             
             {/* Nhãn A, B, C ban đầu */}
             <div className="flex items-center justify-center min-w-9 h-9 font-bold text-orange-600 bg-orange-100 rounded-lg shrink-0">
                {item.letter}
             </div>
             
             {/* Nội dung câu */}
             <div className="flex-1 text-slate-700 text-sm md:text-base leading-relaxed">
                {item.text}
             </div>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default ReorderQuestion;