import React, { useState, useEffect, useRef } from 'react';
import ScheduleBlock from './ScheduleBlock';
import './SchedulerGrid.css';

const SchedulerGrid = ({ 
  schedules, 
  onOpenCreateModal, 
  onOpenEditModal,
  onUpdateScheduleBounds, 
  setHoveredCell, 
  setHoveredScheduleId,
  hoveredScheduleId 
}) => {
  const [isDraggingToCreate, setIsDraggingToCreate] = useState(false);
  const [dragStartIdx, setDragStartIdx] = useState(null);
  const [dragCurrentIdx, setDragCurrentIdx] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const gridRef = useRef(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const cols = Array.from({ length: 6 }, (_, i) => i);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Adding a slight delay ensures the smooth animation fires after initial render
    const timer = setTimeout(() => {
      if (gridRef.current) {
        const currentHour = new Date().getHours();
        const scrollPos = currentHour * 46;
        gridRef.current.scrollTo({
          top: Math.max(0, scrollPos - 120),
          behavior: 'smooth'
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDraggingToCreate && dragStartIdx !== null && dragCurrentIdx !== null) {
        const minIdx = Math.min(dragStartIdx, dragCurrentIdx);
        const maxIdx = Math.max(dragStartIdx, dragCurrentIdx);
        onOpenCreateModal(minIdx, maxIdx);
      }
      setIsDraggingToCreate(false);
      setDragStartIdx(null);
      setDragCurrentIdx(null);
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDraggingToCreate, dragStartIdx, dragCurrentIdx, onOpenCreateModal]);

  const handleCellMouseDown = (row, col) => {
    const idx = row * 6 + col;
    setIsDraggingToCreate(true);
    setDragStartIdx(idx);
    setDragCurrentIdx(idx);
  };

  const handleCellMouseEnter = (row, col) => {
    const idx = row * 6 + col;
    setHoveredCell({ row, col });
    if (isDraggingToCreate) {
      setDragCurrentIdx(idx);
    }
  };

  const isCellSelected = (row, col) => {
    if (!isDraggingToCreate || dragStartIdx === null || dragCurrentIdx === null) return false;
    const minIdx = Math.min(dragStartIdx, dragCurrentIdx);
    const maxIdx = Math.max(dragStartIdx, dragCurrentIdx);
    const cellIdx = row * 6 + col;
    return cellIdx >= minIdx && cellIdx <= maxIdx;
  };

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  return (
    <div className="scheduler-wrapper" ref={gridRef}>
      <div className="grid-header">
        <div className="time-col-header"></div>
        {cols.map(c => (
          <div key={c} className="col-header"></div>
        ))}
      </div>
      <div className="grid-body">
        <div 
          className="current-time-indicator"
          style={{
            top: `${currentHour * 46}px`,
            left: `calc(80px + ${currentMinute / 60} * (100% - 80px))`
          }}
        >
          <div className="indicator-dot" />
          <div className="indicator-line" />
        </div>

        {hours.map(hour => (
          <div key={hour} className="grid-row">
            <div className="time-col">
              {hour.toString().padStart(2, '0')}:00
            </div>
            <div className="cells-container">
              {cols.map(col => (
                <div 
                  key={col} 
                  className={`grid-cell ${isCellSelected(hour, col) ? 'selected' : ''}`}
                  onMouseDown={() => handleCellMouseDown(hour, col)}
                  onMouseEnter={() => handleCellMouseEnter(hour, col)}
                />
              ))}
            </div>
          </div>
        ))}

        {schedules.map(schedule => (
          <ScheduleBlock 
            key={schedule.id}
            schedule={schedule}
            onUpdateBounds={(bounds) => onUpdateScheduleBounds(schedule.id, bounds)}
            setHoveredScheduleId={setHoveredScheduleId}
            isHovered={hoveredScheduleId === schedule.id}
            onEdit={() => onOpenEditModal(schedule)}
          />
        ))}
      </div>
    </div>
  );
};

export default SchedulerGrid;
