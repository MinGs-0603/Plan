import React, { useState, useEffect } from 'react';
import './Sidebar.css';

const Sidebar = ({ selectedDate, onSelectDate }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  
  const isToday = selectedDate.toDateString() === now.toDateString();
  const todayStr = `${months[selectedDate.getMonth()]}.${selectedDate.getDate().toString().padStart(2, '0')} ${days[selectedDate.getDay()]}${isToday ? ', Today' : ''}`;
  const timeStr = now.toLocaleTimeString('en-US');

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const handleDateClick = (d) => {
    if (!d) return;
    const newDate = new Date(year, month, d);
    // Preserving the current time component to avoid edge cases
    newDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    onSelectDate(newDate);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <h1 className="date-display">{todayStr}</h1>
        <div className="time-display">{timeStr}</div>
      </div>
      
      <div className="mini-calendar">
        <div className="calendar-header">
          {selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <div className="calendar-grid">
          {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="cal-day-label">{d}</div>)}
          {calendarDays.map((d, i) => {
            const isSelected = d === selectedDate.getDate();
            const isCurrentToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear();
            return (
              <div 
                key={i} 
                className={`cal-day ${isSelected ? 'selected' : ''} ${isCurrentToday && !isSelected ? 'today-outline' : ''} ${!d ? 'empty' : ''}`}
                onClick={() => handleDateClick(d)}
              >
                {d || ''}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
