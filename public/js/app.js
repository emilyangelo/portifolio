/**
 * app.js - Orquestrador Principal da Aplicação
 * 
 * Responsável por:
 * - Renderização 100% dinâmica de todas as seções baseadas no PortfolioDataService & Firestore
 * - Biblioteca de ícones vetoriais de alta fidelidade
 * - Controles condicionais de administração (.admin-control)
 * - Interações de UI (filtro de trilhas, navegação mobile, copy-to-clipboard)
 * - Sistema de notificações Toast
 */

(function () {
  // --- BIBLIOTECA DE ÍCONES VETORIAIS (SVG) ---
  const ICONS = {
    network: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/><rect x="9" y="16" width="6" height="6" rx="1"/><path d="M5 8v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/><path d="M12 13v3"/></svg>`,
    protocol: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/></svg>`,
    subnet: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>`,
    dns: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>`,
    switch: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 12h.01"/><path d="M10 12h.01"/><path d="M14 12h.01"/><path d="M18 12h.01"/></svg>`,
    router: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 18h.01"/><path d="M10 18h.01"/><path d="M14 18h.01"/><path d="M18 18h.01"/><path d="M6 14V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8"/></svg>`,
    cable: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    packet: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    lab: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 2v7.31"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/></svg>`,
    topology: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><line x1="9" y1="6" x2="15" y2="6"/><line x1="6" y1="9" x2="6" y2="15"/><line x1="18" y1="9" x2="18" y2="15"/><line x1="9" y1="18" x2="15" y2="18"/></svg>`,
    wireshark: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/><path d="M20 12v8H4v-8"/><path d="m4 12 8-8 8 8"/></svg>`,
    support: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`,
    helpdesk: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    hardware: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
    diagnostic: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m14.7 6.3 5 5-11.7 11.7H3v-5z"/><path d="m18 10 4-4-5-5-4 4"/></svg>`,
    windows: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 5.48L10.36 4.5v6.7H3V5.48zm0 13.04L10.36 19.5v-6.7H3v5.72zM11.64 4.32L21 3v8.2h-9.36V4.32zm0 15.36L21 21v-8.2h-9.36v6.88z"/></svg>`,
    winserver: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
    linux: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C9.5 2 8 3.5 8 6v4c-2 1-3 3-3 6 0 3.5 2.5 6 7 6s7-2.5 7-6c0-3-1-5-3-6V6c0-2.5-1.5-4-4-4zm-1.5 5c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm3 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/></svg>`,
    cli: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
    printer: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
    inventory: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg>`,
    iam: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    permission: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>`,
    ad: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    cyber: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    firewall: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v6"/><path d="M15 9v6"/><path d="M9 15v6"/></svg>`,
    acl: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
    hardening: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    lgpd: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    iso: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
    mfa: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
    sql: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
    database: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
    powerbi: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M4 14h3v8H4zm5-6h3v14H9zm5-4h3v18h-3zm5 8h3v10h-3z"/></svg>`,
    excel: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13l4 4"/><path d="M12 13l-4 4"/></svg>`,
    analytics: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`,
    python: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11.91 2C6.91 2 7.23 4.18 7.23 4.18L7.24 6.46H12V7.22H4.55S2 6.94 2 11.96c0 5.03 2.22 4.88 2.22 4.88h1.33v-1.87s-.07-2.22 2.18-2.22h3.69s2.1 0 2.1-2.07V4.28S13.88 2 11.91 2zm-2.05 1.54a.78.78 0 1 1 0 1.56.78.78 0 0 1 0-1.56zm2.23 18.46c5 0 4.68-2.18 4.68-2.18l-.01-2.28H12v-.76h7.45s2.55.28 2.55-4.74c0-5.03-2.22-4.88-2.22-4.88h-1.33v1.87s.07 2.22-2.18 2.22h-3.69s-2.1 0-2.1 2.07v6.4s-.36 2.28 1.61 2.28zm2.05-1.54a.78.78 0 1 1 0-1.56.78.78 0 0 1 0 1.56z"/></svg>`,
    logic: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    git: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M21.7 10.7l-8.4-8.4a2.4 2.4 0 0 0-3.4 0L7.5 4.7 9.8 7a2.5 2.5 0 0 1 3.2 3.2l2.3 2.3a2.5 2.5 0 1 1-1.4 1.4L11.7 11.7v5a2.5 2.5 0 1 1-2 0V11a2.5 2.5 0 0 1-1.3-3.2L6 5.5l-3.7 3.7a2.4 2.4 0 0 0 0 3.4l8.4 8.4a2.4 2.4 0 0 0 3.4 0l7.6-7.6a2.4 2.4 0 0 0 0-3.4z"/></svg>`,
    html: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M4 2l1.6 18 6.4 2 6.4-2L20 2H4zm13.3 5.4l-.2 2.3H9.4l.2 2.2h7.3l-.6 6.3-4.3 1.2-4.3-1.2-.3-3.4h2.2l.2 1.8 2.2.6 2.2-.6.3-3.3H7l-.6-7.9h10.9z"/></svg>`,
    js: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 3h18v18H3V3zm11.5 13.5c0 1.38-1.12 2.5-2.5 2.5H9v-2h3c.28 0 .5-.22.5-.5v-4.5h2v4.5zm5.5-1.5c0 2.21-1.79 4-4 4h-1v-2h1c1.1 0 2-.9 2-2s-.9-2-2-2h-1V9h4v2h-2c0 .55.45 1 1 1h1c1.1 0 2 .9 2 2z"/></svg>`,
    algo: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>`,
    ai: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>`,
    vlan: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="10" rx="2"/><circle cx="7" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="17" cy="12" r="1"/></svg>`,
    vbox: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-9 5-9-5V8l9-5 9 5v8z"/><path d="m3.3 8 8.7 5 8.7-5"/><path d="M12 13v9"/></svg>`,
    vmware: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
    qemu: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
    aws: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-1 14.5c-2.8 0-4.5-1.7-4.5-4s1.7-4 4.5-4a6.6 6.6 0 0 1 3 .7v1.8a5.2 5.2 0 0 0-3-.7c-1.8 0-2.7 1-2.7 2.2s.9 2.2 2.7 2.2a5.2 5.2 0 0 0 3-.7v1.8a6.6 6.6 0 0 1-3 .7z"/></svg>`,
    server: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
    externalLink: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`
  };

  function resolveSkillIcon(skillName, defaultIcon = "network") {
    if (!skillName) return ICONS[defaultIcon] || ICONS.network;
    const s = String(skillName).toLowerCase().trim();

    if (s.includes("python")) return ICONS.python;
    if (s.includes("git")) return ICONS.git;
    if (s.includes("html") || s.includes("css")) return ICONS.html;
    if (s.includes("javascript") || s.includes("js")) return ICONS.js;
    if (s.includes("algoritmo")) return ICONS.algo;
    if (s.includes("lógica") || s.includes("logica")) return ICONS.logic;
    if (s.includes("prompt") || s.includes("ia") || s.includes("ai") || s.includes("inteligência") || s.includes("inteligencia")) return ICONS.ai;
    if (s.includes("sql") || s.includes("banco de dados") || s.includes("database")) return ICONS.sql;
    if (s.includes("power bi") || s.includes("powerbi")) return ICONS.powerbi;
    if (s.includes("excel")) return ICONS.excel;
    if (s.includes("análise") || s.includes("analise") || s.includes("analytics")) return ICONS.analytics;
    if (s.includes("tcp") || s.includes("ip") || s.includes("protocolo")) return ICONS.protocol;
    if (s.includes("subnet") || s.includes("cidr") || s.includes("sub-rede")) return ICONS.subnet;
    if (s.includes("dns") || s.includes("dhcp")) return ICONS.dns;
    if (s.includes("vlan")) return ICONS.vlan;
    if (s.includes("switch")) return ICONS.switch;
    if (s.includes("router") || s.includes("roteamento") || s.includes("routing")) return ICONS.router;
    if (s.includes("topologia")) return ICONS.topology;
    if (s.includes("eve-ng") || s.includes("gns3") || s.includes("lab")) return ICONS.lab;
    if (s.includes("packet tracer") || s.includes("packet")) return ICONS.packet;
    if (s.includes("wireshark")) return ICONS.wireshark;
    if (s.includes("cabeamento") || s.includes("cable")) return ICONS.cable;
    if (s.includes("iam") || s.includes("identidade") || s.includes("acesso")) return ICONS.iam;
    if (s.includes("permissão") || s.includes("permissao") || s.includes("privilégio")) return ICONS.permission;
    if (s.includes("active directory") || s.includes("ad")) return ICONS.ad;
    if (s.includes("cyber") || s.includes("cibersegurança") || s.includes("segurança")) return ICONS.cyber;
    if (s.includes("firewall")) return ICONS.firewall;
    if (s.includes("acl")) return ICONS.acl;
    if (s.includes("hardening")) return ICONS.hardening;
    if (s.includes("lgpd") || s.includes("privacidade")) return ICONS.lgpd;
    if (s.includes("iso")) return ICONS.iso;
    if (s.includes("mfa") || s.includes("senha")) return ICONS.mfa;
    if (s.includes("windows server") || s.includes("winserver")) return ICONS.winserver;
    if (s.includes("windows")) return ICONS.windows;
    if (s.includes("linux") || s.includes("debian") || s.includes("ubuntu")) return ICONS.linux;
    if (s.includes("terminal") || s.includes("cli") || s.includes("bash")) return ICONS.cli;
    if (s.includes("impressora") || s.includes("printer")) return ICONS.printer;
    if (s.includes("inventário") || s.includes("inventario") || s.includes("ativo")) return ICONS.inventory;
    if (s.includes("suporte") || s.includes("helpdesk")) return ICONS.support;
    if (s.includes("hardware") || s.includes("manutenção") || s.includes("manutencao")) return ICONS.hardware;
    if (s.includes("diagnóstico") || s.includes("diagnostico")) return ICONS.diagnostic;
    if (s.includes("virtualbox") || s.includes("vbox")) return ICONS.vbox;
    if (s.includes("vmware")) return ICONS.vmware;
    if (s.includes("qemu")) return ICONS.qemu;
    if (s.includes("aws") || s.includes("cloud")) return ICONS.aws;

    return ICONS[defaultIcon] || ICONS.network;
  }

  function getIcon(key) {
    return ICONS[key] || ICONS.network;
  }

  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- RENDERIZAÇÃO DAS SEÇÕES ---

  async function renderProfile() {
    const profile = await window.portfolioDataService.getProfile();
    if (!profile) return;

    const heroName = document.getElementById("hero-name");
    const heroRole = document.getElementById("hero-role");
    const heroSummary = document.getElementById("hero-summary");
    const contactEmail = document.getElementById("contact-email-text");

    if (heroName) heroName.textContent = profile.name;
    if (heroRole) heroRole.textContent = profile.role;
    if (heroSummary) heroSummary.textContent = profile.summary;
    if (contactEmail) contactEmail.textContent = profile.email;
  }

  async function renderSkills() {
    const container = document.getElementById("skills-container") || document.getElementById("skills-stack-container");
    if (!container) return;

    const categories = await window.portfolioDataService.getSkillsCategories();
    container.innerHTML = "";

    categories.forEach((cat, index) => {
      const layerCard = document.createElement("div");
      layerCard.className = "stack-layer-card card-elevated";

      const skillsList = Array.isArray(cat.skills) ? cat.skills : [];
      const pillsHtml = skillsList
        .map(
          (skill) => {
            const skillName = typeof skill === "object" ? (skill.name || "") : String(skill);
            const iconKey = typeof skill === "object" ? (skill.icon || cat.icon) : cat.icon;
            const iconSvg = resolveSkillIcon(skillName, iconKey);
            return `
              <div class="protocol-chip">
                <span class="protocol-icon">${iconSvg}</span>
                <span class="protocol-name">${escapeHtml(skillName)}</span>
              </div>
            `;
          }
        )
        .join("");

      layerCard.innerHTML = `
        <div class="stack-layer-header">
          <div class="layer-meta">
            <span class="layer-num-badge">LAYER 0${index + 1}</span>
            <h3 class="layer-title">${escapeHtml(cat.name)}</h3>
          </div>
          <div class="layer-header-right">
            <span class="layer-status-tag">● Ativo / Produção</span>
            <div class="card-admin-actions admin-control">
              <button type="button" class="btn-admin-icon edit-btn" onclick="window.adminController.openCrudModal('skillCategory', '${cat.id}')">
                ${ICONS.edit} Editar
              </button>
              <button type="button" class="btn-admin-icon delete-btn" onclick="window.adminController.deleteItem('skillCategory', '${cat.id}')">
                ${ICONS.trash} Excluir
              </button>
            </div>
          </div>
        </div>
        <p class="layer-description">${escapeHtml(cat.description)}</p>
        <div class="protocols-grid">
          ${pillsHtml}
        </div>
      `;

      container.appendChild(layerCard);
    });
  }

  async function renderExperiences() {
    const container = document.getElementById("experience-container") || document.getElementById("experience-timeline");
    if (!container) return;

    const experiences = await window.portfolioDataService.getExperiences();
    container.innerHTML = "";

    if (!experiences.length) {
      container.innerHTML = `<div class="empty-state-box">Nenhuma experiência cadastrada.</div>`;
      return;
    }

    experiences.forEach((exp) => {
      const card = document.createElement("div");
      card.className = "runbook-experience-card card-elevated";

      const adminActions = `
        <div class="card-admin-actions admin-control">
          <button type="button" class="btn-admin-icon edit-btn" onclick="window.adminController.openCrudModal('experience', '${exp.id}')">
            ${ICONS.edit} Editar
          </button>
          <button type="button" class="btn-admin-icon delete-btn" onclick="window.adminController.deleteItem('experience', '${exp.id}')">
            ${ICONS.trash} Excluir
          </button>
        </div>
      `;

      if (exp.company && exp.company.includes("CAS")) {
        card.innerHTML = `
          <div class="runbook-header">
            <div>
              <div class="runbook-role-row">
                <span class="runbook-role-title">${escapeHtml(exp.role)}</span>
                <span class="runbook-company-name">${escapeHtml(exp.company)}</span>
                <span class="status-badge live-badge">● Posição Atual</span>
              </div>
              <div class="runbook-subinfo">${escapeHtml(exp.location)} • ${escapeHtml(exp.period)}</div>
            </div>
          </div>

          <p class="runbook-summary-text">${escapeHtml(exp.description)}</p>

          <div class="runbook-pillars-grid">
            <div class="runbook-pillar-item">
              <div class="pillar-header">
                <span class="pillar-icon">${ICONS.iam}</span>
                <strong>IAM & Gestão de Identidades</strong>
              </div>
              <ul class="pillar-bullets">
                <li>Gestão de contas corporativas, permissões e acessos de usuários (IAM).</li>
                <li>Aplicação de políticas de segurança, privilégios e auditoria de credenciais.</li>
              </ul>
            </div>

            <div class="runbook-pillar-item">
              <div class="pillar-header">
                <span class="pillar-icon">${ICONS.network}</span>
                <strong>Infraestrutura Física & Rede</strong>
              </div>
              <ul class="pillar-bullets">
                <li>Apoio e manutenção em switches corporativos e cabeamento estruturado.</li>
                <li>Controle, catalogação e inventário de ativos de tecnologia da informação.</li>
              </ul>
            </div>

            <div class="runbook-pillar-item">
              <div class="pillar-header">
                <span class="pillar-icon">${ICONS.support}</span>
                <strong>Sustentação & Suporte Técnico</strong>
              </div>
              <ul class="pillar-bullets">
                <li>Atendimento e diagnóstico técnico a usuários presenciais e remotos.</li>
                <li>Instalação e configuração de SOs (Windows/Linux), ERPs, periféricos e impressoras.</li>
              </ul>
            </div>
          </div>

          ${adminActions}
        `;
      } else {
        const bulletsHtml =
          exp.bullets && exp.bullets.length
            ? `<ul class="experience-bullets">${exp.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`
            : "";

        card.innerHTML = `
          <div class="runbook-header">
            <div>
              <div class="runbook-role-row">
                <span class="runbook-role-title">${escapeHtml(exp.role)}</span>
                <span class="runbook-company-name">${escapeHtml(exp.company)}</span>
              </div>
              <div class="runbook-subinfo">${escapeHtml(exp.location)} • ${escapeHtml(exp.period)}</div>
            </div>
          </div>
          <p class="runbook-summary-text">${escapeHtml(exp.description)}</p>
          ${bulletsHtml}
          ${adminActions}
        `;
      }

      container.appendChild(card);
    });
  }

  async function renderProjects() {
    const container = document.getElementById("projects-container") || document.getElementById("projects-grid");
    if (!container) return;

    const projects = await window.portfolioDataService.getProjects();
    container.innerHTML = "";

    if (!projects.length) {
      container.innerHTML = `<div class="empty-state-box">Nenhum projeto cadastrado.</div>`;
      return;
    }

    projects.forEach((proj) => {
      const card = document.createElement("div");
      card.className = "project-card card-elevated";

      const techsHtml =
        proj.technologies && proj.technologies.length
          ? `<div class="project-tags">${proj.technologies.map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`).join("")}</div>`
          : "";

      const linkButtons = [];
      if (proj.links && proj.links.demo && proj.links.demo.trim()) {
        linkButtons.push(`
          <a href="${escapeHtml(proj.links.demo)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
            ${ICONS.externalLink} Acessar Projeto
          </a>
        `);
      }
      if (proj.links && proj.links.github && proj.links.github.trim()) {
        linkButtons.push(`
          <a href="${escapeHtml(proj.links.github)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
            ${ICONS.git} Repositório
          </a>
        `);
      }
      if (proj.links && proj.links.doc && proj.links.doc.trim()) {
        linkButtons.push(`
          <a href="${escapeHtml(proj.links.doc)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
            📄 Documentação
          </a>
        `);
      }

      const linksSectionHtml =
        linkButtons.length > 0
          ? `<div class="project-links-bar">${linkButtons.join("")}</div>`
          : `
          <div class="project-links-bar">
            <span class="project-link-slot">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Link do projeto em preparação
            </span>
          </div>
        `;

      const adminActions = `
        <div class="card-admin-actions admin-control">
          <button type="button" class="btn-admin-icon edit-btn" onclick="window.adminController.openCrudModal('project', '${proj.id}')">
            ${ICONS.edit} Editar / Links
          </button>
          <button type="button" class="btn-admin-icon delete-btn" onclick="window.adminController.deleteItem('project', '${proj.id}')">
            ${ICONS.trash} Excluir
          </button>
        </div>
      `;

      card.innerHTML = `
        <div class="project-card-header">
          <span class="project-category-badge">${escapeHtml(proj.category || 'Projeto')}</span>
          <div class="project-status-dot"></div>
        </div>
        <h3 class="project-title">${escapeHtml(proj.title)}</h3>
        <p class="project-desc">${escapeHtml(proj.description)}</p>
        ${techsHtml}
        ${linksSectionHtml}
        ${adminActions}
      `;

      container.appendChild(card);
    });
  }

  let currentCertTrack = "all";

  async function renderEducationAndCertifications(activeTrack = "all") {
    currentCertTrack = activeTrack;

    // 1. Formação Acadêmica Principal
    const eduContainer = document.getElementById("education-container") || document.getElementById("education-grid");
    if (eduContainer) {
      const education = await window.portfolioDataService.getEducation();
      eduContainer.innerHTML = "";
      education.forEach((edu) => {
        eduContainer.innerHTML = `
          <div class="academic-card-header">
            <div class="academic-kicker-group">
              <span class="academic-kicker">ENSINO SUPERIOR</span>
              <span class="prouni-badge">★ Bolsista Integral ProUni</span>
            </div>
            <span class="academic-status-tag">${escapeHtml(edu.period)} (${escapeHtml(edu.status)})</span>
          </div>

          <h3 class="academic-course-title">${escapeHtml(edu.course)}</h3>
          <div class="academic-institution">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            ${escapeHtml(edu.institution)}
          </div>
          
          <p class="academic-notes">${escapeHtml(edu.notes)}</p>

          <div class="academic-curriculum-tags">
            <span class="curriculum-tag">Redes de Computadores</span>
            <span class="curriculum-tag">Sistemas Operacionais</span>
            <span class="curriculum-tag">Bancos de Dados Relacionais</span>
            <span class="curriculum-tag">Engenharia de Software</span>
            <span class="curriculum-tag">Programação & Algoritmos</span>
          </div>

          <div class="card-admin-actions admin-control">
            <button type="button" class="btn-admin-icon edit-btn" onclick="window.adminController.openCrudModal('education', '${edu.id}')">
              ${ICONS.edit} Editar
            </button>
            <button type="button" class="btn-admin-icon delete-btn" onclick="window.adminController.deleteItem('education', '${edu.id}')">
              ${ICONS.trash} Excluir
            </button>
          </div>
        `;
      });
    }

    // 2. Idiomas & Comunicação
    const langContainer = document.getElementById("languages-container");
    if (langContainer) {
      const languages = await window.portfolioDataService.getLanguages();
      langContainer.innerHTML = languages
        .map(
          (l) => `
        <div class="language-telemetry-row">
          <div class="lang-header">
            <span class="lang-code-tag">${escapeHtml(l.code || 'LANG')}</span>
            <strong class="lang-title">${escapeHtml(l.name)}</strong>
          </div>
          <span class="lang-level-badge">${escapeHtml(l.level)}</span>
          <div class="card-admin-actions admin-control" style="margin-top:0.25rem;">
            <button type="button" class="btn-admin-icon edit-btn" onclick="window.adminController.openCrudModal('language', '${l.id}')">
              ${ICONS.edit}
            </button>
            <button type="button" class="btn-admin-icon delete-btn" onclick="window.adminController.deleteItem('language', '${l.id}')">
              ${ICONS.trash}
            </button>
          </div>
        </div>
      `
        )
        .join("");
    }

    // 3. Cursos & Certificações Especializadas
    const certContainer = document.getElementById("courses-container") || document.getElementById("certifications-grid");
    if (certContainer) {
      const certifications = await window.portfolioDataService.getCertifications();
      certContainer.innerHTML = "";

      const countBadge = document.querySelector(".cert-count-badge");
      if (countBadge) {
        countBadge.textContent = `${certifications.length} Especializações`;
      }

      const filteredCerts = certifications.filter((cert) => {
        if (!activeTrack || activeTrack === "all") return true;
        const cat = (cert.category || "").toLowerCase().trim();
        if (activeTrack === "networks") {
          return cat === "networks" || cat.includes("rede") || cat.includes("cloud") || cat.includes("cisco");
        }
        if (activeTrack === "dev") {
          return cat === "dev" || cat.includes("prog") || cat.includes("web") || cat.includes("software") || cat.includes("python");
        }
        if (activeTrack === "data-ai") {
          return cat === "data-ai" || cat.includes("dado") || cat.includes("ia") || cat.includes("data") || cat.includes("prompt");
        }
        return cat === activeTrack;
      });

      if (!filteredCerts.length) {
        certContainer.innerHTML = `<div class="empty-state-box">Nenhuma certificação cadastrada nesta trilha.</div>`;
        return;
      }

      filteredCerts.forEach((cert) => {
        const card = document.createElement("div");
        card.className = "certification-dynamic-card card-elevated";

        const isConcluido = cert.status === "Concluído";
        const tagsHtml =
          cert.tags && cert.tags.length
            ? `<div class="cert-tags-row">${cert.tags.map((t) => `<span class="cert-tag-chip">${escapeHtml(t)}</span>`).join("")}</div>`
            : "";

        let providerTag = "SENAI";
        if (cert.institution.includes("Cisco")) providerTag = "CISCO / SENAI";
        else if (cert.institution.includes("USP")) providerTag = "USP";
        else if (cert.institution.includes("AWS")) providerTag = "AWS / SANTANDER";

        card.innerHTML = `
          <div class="cert-top-meta">
            <span class="cert-provider-badge">${escapeHtml(providerTag)}</span>
            <span class="cert-status-pill ${isConcluido ? 'status-completed' : 'status-ongoing'}">
              ${isConcluido ? '● Concluído' : '○ Em andamento'}
            </span>
          </div>
          <h4 class="cert-dynamic-title">${escapeHtml(cert.title)}</h4>
          <div class="cert-dynamic-inst">${escapeHtml(cert.institution)}</div>
          ${tagsHtml}
          <div class="card-admin-actions admin-control">
            <button type="button" class="btn-admin-icon edit-btn" onclick="window.adminController.openCrudModal('certification', '${cert.id}')">
              ${ICONS.edit} Editar
            </button>
            <button type="button" class="btn-admin-icon delete-btn" onclick="window.adminController.deleteItem('certification', '${cert.id}')">
              ${ICONS.trash} Excluir
            </button>
          </div>
        `;
        certContainer.appendChild(card);
      });
    }
  }

  // --- RE-RENDERIZAÇÃO GLOBAL ---
  window.renderAllSections = async function () {
    await renderProfile();
    await renderSkills();
    await renderExperiences();
    await renderProjects();
    await renderEducationAndCertifications(currentCertTrack);
  };

  // --- NOTIFICAÇÕES TOAST ---
  window.showToast = function (message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-indicator"></div>
      <div class="toast-message">${escapeHtml(message)}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-show");
    }, 10);

    setTimeout(() => {
      toast.classList.remove("toast-show");
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // --- RELÓGIO DE TELEMETRIA AO VIVO ---
  function initTelemetryClock() {
    const timeEl = document.getElementById("telemetry-time");
    if (!timeEl) return;

    function update() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      timeEl.textContent = `${hours}:${minutes}:${seconds}`;
    }

    update();
    setInterval(update, 1000);
  }

  // Inicialização segura para ES Modules
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }

  async function initApp() {
    initTelemetryClock();
    await window.renderAllSections();

    // Filtros de Trilhas de Certificações (com delegação robusta)
    const certFiltersContainer = document.querySelector(".cert-track-filters");
    if (certFiltersContainer) {
      certFiltersContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".cert-filter-btn");
        if (!btn) return;
        certFiltersContainer.querySelectorAll(".cert-filter-btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const track = btn.getAttribute("data-track") || "all";
        renderEducationAndCertifications(track);
      });
    }

    // Copiar E-mail para Área de Transferência
    const copyEmailBtn = document.getElementById("btn-copy-email");
    if (copyEmailBtn) {
      copyEmailBtn.addEventListener("click", () => {
        const email = "emily09.e.y@gmail.com";
        navigator.clipboard
          .writeText(email)
          .then(() => {
            window.showToast("E-mail copiado para a área de transferência!", "success");
            copyEmailBtn.classList.add("copied");
            setTimeout(() => copyEmailBtn.classList.remove("copied"), 2000);
          })
          .catch(() => {
            window.showToast("Não foi possível copiar automaticamente.", "warning");
          });
      });
    }

    // Menu Mobile Toggle
    const mobileMenuBtn = document.getElementById("mobile-menu-toggle");
    const navLinks = document.getElementById("nav-links");
    if (mobileMenuBtn && navLinks) {
      mobileMenuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("mobile-open");
        const isOpen = navLinks.classList.contains("mobile-open");
        mobileMenuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });

      // Fechar menu mobile ao clicar em um link
      navLinks.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
          navLinks.classList.remove("mobile-open");
          mobileMenuBtn.setAttribute("aria-expanded", "false");
        });
      });
    }
  }
})();
