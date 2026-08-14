import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Button } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, HolderOutlined } from '@ant-design/icons';

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const NAVY = '#1E3A8A';
const NAVY_LIGHT = '#EFF4FF';
const NAVY_BORDER = '#BFDBFE';

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

  const initialShuffledOrder = useMemo(() => {
    if (!options || !Array.isArray(options)) return [];
    const order = options.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }, [options]);

  useEffect(() => {
    if ((!selectedValue || selectedValue.trim() === '') && initialShuffledOrder.length > 0) {
      const shuffledString = initialShuffledOrder.map(idx => LETTERS[idx]).join('-');
      if (onChange) onChange(questionId, shuffledString);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialShuffledOrder]);

  if (!options || !Array.isArray(options) || options.length === 0) return null;

  let currentOrder = [];
  if (selectedValue && typeof selectedValue === 'string' && selectedValue.includes('-')) {
    const selectedLetters = selectedValue.split('-');
    currentOrder = selectedLetters.map(letter => LETTERS.indexOf(letter.toUpperCase()));
    if (currentOrder.some(idx => idx === -1 || idx >= options.length)) {
      currentOrder = initialShuffledOrder;
    }
  } else {
    currentOrder = initialShuffledOrder;
  }

  const items = currentOrder.map(idx => ({
    originalIndex: idx,
    letter: LETTERS[idx],
    text: options[idx]
  }));

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

  const handleDragStart = (e, index) => {
    dragItem.current = index;
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e, index) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
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
      onChange(questionId, newItems.map(item => item.letter).join('-'));
    }
  };

  return (
    <div style={{ padding: '28px 0', borderTop: '1px solid #E5E7EB' }}>

      {/* Question header */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{
          minWidth: 24, height: 24,
          background: NAVY, color: '#fff',
          borderRadius: 5, fontWeight: 700, fontSize: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginTop: 1,
        }}>
          {questionNumber}
        </span>
        <span style={{ fontSize: 14, color: '#1F2937', fontWeight: 500, lineHeight: 1.65 }}>
          Arrange the following sentences in the correct order to form a meaningful passage:
        </span>
      </div>

      {/* Example sentence (sentence 0) */}
      {questionText && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px',
          marginLeft: 34, marginBottom: 10,
          borderRadius: 7,
          background: '#F9FAFB',
          border: '1px solid #E5E7EB',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 6,
            background: '#E5E7EB', color: '#9CA3AF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, flexShrink: 0,
          }}>0</div>
          <span style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>{questionText}</span>
        </div>
      )}

      {/* Draggable list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingLeft: 34 }}>
        {items.map((item, idx) => {
          const isDragging = draggingIndex === idx;
          return (
            <div
              key={item.originalIndex}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnter={(e) => handleDragEnter(e, idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                borderRadius: 7,
                border: `1px solid ${isDragging ? NAVY_BORDER : '#E5E7EB'}`,
                background: isDragging ? NAVY_LIGHT : '#FAFAFA',
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              {/* Drag handle */}
              <span style={{ color: '#D1D5DB', cursor: 'grab', flexShrink: 0, lineHeight: 1 }}>
                <HolderOutlined style={{ fontSize: 16 }} />
              </span>

              {/* Up/Down buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
                <Button
                  size="small"
                  type="text"
                  icon={<ArrowUpOutlined />}
                  onClick={() => moveItem(idx, 'UP')}
                  disabled={idx === 0}
                  style={{ color: idx === 0 ? '#E5E7EB' : '#9CA3AF', padding: '0 4px', height: 18, lineHeight: 1 }}
                />
                <Button
                  size="small"
                  type="text"
                  icon={<ArrowDownOutlined />}
                  onClick={() => moveItem(idx, 'DOWN')}
                  disabled={idx === items.length - 1}
                  style={{ color: idx === items.length - 1 ? '#E5E7EB' : '#9CA3AF', padding: '0 4px', height: 18, lineHeight: 1 }}
                />
              </div>

              {/* Letter badge */}
              <div style={{
                width: 30, height: 30, borderRadius: 6,
                background: NAVY, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13, flexShrink: 0,
              }}>
                {item.letter}
              </div>

              {/* Sentence text */}
              <span style={{
                flex: 1, fontSize: 14, color: '#374151',
                lineHeight: 1.6, userSelect: 'none',
              }}>
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReorderQuestion;