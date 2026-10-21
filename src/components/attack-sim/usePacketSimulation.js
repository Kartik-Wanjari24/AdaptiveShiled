import { useState, useEffect, useRef, useCallback } from 'react';

// Scenario wave scripts for each of the 6 attacks
export const SCENARIO_SCRIPTS = {
  ddos: [
    {
      time: 0,
      log: 'Botnet army coordinates multi-node packet surge; legitimate user initiates request',
      explanation: 'Compromised botnet devices (IoT camera, router, server) simultaneously blast packets toward the web server while a real user requests a store page.',
      statusText: 'BOTNET SURGE INITIATED',
      activeStepIndex: 0,
      activeNode: 'bot1',
      activeConnection: 'c1',
      packets: [
        { id: 'p1', from: 'bot1', to: 'internetGateway', type: 'malicious', label: 'SYN flood', duration: 1.5, interceptAt: 'rateLimiter', continueTo: 'webServer' },
        { id: 'p2', from: 'bot2', to: 'internetGateway', type: 'malicious', label: 'UDP flood', duration: 1.4, interceptAt: 'rateLimiter', continueTo: 'webServer' },
        { id: 'p3', from: 'bot3', to: 'internetGateway', type: 'malicious', label: 'HTTP flood', duration: 1.6, interceptAt: 'rateLimiter', continueTo: 'webServer' },
        { id: 'p4', from: 'legitUsers', to: 'internetGateway', type: 'legitimate', label: 'GET /store', duration: 1.5, interceptAt: 'rateLimiter', continueTo: 'webServer' }
      ]
    },
    {
      time: 2.0,
      log: 'Traffic converges at Internet Gateway and enters inspection zone',
      explanation: 'Both legitimate customer traffic and hostile flood packets aggregate at the perimeter gateway and reach the AdaptiveShield Rate Limiter.',
      statusText: 'PERIMETER INGRESS INSPECTION',
      activeStepIndex: 1,
      activeNode: 'internetGateway',
      activeConnection: 'c5',
      packets: [
        { id: 'p5', from: 'internetGateway', to: 'rateLimiter', type: 'malicious', label: 'SYN flood', duration: 1.4, interceptAt: 'rateLimiter', continueTo: 'webServer' },
        { id: 'p6', from: 'internetGateway', to: 'rateLimiter', type: 'malicious', label: 'UDP flood', duration: 1.3, interceptAt: 'rateLimiter', continueTo: 'webServer' },
        { id: 'p7', from: 'internetGateway', to: 'rateLimiter', type: 'malicious', label: 'HTTP flood', duration: 1.5, interceptAt: 'rateLimiter', continueTo: 'webServer' },
        { id: 'p8', from: 'internetGateway', to: 'rateLimiter', type: 'legitimate', label: 'GET /store', duration: 1.4, interceptAt: 'rateLimiter', continueTo: 'webServer' }
      ]
    },
    {
      time: 4.0,
      log: 'Rate Limiter inspects burst: 3 bot streams evaluated against sliding-window policy',
      explanation: 'AdaptiveShield Stage 3 tracks IP frequencies. With Defense ON, packets exceeding 8 req/4s are quarantined. With Defense OFF, flood packets pass unfiltered.',
      statusText: 'STAGE 3 RATE LIMITING EVALUATION',
      activeStepIndex: 2,
      activeNode: 'rateLimiter',
      activeConnection: 'c6',
      packets: []
    },
    {
      time: 5.5,
      log: 'Traffic scrubbing: excessive bot packets dropped; clean user stream forwarded',
      explanation: 'With Defense ON: Bot packets turn red and drop into the quarantine tray. Legitimate packets turn green and reach the web server. With Defense OFF: Flood packets saturate worker threads.',
      statusText: 'TRAFFIC SCRUBBING APPLIED',
      activeStepIndex: 3,
      activeNode: 'rateLimiter',
      activeConnection: 'c6',
      packets: []
    },
    {
      time: 7.5,
      log: 'Target Web Server status finalized: response capacity evaluated',
      explanation: 'With Defense ON: Web Server CPU remains healthy at 18% (200 OK). With Defense OFF: Server CPU reaches 100%, causing HTTP 503 Service Unavailable errors.',
      statusText: 'FINAL AVAILABILITY EVALUATED',
      activeStepIndex: 4,
      activeNode: 'webServer',
      activeConnection: 'c6',
      packets: []
    }
  ],

  sqli: [
    {
      time: 0,
      log: 'Attacker injects SQL boolean tautology into login form username field',
      explanation: "Attacker crafts input containing `admin' OR '1'='1' --` designed to manipulate the backend SQL query logic and bypass password authentication.",
      statusText: 'SQL TAUTOLOGY SUBMITTED',
      activeStepIndex: 0,
      activeNode: 'userForm',
      activeConnection: 'c1',
      packets: [
        { id: 'sq1', from: 'userForm', to: 'webServer', type: 'malicious', label: "' OR '1'='1", duration: 1.8, interceptAt: 'inspectionLayer', continueTo: 'database' }
      ]
    },
    {
      time: 2.2,
      log: 'Web Application Server receives input parameter and prepares SQL query',
      explanation: 'The backend application takes the HTTP POST parameter and prepares a database command string.',
      statusText: 'QUERY CONSTRUCTION',
      activeStepIndex: 1,
      activeNode: 'webServer',
      activeConnection: 'c2',
      packets: [
        { id: 'sq2', from: 'webServer', to: 'inspectionLayer', type: 'malicious', label: "WHERE '1'='1'", duration: 1.8, interceptAt: 'inspectionLayer', continueTo: 'database' }
      ]
    },
    {
      time: 4.4,
      log: 'AdaptiveShield Stage 4 DPI scans payload for SQL syntax keywords',
      explanation: 'With Defense ON: Deep Payload Inspection matches SIG-SQLI and parameterized queries treat input as literal data. With Defense OFF: Dynamic string concatenation executes raw SQL.',
      statusText: 'STAGE 4 DPI INSPECTION',
      activeStepIndex: 2,
      activeNode: 'inspectionLayer',
      activeConnection: 'c3',
      packets: []
    },
    {
      time: 6.2,
      log: 'Database executes query: access decision produced',
      explanation: 'With Defense ON: The malicious packet is blocked (HTTP 403 Forbidden). With Defense OFF: Query evaluates to TRUE for all rows, dumping user tables to the attacker.',
      statusText: 'DATABASE ACCESS VERDICT',
      activeStepIndex: 3,
      activeNode: 'database',
      activeConnection: 'c3',
      packets: []
    },
    {
      time: 8.0,
      log: 'Evaluation complete: database integrity and confidentiality assessed',
      explanation: 'With Defense ON: Database records remain 100% confidential. With Defense OFF: 1,420 user records and password hashes exfiltrated.',
      statusText: 'DATA INTEGRITY FINALIZED',
      activeStepIndex: 4,
      activeNode: 'database',
      activeConnection: 'c3',
      packets: []
    }
  ],

  xss: [
    {
      time: 0,
      log: 'Attacker inputs hostile JavaScript string: <script>stealCookies()</script>',
      explanation: 'Attacker submits a script snippet through an input field, hoping the server will display it unencoded to other website visitors.',
      statusText: 'MALICIOUS SCRIPT INPUT',
      activeStepIndex: 0,
      activeNode: 'attacker',
      activeConnection: 'c1',
      packets: [
        { id: 'x1', from: 'attacker', to: 'inputForm', type: 'malicious', label: '<script>steal()', duration: 1.6, interceptAt: 'securityPolicy', continueTo: 'victimBrowser' }
      ]
    },
    {
      time: 2.0,
      log: 'Payload transmitted via HTTP POST to Web Application Server',
      explanation: 'The form input travels to the web server where the content will be rendered into dynamic HTML pages.',
      statusText: 'HTTP TRANSMISSION',
      activeStepIndex: 1,
      activeNode: 'inputForm',
      activeConnection: 'c2',
      packets: [
        { id: 'x2', from: 'inputForm', to: 'webapp', type: 'malicious', label: '<script>', duration: 1.6, interceptAt: 'securityPolicy', continueTo: 'victimBrowser' }
      ]
    },
    {
      time: 4.0,
      log: 'Web server passes output to AdaptiveShield DPI & CSP generator',
      explanation: 'The security layer evaluates the HTML document for script tags and configures browser Content Security Policy headers.',
      statusText: 'SECURITY POLICY EVALUATION',
      activeStepIndex: 2,
      activeNode: 'webapp',
      activeConnection: 'c3',
      packets: [
        { id: 'x3', from: 'webapp', to: 'securityPolicy', type: 'warning', label: 'evaluating...', duration: 1.5, interceptAt: 'securityPolicy', continueTo: 'victimBrowser' }
      ]
    },
    {
      time: 6.0,
      log: 'Sanitization & CSP Enforcement applied to HTML response',
      explanation: "With Defense ON: Script tags are sanitized to `&lt;script&gt;` and CSP `script-src 'self'` is enforced. With Defense OFF: Raw executable JavaScript is delivered.",
      statusText: 'RESPONSE HEADERS APPLIED',
      activeStepIndex: 3,
      activeNode: 'securityPolicy',
      activeConnection: 'c4',
      packets: []
    },
    {
      time: 7.8,
      log: 'Webpage renders in User Browser: client-side DOM execution checked',
      explanation: 'With Defense ON: Browser safely renders text without executing script. Session cookies protected! With Defense OFF: Script runs, stealing session token.',
      statusText: 'BROWSER DOM RENDERING',
      activeStepIndex: 4,
      activeNode: 'victimBrowser',
      activeConnection: 'c4',
      packets: []
    }
  ],

  ransomware: [
    {
      time: 0,
      log: 'Initial infection: ransomware loader executes on Patient Zero',
      explanation: 'Employee opens an infected attachment. Malware executes on the local workstation and begins encrypting files on Patient Zero.',
      statusText: 'PATIENT ZERO INFECTED',
      activeStepIndex: 0,
      activeNode: 'infectedPc',
      activeConnection: 'c1',
      packets: [
        { id: 'r1', from: 'attacker', to: 'infectedPc', type: 'malicious', label: 'ransomware.exe', duration: 1.8, interceptAt: 'shieldIsolation', continueTo: 'networkSwitch' }
      ]
    },
    {
      time: 2.2,
      log: 'Patient Zero initiates peer-to-peer network discovery and lateral probes',
      explanation: 'Malware attempts direct infection of nearby Employee Workstations before launching subnet-wide SMB port scans.',
      statusText: 'LATERAL DISCOVERY',
      activeStepIndex: 1,
      activeNode: 'infectedPc',
      activeConnection: 'c2',
      packets: [
        { id: 'r2', from: 'infectedPc', to: 'employeePc', type: 'warning', label: 'Peer Probe', duration: 1.6, interceptAt: 'shieldIsolation', continueTo: 'networkSwitch' }
      ]
    },
    {
      time: 4.2,
      log: 'Patient Zero blasts Port 445 (SMB) scan storm into Internal Network Switch',
      explanation: 'The infected computer broadcasts thousands of SMB/RDP connection attempts into the core switch to infect central enterprise servers.',
      statusText: 'SMB PORT 445 SCAN STORM',
      activeStepIndex: 2,
      activeNode: 'networkSwitch',
      activeConnection: 'c3',
      packets: [
        { id: 'r3', from: 'infectedPc', to: 'networkSwitch', type: 'malicious', label: 'SMB:445', duration: 1.5, interceptAt: 'shieldIsolation', continueTo: 'fileServer' }
      ]
    },
    {
      time: 6.0,
      log: 'AdaptiveShield Stage 2 detects lateral scan storm; triggers host quarantine',
      explanation: 'With Defense ON: AdaptiveShield instructs the switch to immediately shut down Patient Zero’s port. With Defense OFF: Probe packets traverse the switch.',
      statusText: 'PORT & PROTOCOL CONTAINMENT',
      activeStepIndex: 3,
      activeNode: 'shieldIsolation',
      activeConnection: 'c4',
      packets: []
    },
    {
      time: 7.6,
      log: 'Quarantine policy applied: switch port severed from compromised host',
      explanation: 'With Defense ON: Patient Zero is isolated. Packets to File Server, App Server, and DB are terminated. With Defense OFF: Ransomware worm encrypts all servers.',
      statusText: 'ZERO-TRUST ISOLATION ENFORCED',
      activeStepIndex: 4,
      activeNode: 'shieldIsolation',
      activeConnection: 'c4',
      packets: []
    },
    {
      time: 9.2,
      log: 'Enterprise servers protected: corporate storage, apps, and backups secure',
      explanation: 'With Defense ON: File Server, App Server, DB Server, and Backup Server remain 100% untouched. With Defense OFF: All enterprise data locked with .locked extensions.',
      statusText: 'SERVER ASSETS PROTECTED',
      activeStepIndex: 5,
      activeNode: 'networkSwitch',
      activeConnection: 'c5',
      packets: []
    }
  ],

  mitm: [
    {
      time: 0,
      log: 'Client Computer initiates online banking payment ($500 transfer)',
      explanation: 'Customer initiates a financial authorization request across the local network to transfer $500 to a vendor.',
      statusText: 'TRANSACTION INITIATION',
      activeStepIndex: 0,
      activeNode: 'clientPc',
      activeConnection: 'c1',
      packets: [
        { id: 'm1', from: 'clientPc', to: 'localNetwork', type: 'normal', label: '$500 Transfer', duration: 1.6, interceptAt: 'tlsValidator', continueTo: 'bankServer' }
      ]
    },
    {
      time: 2.0,
      log: 'Rogue proxy on local network broadcasts ARP spoofing to divert packet stream',
      explanation: 'An attacker device on the local network attempts to position itself as a man-in-the-middle to intercept and modify traffic.',
      statusText: 'ARP POISONING INTERCEPTION',
      activeStepIndex: 1,
      activeNode: 'interceptor',
      activeConnection: 'c2',
      packets: [
        { id: 'm2', from: 'localNetwork', to: 'interceptor', type: 'warning', label: 'ARP Poison', duration: 1.6, interceptAt: 'tlsValidator', continueTo: 'bankServer' }
      ]
    },
    {
      time: 4.0,
      log: 'Connection reaches TLS 1.3 & Digital Certificate validation checkpoint',
      explanation: 'Client checks the server’s cryptographic identity certificate. Rogue proxy attempts to present a forged certificate.',
      statusText: 'TLS CERTIFICATE VALIDATION',
      activeStepIndex: 2,
      activeNode: 'tlsValidator',
      activeConnection: 'c4',
      packets: [
        { id: 'm3', from: 'interceptor', to: 'tlsValidator', type: 'malicious', label: 'Altered: $5000', duration: 1.6, interceptAt: 'tlsValidator', continueTo: 'bankServer' }
      ]
    },
    {
      time: 6.0,
      log: 'Verification verdict: forged certificate rejected; encrypted tunnel enforced',
      explanation: 'With Defense ON: Fake certificate rejected; client communicates via authenticated direct TLS tunnel. With Defense OFF: Tampered $5,000 transaction accepted.',
      statusText: 'CRYPTOGRAPHIC VERDICT APPLIED',
      activeStepIndex: 3,
      activeNode: 'tlsValidator',
      activeConnection: 'c5',
      packets: []
    },
    {
      time: 8.0,
      log: 'Destination Bank Server receives verified transaction',
      explanation: 'With Defense ON: Bank server executes authentic $500 transfer safely. With Defense OFF: Bank executes fraudulent $5,000 transfer to attacker.',
      statusText: 'TRANSACTION FINALIZED',
      activeStepIndex: 4,
      activeNode: 'bankServer',
      activeConnection: 'c5',
      packets: []
    }
  ],

  phishing: [
    {
      time: 0,
      log: 'Attacker dispatches urgency lure email with spoofed IT sender headers',
      explanation: 'An email claiming "Urgent: Password expires in 1 hour" is sent from a lookalike domain `support@cornpany-auth.com`.',
      statusText: 'PHISHING LURE DISPATCHED',
      activeStepIndex: 0,
      activeNode: 'attacker',
      activeConnection: 'c1',
      packets: [
        { id: 'ph1', from: 'attacker', to: 'emailGateway', type: 'malicious', label: 'Urgent Lure', duration: 1.6, interceptAt: 'credShield', continueTo: 'fakeWebsite' }
      ]
    },
    {
      time: 2.0,
      log: 'Secure Email Gateway inspects sender SPF/DKIM authentication records',
      explanation: 'With Defense ON: SPF check fails; email is tagged with [SUSPICIOUS SENDER]. With Defense OFF: Unmarked email reaches employee inbox.',
      statusText: 'EMAIL SENDER VERIFICATION',
      activeStepIndex: 1,
      activeNode: 'emailGateway',
      activeConnection: 'c2',
      packets: [
        { id: 'ph2', from: 'emailGateway', to: 'employeeInbox', type: 'warning', label: 'Delivered Msg', duration: 1.6, interceptAt: 'credShield', continueTo: 'fakeWebsite' }
      ]
    },
    {
      time: 4.0,
      log: 'Employee clicks link; browser navigates toward external login portal',
      explanation: 'The user clicks the link leading to a cloned corporate login screen.',
      statusText: 'URL NAVIGATION',
      activeStepIndex: 2,
      activeNode: 'employeeInbox',
      activeConnection: 'c3',
      packets: [
        { id: 'ph3', from: 'employeeInbox', to: 'fakeWebsite', type: 'malicious', label: 'Link Click', duration: 1.6, interceptAt: 'credShield', continueTo: 'fakeWebsite' }
      ]
    },
    {
      time: 6.0,
      log: 'AdaptiveShield URL reputation scanner detects deceptive domain',
      explanation: 'With Defense ON: Deceptive domain is blocked with a red warning banner. FIDO2 token refuses credential submission. With Defense OFF: Cloned portal captures credentials.',
      statusText: 'DOMAIN REPUTATION CHECK',
      activeStepIndex: 3,
      activeNode: 'fakeWebsite',
      activeConnection: 'c4',
      packets: []
    },
    {
      time: 8.0,
      log: 'Credential protection finalized: simulated credentials safeguarded',
      explanation: 'With Defense ON: Zero credentials stolen (FIDO2 cryptographic URL binding). With Defense OFF: Simulated credentials exfiltrated to attacker database.',
      statusText: 'IDENTITY SAFEGUARDED',
      activeStepIndex: 4,
      activeNode: 'credShield',
      activeConnection: 'c4',
      packets: []
    }
  ]
};

export function usePacketSimulation({ attackId, nodes, connections }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [defenseActive, setDefenseActive] = useState(true);
  const [speed, setSpeed] = useState(1.0); // 0.5, 1.0, 2.0
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // In-flight active packets
  const [activePackets, setActivePackets] = useState([]);
  // Blocked packets in quarantine tray
  const [quarantinedPackets, setQuarantinedPackets] = useState([]);

  // Live Metrics
  const [metrics, setMetrics] = useState({
    generated: 0,
    inspected: 0,
    blocked: 0,
    delivered: 0,
    targetHealth: 100, // 0-100%
    attackStatus: 'IDLE · READY TO SIMULATE'
  });

  // Event Logs: array of { id, time, text, active }
  const [eventLogs, setEventLogs] = useState([]);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [activeConnectionId, setActiveConnectionId] = useState(null);

  // Scenario timeline state
  const simTimeRef = useRef(0);
  const eventIdxRef = useRef(0);
  const animationFrameRef = useRef(null);
  const lastTimestampRef = useRef(null);

  const scenario = SCENARIO_SCRIPTS[attackId] || SCENARIO_SCRIPTS.ddos;

  // Node position dictionary (normalized to 1000 x 520 SVG coordinate space)
  const nodePosMap = useRef({});
  useEffect(() => {
    const map = {};
    nodes.forEach(n => {
      map[n.id] = {
        x: (n.x / 100) * 1000,
        y: (n.y / 100) * 520
      };
    });
    nodePosMap.current = map;
  }, [nodes]);

  // Reset simulation to initial state
  const resetSimulation = useCallback(() => {
    setIsPlaying(false);
    simTimeRef.current = 0;
    eventIdxRef.current = 0;
    lastTimestampRef.current = null;
    setActivePackets([]);
    setQuarantinedPackets([]);
    setCurrentStepIndex(0);
    setActiveNodeId(null);
    setActiveConnectionId(null);
    setMetrics({
      generated: 0,
      inspected: 0,
      blocked: 0,
      delivered: 0,
      targetHealth: 100,
      attackStatus: 'IDLE · READY TO SIMULATE'
    });
    setEventLogs([]);
    setCurrentExplanation('Click "Start Simulation" or "Step Forward" to watch animated packets travel through the network.');
  }, []);

  // When attack scenario changes, reset cleanly
  useEffect(() => {
    resetSimulation();
  }, [attackId, resetSimulation]);

  // Dispatch an event wave from the scenario script
  const triggerEventWave = useCallback((eventObj) => {
    if (!eventObj) return;

    setCurrentStepIndex(eventObj.activeStepIndex || 0);
    setActiveNodeId(eventObj.activeNode || null);
    setActiveConnectionId(eventObj.activeConnection || null);
    setCurrentExplanation(eventObj.explanation || '');

    const timeFormatted = `00:${String(Math.floor(simTimeRef.current)).padStart(2, '0')}`;
    const logText = defenseActive ? eventObj.log : eventObj.log.replace('blocked', 'allowed (Defense OFF)').replace('sanitized', 'executed (Defense OFF)');

    setEventLogs(prev => [
      ...prev.map(l => ({ ...l, active: false })),
      { id: Date.now() + Math.random(), time: timeFormatted, text: logText, active: true }
    ]);

    setMetrics(prev => ({
      ...prev,
      attackStatus: defenseActive ? eventObj.statusText : `${eventObj.statusText} · DEFENSE OFF`
    }));

    // Spawn packets for this event
    if (eventObj.packets && eventObj.packets.length > 0) {
      const newPackets = eventObj.packets.map((p, idx) => {
        const fromPos = nodePosMap.current[p.from] || { x: 100, y: 260 };
        const toPos = nodePosMap.current[p.to] || { x: 500, y: 260 };
        return {
          ...p,
          instanceId: `${p.id}-${Date.now()}-${idx}`,
          startTime: simTimeRef.current,
          duration: p.duration || 1.6,
          fromPos,
          toPos,
          currentX: fromPos.x,
          currentY: fromPos.y,
          progress: 0,
          status: 'in-flight'
        };
      });

      setActivePackets(prev => [...prev, ...newPackets]);
      setMetrics(prev => ({
        ...prev,
        generated: prev.generated + newPackets.length
      }));
    }
  }, [defenseActive]);

  // Step Forward (discrete event-by-event mode)
  const stepForward = useCallback(() => {
    if (eventIdxRef.current < scenario.length) {
      const eventObj = scenario[eventIdxRef.current];
      triggerEventWave(eventObj);
      eventIdxRef.current += 1;
    } else {
      // Loop or restart scenario
      eventIdxRef.current = 0;
      simTimeRef.current = 0;
      const eventObj = scenario[0];
      triggerEventWave(eventObj);
      eventIdxRef.current = 1;
    }
  }, [scenario, triggerEventWave]);

  // Master Animation Loop (requestAnimationFrame)
  useEffect(() => {
    if (!isPlaying) {
      lastTimestampRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const animate = (timestamp) => {
      if (!lastTimestampRef.current) {
        lastTimestampRef.current = timestamp;
      }

      const deltaMs = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;
      const deltaSec = (deltaMs / 1000) * speed;

      simTimeRef.current += deltaSec;
      const currentTime = simTimeRef.current;

      // Check if next scheduled event should trigger
      if (eventIdxRef.current < scenario.length) {
        const nextEvent = scenario[eventIdxRef.current];
        if (currentTime >= nextEvent.time) {
          triggerEventWave(nextEvent);
          eventIdxRef.current += 1;
        }
      } else {
        // Completed full scenario loop: wait 3 seconds, then loop
        const lastEvent = scenario[scenario.length - 1];
        if (currentTime >= lastEvent.time + 3.5) {
          simTimeRef.current = 0;
          eventIdxRef.current = 0;
        }
      }

      // Update in-flight packet positions
      setActivePackets(prevPackets => {
        const remaining = [];

        prevPackets.forEach(pkt => {
          const elapsed = currentTime - pkt.startTime;
          const progress = Math.min(1.0, elapsed / pkt.duration);

          const currentX = pkt.fromPos.x + (pkt.toPos.x - pkt.fromPos.x) * progress;
          const currentY = pkt.fromPos.y + (pkt.toPos.y - pkt.fromPos.y) * progress;

          if (progress < 1.0) {
            remaining.push({
              ...pkt,
              progress,
              currentX,
              currentY
            });
          } else {
            // Packet reached destination component!
            // Apply inspection & defense decisions
            if (pkt.interceptAt && pkt.to === pkt.interceptAt) {
              setMetrics(m => ({ ...m, inspected: m.inspected + 1 }));

              if (pkt.type === 'malicious') {
                if (defenseActive) {
                  // Blocked by defense component!
                  setMetrics(m => ({ ...m, blocked: m.blocked + 1 }));
                  setQuarantinedPackets(q => [
                    { id: pkt.instanceId, label: pkt.label, time: new Date().toLocaleTimeString() },
                    ...q.slice(0, 5) // Keep last 6 in quarantine tray
                  ]);
                } else {
                  // Defense OFF: Malicious packet passes through to target!
                  if (pkt.continueTo) {
                    const fromPos = nodePosMap.current[pkt.to] || { x: 500, y: 260 };
                    const toPos = nodePosMap.current[pkt.continueTo] || { x: 900, y: 260 };
                    remaining.push({
                      ...pkt,
                      from: pkt.to,
                      to: pkt.continueTo,
                      fromPos,
                      toPos,
                      startTime: currentTime,
                      duration: 1.4,
                      progress: 0,
                      interceptAt: null,
                      status: 'bypassed'
                    });
                  }
                }
              } else {
                // Legitimate packet continues to destination
                if (pkt.continueTo) {
                  const fromPos = nodePosMap.current[pkt.to] || { x: 500, y: 260 };
                  const toPos = nodePosMap.current[pkt.continueTo] || { x: 900, y: 260 };
                  remaining.push({
                    ...pkt,
                    from: pkt.to,
                    to: pkt.continueTo,
                    fromPos,
                    toPos,
                    startTime: currentTime,
                    duration: 1.4,
                    progress: 0,
                    interceptAt: null,
                    status: 'cleared'
                  });
                }
              }
            } else {
              // Final destination arrived
              if (pkt.type === 'legitimate') {
                setMetrics(m => ({
                  ...m,
                  delivered: m.delivered + 1,
                  targetHealth: 100
                }));
              } else if (pkt.type === 'malicious' && !defenseActive) {
                // Malicious impact on target when defense is OFF!
                setMetrics(m => ({
                  ...m,
                  targetHealth: Math.max(12, m.targetHealth - 22)
                }));
              }
            }
          }
        });

        return remaining;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speed, scenario, defenseActive, triggerEventWave]);

  return {
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
  };
}
