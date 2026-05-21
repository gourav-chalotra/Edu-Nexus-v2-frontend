import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Video, FileText, CheckCircle, Trash2, Plus, ChevronDown, ListPlus, Award, ShieldAlert, Sparkles, TrendingUp, AlertTriangle, Wand2, Loader2 } from 'lucide-react';

const TeacherDashboard = () => {
  const { user, token } = useAuth();
  
  // Tab states: 'chapters' | 'quizzes' | 'performance'
  const [activeTab, setActiveTab] = useState('chapters');

  // Chapter list & creation
  const [chapters, setChapters] = useState([]);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterDesc, setChapterDesc] = useState('');
  const [chapterClass, setChapterClass] = useState('6');
  const [chapterVideo, setChapterVideo] = useState('');
  const [chapterNotes, setChapterNotes] = useState('');

  // Quiz list & builder
  const [quizzes, setQuizzes] = useState([]);
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizClass, setQuizClass] = useState('6');
  const [questions, setQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, points: 10 }
  ]);

  // Class Performance stats
  const [performanceReport, setPerformanceReport] = useState(null);
  const [selectedPerformanceClass, setSelectedPerformanceClass] = useState('6');

  // Messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // AI Generator states
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMatchedTopic, setAiMatchedTopic] = useState('');

  useEffect(() => {
    if (activeTab === 'chapters') {
      fetchChapters();
    } else if (activeTab === 'quizzes') {
      fetchQuizzes();
    } else if (activeTab === 'performance') {
      fetchPerformance();
    }
  }, [activeTab]);

  // FETCHING DATA
  const fetchChapters = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/chapters', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setChapters(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch chapters.');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/quizzes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setQuizzes(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch quizzes.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teacher/performance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPerformanceReport(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch performance stats.');
    } finally {
      setLoading(false);
    }
  };

  // ADDING CONTENT
  const handleAddChapter = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/teacher/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: chapterTitle,
          description: chapterDesc,
          classLevel: chapterClass,
          videoLink: chapterVideo,
          notes: chapterNotes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(`Chapter "${chapterTitle}" added successfully!`);
      setChapterTitle('');
      setChapterDesc('');
      setChapterVideo('');
      setChapterNotes('');
      setShowAddChapter(false);
      fetchChapters();
    } catch (err) {
      setError(err.message || 'Failed to add chapter.');
    } finally {
      setLoading(false);
    }
  };

  // QUIZ BUILDER HANDLERS
  const handleQuestionTextChange = (qIndex, text) => {
    const updated = [...questions];
    updated[qIndex].questionText = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, val) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = val;
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex, ansIndex) => {
    const updated = [...questions];
    updated[qIndex].correctAnswerIndex = Number(ansIndex);
    setQuestions(updated);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, points: 10 }
    ]);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length === 1) return;
    const updated = questions.filter((_, qIdx) => qIdx !== index);
    setQuestions(updated);
  };

  const handleAddQuiz = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Basic questions validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1} cannot have empty text.`);
        setLoading(false);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) {
          setError(`Option ${j + 1} for Question ${i + 1} cannot be empty.`);
          setLoading(false);
          return;
        }
      }
    }

    try {
      const res = await fetch('/api/teacher/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: quizTitle,
          classLevel: quizClass,
          questions
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(`Quiz "${quizTitle}" added successfully!`);
      setQuizTitle('');
      setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, points: 10 }]);
      setShowAddQuiz(false);
      fetchQuizzes();
    } catch (err) {
      setError(err.message || 'Failed to create quiz.');
    } finally {
      setLoading(false);
    }
  };

  // AI GENERATE HANDLER
  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) {
      setError('Please enter a topic for AI generation.');
      return;
    }
    setError('');
    setAiLoading(true);
    setAiMatchedTopic('');

    try {
      const res = await fetch('/api/teacher/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ topic: aiTopic, count: aiCount })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Auto-populate the quiz builder form
      setQuestions(data.questions);
      setQuizTitle(`${data.topic} Quiz`);
      setAiMatchedTopic(data.topic);
      setShowAddQuiz(true);
      setShowAIGenerator(false);
      setSuccess(`✨ ${data.questions.length} questions generated for "${data.topic}"! Review and publish below.`);
    } catch (err) {
      setError(err.message || 'Failed to generate quiz questions.');
    } finally {
      setAiLoading(false);
    }
  };

  // DELETING CONTENT
  const handleDeleteChapter = async (id, title) => {
    if (!window.confirm(`Delete chapter "${title}"?`)) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/teacher/chapters/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Chapter deleted successfully.');
      fetchChapters();
    } catch (err) {
      setError(err.message || 'Failed to delete chapter.');
    }
  };

  const handleDeleteQuiz = async (id, title) => {
    if (!window.confirm(`Delete quiz "${title}"?`)) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/teacher/quizzes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Quiz deleted successfully.');
      fetchQuizzes();
    } catch (err) {
      setError(err.message || 'Failed to delete quiz.');
    }
  };

  return (
    <div className="main-content">
      {/* Teacher Dashboard Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', fontWeight: 800 }}>Faculty Dashboard</h1>
          <p style={{ color: '#94a3b8' }}>
            Domain: <span style={{ color: '#8b5cf6', fontWeight: 700 }}>{user.assignedSubject}</span>. Upload chapters, manage video modules, build quizzes, and evaluate class progress.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => { setActiveTab('chapters'); setError(''); setSuccess(''); }}
            className={activeTab === 'chapters' ? 'btn-primary' : 'btn-secondary'}
          >
            <BookOpen size={18} />
            <span>Manage Chapters</span>
          </button>
          <button
            onClick={() => { setActiveTab('quizzes'); setError(''); setSuccess(''); }}
            className={activeTab === 'quizzes' ? 'btn-primary' : 'btn-secondary'}
          >
            <ListPlus size={18} />
            <span>Manage Quizzes</span>
          </button>
          <button
            onClick={() => { setActiveTab('performance'); setError(''); setSuccess(''); }}
            className={activeTab === 'performance' ? 'btn-primary' : 'btn-secondary'}
          >
            <TrendingUp size={18} />
            <span>Evaluate Progress</span>
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

      {/* TAB 1: CHAPTERS PANEL */}
      {activeTab === 'chapters' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Video style={{ color: '#8b5cf6' }} />
              <span>Chapter List</span>
            </h2>
            <button onClick={() => setShowAddChapter(!showAddChapter)} className="btn-primary" style={{ padding: '8px 16px' }}>
              <Plus size={16} />
              <span>{showAddChapter ? 'Hide Form' : 'Add Chapter'}</span>
            </button>
          </div>

          {/* Add Chapter Form Drawer/Card */}
          {showAddChapter && (
            <div className="glass-card animate-glow" style={{ marginBottom: '24px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Upload New Chapter Video</h3>
              <form onSubmit={handleAddChapter} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label>Chapter Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Introduction to Algebra"
                      value={chapterTitle}
                      onChange={(e) => setChapterTitle(e.target.value)}
                      className="glass-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Class Level *</label>
                    <select
                      value={chapterClass}
                      onChange={(e) => setChapterClass(e.target.value)}
                      className="glass-input"
                      style={{ background: '#0f111a', color: '#fff' }}
                    >
                      <option value="6">Class 6</option>
                      <option value="7">Class 7</option>
                      <option value="8">Class 8</option>
                      <option value="9">Class 9</option>
                      <option value="10">Class 10</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>YouTube Link or Video ID *</label>
                    <div style={{ position: 'relative' }}>
                      <Video size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={chapterVideo}
                        onChange={(e) => setChapterVideo(e.target.value)}
                        className="glass-input"
                        style={{ paddingLeft: '40px' }}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label>Brief Description *</label>
                    <textarea
                      placeholder="Enter a brief summary of the chapter..."
                      value={chapterDesc}
                      onChange={(e) => setChapterDesc(e.target.value)}
                      className="glass-input"
                      style={{ height: '80px', resize: 'none' }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Upload Study Notes (Optional)</label>
                    <textarea
                      placeholder="Paste notes markdown text or enter shared Google Drive document link..."
                      value={chapterNotes}
                      onChange={(e) => setChapterNotes(e.target.value)}
                      className="glass-input"
                      style={{ height: '110px', resize: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setShowAddChapter(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Publish Chapter'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Chapters Catalog Grid */}
          {loading && chapters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Gathering chapters...</div>
          ) : chapters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }} className="glass-card">
              <ShieldAlert size={48} style={{ color: '#64748b', marginBottom: '12px' }} />
              <h3>No Chapters Published</h3>
              <p style={{ fontSize: '0.9rem' }}>Use the "Add Chapter" button above to publish your first learning module.</p>
            </div>
          ) : (
            <div className="grid-cols-3">
              {chapters.map((ch) => (
                <div key={ch._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span className="badge badge-student">Class {ch.classLevel}</span>
                      <button
                        onClick={() => handleDeleteChapter(ch._id, ch.title)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{ch.title}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {ch.description}
                    </p>
                  </div>
                  
                  {/* YouTube Embed Video Mini Player */}
                  <div style={{ overflow: 'hidden', borderRadius: '8px', background: '#000', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <iframe
                      width="100%"
                      height="130"
                      src={`https://www.youtube.com/embed/${ch.videoLink}`}
                      title={ch.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>

                  {ch.notes && (
                    <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <FileText size={12} />
                      <span>Includes Study Notes</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: QUIZZES PANEL */}
      {activeTab === 'quizzes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ListPlus style={{ color: '#3b82f6' }} />
              <span>Quiz List</span>
            </h2>
            <button onClick={() => setShowAddQuiz(!showAddQuiz)} className="btn-primary" style={{ padding: '8px 16px' }}>
              <Plus size={16} />
              <span>{showAddQuiz ? 'Hide Form' : 'Build Quiz'}</span>
            </button>
            <button onClick={() => setShowAIGenerator(!showAIGenerator)} className="btn-secondary" style={{ padding: '8px 16px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', color: '#eab308' }}>
              <Wand2 size={16} />
              <span>{showAIGenerator ? 'Hide AI' : '✨ AI Generate'}</span>
            </button>
          </div>

          {/* AI GENERATOR PANEL */}
          {showAIGenerator && (
            <div className="glass-card animate-glow" style={{
              marginBottom: '24px',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.05), rgba(139, 92, 246, 0.05))',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative glow */}
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: 'rgba(234, 179, 8, 0.08)', filter: 'blur(40px)', borderRadius: '50%' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '10px', background: 'rgba(234, 179, 8, 0.15)', borderRadius: '12px', color: '#eab308' }}>
                  <Wand2 size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '2px' }}>AI Quiz Generator</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    Enter a topic and we'll auto-generate MCQ questions for <span style={{ color: '#8b5cf6', fontWeight: 700 }}>{user.assignedSubject}</span>.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Topic / Chapter Name</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder={user.assignedSubject === 'Maths' ? 'e.g. Algebra, Geometry, Fractions...' : user.assignedSubject === 'Science' ? 'e.g. Force and Motion, Human Body, Light...' : user.assignedSubject === 'English' ? 'e.g. Grammar, Vocabulary, Writing...' : user.assignedSubject === 'Computer' ? 'e.g. Internet, Programming, MS Office...' : 'e.g. Geography, History, Sports...'}
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>No. of Questions</label>
                  <select
                    className="glass-input"
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    style={{ background: '#0f111a', color: '#fff' }}
                  >
                    {[3, 5, 7, 10].map(n => (
                      <option key={n} value={n}>{n} Questions</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={handleAIGenerate}
                  className="btn-primary"
                  disabled={aiLoading}
                  style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #eab308, #f59e0b)', boxShadow: '0 0 20px rgba(234, 179, 8, 0.3)' }}
                >
                  {aiLoading ? (
                    <><Loader2 size={16} className="animate-spin" /><span>Generating...</span></>
                  ) : (
                    <><Sparkles size={16} /><span>Generate Questions</span></>
                  )}
                </button>
                <button onClick={() => setShowAIGenerator(false)} className="btn-secondary" style={{ padding: '12px 24px' }}>
                  Cancel
                </button>
              </div>

              {/* Hint chips */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Quick picks:</span>
                {(user.assignedSubject === 'Maths' ? ['Algebra', 'Geometry', 'Fractions', 'Percentage'] :
                  user.assignedSubject === 'Science' ? ['Force and Motion', 'Human Body', 'Plant Biology', 'Electricity'] :
                  user.assignedSubject === 'English' ? ['Grammar', 'Vocabulary', 'Comprehension', 'Writing Skills'] :
                  user.assignedSubject === 'Computer' ? ['Computer Basics', 'Internet', 'Programming', 'Cyber Safety'] :
                  ['World Geography', 'Indian History', 'Sports', 'Current Affairs']
                ).map(chip => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setAiTopic(chip)}
                    style={{
                      padding: '4px 12px',
                      fontSize: '0.75rem',
                      borderRadius: '999px',
                      background: aiTopic === chip ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.03)',
                      border: aiTopic === chip ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                      color: aiTopic === chip ? '#eab308' : '#94a3b8',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add Quiz Form Drawer/Card */}
          {showAddQuiz && (
            <div className="glass-card animate-glow" style={{ marginBottom: '24px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Interactive Quiz Builder</h3>
              <form onSubmit={handleAddQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label>Quiz Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Science Chapter 1 Test"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      className="glass-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Target Class Level *</label>
                    <select
                      value={quizClass}
                      onChange={(e) => setQuizClass(e.target.value)}
                      className="glass-input"
                      style={{ background: '#0f111a', color: '#fff' }}
                    >
                      <option value="6">Class 6</option>
                      <option value="7">Class 7</option>
                      <option value="8">Class 8</option>
                      <option value="9">Class 9</option>
                      <option value="10">Class 10</option>
                    </select>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Questions Pool ({questions.length})</span>
                    <button type="button" onClick={handleAddQuestion} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      <Plus size={12} />
                      <span>Add Question</span>
                    </button>
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {questions.map((q, qIndex) => (
                      <div key={qIndex} className="glass-card" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <span style={{ fontWeight: 700, color: '#3b82f6' }}>Question #{qIndex + 1}</span>
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIndex)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                            >
                              <Trash2 size={12} />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                          <label>Question Text *</label>
                          <input
                            type="text"
                            placeholder="Enter the question query..."
                            value={q.questionText}
                            onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                            className="glass-input"
                            required
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                          {q.options.map((opt, optIndex) => (
                            <div key={optIndex} className="form-group" style={{ margin: 0 }}>
                              <label>Option {optIndex + 1} *</label>
                              <input
                                type="text"
                                placeholder={`Enter Option ${optIndex + 1}...`}
                                value={opt}
                                onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                className="glass-input"
                                required
                              />
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div className="form-group" style={{ margin: 0 }}>
                            <label>Correct Answer *</label>
                            <select
                              value={q.correctAnswerIndex}
                              onChange={(e) => handleCorrectAnswerChange(qIndex, e.target.value)}
                              className="glass-input"
                              style={{ background: '#090a10', color: '#fff' }}
                            >
                              <option value={0}>Option 1</option>
                              <option value={1}>Option 2</option>
                              <option value={2}>Option 3</option>
                              <option value={3}>Option 4</option>
                            </select>
                          </div>

                          <div className="form-group" style={{ margin: 0 }}>
                            <label>XP Points Awarded *</label>
                            <input
                              type="number"
                              min="5"
                              max="100"
                              value={q.points}
                              onChange={(e) => {
                                const updated = [...questions];
                                updated[qIndex].points = Number(e.target.value);
                                setQuestions(updated);
                              }}
                              className="glass-input"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowAddQuiz(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Publish Quiz'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Quizzes List Grid */}
          {loading && quizzes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Gathering quizzes...</div>
          ) : quizzes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }} className="glass-card">
              <ShieldAlert size={48} style={{ color: '#64748b', marginBottom: '12px' }} />
              <h3>No Quizzes Created</h3>
              <p style={{ fontSize: '0.9rem' }}>Use the "Build Quiz" button above to launch your first exam.</p>
            </div>
          ) : (
            <div className="grid-cols-3">
              {quizzes.map((quiz) => {
                const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 10), 0);
                return (
                  <div key={quiz._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span className="badge badge-teacher" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>Class {quiz.classLevel}</span>
                        <button
                          onClick={() => handleDeleteQuiz(quiz._id, quiz.title)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{quiz.title}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
                        <div>Questions: <span style={{ color: '#fff', fontWeight: 600 }}>{quiz.questions.length}</span></div>
                        <div>Total Points: <span style={{ color: '#fff', fontWeight: 600 }}>{totalPoints} XP</span></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PERFORMANCE REPORTS */}
      {activeTab === 'performance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Class Filters & Stats Summary */}
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontWeight: 600, color: '#94a3b8' }}>Select Class Level:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['6', '7', '8', '9', '10'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedPerformanceClass(lvl)}
                    className={selectedPerformanceClass === lvl ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem' }}
                  >
                    Class {lvl}
                  </button>
                ))}
              </div>
            </div>

            {performanceReport && (
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Completed Quizzes</div>
                  <div style={{ fontSize: '1.5rem', fontFamily: 'Outfit', fontWeight: 800, color: '#3b82f6' }}>
                    {performanceReport.summary[selectedPerformanceClass]?.totalAttempts || 0} Submissions
                  </div>
                </div>
                <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '24px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Class Avg Percentage</div>
                  <div style={{ fontSize: '1.5rem', fontFamily: 'Outfit', fontWeight: 800, color: '#10b981' }}>
                    {performanceReport.summary[selectedPerformanceClass]?.averagePercentage || 0}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submissions Roster */}
          {loading && !performanceReport ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Gathering student records...</div>
          ) : !performanceReport || !performanceReport.classPerformance[selectedPerformanceClass] || performanceReport.classPerformance[selectedPerformanceClass].length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }} className="glass-card">
              <ShieldAlert size={48} style={{ color: '#64748b', marginBottom: '12px' }} />
              <h3>No Submissions Found in Class {selectedPerformanceClass}</h3>
              <p style={{ fontSize: '0.9rem' }}>Students in this class have not attempted any quizzes for your subject yet.</p>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '16px' }}>
              <div className="table-wrapper">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Roll No</th>
                      <th>Student Name</th>
                      <th>Quiz Title</th>
                      <th style={{ textAlign: 'center' }}>Score</th>
                      <th style={{ textAlign: 'center' }}>Percentage</th>
                      <th>Completion Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceReport.classPerformance[selectedPerformanceClass].map((attempt) => (
                      <tr key={attempt.submissionId}>
                        <td style={{ fontWeight: 700, color: '#3b82f6' }}>{attempt.rollNo || '-'}</td>
                        <td style={{ fontWeight: 600 }}>{attempt.studentName}</td>
                        <td>{attempt.quizTitle}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#8b5cf6' }}>
                          {attempt.score} / {attempt.totalPoints}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              fontWeight: 700,
                              color: attempt.percentage >= 80 ? '#10b981' :
                                     attempt.percentage >= 50 ? '#eab308' : '#ef4444'
                            }}
                          >
                            {attempt.percentage}%
                          </span>
                        </td>
                        <td style={{ color: '#94a3b8' }}>
                          {new Date(attempt.completedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
