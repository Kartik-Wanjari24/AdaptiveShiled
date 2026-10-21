import React from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Archive,
  Flame,
  Lock,
  Terminal
} from 'lucide-react';

export default function NetworkDiagram({
  attack,
  currentStepIndex,
  defenseActive,
  isPlaying,
  selectedElement,
  onSelectElement,
  activePackets = [],
  quarantinedPackets = [],
  metrics = {},
  activeNodeId = null,
  activeConnectionId = null
}) {
  const currentStep = attack.steps[currentStepIndex] || attack.steps[0];
  const nodeStatus = currentStep.nodeStatus || {};
  const targetHealth = metrics.targetHealth !== undefined ? metrics.targetHealth : 100;

  // Color mapping based on connection type and current defense status
  const getConnectionColor = (conn) => {
    const isCurrentActive = activeConnectionId === conn.id || currentStep.activeConnection === conn.id;
    if (conn.type === 'malicious') {
      return { stroke: '#e11d48', strokeClass: 'stroke-rose-600', fill: '#e11d48', text: 'text-rose-700', bg: 'bg-rose-50 border-rose-300' };
    }
    if (conn.type === 'warning') {
      return { stroke: '#f59e0b', strokeClass: 'stroke-amber-500', fill: '#f59e0b', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-300' };
    }
    if (conn.type === 'safe') {
      return { stroke: '#10b981', strokeClass: 'stroke-emerald-600', fill: '#10b981', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300' };
    }
    if (conn.type === 'conditional') {
      if (defenseActive) {
        return { stroke: '#10b981', strokeClass: 'stroke-emerald-600', fill: '#10b981', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-300' };
      }
      return { stroke: '#e11d48', strokeClass: 'stroke-rose-600', fill: '#e11d48', text: 'text-rose-700', bg: 'bg-rose-50 border-rose-300' };
    }
    // Default / normal network connection
    return { stroke: '#3b82f6', strokeClass: 'stroke-blue-500', fill: '#3b82f6', text: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' };
  };

  // Node visual state helper
  const getNodeState = (node) => {
    const status = nodeStatus[node.id] || 'normal';
    const isActive = activeNodeId === node.id || currentStep.activeNode === node.id;

    // Target server under DDoS attack with Defense OFF
    if ((node.id === 'webServer' || node.id === 'server') && !defenseActive && targetHealth < 50) {
      return {
        badge: 'Crashing (503)',
        badgeClass: 'bg-rose-600 text-white border-rose-700 animate-pulse font-bold',
        cardClass: 'border-rose-600 bg-rose-50/90 shadow-xl ring-4 ring-rose-400',
        iconBg: 'bg-rose-600 text-white animate-bounce'
      };
    }

    // Database breached in SQLi with Defense OFF
    if (node.id === 'database' && !defenseActive && currentStepIndex >= 3) {
      return {
        badge: 'AUTH BYPASSED',
        badgeClass: 'bg-rose-600 text-white border-rose-700 animate-pulse font-bold',
        cardClass: 'border-rose-600 bg-rose-50/90 shadow-xl ring-4 ring-rose-400',
        iconBg: 'bg-rose-600 text-white'
      };
    }

    // Client browser exploited in XSS with Defense OFF
    if (node.id === 'victimBrowser' && !defenseActive && currentStepIndex >= 3) {
      return {
        badge: 'Script Executed',
        badgeClass: 'bg-rose-600 text-white border-rose-700 animate-pulse font-bold',
        cardClass: 'border-rose-600 bg-rose-50/90 shadow-xl ring-4 ring-rose-400',
        iconBg: 'bg-rose-600 text-white'
      };
    }

    // Ransomware infected or quarantined
    if (status === 'compromised' || (node.id === 'infectedPc' && currentStepIndex >= 1)) {
      if (status === 'quarantined' || (defenseActive && currentStepIndex >= 4 && node.id === 'infectedPc')) {
        return {
          badge: 'Quarantined',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
          cardClass: 'border-amber-500 bg-amber-50/90 shadow-md ring-2 ring-amber-400',
          iconBg: 'bg-amber-600 text-white'
        };
      }
      return {
        badge: 'Compromised',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
        cardClass: 'border-rose-500 bg-rose-50/80 shadow-md ring-2 ring-rose-300',
        iconBg: 'bg-rose-600 text-white'
      };
    }

    if (status === 'quarantined') {
      return {
        badge: 'Quarantined',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
        cardClass: 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-300',
        iconBg: 'bg-amber-600 text-white'
      };
    }

    if (status === 'protected') {
      return {
        badge: 'Protected',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
        cardClass: 'border-emerald-500 bg-emerald-50/80 shadow-sm ring-1 ring-emerald-300',
        iconBg: 'bg-emerald-600 text-white'
      };
    }

    if (status === 'warning') {
      return {
        badge: 'Targeted',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        cardClass: 'border-amber-400 bg-amber-50/60 shadow-sm',
        iconBg: 'bg-amber-500 text-white'
      };
    }

    if (isActive) {
      return {
        badge: 'Active Node',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 font-bold',
        cardClass: 'border-blue-600 bg-blue-50/80 shadow-lg ring-2 ring-blue-400 scale-[1.02]',
        iconBg: 'bg-blue-600 text-white'
      };
    }

    // Default by type
    if (node.type === 'attacker') {
      return {
        badge: 'Threat Source',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        cardClass: 'border-rose-300 bg-white hover:border-rose-400',
        iconBg: 'bg-rose-100 text-rose-700'
      };
    }
    if (node.type === 'security') {
      return {
        badge: defenseActive ? 'Defense Active' : 'Defense Offline',
        badgeClass: defenseActive ? 'bg-blue-100 text-blue-800 border-blue-300 font-semibold' : 'bg-rose-100 text-rose-800 border-rose-300',
        cardClass: defenseActive ? 'border-blue-400 bg-white hover:border-blue-500 shadow-sm' : 'border-rose-300 bg-white opacity-85',
        iconBg: defenseActive ? 'bg-blue-600 text-white' : 'bg-slate-400 text-white'
      };
    }

    return {
      badge: node.role,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      cardClass: 'border-slate-300 bg-white hover:border-slate-400 shadow-sm',
      iconBg: 'bg-slate-100 text-slate-700'
    };
  };

  // Node position map (scaled to 1000 x 520 SVG coordinate space)
  const getNodePos = (node) => {
    return {
      x: (node.x / 100) * 1000,
      y: (node.y / 100) * 520
    };
  };

  const nodeMap = {};
  attack.nodes.forEach(n => {
    nodeMap[n.id] = { ...n, pos: getNodePos(n) };
  });

  return (
    <div className="w-full select-none flex flex-col space-y-3">
      {/* Network Blueprint Canvas */}
      <div className="relative w-full rounded-2xl bg-gradient-to-b from-slate-50 via-white to-slate-50 border border-slate-200 shadow-inner overflow-x-auto overflow-y-hidden scrollbar-none">
        <div className="relative min-w-[760px] lg:min-w-full min-h-[440px] sm:min-h-[480px] lg:min-h-[540px]">

          {/* Subtle Network Grid Pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Legend Toolbar */}
          <div className="absolute top-2.5 left-3 right-3 sm:top-3 sm:left-4 sm:right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-[10px] sm:text-xs font-medium text-slate-600 shadow-sm">
              <span className="font-semibold text-slate-800">Traffic Stream:</span>
              <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                <span className="w-2.5 h-1 rounded-full bg-rose-500 inline-block" /> Malicious Packet
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-2.5 h-1 rounded-full bg-emerald-500 inline-block" /> Legitimate Packet
              </span>
              <span className="inline-flex items-center gap-1 text-blue-700 font-semibold">
                <span className="w-2.5 h-1 rounded-full bg-blue-500 inline-block" /> Encrypted Link
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-[10px] sm:text-xs text-slate-500 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono font-semibold text-slate-700">
                {activePackets.length} Packets In Flight
              </span>
            </div>
          </div>

          {/* Main Scalable SVG Canvas */}
          <svg
            viewBox="0 0 1000 520"
            className="w-full h-full min-h-[440px] sm:min-h-[480px] lg:min-h-[540px]"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Arrowhead Markers */}
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#3b82f6" />
              </marker>
              <marker id="arrow-rose" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#e11d48" />
              </marker>
              <marker id="arrow-emerald" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
              </marker>
              <marker id="arrow-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
              </marker>

              {/* Glowing filter for packets */}
              <filter id="packet-glow-red" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#e11d48" floodOpacity="0.8" />
              </filter>
              <filter id="packet-glow-green" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10b981" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Connection Lines between Devices */}
            {attack.connections.map((conn) => {
              const fromNode = nodeMap[conn.from];
              const toNode = nodeMap[conn.to];
              if (!fromNode || !toNode) return null;

              const isCurrentActive = activeConnectionId === conn.id || currentStep.activeConnection === conn.id;
              const isSelected = selectedElement?.id === conn.id;
              const color = getConnectionColor(conn);

              const x1 = fromNode.pos.x;
              const y1 = fromNode.pos.y;
              const x2 = toNode.pos.x;
              const y2 = toNode.pos.y;

              // Trim endpoints so arrows connect gracefully to node edges
              const dx = x2 - x1;
              const dy = y2 - y1;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const trimStart = 58;
              const trimEnd = 64;
              const startX = dist > trimStart ? x1 + (dx / dist) * trimStart : x1;
              const startY = dist > trimStart ? y1 + (dy / dist) * trimStart : y1;
              const endX = dist > trimEnd ? x2 - (dx / dist) * trimEnd : x2;
              const endY = dist > trimEnd ? y2 - (dy / dist) * trimEnd : y2;

              const midX = (startX + endX) / 2;
              const midY = (startY + endY) / 2;

              let markerId = 'arrow-blue';
              if (color.stroke === '#e11d48') markerId = 'arrow-rose';
              else if (color.stroke === '#10b981') markerId = 'arrow-emerald';
              else if (color.stroke === '#f59e0b') markerId = 'arrow-amber';

              return (
                <g
                  key={conn.id}
                  className="cursor-pointer group"
                  onClick={() => onSelectElement({ ...conn, elementType: 'connection' })}
                >
                  {/* Invisible wide hit area */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke="transparent"
                    strokeWidth="24"
                  />

                  {/* Base connection line */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={color.stroke}
                    strokeWidth={isCurrentActive ? 3.5 : (isSelected ? 3 : 2)}
                    strokeDasharray={isCurrentActive ? '6 4' : 'none'}
                    strokeLinecap="round"
                    markerEnd={`url(#${markerId})`}
                    opacity={isCurrentActive ? 1 : 0.75}
                    className={isCurrentActive ? 'animate-pulse' : 'group-hover:opacity-100'}
                  />

                  {/* Connection Label Pill */}
                  <g transform={`translate(${midX}, ${midY - 14})`}>
                    <rect
                      x="-55"
                      y="-9"
                      width="110"
                      height="18"
                      rx="9"
                      fill="#ffffff"
                      stroke={isSelected ? '#2563eb' : (isCurrentActive ? color.stroke : '#cbd5e1')}
                      strokeWidth={isCurrentActive || isSelected ? 1.5 : 1}
                      className="shadow-sm"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill={color.stroke}
                      fontSize="9.5"
                      fontWeight="600"
                      fontFamily="Inter, sans-serif"
                    >
                      {conn.label}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* LIVE ANIMATED IN-FLIGHT PACKETS */}
            {activePackets.map((pkt) => {
              const isMalicious = pkt.type === 'malicious';
              const isCleared = pkt.status === 'cleared' || pkt.type === 'legitimate';
              const color = isCleared ? '#10b981' : (isMalicious ? '#e11d48' : '#3b82f6');
              const filterId = isCleared ? 'url(#packet-glow-green)' : 'url(#packet-glow-red)';

              return (
                <g
                  key={pkt.instanceId}
                  transform={`translate(${pkt.currentX}, ${pkt.currentY})`}
                  className="pointer-events-none transition-transform"
                >
                  {/* Packet Halo Aura */}
                  <circle
                    r="8"
                    fill={color}
                    opacity="0.3"
                    filter={filterId}
                  />

                  {/* Core Packet Dot */}
                  <circle
                    r="5"
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />

                  {/* Packet Payload Label Pill */}
                  {pkt.label && (
                    <g transform="translate(0, -14)">
                      <rect
                        x="-40"
                        y="-8"
                        width="80"
                        height="16"
                        rx="8"
                        fill={color}
                        className="shadow-md"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="700"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {pkt.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Network Device Nodes (HTML ForeignObjects) */}
            {attack.nodes.map((node) => {
              const { pos } = nodeMap[node.id];
              const state = getNodeState(node);
              const isSelected = selectedElement?.id === node.id;
              const IconComponent = node.icon;
              const cardWidth = 148;
              const cardHeight = 84;

              return (
                <foreignObject
                  key={node.id}
                  x={pos.x - cardWidth / 2}
                  y={pos.y - cardHeight / 2}
                  width={cardWidth}
                  height={cardHeight}
                  className="overflow-visible"
                >
                  <div
                    onClick={() => onSelectElement({ ...node, elementType: 'node' })}
                    className={`w-full h-full rounded-xl border p-2 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                      state.cardClass
                    } ${isSelected ? 'ring-2 ring-blue-600 shadow-md' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${state.iconBg}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className={`text-[8.5px] font-mono font-semibold px-1.5 py-0.5 rounded-full border truncate max-w-[84px] ${state.badgeClass}`}>
                        {state.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-bold text-slate-900 leading-tight truncate">
                        {node.label}
                      </h4>
                      <p className="text-[9px] text-slate-500 truncate mt-0.5">
                        {node.desc}
                      </p>
                    </div>
                  </div>
                </foreignObject>
              );
            })}
          </svg>

          {/* BLOCKED PACKETS QUARANTINE TRAY */}
          <div className="absolute bottom-2.5 left-3 right-3 sm:bottom-3 sm:left-4 sm:right-4 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-white/95 backdrop-blur-sm border border-slate-200 text-xs shadow-md">
            <div className="flex items-center gap-2">
              <ShieldX className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-mono font-bold text-slate-800 text-[11px] sm:text-xs">
                BLOCKED PACKETS QUARANTINE:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {quarantinedPackets.length === 0 ? (
                  <span className="text-slate-400 font-mono text-[11px]">0 packets intercepted</span>
                ) : (
                  quarantinedPackets.slice(0, 4).map((qp, idx) => (
                    <span
                      key={qp.id || idx}
                      className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-mono text-[10px] font-bold animate-fadeIn"
                    >
                      ✕ {qp.label}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-mono">STATUS:</span>
              <span className={`text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                defenseActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
              }`}>
                {defenseActive ? 'DEFENSE ACTIVE · FILTERING' : 'DEFENSE OFF · UNFILTERED FLOOD'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
