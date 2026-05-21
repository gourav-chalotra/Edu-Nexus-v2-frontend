import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, BookOpen, Trophy, Play, Sparkles, User as UserIcon, Clock, ArrowRight, Check, X, ChevronRight, Mail, Phone, FileText, ListPlus, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

// Predefined Avatars List
const AVATARS = [
  { id: 'avatar_1', name: 'Space Explorer', emoji: '🚀', bg: 'linear-gradient(135deg, #6366f1, #a855f7)' },
  { id: 'avatar_2', name: 'Code Knight', emoji: '💻', bg: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
  { id: 'avatar_3', name: 'Math Wiz', emoji: '📐', bg: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
  { id: 'avatar_4', name: 'Bio Alchemist', emoji: '🧪', bg: 'linear-gradient(135deg, #10b981, #84cc16)' },
  { id: 'avatar_5', name: 'Trivia Master', emoji: '🧠', bg: 'linear-gradient(135deg, #eab308, #f97316)' },
  { id: 'avatar_6', name: 'Word Sorcerer', emoji: '✍️', bg: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
];

const renderAvatar = (avatarId, size = 40) => {
  const isCustom = avatarId && avatarId.startsWith('data:image/');
  
  if (isCustom) {
    return (
      <img
        src={avatarId}
        alt="Custom Profile"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid var(--color-primary)',
          display: 'block'
        }}
      />
    );
  }

  const avatar = AVATARS.find((a) => a.id === avatarId);
  const emoji = avatar ? avatar.emoji : '🚀';
  const bg = avatar ? avatar.bg : 'linear-gradient(135deg, #6366f1, #a855f7)';

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size > 40 ? '2rem' : '1.2rem',
      border: '2px solid var(--color-primary)'
    }}>
      {emoji}
    </div>
  );
};

// Badge descriptions and styling details
const BADGE_DETAILS = {
  'Pioneer': { icon: '🌟', color: '#3b82f6', desc: 'Attempted first learning quiz' },
  'Mastermind': { icon: '🎯', color: '#10b981', desc: 'Scored 100% correct answers on a quiz' },
  'Word Wizard': { icon: '📚', color: '#f97316', desc: 'Mastered English language test' },
  'Math Legend': { icon: '📊', color: '#3b82f6', desc: 'Conquered mathematical challenge' },
  'Science Pioneer': { icon: '🔬', color: '#10b981', desc: 'Discovered Science concepts' },
  'Trivia Master': { icon: '💡', color: '#eab308', desc: 'Aced General Knowledge quiz' },
  'Code Knight': { icon: '🛡️', color: '#ec4899', desc: 'Demonstrated programming skills' },
  'Scholar Elite': { icon: '👑', color: '#8b5cf6', desc: 'Reached Level 5+ in knowledge quests' },
};

const StudentDashboard = () => {
  const { user, token, updateProfile, updateGamifiedStats } = useAuth();

  // Navigation: 'learn' | 'leaderboard' | 'profile'
  const [activeTab, setActiveTab] = useState('learn');

  // Subjects lists
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  
  // Learning states (Chapter modal/viewer)
  const [activeChapter, setActiveChapter] = useState(null);

  // Quiz Engine States
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // Index of chosen option
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [quizTimer, setQuizTimer] = useState(20); // 20s per question
  const [quizResults, setQuizResults] = useState(null);
  const timerRef = useRef(null);

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState([]);

  // Profile Form States
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState(user.phone || '');
  const [profileRoll, setProfileRoll] = useState(user.rollNo || '');
  const [profilePic, setProfilePic] = useState(user.profilePic || 'avatar_1');

  // Messaging logs
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedSubject) {
      fetchChaptersAndQuizzes();
    }
  }, [selectedSubject]);

  // QUIZ ENGINE TIMER LOGIC
  useEffect(() => {
    if (activeQuiz && !hasCheckedAnswer && !quizResults) {
      setQuizTimer(20);
      timerRef.current = setInterval(() => {
        setQuizTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Handle timeout
            handleNextQuestion(true); // Treat as skipped / timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [activeQuiz, currentQuestionIndex, hasCheckedAnswer, quizResults]);

  // SERVICES AND API FETCHES
  const fetchChaptersAndQuizzes = async () => {
    setLoading(true);
    try {
      // 1. Fetch chapters
      const chRes = await fetch(`/api/student/chapters/${selectedSubject}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const chData = await chRes.json();
      if (!chRes.ok) throw new Error(chData.message);
      setChapters(chData);

      // 2. Fetch quizzes
      const qRes = await fetch(`/api/student/quizzes/${selectedSubject}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const qData = await qRes.json();
      if (!qRes.ok) throw new Error(qData.message);
      setQuizzes(qData);
    } catch (err) {
      setError(err.message || 'Failed to fetch chapters & quizzes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/student/leaderboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setLeaderboard(data);
    } catch (err) {
      setError(err.message || 'Failed to load class leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  // PROFILE UPDATES
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile({
        name: profileName,
        phone: profilePhone,
        rollNo: profileRoll,
        profilePic,
      });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size - limit to 1.5MB to avoid large strings in MongoDB
    if (file.size > 1.5 * 1024 * 1024) {
      setError('Custom image must be smaller than 1.5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfilePic(reader.result);
      setSuccess('Custom avatar loaded. Click "Save Profile" to apply!');
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  // QUIZ ENGINE FLOW
  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setHasCheckedAnswer(false);
    setStudentAnswers([]);
    setQuizResults(null);
    setError('');
  };

  const handleSelectOption = (optIndex) => {
    if (hasCheckedAnswer) return;
    setSelectedAnswer(optIndex);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    clearInterval(timerRef.current);
    setHasCheckedAnswer(true);
  };

  const handleNextQuestion = (isTimeout = false) => {
    const chosenAnswer = isTimeout ? -1 : selectedAnswer;
    const nextAnswers = [...studentAnswers, chosenAnswer];
    setStudentAnswers(nextAnswers);

    if (currentQuestionIndex + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setHasCheckedAnswer(false);
    } else {
      // Quiz complete: Submit to backend
      submitQuiz(nextAnswers);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/quizzes/${activeQuiz._id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setQuizResults(data);

      // Trigger Confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Synchronize context stats immediately
      updateGamifiedStats(data.currentXp, data.newLevel, data.updatedBadges);
    } catch (err) {
      setError(err.message || 'Failed to submit quiz.');
    } finally {
      setLoading(false);
    }
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
    setQuizResults(null);
    fetchChaptersAndQuizzes();
  };

  const getSubjectColor = (subject) => {
    switch (subject) {
      case 'Maths': return 'var(--sub-maths)';
      case 'Science': return 'var(--sub-science)';
      case 'English': return 'var(--sub-english)';
      case 'General Knowledge': return 'var(--sub-gk)';
      case 'Computer': return 'var(--sub-computer)';
      default: return 'var(--color-primary)';
    }
  };

  const getAvatarEmoji = (avatarId) => {
    const avatar = AVATARS.find((a) => a.id === avatarId);
    return avatar ? avatar.emoji : '🚀';
  };

  const getAvatarStyle = (avatarId) => {
    const avatar = AVATARS.find((a) => a.id === avatarId);
    return avatar ? { background: avatar.bg } : { background: 'var(--color-primary)' };
  };

  return (
    <div className="main-content">
      {/* Student Navigation Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', fontWeight: 800 }}>Student Portal</h1>
          <p style={{ color: '#94a3b8' }}>Review your subjects, attempt tests, and level up your skills.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => { setActiveTab('learn'); setSelectedSubject(null); }}
            className={activeTab === 'learn' ? 'btn-primary' : 'btn-secondary'}
          >
            <BookOpen size={18} />
            <span>Learning Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={activeTab === 'leaderboard' ? 'btn-primary' : 'btn-secondary'}
          >
            <Trophy size={18} />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}
          >
            <UserIcon size={18} />
            <span>My Profile</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '16px', color: '#f87171', marginBottom: '24px' }} className="animate-shake">
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '16px', color: '#34d399', marginBottom: '24px' }}>
          {success}
        </div>
      )}

      {/* ==========================================
         TAB 1: LEARNING DASHBOARD
         ========================================== */}
      {activeTab === 'learn' && (
        <div>
          {!selectedSubject ? (
            /* Subjects Choice Grid */
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', fontFamily: 'Outfit' }}>Select Subject Quest</h2>
              <div className="grid-cols-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                {['English', 'Maths', 'Science', 'General Knowledge', 'Computer'].map((sub) => {
                  const subColor = getSubjectColor(sub);
                  return (
                    <div
                      key={sub}
                      onClick={() => setSelectedSubject(sub)}
                      className="glass-card animate-glow"
                      style={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        padding: '40px 24px',
                        border: `1px solid rgba(255,255,255,0.05)`,
                        borderBottom: `4px solid ${subColor}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px'
                      }}
                    >
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        background: `rgba(255,255,255,0.02)`,
                        border: `1px solid rgba(255,255,255,0.08)`,
                        color: subColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.8rem',
                        fontWeight: 'bold'
                      }}>
                        {sub === 'Maths' ? '📐' : sub === 'Science' ? '🔬' : sub === 'English' ? '📚' : sub === 'General Knowledge' ? '💡' : '🛡️'}
                      </div>
                      <h3 style={{ fontSize: '1.3rem', fontFamily: 'Outfit' }}>{sub}</h3>
                      <button className="btn-secondary" style={{ padding: '6px 16px', fontSize: '0.8rem', width: '100%' }}>
                        <span>Explore</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Subject Learning modules page */
            <div>
              {/* Header Navigator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <button onClick={() => setSelectedSubject(null)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                  ← Back to Subjects
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.5rem', fontFamily: 'Outfit', fontWeight: 800 }}>{selectedSubject}</span>
                  <span className="badge badge-student">Class {user.classLevel}</span>
                </div>
              </div>

              {/* Chapters & Quizzes split columns */}
              <div className="grid-cols-2">
                
                {/* Chapters Section */}
                <div className="glass-card" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Play size={18} style={{ color: getSubjectColor(selectedSubject) }} />
                    <span>Watch Chapters</span>
                  </h2>

                  {loading && chapters.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>Gathering chapters...</div>
                  ) : chapters.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontStyle: 'italic' }}>
                      No chapters uploaded yet for this subject.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {chapters.map((ch) => (
                        <div
                          key={ch._id}
                          onClick={() => setActiveChapter(ch)}
                          className="glass-card"
                          style={{
                            padding: '16px',
                            cursor: 'pointer',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{ch.title}</h3>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {ch.description}
                            </p>
                          </div>
                          <Play size={16} style={{ color: getSubjectColor(selectedSubject), flexShrink: 0 }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quizzes Section */}
                <div className="glass-card" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ListPlus size={18} style={{ color: getSubjectColor(selectedSubject) }} />
                    <span>Gamified Quizzes</span>
                  </h2>

                  {loading && quizzes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>Gathering quizzes...</div>
                  ) : quizzes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontStyle: 'italic' }}>
                      No quizzes published yet for this subject.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {quizzes.map((quiz) => (
                        <div
                          key={quiz._id}
                          className="glass-card"
                          style={{
                            padding: '16px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <h3 style={{ fontSize: '1rem', marginBottom: '6px' }}>{quiz.title}</h3>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#94a3b8' }}>
                              <span>Questions: {quiz.questions.length}</span>
                              <span>Total Score: {quiz.totalPoints} XP</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {quiz.hasAttempted && (
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Best Attempt</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10b981' }}>
                                  {quiz.bestScore} / {quiz.totalPoints}
                                </div>
                              </div>
                            )}

                            <button
                              onClick={() => startQuiz(quiz)}
                              className="btn-primary"
                              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                            >
                              <span>{quiz.hasAttempted ? 'Replay' : 'Start'}</span>
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* MODAL: Active Chapter Video Player & Notes */}
              {activeChapter && (
                <div className="modal-overlay" onClick={() => setActiveChapter(null)}>
                  <div className="glass-card animate-glow" style={{
                    width: '90%',
                    maxWidth: '800px',
                    padding: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    position: 'relative'
                  }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setActiveChapter(null)}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '16px',
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <X size={20} />
                    </button>

                    <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', paddingRight: '24px' }}>{activeChapter.title}</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>{activeChapter.description}</p>

                    {/* YouTube Player */}
                    <div style={{
                      position: 'relative',
                      paddingBottom: '56.25%', // 16:9 Aspect Ratio
                      height: 0,
                      overflow: 'hidden',
                      borderRadius: '12px',
                      background: '#000',
                      marginBottom: '20px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <iframe
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                        }}
                        src={`https://www.youtube.com/embed/${activeChapter.videoLink}?autoplay=1`}
                        title={activeChapter.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>

                    {activeChapter.notes && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                        <h4 style={{ fontSize: '0.95rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <FileText size={16} />
                          <span>Teacher's Study Notes</span>
                        </h4>
                        <div style={{
                          background: 'rgba(0,0,0,0.2)',
                          padding: '16px',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          color: '#cbd5e1',
                          maxHeight: '150px',
                          overflowY: 'auto',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {activeChapter.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MODAL: ACTIVE GAMIFIED QUIZ ENGINE */}
              {activeQuiz && (
                <div className="modal-overlay">
                  <div className="glass-card animate-glow" style={{
                    width: '90%',
                    maxWidth: '600px',
                    padding: '40px',
                    border: `2px solid ${getSubjectColor(selectedSubject)}`,
                    boxShadow: `0 0 30px rgba(255,255,255,0.05)`,
                    textAlign: 'center',
                    position: 'relative'
                  }}>
                    
                    {!quizResults ? (
                      /* Question Screen */
                      <div>
                        {/* Quiz Header Progress */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                            Question <span style={{ color: '#fff', fontWeight: 700 }}>{currentQuestionIndex + 1}</span> of {activeQuiz.questions.length}
                          </span>
                          
                          {/* Timer Ring/Indicator */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={14} style={{ color: quizTimer <= 5 ? '#ef4444' : '#eab308' }} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: quizTimer <= 5 ? '#ef4444' : '#eab308' }}>
                              {quizTimer}s
                            </span>
                          </div>
                        </div>

                        {/* Quiz Timer Bar */}
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginBottom: '32px' }}>
                          <div
                            style={{
                              width: `${(quizTimer / 20) * 100}%`,
                              height: '100%',
                              background: quizTimer <= 5 ? '#ef4444' : getSubjectColor(selectedSubject),
                              transition: 'width 1s linear'
                            }}
                          />
                        </div>

                        {/* Question Text */}
                        <h2 style={{ fontSize: '1.4rem', marginBottom: '32px', lineHeight: '1.5' }}>
                          {activeQuiz.questions[currentQuestionIndex].questionText}
                        </h2>

                        {/* Options Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                          {activeQuiz.questions[currentQuestionIndex].options.map((opt, oIdx) => {
                            const isSelected = selectedAnswer === oIdx;
                            const isCorrectAnswer = activeQuiz.questions[currentQuestionIndex].correctAnswerIndex === oIdx;
                            
                            let optionStyle = {
                              padding: '16px',
                              borderRadius: '12px',
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              color: '#fff',
                              fontSize: '1rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            };

                            if (isSelected && !hasCheckedAnswer) {
                              optionStyle.border = `2px solid ${getSubjectColor(selectedSubject)}`;
                              optionStyle.background = `rgba(255, 255, 255, 0.05)`;
                            }

                            if (hasCheckedAnswer) {
                              if (isCorrectAnswer) {
                                optionStyle.border = '2px solid #10b981';
                                optionStyle.background = 'rgba(16, 185, 129, 0.1)';
                                optionStyle.color = '#34d399';
                              } else if (isSelected) {
                                optionStyle.border = '2px solid #ef4444';
                                optionStyle.background = 'rgba(239, 68, 68, 0.1)';
                                optionStyle.color = '#f87171';
                              }
                              optionStyle.cursor = 'default';
                            }

                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleSelectOption(oIdx)}
                                style={optionStyle}
                                disabled={hasCheckedAnswer}
                                className={isSelected && hasCheckedAnswer && !isCorrectAnswer ? 'animate-shake' : ''}
                              >
                                <span>{opt}</span>
                                {hasCheckedAnswer && isCorrectAnswer && <Check size={18} style={{ color: '#10b981' }} />}
                                {hasCheckedAnswer && isSelected && !isCorrectAnswer && <X size={18} style={{ color: '#ef4444' }} />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Submit / Advance controls */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                          <button onClick={closeQuiz} className="btn-secondary" style={{ marginRight: 'auto' }}>
                            Quit Quest
                          </button>
                          
                          {!hasCheckedAnswer ? (
                            <button
                              onClick={handleCheckAnswer}
                              className="btn-primary"
                              disabled={selectedAnswer === null}
                              style={{ background: selectedAnswer === null ? 'rgba(255,255,255,0.05)' : '', cursor: selectedAnswer === null ? 'default' : 'pointer' }}
                            >
                              Check Answer
                            </button>
                          ) : (
                            <button onClick={() => handleNextQuestion(false)} className="btn-primary">
                              <span>{currentQuestionIndex + 1 === activeQuiz.questions.length ? 'Submit Quiz' : 'Next Question'}</span>
                              <ChevronRight size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Quiz Completion Results Screen */
                      <div className="animate-float">
                        <div style={{
                          display: 'inline-flex',
                          padding: '16px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '2px solid #10b981',
                          borderRadius: '50%',
                          color: '#10b981',
                          marginBottom: '24px'
                        }} className="animate-glow">
                          <Sparkles size={36} />
                        </div>

                        <h2 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800, marginBottom: '8px' }}>
                          Quest Completed!
                        </h2>
                        <p style={{ color: '#94a3b8', marginBottom: '32px' }}>You successfully submitted the quiz challenge.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                          <div className="glass-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px' }}>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Score Earned</div>
                            <div style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800, color: '#8b5cf6' }}>
                              {quizResults.submission.score} / {quizResults.submission.totalPoints}
                            </div>
                          </div>

                          <div className="glass-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px' }}>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>XP Gained</div>
                            <div style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800, color: '#eab308' }}>
                              +{quizResults.xpEarned} XP
                            </div>
                          </div>
                        </div>

                        {/* Level Up Notification */}
                        {quizResults.levelUp && (
                          <div style={{
                            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(139, 92, 246, 0.15))',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '24px',
                            color: '#ec4899',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}>
                            <Trophy size={18} />
                            <span>LEVEL UP! You reached LEVEL {quizResults.newLevel}! 👑</span>
                          </div>
                        )}

                        {/* Badges Unlocked Notification */}
                        {quizResults.newBadges && quizResults.newBadges.length > 0 && (
                          <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px' }}>New Badges Unlocked</h4>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                              {quizResults.newBadges.map((badge) => {
                                const details = BADGE_DETAILS[badge] || { icon: '🏆', color: '#8b5cf6' };
                                return (
                                  <div
                                    key={badge}
                                    style={{
                                      background: 'rgba(255,255,255,0.03)',
                                      border: `1px solid ${details.color}`,
                                      borderRadius: '12px',
                                      padding: '8px 16px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}
                                  >
                                    <span>{details.icon}</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{badge}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <button onClick={closeQuiz} className="btn-primary" style={{ width: '100%' }}>
                          Collect Rewards
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
         TAB 2: LEADERBOARD
         ========================================== */}
      {activeTab === 'leaderboard' && (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy style={{ color: '#eab308' }} />
            <span>Class {user.classLevel} Leaderboard</span>
          </h2>

          {loading && leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Gathering scores...</div>
          ) : leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }} className="glass-card">
              No students found on scoreboard.
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {leaderboard.map((student, index) => {
                  const isSelf = student._id === user._id;
                  const rank = index + 1;
                  
                  // Rank borders for top 3
                  let itemStyle = {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    background: isSelf ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.01)',
                    border: isSelf ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                  };

                  if (rank === 1) itemStyle.borderLeft = '4px solid #eab308'; // Gold
                  if (rank === 2) itemStyle.borderLeft = '4px solid #cbd5e1'; // Silver
                  if (rank === 3) itemStyle.borderLeft = '4px solid #b45309'; // Bronze

                  return (
                    <div key={student._id} style={itemStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Rank Badge */}
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: rank === 1 ? '#eab308' : rank === 2 ? '#94a3b8' : rank === 3 ? '#b45309' : 'rgba(255,255,255,0.05)',
                          color: rank <= 3 ? '#000' : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem'
                        }}>
                          {rank}
                        </div>

                        {/* Avatar Icon */}
                        {renderAvatar(student.profilePic, 36)}

                        <div>
                          <span style={{ fontWeight: 600, color: isSelf ? '#c084fc' : '#fff' }}>
                            {student.name} {isSelf && '(You)'}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Roll No: {student.rollNo || '-'}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span className="badge badge-student" style={{ fontSize: '0.7rem' }}>Lvl {student.level}</span>
                        <span style={{ fontWeight: 800, color: '#eab308', fontSize: '1.1rem' }}>{student.xp} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
         TAB 3: MY PROFILE
         ========================================== */}
      {activeTab === 'profile' && (
        <div className="grid-cols-3">
          
          {/* Profile Details Edit Form */}
          <div className="glass-card" style={{ gridColumn: 'span 1', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserIcon style={{ color: '#8b5cf6' }} />
              <span>Customize Profile</span>
            </h2>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Select Profile Avatar Grid */}
              <div className="form-group" style={{ margin: 0 }}>
                <label>Select Your Avatar</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginTop: '8px' }}>
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setProfilePic(av.id)}
                      style={{
                        padding: '8px 0',
                        borderRadius: '8px',
                        border: profilePic === av.id ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.05)',
                        ...getAvatarStyle(av.id),
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.1s'
                      }}
                      className={profilePic === av.id ? 'animate-float' : ''}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>

                {/* Custom File Uploader */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="custom-avatar-upload" className="btn-secondary" style={{
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    borderStyle: 'dashed'
                  }}>
                    <Plus size={14} />
                    <span>Upload Custom Picture</span>
                  </label>
                  <input
                    id="custom-avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleCustomImageUpload}
                    style={{ display: 'none' }}
                  />
                  {profilePic && profilePic.startsWith('data:image/') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                      <Check size={12} />
                      <span>Custom picture loaded (Save to apply)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Student Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Class Level</label>
                <input
                  type="text"
                  value={`Class ${user.classLevel}`}
                  className="glass-input"
                  style={{ background: 'rgba(255,255,255,0.02)', color: '#64748b', cursor: 'default' }}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Roll Number</label>
                <input
                  type="text"
                  value={profileRoll}
                  onChange={(e) => setProfileRoll(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="glass-input"
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                {loading ? 'Updating...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* User Badges & Statistics Card */}
          <div className="glass-card" style={{ gridColumn: 'span 2' }}>
            {/* Gamified summary header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
              {renderAvatar(user.profilePic, 64)}

              <div>
                <h3 style={{ fontSize: '1.4rem' }}>{user.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <span>Roll No: {user.rollNo || '-'}</span>
                  <span>•</span>
                  <span>Class: {user.classLevel}</span>
                </div>
              </div>
            </div>

            {/* Badges won panel */}
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award style={{ color: '#eab308' }} />
              <span>Earned Badges ({user.badges?.length || 0})</span>
            </h2>

            {(!user.badges || user.badges.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <Sparkles size={36} style={{ color: '#475569', marginBottom: '12px' }} />
                <h3>No Badges Earned Yet</h3>
                <p style={{ fontSize: '0.85rem' }}>Complete a quiz with a high score to unlock your first badge!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {user.badges.map((badgeName) => {
                  const info = BADGE_DETAILS[badgeName] || { icon: '🏆', color: '#8b5cf6', desc: 'Conquered learning challenge' };
                  return (
                    <div
                      key={badgeName}
                      className="glass-card"
                      style={{
                        padding: '16px',
                        background: 'rgba(255,255,255,0.01)',
                        border: `1px solid rgba(255,255,255,0.04)`,
                        borderLeft: `3px solid ${info.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <span style={{ fontSize: '1.8rem' }}>{info.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{badgeName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{info.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
