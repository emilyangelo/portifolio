/**
 * firebase-config.js - Configuração e Inicialização do Firebase Web SDK v10 Modular
 * 
 * Projeto: portfolioemilyangelo
 * Módulos via CDN: firebase-app, firebase-auth, firebase-firestore
 */
/*
 * firebase-config.js - Configuração e Inicialização do Firebase Web SDK v10 Modular
 * Projeto: portifolioemilyangelo
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuração do projeto Firebase com suas credenciais reais
export const firebaseConfig = {
  apiKey: "AIzaSyDoEkjqS4JD8hGycVdCZsnufedBwR2duwM",
  authDomain: "portifolioemilyangelo.firebaseapp.com",
  projectId: "portifolioemilyangelo",
  storageBucket: "portifolioemilyangelo.firebasestorage.app",
  messagingSenderId: "446144599410",
  appId: "1:446144599410:web:4539c01f37cd56f22fb9eb",
  measurementId: "G-ZNLF1210P0"
};

let appInstance = null;
let authInstance = null;
let dbInstance = null;

try {
  appInstance = initializeApp(firebaseConfig);
  authInstance = getAuth(appInstance);
  dbInstance = getFirestore(appInstance);
} catch (error) {
  console.warn("[Firebase] Inicialização:", error.message);
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;

// Exposição global para intercompatibilidade
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;