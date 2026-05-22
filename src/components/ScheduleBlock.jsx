import React, { useRef, useEffect, useState } from 'react';
import './ScheduleBlock.css';
import { getPalette } from '../utils';

const ScheduleBlock = ({ schedule, onUpdateBounds, setHoveredScheduleId, isHovered, onEdit }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(null);
  const blockRefs = useRef({});
  const wasDragged = useRef(false);

  const palette = getPalette().find(p => p.id === schedule.color) || getPalette()[0];

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing && !isDragging) return;
      wasDragged.current = true;

      const firstRef = Object.values(blockRefs.current)[0];
      const gridBody = firstRef?.closest('.grid-body');
      if (!gridBody) return;

      const rect = gridBody.getBoundingClientRect();
      const cellWidth = (rect.width - 80) / 6;

      if (isResizing) {
        let currentMouseRow = Math.floor((e.clientY - rect.top) / 46);
        let currentMouseCol = Math.floor((e.clientX - rect.left - 80) / cellWidth);
        
        currentMouseRow = Math.max(0, Math.min(23, currentMouseRow));
        currentMouseCol = Math.max(0, Math.min(5, currentMouseCol));

        const currentIndex = currentMouseRow * 6 + currentMouseCol;

        if (isResizing === 'left') {
          if (currentIndex <= schedule.endIndex) {
            onUpdateBounds({ startIndex: currentIndex });
          }
        } else if (isResizing === 'right') {
          if (currentIndex >= schedule.startIndex) {
            onUpdateBounds({ endIndex: currentIndex });
          }
        }
      } else if (isDragging) {
        let currentMouseRow = Math.floor((e.clientY - rect.top) / 46);
        let currentMouseCol = Math.floor((e.clientX - rect.left - 80) / cellWidth);
        
        currentMouseRow = Math.max(0, Math.min(23, currentMouseRow));
        currentMouseCol = Math.max(0, Math.min(5, currentMouseCol));

        let currentIndex = currentMouseRow * 6 + currentMouseCol;
        const duration = schedule.endIndex - schedule.startIndex;
        
        if (currentIndex + duration > 143) {
          currentIndex = 143 - duration;
        }

        if (currentIndex !== schedule.startIndex) {
          onUpdateBounds({ 
            startIndex: currentIndex, 
            endIndex: currentIndex + duration 
          });
        }
      }
    };

    const handleMouseUp = () => {
      if (isDragging && !wasDragged.current) {
        onEdit();
      }
      setIsResizing(null);
      setIsDragging(false);
      setTimeout(() => wasDragged.current = false, 0);
    };

    if (isResizing || isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isDragging, schedule, onUpdateBounds]);

  const handleResizeStart = (e, direction) => {
    e.stopPropagation();
    setIsResizing(direction);
  };

  const handleDragStart = (e) => {
    if (e.target.classList.contains('resize-handle')) return;
    e.stopPropagation();
    setIsDragging(true);
    wasDragged.current = false;
  };

  const segments = [];
  let currentStartIdx = schedule.startIndex;
  
  while (currentStartIdx <= schedule.endIndex) {
    const row = Math.floor(currentStartIdx / 6);
    const startCol = currentStartIdx % 6;
    let endCol;
    
    if (Math.floor(schedule.endIndex / 6) === row) {
      endCol = schedule.endIndex % 6;
    } else {
      endCol = 5;
    }
    
    segments.push({
      id: `${schedule.id}-${row}`,
      row,
      startCol,
      endCol,
      isFirst: currentStartIdx === schedule.startIndex,
      isLast: row === Math.floor(schedule.endIndex / 6)
    });
    
    currentStartIdx = (row + 1) * 6;
  }

  return (
    <>
      {segments.map((seg) => (
        <div 
          key={seg.id}
          ref={el => blockRefs.current[seg.id] = el}
          className={`schedule-block ${isHovered ? 'hovered' : ''} ${isDragging ? 'dragging' : ''} ${!seg.isFirst ? 'not-first' : ''} ${!seg.isLast ? 'not-last' : ''}`}
          style={{
            top: `calc(${seg.row} * 46px + 4px)`,
            left: `calc(80px + ${seg.startCol} * ((100% - 80px) / 6))`,
            width: `calc(${seg.endCol - seg.startCol + 1} * ((100% - 80px) / 6))`,
            backgroundColor: palette.bg,
            borderColor: palette.border,
            color: palette.text
          }}
          onMouseEnter={() => setHoveredScheduleId(schedule.id)}
          onMouseLeave={() => setHoveredScheduleId(null)}
          onMouseDown={handleDragStart}
        >
          {seg.isFirst && (
            <div className="block-content">
              <span className="block-title">{schedule.title}</span>
              {schedule.endIndex - schedule.startIndex >= 1 && (
                <span className="block-category">{schedule.category}</span>
              )}
            </div>
          )}

          {seg.isFirst && (
            <div 
              className="resize-handle left" 
              onMouseDown={(e) => handleResizeStart(e, 'left')} 
            />
          )}
          {seg.isLast && (
            <div 
              className="resize-handle right" 
              onMouseDown={(e) => handleResizeStart(e, 'right')} 
            />
          )}
        </div>
      ))}
    </>
  );
};

export default ScheduleBlock;
