import React, { useState, useEffect, useRef } from 'react';
import './Modal.css';
import { getPalette } from '../utils';

const Modal = ({ onClose, onSave, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState(initialData?.category || '회의');
  const [detail, setDetail] = useState(initialData?.detail || '');
  const [color, setColor] = useState(initialData?.color || 'slateBlue');
  const [error, setError] = useState(false);
  
  const titleInputRef = useRef(null);

  const categories = ['자격증', '회의', '자소서', '운동', '기타'];
  const palette = getPalette();

  useEffect(() => {
    // Focus title input on mount
    titleInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    // Attach to window to catch global enter, but check if we are in textarea
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, category, detail, color]);

  const handleSave = () => {
    if (!title.trim()) {
      setError(true);
      setTimeout(() => setError(false), 500);
      return;
    }
    onSave({ title, category, detail, color });
  };

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className={`modal-container ${error ? 'shake' : ''}`} onMouseDown={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? '일정 수정' : '새 일정'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>일정 내용</label>
            <input 
              ref={titleInputRef}
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="일정 내용을 입력하세요"
              className={error ? 'input-error' : ''}
            />
          </div>

          <div className="form-group">
            <label>카테고리</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>상세 내용</label>
            <textarea 
              value={detail} 
              onChange={e => setDetail(e.target.value)}
              placeholder="상세 내용을 입력하세요 (선택)"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>테마 색상</label>
            <div className="color-picker">
              {palette.map(p => (
                <div 
                  key={p.id}
                  className={`color-circle ${color === p.id ? 'selected' : ''}`}
                  style={{ backgroundColor: p.bg, borderColor: p.border }}
                  onClick={() => setColor(p.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>취소</button>
          <button className="btn-save" onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
