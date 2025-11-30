import React, { useState } from 'react';
import './Flashcard.css'; 

export default function Flashcard({ card }) {
  const [flip, setFlip] = useState(false);

  return (
    <div 
      className={`card ${flip ? 'flip' : ''}`} 
      onClick={() => setFlip(!flip)}
    >
      <div className="front">
        {card.front}
        <div className="hint">Click to flip</div>
      </div>
      <div className="back">
        {card.back}
      </div>
    </div>
  );
}