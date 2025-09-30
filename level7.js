document.addEventListener("DOMContentLoaded", () => {
  // Game state
  let level7Score = 0;
  let scenariosRemaining = 3;
  let currentDifficulty = "easy";
  let currentScenario = null; // Track current scenario
  
  // Emotion tracking
  let emotionCounts = {
    happy: 0, sad: 0, angry: 0, surprised: 0, neutral: 0, fearful: 0, disgusted: 0
  };
  let dominantEmotion = "neutral";
  let usedScenarios = { easy: [], medium: [], hard: [] };
  
  // DOM elements
  const scoreDisplay = document.getElementById("level7-score");
  const scenariosDisplay = document.getElementById("level7-calls-remaining");
  const scenarioContainer = document.getElementById("level7-container");
  const feedbackEl = document.getElementById("level7-feedback");
  const cyberBuddy = document.getElementById("cyberbuddy");
  const nextLevelBtn = document.getElementById("go-to-level8");

  // Network Attack Scenarios
  const scenarios = {
    easy: [
      {
        id: "easy-1",
        title: "🌐 كافيه الواي فاي العام",
        description: "اكتشفت اتصال غريب في شبكة الكافيه! ربط التهديدات بالأجهزة:",
        nodes: {
          laptop: { x: 100, y: 150, label: "💻 لابتوبك", type: "target" },
          phone: { x: 300, y: 100, label: "📱 موبايلك", type: "target" },
          wifi: { x: 200, y: 50, label: "📶 WiFi عام", type: "network" },
          attacker: { x: 400, y: 200, label: "👤 المخترق", type: "threat" },
          fakeAP: { x: 150, y: 250, label: "🔴 نقطة وصول مزيفة", type: "threat" },
          malware: { x: 350, y: 300, label: "🦠 برمجية خبيثة", type: "threat" }
        },
        correctConnections: [
          ["attacker", "fakeAP"],
          ["fakeAP", "laptop"],
          ["fakeAP", "phone"],
          ["laptop", "malware"],
          ["phone", "malware"],
        ],
        hint: "المخترق ينشئ نقطة وصول مزيفة لخداع الأجهزة وزرع البرمجيات الخبيثة!"
      },
      {
        id: "easy-2",
        title: "🏢 شبكة المكتب",
        description: "شخص غريب متصل بالشبكة! اكتشف مسار الهجوم:",
        nodes: {
          server: { x: 200, y: 100, label: "🖥️ السيرفر", type: "target" },
          employeePC: { x: 100, y: 200, label: "💻 جهاز الموظف", type: "device" },
          router: { x: 300, y: 150, label: "📡 الراوتر", type: "network" },
          phishingEmail: { x: 50, y: 300, label: "📧 إيميل تصيد", type: "threat" },
          hacker: { x: 400, y: 250, label: "🕵️ المخترق", type: "threat" }
        },
        correctConnections: [
          ["phishingEmail", "employeePC"],
          ["employeePC", "router"],
          ["router", "server"],
          ["hacker", "server"],
          ["router", "hacker"],
        ],
        hint: "الموظف فتح إيميل تصيد! درّب الموظفين على الوعي الأمني!"
      }
    ],
    medium: [
      {
        id: "medium-1",
        title: "✈️ مطار الواي فاي",
        description: "في المطار وشخص بيحاول يسرق بياناتك! ربط مسار الهجوم:",
        nodes: {
          yourLaptop: { x: 100, y: 150, label: "💻 جهازك", type: "target" },
          airportWiFi: { x: 250, y: 80, label: "🛫 WiFi المطار", type: "network" },
          evilTwin: { x: 400, y: 120, label: "👿 Evil Twin AP", type: "threat" },
          packetSniffer: { x: 300, y: 250, label: "📦 Packet Sniffer", type: "threat" },
          dataTheft: { x: 150, y: 300, label: "💸 سرقة البيانات", type: "threat" }
        },
        correctConnections: [
          ["airportWiFi", "evilTwin"],
          ["yourLaptop", "evilTwin"],
          ["evilTwin", "packetSniffer"],
          ["packetSniffer", "dataTheft"]
        ],
        hint: "Evil Twin Attack! المخترق ينشئ شبكة مزيفة لخداعك وسرقة بياناتك!"
      },
      {
        id: "medium-2",
        title: "🏪 متجر التسوق الإلكتروني",
        description: "موقع التسوق مخترق! اكتشف كيف سُرقت بيانات البطاقات:",
        nodes: {
          customerData: { x: 200, y: 80, label: "💳 بيانات العملاء", type: "target" },
          website: { x: 100, y: 150, label: "🛒 موقع التسوق", type: "device" },
          database: { x: 300, y: 150, label: "🗄️ قاعدة البيانات", type: "device" },
          sqlInjection: { x: 50, y: 250, label: "💉 SQL Injection", type: "threat" },
          backdoor: { x: 200, y: 300, label: "🚪 Backdoor", type: "threat" },
          dataExfiltration: { x: 350, y: 250, label: "📤 تسريب البيانات", type: "threat" }
        },
        correctConnections: [
          ["sqlInjection", "website"],
          ["website", "database"],
          ["database", "backdoor"],
          ["backdoor", "dataExfiltration"],
          ["dataExfiltration", "customerData"]
        ],
        hint: "SQL Injection يخترق الموقع ويزرع backdoor لسرقة بيانات العملاء!"
      }
    ],
    hard: [
      {
        id: "hard-1",
        title: "🏨 فندق الشبكة الخطرة",
        description: "شبكة الفندق مصابة! اكتشف التهديدات المترابطة:",
        nodes: {
          hotelServer: { x: 200, y: 80, label: "🏨 سيرفر الفندق", type: "target" },
          guestLaptop: { x: 100, y: 200, label: "💻 لابتوب ضيف", type: "device" },
          smartTV: { x: 300, y: 200, label: "📺 Smart TV", type: "device" },
          rogueDHCP: { x: 150, y: 300, label: "🔧 Rogue DHCP", type: "threat" },
          arpPoison: { x: 350, y: 300, label: "☠️ ARP Poisoning", type: "threat" },
          mitm: { x: 250, y: 400, label: "🎭 Man-in-the-Middle", type: "threat" }
        },
        correctConnections: [
          ["rogueDHCP", "guestLaptop"],
          ["arpPoison", "smartTV"],
          ["guestLaptop", "mitm"],
          ["smartTV", "mitm"],
          ["mitm", "hotelServer"]
        ],
        hint: "هجوم معقد! استخدم VPN، وتأكد من شهادات SSL، وحد من الأجهزة المتصلة!"
      },
      {
        id: "hard-2",
        title: "🏦 بنك الهجمات المتقدمة",
        description: "هجوم APT على البنك! اكتشف السلسلة المعقدة للاختراق:",
        nodes: {
          bankVault: { x: 250, y: 50, label: "🏦 خزينة البنك", type: "target" },
          employeeEmail: { x: 100, y: 150, label: "📧 إيميل الموظف", type: "device" },
          workstation: { x: 200, y: 150, label: "💻 محطة العمل", type: "device" },
          serverRoom: { x: 300, y: 150, label: "🖥️ غرفة الخوادم", type: "device" },
          spearPhishing: { x: 50, y: 250, label: "🎣 Spear Phishing", type: "threat" },
          lateralMovement: { x: 150, y: 300, label: "↔️ Lateral Movement", type: "threat" },
          privilegeEscalation: { x: 250, y: 300, label: "⬆️ Privilege Escalation", type: "threat" },
          dataExfiltration: { x: 350, y: 250, label: "📤 Data Exfiltration", type: "threat" }
        },
        correctConnections: [
          ["spearPhishing", "employeeEmail"],
          ["employeeEmail", "workstation"],
          ["workstation", "lateralMovement"],
          ["lateralMovement", "serverRoom"],
          ["serverRoom", "privilegeEscalation"],
          ["privilegeEscalation", "dataExfiltration"],
          ["dataExfiltration", "bankVault"]
        ],
        hint: "APT attack! هجوم متقدم يبدأ بـ spear phishing وينتهي بسرقة أموال البنك!"
      }
    ]
  };

  // Emotion detection
  async function detectEmotion() {
    if (!window.faceapi || !window.videoElement) return;
    try {
      const detections = await faceapi
        .detectSingleFace(window.videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections && detections.expressions) {
        let bestEmotion = "neutral";
        let bestValue = 0;
        for (let [emotion, value] of Object.entries(detections.expressions)) {
          if (value > bestValue) {
            bestEmotion = emotion;
            bestValue = value;
          }
        }
        emotionCounts[bestEmotion]++;
        dominantEmotion = Object.entries(emotionCounts).reduce((a, b) => b[1] > a[1] ? b : a)[0];
        adjustDifficulty();
      }
    } catch (e) {
      console.log("Emotion detection error:", e);
    }
  }

  setInterval(detectEmotion, 3000);

  function adjustDifficulty() {
    if (dominantEmotion === "surprised") currentDifficulty = "hard";
    else if (dominantEmotion === "happy" || dominantEmotion === "neutral") currentDifficulty = "medium";
    else currentDifficulty = "easy";
  }

  // NETWORK GAME - Connect the dots
  function displayScenario(scenario) {
    currentScenario = scenario; // Store current scenario
    const svgWidth = 600, svgHeight = 400;
    
    scenarioContainer.innerHTML = `
      <div class="network-game">
        <div class="network-header">
          <h3>${scenario.title}</h3>
          <p>${scenario.description}</p>
        </div>
        
        <div class="network-canvas">
          <svg width="${svgWidth}" height="${svgHeight}" id="network-svg">
            <!-- Connections will be drawn here -->
          </svg>
        </div>
        
        <div class="connection-tools">
          <h4>🔗 ربط التهديدات:</h4>
          <div class="connection-nodes">
            ${Object.entries(scenario.nodes).map(([id, node]) => `
              <div class="node-selector ${node.type}" data-id="${id}" data-x="${node.x}" data-y="${node.y}" title="${node.label}">
                <span class="node-icon">${getNodeIcon(node.type)}</span>
                <span class="node-id">${id}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="game-controls">
          <button class="btn-connect" id="btn-connect">🔗 ابدأ ربط</button>
          <button class="btn-check" id="btn-check">✅ تحقق</button>
          <button class="btn-clear" id="btn-clear">🗑️ مسح</button>
        </div>
      </div>
    `;

    drawNetworkGraph(scenario.nodes, []);
    setupNetworkInteraction(scenario.nodes);
    
    // Add event listeners to buttons
    document.getElementById('btn-connect').addEventListener('click', startConnection);
    document.getElementById('btn-check').addEventListener('click', checkNetworkConnections);
    document.getElementById('btn-clear').addEventListener('click', clearConnections);
  }

  function getNodeIcon(type) {
    const icons = {
      target: '🎯',
      device: '💻',
      network: '🌐',
      threat: '⚠️'
    };
    return icons[type] || '🔸';
  }

  function drawNetworkGraph(nodes, connections) {
    const svg = document.getElementById('network-svg');
    if (!svg) return;

    svg.innerHTML = '';

    // Draw nodes
    Object.entries(nodes).forEach(([id, node]) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', node.x);
      circle.setAttribute('cy', node.y);
      circle.setAttribute('r', 25);
      circle.setAttribute('fill', getNodeColor(node.type));
      circle.setAttribute('stroke', '#333');
      circle.setAttribute('stroke-width', 2);
      circle.setAttribute('data-id', id);
      circle.setAttribute('class', 'node-circle');
      svg.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x);
      text.setAttribute('y', node.y + 35);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '12');
      text.textContent = id;
      svg.appendChild(text);
    });

    // Draw connections
    connections.forEach(([from, to]) => {
      if (nodes[from] && nodes[to]) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', nodes[from].x);
        line.setAttribute('y1', nodes[from].y);
        line.setAttribute('x2', nodes[to].x);
        line.setAttribute('y2', nodes[to].y);
        line.setAttribute('stroke', '#ff4444');
        line.setAttribute('stroke-width', 3);
        line.setAttribute('data-connection', `${from}-${to}`);
        svg.appendChild(line);
      }
    });
  }

  function getNodeColor(type) {
    const colors = {
      target: '#ff6b6b',
      device: '#4ecdc4',
      network: '#45b7d1',
      threat: '#ff9f43'
    };
    return colors[type] || '#95a5a6';
  }

  let currentConnection = null;
  let currentConnections = [];

  function setupNetworkInteraction(nodes) {
    const svg = document.getElementById('network-svg');
    if (!svg) return;

    // Remove any existing event listeners first
    const newSvg = svg.cloneNode(true);
    svg.parentNode.replaceChild(newSvg, svg);

    newSvg.addEventListener('click', (e) => {
      if (e.target.tagName === 'circle' && e.target.classList.contains('node-circle')) {
        const nodeId = e.target.getAttribute('data-id');
        handleNodeClick(nodeId, e.target, nodes);
      }
    });
  }

  function handleNodeClick(nodeId, nodeElement, nodes) {
    if (!currentConnection) {
      currentConnection = nodeId;
      nodeElement.style.stroke = '#00ff00';
      nodeElement.style.strokeWidth = '4';
      feedbackEl.textContent = `اختر نقطة البداية: ${nodeId}`;
    } else if (currentConnection === nodeId) {
      nodeElement.style.stroke = '#333';
      nodeElement.style.strokeWidth = '2';
      currentConnection = null;
      feedbackEl.textContent = '';
    } else {
      const newConnection = [currentConnection, nodeId];
      const connectionKey = newConnection.slice().sort().join('-');
      
      const existingConnection = currentConnections.find(conn => 
        conn.slice().sort().join('-') === connectionKey
      );
      
      if (!existingConnection) {
        currentConnections.push(newConnection);
        drawNetworkGraph(nodes, currentConnections);
        feedbackEl.textContent = `تم ربط ${currentConnection} ← ${nodeId}`;
      } else {
        feedbackEl.textContent = `الاتصال موجود بالفعل!`;
      }
      
      // Reset selection
      const allNodes = document.querySelectorAll('#network-svg circle');
      allNodes.forEach(node => {
        node.style.stroke = '#333';
        node.style.strokeWidth = '2';
      });
      currentConnection = null;
    }
  }

  function startConnection() {
    currentConnection = null;
    feedbackEl.textContent = 'اضغط على عقدة لبدء الربط!';
    const nodes = document.querySelectorAll('#network-svg circle');
    nodes.forEach(node => {
      node.style.stroke = '#333';
      node.style.strokeWidth = '2';
    });
  }

  function clearConnections() {
    const svg = document.getElementById('network-svg');
    if (!svg) {
      feedbackEl.textContent = 'خطأ: لا يوجد رسم شبكة متاح!';
      return;
    }

    if (!currentScenario) {
      feedbackEl.textContent = 'خطأ: لا يوجد سيناريو متاح!';
      return;
    }

    currentConnections = [];
    drawNetworkGraph(currentScenario.nodes, []);
    feedbackEl.textContent = 'تم مسح كل الاتصالات!';
    feedbackEl.className = 'feedback';

    const nodes = document.querySelectorAll('#network-svg circle');
    nodes.forEach(node => {
      node.style.stroke = '#333';
      node.style.strokeWidth = '2';
    });

    currentConnection = null;
  }

  function checkNetworkConnections() {
    if (!currentScenario) {
      feedbackEl.textContent = 'خطأ: لا يوجد سيناريو متاح!';
      feedbackEl.className = 'feedback error';
      return;
    }

    const correctConnections = currentScenario.correctConnections;
    const hint = currentScenario.hint;

    console.log('=== DEBUG: Checking connections ===');
    console.log('User connections:', currentConnections);
    console.log('Correct connections:', correctConnections);

    if (!Array.isArray(correctConnections) || !correctConnections.every(conn => Array.isArray(conn) && conn.length === 2)) {
      feedbackEl.textContent = 'خطأ: بيانات الاتصالات الصحيحة غير صالحة!';
      feedbackEl.className = 'feedback error';
      return;
    }

    const validNodes = new Set(Object.keys(currentScenario.nodes));
    const invalidConnections = currentConnections.filter(
      conn => !validNodes.has(conn[0]) || !validNodes.has(conn[1])
    );
    if (invalidConnections.length > 0) {
      feedbackEl.textContent = 'خطأ: اتصالات تحتوي على عقد غير صالحة!';
      feedbackEl.className = 'feedback error';
      console.log('Invalid connections:', invalidConnections);
      return;
    }

    const userConnections = currentConnections
      .map(conn => conn.slice().sort().join('-'))
      .sort();
    const correctConnStrings = correctConnections
      .map(conn => conn.slice().sort().join('-'))
      .sort();

    console.log('User conn strings:', userConnections);
    console.log('Correct conn strings:', correctConnStrings);

    const isCorrect = JSON.stringify(userConnections) === JSON.stringify(correctConnStrings);

    if (isCorrect) {
      level7Score += 15;
      feedbackEl.textContent = '🎉 اكتشاف مثالي لمسار الهجوم! أنت محقق شبكات!';
      feedbackEl.className = 'feedback success';
      if (cyberBuddy) {
        cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>برافو! كشفت الاختراق زي المحترفين! 🕵️‍♂️🌐`;
      }
    } else {
      feedbackEl.textContent = `❌ مش كل الاتصالات صح! تلميح: ${hint}`;
      feedbackEl.className = 'feedback error';
      if (cyberBuddy) {
        cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>لسه فيه اتصالات مخفية! ركّز أكتر يا محقق! 🔍`;
      }
    }

    updateDisplays();
    scenariosRemaining--;
    currentConnections = [];

    setTimeout(() => {
      if (scenariosRemaining > 0) {
        loadNextScenario();
      } else {
        endLevel();
      }
    }, 3000);
  }

  function getCurrentScenario() {
    const available = scenarios[currentDifficulty].filter(s => !usedScenarios[currentDifficulty].includes(s.id));
    return available.length > 0 ? available[0] : scenarios[currentDifficulty][0];
  }

  function loadNextScenario() {
    if (scenariosRemaining <= 0) {
      endLevel();
      return;
    }
    
    const available = scenarios[currentDifficulty].filter(s => !usedScenarios[currentDifficulty].includes(s.id));
    if (available.length === 0) {
      // If no scenarios left in current difficulty, try others
      const difficulties = ["easy", "medium", "hard"];
      for (let diff of difficulties) {
        if (diff !== currentDifficulty) {
          const other = scenarios[diff].filter(s => !usedScenarios[diff].includes(s.id));
          if (other.length > 0) {
            currentDifficulty = diff;
            available.push(...other);
            break;
          }
        }
      }
    }
    
    if (available.length === 0) {
      // If still no scenarios available, reset used scenarios for current difficulty
      usedScenarios[currentDifficulty] = [];
      available.push(...scenarios[currentDifficulty]);
    }
    
    const scenario = available[Math.floor(Math.random() * available.length)];
    usedScenarios[currentDifficulty].push(scenario.id);
    currentConnections = [];
    currentConnection = null;
    displayScenario(scenario);
  }

  function updateDisplays() {
    scoreDisplay.textContent = level7Score;
    scenariosDisplay.textContent = scenariosRemaining;
  }

  function initLevel7() {
    level7Score = 0;
    scenariosRemaining = 3;
    usedScenarios = { easy: [], medium: [], hard: [] };
    currentConnections = [];
    currentConnection = null;
    updateDisplays();
    adjustDifficulty();
    loadNextScenario();
  }

  function endLevel() {
    document.getElementById("level7-screen").classList.add("hidden");
    document.getElementById("level7-congrats-screen").classList.remove("hidden");
    document.getElementById("go-to-level8").classList.remove("hidden");
    
    const finalScoreEl = document.getElementById("final-level7-score");
    if (finalScoreEl) finalScoreEl.textContent = level7Score;
    
    if (cyberBuddy) {
      cyberBuddy.innerHTML = `🤖 <strong>سايبر بودي</strong><br>مبروك! بقيت خبير كشف الاختراقات! 🕵️‍♂️🎉`;
    }
    
    const currentUser = localStorage.getItem("currentUser");
    if (typeof completeLevel === 'function') {
      completeLevel(currentUser, "level7", "🌐 Network Defender");
    }
  }

  if (nextLevelBtn) {
    nextLevelBtn.addEventListener("click", () => {
      document.getElementById("level7-congrats-screen").classList.add("hidden");
      document.getElementById("level8-screen").classList.remove("hidden");
      document.getElementById("go-to-level8").classList.add("hidden");
    });
  }

  // Initialize the level
  initLevel7();
});
