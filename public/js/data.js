/**
 * data.js - Camada de Dados com Firestore (v10 Modular via CDN) e Fallback Local
 * 
 * Coleções no Cloud Firestore:
 * - 'profile': Dados do perfil principal
 * - 'skills': Categorias e Pilha de Competências/Protocolos
 * - 'experiences': Histórico e Experiência Profissional
 * - 'projects': Projetos e Laboratórios Práticos
 * - 'education': Formação Acadêmica e Graduação
 * - 'courses': Cursos, Certificações e Qualificações Técnicas
 * - 'languages': Idiomas e Proficiência
 */

import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

function normalizeCategory(cat) {
  if (!cat) return "networks";
  const c = String(cat).toLowerCase().trim();
  if (c === "networks" || c.includes("rede") || c.includes("cloud") || c.includes("cisco") || c.includes("infra")) {
    return "networks";
  }
  if (c === "dev" || c.includes("prog") || c.includes("web") || c.includes("software") || c.includes("python")) {
    return "dev";
  }
  if (c === "data-ai" || c.includes("dado") || c.includes("ia") || c.includes("data") || c.includes("prompt")) {
    return "data-ai";
  }
  return c;
}

const INITIAL_PORTFOLIO_DATA = {
  profile: {
    name: "Emily Almeida Angelo",
    role: "Estudante de ADS & Estagiária de TI",
    location: "São Paulo - SP",
    email: "emily09.e.y@gmail.com",
    linkedin: "https://www.linkedin.com/in/emilyangeloo/",
    github: "https://github.com/emilyangelo",
    objective: "Estudante de Análise e Desenvolvimento de Sistemas e Estagiária de TI, com atuação prática nas áreas de Suporte Técnico, Infraestrutura e Redes, com foco contínuo em Segurança da Informação.",
    summary: "Estagiária de TI na CAS Tecnologia, atuando com suporte técnico, gestão de contas e acessos (IAM) e apoio à infraestrutura de rede. Estudante de Análise e Desenvolvimento de Sistemas pela UNG (bolsista ProUni), com experiência prévia em rotinas administrativas na Magazine Luiza. Vem construindo base técnica em redes por meio do CCNA v7 (em andamento) e de laboratórios práticos com EVE-NG, incluindo simulação de firewall e monitoramento. Possui conhecimentos complementares em Python, SQL e Power BI, além de fundamentos de segurança da informação, controle de acesso e LGPD. Atua aplicando essa base técnica em ambientes corporativos com foco em Infraestrutura, Redes e Segurança da Informação."
  },

  skillsCategories: [
    {
      id: "networking",
      name: "Redes & Conectividade L2/L3",
      description: "Topologias corporativas, comutação, protocolos e simulações.",
      icon: "network",
      faIcon: "fa-network-wired",
      skills: [
        { name: "TCP/IP & CIDR", icon: "protocol" },
        { name: "VLANs (802.1Q)", icon: "vlan" },
        { name: "Switching & Routing", icon: "router" },
        { name: "ACLs", icon: "acl" },
        { name: "EVE-NG", icon: "lab" },
        { name: "Cisco Packet Tracer", icon: "packet" },
        { name: "Wireshark", icon: "wireshark" }
      ]
    },
    {
      id: "cybersecurity",
      name: "Segurança & Gestão de Acessos (IAM)",
      description: "Controle de privilégios, defesa perimetral e políticas corporativas.",
      icon: "security",
      faIcon: "fa-user-shield",
      skills: [
        { name: "Active Directory (AD)", icon: "ad" },
        { name: "IAM & MFA", icon: "iam" },
        { name: "Firewalls & Regras", icon: "firewall" },
        { name: "Hardening de Estações", icon: "hardening" },
        { name: "LGPD", icon: "lgpd" },
        { name: "ISO 27001", icon: "iso" }
      ]
    },
    {
      id: "systems",
      name: "Sistemas Operacionais & Virtualização",
      description: "Sustentação de servidores corporativos, hipervisores e ambientes de nuvem.",
      icon: "server",
      faIcon: "fa-server",
      skills: [
        { name: "Linux (Debian/Ubuntu/Mint)", icon: "linux" },
        { name: "Windows Server", icon: "winserver" },
        { name: "VMware & QEMU", icon: "vmware" },
        { name: "AWS Fundamentals", icon: "aws" },
        { name: "Suporte N1/N2", icon: "support" }
      ]
    },
    {
      id: "automation",
      name: "Automação & Ferramentas Operacionais",
      description: "Scripts de rotinas técnicas e manipulação de fluxos operacionais.",
      icon: "code",
      faIcon: "fa-terminal",
      skills: [
        { name: "Python", icon: "python" },
        { name: "Bash / Shell CLI", icon: "cli" },
        { name: "Git & GitHub", icon: "git" },
        { name: "Shell Script", icon: "cli" }
      ]
    },
    {
      id: "telemetry",
      name: "Telemetria, Redes & Monitoramento (NOC)",
      description: "Supervisão contínua de ativos, métricas de tráfego e análise de pacotes.",
      icon: "network",
      faIcon: "fa-chart-line",
      skills: [
        { name: "Zabbix", icon: "network" },
        { name: "SNMP", icon: "protocol" },
        { name: "Syslog", icon: "protocol" },
        { name: "Wireshark", icon: "wireshark" },
        { name: "ICMP / Telemetria", icon: "protocol" },
        { name: "Diagnóstico de Tráfego", icon: "router" }
      ]
    },
    {
      id: "cloud_data",
      name: "Cloud, Dados & Tecnologias Aplicadas",
      description: "Repositórios em nuvem, consultas estruturadas e ferramentas modernas.",
      icon: "cloud",
      faIcon: "fa-cloud",
      skills: [
        { name: "AWS Cloud", icon: "aws" },
        { name: "Firebase", icon: "sql" },
        { name: "SQL Relacional", icon: "sql" },
        { name: "Streamlit", icon: "code" },
        { name: "IA Generativa & Prompts", icon: "ai" }
      ]
    }
  ],

  experiences: [
    {
      id: "exp-1",
      role: "Estagiária de TI",
      company: "CAS Tecnologia S.A.",
      location: "São Paulo/SP",
      period: "Dezembro de 2025 - Atual",
      current: true,
      description: "Atuação direta no suporte técnico, administração de contas e acessos (IAM) e sustentação de infraestrutura de redes e sistemas corporativos.",
      bullets: [
        "Atendimento e suporte técnico a usuários presenciais e remotos.",
        "Suporte e troubleshooting em ambientes Windows e Linux.",
        "Instalação e configuração de sistemas operacionais e aplicações corporativas.",
        "Instalação, montagem, manutenção e diagnóstico de computadores e periféricos.",
        "Instalação e gerenciamento de impressoras em rede.",
        "Apoio em infraestrutura de rede, cabeamento estruturado e manutenção de switches.",
        "Controle e inventário de ativos de tecnologia da informação.",
        "Gestão de contas, permissões e acessos de usuários (IAM).",
        "Suporte a sistemas corporativos e ERP.",
        "Atendimento, abertura e acompanhamento de chamados e demandas de TI."
      ]
    },
    {
      id: "exp-2",
      role: "Auxiliar Administrativo / Jovem Aprendiz",
      company: "Magazine Luiza S.A.",
      location: "Guarulhos/SP",
      period: "Janeiro de 2025 - Novembro de 2025",
      current: false,
      description: "Apoio administrativo com foco em organização de processos, controle documental e uso diário de ferramentas de produtividade.",
      bullets: [
        "Apoio às rotinas administrativas e operacionais do setor.",
        "Organização, triagem e controle de fluxos de informações.",
        "Utilização de ferramentas do pacote Microsoft Office (Word, Outlook, Excel) e rotinas administrativas.",
        "Atendimento e suporte às atividades operacionais da equipe."
      ]
    }
  ],

  education: [
    {
      id: "edu-1",
      course: "Análise e Desenvolvimento de Sistemas",
      institution: "Universidade de Guarulhos – UNG",
      period: "2025 - Dezembro de 2026",
      status: "Cursando",
      notes: "Bolsista integral pelo ProUni. Formação voltada ao desenvolvimento de sistemas, programação, banco de dados, redes e engenharia de software."
    }
  ],

  certifications: [
    {
      id: "cert-1",
      title: "CCNA v7: Introduction to Networks",
      institution: "SENAI / Cisco Networking Academy",
      status: "Concluído",
      category: "networks",
      tags: ["Redes", "TCP/IP", "Roteamento", "Switching", "Cisco"]
    },
    {
      id: "cert-2",
      title: "Desenvolvimento de Prompts com IA Generativa",
      institution: "SENAI",
      status: "Concluído",
      category: "data-ai",
      tags: ["IA", "Engenharia de Prompt", "Produtividade"]
    },
    {
      id: "cert-3",
      title: "Banco de Dados para Data Science",
      institution: "SENAI",
      status: "Concluído",
      category: "data-ai",
      tags: ["Banco de Dados", "SQL", "Power BI", "Excel", "Análise de Dados"]
    },
    {
      id: "cert-4",
      title: "Introdução à Programação e Programação WEB",
      institution: "USP - Universidade de São Paulo",
      status: "Concluído",
      category: "dev",
      tags: ["Python", "Lógica de Programação", "Desenvolvimento Web", "Projetos Práticos"]
    },
    {
      id: "cert-5",
      title: "Programação",
      institution: "USP Meninas Programadoras",
      status: "Concluído",
      category: "dev",
      tags: ["Python", "Lógica de Programação", "Projetos"]
    },
    {
      id: "cert-6",
      title: "Santander Code Girls",
      institution: "AWS / Santander",
      status: "Concluído",
      category: "networks",
      tags: ["Cloud Computing", "AWS", "Tecnologia", "Programação"]
    }
  ],

  projects: [
    {
      id: "proj-1",
      title: "Laboratório de Infraestrutura de Redes e Segurança",
      description: "Ambiente prático emulando uma topologia corporativa com segmentação de sub-redes, roteamento estático/dinâmico, implementação de listas de controle de acesso (ACLs) e simulação de regras de firewall.",
      technologies: ["Redes", "EVE-NG", "Firewall", "ACLs", "Segurança da Informação", "Infraestrutura"],
      links: {
        demo: "",
        github: "",
        doc: ""
      },
      category: "Infraestrutura & Redes"
    },
    {
      id: "proj-2",
      title: "Site de Controle de Saúde Mental",
      description: "Aplicação desenvolvida em Python para acompanhamento, registro e análise de informações voltadas ao bem-estar e saúde mental, com interface web e persistência de dados.",
      technologies: ["Python", "Desenvolvimento Web", "SQL", "Front-end"],
      links: {
        demo: "",
        github: "",
        doc: ""
      },
      category: "Desenvolvimento & Software"
    },
    {
      id: "proj-3",
      title: "Palestrante — Conceitos de Cibersegurança no CIEE",
      description: "Palestra técnica ministrada no Centro de Integração Empresa-Escola (CIEE) abordando fundamentos de cibersegurança, conscientização sobre engenharia social, higiene de senhas e boas práticas no ambiente corporativo.",
      technologies: ["Cibersegurança", "Segurança da Informação", "Boas Práticas", "Conscientização"],
      links: {
        demo: "",
        github: "",
        doc: ""
      },
      category: "Cibersegurança & Educação"
    }
  ],

  languages: [
    { id: "lang-en", name: "Inglês", level: "Nível B2 (Em andamento) – Soul Bilíngue", code: "EN" },
    { id: "lang-es", name: "Espanhol", level: "Intermediário", code: "ES" }
  ]
};

const STORAGE_KEY = "emily_portfolio_data_v15";

class PortfolioDataService {
  constructor() {
    this._localData = null;
    this._initLocalFallback();
  }

  _initLocalFallback() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this._localData = JSON.parse(stored);
      } else {
        this._localData = JSON.parse(JSON.stringify(INITIAL_PORTFOLIO_DATA));
        this._saveLocal();
      }
    } catch (e) {
      this._localData = JSON.parse(JSON.stringify(INITIAL_PORTFOLIO_DATA));
    }
  }

  _saveLocal() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._localData));
    } catch (e) {
      console.error("[DataService] Erro ao salvar local:", e);
    }
  }

  /**
   * Helper de mesclagem e deduplicação estrita:
   * Garante que cada item apareça exatamente UMA VEZ (sem duplicações).
   */
  async _fetchCollection(collectionName, fallbackList) {
    // Normaliza os itens locais padrão
    const cleanFallback = Array.isArray(fallbackList) ? fallbackList : [];

    if (!db) return cleanFallback;

    try {
      const fetchPromise = getDocs(collection(db, collectionName));
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout Firestore")), 1200)
      );
      const querySnapshot = await Promise.race([fetchPromise, timeoutPromise]);

      if (querySnapshot && !querySnapshot.empty) {
        const firestoreDocs = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (!data._deleted) {
            firestoreDocs.push({
              id: docSnap.id,
              ...data,
              category: normalizeCategory(data.category)
            });
          }
        });

        // Deduplicação estrita por chave única (id ou título normalizado)
        const uniqueMap = new Map();

        // 1. Carrega os itens padrão locais
        cleanFallback.forEach((item) => {
          const key = (item.title || item.name || item.course || item.role || item.id).trim().toLowerCase();
          uniqueMap.set(key, { ...item, category: normalizeCategory(item.category) });
        });

        // 2. Sobrescreve com as edições ou adições do Firestore
        firestoreDocs.forEach((fItem) => {
          const key = (fItem.title || fItem.name || fItem.course || fItem.role || fItem.id).trim().toLowerCase();
          uniqueMap.set(key, fItem);
        });

        return Array.from(uniqueMap.values());
      }
    } catch (err) {
      console.warn(`[DataService] Fetch ${collectionName} fallback:`, err.message);
    }

    return cleanFallback;
  }

  // --- GETTERS (Com Firestore e Fallback Estático/Local) ---

  async getProfile() {
    if (db) {
      try {
        const fetchPromise = getDocs(collection(db, "profile"));
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 1000)
        );
        const querySnapshot = await Promise.race([fetchPromise, timeoutPromise]);
        if (querySnapshot && !querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          return { ...this._localData.profile, ...docSnap.data(), id: docSnap.id };
        }
      } catch (err) {}
    }
    return this._localData.profile;
  }

  async saveProfile(profile) {
    const payload = { ...this._localData.profile, ...profile };
    if (db) {
      try {
        await setDoc(doc(db, "profile", "main_profile"), payload);
      } catch (err) {}
    }
    this._localData.profile = payload;
    this._saveLocal();
    return true;
  }

  async getSkillsCategories() {
    const raw = await this._fetchCollection("skills", this._localData.skillsCategories);
    const allowedIds = ["networking", "cybersecurity", "systems", "automation", "telemetry", "cloud_data"];

    // Limpeza em background de quaisquer documentos legados de programação no Firestore
    if (db) {
      raw.forEach(async (cat) => {
        const name = (cat.name || "").toLowerCase();
        const id = (cat.id || "").toLowerCase();
        if (
          name.includes("programação") ||
          name.includes("programacao") ||
          id.includes("dev") ||
          id.includes("programming") ||
          id.includes("prog") ||
          (!allowedIds.includes(id) && name.includes("automação"))
        ) {
          try {
            await setDoc(doc(db, "skills", cat.id), { _deleted: true }, { merge: true });
            await deleteDoc(doc(db, "skills", cat.id));
          } catch (e) {}
        }
      });
    }

    const filtered = raw.filter((cat) => {
      const name = (cat.name || "").toLowerCase();
      const id = (cat.id || "").toLowerCase();
      return (
        !name.includes("programação") &&
        !name.includes("programacao") &&
        allowedIds.includes(id)
      );
    });

    // Ordenação canônica estrita para os 6 cards
    filtered.sort((a, b) => {
      const idxA = allowedIds.indexOf((a.id || "").toLowerCase());
      const idxB = allowedIds.indexOf((b.id || "").toLowerCase());
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    return filtered.slice(0, 6);
  }

  async saveSkillCategory(cat) {
    const id = cat.id || `cat-${Date.now()}`;
    const payload = {
      name: cat.name || "",
      description: cat.description || "",
      icon: cat.icon || "network",
      skills: Array.isArray(cat.skills) ? cat.skills : [],
      _deleted: false
    };

    if (db) {
      try {
        await setDoc(doc(db, "skills", id), payload);
      } catch (err) {}
    }

    const index = this._localData.skillsCategories.findIndex((c) => c.id === id);
    if (index !== -1) {
      this._localData.skillsCategories[index] = { id, ...payload };
    } else {
      this._localData.skillsCategories.push({ id, ...payload });
    }
    this._saveLocal();
    return true;
  }

  async deleteSkillCategory(id) {
    if (db) {
      try {
        await setDoc(doc(db, "skills", id), { _deleted: true }, { merge: true });
        await deleteDoc(doc(db, "skills", id));
      } catch (err) {}
    }
    this._localData.skillsCategories = this._localData.skillsCategories.filter((c) => c.id !== id);
    this._saveLocal();
    return true;
  }

  async getEducation() {
    return this._fetchCollection("education", this._localData.education);
  }

  async saveEducation(edu) {
    const id = edu.id || `edu-${Date.now()}`;
    const payload = {
      course: edu.course || "",
      institution: edu.institution || "",
      period: edu.period || "",
      status: edu.status || "Cursando",
      notes: edu.notes || "",
      _deleted: false
    };

    if (db) {
      try {
        await setDoc(doc(db, "education", id), payload);
      } catch (err) {}
    }

    const index = this._localData.education.findIndex((e) => e.id === id);
    if (index !== -1) {
      this._localData.education[index] = { id, ...payload };
    } else {
      this._localData.education.unshift({ id, ...payload });
    }
    this._saveLocal();
    return true;
  }

  async deleteEducation(id) {
    if (db) {
      try {
        await setDoc(doc(db, "education", id), { _deleted: true }, { merge: true });
        await deleteDoc(doc(db, "education", id));
      } catch (err) {}
    }
    this._localData.education = this._localData.education.filter((e) => e.id !== id);
    this._saveLocal();
    return true;
  }

  async getLanguages() {
    return this._fetchCollection("languages", this._localData.languages);
  }

  async saveLanguage(lang) {
    const id = lang.id || `lang-${Date.now()}`;
    const payload = {
      name: lang.name || "",
      level: lang.level || "",
      code: lang.code || "EN",
      _deleted: false
    };

    if (db) {
      try {
        await setDoc(doc(db, "languages", id), payload);
      } catch (err) {}
    }

    const index = this._localData.languages.findIndex((l) => l.id === id);
    if (index !== -1) {
      this._localData.languages[index] = { id, ...payload };
    } else {
      this._localData.languages.push({ id, ...payload });
    }
    this._saveLocal();
    return true;
  }

  async deleteLanguage(id) {
    if (db) {
      try {
        await setDoc(doc(db, "languages", id), { _deleted: true }, { merge: true });
        await deleteDoc(doc(db, "languages", id));
      } catch (err) {}
    }
    this._localData.languages = this._localData.languages.filter((l) => l.id !== id);
    this._saveLocal();
    return true;
  }

  async getExperiences() {
    return this._fetchCollection("experiences", this._localData.experiences);
  }

  async getProjects() {
    return this._fetchCollection("projects", this._localData.projects);
  }

  async getCertifications() {
    return this._fetchCollection("courses", this._localData.certifications);
  }

  // --- CRUD: EXPERIÊNCIAS ---
  async saveExperience(exp) {
    const id = exp.id || `exp-${Date.now()}`;
    const payload = {
      role: exp.role || "",
      company: exp.company || "",
      location: exp.location || "",
      period: exp.period || "",
      current: Boolean(exp.current),
      description: exp.description || "",
      bullets: Array.isArray(exp.bullets) ? exp.bullets : [],
      _deleted: false
    };

    if (db) {
      try {
        await setDoc(doc(db, "experiences", id), payload);
      } catch (err) {}
    }

    const index = this._localData.experiences.findIndex((e) => e.id === id);
    if (index !== -1) {
      this._localData.experiences[index] = { id, ...payload };
    } else {
      this._localData.experiences.unshift({ id, ...payload });
    }
    this._saveLocal();
    return true;
  }

  async deleteExperience(id) {
    if (db) {
      try {
        await setDoc(doc(db, "experiences", id), { _deleted: true }, { merge: true });
        await deleteDoc(doc(db, "experiences", id));
      } catch (err) {}
    }
    this._localData.experiences = this._localData.experiences.filter((e) => e.id !== id);
    this._saveLocal();
    return true;
  }

  // --- CRUD: PROJETOS ---
  async saveProject(proj) {
    const id = proj.id || `proj-${Date.now()}`;
    const payload = {
      title: proj.title || "",
      category: proj.category || "Infraestrutura & Redes",
      description: proj.description || "",
      technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
      links: {
        demo: proj.links?.demo || "",
        github: proj.links?.github || "",
        doc: proj.links?.doc || ""
      },
      _deleted: false
    };

    if (db) {
      try {
        await setDoc(doc(db, "projects", id), payload);
      } catch (err) {}
    }

    const index = this._localData.projects.findIndex((p) => p.id === id);
    if (index !== -1) {
      this._localData.projects[index] = { id, ...payload };
    } else {
      this._localData.projects.unshift({ id, ...payload });
    }
    this._saveLocal();
    return true;
  }

  async deleteProject(id) {
    if (db) {
      try {
        await setDoc(doc(db, "projects", id), { _deleted: true }, { merge: true });
        await deleteDoc(doc(db, "projects", id));
      } catch (err) {}
    }
    this._localData.projects = this._localData.projects.filter((p) => p.id !== id);
    this._saveLocal();
    return true;
  }

  // --- CRUD: CURSOS & CERTIFICAÇÕES ---
  async saveCertification(cert) {
    const id = cert.id || `cert-${Date.now()}`;
    const payload = {
      title: cert.title || "",
      institution: cert.institution || "",
      status: cert.status || "Concluído",
      category: normalizeCategory(cert.category),
      tags: Array.isArray(cert.tags) ? cert.tags : [],
      _deleted: false
    };

    if (db) {
      try {
        await setDoc(doc(db, "courses", id), payload);
      } catch (err) {}
    }

    const index = this._localData.certifications.findIndex((c) => c.id === id);
    if (index !== -1) {
      this._localData.certifications[index] = { id, ...payload };
    } else {
      this._localData.certifications.unshift({ id, ...payload });
    }
    this._saveLocal();
    return true;
  }

  async deleteCertification(id) {
    if (db) {
      try {
        await setDoc(doc(db, "courses", id), { _deleted: true }, { merge: true });
        await deleteDoc(doc(db, "courses", id));
      } catch (err) {}
    }
    this._localData.certifications = this._localData.certifications.filter((c) => c.id !== id);
    this._saveLocal();
    return true;
  }

  // --- RESTAURAR DADOS ORIGINAIS ---
  async resetToDefaults() {
    this._localData = JSON.parse(JSON.stringify(INITIAL_PORTFOLIO_DATA));
    this._saveLocal();
    return true;
  }
}

// Instância global compatível com todo o ecossistema do app
export const portfolioDataService = new PortfolioDataService();
window.portfolioDataService = portfolioDataService;
