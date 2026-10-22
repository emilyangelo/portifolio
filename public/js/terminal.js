/**
 * terminal.js - Micro-Terminal Interativo para a Hero
 * 
 * Interface visual compacta simulando console de telemetria/Unix.
 * Contém sequência de inicialização automática, parsing de comandos locais
 * e suporte a botões de atalho (chips).
 */

(function () {
  class MicroTerminal {
    constructor() {
      this.terminalEl = document.getElementById("hero-terminal");
      this.outputEl = document.getElementById("terminal-output");
      this.inputEl = document.getElementById("terminal-input");
      this.formEl = document.getElementById("terminal-form");
      this.chipsContainer = document.getElementById("terminal-chips");
      this.statusDot = document.getElementById("terminal-status-dot");
      
      this.isTyping = false;
      this.history = [];
      this.historyIndex = -1;
      this.commandMap = this._getCommandMap();

      this._init();
    }

    _init() {
      if (!this.terminalEl || !this.outputEl) return;

      this._bindEvents();
      this._runInitialSequence();
    }

    _getCommandMap() {
      return {
        help: () => [
          "<span class='text-accent'>COMANDOS DISPONÍVEIS:</span>",
          "  <span class='text-cyan'>whoami</span>      - Identificação e formação",
          "  <span class='text-cyan'>about</span>       - Resumo profissional e foco de carreira",
          "  <span class='text-cyan'>skills</span>      - Visão geral das competências técnicas",
          "  <span class='text-cyan'>experience</span>  - Histórico de atuação em TI",
          "  <span class='text-cyan'>projects</span>    - Laboratórios de redes e projetos",
          "  <span class='text-cyan'>contact</span>     - Canais de contato e redes",
          "  <span class='text-cyan'>status</span>      - Telemetria e disponibilidade",
          "  <span class='text-cyan'>clear</span>       - Limpar tela do terminal"
        ],

        whoami: () => [
          "<span class='text-highlight'>Emily Almeida Angelo</span>",
          "Role: <span class='text-accent'>Estagiária de TI @ CAS Tecnologia</span>",
          "Academic: Estudante de Análise e Desenvolvimento de Sistemas (UNG)",
          "Location: São Paulo - SP"
        ],

        about: () => [
          "<span class='text-highlight'>RESUMO OPERACIONAL:</span>",
          "Atuação com suporte técnico a usuários, gestão de contas e acessos (IAM),",
          "suporte a ambientes Windows/Linux e sustentação de infraestrutura de rede.",
          "Foco em evolução contínua para Infraestrutura, Redes e Segurança da Informação."
        ],

        skills: () => [
          "<span class='text-accent'>MATRIZ DE COMPETÊNCIAS:</span>",
          "• <span class='text-cyan'>Redes:</span> TCP/IP, DNS, DHCP, VLAN, Switching, Cisco, EVE-NG",
          "• <span class='text-cyan'>Sistemas:</span> Linux (Ubuntu/Debian), Windows Server, Virtualização",
          "• <span class='text-cyan'>Segurança:</span> IAM, Permissões, Firewall, ACLs, LGPD, ISO 27001",
          "• <span class='text-cyan'>Dados & Dev:</span> Python, SQL, Power BI, Git, JavaScript, HTML/CSS",
          "• <span class='text-cyan'>Cloud & Labs:</span> AWS Fundamentals, VMware, VirtualBox, QEMU"
        ],

        experience: () => [
          "<span class='text-highlight'>HISTÓRICO PROFISSIONAL:</span>",
          "1. <span class='text-accent'>CAS Tecnologia S.A.</span> (Dez/2025 - Atual)",
          "   Estagiária de TI — Suporte Técnico, IAM, Redes e Hardware.",
          "2. <span class='text-muted'>Magazine Luiza S.A.</span> (Jan/2025 - Nov/2025)",
          "   Auxiliar Administrativo / Jovem Aprendiz."
        ],

        projects: () => [
          "<span class='text-highlight'>LABS & PROJETOS:</span>",
          "1. <span class='text-accent'>Lab de Infraestrutura de Redes e Segurança</span> (EVE-NG, ACLs, Firewall)",
          "2. <span class='text-cyan'>Site de Controle de Saúde Mental</span> (Python, Web)",
          "3. <span class='text-cyan'>Palestra de Cibersegurança no CIEE</span> (Conscientização & Boas Práticas)"
        ],

        contact: () => [
          "<span class='text-highlight'>CANAIS DE CONTATO:</span>",
          "• Email:    <a href='mailto:emily09.e.y@gmail.com' class='terminal-link'>emily09.e.y@gmail.com</a>",
          "• LinkedIn: <a href='https://www.linkedin.com/in/emilyangeloo/' target='_blank' rel='noopener' class='terminal-link'>linkedin.com/in/emilyangeloo</a>",
          "• GitHub:   <a href='https://github.com/emilyangelo' target='_blank' rel='noopener' class='terminal-link'>github.com/emilyangelo</a>"
        ],

        status: () => [
          "<span class='text-accent'>SYSTEM TELEMETRY:</span>",
          "• Host: workstation-emily (x86_64 Linux)",
          "• Status: <span class='text-green'>ONLINE (200 OK)</span>",
          "• Security: Hardening applied · IAM active",
          "• Latency: 12ms (Operational)"
        ],

        uptime: () => [
          `system up 2025-2026 (ADS UNG - Conclusão em Dez/2026)`
        ],

        sudo: () => [
          "<span class='text-red'>emily is not in the sudoers file. This incident will be reported. ;)</span>"
        ],

        ping: () => [
          "PING cas-tecnologia (10.0.0.1): 56 data bytes",
          "64 bytes from 10.0.0.1: icmp_seq=0 ttl=64 time=1.24 ms",
          "--- cas-tecnologia ping statistics ---",
          "1 packets transmitted, 1 packets received, 0.0% packet loss"
        ]
      };
    }

    _bindEvents() {
      // Submissão do input
      if (this.formEl && this.inputEl) {
        this.formEl.addEventListener("submit", (e) => {
          e.preventDefault();
          if (this.isTyping) return;
          const cmd = this.inputEl.value.trim();
          if (cmd) {
            this.executeCommand(cmd);
            this.history.push(cmd);
            this.historyIndex = this.history.length;
            this.inputEl.value = "";
          }
        });

        // Navegação de histórico com Setas Cima/Baixo
        this.inputEl.addEventListener("keydown", (e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            if (this.historyIndex > 0) {
              this.historyIndex--;
              this.inputEl.value = this.history[this.historyIndex] || "";
            }
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
              this.historyIndex++;
              this.inputEl.value = this.history[this.historyIndex] || "";
            } else {
              this.historyIndex = this.history.length;
              this.inputEl.value = "";
            }
          }
        });
      }

      // Cliques nos chips rápidos
      if (this.chipsContainer) {
        this.chipsContainer.addEventListener("click", (e) => {
          const btn = e.target.closest("button[data-cmd]");
          if (btn && !this.isTyping) {
            const cmd = btn.getAttribute("data-cmd");
            this.executeCommand(cmd);
          }
        });
      }

      // Focar no input ao clicar dentro do terminal
      this.terminalEl.addEventListener("click", () => {
        if (this.inputEl && !this.isTyping) {
          this.inputEl.focus();
        }
      });

      // Controles do Widget Flutuante (Toggle, Close, Minimize)
      const toggleBtn = document.getElementById("terminal-widget-toggle");
      const floatingWidget = document.getElementById("terminal-floating-widget");
      const closeBtn = this.terminalEl.querySelector(".btn-close");
      const minimizeBtn = this.terminalEl.querySelector(".btn-minimize");

      if (toggleBtn && floatingWidget) {
        toggleBtn.addEventListener("click", () => {
          const isClosed = floatingWidget.classList.contains("hidden");
          if (isClosed) {
            floatingWidget.classList.remove("hidden");
            toggleBtn.classList.add("active");
            toggleBtn.setAttribute("aria-expanded", "true");
            if (this.inputEl) this.inputEl.focus();
            this._scrollToBottom();
          } else {
            floatingWidget.classList.add("hidden");
            toggleBtn.classList.remove("active");
            toggleBtn.setAttribute("aria-expanded", "false");
          }
        });
      }

      if (closeBtn && floatingWidget) {
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          floatingWidget.classList.add("hidden");
          if (toggleBtn) {
            toggleBtn.classList.remove("active");
            toggleBtn.setAttribute("aria-expanded", "false");
          }
        });
      }

      if (minimizeBtn && floatingWidget) {
        minimizeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          floatingWidget.classList.add("hidden");
          if (toggleBtn) {
            toggleBtn.classList.remove("active");
            toggleBtn.setAttribute("aria-expanded", "false");
          }
        });
      }

      const closeXBtn = document.getElementById("terminal-close-x-btn");
      if (closeXBtn && floatingWidget) {
        closeXBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          floatingWidget.classList.add("hidden");
          if (toggleBtn) {
            toggleBtn.classList.remove("active");
            toggleBtn.setAttribute("aria-expanded", "false");
          }
        });
      }
    }

    _scrollToBottom() {
      if (this.outputEl) {
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
      }
    }

    _appendLine(html, isCommand = false) {
      const line = document.createElement("div");
      line.className = isCommand ? "terminal-line command-echo" : "terminal-line";
      line.innerHTML = html;
      this.outputEl.appendChild(line);
      this._scrollToBottom();
      return line;
    }

    _typeText(element, text, speed = 25) {
      return new Promise((resolve) => {
        let i = 0;
        element.innerHTML = "";
        const cursor = document.createElement("span");
        cursor.className = "terminal-cursor-inline";
        cursor.textContent = "▋";
        element.appendChild(cursor);

        const timer = setInterval(() => {
          if (i < text.length) {
            cursor.insertAdjacentText("beforebegin", text.charAt(i));
            i++;
            this._scrollToBottom();
          } else {
            clearInterval(timer);
            cursor.remove();
            resolve();
          }
        }, speed);
      });
    }

    async _runInitialSequence() {
      this.isTyping = true;
      if (this.inputEl) this.inputEl.disabled = true;

      this.outputEl.innerHTML = "";

      // Linha 1: whoami
      const line1 = this._appendLine("<span class='terminal-prompt'>emily@workstation:~$</span> <span class='typing-text'></span>", true);
      const text1 = line1.querySelector(".typing-text");
      await this._typeText(text1, "whoami", 40);
      await this._sleep(150);
      this._appendLine("<span class='text-highlight'>Emily Almeida Angelo</span> — Estudante de ADS & Estagiária de TI");

      await this._sleep(300);

      // Linha 2: focus
      const line2 = this._appendLine("<span class='terminal-prompt'>emily@workstation:~$</span> <span class='typing-text'></span>", true);
      const text2 = line2.querySelector(".typing-text");
      await this._typeText(text2, "cat /etc/focus.conf", 35);
      await this._sleep(150);
      this._appendLine("Suporte Técnico · Infraestrutura · Redes · Segurança da Informação");

      await this._sleep(300);

      // Linha 3: status ping
      const line3 = this._appendLine("<span class='terminal-prompt'>emily@workstation:~$</span> <span class='typing-text'></span>", true);
      const text3 = line3.querySelector(".typing-text");
      await this._typeText(text3, "status --ping", 35);
      await this._sleep(150);
      this._appendLine("<span class='text-green'>[OK] 64 bytes from cas-tech: latency=11ms · Ready to build</span>");
      this._appendLine("<span class='text-muted' style='font-size: 0.8rem; margin-top: 4px;'>Digite 'help' ou clique nos atalhos abaixo para navegar.</span>");

      this.isTyping = false;
      if (this.inputEl) {
        this.inputEl.disabled = false;
        this.inputEl.placeholder = "digite um comando (ex: skills, projects)...";
      }
    }

    executeCommand(commandText) {
      const raw = (commandText || "").trim();
      if (!raw) return;

      const normalized = raw.toLowerCase();

      // Ecoar comando digitado
      this._appendLine(`<span class='terminal-prompt'>emily@workstation:~$</span> <span class='text-white'>${this._escapeHtml(raw)}</span>`, true);

      if (normalized === "clear") {
        this.outputEl.innerHTML = "";
        this._appendLine("<span class='text-muted' style='font-size: 0.8rem;'>Terminal limpo. Digite 'help' para comandos.</span>");
        return;
      }

      if (this.commandMap[normalized]) {
        const outputLines = this.commandMap[normalized]();
        outputLines.forEach(l => this._appendLine(l));
      } else {
        this._appendLine(`<span class='text-red'>Comando não reconhecido: '${this._escapeHtml(raw)}'</span>`);
        this._appendLine("<span class='text-muted'>Digite <span class='text-accent'>help</span> para ver os comandos disponíveis.</span>");
      }

      this._scrollToBottom();
    }

    _escapeHtml(str) {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    _sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  // Inicializa quando o DOM estiver pronto
  document.addEventListener("DOMContentLoaded", () => {
    window.microTerminal = new MicroTerminal();
  });
})();
