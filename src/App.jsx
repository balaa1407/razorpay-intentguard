import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, AlertOctagon, Brain, Activity, Clock, Play, CheckCircle2, AlertTriangle, FileJson, Key, KeyRound, Loader2, Edit3, Fingerprint } from 'lucide-react';
import { scenarios } from './services/simulator';
import { extractLiveIntent, generateRiskExplanation } from './services/ai';

function App() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  const [userPrompt, setUserPrompt] = useState("Buy a gaming laptop under ₹80,000, min 16GB RAM, trusted seller");
  const [isExtracting, setIsExtracting] = useState(false);
  const [intent, setIntent] = useState(null);
  
  const [activeScenario, setActiveScenario] = useState('HIGH_RISK');
  const [simulationStep, setSimulationStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  
  const [liveExplanation, setLiveExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [auditHash, setAuditHash] = useState(null);

  // Extract Intent on demand
  const handleExtractIntent = async () => {
    if (!apiKey) return alert("Please enter your Gemini API Key first!");
    setIsExtracting(true);
    setIntent(null);
    try {
      const result = await extractLiveIntent(userPrompt, apiKey);
      setIntent(result);
    } catch (error) {
      alert(`Failed to extract intent:\n${error.message}\n\nPlease check your console for more details.`);
      console.error(error);
    } finally {
      setIsExtracting(false);
    }
  };

  // Run Simulation Timeline
  useEffect(() => {
    let timer;
    if (isPlaying && simulationStep < scenarios[activeScenario].length) {
      timer = setTimeout(() => {
        setSimulationStep(prev => prev + 1);
      }, 1200); 
    } else if (simulationStep >= scenarios[activeScenario].length) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, simulationStep, activeScenario]);

  const currentData = scenarios[activeScenario];
  const isComplete = simulationStep >= currentData.length;
  const finalResult = currentData[currentData.length - 1]; // T5 data

  // Generate Live Explanation at the end of simulation
  useEffect(() => {
    if (isComplete && intent && apiKey) {
      const fetchExplanation = async () => {
        setIsExplaining(true);
        setLiveExplanation('');
        
        // Build mock risk signals based on the scenario
        const riskSignals = {
          priceExceeded: finalResult.transaction.price > (intent.max_price || 80000),
          sellerTrusted: finalResult.transaction.seller === intent.seller_requirement,
          ramMatches: finalResult.transaction.ram >= (intent.ram_min || 16)
        };

        const expl = await generateRiskExplanation(
          intent, 
          finalResult.transaction, 
          riskSignals, 
          finalResult.riskLevel, 
          apiKey
        );
        setLiveExplanation(expl);
        setIsExplaining(false);
        
        // Generate Forensic SHA-256 Hash
        const payload = JSON.stringify({ intent, transaction: finalResult.transaction, action: finalResult.riskLevel });
        const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setAuditHash(hashHex);
      };
      fetchExplanation();
    }
  }, [isComplete, activeScenario]); // Only run when simulation completes

  const startSimulation = (type) => {
    if (!intent) {
      alert("Please extract the intent first!");
      return;
    }
    setActiveScenario(type);
    setSimulationStep(0);
    setIsPlaying(true);
    setLiveExplanation('');
    setAuditHash(null);
    setActionMessage('');
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header animate-fade-in" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div className="logo-group">
          <div className="logo-icon">
            <ShieldCheck color="white" size={24} />
          </div>
          <div>
            <h1>IntentGuard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>AI Risk Manager for Agentic Payments</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* API Key loaded from .env */}
        </div>

        <div className="simulator-bar" style={{ margin: 0, width: '100%', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginRight: '12px' }}>
            <Play size={14} style={{ marginRight: '6px' }}/> START SIMULATION:
          </span>
          <button 
            className={`btn ${activeScenario === 'LOW_RISK' && simulationStep > 0 ? 'btn-success' : 'btn-outline'}`}
            onClick={() => startSimulation('LOW_RISK')}
          >
            Perfect Match
          </button>
          <button 
            className={`btn ${activeScenario === 'MEDIUM_RISK' && simulationStep > 0 ? 'btn-outline' : 'btn-outline'}`}
            style={activeScenario === 'MEDIUM_RISK' && simulationStep > 0 ? { borderColor: 'var(--warning)', color: 'var(--warning)' } : {}}
            onClick={() => startSimulation('MEDIUM_RISK')}
          >
            Slight Drift
          </button>
          <button 
            className={`btn ${activeScenario === 'HIGH_RISK' && simulationStep > 0 ? 'btn-danger' : 'btn-outline'}`}
            onClick={() => startSimulation('HIGH_RISK')}
          >
            Intent Hijack
          </button>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Stage 1: Human Intent */}
          <section className="glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain size={20} color="var(--primary)" /> 
                Stage 1: Intent Extraction (Live LLM)
              </h3>
              <span className="badge neutral">Authorized</span>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <textarea 
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="E.g. Buy a gaming laptop under 80k..."
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--primary)', background: 'rgba(59, 130, 246, 0.1)', color: '#fff', resize: 'none', height: '60px', fontFamily: 'inherit' }}
              />
              <button className="btn btn-primary" onClick={handleExtractIntent} disabled={isExtracting}>
                {isExtracting ? <Loader2 size={18} className="spin" /> : <Edit3 size={18} />} Extract
              </button>
            </div>
            
            {intent ? (
              <div className="json-block animate-fade-in">
                <FileJson size={16} style={{ marginBottom: '8px', color: 'var(--text-muted)' }} />
                <div><span className="json-key">"category"</span>: <span className="json-string">"{intent.category}"</span>,</div>
                <div><span className="json-key">"max_price"</span>: <span className="json-number">{intent.max_price}</span>,</div>
                <div><span className="json-key">"ram_min"</span>: <span className="json-number">{intent.ram_min}</span>,</div>
                <div><span className="json-key">"seller_requirement"</span>: <span className="json-string">"{intent.seller_requirement}"</span>,</div>
                <div><span className="json-key">"authorization"</span>: <span className="json-string">"{intent.authorization}"</span></div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '16px', border: '1px dashed var(--border-light)', borderRadius: '8px', textAlign: 'center' }}>
                {isExtracting ? "Gemini is extracting constraints..." : "Click 'Extract' to parse the natural language."}
              </div>
            )}
          </section>

          {/* Stage 2: Agent Activity Timeline */}
          <section className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="var(--primary)" /> 
                Stage 2: Live Agent Activity
              </h3>
              {isPlaying && <span className="badge neutral" style={{ animation: 'pulse-ring 2s infinite' }}>Monitoring...</span>}
            </div>
            
            <div className="timeline">
              {currentData.slice(0, simulationStep).map((step, idx) => (
                <div key={idx} className={`timeline-item ${idx === simulationStep - 1 ? 'active' : ''} animate-fade-in`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '4px' }}>{step.time}</div>
                    <div>{step.action}</div>
                  </div>
                </div>
              ))}
              {simulationStep === 0 && !isPlaying && (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '24px' }}>
                  Select a scenario above to start simulation.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Stage 3: Risk Analysis */}
          <section className="glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <ShieldAlert size={20} color="var(--primary)" /> 
              Stage 3: Intent Risk Analysis (Live LLM)
            </h3>
            
            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
              {/* Intent Match Gauge */}
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Intent Match</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: isComplete ? (finalResult.intentMatch > 90 ? 'var(--success)' : finalResult.intentMatch > 70 ? 'var(--warning)' : 'var(--danger)') : 'var(--text-muted)' }}>
                  {isComplete ? `${finalResult.intentMatch}%` : '--%'}
                </div>
              </div>
              
              {/* Risk Score Gauge */}
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Risk Score</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: isComplete ? (finalResult.riskScore < 20 ? 'var(--success)' : finalResult.riskScore < 60 ? 'var(--warning)' : 'var(--danger)') : 'var(--text-muted)' }}>
                  {isComplete ? finalResult.riskScore : '--'}
                  <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
                </div>
              </div>
            </div>

            {/* AI Explanation */}
            <div style={{ background: 'var(--bg-panel-solid)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Gemini Reasoning</span>
                {isExplaining && <Loader2 size={14} className="spin" color="var(--primary)" />}
              </div>
              
              {isComplete ? (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  {finalResult.riskLevel === 'LOW' && <CheckCircle2 color="var(--success)" style={{ marginTop: '2px', minWidth: '20px' }} />}
                  {finalResult.riskLevel === 'MEDIUM' && <AlertTriangle color="var(--warning)" style={{ marginTop: '2px', minWidth: '20px' }} />}
                  {finalResult.riskLevel === 'HIGH' && <AlertOctagon color="var(--danger)" style={{ marginTop: '2px', minWidth: '20px' }} />}
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: isExplaining ? 'var(--text-muted)' : 'inherit' }}>
                    {isExplaining ? "Gemini is analyzing the intent drift..." : (liveExplanation || finalResult.explanation)}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <Clock size={16} /> Waiting for transaction attempt (T5)...
                </div>
              )}
            </div>
          </section>

          {/* Stage 4: Automated Action */}
          <section className="glass-panel animate-fade-in" style={{ animationDelay: '0.4s', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Activity size={20} color="var(--primary)" /> 
              Stage 4: Automated Decision
            </h3>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
              {!isComplete ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                  <div className="pulse-danger" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={32} opacity={0.5} />
                  </div>
                  System Armed. Awaiting transaction.
                </div>
              ) : (
                <>
                  <div style={{ 
                    padding: '16px 48px', 
                    borderRadius: '30px', 
                    fontSize: '1.5rem', 
                    fontWeight: 700,
                    letterSpacing: '2px',
                    background: finalResult.riskLevel === 'LOW' ? 'var(--success-bg)' : finalResult.riskLevel === 'HIGH' ? 'var(--danger-bg)' : 'var(--warning-bg)',
                    color: finalResult.riskLevel === 'LOW' ? 'var(--success)' : finalResult.riskLevel === 'HIGH' ? 'var(--danger)' : 'var(--warning)',
                    border: `2px solid ${finalResult.riskLevel === 'LOW' ? 'var(--success)' : finalResult.riskLevel === 'HIGH' ? 'var(--danger)' : 'var(--warning)'}`,
                    boxShadow: `0 0 20px ${finalResult.riskLevel === 'LOW' ? 'var(--success-glow)' : finalResult.riskLevel === 'HIGH' ? 'var(--danger-glow)' : 'var(--warning-glow)'}`
                  }}>
                    {finalResult.riskLevel === 'LOW' ? 'APPROVE' : finalResult.riskLevel === 'HIGH' ? 'HOLD PAYMENT' : 'VERIFY INTENT'}
                  </div>
                  
                  {finalResult.riskLevel === 'MEDIUM' && (
                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                      <p style={{ marginBottom: '16px', color: 'var(--text-main)' }}>Your agent selected a ₹84,999 laptop, exceeding your ₹80,000 limit.</p>
                      {actionMessage ? (
                        <div className="animate-fade-in" style={{ padding: '12px', background: actionMessage.includes('initiated') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: actionMessage.includes('initiated') ? 'var(--success)' : 'var(--danger)', borderRadius: '8px', fontWeight: 600 }}>
                          {actionMessage}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                          <button className="btn btn-success" onClick={() => setActionMessage('Payment will be initiated.')}>Approve Anyway</button>
                          <button className="btn btn-outline" onClick={() => setActionMessage('Payment has been revoked.')}>Reject</button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {finalResult.riskLevel === 'HIGH' && (
                    <div style={{ textAlign: 'center', marginTop: '12px', color: 'var(--danger)' }}>
                      <p>Critical Intent Drift. Payment halted to prevent financial loss.</p>
                      {actionMessage ? (
                        <div className="animate-fade-in" style={{ marginTop: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderRadius: '8px', fontWeight: 600 }}>
                          {actionMessage}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                          <button className="btn btn-danger" onClick={() => setActionMessage('Payment has been permanently revoked.')}>Revoke Payment</button>
                          <button className="btn btn-outline" style={{ color: 'var(--text-main)', borderColor: 'var(--border-light)' }}>Review Agent Logs</button>
                        </div>
                      )}
                    </div>
                  )}

                  {auditHash && (
                    <div className="animate-fade-in" style={{ marginTop: '24px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--border-light)', width: '100%', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <Fingerprint size={14} /> Forensic Audit Hash (SHA-256)
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--primary)', wordBreak: 'break-all' }}>
                        {auditHash}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

        </div>
      </div>
      
      {/* Add spin animation inline for simplicity */}
      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}

export default App;
