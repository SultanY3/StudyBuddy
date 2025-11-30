import React, { useState, useEffect } from 'react';

export default function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTime = localStorage.getItem('pomodoroTime');
    return savedTime ? parseInt(savedTime, 10) : 25 * 60;
  });

  const [isActive, setIsActive] = useState(() => {
    const savedActive = localStorage.getItem('pomodoroActive');
    return savedActive === 'true';
  });

  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1;
          localStorage.setItem('pomodoroTime', newTime);
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      localStorage.setItem('pomodoroActive', 'false');
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    const newState = !isActive;
    setIsActive(newState);
    localStorage.setItem('pomodoroActive', newState.toString());
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    localStorage.setItem('pomodoroActive', 'false');
    localStorage.setItem('pomodoroTime', 25 * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="pomodoro">
      <div className="timer-display">
        {formatTime(timeLeft)}
      </div>
      
      <button 
        className="timer-btn"
        onClick={toggleTimer}
        style={{ 
          background: isActive ? '#cf6679' : '#03dac6', 
          color: isActive ? '#fff' : '#000',
        }}
      >
        {isActive ? 'Pause' : 'Start'}
      </button>

      <button 
        className="timer-btn"
        onClick={resetTimer}
        style={{ 
          background: 'transparent', 
          color: '#888',
          border: '1px solid #444',
          marginLeft: '5px',
          padding: '0.4rem 0.8rem'
        }}
        title="Reset Timer"
      >
        ↺
      </button>
    </div>
  );
}