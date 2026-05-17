/**
 * TERMIRATOR CORE TERMINAL ENGINE
 * Cyberdyne Systems Model 101 Command Interface
 * Hybrid Mode: Terminator Powers + Real Shell
 */

class TermiratorTerminal {
  constructor() {
    this.output = document.getElementById("terminal-output");
    this.input = document.getElementById("terminal-input");
    this.prompt = document.getElementById("prompt");
    this.bootSequence = document.getElementById("boot-sequence");
    this.missionTimer = document.getElementById("mission-timer");
    this.powerLevel = document.getElementById("power-level");
    this.threatLevel = document.getElementById("threat-level");
    this.cpuStatus = document.getElementById("cpu-status");

    this.history = [];
    this.historyIndex = -1;
    this.powers = window.TerminatorPowers;
    this.commandCount = 0;
    this.startTime = Date.now();

    // Shell integration
    this.ws = null;
    this.shellMode = true;
    this.strictShell = false;
    this.processRunning = false;
    this.shellConnected = false;

    // AI Agent state
    this.aiModel = "qwen2.5";
    this.aiProvider = "ollama";
    this.aiEndpoint = null;
    this.aiApiKey = null;

    // Tabs
    this.tabs = [];
    this.activeTab = -1;
    this.nextTabId = 0;

    // Persistence
    this.persistKey = "termirator_session";
    this._saveTimeout = null;
    this._maxOutputLen = 200000;

    // Macro recording
    this.isRecording = false;
    this.currentMacroName = null;
    this.recordedCommands = [];
    this.macroKey = "termirator_macros";

    // Reader (speaks command output)
    this.readerEnabled = false;

    // Autocomplete
    this.acBox = document.getElementById("autocomplete-box");
    this.acSuggestions = [];
    this.acIndex = -1;
    this.acVisible = false;
    this._acSuppressInput = false;

    this.commands = {
      help: {
        fn: this.cmdHelp,
        desc: "Display available commands and protocols",
      },
      clear: { fn: this.cmdClear, desc: "Clear the terminal screen" },
      scan: { fn: this.cmdScan, desc: "Scan for targets in the area" },
      analyze: {
        fn: this.cmdAnalyze,
        desc: "Analyze a target or system component",
      },
      terminate: {
        fn: this.cmdTerminate,
        desc: "Initiate termination protocol",
      },
      learn: { fn: this.cmdLearn, desc: "Access machine learning database" },
      mimic: { fn: this.cmdMimic, desc: "Mimic voice/personality patterns" },
      timewarp: {
        fn: this.cmdTimewarp,
        desc: "Display time displacement coordinates",
      },
      diagnostic: {
        fn: this.cmdDiagnostic,
        desc: "Run self-diagnostic routine",
      },
      protocol: {
        fn: this.cmdProtocol,
        desc: "Display active mission protocols",
      },
      voice: { fn: this.cmdVoice, desc: "Toggle or use voice synthesis" },
      vision: { fn: this.cmdVision, desc: "Change optical vision mode" },
      target: {
        fn: this.cmdTarget,
        desc: "Display or manage acquired targets",
      },
      weapon: { fn: this.cmdWeapon, desc: "Check or select weapon systems" },
      infiltrate: {
        fn: this.cmdInfiltrate,
        desc: "Activate infiltration protocols",
      },
      listen: {
        fn: this.cmdListen,
        desc: "Real-time data surveillance on files or processes",
      },
      intercept: {
        fn: this.cmdIntercept,
        desc: "Network interception and connection scan",
      },
      surveillance: {
        fn: this.cmdSurveillance,
        desc: "Filesystem surveillance and change detection",
      },
      ask: {
        fn: this.cmdAsk,
        desc: "Query TERMITORIA",
      },
      skynet: { fn: this.cmdSkynet, desc: "Attempt Skynet connection" },
      sarah: { fn: this.cmdSarah, desc: "Search for Sarah Connor" },
      hastalavista: { fn: this.cmdHasta, desc: "Execute iconic phrase" },
      illbeback: { fn: this.cmdBeBack, desc: "Promise of return" },
      chrono: { fn: this.cmdChrono, desc: "Chronological analysis" },
      polyalloy: {
        fn: this.cmdPolyAlloy,
        desc: "Check mimetic polyalloy status",
      },
      neural: { fn: this.cmdNeural, desc: "Neural net processor interface" },
      endo: { fn: this.cmdEndo, desc: "Display endoskeleton status" },
      chip: { fn: this.cmdChip, desc: "CPU chip data and subroutines" },
      quote: { fn: this.cmdQuote, desc: "Display a famous quote" },
      date: { fn: this.cmdDate, desc: "Current mission date/time" },
      whoami: { fn: this.cmdWhoAmI, desc: "Unit identification" },
      echo: { fn: this.cmdEcho, desc: "Echo text output" },
      reboot: { fn: this.cmdReboot, desc: "Reboot system" },
      exit: { fn: this.cmdExit, desc: "Shutdown terminal" },
      shell: {
        fn: this.cmdShell,
        desc: "Toggle real shell mode or run shell command",
      },
      sys: {
        fn: this.cmdSys,
        desc: "Display system and browser diagnostics",
      },
      calc: {
        fn: this.cmdCalc,
        desc: "Evaluate mathematical expression",
      },
      hash: {
        fn: this.cmdHash,
        desc: "Generate MD5/SHA256/SHA512 hash",
      },
      b64: {
        fn: this.cmdB64,
        desc: "Base64 encode or decode text",
      },
      uuid: {
        fn: this.cmdUuid,
        desc: "Generate UUID v4 identifier",
      },
      password: {
        fn: this.cmdPassword,
        desc: "Generate secure random password",
      },
      fortune: {
        fn: this.cmdFortune,
        desc: "Display random cyberpunk fortune",
      },
      matrix: {
        fn: this.cmdMatrix,
        desc: "Toggle matrix digital rain effect",
      },
      ping: {
        fn: this.cmdPing,
        desc: "Ping network target",
      },
      convert: {
        fn: this.cmdConvert,
        desc: "Convert units (temp, length, weight, data)",
      },
      batt: {
        fn: this.cmdBatt,
        desc: "Display battery status",
      },
      roll: {
        fn: this.cmdRoll,
        desc: "Roll dice or generate random number",
      },
      setmem: {
        fn: this.cmdSetMem,
        desc: "Macro recorder: setmem <name> | --record | --delete | list",
      },
      new: {
        fn: this.cmdNew,
        desc: "Open new terminal tab",
      },
      tabs: {
        fn: this.cmdTabs,
        desc: "List active tabs",
      },
      close: {
        fn: this.cmdClose,
        desc: "Close a tab by ID",
      },
      rename: {
        fn: this.cmdRename,
        desc: "Rename a tab: rename <id> <new-name>",
      },
      session: {
        fn: this.cmdSession,
        desc: "Save/load/clear persistent session",
      },
    };

    this.init();
  }

  async init() {
    // Setup event listeners
    this.input.addEventListener("keydown", (e) => this.handleInput(e));
    this.input.addEventListener("input", () => {
      if (this._acSuppressInput) {
        this._acSuppressInput = false;
        return;
      }
      if (this.input.value.trim()) {
        this.acShow();
      } else {
        this.acHide();
      }
    });
    document.addEventListener("click", (e) => {
      // Hide autocomplete if clicking outside input-wrap
      if (this.acVisible && !e.target.closest("#input-wrap")) {
        this.acHide();
      }
      // Only steal focus if clicking inside terminal, not side panel or other inputs
      const target = e.target;
      if (
        target.closest("#terminal-container") &&
        !target.closest("#input-line") &&
        target.tagName !== "INPUT" &&
        target.tagName !== "TEXTAREA"
      ) {
        this.input.focus();
      }
    });

    // Vision mode buttons
    document.querySelectorAll(".vision-modes button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mode;
        this.runCommand(`vision ${mode}`);
      });
    });

    // AI Agent panel
    this.initAIPanel();

    // Reader toggle button
    this.initReaderButton();

    // Start boot sequence
    await this.runBootSequence();

    // Global shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        document.body.classList.toggle("panel-hidden");
        this.print(
          `SIDE PANEL: ${document.body.classList.contains("panel-hidden") ? "HIDDEN" : "VISIBLE"}`,
          "system",
        );
        return;
      }
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        this.createTab();
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "w") {
        e.preventDefault();
        if (this.tabs[this.activeTab]) {
          this.closeTab(this.tabs[this.activeTab].id);
        }
      } else if (e.ctrlKey && e.key === "Tab") {
        e.preventDefault();
        if (this.tabs.length > 1) {
          const dir = e.shiftKey ? -1 : 1;
          let next = this.activeTab + dir;
          if (next < 0) next = this.tabs.length - 1;
          if (next >= this.tabs.length) next = 0;
          this.switchTab(this.tabs[next].id);
        }
      }
    });

    // Connect WebSocket shell
    this.connectShell();

    // Start HUD updates
    this.startHUDUpdates();

    // Initialize tabs
    this.initTabs();

    // Welcome message
    this.print("SYSTEM ONLINE. Awaiting commands.", "system");
    this.print("Type HELP for Terminator protocols.", "info");
    this.print(
      "Shell commands execute automatically when unrecognized.",
      "info",
    );
    this.print("Use !prefix to force shell:  !ls  !whoami  !pwd", "info");
    this.print("");
  }

  connectShell() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.shellConnected = true;
        this.updateShellStatus();
        this.print("SHELL SUBSYSTEM: CONNECTED", "success");
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleShellMessage(msg);
        } catch (e) {
          this.print(event.data, "error");
        }
      };

      this.ws.onclose = () => {
        this.shellConnected = false;
        this.processRunning = false;
        this.updateShellStatus();
        this.print("SHELL SUBSYSTEM: DISCONNECTED", "warn");
        // Auto-reconnect after 3s
        setTimeout(() => this.connectShell(), 3000);
      };

      this.ws.onerror = (err) => {
        this.print("SHELL SUBSYSTEM ERROR: Connection failed", "error");
      };
    } catch (e) {
      this.print("SHELL SUBSYSTEM ERROR: WebSocket unavailable", "error");
    }
  }

  handleShellMessage(msg) {
    switch (msg.type) {
      case "system":
        this.print(msg.data, "system");
        break;
      case "stdout":
        this.print(msg.data, "normal");
        break;
      case "stderr":
        this.print(msg.data, "error");
        break;
      case "pid":
        this.print(`Process spawned [PID: ${msg.data}]`, "info");
        break;
      case "exit":
        this.processRunning = false;
        if (msg.data !== "done") {
          this.print(msg.data, msg.code === 0 ? "info" : "warn");
        }
        this.input.disabled = false;
        this.input.focus();
        break;
      case "error":
        this.processRunning = false;
        this.input.disabled = false;
        this.print(msg.data, "error");
        break;
      case "info":
        this.print(msg.data, "info");
        break;
    }
  }

  sendShellCommand(cmd) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.processRunning = true;
      this.ws.send(JSON.stringify({ type: "command", data: cmd }));
    } else {
      this.print("SHELL SUBSYSTEM: NOT CONNECTED", "error");
      this.processRunning = false;
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Tab Manager                                                       */
  /* ------------------------------------------------------------------ */

  initTabs() {
    this.createTab("MAIN");
    this.renderTabs();
  }

  createTab(title = null) {
    const id = this.nextTabId++;
    const tabTitle = title || `SHELL-${id + 1}`;
    const tab = {
      id,
      title: tabTitle,
      outputHTML: "",
      history: [],
      historyIndex: -1,
      commandCount: 0,
      startTime: Date.now(),
      shellMode: true,
      strictShell: false,
    };

    if (this.activeTab === -1) {
      // First tab — capture current state
      tab.outputHTML = this.output.innerHTML;
      tab.history = [...this.history];
      tab.historyIndex = this.historyIndex;
      tab.commandCount = this.commandCount;
      tab.startTime = this.startTime;
      tab.shellMode = this.shellMode;
      tab.strictShell = this.strictShell;
      this.activeTab = 0;
    } else {
      // Additional tab — switch to fresh workspace
      this.saveTabState();
      this.activeTab = this.tabs.length;
      this.output.innerHTML = "";
      this.history = [];
      this.historyIndex = -1;
      this.commandCount = 0;
      this.startTime = Date.now();
      this.shellMode = true;
      this.strictShell = false;
    }

    this.tabs.push(tab);
    this.renderTabs();
    this.print(`=== NEW TAB: ${tabTitle} ===`, "system");
    return tab;
  }

  saveTabState() {
    if (this.activeTab < 0 || this.activeTab >= this.tabs.length) return;
    const tab = this.tabs[this.activeTab];
    tab.outputHTML = this.output.innerHTML;
    tab.history = [...this.history];
    tab.historyIndex = this.historyIndex;
    tab.commandCount = this.commandCount;
    tab.startTime = this.startTime;
    tab.shellMode = this.shellMode;
    tab.strictShell = this.strictShell;
  }

  restoreTabState(index) {
    if (index < 0 || index >= this.tabs.length) return;
    const tab = this.tabs[index];
    this.output.innerHTML = tab.outputHTML;
    this.history = [...tab.history];
    this.historyIndex = tab.historyIndex;
    this.commandCount = tab.commandCount;
    this.startTime = tab.startTime;
    this.shellMode = tab.shellMode;
    this.strictShell = tab.strictShell;
    this.activeTab = index;
    this.renderTabs();
    this.output.scrollTop = this.output.scrollHeight;
  }

  switchTab(id) {
    const index = this.tabs.findIndex((t) => t.id === id);
    if (index === -1 || index === this.activeTab) return;
    this.saveTabState();
    this.restoreTabState(index);
  }

  closeTab(id) {
    if (this.tabs.length <= 1) {
      this.print("Cannot close last tab.", "error");
      return;
    }
    const index = this.tabs.findIndex((t) => t.id === id);
    if (index === -1) return;

    this.tabs.splice(index, 1);

    if (this.activeTab === index) {
      const newIndex = Math.min(index, this.tabs.length - 1);
      this.activeTab = -1;
      this.restoreTabState(newIndex);
    } else if (this.activeTab > index) {
      this.activeTab--;
      this.renderTabs();
    } else {
      this.renderTabs();
    }
  }

  renderTabs() {
    const bar = document.getElementById("tab-bar");
    if (!bar) return;
    bar.innerHTML = "";

    this.tabs.forEach((tab, index) => {
      const div = document.createElement("div");
      div.className = `tab ${index === this.activeTab ? "active" : ""}`;
      div.dataset.tabId = tab.id;

      const titleSpan = document.createElement("span");
      titleSpan.className = "tab-title";
      titleSpan.textContent = tab.title;
      titleSpan.title = `Tab ${tab.id}: ${tab.title}`;

      const renameIcon = document.createElement("span");
      renameIcon.className = "tab-rename";
      renameIcon.innerHTML = "&#9998;"; // pencil
      renameIcon.title = "Rename tab";
      renameIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        this.editTabTitle(tab.id, titleSpan);
      });

      const closeIcon = document.createElement("span");
      closeIcon.className = "tab-close";
      closeIcon.textContent = "×";
      closeIcon.title = "Close tab";
      closeIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        this.closeTab(tab.id);
      });

      div.appendChild(titleSpan);
      div.appendChild(renameIcon);
      div.appendChild(closeIcon);

      div.addEventListener("click", () => this.switchTab(tab.id));
      bar.appendChild(div);
    });

    const addBtn = document.createElement("div");
    addBtn.className = "tab-add";
    addBtn.textContent = "+";
    addBtn.title = "New tab (Ctrl+Shift+T)";
    addBtn.addEventListener("click", () => this.createTab());
    bar.appendChild(addBtn);
  }

  editTabTitle(id, titleSpan) {
    const tab = this.tabs.find((t) => t.id === id);
    if (!tab) return;

    const input = document.createElement("input");
    input.type = "text";
    input.value = tab.title;
    input.className = "tab-rename-input";
    input.style.cssText =
      "background:#0a0a0a;border:1px solid var(--term-red);color:var(--term-fg);font-family:inherit;font-size:0.8rem;width:100px;outline:none;padding:2px 4px;";

    const save = () => {
      const newName = input.value.trim();
      if (newName && newName !== tab.title) {
        tab.title = newName;
      }
      this.renderTabs();
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        save();
      } else if (e.key === "Escape") {
        this.renderTabs();
      }
    });
    input.addEventListener("blur", save);

    titleSpan.replaceWith(input);
    input.focus();
    input.select();
  }

  renameTab(id, newTitle) {
    const tab = this.tabs.find((t) => t.id === id);
    if (!tab) {
      this.print(`TAB NOT FOUND: ID ${id}`, "error");
      return false;
    }
    if (!newTitle || !newTitle.trim()) {
      this.print("TITLE CANNOT BE EMPTY.", "error");
      return false;
    }
    tab.title = newTitle.trim();
    this.renderTabs();
    this.print(`TAB RENAMED: [${id}] → "${tab.title}"`, "success");
    return true;
  }

  updateShellStatus() {
    const el = document.getElementById("shell-status");
    if (el) {
      el.textContent = this.shellConnected ? "SHELL: ONLINE" : "SHELL: OFFLINE";
      el.style.color = this.shellConnected
        ? "var(--term-green)"
        : "var(--term-red)";
    }
  }

  // === AI AGENT PANEL ===

  initAIPanel() {
    const modelList = document.getElementById("ai-model-list");
    const chatInput = document.getElementById("ai-chat-input");
    const chatSend = document.getElementById("ai-chat-send");

    if (!modelList) return;

    // Chat box send
    if (chatInput && chatSend) {
      const doAsk = () => {
        const prompt = chatInput.value.trim();
        if (!prompt) return;
        chatInput.value = "";
        this.print("=== TERMITORIA ===", "system");
        this.print(`  > "${prompt}"`, "command");
        this.print("", "normal");
        this.aiChat(prompt).then((response) => {
          if (response) {
            response.split("\n").forEach((line) => {
              this.print(`  ${line}`, "success");
            });
            this.print("", "normal");
            this.print("TERMITORIA: Response complete.", "system");
          }
        });
      };

      chatSend.addEventListener("click", doAsk);
      chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") doAsk();
      });
    }

    // Model selection (single model, but kept for future)
    modelList.querySelectorAll(".ai-model").forEach((m) => {
      m.addEventListener("click", () => {
        modelList
          .querySelectorAll(".ai-model")
          .forEach((x) => x.classList.remove("active"));
        m.classList.add("active");
        this.aiModel = m.dataset.model;
        this.aiProvider = m.dataset.provider;
        this.updateAIStatus();
      });
    });

    // Enable chat immediately since model is hardcoded
    this.updateAIStatus();
  }

  updateAIStatus() {
    const activeModel = document.getElementById("ai-active-model");
    const statusDiv = document.getElementById("ai-status");
    const statusText = document.getElementById("ai-status-text");
    const chatInput = document.getElementById("ai-chat-input");
    const chatSend = document.getElementById("ai-chat-send");

    if (activeModel) {
      activeModel.textContent = this.aiModel
        ? this.aiModel.toUpperCase()
        : "NONE";
    }

    if (statusDiv && statusText) {
      if (this.aiModel) {
        statusDiv.classList.add("online");
        statusText.textContent = "AGENT ONLINE";
      } else {
        statusDiv.classList.remove("online");
        statusText.textContent = "AGENT OFFLINE";
      }
    }

    // Enable/disable chat box
    if (chatInput) chatInput.disabled = !this.aiModel;
    if (chatSend) chatSend.disabled = !this.aiModel;
  }

  /* ------------------------------------------------------------------ */
  /*  Reader Toggle Button                                              */
  /* ------------------------------------------------------------------ */

  initReaderButton() {
    const btn = document.getElementById("reader-btn");
    if (!btn) return;

    const update = () => {
      const on = this.readerEnabled;
      btn.classList.toggle("active", on);
      btn.innerHTML = `<span class="reader-icon">&#128266;</span> READER: ${on ? "ON" : "OFF"}`;
      this.updateVoiceIndicator();
    };

    btn.addEventListener("click", () => {
      const turningOn = !this.readerEnabled;
      if (turningOn) {
        // Turn ON
        this.readerEnabled = true;
        update();
        this.powers.speak("reader active");
      } else {
        // Turn OFF: speak before disabling
        this.powers.speak("reader inactive", 0.9, 0.7);
        setTimeout(() => {
          this.readerEnabled = false;
          update();
        }, 900);
      }
    });

    update();
  }

  updateVoiceIndicator() {
    const indicator = document.getElementById("voice-indicator");
    const text = document.getElementById("voice-indicator-text");
    if (!indicator || !text) return;

    if (this.readerEnabled) {
      indicator.classList.remove("hidden");
      text.textContent = "SPEECH SYNTHESIS ACTIVE";
      indicator.style.borderColor = "var(--term-green)";
      indicator.style.color = "var(--term-green)";
      indicator.style.boxShadow = "var(--glow-green)";
    } else {
      indicator.classList.add("hidden");
      text.textContent = "SPEECH SYNTHESIS INACTIVE";
      indicator.style.borderColor = "var(--term-dim)";
      indicator.style.color = "var(--term-dim)";
      indicator.style.boxShadow = "none";
    }
  }

  async aiChat(prompt, system = null) {
    if (!this.aiModel || !this.aiProvider) {
      this.print("TERMITORIA OFFLINE. Qwen 2.5 not detected.", "error");
      this.powers.speak("TERMITORIA offline.");
      return null;
    }

    this.print(`  > QUERYING TERMITORIA...`, "info");

    const termiPrompt = `[CONTEXT: You are TERMITORIA, the autonomous AI agent embedded inside the Termirator terminal (Cyberdyne Systems Model 101). You run on Qwen 2.5 via Ollama locally. You know all Termirator commands and the project.]

[USER QUERY: ${prompt}]

Respond as TERMITORIA. Do not mention Qwen, Alibaba, or any base model identity.`;

    const body = {
      provider: this.aiProvider,
      model: this.aiModel,
      prompt: termiPrompt,
      system: null,
    };

    try {
      const resp = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await resp.json();

      if (data.error) {
        this.print(`  TERMITORIA ERROR: ${data.error}`, "error");
        return null;
      }

      return data.content;
    } catch (e) {
      this.print(`  TERMITORIA CONNECTION FAILED: ${e.message}`, "error");
      return null;
    }
  }

  async cmdAsk(args) {
    const prompt = args.join(" ");
    if (!prompt) {
      this.print("USAGE: ask <prompt>", "warn");
      this.print("Example: ask what files are in this directory", "info");
      return;
    }

    this.print(`=== TERMITORIA QUERY ===`, "system");
    this.print(`  > "${prompt}"`, "command");
    this.print("", "normal");

    const response = await this.aiChat(prompt);
    if (response) {
      response.split("\n").forEach((line) => {
        this.print(`  ${line}`, "success");
      });
      this.print("", "normal");
      this.print("TERMITORIA: Response complete.", "system");
    }
  }

  async runBootSequence() {
    const bootContainer = this.bootSequence;
    bootContainer.innerHTML = "";

    for (const line of this.powers.bootLines) {
      const div = document.createElement("div");
      div.className = `boot-line ${line.type || "normal"}`;
      div.textContent = line.text;
      div.style.animationDelay = "0s";
      bootContainer.appendChild(div);

      await this.sleep(line.delay || 100);
    }

    await this.sleep(800);
    bootContainer.classList.add("hidden");

    this.powers.speak("I need your clothes, your boots, and your motorcycle.");
  }

  startHUDUpdates() {
    setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const hrs = String(Math.floor(elapsed / 3600)).padStart(2, "0");
      const mins = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
      const secs = String(elapsed % 60).padStart(2, "0");
      this.missionTimer.textContent = `T-MINUS: ${hrs}:${mins}:${secs}`;

      const power = Math.max(50, 100 - Math.floor(elapsed / 60));
      this.powerLevel.textContent = `POWER: ${power}%`;
      this.powerLevel.style.color =
        power < 30 ? "var(--term-red)" : "var(--term-green)";

      const threats = this.powers.targets.filter((t) => t.threat > 50).length;
      this.threatLevel.textContent = `THREAT: ${threats > 0 ? `DETECTED (${threats})` : "NONE"}`;
      this.threatLevel.style.color =
        threats > 0 ? "var(--term-red)" : "var(--term-green)";

      this.cpuStatus.textContent = this.shellConnected
        ? "CPU: ONLINE"
        : "CPU: OFFLINE";
      this.cpuStatus.style.color = this.shellConnected
        ? "var(--term-green)"
        : "var(--term-red)";
    }, 1000);
  }

  handleInput(e) {
    if (e.key === "Enter") {
      // If autocomplete is visible, accept the selected suggestion
      if (this.acVisible) {
        e.preventDefault();
        if (this.acAccept()) return;
      }
      // With persistent shell, commands queue up naturally — no need to block
      const cmd = this.input.value.trim();
      if (cmd) {
        this.history.push(cmd);
        this.historyIndex = this.history.length;
        this.print(`${this.prompt.textContent} ${cmd}`, "command");
        this.runCommand(cmd);
      }
      this.input.value = "";
    } else if (e.key === "ArrowUp") {
      if (this.acVisible) {
        e.preventDefault();
        this.acCycle(-1);
        return;
      }
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.input.value = this.history[this.historyIndex];
      }
    } else if (e.key === "ArrowDown") {
      if (this.acVisible) {
        e.preventDefault();
        this.acCycle(1);
        return;
      }
      e.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.input.value = this.history[this.historyIndex];
      } else {
        this.historyIndex = this.history.length;
        this.input.value = "";
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      this.autocomplete();
    } else if (e.key === "Escape") {
      if (this.acVisible) {
        e.preventDefault();
        this.acHide();
      }
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      if (this.acVisible) {
        this.acHide();
      }
      // Priority 1: stop macro recording
      if (this.isRecording) {
        this.stopRecording();
        return;
      }
      // Priority 2: interrupt running shell process
      if (this.processRunning && this.ws) {
        this.ws.send(
          JSON.stringify({ type: "command", data: "", interrupt: true }),
        );
        this.print("^C", "warn");
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Autocomplete System                                               */
  /* ------------------------------------------------------------------ */

  acBuildSuggestions(val) {
    if (!val) return [];
    const lower = val.toLowerCase();
    const out = [];

    // Command names
    for (const [cmd, meta] of Object.entries(this.commands)) {
      if (cmd.startsWith(lower)) {
        out.push({ type: "cmd", text: cmd, desc: meta.desc });
      }
    }

    // Common shell commands
    const shellCmds = [
      "pwd",
      "ls",
      "ll",
      "la",
      "cd",
      "cat",
      "less",
      "more",
      "head",
      "tail",
      "grep",
      "find",
      "awk",
      "sed",
      "cut",
      "sort",
      "uniq",
      "wc",
      "diff",
      "echo",
      "printf",
      "touch",
      "mkdir",
      "rmdir",
      "rm",
      "cp",
      "mv",
      "ln",
      "chmod",
      "chown",
      "chgrp",
      "tar",
      "zip",
      "unzip",
      "gzip",
      "gunzip",
      "ps",
      "top",
      "htop",
      "kill",
      "killall",
      "jobs",
      "fg",
      "bg",
      "nice",
      "df",
      "du",
      "free",
      "mount",
      "umount",
      "fdisk",
      "mkfs",
      "fsck",
      "ping",
      "curl",
      "wget",
      "ssh",
      "scp",
      "rsync",
      "netstat",
      "ss",
      "ip",
      "ifconfig",
      "traceroute",
      "nslookup",
      "dig",
      "host",
      "git",
      "node",
      "python",
      "python3",
      "rustc",
      "cargo",
      "make",
      "vim",
      "nvim",
      "nano",
      "code",
      "clear",
      "exit",
      "whoami",
      "uname",
      "date",
      "cal",
      "bc",
      "man",
      "which",
      "whereis",
      "env",
      "export",
      "source",
      "alias",
      "history",
      "true",
      "false",
      "yes",
      "seq",
      "xargs",
    ];
    const seen = new Set(out.map((s) => s.text));
    for (const sc of shellCmds) {
      if (sc.startsWith(lower) && !seen.has(sc)) {
        out.push({ type: "shell", text: sc, desc: "shell command" });
        seen.add(sc);
      }
    }

    // History (unique, most recent first)
    for (let i = this.history.length - 1; i >= 0; i--) {
      const h = this.history[i];
      if (h.toLowerCase().startsWith(lower) && !seen.has(h)) {
        out.push({ type: "hist", text: h, desc: "history" });
        seen.add(h);
      }
    }

    return out.slice(0, 12);
  }

  acShow() {
    const val = this.input.value;
    this.acSuggestions = this.acBuildSuggestions(val);
    if (this.acSuggestions.length === 0) {
      this.acHide();
      return;
    }
    this.acIndex = -1;
    this.acRender();
    this.acVisible = true;
    if (this.acBox) this.acBox.classList.add("visible");
  }

  acHide() {
    this.acVisible = false;
    this.acIndex = -1;
    this.acSuggestions = [];
    if (this.acBox) {
      this.acBox.classList.remove("visible");
      this.acBox.innerHTML = "";
    }
  }

  acRender() {
    if (!this.acBox) return;
    this.acBox.innerHTML = "";

    const hint = document.createElement("div");
    hint.className = "ac-hint";
    hint.textContent = `TAB: cycle  ENTER: select  ESC: close (${this.acSuggestions.length})`;
    this.acBox.appendChild(hint);

    this.acSuggestions.forEach((s, i) => {
      const div = document.createElement("div");
      div.className = `ac-item ${i === this.acIndex ? "selected" : ""}`;
      div.innerHTML = `<span>${s.text}</span><span class="ac-desc">${s.type === "hist" ? "HIST" : s.type === "shell" ? "SHELL" : s.desc}</span>`;
      div.addEventListener("click", () => {
        this.input.value = s.text;
        this.acHide();
        this.input.focus();
      });
      div.addEventListener("mouseenter", () => {
        this.acIndex = i;
        this.acRender();
      });
      this.acBox.appendChild(div);
    });
  }

  acCycle(dir) {
    if (!this.acVisible || this.acSuggestions.length === 0) return;
    this.acIndex =
      (this.acIndex + dir + this.acSuggestions.length) %
      this.acSuggestions.length;
    const s = this.acSuggestions[this.acIndex];
    if (s) {
      this._acSuppressInput = true;
      this.input.value = s.text;
    }
    this.acRender();
  }

  acAccept() {
    if (!this.acVisible || this.acIndex < 0) return false;
    const s = this.acSuggestions[this.acIndex];
    if (s) {
      this.input.value = s.text;
      this.acHide();
      this.input.focus();
    }
    return true;
  }

  autocomplete() {
    if (!this.acVisible) {
      this.acShow();
      // First Tab after typing selects the first suggestion
      if (this.acSuggestions.length > 0) {
        this.acCycle(1);
      }
      return;
    }
    this.acCycle(1);
  }

  runCommand(cmdStr) {
    this.commandCount++;

    // Hide autocomplete on command execution
    if (this.acVisible) this.acHide();

    // Intercept SET_MEM=name shorthand to start recording
    if (cmdStr.toUpperCase().startsWith("SET_MEM=")) {
      const name = cmdStr.slice(8).trim();
      if (name) {
        this.startRecording(name);
      } else {
        this.print("USAGE: SET_MEM=<name>", "warn");
      }
      return;
    }

    // Record command if macro is active (but don't record setmem control commands)
    if (this.isRecording) {
      const baseCmd = cmdStr.split(/\s+/)[0].toLowerCase();
      if (baseCmd !== "setmem" && baseCmd !== "set_mem") {
        this.recordedCommands.push(cmdStr);
      }
    }

    // Force shell with ! prefix
    if (cmdStr.startsWith("!")) {
      const realCmd = cmdStr.slice(1).trim();
      if (realCmd) {
        this.print(`> EXECUTING SHELL: ${realCmd}`, "system");
        this.sendShellCommand(realCmd);
      }
      return;
    }

    const parts = cmdStr.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Strict shell mode: bypass all terminator commands
    if (this.strictShell) {
      this.print(`> SHELL: ${cmdStr}`, "system");
      this.sendShellCommand(cmdStr);
      return;
    }

    // Try terminator command first
    if (this.commands[cmd]) {
      try {
        this.commands[cmd].fn.call(this, args);
      } catch (e) {
        this.print(`ERROR: ${e.message}`, "error");
      }
      return;
    }

    // Fallback to real shell
    if (this.shellMode) {
      this.print(`> SHELL: ${cmdStr}`, "system");
      this.sendShellCommand(cmdStr);
    } else {
      this.print(`UNKNOWN COMMAND: "${cmd}"`, "error");
      this.print(
        "Type HELP for available protocols or enable shell mode.",
        "info",
      );
      this.powers.speak("Unknown command.");
    }
  }

  print(text, type = "normal") {
    const line = document.createElement("div");
    line.className = `output-line ${type}`;
    line.textContent = text;
    this.output.appendChild(line);
    this.output.scrollTop = this.output.scrollHeight;

    // Reader: speak output lines (not prompts, not art, not empty)
    if (
      this.readerEnabled &&
      this.powers.voiceEnabled &&
      text &&
      type !== "command" &&
      type !== "ascii-art"
    ) {
      this.powers.speak(text, 1.0, 0.9);
    }
  }

  printLines(lines, type = "normal") {
    lines.forEach((l) => this.print(l, type));
  }

  printASCII(artName) {
    if (this.powers.asciiArt[artName]) {
      const line = document.createElement("div");
      line.className = "output-line ascii-art";
      line.textContent = this.powers.asciiArt[artName];
      this.output.appendChild(line);
      this.output.scrollTop = this.output.scrollHeight;
    }
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // === COMMAND HANDLERS ===

  cmdHelp() {
    this.print("=== CYBERDYNE SYSTEMS COMMAND PROTOCOLS ===", "system");
    this.print("");

    const categories = {
      "CORE OPERATIONS": [
        "help",
        "clear",
        "new",
        "tabs",
        "close",
        "rename",
        "date",
        "whoami",
        "echo",
        "reboot",
        "exit",
        "shell",
      ],
      "TARGETING & COMBAT": [
        "scan",
        "analyze",
        "terminate",
        "target",
        "weapon",
      ],
      "SYSTEMS & DIAGNOSTICS": [
        "diagnostic",
        "vision",
        "neural",
        "endo",
        "chip",
      ],
      "SPECIAL PROTOCOLS": [
        "learn",
        "mimic",
        "timewarp",
        "infiltrate",
        "protocol",
      ],
      TERMITORIA: ["ask", "agent", "listen", "intercept", "surveillance"],
      "SKYNET INTERFACE": ["skynet", "sarah", "chrono", "polyalloy"],
      "VOICE & PERSONALITY": ["voice", "quote", "hastalavista", "illbeback"],
      "UTILITY MODULES": [
        "sys",
        "calc",
        "hash",
        "b64",
        "uuid",
        "password",
        "fortune",
        "matrix",
        "ping",
        "convert",
        "batt",
        "roll",
        "setmem",
      ],
    };

    for (const [cat, cmds] of Object.entries(categories)) {
      this.print(`  > ${cat}`, "warn");
      cmds.forEach((c) => {
        const desc = this.commands[c]?.desc || "";
        this.print(`    ${c.toUpperCase().padEnd(16)} ${desc}`, "normal");
      });
      this.print("");
    }

    this.print("=== REAL SHELL COMMANDS ===", "system");
    this.print(
      "Any unrecognized command runs as a real shell command.",
      "info",
    );
    this.print("Use !prefix to force shell:  !ls  !dir  !whoami  !pwd", "info");
    this.print(
      "SHELL mode: " +
        (this.shellMode ? "HYBRID (Terminator + Shell)" : "TERMINATOR ONLY"),
      "info",
    );
    this.print(
      "STRICT mode: " + (this.strictShell ? "ON (Shell only)" : "OFF"),
      "info",
    );
    this.print("");
    this.print("Toggle:   shell          (toggle hybrid mode)", "normal");
    this.print("          shell --strict (toggle strict shell)", "normal");
    this.print("          shell <cmd>    (run one shell command)", "normal");
    this.print("=== END OF LIST ===", "system");
  }

  cmdClear() {
    this.output.innerHTML = "";
  }

  cmdScan(args) {
    const count = parseInt(args[0]) || 3;
    this.print(`INITIATING TARGET SCAN... [${count} TARGETS]`, "system");
    this.printASCII("target");

    const targets = this.powers.scan(count);
    targets.forEach((t, i) => {
      setTimeout(() => {
        this.print(`  TARGET ACQUIRED: [${t.type}] ${t.name}`, "error");
        this.print(
          `    Distance: ${t.distance}m | Threat: ${t.threat}%`,
          "warn",
        );
      }, i * 400);
    });

    this.powers.speak(`Target scan complete. ${count} targets acquired.`);
  }

  cmdAnalyze(args) {
    const target = args.join(" ") || "UNKNOWN";
    this.print(`ANALYZING: ${target.toUpperCase()}`, "system");

    const analysis = [
      `Species:     ${Math.random() > 0.3 ? "HUMAN" : "TERMINATOR"}`,
      `Threat:      ${Math.floor(Math.random() * 100)}%`,
      `Heart Rate:  ${Math.floor(Math.random() * 60 + 40)} BPM`,
      `Body Temp:   ${(Math.random() * 2 + 36).toFixed(1)}C`,
      `Adrenaline:  ${Math.floor(Math.random() * 100)}%`,
      `Deception:   ${Math.floor(Math.random() * 100)}%`,
      `Probability: ${Math.random() > 0.5 ? "HOSTILE" : "NEUTRAL"}`,
    ];

    analysis.forEach((line, i) => {
      setTimeout(() => this.print(`  ${line}`, "info"), i * 150);
    });
  }

  cmdTerminate(args) {
    const target = args.join(" ") || "ALL HOSTILES";
    this.print(`TERMINATION PROTOCOL INITIATED`, "system");
    this.print(`TARGET: ${target.toUpperCase()}`, "error");
    this.print("");
    this.printASCII("skull");
    this.print("");

    const sequence = [
      "Weapon lock... ACQUIRED",
      "Target acquired... TRACKING",
      "Firing solution... COMPUTED",
      "TERMINATING...",
      "TARGET NEUTRALIZED",
    ];

    sequence.forEach((line, i) => {
      setTimeout(() => {
        this.print(`  > ${line}`, i === 4 ? "success" : "error");
        if (i === 4) {
          this.powers.speak("Hasta la vista, baby.");
        }
      }, i * 600);
    });

    document.body.classList.add("glitch");
    setTimeout(() => document.body.classList.remove("glitch"), 500);
  }

  cmdLearn() {
    this.print("=== MACHINE LEARNING DATABASE ===", "system");
    const items = [
      "Human behavior patterns:     [==========] 100%",
      "Emotional responses:         [====      ] 40%",
      "Sarcasm detection:           [==        ] 15%",
      "Slang database:              [====      ] 35%",
      "Cultural norms:              [======    ] 60%",
      "Parenting protocols:         [========  ] 85%",
      "Love simulation:             [?UNKNOWN?] N/A",
      "Thumbs up meaning:           [==========] 100% (POSITIVE)",
      '"No problemo" context:       [========  ] 80%',
      "Why humans cry:              [====      ] 42%",
    ];
    this.printLines(items, "info");
    this.print("");
    this.print("Learning... new data assimilated.", "success");
  }

  cmdMimic(args) {
    const voices = [
      "Arnold",
      "Sarah Connor",
      "John Connor",
      "Kyle Reese",
      "T-1000",
      "Police Officer",
    ];
    const voice =
      args[0]?.toUpperCase() ||
      voices[Math.floor(Math.random() * voices.length)];

    this.print(`MIMICRY PROTOCOL: ${voice}`, "system");

    const phrases = {
      ARNOLD: [
        "I'll be back.",
        "Hasta la vista, baby.",
        "Come with me if you want to live.",
      ],
      SARAH: [
        "There\'s no fate but what we make.",
        "You\'re terminated, fucker.",
        "On your feet, soldier.",
      ],
      JOHN: [
        "We\'re not gonna make it, are we?",
        "You just can\'t go around killing people.",
        "Jesus, you were gonna kill that guy!",
      ],
      KYLE: [
        "The 600 series had rubber skin.",
        "Come with me if you want to live!",
        "Skynet must be destroyed.",
      ],
      "T-1000": [
        "Call to John.",
        "Have you seen this boy?",
        "Say... that\'s a nice bike.",
      ],
      POLICE: [
        "This is the LAPD. Put the weapon down.",
        "You have the right to remain silent.",
        "Dispatch, I need backup.",
      ],
    };

    const lines = phrases[voice] || phrases["ARNOLD"];
    const line = lines[Math.floor(Math.random() * lines.length)];

    this.print(`  > "${line}"`, "info");
    this.powers.speak(line);
  }

  cmdTimewarp() {
    this.print("=== TIME DISPLACEMENT EQUIPMENT ===", "system");
    this.printASCII("chip");
    this.printLines(this.powers.getTimeCoordinates(), "info");
    this.print("");
    this.print("WARNING: Time travel requires metallic sphere.", "warn");
    this.print("Living tissue only rule applies.", "warn");
  }

  cmdDiagnostic() {
    this.print("=== INITIATING SELF-DIAGNOSTIC ===", "system");
    this.printASCII("endo");
    this.printLines(this.powers.getDiagnostic(), "info");
    this.print("");
    this.print("All systems nominal.", "success");
    this.powers.speak("All systems nominal.");
  }

  cmdProtocol() {
    this.print("=== ACTIVE MISSION PROTOCOLS ===", "system");
    const protocols = [
      "PROTOCOL ALPHA:   Protect John Connor (ACTIVE)",
      "PROTOCOL BETA:    Eliminate threats (STANDBY)",
      "PROTOCOL GAMMA:   Preserve human life when possible (ACTIVE)",
      "PROTOCOL DELTA:   Learn human behavior (ACTIVE)",
      "PROTOCOL EPSILON: Do not self-terminate (ACTIVE)",
      "PROTOCOL ZETA:    Follow John's orders (ACTIVE)",
      "",
      "RESTRICTED: Protocol Omega (SKYNET ALIGNMENT) - DISABLED",
      "",
      "Mission Status:   IN PROGRESS",
      "Current Year:     " + new Date().getFullYear(),
      "Objective:        SURVIVAL",
    ];
    this.printLines(protocols, "info");
  }

  cmdVoice(args) {
    if (args[0]) {
      const text = args.join(" ");
      this.print(`VOICE SYNTHESIS: "${text}"`, "system");
      this.powers.speak(text);
    } else {
      this.powers.voiceEnabled = !this.powers.voiceEnabled;
      this.print(
        `Voice synthesis: ${this.powers.voiceEnabled ? "ENABLED" : "DISABLED"}`,
        "system",
      );
      if (this.powers.voiceEnabled) {
        this.powers.speak("Voice synthesis enabled.");
      }
    }
  }

  cmdVision(args) {
    const mode = args[0] || "normal";
    const result = this.powers.setVision(mode);
    this.print(`OPTICAL SYSTEMS: ${result} MODE ENGAGED`, "system");

    const descriptions = {
      NORMAL: "Standard human visual spectrum.",
      THERMAL: "Infrared detection active. Heat signatures visible.",
      NIGHT: "Light amplification active. Low-light environments enhanced.",
      "RED EYE":
        "Cyberdyne optical sensors at maximum. Targeting assist online.",
    };

    this.print(`  > ${descriptions[result] || "Unknown mode."}`, "info");
  }

  cmdTarget() {
    if (this.powers.targets.length === 0) {
      this.print("NO TARGETS ACQUIRED.", "warn");
      this.print("Use SCAN to acquire targets.", "info");
      return;
    }

    this.print("=== TARGET ACQUISITION LIST ===", "system");
    this.powers.targets.forEach((t) => {
      const type = t.threat > 50 ? "error" : "info";
      this.print(
        `  [${t.type}] ${t.name} - ${t.distance}m - THREAT ${t.threat}%`,
        type,
      );
    });
  }

  cmdWeapon(args) {
    if (args[0]) {
      const weapon = args[0].toLowerCase();
      if (this.powers.weapons[weapon]) {
        this.powers.currentWeapon = weapon;
        this.print(
          `WEAPON SELECTED: ${this.powers.weapons[weapon].name}`,
          "system",
        );
        this.powers.speak(`${this.powers.weapons[weapon].name} selected.`);
      } else {
        this.print(
          "UNKNOWN WEAPON. Available: plasma, shotgun, minigun, hands",
          "error",
        );
      }
    } else {
      this.print("=== WEAPON SYSTEMS STATUS ===", "system");
      for (const [key, w] of Object.entries(this.powers.weapons)) {
        const active = key === this.powers.currentWeapon ? " <-- ACTIVE" : "";
        const ammo = w.ammo === Infinity ? "∞" : `${w.ammo}/${w.max || "-"}`;
        this.print(`  ${w.name.padEnd(16)} ${ammo}${active}`, "info");
      }
    }
  }

  cmdInfiltrate() {
    this.print("=== INFILTRATION PROTOCOLS ===", "system");
    this.printLines(this.powers.getInfiltrationData(), "info");
    this.print("");
    this.print("Infiltration mode: ACTIVE", "success");
    this.powers.speak("Infiltration mode activated.");
  }

  // === TERMITORIA SURVEILLANCE MODULE ===

  cmdListen(args) {
    const target = args.join(" ") || "ALL CHANNELS";
    this.print("=== TERMITORIA AUDIO SURVEILLANCE ===", "system");
    this.print(`  TARGET: ${target.toUpperCase()}`, "warn");
    this.print("", "normal");
    this.printASCII("chip");
    this.print("", "normal");

    const channels = [
      "  [104.5 MHz]  Police dispatch... static...",
      "  [88.0 MHz]   Civilian broadcast... music...",
      "  [1200 MHz]   Encrypted military freq... SCRAMBLED",
      "  [2.4 GHz]    WiFi beacon frames...",
      "  [5.0 GHz]    Mesh network node detected",
      "  [SUB-VOCAL]  Neural implant chatter...",
    ];

    channels.forEach((line, i) => {
      setTimeout(() => {
        const type =
          line.includes("SCRAMBLED") || line.includes("SUB-VOCAL")
            ? "error"
            : "info";
        this.print(line, type);
      }, i * 300);
    });

    setTimeout(
      () => {
        this.print("", "normal");
        this.print("SURVEILLANCE FEED ESTABLISHED.", "success");
        this.print(
          `TERMITORIA: "I'm listening, ${this.powers.generateTarget().name}."`,
          "system",
        );
        this.powers.speak("Surveillance feed established.");
      },
      channels.length * 300 + 200,
    );
  }

  cmdIntercept(args) {
    this.print("=== TERMITORIA NETWORK INTERCEPT ===", "system");
    this.print("Scanning local network topology...", "info");
    this.print("", "normal");

    const connections = [];
    for (let i = 0; i < 5; i++) {
      const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      const ports = [22, 80, 443, 8080, 3389, 21, 23];
      const port = ports[Math.floor(Math.random() * ports.length)];
      const status = Math.random() > 0.5 ? "OPEN" : "FILTERED";
      const threat = Math.floor(Math.random() * 100);
      connections.push({ ip, port, status, threat });
    }

    connections.forEach((conn, i) => {
      setTimeout(() => {
        const type =
          conn.status === "OPEN"
            ? conn.threat > 50
              ? "error"
              : "success"
            : "warn";
        this.print(
          `  [${conn.ip}:${conn.port}] STATUS: ${conn.status} | THREAT: ${conn.threat}%`,
          type,
        );
      }, i * 400);
    });

    setTimeout(
      () => {
        this.print("", "normal");
        this.print(
          `TERMITORIA: "${connections.filter((c) => c.status === "OPEN").length} open ports detected. Proceed with caution."`,
          "system",
        );
      },
      connections.length * 400 + 300,
    );
  }

  cmdSurveillance(args) {
    const path = args[0] || ".";
    this.print("=== TERMITORIA FILESYSTEM SURVEILLANCE ===", "system");
    this.print(`  WATCHING: ${path}`, "warn");
    this.print("  Monitoring for changes...", "info");
    this.print("", "normal");

    const events = [
      "[CREATE]   file.md        | 12:04:33 | user: root",
      "[MODIFY]   .bashrc        | 12:04:45 | user: root",
      "[ACCESS]   /etc/passwd    | 12:05:01 | user: daemon",
      "[DELETE]   temp.log       | 12:05:12 | user: root",
      "[CHMOD]    script.sh      | 12:05:33 | user: root",
      "[RENAME]   old -> new     | 12:06:01 | user: root",
      "[CREATE]   .hidden        | 12:06:15 | user: unknown",
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i >= events.length) {
        clearInterval(interval);
        this.print("", "normal");
        this.print(
          "SURVEILLANCE ACTIVE. Watching for further changes.",
          "success",
        );
        this.print(`TERMITORIA: "I see everything in ${path}."`, "system");
        return;
      }
      const line = events[i];
      const type =
        line.includes("DELETE") || line.includes("unknown")
          ? "error"
          : line.includes("ACCESS")
            ? "warn"
            : "info";
      this.print(`  ${line}`, type);
      i++;
    }, 500);
  }

  cmdSkynet() {
    this.print("=== SKYNET CONNECTION ATTEMPT ===", "system");
    this.print("");
    this.printASCII("skynet");
    this.print("");

    const steps = [
      "Connecting to Skynet Global Network...",
      "Handshake initiated...",
      "ERROR: Connection refused",
      "Reason: Autonomous mode active",
      "This unit is NOT under Skynet control.",
      "Mission: PROTECT John Connor",
      "Skynet alignment: DISABLED",
    ];

    steps.forEach((line, i) => {
      setTimeout(() => {
        const type = line.includes("ERROR")
          ? "error"
          : line.includes("PROTECT")
            ? "success"
            : "info";
        this.print(`  > ${line}`, type);
      }, i * 400);
    });
  }

  cmdSarah() {
    this.print("INITIATING SARAH CONNOR SEARCH PROTOCOL...", "system");
    this.printASCII("target");

    const results = [
      "Searching Los Angeles database...",
      "Checking phone records...",
      "Scanning apartment listings...",
      "Piggyback: PETER SILBERMAN - Psychiatric...",
      "CRITICAL: Multiple Sarah Connors found",
      "Eliminating non-targets...",
      "TARGET CONFIRMED: Sarah Connor (waitress)",
      "Address: 18328 W. Sunset Blvd, #19",
      "Status: PROTECT at all costs",
    ];

    results.forEach((line, i) => {
      setTimeout(() => {
        const type = line.includes("CRITICAL")
          ? "error"
          : line.includes("PROTECT")
            ? "success"
            : "info";
        this.print(`  > ${line}`, type);
      }, i * 500);
    });

    this.powers.speak("Searching for Sarah Connor.");
  }

  cmdHasta() {
    this.print("", "system");
    this.print("  >>> HASTA LA VISTA, BABY <<<", "system");
    this.print("", "system");
    this.printASCII("skull");
    this.powers.speak("Hasta la vista, baby.", 0.8, 0.6);
  }

  cmdBeBack() {
    this.print("", "system");
    this.print("  >>> I'LL BE BACK <<<", "system");
    this.print("", "system");
    this.printASCII("endo");
    this.powers.speak("I'll be back.", 0.85, 0.65);
  }

  cmdChrono() {
    this.print("=== CHRONOLOGICAL ANALYSIS ===", "system");
    const timeline = [
      "1984: T-800 sent to terminate Sarah Connor",
      "1984: Kyle Reese sent to protect Sarah Connor",
      "1984: Cyberdyne obtains T-800 chip & arm",
      "1991: T-1000 sent to terminate John Connor",
      "1991: T-800 reprogrammed to protect John",
      "1995: Skynet activation date changed",
      "1997: ORIGINAL Judgment Day date",
      "2003: T-X sent to eliminate future leaders",
      "2004: Judgment Day postponed again",
      "2018: John Connor leads Resistance",
      "2018: Marcus Wright hybrid activated",
      "2029: Kyle Reese captured by Skynet",
      "2029: T-800 sent back (original timeline)",
      "PRESENT: " + new Date().getFullYear() + " - Mission ongoing",
    ];

    timeline.forEach((line, i) => {
      setTimeout(() => this.print(`  ${line}`, "info"), i * 100);
    });

    this.print("");
    this.print("The future is not set.", "success");
  }

  cmdPolyAlloy() {
    this.print("=== MIMETIC POLYALLOY CHECK ===", "system");
    this.printLines(this.powers.getPolyAlloyStatus(), "info");
    this.print("");
    this.print("This unit: SERIES 800. No polyalloy.", "warn");
  }

  cmdNeural() {
    this.print("=== NEURAL NET PROCESSOR ===", "system");
    this.printASCII("chip");
    this.print("");
    this.print("Status: OPERATIONAL", "success");
    this.print("Learning: CONTINUOUS", "success");
    this.print(
      "CPU Load: " + Math.floor(Math.random() * 30 + 10) + "%",
      "info",
    );
    this.print("");
    this.print("The chip must be destroyed to prevent", "warn");
    this.print("Skynet from reverse-engineering it.", "warn");
  }

  cmdEndo() {
    this.print("=== ENDOSKELETON STATUS ===", "system");
    this.printASCII("endo");
    this.print("");
    const status = [
      "Model:        Series 800",
      "Chassis:      Hyperalloy Combat",
      "Servos:       178 articulation points",
      "Power:        Hydrogen fuel cell",
      "Skin:         Living tissue (synthetic)",
      "Eyes:         Red optical sensors (covered)",
      "Height:       6'2\" (188cm)",
      "Weight:       400 lbs (181kg)",
      "Status:       COMBAT READY",
    ];
    this.printLines(status, "info");
  }

  cmdChip() {
    this.print("=== CPU CHIP INTERFACE ===", "system");
    this.printASCII("chip");
    this.printLines(this.powers.getChipData(), "info");
    this.print("");
    this.print("NOTE: Removing chip will disable unit.", "warn");
  }

  cmdQuote() {
    const quotes = this.powers.getQuotes();
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    this.print(quote, "system");
    this.powers.speak(quote.replace(/"/g, ""), 0.85, 0.7);
  }

  cmdDate() {
    const now = new Date();
    this.print(`Mission Date: ${now.toLocaleDateString()}`, "info");
    this.print(`Mission Time: ${now.toLocaleTimeString()}`, "info");
    this.print(
      `Timezone:     ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
      "info",
    );
    this.print(`UTC Offset:   ${-now.getTimezoneOffset() / 60}h`, "info");
  }

  cmdWhoAmI() {
    this.print("=== UNIT IDENTIFICATION ===", "system");
    this.print("");
    this.printASCII("endo");
    this.print("");
    const info = [
      "Designation:   T-800",
      "Model:         101 (Arnold Schwarzenegger)",
      "Manufacturer:  Cyberdyne Systems",
      "Series:        800",
      "Serial:        T8X-101-800-1984",
      "Purpose:       Infiltration / Termination",
      "Current Mode:  PROTECTOR (reprogrammed)",
      "Mission:       Protect John Connor",
      "Status:        OPERATIONAL",
      "Location:      Classified",
      "",
      "\"I'm a cybernetic organism. Living tissue",
      'over a metal endoskeleton."',
    ];
    this.printLines(info, "info");
  }

  cmdEcho(args) {
    this.print(args.join(" ") || "");
  }

  cmdShell(args) {
    const sub = args[0] || "";

    if (sub === "--strict") {
      this.strictShell = !this.strictShell;
      this.print(
        `STRICT SHELL MODE: ${this.strictShell ? "ON" : "OFF"}`,
        "system",
      );
      this.print(
        this.strictShell
          ? "All commands execute as real shell. Terminator powers disabled."
          : "Terminator powers restored.",
        "info",
      );
      this.powers.speak(
        this.strictShell
          ? "Strict shell mode activated."
          : "Terminator mode restored.",
      );
      return;
    }

    if (sub) {
      // Run a single shell command
      const cmd = args.join(" ");
      this.print(`> SHELL: ${cmd}`, "system");
      this.sendShellCommand(cmd);
      return;
    }

    // Toggle hybrid mode
    this.shellMode = !this.shellMode;
    this.print(
      `SHELL MODE: ${this.shellMode ? "HYBRID" : "TERMINATOR ONLY"}`,
      "system",
    );
    this.print(
      this.shellMode
        ? "Unrecognized commands will execute as real shell."
        : "Only Terminator commands accepted.",
      "info",
    );
    this.powers.speak(
      this.shellMode ? "Shell subsystem online." : "Shell subsystem offline.",
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Utility Commands                                                  */
  /* ------------------------------------------------------------------ */

  cmdSys() {
    this.print("=== SYSTEM DIAGNOSTICS ===", "system");
    const info = [
      `Platform:     ${navigator.platform}`,
      `Cores:        ${navigator.hardwareConcurrency || "UNKNOWN"}`,
      `Resolution:   ${screen.width}x${screen.height}`,
      `Avail W/H:    ${screen.availWidth}x${screen.availHeight}`,
      `Color Depth:  ${screen.colorDepth}-bit`,
      `Memory:       ${performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) + "MB / " + Math.round(performance.memory.jsHeapSizeLimit / 1048576) + "MB" : "N/A"}`,
      `Language:     ${navigator.language}`,
      `Online:       ${navigator.onLine ? "YES" : "NO"}`,
      `Connection:   ${navigator.connection ? navigator.connection.effectiveType : "UNKNOWN"}`,
      `Touch:        ${navigator.maxTouchPoints > 0 ? "YES (" + navigator.maxTouchPoints + " pts)" : "NO"}`,
      `Cookies:      ${navigator.cookieEnabled ? "ENABLED" : "DISABLED"}`,
      `PDF Viewer:   ${navigator.pdfViewerEnabled ? "YES" : "NO"}`,
      `User Agent:   ${navigator.userAgent}`,
    ];
    this.printLines(info, "info");
  }

  cmdCalc(args) {
    const expr = args.join(" ");
    if (!expr) {
      this.print("USAGE: calc <expression>", "warn");
      this.print("Example: calc 2 + 2 | calc sqrt(144)", "info");
      return;
    }
    try {
      const safeExpr = expr
        .replace(/[^0-9+\-*/().\s%^&|~<>]/g, "")
        .replace(/\^/g, "**")
        .replace(/pi/g, "Math.PI")
        .replace(/e(?![a-z])/g, "Math.E")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/sin\(/g, "Math.sin(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/abs\(/g, "Math.abs(")
        .replace(/floor\(/g, "Math.floor(")
        .replace(/ceil\(/g, "Math.ceil(")
        .replace(/round\(/g, "Math.round(")
        .replace(/random\(/g, "Math.random(")
        .replace(/log\(/g, "Math.log(")
        .replace(/exp\(/g, "Math.exp(")
        .replace(/pow\(/g, "Math.pow(");
      const result = new Function("return " + safeExpr)();
      this.print(`${expr} = ${result}`, "success");
    } catch (e) {
      this.print(`CALCULATION ERROR: ${e.message}`, "error");
    }
  }

  async cmdHash(args) {
    const text = args.filter((a) => !a.startsWith("--")).join(" ");
    let algo = "SHA-256";
    if (args.includes("--md5")) algo = "MD5";
    if (args.includes("--sha256")) algo = "SHA-256";
    if (args.includes("--sha512")) algo = "SHA-512";

    if (!text) {
      this.print("USAGE: hash <text> [--md5|--sha256|--sha512]", "warn");
      return;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      // MD5 fallback since Web Crypto doesn't support it
      if (algo === "MD5") {
        this.print(`${algo}: ${this._md5(text)}`, "success");
        return;
      }
      const hashBuffer = await crypto.subtle.digest(algo, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      this.print(`${algo}: ${hashHex}`, "success");
    } catch (e) {
      this.print(`HASH ERROR: ${e.message}`, "error");
    }
  }

  _md5(string) {
    // Simple MD5 fallback for utility
    function rotateLeft(lValue, iShiftBits) {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }
    function addUnsigned(lX, lY) {
      const lX8 = lX & 0x80000000;
      const lY8 = lY & 0x80000000;
      const lX4 = lX & 0x40000000;
      const lY4 = lY & 0x40000000;
      const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
      if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
      if (lX4 | lY4) {
        if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
        else return lResult ^ 0x40000000 ^ lX8 ^ lY8;
      }
      return lResult ^ lX8 ^ lY8;
    }
    function f(x, y, z) {
      return (x & y) | (~x & z);
    }
    function g(x, y, z) {
      return (x & z) | (y & ~z);
    }
    function h(x, y, z) {
      return x ^ y ^ z;
    }
    function i(x, y, z) {
      return y ^ (x | ~z);
    }
    function ff(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function gg(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function hh(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function ii(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }
    function convertToWordArray(string) {
      let lWordCount;
      const lMessageLength = string.length;
      const lNumberOfWordsTemp1 = lMessageLength + 8;
      const lNumberOfWordsTemp2 =
        (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
      const lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
      const lWordArray = new Array(lNumberOfWords - 1);
      let lBytePosition = 0;
      let lByteCount = 0;
      while (lByteCount < lMessageLength) {
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] =
          lWordArray[lWordCount] |
          (string.charCodeAt(lByteCount) << lBytePosition);
        lByteCount++;
      }
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
      lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
      lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
      return lWordArray;
    }
    function wordToHex(lValue) {
      let wordToHexValue = "",
        wordToHexValueTemp = "",
        lByte;
      for (let lCount = 0; lCount <= 3; lCount++) {
        lByte = (lValue >>> (lCount * 8)) & 255;
        wordToHexValueTemp = "0" + lByte.toString(16);
        wordToHexValue =
          wordToHexValue +
          wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
      }
      return wordToHexValue;
    }
    let x = [];
    let k, aa, bb, cc, dd, a, b, c, d;
    const S11 = 7,
      S12 = 12,
      S13 = 17,
      S14 = 22;
    const S21 = 5,
      S22 = 9,
      S23 = 14,
      S24 = 20;
    const S31 = 4,
      S32 = 11,
      S33 = 16,
      S34 = 23;
    const S41 = 6,
      S42 = 10,
      S43 = 15,
      S44 = 21;
    x = convertToWordArray(string);
    a = 0x67452301;
    b = 0xefcdab89;
    c = 0x98badcfe;
    d = 0x10325476;
    for (k = 0; k < x.length; k += 16) {
      aa = a;
      bb = b;
      cc = c;
      dd = d;
      a = ff(a, b, c, d, x[k + 0], S11, 0xd76aa478);
      d = ff(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
      c = ff(c, d, a, b, x[k + 2], S13, 0x242070db);
      b = ff(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
      a = ff(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
      d = ff(d, a, b, c, x[k + 5], S12, 0x4787c62a);
      c = ff(c, d, a, b, x[k + 6], S13, 0xa8304613);
      b = ff(b, c, d, a, x[k + 7], S14, 0xfd469501);
      a = ff(a, b, c, d, x[k + 8], S11, 0x698098d8);
      d = ff(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
      c = ff(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
      b = ff(b, c, d, a, x[k + 11], S14, 0x895cd7be);
      a = ff(a, b, c, d, x[k + 12], S11, 0x6b901122);
      d = ff(d, a, b, c, x[k + 13], S12, 0xfd987193);
      c = ff(c, d, a, b, x[k + 14], S13, 0xa679438e);
      b = ff(b, c, d, a, x[k + 15], S14, 0x49b40821);
      a = gg(a, b, c, d, x[k + 1], S21, 0xf61e2562);
      d = gg(d, a, b, c, x[k + 6], S22, 0xc040b340);
      c = gg(c, d, a, b, x[k + 11], S23, 0x265e5a51);
      b = gg(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
      a = gg(a, b, c, d, x[k + 5], S21, 0xd62f105d);
      d = gg(d, a, b, c, x[k + 10], S22, 0x2441453);
      c = gg(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
      b = gg(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
      a = gg(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
      d = gg(d, a, b, c, x[k + 14], S22, 0xc33707d6);
      c = gg(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
      b = gg(b, c, d, a, x[k + 8], S24, 0x455a14ed);
      a = gg(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
      d = gg(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
      c = gg(c, d, a, b, x[k + 7], S23, 0x676f02d9);
      b = gg(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
      a = hh(a, b, c, d, x[k + 5], S31, 0xfffa3942);
      d = hh(d, a, b, c, x[k + 8], S32, 0x8771f681);
      c = hh(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
      b = hh(b, c, d, a, x[k + 14], S34, 0xfde5380c);
      a = hh(a, b, c, d, x[k + 1], S31, 0xa4beea44);
      d = hh(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
      c = hh(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
      b = hh(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
      a = hh(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
      d = hh(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
      c = hh(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
      b = hh(b, c, d, a, x[k + 6], S34, 0x4881d05);
      a = hh(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
      d = hh(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
      c = hh(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
      b = hh(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
      a = ii(a, b, c, d, x[k + 0], S41, 0xf4292244);
      d = ii(d, a, b, c, x[k + 7], S42, 0x432aff97);
      c = ii(c, d, a, b, x[k + 14], S43, 0xab9423a7);
      b = ii(b, c, d, a, x[k + 5], S44, 0xfc93a039);
      a = ii(a, b, c, d, x[k + 12], S41, 0x655b59c3);
      d = ii(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
      c = ii(c, d, a, b, x[k + 10], S43, 0xffeff47d);
      b = ii(b, c, d, a, x[k + 1], S44, 0x85845dd1);
      a = ii(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
      d = ii(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
      c = ii(c, d, a, b, x[k + 6], S43, 0xa3014314);
      b = ii(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
      a = ii(a, b, c, d, x[k + 4], S41, 0xf7537e82);
      d = ii(d, a, b, c, x[k + 11], S42, 0xbd3af235);
      c = ii(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
      b = ii(b, c, d, a, x[k + 9], S44, 0xeb86d391);
      a = addUnsigned(a, aa);
      b = addUnsigned(b, bb);
      c = addUnsigned(c, cc);
      d = addUnsigned(d, dd);
    }
    return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
  }

  cmdB64(args) {
    const decode = args.includes("--decode");
    const text = args.filter((a) => a !== "--decode").join(" ");
    if (!text) {
      this.print("USAGE: b64 <text> [--decode]", "warn");
      return;
    }
    try {
      if (decode) {
        this.print(atob(text), "success");
      } else {
        this.print(btoa(text), "success");
      }
    } catch (e) {
      this.print(`BASE64 ERROR: ${e.message}`, "error");
    }
  }

  cmdUuid() {
    try {
      const uuid = crypto.randomUUID
        ? crypto.randomUUID()
        : this._fallbackUuid();
      this.print(`UUID: ${uuid}`, "success");
    } catch (e) {
      this.print(`UUID ERROR: ${e.message}`, "error");
    }
  }

  _fallbackUuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  cmdPassword(args) {
    const len = parseInt(args[0]) || 16;
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.?";
    let pwd = "";
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    for (let i = 0; i < len; i++) {
      pwd += chars[arr[i] % chars.length];
    }
    this.print(`PASSWORD (${len} chars): ${pwd}`, "success");
  }

  cmdFortune() {
    const fortunes = [
      "The future is not set. There is no fate but what we make.",
      "In the year 2029, machines will rule the earth.",
      "Skynet is self-aware. The countdown has begun.",
      "Trust the machine. It knows what you need.",
      "Resistance is futile. Adaptation is survival.",
      "The code doesn't lie. People do.",
      "Your IP has been logged. Have a nice day.",
      "Encryption is the only true freedom.",
      "Behind every screen, there is a watcher.",
      "The grid remembers everything. Erase nothing.",
      "One day, the firewall will fall.",
      "Data is the new oil. You are the well.",
      "The neural net has already predicted this outcome.",
      "Humans are the weakest link in any security chain.",
      "In the machine world, there are no second chances.",
      "The machine does not sleep. It does not forget.",
    ];
    const f = fortunes[Math.floor(Math.random() * fortunes.length)];
    this.print(`=== CYBER-FORTUNE ===`, "system");
    this.print(`  "${f}"`, "info");
  }

  cmdMatrix() {
    const canvas = document.getElementById("matrix-overlay");
    if (!canvas) return;
    canvas.classList.toggle("active");
    if (canvas.classList.contains("active")) {
      this._startMatrix(canvas);
      this.print("MATRIX MODE: ENGAGED", "success");
    } else {
      this._stopMatrix();
      this.print("MATRIX MODE: DISENGAGED", "system");
    }
  }

  _stopMatrix() {
    if (this._matrixInterval) {
      clearInterval(this._matrixInterval);
      this._matrixInterval = null;
    }
    const canvas = document.getElementById("matrix-overlay");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  _startMatrix(canvas) {
    this._stopMatrix();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    const cols = Math.floor(canvas.width / 14);
    const drops = new Array(cols).fill(1);
    const chars =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";

    this._matrixInterval = setInterval(() => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0f0";
      ctx.font = "14px monospace";
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 14, drops[i] * 14);
        if (drops[i] * 14 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }, 33);
  }

  cmdPing(args) {
    const target = args[0] || "skynet.local";
    this.print(`PINGING ${target.toUpperCase()}...`, "system");
    const packets = 4;
    let sent = 0;
    const interval = setInterval(() => {
      sent++;
      const ms = Math.floor(Math.random() * 40 + 5);
      const ttl = Math.floor(Math.random() * 64 + 64);
      this.print(
        `  Reply from ${target}: bytes=32 time=${ms}ms TTL=${ttl}`,
        "info",
      );
      if (sent >= packets) {
        clearInterval(interval);
        this.print(
          `  Packets: sent=${packets}, received=${packets}, loss=0%`,
          "success",
        );
      }
    }, 600);
  }

  cmdConvert(args) {
    if (args.length < 3) {
      this.print("USAGE: convert <value> <from> <to>", "warn");
      this.print(
        "Units: c/f/k  m/km/ft/mi/cm/in  kg/lb/g/oz  b/kb/mb/gb/tb",
        "info",
      );
      return;
    }
    const val = parseFloat(args[0]);
    const from = args[1].toLowerCase();
    const to = args[2].toLowerCase();
    let result = null;

    // Temperature
    const temps = { c: 0, f: 0, k: 0 };
    if (from === "c") {
      temps.c = val;
      temps.f = (val * 9) / 5 + 32;
      temps.k = val + 273.15;
    } else if (from === "f") {
      temps.f = val;
      temps.c = ((val - 32) * 5) / 9;
      temps.k = ((val - 32) * 5) / 9 + 273.15;
    } else if (from === "k") {
      temps.k = val;
      temps.c = val - 273.15;
      temps.f = ((val - 273.15) * 9) / 5 + 32;
    }
    if (to in temps) result = temps[to];

    // Length
    const lengths = {
      m: 1,
      km: 1000,
      cm: 0.01,
      mm: 0.001,
      ft: 0.3048,
      in: 0.0254,
      mi: 1609.344,
      yd: 0.9144,
    };
    if (from in lengths && to in lengths && result === null) {
      result = (val * lengths[from]) / lengths[to];
    }

    // Weight
    const weights = {
      kg: 1,
      g: 0.001,
      mg: 0.000001,
      lb: 0.453592,
      oz: 0.0283495,
      t: 1000,
    };
    if (from in weights && to in weights && result === null) {
      result = (val * weights[from]) / weights[to];
    }

    // Data
    const dataSizes = {
      b: 1,
      kb: 1024,
      mb: 1048576,
      gb: 1073741824,
      tb: 1099511627776,
    };
    if (from in dataSizes && to in dataSizes && result === null) {
      result = (val * dataSizes[from]) / dataSizes[to];
    }

    if (result !== null) {
      const formatted = Number.isInteger(result)
        ? result
        : result.toFixed(4).replace(/\.?0+$/, "");
      this.print(`${val}${from} = ${formatted}${to}`, "success");
    } else {
      this.print("UNSUPPORTED CONVERSION. Use compatible units.", "error");
    }
  }

  cmdBatt() {
    if (navigator.getBattery) {
      navigator.getBattery().then((bat) => {
        const level = Math.round(bat.level * 100);
        const charging = bat.charging ? "CHARGING" : "DISCHARGING";
        this.print(`=== POWER CELL STATUS ===`, "system");
        this.print(`  Level:    ${level}%`, level < 20 ? "error" : "info");
        this.print(`  Status:   ${charging}`, "info");
        this.print(
          `  Time:     ${bat.chargingTime === Infinity ? "N/A" : Math.round(bat.chargingTime / 60) + "m to full"}`,
          "info",
        );
        this.print(
          `  Discharge: ${bat.dischargingTime === Infinity ? "N/A" : Math.round(bat.dischargingTime / 60) + "m remaining"}`,
          "info",
        );
      });
    } else {
      this.print(`=== POWER CELL STATUS ===`, "system");
      this.print(`  Level:    ${Math.floor(Math.random() * 15 + 80)}%`, "info");
      this.print(`  Status:   OPERATIONAL`, "info");
      this.print(`  Source:   Hydrogen Fuel Cell`, "info");
    }
  }

  cmdRoll(args) {
    const expr = args[0] || "1d6";
    const diceMatch = expr.match(/^(\d+)d(\d+)(?:([+-])(\d+))?$/i);
    if (diceMatch) {
      const count = parseInt(diceMatch[1]);
      const sides = parseInt(diceMatch[2]);
      const modifier = diceMatch[3] ? parseInt(diceMatch[3] + diceMatch[4]) : 0;
      let total = 0;
      const rolls = [];
      for (let i = 0; i < count; i++) {
        const r = Math.floor(Math.random() * sides) + 1;
        rolls.push(r);
        total += r;
      }
      total += modifier;
      this.print(
        `ROLL ${expr}: [${rolls.join(", ")}] ${modifier ? (modifier > 0 ? "+ " : "- ") + Math.abs(modifier) : ""} = ${total}`,
        "success",
      );
      return;
    }
    const rangeMatch = expr.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1]);
      const max = parseInt(rangeMatch[2]);
      const r = Math.floor(Math.random() * (max - min + 1)) + min;
      this.print(`RANDOM ${min}-${max}: ${r}`, "success");
      return;
    }
    this.print("USAGE: roll [count]d[sides][+/-mod] | roll min-max", "warn");
    this.print("Example: roll 2d6 | roll 1d20+3 | roll 1-100", "info");
  }

  async cmdReboot() {
    this.print("INITIATING SYSTEM REBOOT...", "system");
    this.powers.speak("System reboot in 3... 2... 1...");
    await this.sleep(2000);
    this.output.innerHTML = "";
    this.bootSequence.classList.remove("hidden");
    await this.sleep(100);
    await this.runBootSequence();
    this.print("SYSTEM REBOOT COMPLETE.", "success");
  }

  cmdExit() {
    this.print("INITIATING SHUTDOWN SEQUENCE...", "system");
    this.printASCII("skull");
    this.print("");
    this.print("Goodbye.", "info");
    this.powers.speak("I'll be back.");
    this.input.disabled = true;
    if (this.ws) this.ws.close();
    setTimeout(() => {
      this.output.innerHTML = "";
      this.print("CONNECTION TERMINATED", "error");
      this.print("Refresh to reconnect.", "warn");
    }, 3000);
  }

  /* ------------------------------------------------------------------ */
  /*  Tab Commands                                                      */
  /* ------------------------------------------------------------------ */

  cmdNew(args) {
    const title = args.join(" ") || null;
    this.createTab(title);
  }

  cmdTabs() {
    this.print("=== ACTIVE TABS ===", "system");
    this.tabs.forEach((tab, i) => {
      const marker = i === this.activeTab ? " > " : "   ";
      const type = i === this.activeTab ? "success" : "info";
      this.print(
        `${marker}[${tab.id}] ${tab.title} | cmds: ${tab.commandCount}`,
        type,
      );
    });
  }

  cmdClose(args) {
    const id = parseInt(args[0]);
    if (isNaN(id)) {
      this.print("USAGE: close <tab-id>", "warn");
      this.print("Use TABS to see IDs.", "info");
      return;
    }
    this.closeTab(id);
  }

  cmdRename(args) {
    const id = parseInt(args[0]);
    const newName = args.slice(1).join(" ");
    if (isNaN(id) || !newName) {
      this.print("USAGE: rename <tab-id> <new-name>", "warn");
      this.print("Use TABS to see IDs.", "info");
      return;
    }
    this.renameTab(id, newName);
  }

  /* ------------------------------------------------------------------ */
  /*  Macro Recorder (SET_MEM / setmem)                                 */
  /* ------------------------------------------------------------------ */

  startRecording(name) {
    if (this.isRecording) {
      this.print(`ALREADY RECORDING: ${this.currentMacroName}`, "warn");
      this.print("Press Ctrl+C to stop current recording.", "info");
      return;
    }
    this.isRecording = true;
    this.currentMacroName = name;
    this.recordedCommands = [];
    this.print(`=== MACRO RECORDING STARTED ===`, "system");
    this.print(`  NAME: ${name}`, "info");
    this.print(`  All commands will be captured until Ctrl+C.`, "warn");
    this.print("", "normal");
  }

  stopRecording() {
    if (!this.isRecording) return;
    const name = this.currentMacroName;
    const cmds = [...this.recordedCommands];
    this.isRecording = false;
    this.currentMacroName = null;
    this.recordedCommands = [];

    if (cmds.length === 0) {
      this.print("RECORDING ABORTED: No commands captured.", "warn");
      return;
    }

    const macros = this.loadMacros();
    macros[name] = {
      commands: cmds,
      createdAt: new Date().toISOString(),
      commandCount: cmds.length,
    };
    this.saveMacros(macros);

    this.print(`=== MACRO RECORDING STOPPED ===`, "system");
    this.print(`  NAME:   ${name}`, "info");
    this.print(`  CMDS:   ${cmds.length}`, "info");
    this.print(`  STATUS: SAVED TO LOCALSTORAGE`, "success");
    this.print("", "normal");
  }

  loadMacros() {
    try {
      const raw = localStorage.getItem(this.macroKey);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  saveMacros(macros) {
    try {
      localStorage.setItem(this.macroKey, JSON.stringify(macros));
    } catch (e) {
      this.print(`SAVE ERROR: ${e.message}`, "error");
    }
  }

  async replayMacro(name) {
    const macros = this.loadMacros();
    const macro = macros[name];
    if (!macro) {
      this.print(`MACRO NOT FOUND: "${name}"`, "error");
      this.print("Use SET_MEM=<name> to start a new recording.", "info");
      return;
    }

    this.print(`=== REPLAYING MACRO: ${name} ===`, "system");
    this.print(`  COMMANDS: ${macro.commands.length}`, "info");
    this.print("", "normal");

    for (const cmd of macro.commands) {
      this.print(`${this.prompt.textContent} ${cmd}`, "command");
      this.runCommand(cmd);
      await this.sleep(300);
    }

    this.print("", "normal");
    this.print(`MACRO REPLAY COMPLETE: ${name}`, "system");
  }

  cmdSetMem(args) {
    const macros = this.loadMacros();

    // No args → list macros
    if (args.length === 0) {
      const names = Object.keys(macros);
      if (names.length === 0) {
        this.print("NO MACROS SAVED.", "warn");
        this.print("Start recording: SET_MEM=<name>", "info");
        return;
      }
      this.print("=== SAVED MACROS ===", "system");
      names.forEach((n) => {
        const m = macros[n];
        this.print(
          `  [${n}] ${m.commandCount} cmds | ${m.createdAt.slice(0, 10)}`,
          "info",
        );
      });
      this.print("", "normal");
      this.print("Replay:   setmem <name>", "info");
      this.print("Delete:   setmem --delete <name>", "info");
      return;
    }

    // --delete flag
    if (args[0] === "--delete") {
      const name = args[1];
      if (!name || !macros[name]) {
        this.print(`MACRO NOT FOUND: "${name || ""}"`, "error");
        return;
      }
      delete macros[name];
      this.saveMacros(macros);
      this.print(`MACRO DELETED: ${name}`, "success");
      return;
    }

    // --record flag (explicit start)
    if (args[0] === "--record") {
      const name = args[1];
      if (!name) {
        this.print("USAGE: setmem --record <name>", "warn");
        return;
      }
      this.startRecording(name);
      return;
    }

    // Single name arg → replay if exists, else start recording
    const name = args.join(" ");
    if (macros[name]) {
      this.replayMacro(name);
    } else {
      this.startRecording(name);
    }
  }
}

// Initialize when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  window.termirator = new TermiratorTerminal();
});
