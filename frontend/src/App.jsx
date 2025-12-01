import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Pomodoro from './Pomodoro';

// --- SUB-COMPONENTS ---

const FlashcardItem = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flashcard-container">
      <div
        className={`flashcard ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flashcard-face flashcard-front">
          <p style={{ margin: 0, fontWeight: '600', fontSize: '1.2rem' }}>{card.front}</p>
          <span className="hint">Tap to flip</span>
        </div>
        <div className="flashcard-face flashcard-back">
          <p style={{ margin: 0, fontSize: '1.1rem' }}>{card.back}</p>
        </div>
      </div>
    </div>
  );
};

const QuizExam = ({ quiz }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (qIndex, optionIndex) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  if (submitted) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="exam-container">
        <div className="score-card" style={{ marginBottom: '0', paddingBottom: '0', background: 'transparent' }}>
          <h2>Exam Results</h2>
          <div className="score-display" style={{ fontSize: '5rem', color: '#4caf50', textShadow: '0 0 20px rgba(76,175,80,0.4)' }}>
            {percentage}%
          </div>
          <p style={{ fontSize: '1.2rem', color: '#b0b0b0' }}>
            You scored <strong style={{ color: 'white' }}>{score}</strong> out of {quiz.questions.length}
          </p>
          <button
            className="primary"
            onClick={() => window.location.reload()}
            style={{ margin: '20px 0', width: '100%' }}
          >
            Start New Session
          </button>
        </div>

        <div className="review-section">
          <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Review Answers:</h3>
          {quiz.questions.map((q, qIndex) => {
            const userAnswer = answers[qIndex];
            const isCorrectAnswer = userAnswer === q.correct_answer;

            return (
              <div key={q.id} className="question-block">
                <h4 style={{ marginTop: 0, color: isCorrectAnswer ? '#4caf50' : '#cf6679' }}>
                  {qIndex + 1}. {q.text}
                </h4>
                <div className="options-grid">
                  {q.options.map((option, oIndex) => {
                    const isSelected = userAnswer === oIndex;
                    const isCorrect = q.correct_answer === oIndex;

                    let btnClass = "option-btn";
                    if (isCorrect) btnClass += " correct";
                    else if (isSelected) btnClass += " wrong";
                    else btnClass += " dimmed";

                    return (
                      <button key={oIndex} className={btnClass} disabled>
                        <span style={{ marginRight: '10px', opacity: 0.8, fontWeight: 'bold' }}>
                          {String.fromCharCode(65 + oIndex)}.
                        </span>
                        {option}
                        {isCorrect && <i className="bi bi-check-circle-fill" style={{ float: 'right', fontSize: '1.2rem' }}></i>}
                        {isSelected && !isCorrect && <i className="bi bi-x-circle-fill" style={{ float: 'right', fontSize: '1.2rem' }}></i>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="exam-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>{quiz.topic} Exam</h2>
        <span style={{ background: '#333', padding: '5px 10px', borderRadius: '8px', fontSize: '0.9rem' }}>
          {quiz.questions.length} Qs
        </span>
      </div>

      {quiz.questions.map((q, qIndex) => (
        <div key={q.id} className="question-block">
          <h3 style={{ marginTop: 0 }}>{qIndex + 1}. {q.text}</h3>
          <div className="options-grid">
            {q.options.map((option, oIndex) => (
              <button
                key={oIndex}
                className={`option-btn ${answers[qIndex] === oIndex ? 'selected' : ''}`}
                onClick={() => handleSelect(qIndex, oIndex)}
              >
                <span style={{ marginRight: '10px', opacity: 0.5, fontWeight: 'bold' }}>
                  {String.fromCharCode(65 + oIndex)}.
                </span>
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        className="primary"
        style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1.1rem' }}
        onClick={handleSubmit}
        disabled={Object.keys(answers).length < quiz.questions.length}
      >
        Submit Exam
      </button>
    </div>
  );
};

// --- MAIN APP ---

function App() {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState('idle');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const fetchData = async (endpoint, modeName) => {
    setLoading(true);
    try {
      // Temporarily hard-code for testing
      const API_BASE_URL = 'https://studybuddy-rptf.onrender.com';
      console.log('Using API URL:', API_BASE_URL); // Add this to verify
      const res = await axios.post(`${API_BASE_URL}/api/${endpoint}/`, { topic });
      setData(res.data);
      setMode(modeName);
    } catch (err) {
      console.error(err);
      alert("Error connecting to server. Ensure Django is running.");
      setMode('idle');
    }
    setLoading(false);
  };

  const handleChipClick = (text) => {
    setTopic(text);
  };

  const goHome = () => {
    setTopic('');
    setMode('idle');
    setData(null);
  };

  return (
    <>
      <header className="app-header">
        <h1
          onClick={goHome}
          style={{ cursor: 'pointer', userSelect: 'none' }}
          title="Go to Home"
        >
          StudyBuddy
        </h1>
        <Pomodoro />
      </header>

      <div className="main-wrapper">

        {mode === 'idle' && !loading && (
          <div className="hero-section">
            <h1 className="hero-title">Master Any Topic</h1>
            <p className="hero-subtitle">
              Your AI-powered study companion. Generate flashcards, take quizzes, and get instant explanations.
            </p>
          </div>
        )}

        <div className="content-panel">

          <div className="controls">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What do you want to learn today?"
              onKeyDown={(e) => e.key === 'Enter' && fetchData('generate-cards', 'flashcards')}
            />
            <button className="secondary" onClick={() => fetchData('generate-explanation', 'explanation')} disabled={loading || !topic}>
              <i className="bi bi-lightbulb-fill" style={{ marginRight: '8px' }}></i>
              Explain
            </button>
            <button className="secondary" onClick={() => fetchData('generate-cards', 'flashcards')} disabled={loading || !topic}>
              <i className="bi bi-lightning-charge-fill" style={{ marginRight: '8px' }}></i>
              Flashcards
            </button>
            <button className="secondary" onClick={() => fetchData('generate-quiz', 'quiz')} disabled={loading || !topic} style={{ borderColor: '#03dac6', color: '#03dac6' }}>
              <i className="bi bi-pencil-square" style={{ marginRight: '8px' }}></i>
              Quiz
            </button>
          </div>

          {mode === 'idle' && !loading && (
            <div className="suggestions">
              Try:
              <span className="chip" onClick={() => handleChipClick('Photosynthesis')}>Photosynthesis</span>
              <span className="chip" onClick={() => handleChipClick('French Revolution')}>French Revolution</span>
              <span className="chip" onClick={() => handleChipClick('Python Arrays')}>Python Arrays</span>
            </div>
          )}

          <main>
            {loading && (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
                <div className="spinner"></div>
                <p>Generating content for <strong>{topic}</strong>...</p>
              </div>
            )}

            {!loading && mode === 'idle' && (
              <div className="features-preview">
                <div className="feature-card">
                  <i className="bi bi-lightbulb-fill feature-icon" style={{ color: '#cf6679' }}></i>
                  <h3>Instant Explain</h3>
                  <p>Get concise, easy-to-understand summaries of complex topics in seconds.</p>
                </div>
                <div className="feature-card">
                  <i className="bi bi-lightning-charge-fill feature-icon" style={{ color: '#bb86fc' }}></i>
                  <h3>AI Flashcards</h3>
                  <p>Instantly generate decks for any subject to boost your memory retention.</p>
                </div>
                <div className="feature-card">
                  <i className="bi bi-card-checklist feature-icon" style={{ color: '#03dac6' }}></i>
                  <h3>Smart Quizzes</h3>
                  <p>Test your knowledge with multiple-choice questions and instant feedback.</p>
                </div>
              </div>
            )}

            {!loading && mode === 'explanation' && data && (
              <div className="explanation-container">
                <h2 style={{ color: '#03dac6', marginBottom: '1.5rem' }}>Overview: {data.topic}</h2>
                <div className="explanation-text">{data.explanation}</div>
              </div>
            )}

            {!loading && mode === 'flashcards' && data && (
              <div>
                <h2 style={{ marginBottom: '1.5rem', color: '#fff' }}>Topic: {data.topic}</h2>
                <div className="card-grid">
                  {data.cards.map(card => <FlashcardItem key={card.id} card={card} />)}
                </div>
              </div>
            )}

            {!loading && mode === 'quiz' && data && (
              <QuizExam quiz={data} />
            )}
          </main>
        </div>

        <footer className="app-footer">
          <p>© 2025 StudyBuddy AI. Built with React & Django.</p>
          <p>
            <a href="#">Privacy</a> • <a href="#">Terms</a> • <a href="#">GitHub</a>
          </p>
        </footer>
      </div>
    </>
  );
}

export default App;