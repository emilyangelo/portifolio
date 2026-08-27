/**
 * admin.js - Gerenciador do Painel Administrativo e Operações CRUD
 * 
 * Ativado após autenticação bem-sucedida via Firebase AuthService.
 * Permite Criar, Editar e Excluir registros em todas as seções:
 * - Experiências
 * - Cursos & Certificações
 * - Projetos & Laboratórios
 * - Competências / Camadas de Protocolo
 * - Formação Acadêmica
 * - Idiomas & Proficiência
 * - Perfil Principal & Contato
 */

(function () {
  class AdminController {
    constructor() {
      this.adminBar = document.getElementById("admin-bar");
      this.authModal = document.getElementById("auth-modal");
      this.crudModal = document.getElementById("crud-modal");
      this.authForm = document.getElementById("auth-form");
      this.crudForm = document.getElementById("crud-form");
      this.authErrorEl = document.getElementById("auth-error-msg");

      this.currentEditingType = null;
      this.currentEditingId = null;

      this._init();
    }

    _init() {
      this._bindAuthEvents();
      this._bindCrudEvents();

      // Observador de estado de autenticação
      if (window.authService) {
        window.authService.onAuthStateChanged((user) => {
          this._handleAuthState(user);
        });
      }
    }

    _handleAuthState(user) {
      const isAdmin = !!user && user.isAdmin === true;

      if (isAdmin) {
        document.body.classList.add("admin-mode", "admin-mode-active");
        if (this.adminBar) this.adminBar.classList.remove("hidden");
        window.showToast("Modo Administrativo ativado", "success");
      } else {
        document.body.classList.remove("admin-mode", "admin-mode-active");
        if (this.adminBar) this.adminBar.classList.add("hidden");
      }

      // Re-renderizar para atualizar botões condicionais
      if (window.renderAllSections) {
        window.renderAllSections();
      }
    }

    _bindAuthEvents() {
      // Abrir modal ao clicar no cadeado secreto
      const lockBtn = document.getElementById("admin-lock-btn");
      if (lockBtn) {
        lockBtn.addEventListener("click", (e) => {
          e.preventDefault();
          if (window.authService && window.authService.isAdmin()) {
            window.showToast("Você já está autenticado no modo Admin.", "info");
          } else {
            this.openAuthModal();
          }
        });
      }

      // Fechar modal de autenticação
      const closeAuthBtn = document.getElementById("close-auth-modal");
      if (closeAuthBtn) {
        closeAuthBtn.addEventListener("click", () => this.closeAuthModal());
      }

      // Fechar com tecla ESC
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.closeAuthModal();
          this.closeCrudModal();
        }
      });

      // Submissão do formulário de autenticação
      if (this.authForm) {
        this.authForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const emailInput = document.getElementById("auth-email");
          const passInput = document.getElementById("auth-password");
          const submitBtn = this.authForm.querySelector("button[type='submit']");

          const email = emailInput ? emailInput.value : "";
          const pass = passInput ? passInput.value : "";

          if (this.authErrorEl) this.authErrorEl.textContent = "";
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Autenticando...";
          }

          try {
            await window.authService.signIn(email, pass);
            this.closeAuthModal();
            if (this.authForm) this.authForm.reset();
          } catch (err) {
            if (this.authErrorEl) {
              this.authErrorEl.textContent = err.message || "Erro na autenticação.";
            }
          } finally {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = "Acessar Painel";
            }
          }
        });
      }

      // Botão de Logout no Admin Bar
      const logoutBtn = document.getElementById("admin-logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
          if (window.authService) {
            await window.authService.signOut();
            window.showToast("Sessão administrativa encerrada.", "info");
          }
        });
      }

      // Botão de Restaurar Dados Originais
      const resetBtn = document.getElementById("admin-reset-btn");
      if (resetBtn) {
        resetBtn.addEventListener("click", async () => {
          if (confirm("Deseja restaurar todos os dados originais do portfólio? Alterações manuais serão resetadas.")) {
            await window.portfolioDataService.resetToDefaults();
            if (window.renderAllSections) window.renderAllSections();
            window.showToast("Dados originais restaurados com sucesso.", "success");
          }
        });
      }
    }

    _bindCrudEvents() {
      // Fechar modal CRUD
      const closeCrudBtn = document.getElementById("close-crud-modal");
      if (closeCrudBtn) {
        closeCrudBtn.addEventListener("click", () => this.closeCrudModal());
      }

      // Submissão do formulário CRUD
      if (this.crudForm) {
        this.crudForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          await this._saveCrudData();
        });
      }
    }

    openAuthModal() {
      if (this.authModal) {
        this.authModal.classList.remove("hidden");
        const emailInput = document.getElementById("auth-email");
        if (emailInput) emailInput.focus();
      }
    }

    closeAuthModal() {
      if (this.authModal) {
        this.authModal.classList.add("hidden");
        if (this.authErrorEl) this.authErrorEl.textContent = "";
      }
    }

    async openCrudModal(type, id = null) {
      this.currentEditingType = type;
      this.currentEditingId = id;

      const modalTitle = document.getElementById("crud-modal-title");
      const formContainer = document.getElementById("crud-fields-container");
      if (!formContainer || !this.crudModal) return;

      formContainer.innerHTML = "";

      let itemData = null;
      if (id) {
        if (type === "experience") {
          const list = await window.portfolioDataService.getExperiences();
          itemData = list.find((x) => x.id === id);
        } else if (type === "project") {
          const list = await window.portfolioDataService.getProjects();
          itemData = list.find((x) => x.id === id);
        } else if (type === "certification" || type === "course") {
          const list = await window.portfolioDataService.getCertifications();
          itemData = list.find((x) => x.id === id);
        } else if (type === "skillCategory") {
          const list = await window.portfolioDataService.getSkillsCategories();
          itemData = list.find((x) => x.id === id);
        } else if (type === "education") {
          const list = await window.portfolioDataService.getEducation();
          itemData = list.find((x) => x.id === id);
        } else if (type === "language") {
          const list = await window.portfolioDataService.getLanguages();
          itemData = list.find((x) => x.id === id);
        } else if (type === "profile") {
          itemData = await window.portfolioDataService.getProfile();
        }
      }

      if (type === "experience") {
        modalTitle.textContent = id ? "Editar Experiência" : "Nova Experiência";
        formContainer.innerHTML = `
          <div class="form-group">
            <label class="form-label" for="exp-role">Cargo / Título</label>
            <input type="text" id="exp-role" class="form-input" required value="${itemData ? this._escape(itemData.role) : ''}" placeholder="Ex: Estagiária de TI">
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="exp-company">Empresa</label>
              <input type="text" id="exp-company" class="form-input" required value="${itemData ? this._escape(itemData.company) : ''}" placeholder="Ex: CAS Tecnologia S.A.">
            </div>
            <div class="form-group">
              <label class="form-label" for="exp-location">Localização</label>
              <input type="text" id="exp-location" class="form-input" value="${itemData ? this._escape(itemData.location) : 'São Paulo/SP'}" placeholder="Ex: São Paulo/SP">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="exp-period">Período</label>
            <input type="text" id="exp-period" class="form-input" required value="${itemData ? this._escape(itemData.period) : ''}" placeholder="Ex: Dezembro de 2025 - Atual">
          </div>
          <div class="form-group">
            <label class="form-label" for="exp-desc">Resumo da Atuação</label>
            <textarea id="exp-desc" class="form-textarea" rows="2" placeholder="Breve descrição da função">${itemData ? this._escape(itemData.description) : ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="exp-bullets">Atividades / Responsabilidades (uma por linha)</label>
            <textarea id="exp-bullets" class="form-textarea" rows="5" placeholder="Atendimento e suporte técnico a usuários&#10;Administração de contas e acessos (IAM)">${itemData && itemData.bullets ? itemData.bullets.join('\n') : ''}</textarea>
          </div>
        `;
      } else if (type === "project") {
        modalTitle.textContent = id ? "Editar Projeto" : "Novo Projeto";
        formContainer.innerHTML = `
          <div class="form-group">
            <label class="form-label" for="proj-title">Título do Projeto</label>
            <input type="text" id="proj-title" class="form-input" required value="${itemData ? this._escape(itemData.title) : ''}" placeholder="Ex: Laboratório de Redes">
          </div>
          <div class="form-group">
            <label class="form-label" for="proj-category">Categoria</label>
            <input type="text" id="proj-category" class="form-input" value="${itemData ? this._escape(itemData.category) : 'Infraestrutura & Redes'}" placeholder="Ex: Infraestrutura & Redes">
          </div>
          <div class="form-group">
            <label class="form-label" for="proj-desc">Descrição do Projeto</label>
            <textarea id="proj-desc" class="form-textarea" rows="3" required placeholder="Explique o que o projeto resolve e seu escopo">${itemData ? this._escape(itemData.description) : ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="proj-techs">Tecnologias (separadas por vírgula)</label>
            <input type="text" id="proj-techs" class="form-input" value="${itemData && itemData.technologies ? itemData.technologies.join(', ') : ''}" placeholder="Redes, EVE-NG, ACLs, Firewall">
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="proj-link-demo">Link do Projeto / Demonstração</label>
              <input type="url" id="proj-link-demo" class="form-input" value="${itemData && itemData.links ? this._escape(itemData.links.demo || '') : ''}" placeholder="https://...">
            </div>
            <div class="form-group">
              <label class="form-label" for="proj-link-github">Link do Repositório GitHub</label>
              <input type="url" id="proj-link-github" class="form-input" value="${itemData && itemData.links ? this._escape(itemData.links.github || '') : ''}" placeholder="https://github.com/...">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="proj-link-doc">Link da Documentação (opcional)</label>
            <input type="url" id="proj-link-doc" class="form-input" value="${itemData && itemData.links ? this._escape(itemData.links.doc || '') : ''}" placeholder="https://...">
          </div>
        `;
      } else if (type === "certification" || type === "course") {
        modalTitle.textContent = id ? "Editar Curso / Certificação" : "Novo Curso / Certificação";
        formContainer.innerHTML = `
          <div class="form-group">
            <label class="form-label" for="cert-title">Nome do Curso / Certificação</label>
            <input type="text" id="cert-title" class="form-input" required value="${itemData ? this._escape(itemData.title) : ''}" placeholder="Ex: CCNA v7: Introduction to Networks">
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="cert-inst">Instituição</label>
              <input type="text" id="cert-inst" class="form-input" required value="${itemData ? this._escape(itemData.institution) : ''}" placeholder="Ex: SENAI / Cisco">
            </div>
            <div class="form-group">
              <label class="form-label" for="cert-category">Trilha / Domínio</label>
              <select id="cert-category" class="form-select">
                <option value="networks" ${itemData && itemData.category === 'networks' ? 'selected' : ''}>Redes & Cloud</option>
                <option value="dev" ${itemData && itemData.category === 'dev' ? 'selected' : ''}>Programação & Web</option>
                <option value="data-ai" ${itemData && itemData.category === 'data-ai' ? 'selected' : ''}>Dados & IA</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="cert-status">Status</label>
            <select id="cert-status" class="form-select">
              <option value="Concluído" ${itemData && itemData.status === 'Concluído' ? 'selected' : ''}>● Concluído</option>
              <option value="Em andamento" ${itemData && itemData.status === 'Em andamento' ? 'selected' : ''}>○ Em andamento</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="cert-tags">Tags / Conceitos (separados por vírgula)</label>
            <input type="text" id="cert-tags" class="form-input" value="${itemData && itemData.tags ? itemData.tags.join(', ') : ''}" placeholder="Redes, TCP/IP, Roteamento, Cisco">
          </div>
        `;
      } else if (type === "education") {
        modalTitle.textContent = id ? "Editar Formação Acadêmica" : "Nova Formação Acadêmica";
        formContainer.innerHTML = `
          <div class="form-group">
            <label class="form-label" for="edu-course">Curso / Graduação</label>
            <input type="text" id="edu-course" class="form-input" required value="${itemData ? this._escape(itemData.course) : ''}" placeholder="Ex: Análise e Desenvolvimento de Sistemas">
          </div>
          <div class="form-group">
            <label class="form-label" for="edu-inst">Instituição de Ensino</label>
            <input type="text" id="edu-inst" class="form-input" required value="${itemData ? this._escape(itemData.institution) : ''}" placeholder="Ex: Universidade de Guarulhos – UNG">
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="edu-period">Período / Previsão</label>
              <input type="text" id="edu-period" class="form-input" required value="${itemData ? this._escape(itemData.period) : '2025 - Dezembro de 2026'}" placeholder="Ex: 2025 - Dezembro de 2026">
            </div>
            <div class="form-group">
              <label class="form-label" for="edu-status">Status</label>
              <input type="text" id="edu-status" class="form-input" value="${itemData ? this._escape(itemData.status) : 'Cursando'}" placeholder="Ex: Cursando">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="edu-notes">Observações / Distinções (ex: ProUni)</label>
            <textarea id="edu-notes" class="form-textarea" rows="3" placeholder="Bolsista integral pelo ProUni...">${itemData ? this._escape(itemData.notes) : ''}</textarea>
          </div>
        `;
      } else if (type === "language") {
        modalTitle.textContent = id ? "Editar Idioma" : "Novo Idioma";
        formContainer.innerHTML = `
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="lang-name">Idioma</label>
              <input type="text" id="lang-name" class="form-input" required value="${itemData ? this._escape(itemData.name) : ''}" placeholder="Ex: Inglês">
            </div>
            <div class="form-group">
              <label class="form-label" for="lang-code">Código (Sigla)</label>
              <input type="text" id="lang-code" class="form-input" required value="${itemData ? this._escape(itemData.code) : 'EN'}" placeholder="Ex: EN">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="lang-level">Nível / Proficiência</label>
            <input type="text" id="lang-level" class="form-input" required value="${itemData ? this._escape(itemData.level) : ''}" placeholder="Ex: Nível B2 (Em andamento) – Soul Bilíngue">
          </div>
        `;
      } else if (type === "skillCategory") {
        modalTitle.textContent = id ? "Editar Camada / Competências" : "Nova Camada de Competências";
        const skillsFormatted = itemData && itemData.skills ? itemData.skills.map((s) => s.name || s).join("\n") : "";
        formContainer.innerHTML = `
          <div class="form-group">
            <label class="form-label" for="skill-cat-name">Nome da Categoria / Camada</label>
            <input type="text" id="skill-cat-name" class="form-input" required value="${itemData ? this._escape(itemData.name) : ''}" placeholder="Ex: Networking & Infrastructure">
          </div>
          <div class="form-group">
            <label class="form-label" for="skill-cat-desc">Descrição da Camada</label>
            <textarea id="skill-cat-desc" class="form-textarea" rows="2" placeholder="Topologia, protocolos de comunicação, switching...">${itemData ? this._escape(itemData.description) : ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="skill-cat-skills">Competências / Protocolos (um por linha)</label>
            <textarea id="skill-cat-skills" class="form-textarea" rows="6" placeholder="Redes de Computadores&#10;TCP/IP&#10;VLANs">${skillsFormatted}</textarea>
          </div>
        `;
      } else if (type === "profile") {
        modalTitle.textContent = "Editar Perfil Principal";
        formContainer.innerHTML = `
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="prof-name">Nome Completo</label>
              <input type="text" id="prof-name" class="form-input" required value="${itemData ? this._escape(itemData.name) : ''}">
            </div>
            <div class="form-group">
              <label class="form-label" for="prof-role">Cargo / Subtítulo</label>
              <input type="text" id="prof-role" class="form-input" required value="${itemData ? this._escape(itemData.role) : ''}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="prof-summary">Resumo Profissional</label>
            <textarea id="prof-summary" class="form-textarea" rows="3">${itemData ? this._escape(itemData.summary) : ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="prof-objective">Foco / Objetivo</label>
            <textarea id="prof-objective" class="form-textarea" rows="2">${itemData ? this._escape(itemData.objective) : ''}</textarea>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label" for="prof-email">E-mail</label>
              <input type="email" id="prof-email" class="form-input" value="${itemData ? this._escape(itemData.email) : ''}">
            </div>
            <div class="form-group">
              <label class="form-label" for="prof-linkedin">LinkedIn URL</label>
              <input type="url" id="prof-linkedin" class="form-input" value="${itemData ? this._escape(itemData.linkedin) : ''}">
            </div>
          </div>
        `;
      }

      this.crudModal.classList.remove("hidden");
    }

    closeCrudModal() {
      if (this.crudModal) {
        this.crudModal.classList.add("hidden");
        this.currentEditingType = null;
        this.currentEditingId = null;
      }
    }

    async _saveCrudData() {
      const type = this.currentEditingType;
      const id = this.currentEditingId;

      try {
        if (type === "experience") {
          const role = document.getElementById("exp-role").value.trim();
          const company = document.getElementById("exp-company").value.trim();
          const location = document.getElementById("exp-location").value.trim();
          const period = document.getElementById("exp-period").value.trim();
          const description = document.getElementById("exp-desc").value.trim();
          const bulletsRaw = document.getElementById("exp-bullets").value;
          const bullets = bulletsRaw.split("\n").map((s) => s.trim()).filter(Boolean);

          await window.portfolioDataService.saveExperience({
            id,
            role,
            company,
            location,
            period,
            description,
            bullets
          });
          window.showToast("Experiência salva com sucesso!", "success");
        } else if (type === "project") {
          const title = document.getElementById("proj-title").value.trim();
          const category = document.getElementById("proj-category").value.trim();
          const description = document.getElementById("proj-desc").value.trim();
          const techsRaw = document.getElementById("proj-techs").value;
          const technologies = techsRaw.split(",").map((s) => s.trim()).filter(Boolean);
          const demo = document.getElementById("proj-link-demo").value.trim();
          const github = document.getElementById("proj-link-github").value.trim();
          const doc = document.getElementById("proj-link-doc") ? document.getElementById("proj-link-doc").value.trim() : "";

          await window.portfolioDataService.saveProject({
            id,
            title,
            category,
            description,
            technologies,
            links: { demo, github, doc }
          });
          window.showToast("Projeto salvo com sucesso!", "success");
        } else if (type === "certification" || type === "course") {
          const title = document.getElementById("cert-title").value.trim();
          const institution = document.getElementById("cert-inst").value.trim();
          const category = document.getElementById("cert-category").value;
          const status = document.getElementById("cert-status").value;
          const tagsRaw = document.getElementById("cert-tags").value;
          const tags = tagsRaw.split(",").map((s) => s.trim()).filter(Boolean);

          await window.portfolioDataService.saveCertification({
            id,
            title,
            institution,
            category,
            status,
            tags
          });
          window.showToast("Curso/Certificação salva com sucesso!", "success");
        } else if (type === "education") {
          const course = document.getElementById("edu-course").value.trim();
          const institution = document.getElementById("edu-inst").value.trim();
          const period = document.getElementById("edu-period").value.trim();
          const status = document.getElementById("edu-status").value.trim();
          const notes = document.getElementById("edu-notes").value.trim();

          await window.portfolioDataService.saveEducation({
            id,
            course,
            institution,
            period,
            status,
            notes
          });
          window.showToast("Formação acadêmica salva com sucesso!", "success");
        } else if (type === "language") {
          const name = document.getElementById("lang-name").value.trim();
          const code = document.getElementById("lang-code").value.trim().toUpperCase();
          const level = document.getElementById("lang-level").value.trim();

          await window.portfolioDataService.saveLanguage({
            id,
            name,
            code,
            level
          });
          window.showToast("Idioma salvo com sucesso!", "success");
        } else if (type === "skillCategory") {
          const name = document.getElementById("skill-cat-name").value.trim();
          const description = document.getElementById("skill-cat-desc").value.trim();
          const skillsLines = document.getElementById("skill-cat-skills").value.split("\n").map((s) => s.trim()).filter(Boolean);
          const skills = skillsLines.map((s) => ({ name: s, icon: "network" }));

          await window.portfolioDataService.saveSkillCategory({
            id,
            name,
            description,
            skills
          });
          window.showToast("Camada de competências salva com sucesso!", "success");
        } else if (type === "profile") {
          const name = document.getElementById("prof-name").value.trim();
          const role = document.getElementById("prof-role").value.trim();
          const summary = document.getElementById("prof-summary").value.trim();
          const objective = document.getElementById("prof-objective").value.trim();
          const email = document.getElementById("prof-email").value.trim();
          const linkedin = document.getElementById("prof-linkedin").value.trim();

          await window.portfolioDataService.saveProfile({
            name,
            role,
            summary,
            objective,
            email,
            linkedin
          });
          window.showToast("Perfil atualizado com sucesso!", "success");
        }

        this.closeCrudModal();

        // Atualização em tempo real na tela
        if (window.renderAllSections) {
          await window.renderAllSections();
        }
      } catch (err) {
        console.error("[AdminController] Erro ao salvar dados:", err);
        window.showToast("Erro ao salvar dados: " + err.message, "error");
      }
    }

    async deleteItem(type, id) {
      if (!confirm("Tem certeza de que deseja excluir este registro?")) return;

      try {
        if (type === "experience") {
          await window.portfolioDataService.deleteExperience(id);
        } else if (type === "project") {
          await window.portfolioDataService.deleteProject(id);
        } else if (type === "certification" || type === "course") {
          await window.portfolioDataService.deleteCertification(id);
        } else if (type === "education") {
          await window.portfolioDataService.deleteEducation(id);
        } else if (type === "language") {
          await window.portfolioDataService.deleteLanguage(id);
        } else if (type === "skillCategory") {
          await window.portfolioDataService.deleteSkillCategory(id);
        }

        window.showToast("Registro excluído com sucesso.", "info");

        if (window.renderAllSections) {
          await window.renderAllSections();
        }
      } catch (err) {
        console.error("[AdminController] Erro ao excluir registro:", err);
        window.showToast("Erro ao excluir: " + err.message, "error");
      }
    }

    _escape(text) {
      if (!text) return "";
      return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  }

  // Instância global
  window.adminController = new AdminController();
})();
