import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/MachineSolver.css';

const MachineSolver = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('browser');
  const [flagInput, setFlagInput] = useState('');
  const [flagResult, setFlagResult] = useState(null);
  const [submittingFlag, setSubmittingFlag] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [reportFile, setReportFile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [solvedVulns, setSolvedVulns] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchMachine();
    fetchUserStats();
    
    const interval = setInterval(() => {
      if (machine?.status === 'building') {
        fetchMachine();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id, isAuthenticated]);

  const fetchMachine = async () => {
    try {
      const response = await fetch(`/api/machines/${id}`, {
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        setMachine(data.machine);
        // Set default tab based on machine type
        if (data.machine.domain === 'web' || data.machine.domain === 'cloud') {
          setActiveTab('browser');
        } else if (data.machine.domain === 'forensics' || data.machine.domain === 'blue_team') {
          setActiveTab('files');
        } else {
          setActiveTab('terminal');
        }
        setError('');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error loading machine');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/flags/stats', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setUserStats(data.stats);
        // Get solved vulns for this machine
        const machineSolved = data.stats.solvedMachines?.includes(id);
        setSolvedVulns(data.stats.solvedVulnerabilities?.filter(v => v.machineId === id) || []);
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  const handleFlagSubmit = async (e) => {
    e.preventDefault();
    if (!flagInput.trim() || !machine) return;

    setSubmittingFlag(true);
    setFlagResult(null);

    try {
      const response = await fetch('/api/flags/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          machineId: machine._id,
          flag: flagInput.trim()
        })
      });

      const data = await response.json();
      setFlagResult(data);

      if (data.correct) {
        setFlagInput('');
        fetchUserStats();
        fetchMachine();
      }
    } catch (err) {
      setFlagResult({
        correct: false,
        message: 'Error submitting flag'
      });
    } finally {
      setSubmittingFlag(false);
    }
  };

  const handleReportUpload = async (e) => {
    e.preventDefault();
    if (!reportFile || !machine) return;

    const formData = new FormData();
    formData.append('report', reportFile);

    setUploadingReport(true);

    try {
      const response = await fetch(`/api/reports/${machine._id}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Lab report uploaded successfully!');
        setReportFile(null);
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (err) {
      alert('❌ Error uploading report');
      console.error(err);
    } finally {
      setUploadingReport(false);
    }
  };

  const renderLabHeader = () => {
    if (!machine) return null;

    const totalVulns = machine.vulnerabilities?.length || machine.modules?.length || 0;
    const solvedCount = solvedVulns.length;
    const isFullySolved = solvedCount === totalVulns && totalVulns > 0;

    return (
      <div className="lab-header">
        <div className="lab-header-top">
          <div>
            <h1 className="lab-title">{machine.name}</h1>
            <span className={`domain-badge domain-${machine.domain}`}>
              {machine.domain.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="lab-points-header">
            <span className="label">Machine Points</span>
            <span className="value">{machine.totalPoints || 0}</span>
          </div>
        </div>
        
        <div className="lab-header-info">
          <div className="vuln-progress">
            <span className="progress-label">Vulnerabilities</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${totalVulns > 0 ? (solvedCount / totalVulns) * 100 : 0}%` }}
              />
            </div>
            <span className="progress-text">{solvedCount}/{totalVulns} Captured</span>
          </div>
          
          {machine.vulnerabilities && machine.vulnerabilities.length > 0 && (
            <div className="vuln-list">
              <span className="vuln-list-label">Included Vulnerabilities:</span>
              <div className="vuln-chips">
                {machine.vulnerabilities.map((vuln, idx) => {
                  const isSolved = solvedVulns.some(v => v.moduleId === vuln.moduleId);
                  return (
                    <div key={idx} className={`vuln-chip ${isSolved ? 'solved' : ''}`}>
                      {isSolved && '✓ '}
                      {vuln.moduleId.replace(/_/g, ' ')} ({vuln.points}pts)
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {isFullySolved && (
          <div className="lab-complete-banner">
            🎉 Lab Completed! All vulnerabilities captured. You can now upload your lab report.
          </div>
        )}
      </div>
    );
  };

  const renderTabBar = () => {
    const tabs = [];
    
    if (machine.domain === 'web' || machine.domain === 'cloud') {
      tabs.push({ id: 'browser', label: '🌐 Browser', icon: '🌐' });
    }
    
    if (machine.domain === 'red_team' || machine.domain === 'cloud' || machine.domain === 'forensics' || machine.terminalEnabled) {
      tabs.push({ id: 'terminal', label: '💻 Terminal', icon: '💻' });
    }
    
    if (machine.domain === 'blue_team' || machine.domain === 'forensics') {
      tabs.push({ id: 'files', label: '📁 Files', icon: '📁' });
    }
    
    tabs.push({ id: 'flags', label: '🚩 Flags', icon: '🚩' });

    return (
      <div className="tab-bar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderBrowserTab = () => {
    return (
      <div className="tab-content">
        <div className="tab-header">
          <h3>🌐 Browser Interface</h3>
          <a 
            href={machine.access?.url || machine.accessUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-open-new"
          >
            Open in New Tab →
          </a>
        </div>
        <div className="iframe-container">
          <iframe
            src={machine.access?.url || machine.accessUrl}
            title={machine.name}
            className="lab-iframe"
          />
        </div>
      </div>
    );
  };

  const renderTerminalTab = () => {
    const sshCommand = machine.access?.terminal || `ssh user@localhost -p ${machine.port || '8022'}`;
    
    return (
      <div className="tab-content">
        <div className="tab-header">
          <h3>💻 Terminal Access</h3>
        </div>
        
        <div className="terminal-instructions">
          <h4>🔐 SSH Connection Command:</h4>
          <div className="code-block">
            <code>{sshCommand}</code>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(sshCommand);
                alert('Command copied to clipboard!');
              }}
              className="copy-btn"
            >
              📋 Copy
            </button>
          </div>
          
          <div className="credentials-info">
            <p><strong>Default Credentials:</strong></p>
            <ul>
              <li>Username: <code>ctfuser</code></li>
              <li>Password: <code>password123</code></li>
            </ul>
          </div>

          <div className="objectives-list">
            <h4>📋 Objectives:</h4>
            <ul>
              <li>Connect to the SSH server using provided credentials</li>
              <li>Explore the system and identify vulnerabilities</li>
              <li>Find and capture all flags</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderFilesTab = () => {
    return (
      <div className="tab-content">
        <div className="tab-header">
          <h3>📁 File Analysis</h3>
          <a 
            href={machine.access?.url || machine.accessUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-open-new"
          >
            Open in New Tab →
          </a>
        </div>
        
        <p className="hint">💡 Download and analyze files locally to find hidden vulnerabilities</p>
        
        <div className="iframe-container">
          <iframe
            src={machine.access?.url || machine.accessUrl}
            title={machine.name}
            className="lab-iframe"
          />
        </div>
      </div>
    );
  };

  const renderFlagsTab = () => {
    const totalVulns = machine.vulnerabilities?.length || machine.modules?.length || 0;
    const solvedCount = solvedVulns.length;

    return (
      <div className="tab-content flags-tab">
        <div className="tab-header">
          <h3>🚩 Flag Submission</h3>
          <span className="flags-count">{solvedCount}/{totalVulns} Captured</span>
        </div>
        
        <div className="flag-submission">
          <form onSubmit={handleFlagSubmit}>
            <label className="flag-label">Enter Flag:</label>
            <div className="flag-input-group">
              <input
                type="text"
                value={flagInput}
                onChange={(e) => setFlagInput(e.target.value)}
                placeholder="FLAG{...}"
                className="flag-input"
                disabled={submittingFlag}
              />
              <button 
                type="submit" 
                className="btn-submit-flag"
                disabled={submittingFlag || !flagInput.trim()}
              >
                {submittingFlag ? '⏳ Checking...' : '✓ Submit'}
              </button>
            </div>
          </form>
          
          {flagResult && (
            <div className={`flag-result ${flagResult.correct ? 'correct' : 'incorrect'}`}>
              {flagResult.correct ? (
                <>
                  <p className="result-message">✅ {flagResult.message}</p>
                  <p className="points-earned">+{flagResult.points} points earned!</p>
                  <p className="total-points">Total: {flagResult.totalPoints} points</p>
                </>
              ) : (
                <p className="result-message">❌ {flagResult.message}</p>
              )}
            </div>
          )}
        </div>

        {solvedVulns.length > 0 && (
          <div className="solved-flags-list">
            <h4>Captured Flags:</h4>
            <div className="solved-flags">
              {solvedVulns.map((vuln, idx) => (
                <div key={idx} className="solved-flag-item">
                  <span className="flag-icon">✓</span>
                  <div className="flag-details">
                    <span className="flag-module">{vuln.moduleId?.replace(/_/g, ' ')}</span>
                    <span className="flag-points">+{vuln.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReportUpload = () => {
    const totalVulns = machine.vulnerabilities?.length || machine.modules?.length || 0;
    const solvedCount = solvedVulns.length;
    const isFullySolved = solvedCount === totalVulns && totalVulns > 0;

    if (!isFullySolved) {
      return (
        <div className="report-upload-locked">
          <div className="lock-icon">🔒</div>
          <p>Lab report upload will be unlocked after capturing all {totalVulns} flags</p>
          <p className="lock-progress">{solvedCount}/{totalVulns} flags captured</p>
        </div>
      );
    }

    return (
      <div className="report-upload">
        <h3>📄 Upload Lab Report</h3>
        <p className="hint">Upload your detailed lab report (PDF, Markdown, or Text file)</p>
        <form onSubmit={handleReportUpload}>
          <input
            type="file"
            accept=".pdf,.md,.txt"
            onChange={(e) => setReportFile(e.target.files[0])}
            className="file-input"
            disabled={uploadingReport}
          />
          <button 
            type="submit" 
            className="btn-upload-report"
            disabled={uploadingReport || !reportFile}
          >
            {uploadingReport ? '⏳ Uploading...' : '📤 Upload Report'}
          </button>
        </form>
        {reportFile && (
          <p className="file-info">Selected: {reportFile.name} ({(reportFile.size / 1024).toFixed(2)} KB)</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading machine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/my-machines')} className="btn-back">
          ← Back to My Machines
        </button>
      </div>
    );
  }

  if (!machine || machine.status === 'building') {
    return (
      <div className="building-status">
        <div className="spinner"></div>
        <h2>Machine is being prepared...</h2>
        <p>Your machine is starting up. This usually takes a few moments.</p>
      </div>
    );
  }

  return (
    <div className="machine-solver">
      {renderLabHeader()}
      
      <div className="lab-workspace">
        {renderTabBar()}
        
        <div className="tab-content-area">
          {activeTab === 'browser' && renderBrowserTab()}
          {activeTab === 'terminal' && renderTerminalTab()}
          {activeTab === 'files' && renderFilesTab()}
          {activeTab === 'flags' && renderFlagsTab()}
        </div>
      </div>

      {renderReportUpload()}

      <div className="lab-footer">
        <button onClick={() => navigate('/my-machines')} className="btn-back">
          ← Back to My Machines
        </button>
      </div>
    </div>
  );
};

export default MachineSolver;
