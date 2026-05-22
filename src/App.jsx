import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import SchedulerGrid from './components/SchedulerGrid';
import Modal from './components/Modal';
import { generateId } from './utils';
import './App.css';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedulesByDate, setSchedulesByDate] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [hoveredScheduleId, setHoveredScheduleId] = useState(null);
  const [copiedSchedule, setCopiedSchedule] = useState(null);

  const dateKey = selectedDate.toISOString().split('T')[0];
  const schedules = schedulesByDate[dateKey] || [];

  const updateSchedules = (updater) => {
    setSchedulesByDate(prev => {
      const current = prev[dateKey] || [];
      const updated = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, [dateKey]: updated };
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
        return;
      }

      if (!isModalOpen) {
        if ((e.key === 'Delete' || e.key === 'Backspace') && hoveredScheduleId) {
          updateSchedules(prev => prev.filter(s => s.id !== hoveredScheduleId));
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && hoveredScheduleId) {
          const scheduleToCopy = schedules.find(s => s.id === hoveredScheduleId);
          if (scheduleToCopy) {
            setCopiedSchedule(scheduleToCopy);
          }
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'v' && copiedSchedule && hoveredCell) {
          const duration = copiedSchedule.endIndex - copiedSchedule.startIndex;
          const absoluteStartIndex = hoveredCell.row * 6 + hoveredCell.col;
          const absoluteEndIndex = absoluteStartIndex + duration;

          if (absoluteEndIndex < 144) {
            updateSchedules(prev => [...prev, {
              ...copiedSchedule,
              id: generateId(),
              startIndex: absoluteStartIndex,
              endIndex: absoluteEndIndex
            }]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, hoveredScheduleId, schedules, copiedSchedule, hoveredCell]);

  const handleCreateSchedule = (data) => {
    if (modalData.editingId) {
      updateSchedules(prev => prev.map(s => s.id === modalData.editingId ? { ...s, ...data } : s));
    } else {
      updateSchedules(prev => [...prev, {
        id: generateId(),
        startIndex: modalData.startIndex,
        endIndex: modalData.endIndex,
        ...data
      }]);
    }
    setIsModalOpen(false);
  };

  const handleUpdateScheduleBounds = (id, newBounds) => {
    updateSchedules(prev => prev.map(s => s.id === id ? { ...s, ...newBounds } : s));
  };

  const openCreateModal = (startIndex, endIndex) => {
    setModalData({ startIndex, endIndex, editingId: null });
    setIsModalOpen(true);
  };

  const openEditModal = (schedule) => {
    setModalData({ ...schedule, editingId: schedule.id });
    setIsModalOpen(true);
  };

  return (
    <div className="app-container">
      <Sidebar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      <main className="app-main">
        <SchedulerGrid 
          schedules={schedules}
          onOpenCreateModal={openCreateModal}
          onOpenEditModal={openEditModal}
          onUpdateScheduleBounds={handleUpdateScheduleBounds}
          setHoveredCell={setHoveredCell}
          setHoveredScheduleId={setHoveredScheduleId}
          hoveredScheduleId={hoveredScheduleId}
        />
      </main>
      {isModalOpen && (
        <Modal 
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreateSchedule}
        />
      )}
    </div>
  );
}

export default App;
