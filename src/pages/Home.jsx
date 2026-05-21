import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, Sparkles, Award, Play, ShieldAlert, Cpu, Brain, Flame, Target, Users, User, ArrowRight, RefreshCw, X, Check } from 'lucide-react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';

const Home = () => {
  const navigate = useNavigate();

  // ==========================================
  // TUG OF WAR GAME STATES
  // ==========================================
  const [playType, setPlayType] = useState(null); // 'solo', 'multi', or null
  const [gameStage, setGameStage] = useState('menu'); // 'menu', 'lobby', 'countdown', 'playing', 'ended'
  const [lobbyAction, setLobbyAction] = useState(null); // 'create', 'join', or null
  const [nickname, setNickname] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'
  const [players, setPlayers] = useState([]);
  const [offset, setOffset] = useState(0); // -5 (Left wins) to +5 (Right wins)
  const [currentQuestion, setCurrentQuestion] = useState({ questionStr: '', answer: null });
  const [userAnswer, setUserAnswer] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [winner, setWinner] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  
  // Feedback animations
  const [isWrong, setIsWrong] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  const socketRef = useRef(null);
  const botIntervalRef = useRef(null);
  const inputRef = useRef(null);

  // Generate random 4-letter lobby code
  const generateLobbyCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Connect socket client
  const initSocketConnection = () => {
    if (socketRef.current) return;
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5003' : window.location.origin;
    socketRef.current = io(socketUrl);

    // Socket Event Listeners
    socketRef.current.on('lobby-update', ({ players }) => {
      setPlayers(players);
      setErrorMsg('');
    });

    socketRef.current.on('game-init', ({ players }) => {
      setPlayers(players);
      setGameStage('countdown');
      setCountdown(3);
    });

    socketRef.current.on('countdown', (count) => {
      setCountdown(count);
    });

    socketRef.current.on('game-start', ({ question, offset }) => {
      const qParts = question.split(' ');
      const parsedAns = evalQuestion(qParts[0], qParts[1], qParts[2]);
      setCurrentQuestion({ questionStr: question, answer: parsedAns });
      setOffset(offset);
      setGameStage('playing');
      setTimeout(() => inputRef.current?.focus(), 100);
    });

    socketRef.current.on('new-question', ({ question, offset, solver }) => {
      const qParts = question.split(' ');
      const parsedAns = evalQuestion(qParts[0], qParts[1], qParts[2]);
      setCurrentQuestion({ questionStr: question, answer: parsedAns });
      setOffset(offset);
      setUserAnswer('');
      setStatusMsg(`${solver} answered correctly!`);
      setTimeout(() => setStatusMsg(''), 1500);
    });

    socketRef.current.on('game-over', ({ winner, offset }) => {
      setOffset(offset);
      setWinner(winner);
      setGameStage('ended');
      confetti({ particleCount: 150, spread: 80 });
      cleanupSocket();
    });

    socketRef.current.on('opponent-left', ({ message }) => {
      setErrorMsg(message);
      setGameStage('lobby');
      setOffset(0);
    });

    socketRef.current.on('error-msg', (msg) => {
      setErrorMsg(msg);
      cleanupSocket();
    });
  };

  const evalQuestion = (num1, op, num2) => {
    const n1 = parseInt(num1, 10);
    const n2 = parseInt(num2, 10);
    if (op === '+') return n1 + n2;
    if (op === '-') return n1 - n2;
    if (op === '*') return n1 * n2;
    if (op === '/') return n1 / n2;
    return 0;
  };

  const cleanupSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  // Cleanup effect on unmount
  useEffect(() => {
    return () => {
      cleanupSocket();
      if (botIntervalRef.current) clearInterval(botIntervalRef.current);
    };
  }, []);

  // Handle local Solo Question Generator
  const generateLocalQuestion = () => {
    const operations = ['+', '-', '*', '/'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let num1 = 0, num2 = 0, ans = 0;

    switch (op) {
      case '+':
        num1 = Math.floor(Math.random() * 30) + 5;
        num2 = Math.floor(Math.random() * 30) + 5;
        ans = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 40) + 10;
        num2 = Math.floor(Math.random() * num1) + 1;
        ans = num1 - num2;
        break;
      case '*':
        num1 = Math.floor(Math.random() * 10) + 2;
        num2 = Math.floor(Math.random() * 9) + 2;
        ans = num1 * num2;
        break;
      case '/':
        num2 = Math.floor(Math.random() * 8) + 2;
        ans = Math.floor(Math.random() * 10) + 2;
        num1 = num2 * ans;
        break;
    }
    return { questionStr: `${num1} ${op} ${num2}`, answer: ans };
  };

  // Solo Bot Logic
  const startSoloBot = (diff) => {
    if (botIntervalRef.current) clearInterval(botIntervalRef.current);

    let speed = 5000; // medium
    if (diff === 'easy') speed = 7000;
    if (diff === 'hard') speed = 3500;

    botIntervalRef.current = setInterval(() => {
      // Bot pulls rope to the right (increases offset)
      setOffset(prev => {
        const next = prev + 1;
        if (next >= 5) {
          clearInterval(botIntervalRef.current);
          setWinner('MathBot');
          setGameStage('ended');
          return next;
        }
        // Generate new question for player
        setCurrentQuestion(generateLocalQuestion());
        setUserAnswer('');
        setStatusMsg('MathBot scored!');
        setTimeout(() => setStatusMsg(''), 1000);
        return next;
      });
    }, speed);
  };

  // Start Solo Game Sequence
  const handleStartSolo = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMsg('Please enter a nickname.');
      return;
    }
    setErrorMsg('');
    setPlayers([
      { nickname: nickname.trim(), side: 'left' },
      { nickname: 'MathBot', side: 'right' }
    ]);
    setOffset(0);
    setGameStage('countdown');
    setCountdown(3);

    let timer = 3;
    const interval = setInterval(() => {
      timer--;
      setCountdown(timer);
      if (timer < 0) {
        clearInterval(interval);
        setCurrentQuestion(generateLocalQuestion());
        setGameStage('playing');
        setTimeout(() => inputRef.current?.focus(), 100);
        startSoloBot(difficulty);
      }
    }, 1000);
  };

  // Start Multiplayer Lobby
  const handleStartMulti = (action) => {
    if (!nickname.trim()) {
      setErrorMsg('Please enter a nickname.');
      return;
    }
    if (action === 'join' && !teamCode.trim()) {
      setErrorMsg('Please enter a 4-letter team code.');
      return;
    }
    setErrorMsg('');
    const code = action === 'create' ? generateLobbyCode() : teamCode.trim().toUpperCase();
    setTeamCode(code);
    initSocketConnection();
    socketRef.current.emit('join-game', { teamCode: code, nickname: nickname.trim() });
    setGameStage('lobby');
  };

  // Submit Answer
  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const parsedUserAns = parseInt(userAnswer, 10);
    if (parsedUserAns === currentQuestion.answer) {
      setIsCorrect(true);
      setTimeout(() => setIsCorrect(false), 300);

      if (playType === 'solo') {
        // Player moves rope to left (decreases offset)
        setOffset(prev => {
          const next = prev - 1;
          if (next <= -5) {
            if (botIntervalRef.current) clearInterval(botIntervalRef.current);
            setWinner(nickname);
            setGameStage('ended');
            confetti({ particleCount: 150, spread: 80 });
            return next;
          }
          setCurrentQuestion(generateLocalQuestion());
          setUserAnswer('');
          return next;
        });
      } else {
        // Multiplayer: submit to socket
        socketRef.current.emit('submit-answer', { answer: userAnswer.trim() });
        setUserAnswer('');
      }
    } else {
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 300);
      setUserAnswer('');
    }
  };

  // Reset Game Lobby
  const handleResetGame = () => {
    cleanupSocket();
    if (botIntervalRef.current) clearInterval(botIntervalRef.current);
    setPlayType(null);
    setGameStage('menu');
    setLobbyAction(null);
    setNickname('');
    setTeamCode('');
    setOffset(0);
    setPlayers([]);
    setWinner('');
    setErrorMsg('');
    setStatusMsg('');
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

  const getSubjectIcon = (sub) => {
    switch (sub) {
      case 'Maths': return '📐';
      case 'Science': return '🔬';
      case 'English': return '📚';
      case 'General Knowledge': return '💡';
      case 'Computer': return '💻';
      default: return '🚀';
    }
  };

  return (
    <div className="main-content" style={{ padding: '0 5% 80px 5%' }}>
      
      {/* ==========================================
         HERO SECTION
         ========================================== */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '60px 0 40px 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glowing Background Orbs */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(9, 10, 16, 0) 70%)',
          zIndex: -1,
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '999px',
          padding: '8px 20px',
          marginBottom: '28px',
          color: '#c084fc',
          fontSize: '0.9rem',
          fontWeight: 700
        }} className="animate-glow">
          <Sparkles size={16} />
          <span>The Ultimate Gamified Learning Quest</span>
        </div>

        <h1 style={{
          fontSize: '3.8rem',
          fontFamily: 'Outfit',
          fontWeight: 900,
          lineHeight: '1.1',
          marginBottom: '24px',
          maxWidth: '850px',
          background: 'linear-gradient(135deg, #fff 30%, #a5b4fc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Level Up Your Knowledge. <br />
          <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Conquer Your Curriculum.
          </span>
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: '#94a3b8',
          maxWidth: '650px',
          lineHeight: '1.6',
          marginBottom: '40px'
        }}>
          EduNexus transforms Class 6 to 10 subjects into legendary learning quests. 
          Watch expert lessons, complete timed boss quizzes, earn XP, and unlock achievements.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: '12px' }}>
            <span>Start Your Quest</span>
            <Trophy size={18} />
          </button>
          <button onClick={() => navigate('/login')} className="btn-secondary" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: '12px' }}>
            <span>Join as Teacher</span>
          </button>
        </div>
      </section>

      {/* ==========================================
         ⚔️ MATH TUG-OF-WAR ARENA (NO LOGIN REQUIRED)
         ========================================== */}
      <section style={{ marginBottom: '80px', position: 'relative' }} id="tug-arena">
        <h2 style={{
          fontSize: '2.2rem',
          fontFamily: 'Outfit',
          textAlign: 'center',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <Flame size={32} style={{ color: '#ef4444' }} />
          <span>Tug of War: Math Duel</span>
          <Flame size={32} style={{ color: '#ef4444' }} />
        </h2>
        <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '40px' }}>
          Challenge a friend or face the MathBot in a rapid-fire math battle! No account required.
        </p>

        <div className="glass-card" style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
          position: 'relative'
        }}>
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#f87171',
              fontSize: '0.9rem',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {errorMsg}
            </div>
          )}

          {/* STAGE: MENU SELECT */}
          {gameStage === 'menu' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '1.05rem' }}>
                Pick a mode below to enter the battle arena:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                
                {/* Solo Mode Card */}
                <div
                  onClick={() => { setPlayType('solo'); setLobbyAction(null); }}
                  className="glass-card"
                  style={{
                    cursor: 'pointer',
                    background: playType === 'solo' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.01)',
                    borderColor: playType === 'solo' ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                    padding: '24px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Cpu size={36} style={{ color: '#c084fc', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Solo Practice</h3>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Train your skills in an endless duel against the computer bot.
                  </p>
                </div>

                {/* Multiplayer Card */}
                <div
                  onClick={() => { setPlayType('multi'); setLobbyAction('create'); }}
                  className="glass-card"
                  style={{
                    cursor: 'pointer',
                    background: playType === 'multi' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.01)',
                    borderColor: playType === 'multi' ? '#8b5cf6' : 'rgba(255,255,255,0.05)',
                    padding: '24px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Users size={36} style={{ color: '#3b82f6', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Multiplayer Duel</h3>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Join or host a private lobby using a 4-letter Team Code.
                  </p>
                </div>
              </div>

              {/* Configure Solo Options */}
              {playType === 'solo' && (
                <form onSubmit={handleStartSolo} style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px', margin: '40px auto 0 auto' }}>
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label>Your Duelist Nickname</label>
                    <input
                      type="text"
                      className="glass-input"
                      placeholder="Enter name (e.g. Einstein)"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={12}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ textAlign: 'left' }}>
                    <label>MathBot Difficulty Level</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                      {['easy', 'medium', 'hard'].map((d) => (
                        <button
                          key={d}
                          type="button"
                          className={difficulty === d ? 'btn-primary' : 'btn-secondary'}
                          style={{ textTransform: 'capitalize', padding: '10px 0' }}
                          onClick={() => setDifficulty(d)}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px' }}>
                    <span>Enter Arena ⚔️</span>
                  </button>
                </form>
              )}

              {/* Configure Multi Options */}
              {playType === 'multi' && (
                <div style={{ marginTop: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
                    <button
                      className={lobbyAction === 'create' ? 'btn-primary' : 'btn-secondary'}
                      onClick={() => setLobbyAction('create')}
                      style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                    >
                      Host Game
                    </button>
                    <button
                      className={lobbyAction === 'join' ? 'btn-primary' : 'btn-secondary'}
                      onClick={() => setLobbyAction('join')}
                      style={{ padding: '8px 20px', fontSize: '0.9rem' }}
                    >
                      Join Game
                    </button>
                  </div>

                  <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                      <label>Nickname</label>
                      <input
                        type="text"
                        className="glass-input"
                        placeholder="Enter name (e.g. Newton)"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        maxLength={12}
                      />
                    </div>
                    {lobbyAction === 'join' && (
                      <div className="form-group">
                        <label>Lobby Team Code</label>
                        <input
                          type="text"
                          className="glass-input"
                          placeholder="e.g. ABCD"
                          value={teamCode}
                          onChange={(e) => setTeamCode(e.target.value)}
                          maxLength={4}
                          style={{ textTransform: 'uppercase' }}
                        />
                      </div>
                    )}
                    <button
                      onClick={() => handleStartMulti(lobbyAction)}
                      className="btn-primary"
                      style={{ width: '100%', padding: '14px', borderRadius: '12px' }}
                    >
                      {lobbyAction === 'create' ? 'Create Lobby 📡' : 'Connect to Lobby 🔌'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STAGE: MULTIPLAYER LOBBY */}
          {gameStage === 'lobby' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Lobby Team Code
                </h3>
                <div style={{
                  fontSize: '3.2rem',
                  fontFamily: 'Outfit',
                  fontWeight: 900,
                  color: '#8b5cf6',
                  letterSpacing: '8px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'inline-block',
                  margin: '12px 0'
                }}>
                  {teamCode}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Share this code with your friend. Once they join, the challenge begins!
                </p>
              </div>

              <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', background: 'rgba(0,0,0,0.2)' }}>
                <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <Users size={16} />
                  <span>Lobby Roster ({players.length}/2)</span>
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 0' }}>
                  {players.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: p.side === 'left' ? '#c084fc' : '#3b82f6'
                      }} />
                      <span style={{ fontWeight: 600 }}>{p.nickname}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        ({p.side === 'left' ? 'Red side' : 'Blue side'})
                      </span>
                    </div>
                  ))}
                  {players.length < 2 && (
                    <div style={{ color: '#64748b', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Waiting for opponent...</span>
                    </div>
                  )}
                </div>
              </div>

              <button onClick={handleResetGame} className="btn-secondary" style={{ marginTop: '32px', gap: '6px' }}>
                <X size={16} />
                <span>Leave Lobby</span>
              </button>
            </div>
          )}

          {/* STAGE: COUNTDOWN */}
          {gameStage === 'countdown' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <h3 style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '24px', fontFamily: 'Outfit' }}>
                Prepare for Battle!
              </h3>
              <div
                key={countdown}
                style={{
                  fontSize: '8rem',
                  fontFamily: 'Outfit',
                  fontWeight: 900,
                  color: countdown === 0 ? '#10b981' : '#eab308',
                  textShadow: countdown === 0 ? '0 0 40px rgba(16,185,129,0.5)' : '0 0 40px rgba(234,179,8,0.5)',
                  transform: 'scale(1)',
                  animation: 'float 1s ease-in-out'
                }}
              >
                {countdown === 0 ? 'GO!' : countdown}
              </div>
            </div>
          )}

          {/* STAGE: PLAYING */}
          {gameStage === 'playing' && (
            <div>
              {/* Score Indicator & Nicknames */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: 700 }}>
                <div style={{ color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={16} />
                  <span>{players.find(p => p.side === 'left')?.nickname}</span>
                </div>
                <div style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{players.find(p => p.side === 'right')?.nickname}</span>
                  <User size={16} />
                </div>
              </div>

              {/* TUG OF WAR ROPE VISUALIZATION ARENA */}
              <div style={{
                height: '150px',
                position: 'relative',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
                margin: '20px 0 40px 0',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Visual Dividers */}
                <div style={{ position: 'absolute', height: '100%', width: '1px', background: 'rgba(255,255,255,0.07)', left: '10%' }} />
                <div style={{ position: 'absolute', height: '100%', width: '1px', background: 'rgba(255,255,255,0.07)', left: '30%' }} />
                <div style={{ position: 'absolute', height: '100%', width: '2px', background: 'rgba(239, 68, 68, 0.3)', left: '50%' }} />
                <div style={{ position: 'absolute', height: '100%', width: '1px', background: 'rgba(255,255,255,0.07)', left: '70%' }} />
                <div style={{ position: 'absolute', height: '100%', width: '1px', background: 'rgba(255,255,255,0.07)', left: '90%' }} />

                {/* Red Limit Warning Zones */}
                <div style={{ position: 'absolute', left: 0, width: '10%', height: '100%', background: 'linear-gradient(90deg, rgba(239,68,68,0.15), rgba(239,68,68,0))' }} />
                <div style={{ position: 'absolute', right: 0, width: '10%', height: '100%', background: 'linear-gradient(270deg, rgba(239,68,68,0.15), rgba(239,68,68,0))' }} />

                {/* Pulling characters */}
                {/* Left puller */}
                <div style={{
                  position: 'absolute',
                  left: '12%',
                  fontSize: '2.5rem',
                  transition: 'transform 0.1s',
                  transform: `scaleX(-1) translateX(${offset <= 0 ? '-10px' : '0px'})`
                }} className="animate-float">
                  🤠
                </div>

                {/* Right puller */}
                <div style={{
                  position: 'absolute',
                  right: '12%',
                  fontSize: '2.5rem',
                  transition: 'transform 0.1s',
                  transform: `scaleX(1) translateX(${offset >= 0 ? '-10px' : '0px'})`
                }} className="animate-float">
                  {playType === 'solo' ? '🤖' : '👹'}
                </div>

                {/* The Tug Rope */}
                <div style={{
                  position: 'absolute',
                  left: '15%',
                  right: '15%',
                  height: '6px',
                  background: 'linear-gradient(90deg, #c084fc, #3b82f6)',
                  borderRadius: '3px',
                  boxShadow: '0 0 10px rgba(139,92,246,0.3)'
                }} />

                {/* Red Center Flag */}
                <div style={{
                  position: 'absolute',
                  width: '24px',
                  height: '24px',
                  background: '#ef4444',
                  borderRadius: '50%',
                  border: '3px solid #fff',
                  boxShadow: '0 0 15px rgba(239,68,68,0.8)',
                  top: 'calc(50% - 12px)',
                  left: `${50 + (offset * 7.5)}%`,
                  transform: 'translateX(-50%)',
                  transition: 'left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                  <div style={{
                    width: '4px',
                    height: '24px',
                    background: '#ef4444',
                    position: 'absolute',
                    top: '18px',
                    left: '7px'
                  }} />
                </div>
              </div>

              {/* Status Message Overlay (e.g. Solver popup) */}
              <div style={{ height: '24px', textAlign: 'center', color: '#10b981', fontWeight: 600, fontSize: '0.9rem', marginBottom: '10px' }}>
                {statusMsg}
              </div>

              {/* Question Box */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Solve Fast!
                </h3>
                <div
                  className={`glass-card ${isWrong ? 'animate-shake' : ''}`}
                  style={{
                    display: 'inline-block',
                    padding: '20px 48px',
                    fontSize: '2.8rem',
                    fontFamily: 'Outfit',
                    fontWeight: 900,
                    margin: '10px 0',
                    border: isCorrect ? '2px solid #10b981' : isWrong ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.08)',
                    background: isCorrect ? 'rgba(16,185,129,0.1)' : isWrong ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.3)',
                    borderRadius: '16px',
                    transition: 'all 0.1s'
                  }}
                >
                  {currentQuestion.questionStr}
                </div>
              </div>

              {/* Answer Form */}
              <form onSubmit={handleAnswerSubmit} style={{ maxWidth: '300px', margin: '0 auto', display: 'flex', gap: '12px' }}>
                <input
                  ref={inputRef}
                  type="number"
                  placeholder="?"
                  className="glass-input"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  style={{
                    fontSize: '1.4rem',
                    textAlign: 'center',
                    padding: '12px',
                    fontWeight: 700
                  }}
                  required
                />
                <button type="submit" className="btn-primary" style={{ padding: '12px 24px', fontSize: '1.1rem', borderRadius: '8px' }}>
                  Send
                </button>
              </form>
            </div>
          )}

          {/* STAGE: ENDED */}
          {gameStage === 'ended' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                display: 'inline-flex',
                padding: '20px',
                background: 'rgba(234, 179, 8, 0.1)',
                borderRadius: '50%',
                color: '#eab308',
                marginBottom: '20px'
              }} className="animate-float">
                <Trophy size={64} />
              </div>
              
              <h2 style={{ fontSize: '2.4rem', fontFamily: 'Outfit', fontWeight: 900, marginBottom: '8px' }}>
                {winner} Wins!
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '32px' }}>
                {winner === 'MathBot' 
                  ? 'The bot pulled the rope to victory! Practice more and try again.' 
                  : 'A legendary show of calculation speed! The opponent has been pulled!'}
              </p>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button onClick={handleResetGame} className="btn-primary" style={{ padding: '12px 32px' }}>
                  <span>Play Again</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
         STATS SECTION
         ========================================== */}
      <section style={{ marginBottom: '80px' }}>
        <div className="glass-card" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          padding: '40px',
          textAlign: 'center',
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.4))'
        }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontFamily: 'Outfit', fontWeight: 900, color: '#8b5cf6', marginBottom: '8px' }}>5</div>
            <div style={{ color: '#94a3b8', fontWeight: 600 }}>Core Subjects</div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '2.5rem', fontFamily: 'Outfit', fontWeight: 900, color: '#3b82f6', marginBottom: '8px' }}>Class 6-10</div>
            <div style={{ color: '#94a3b8', fontWeight: 600 }}>Tailored Curriculum</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontFamily: 'Outfit', fontWeight: 900, color: '#10b981', marginBottom: '8px' }}>100%</div>
            <div style={{ color: '#94a3b8', fontWeight: 600 }}>Gamified & Fun</div>
          </div>
        </div>
      </section>

      {/* ==========================================
         CORE SUBJECTS GRID
         ========================================== */}
      <section style={{ marginBottom: '100px' }}>
        <h2 style={{ fontSize: '2rem', fontFamily: 'Outfit', textAlign: 'center', marginBottom: '16px' }}>
          Select Your Path
        </h2>
        <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '48px', maxWidth: '500px', margin: '0 auto 48px auto' }}>
          Choose a subject to see lessons, notes, and interactive quizzes published by your class teacher.
        </p>

        <div className="grid-cols-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {['English', 'Maths', 'Science', 'General Knowledge', 'Computer'].map((sub) => {
            const subColor = getSubjectColor(sub);
            const icon = getSubjectIcon(sub);
            return (
              <div
                key={sub}
                onClick={() => navigate('/login')}
                className="glass-card animate-glow"
                style={{
                  cursor: 'pointer',
                  padding: '32px 24px',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderBottom: `4px solid ${subColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem'
                }}>
                  {icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit' }}>{sub}</h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Explore study notes and interactive timed quizzes.
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==========================================
         FEATURES LIST SECTION
         ========================================== */}
      <section style={{ marginBottom: '100px' }}>
        <h2 style={{ fontSize: '2rem', fontFamily: 'Outfit', textAlign: 'center', marginBottom: '48px' }}>
          The Learning Adventure Loop
        </h2>

        <div className="grid-cols-2" style={{ gap: '32px' }}>
          <div className="glass-card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
              <Play size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Direct Video Lessons</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Watch YouTube educational modules published by your assigned teachers directly on the platform in a beautiful layout.
              </p>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
              <Target size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Gamified Quiz Engine</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Face timed quizzes with instant visual feedback, wrong-answer shakes, perfect score multipliers, and victory confetti.
              </p>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              <Flame size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>XP, Levels & Scoreboards</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Climb the class-wide XP leaderboard! Earn level-ups and track your ranks in real-time with classmates.
              </p>
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(236,72,153,0.1)', color: '#ec4899' }}>
              <Award size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Rare Badges & Avatars</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
                Unlock achievements like "Mastermind" or "Code Knight" and customize your student profile card with cool emojis and custom uploads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
         CTA CARD SECTION
         ========================================== */}
      <section className="glass-card animate-glow" style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        textAlign: 'center',
        padding: '60px 40px',
        borderRadius: '24px'
      }}>
        <h2 style={{ fontSize: '2.2rem', fontFamily: 'Outfit', fontWeight: 800, marginBottom: '16px' }}>
          Ready to Begin Your Quest?
        </h2>
        <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto 36px auto', lineHeight: '1.6' }}>
          Create your student account, set your class grade (6 to 10), customize your profile avatar, and start unlocking achievements today.
        </p>
        <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem', borderRadius: '12px' }}>
          <span>Register Now</span>
          <Trophy size={18} />
        </button>
      </section>
    </div>
  );
};

export default Home;
