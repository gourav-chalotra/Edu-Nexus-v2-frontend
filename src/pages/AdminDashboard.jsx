import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, BookOpen, Users, Award, Trash2, Mail, Lock, ShieldAlert, ChevronDown, Check, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const { token } = useAuth();
  
  // Dashboard navigation tab: 'teachers' | 'performance'
  const [activeTab, setActiveTab] = useState('teachers');

  // Teacher states
  const [teachers, setTeachers] = useState([]);
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('English');
  
  // Class Performance States
  const [selectedClass, setSelectedClass] = useState('6');
  const [performanceData, setPerformanceData] = useState(null);
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  // Status logs
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'teachers') {
      fetchTeachers();
    } else {
      fetchClassPerformance();
    }
  }, [activeTab, selectedClass]);

  // Retrieve existing teachers
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/teachers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTeachers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch teachers.');
    } finally {
      setLoading(false);
    }
  };

  // Add a new teacher
  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: teacherName,
          email: teacherEmail,
          password: teacherPassword,
          assignedSubject: teacherSubject,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(`Teacher "${teacherName}" created successfully!`);
      setTeacherName('');
      setTeacherEmail('');
      setTeacherPassword('');
      fetchTeachers();
    } catch (err) {
      setError(err.message || 'Failed to create teacher.');
    } finally {
      setLoading(false);
    }
  };

  // Delete a teacher
  const handleDeleteTeacher = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove teacher "${name}"?`)) return;
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch(`/api/admin/teachers/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(`Teacher account deleted successfully.`);
      fetchTeachers();
    } catch (err) {
      setError(err.message || 'Failed to delete teacher.');
    }
  };

  // Retrieve class performance reports
  const fetchClassPerformance = async () => {
    setLoading(true);
    setPerformanceData(null);
    try {
      const res = await fetch(`/api/admin/performance/${selectedClass}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPerformanceData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch class performance statistics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      {/* Admin Title Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'Outfit', fontWeight: 800 }}>Admin Command Center</h1>
          <p style={{ color: '#94a3b8' }}>Manage teachers, assign subjects, and track student success metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => { setActiveTab('teachers'); setError(''); setSuccess(''); }}
            className={activeTab === 'teachers' ? 'btn-primary' : 'btn-secondary'}
          >
            <UserPlus size={18} />
            <span>Manage Teachers</span>
          </button>
          <button
            onClick={() => { setActiveTab('performance'); setError(''); setSuccess(''); }}
            className={activeTab === 'performance' ? 'btn-primary' : 'btn-secondary'}
          >
            <TrendingUp size={18} />
            <span>Class Performance</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '16px', color: '#f87171', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '16px', color: '#34d399', marginBottom: '24px' }}>
          {success}
        </div>
      )}

      {/* TAB 1: TEACHER MANAGEMENT */}
      {activeTab === 'teachers' && (
        <div className="grid-cols-3">
          
          {/* Create Teacher Card */}
          <div className="glass-card" style={{ gridColumn: 'span 1', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus style={{ color: '#8b5cf6' }} />
              <span>Register Teacher</span>
            </h2>
            
            <form onSubmit={handleAddTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. John Doe"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    placeholder="teacher@edunexus.com"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value.trim())}
                    className="glass-input"
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Credentials Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="password"
                    placeholder="Enter temp password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    className="glass-input"
                    style={{ paddingLeft: '40px' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Subject Domain</label>
                <select
                  value={teacherSubject}
                  onChange={(e) => setTeacherSubject(e.target.value)}
                  className="glass-input"
                  style={{ background: '#0f111a', color: '#fff' }}
                >
                  <option value="English">English</option>
                  <option value="Maths">Maths</option>
                  <option value="Science">Science</option>
                  <option value="General Knowledge">General Knowledge</option>
                  <option value="Computer">Computer</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                {loading ? 'Creating...' : 'Register Teacher'}
              </button>
            </form>
          </div>

          {/* Teacher Roster List */}
          <div className="glass-card" style={{ gridColumn: 'span 2' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users style={{ color: '#3b82f6' }} />
              <span>Teacher Roster</span>
            </h2>

            {loading && teachers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Gathering roster...</div>
            ) : teachers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }} className="glass-card">
                <ShieldAlert size={48} style={{ color: '#64748b', marginBottom: '12px' }} />
                <h3>No Teachers Registered</h3>
                <p style={{ fontSize: '0.9rem' }}>Fill in the form on the left to add your first faculty member.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Assigned Subject</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher) => (
                      <tr key={teacher._id}>
                        <td style={{ fontWeight: 600 }}>{teacher.name}</td>
                        <td>{teacher.email}</td>
                        <td>
                          <span className="badge" style={{
                            background: `rgba(var(--sub-rgb), 0.1)`,
                            borderColor: `var(--sub-color)`,
                            color: `var(--sub-color)`,
                            // Apply inline colors dynamically based on subjects
                            '--sub-color': teacher.assignedSubject === 'Maths' ? '#3b82f6' : 
                                            teacher.assignedSubject === 'Science' ? '#10b981' : 
                                            teacher.assignedSubject === 'English' ? '#f97316' : 
                                            teacher.assignedSubject === 'General Knowledge' ? '#eab308' : '#ec4899'
                          }}>
                            {teacher.assignedSubject}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteTeacher(teacher._id, teacher.name)}
                            className="btn-danger"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CLASS PERFORMANCE REPORTS */}
      {activeTab === 'performance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Class Select Header Banner */}
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontWeight: 600, color: '#94a3b8' }}>Filter by Class:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['6', '7', '8', '9', '10'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => { setSelectedClass(lvl); setExpandedStudentId(null); }}
                    className={selectedClass === lvl ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem' }}
                  >
                    Class {lvl}
                  </button>
                ))}
              </div>
            </div>

            {performanceData && (
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Enrolled</div>
                  <div style={{ fontSize: '1.5rem', fontFamily: 'Outfit', fontWeight: 800, color: '#3b82f6' }}>
                    {performanceData.totalStudents} Students
                  </div>
                </div>
                <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '24px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Class Quiz Average</div>
                  <div style={{ fontSize: '1.5rem', fontFamily: 'Outfit', fontWeight: 800, color: '#10b981' }}>
                    {performanceData.classAveragePercentage}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Student Performance Table */}
          {loading && !performanceData ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Generating analytics report...</div>
          ) : !performanceData || performanceData.students.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }} className="glass-card">
              <ShieldAlert size={48} style={{ color: '#64748b', marginBottom: '12px' }} />
              <h3>No Students Enrolled in Class {selectedClass}</h3>
              <p style={{ fontSize: '0.9rem' }}>Students can register themselves on the login page.</p>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '16px' }}>
              <div className="table-wrapper">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}></th>
                      <th>Roll No</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>XP Level</th>
                      <th style={{ textAlign: 'center' }}>Quizzes Taken</th>
                      <th style={{ textAlign: 'center' }}>Avg Score</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceData.students.map((student) => {
                      const isExpanded = expandedStudentId === student._id;
                      return (
                        <React.Fragment key={student._id}>
                          <tr
                            style={{ cursor: 'pointer' }}
                            onClick={() => setExpandedStudentId(isExpanded ? null : student._id)}
                          >
                            <td>
                              <ChevronDown
                                size={18}
                                style={{
                                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s',
                                  color: '#64748b',
                                }}
                              />
                            </td>
                            <td style={{ fontWeight: 700, color: '#3b82f6' }}>{student.rollNo || '-'}</td>
                            <td style={{ fontWeight: 600 }}>{student.name}</td>
                            <td>{student.email}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 700, color: '#eab308', fontSize: '0.9rem' }}>Lvl {student.level}</span>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>({student.xp} XP)</span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 600 }}>{student.summary.quizzesTaken}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: student.summary.quizzesTaken === 0 ? '#94a3b8' :
                                         student.summary.averagePercentage >= 80 ? '#10b981' :
                                         student.summary.averagePercentage >= 50 ? '#eab308' : '#ef4444',
                                }}
                              >
                                {student.summary.quizzesTaken === 0 ? 'N/A' : `${student.summary.averagePercentage}%`}
                              </span>
                            </td>
                            <td style={{ color: '#94a3b8' }}>{student.phone || 'N/A'}</td>
                          </tr>
                          
                          {/* Expanded Details Row */}
                          {isExpanded && (
                            <tr>
                              <td colSpan="8" style={{ background: '#0a0b12', padding: '20px 40px' }}>
                                <h4 style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Award size={14} style={{ color: '#eab308' }} />
                                  <span>Quiz Submissions Log</span>
                                </h4>

                                {student.submissions.length === 0 ? (
                                  <div style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic', padding: '8px 0' }}>
                                    Student has not completed any quizzes yet.
                                  </div>
                                ) : (
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                                    {student.submissions.map((sub) => (
                                      <div
                                        key={sub._id}
                                        style={{
                                          background: 'rgba(255,255,255,0.02)',
                                          border: '1px solid rgba(255,255,255,0.05)',
                                          borderRadius: '8px',
                                          padding: '12px 16px',
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center'
                                        }}
                                      >
                                        <div>
                                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sub.quiz ? sub.quiz.title : 'Quiz'}</div>
                                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {new Date(sub.createdAt).toLocaleDateString()}
                                          </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                          <div style={{ fontWeight: 800, color: '#8b5cf6', fontSize: '1rem' }}>
                                            {sub.score} / {sub.totalPoints}
                                          </div>
                                          <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                                            +{sub.xpEarned} XP
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
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

export default AdminDashboard;
