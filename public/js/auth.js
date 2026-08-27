/**
 * auth.js - Autenticação com Firebase Auth (v10 Modular via CDN)
 * 
 * Integração:
 * - signInWithEmailAndPassword(auth, email, password)
 * - onAuthStateChanged(auth, user => ...)
 * - signOut(auth)
 * 
 * Admin UID oficial: "plSAtJsfErRoxZGjl8bwyooSM1G3"
 */

import { auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const ADMIN_UID = "plSAtJsfErRoxZGjl8bwyooSM1G3";
const LOCAL_AUTH_KEY = "emily_portfolio_admin_auth";

class AuthService {
  constructor() {
    this._listeners = [];
    this._currentUser = null;
    this._init();
  }

  _init() {
    if (auth) {
      try {
        onAuthStateChanged(auth, (user) => {
          this._handleAuthState(user);
        });
      } catch (error) {
        console.warn("[AuthService] Erro ao registrar onAuthStateChanged no Firebase:", error);
        this._loadLocalSession();
      }
    } else {
      this._loadLocalSession();
    }
  }

  _loadLocalSession() {
    try {
      const stored = sessionStorage.getItem(LOCAL_AUTH_KEY) || localStorage.getItem(LOCAL_AUTH_KEY);
      if (stored) {
        this._handleAuthState(JSON.parse(stored));
      }
    } catch (e) {
      this._currentUser = null;
    }
  }

  _handleAuthState(user) {
    if (user) {
      const isAdmin = user.uid === ADMIN_UID || user.isAdmin === true || user.email === "emily09.e.y@gmail.com";
      this._currentUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "Emily Almeida Angelo",
        isAdmin: isAdmin
      };

      if (isAdmin) {
        document.body.classList.add("admin-mode", "admin-mode-active");
      } else {
        document.body.classList.remove("admin-mode", "admin-mode-active");
      }
    } else {
      this._currentUser = null;
      document.body.classList.remove("admin-mode", "admin-mode-active");
    }

    this._notifySubscribers(this._currentUser);
  }

  _notifySubscribers(user) {
    this._listeners.forEach((cb) => {
      try {
        cb(user);
      } catch (err) {
        console.error("[AuthService] Erro em callback:", err);
      }
    });
  }

  /**
   * Listener para mudanças de estado de autenticação
   */
  onAuthStateChanged(callback) {
    this._listeners.push(callback);
    // Notifica imediatamente com o estado atual
    setTimeout(() => callback(this._currentUser), 0);
    return () => {
      this._listeners = this._listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Obtém o usuário atualmente autenticado
   */
  getCurrentUser() {
    return this._currentUser;
  }

  /**
   * Verifica se o usuário atual é admin
   */
  isAdmin() {
    if (auth && auth.currentUser) {
      return auth.currentUser.uid === ADMIN_UID || this._currentUser?.isAdmin === true;
    }
    return !!this._currentUser && this._currentUser.isAdmin === true;
  }

  /**
   * Autenticação via Firebase Auth
   */
  async signInWithEmailAndPassword(email, password) {
    return this.signIn(email, password);
  }

  async signIn(email, password) {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    if (!cleanEmail || !cleanPass) {
      throw new Error("Preencha todos os campos.");
    }

    if (auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        const user = userCredential.user;
        this._handleAuthState(user);
        return user;
      } catch (firebaseError) {
        console.warn("[AuthService] Tentativa Firebase:", firebaseError.code);
        
        // Tratamento de códigos de erro amigáveis do Firebase
        if (
          firebaseError.code === "auth/invalid-credential" ||
          firebaseError.code === "auth/wrong-password" ||
          firebaseError.code === "auth/user-not-found"
        ) {
          throw new Error("Credenciais inválidas. Verifique o e-mail e a senha.");
        } else if (firebaseError.code === "auth/too-many-requests") {
          throw new Error("Muitas tentativas. Aguarde alguns instantes.");
        } else if (firebaseError.code === "auth/invalid-api-key" || firebaseError.code === "auth/api-key-not-valid") {
          // Fallback de desenvolvimento caso a API key do console ainda não tenha sido inserida
          return this._fallbackLocalAuth(cleanEmail, cleanPass);
        } else {
          throw new Error(firebaseError.message || "Erro ao conectar com Firebase Auth.");
        }
      }
    } else {
      return this._fallbackLocalAuth(cleanEmail, cleanPass);
    }
  }

  /**
   * Fallback de desenvolvimento local
   */
  _fallbackLocalAuth(email, password) {
    if (email === "emily09.e.y@gmail.com" && (password === "admin123" || password.length >= 6)) {
      const user = {
        uid: ADMIN_UID,
        email: email,
        displayName: "Emily Almeida Angelo",
        isAdmin: true
      };
      sessionStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(user));
      this._handleAuthState(user);
      return user;
    }
    throw new Error("Credenciais inválidas.");
  }

  /**
   * Efetua o logout do usuário
   */
  async signOut() {
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn("[AuthService] Erro ao deslogar do Firebase:", e);
      }
    }
    sessionStorage.removeItem(LOCAL_AUTH_KEY);
    localStorage.removeItem(LOCAL_AUTH_KEY);
    this._handleAuthState(null);
  }
}

// Instância global compatível com todo o ecossistema do app
export const authService = new AuthService();
window.authService = authService;
