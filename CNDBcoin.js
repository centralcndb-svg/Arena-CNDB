/* =========================================================
   ARENA CNDB - CNDBcoin & CNDBbet
   Login + Cadastro + Perfil
   ========================================================= */

(function () {
  "use strict";

  /* =========================================================
     CONFIGURAÇÃO OFICIAL FIREBASE - ARENA CNDB
     ========================================================= */

  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyBAj0HK2Dq4lE5tHgZfiC-7XbxfiN5H05w",
    authDomain: "arena-cndb.firebaseapp.com",
    projectId: "arena-cndb",
    storageBucket: "arena-cndb.firebasestorage.app",
    messagingSenderId: "799022193573",
    appId: "1:799022193573:web:65724effdb80f2d3afe64c",
    measurementId: "G-NM9G4GSXBH"
  };

  var firebaseReady = false;
  var auth = null;
  var db = null;

  /* =========================================================
     UTILIDADES
     ========================================================= */

  function carregarScript(src) {
    return new Promise(function (resolve, reject) {
      var existente = document.querySelector('script[src="' + src + '"]');

      if (existente) {
        resolve();
        return;
      }

      var script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = function () {
        reject(new Error("Não foi possível carregar: " + src));
      };

      document.head.appendChild(script);
    });
  }

  function escaparHTML(texto) {
    return String(texto || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function limparInstagram(instagram) {
    return String(instagram || "")
      .trim()
      .replace(/^@+/, "");
  }

  function mostrarMensagem(texto, tipo) {
    var box = document.getElementById("cndbcoin-msg");

    if (!box) return;

    box.textContent = texto;
    box.style.display = "block";
    box.style.whiteSpace = "pre-wrap";

    if (tipo === "erro") {
      box.style.background = "#3a1118";
      box.style.borderColor = "#ff365f";
      box.style.color = "#ffd9e0";
    } else {
      box.style.background = "#102d1d";
      box.style.borderColor = "#43d17a";
      box.style.color = "#d7ffe5";
    }
  }

  function limparMensagem() {
    var box = document.getElementById("cndbcoin-msg");

    if (box) {
      box.textContent = "";
      box.style.display = "none";
    }
  }

  /* =========================================================
     FIREBASE
     ========================================================= */

  async function iniciarFirebase() {
    if (firebaseReady) {
      return true;
    }

    try {
      if (!window.firebase) {
        await carregarScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
      }

      if (!firebase.auth) {
        await carregarScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js");
      }

      if (!firebase.firestore) {
        await carregarScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js");
      }

      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }

      auth = firebase.auth();
      db = firebase.firestore();

      firebaseReady = true;

      console.log("CNDBcoin: Firebase iniciado com sucesso.");
      return true;

    } catch (erro) {
      console.error("CNDBcoin: erro ao iniciar Firebase:", erro);
      return false;
    }
  }

  /* =========================================================
     CSS (ESTILOS DA INTERFACE)
     ========================================================= */

  function criarEstilo() {
    if (document.getElementById("cndbcoin-style")) {
      return;
    }

    var style = document.createElement("style");
    style.id = "cndbcoin-style";

    style.textContent = `
      #cndbcoin-open {
        position: fixed;
        right: 22px;
        bottom: 82px;
        z-index: 9998;
        border: 1px solid rgba(255,183,3,.3);
        border-radius: 999px;
        padding: 14px 22px;
        background: #0d1b2a;
        color: #ffb703;
        font-family: 'Teko', sans-serif;
        letter-spacing: 1px;
        font-weight: 700;
        font-size: 1.3em;
        cursor: pointer;
        box-shadow: 0 10px 30px rgba(0,0,0,.6);
        transition: all 0.25s ease;
      }

      #cndbcoin-open:hover {
        background: #ffb703;
        color: #050a0f;
        transform: translateY(-2px);
        box-shadow: 0 0 20px rgba(255,183,3,0.4);
      }

      #cndbcoin-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(5,10,15,.9);
        display: none;
        align-items: center;
        justify-content: center;
        padding: 18px;
        overflow-y: auto;
        box-sizing: border-box;
      }

      #cndbcoin-box {
        width: 100%;
        max-width: 590px;
        background: #09131d;
        border: 1px solid #ffb703;
        border-radius: 16px;
        padding: 34px;
        box-sizing: border-box;
        color: #f0f4f8;
        box-shadow: 0 25px 80px rgba(0,0,0,.8);
        position: relative;
        font-family: 'Rajdhani', sans-serif;
      }

      #cndbcoin-close {
        position: absolute;
        right: 20px;
        top: 20px;
        width: 45px;
        height: 45px;
        border: 1px solid #1b2a3a;
        background: #0d1b2a;
        color: #ff2a5f;
        font-size: 24px;
        cursor: pointer;
        border-radius: 8px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #cndbcoin-close:hover {
        background: #ff2a5f;
        color: #fff;
      }

      #cndbcoin-title {
        font-family: 'Teko', sans-serif;
        font-size: 2.5em;
        color: #ffb703;
        margin: 0 0 24px 0;
        line-height: 1.1;
        letter-spacing: 1px;
        border-bottom: 1px solid #1b2a3a;
        padding-bottom: 10px;
      }

      .cndbcoin-input {
        display: block;
        width: 100%;
        box-sizing: border-box;
        padding: 14px 16px;
        margin: 0 0 16px;
        border: 1px solid #1b2a3a;
        border-radius: 8px;
        background: #050a0f;
        color: #fff;
        font-size: 1.1em;
        outline: none;
        font-family: 'Rajdhani', sans-serif;
      }

      .cndbcoin-input:focus {
        border-color: #ffb703;
        box-shadow: 0 0 10px rgba(255,183,3,.2);
      }

      .cndbcoin-btn {
        border: 0;
        border-radius: 8px;
        padding: 12px 20px;
        font-size: 1.2em;
        font-family: 'Teko', sans-serif;
        letter-spacing: 1px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
      }

      .cndbcoin-btn:disabled {
        opacity: .65;
        cursor: not-allowed;
      }

      .cndbcoin-btn-primary {
        background: #ffb703;
        color: #050a0f;
      }

      .cndbcoin-btn-primary:hover {
        background: #ffa200;
        box-shadow: 0 0 15px rgba(255,183,3,0.4);
      }

      .cndbcoin-btn-secondary {
        background: #1b2a3a;
        color: #f0f4f8;
        border: 1px solid #2a3b4c;
      }

      .cndbcoin-btn-secondary:hover {
        background: #25384d;
        color: #ffb703;
      }

      .cndbcoin-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 10px;
      }

      #cndbcoin-msg {
        display: none;
        padding: 12px;
        border: 1px solid;
        border-radius: 8px;
        margin: 0 0 16px;
        line-height: 1.4;
        word-break: break-word;
      }

      .cndbcoin-link {
        color: #ffb703;
        cursor: pointer;
        font-weight: bold;
        text-decoration: underline;
      }

      .cndbcoin-small {
        color: #8a99ad;
        margin-top: 18px;
        line-height: 1.5;
        font-size: 1em;
      }

      .cndbcoin-profile {
        background: #0d1b2a;
        border: 1px solid #1b2a3a;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
      }

      .cndbcoin-profile-name {
        font-family: 'Teko', sans-serif;
        font-size: 2em;
        color: #ffb703;
        margin-bottom: 10px;
        line-height: 1;
      }

      .cndbcoin-profile-line {
        color: #d1dbe5;
        margin-top: 8px;
        word-break: break-word;
        font-size: 1.1em;
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     INTERFACE HTML
     ========================================================= */

  function criarInterface() {
    if (!document.getElementById("cndbcoin-open")) {
      var botao = document.createElement("button");
      botao.id = "cndbcoin-open";
      botao.type = "button";
      botao.innerHTML = "🎲 CNDBbet / 🪙 Conta";

      botao.addEventListener("click", abrirCNDBcoin);
      document.body.appendChild(botao);
    }

    if (!document.getElementById("cndbcoin-overlay")) {
      var overlay = document.createElement("div");
      overlay.id = "cndbcoin-overlay";

      overlay.innerHTML = `
        <div id="cndbcoin-box">
          <button id="cndbcoin-close" type="button">×</button>
          <div id="cndbcoin-title">🪙 Minha Conta &amp; CNDBbet</div>
          <div id="cndbcoin-msg"></div>
          <div id="cndbcoin-content"></div>
        </div>
      `;

      document.body.appendChild(overlay);

      document.getElementById("cndbcoin-close").addEventListener("click", fecharCNDBcoin);

      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
          fecharCNDBcoin();
        }
      });
    }
  }

  function abrirCNDBcoin() {
    var overlay = document.getElementById("cndbcoin-overlay");
    if (!overlay) return;

    overlay.style.display = "flex";
    limparMensagem();

    iniciarFirebase().then(function (ok) {
      if (!ok) {
        mostrarMensagem("Não foi possível conectar ao sistema da Arena CNDB.", "erro");
        return;
      }
      verificarSessao();
    });
  }

  function fecharCNDBcoin() {
    var overlay = document.getElementById("cndbcoin-overlay");
    if (overlay) {
      overlay.style.display = "none";
    }
  }

  /* =========================================================
     TELA DE LOGIN
     ========================================================= */

  function telaLogin() {
    limparMensagem();
    var content = document.getElementById("cndbcoin-content");

    content.innerHTML = `
      <input id="cndb-login-email" class="cndbcoin-input" type="email" placeholder="E-mail" autocomplete="email"/>
      <input id="cndb-login-senha" class="cndbcoin-input" type="password" placeholder="Senha" autocomplete="current-password"/>

      <div class="cndbcoin-actions">
        <button id="cndb-login-btn" class="cndbcoin-btn cndbcoin-btn-primary" type="button">Entrar</button>
        <button id="cndb-cadastro-btn" class="cndbcoin-btn cndbcoin-btn-secondary" type="button">Criar minha conta</button>
      </div>

      <div class="cndbcoin-small">
        Ainda não participa da Arena? 
        <span id="cndb-cadastro-link" class="cndbcoin-link">Cadastre-se</span>
      </div>
    `;

    document.getElementById("cndb-login-btn").addEventListener("click", fazerLogin);
    document.getElementById("cndb-cadastro-btn").addEventListener("click", telaCadastro);
    document.getElementById("cndb-cadastro-link").addEventListener("click", telaCadastro);
  }

  async function fazerLogin() {
    limparMensagem();

    var email = document.getElementById("cndb-login-email").value.trim().toLowerCase();
    var senha = document.getElementById("cndb-login-senha").value;

    if (!email || !senha) {
      mostrarMensagem("Informe o e-mail e a senha.", "erro");
      return;
    }

    var botao = document.getElementById("cndb-login-btn");
    botao.disabled = true;
    botao.textContent = "Entrando...";

    try {
      await auth.signInWithEmailAndPassword(email, senha);
      mostrarMensagem("✅ Login realizado com sucesso!");

      setTimeout(function () {
        verificarSessao();
      }, 500);

    } catch (erro) {
      console.error("CNDBcoin: erro no login:", erro);
      mostrarMensagem(traduzirErroFirebase(erro), "erro");
    } finally {
      botao.disabled = false;
      botao.textContent = "Entrar";
    }
  }

  /* =========================================================
     TELA DE CADASTRO
     ========================================================= */

  function telaCadastro() {
    limparMensagem();
    var content = document.getElementById("cndbcoin-content");

    content.innerHTML = `
      <input id="cndb-cadastro-nome" class="cndbcoin-input" type="text" placeholder="Nome ou apelido" maxlength="60"/>
      <input id="cndb-cadastro-instagram" class="cndbcoin-input" type="text" placeholder="@Instagram" maxlength="50"/>
      <input id="cndb-cadastro-email" class="cndbcoin-input" type="email" placeholder="E-mail" autocomplete="email"/>
      <input id="cndb-cadastro-senha" class="cndbcoin-input" type="password" placeholder="Senha (mín. 6 caracteres)" autocomplete="new-password"/>
      <input id="cndb-cadastro-confirmar" class="cndbcoin-input" type="password" placeholder="Confirmar senha" autocomplete="new-password"/>

      <div class="cndbcoin-actions">
        <button id="cndb-criar-conta" class="cndbcoin-btn cndbcoin-btn-primary" type="button">CRIAR CONTA</button>
        <button id="cndb-voltar-login" class="cndbcoin-btn cndbcoin-btn-secondary" type="button">Voltar</button>
      </div>

      <div class="cndbcoin-small">Sua conta será vinculada à Arena CNDB.</div>
    `;

    document.getElementById("cndb-criar-conta").addEventListener("click", criarConta);
    document.getElementById("cndb-voltar-login").addEventListener("click", telaLogin);
  }

  async function criarConta() {
    limparMensagem();

    var nome = document.getElementById("cndb-cadastro-nome").value.trim();
    var instagram = limparInstagram(document.getElementById("cndb-cadastro-instagram").value);
    var email = document.getElementById("cndb-cadastro-email").value.trim().toLowerCase();
    var senha = document.getElementById("cndb-cadastro-senha").value;
    var confirmar = document.getElementById("cndb-cadastro-confirmar").value;

    if (!nome) {
      mostrarMensagem("Informe seu nome ou apelido.", "erro");
      return;
    }
    if (!instagram) {
      mostrarMensagem("Informe seu @Instagram.", "erro");
      return;
    }
    if (!email) {
      mostrarMensagem("Informe seu e-mail.", "erro");
      return;
    }
    if (senha.length < 6) {
      mostrarMensagem("A senha precisa ter pelo menos 6 caracteres.", "erro");
      return;
    }
    if (senha !== confirmar) {
      mostrarMensagem("As duas senhas não são iguais.", "erro");
      return;
    }

    var botao = document.getElementById("cndb-criar-conta");
    botao.disabled = true;
    botao.textContent = "CRIANDO...";

    try {
      var credencial = await auth.createUserWithEmailAndPassword(email, senha);
      var usuario = credencial.user;

      if (!usuario) {
        throw new Error("Authentication não retornou o usuário.");
      }

      await usuario.updateProfile({ displayName: nome });

      await db.collection("users").doc(usuario.uid).set({
        uid: usuario.uid,
        name: nome,
        displayName: nome,
        instagram: instagram,
        email: usuario.email,
        photoURL: "",
        accountType: "user",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      mostrarMensagem("✅ Conta Arena CNDB criada com sucesso!");

      setTimeout(function () {
        telaPerfil(usuario);
      }, 900);

    } catch (erro) {
      console.error("CNDBcoin: erro no cadastro:", erro);
      mostrarMensagem(traduzirErroFirebase(erro), "erro");
    } finally {
      botao.disabled = false;
      botao.textContent = "CRIAR CONTA";
    }
  }

  /* =========================================================
     TELA DE PERFIL
     ========================================================= */

  async function telaPerfil(usuario) {
    limparMensagem();
    var content = document.getElementById("cndbcoin-content");

    content.innerHTML = `
      <div class="cndbcoin-profile">
        <div class="cndbcoin-profile-name">${escaparHTML(usuario.displayName || "Usuário CNDB")}</div>
        <div class="cndbcoin-profile-line">Carregando perfil...</div>
      </div>
      <div class="cndbcoin-actions">
        <button id="cndb-sair" class="cndbcoin-btn cndbcoin-btn-secondary" type="button">Sair</button>
      </div>
    `;

    document.getElementById("cndb-sair").addEventListener("click", sair);

    try {
      var doc = await db.collection("users").doc(usuario.uid).get();
      var dados = doc.exists ? doc.data() : {};

      var nome = dados.name || dados.displayName || usuario.displayName || "Usuário CNDB";
      var instagram = dados.instagram ? "@" + dados.instagram : "Instagram não informado";
      var tipo = dados.accountType === "admin" ? "Administrador" : "Membro CNDB";

      content.innerHTML = `
        <div class="cndbcoin-profile">
          <div class="cndbcoin-profile-name">${escaparHTML(nome)}</div>
          <div class="cndbcoin-profile-line">📧 E-mail: ${escaparHTML(usuario.email)}</div>
          <div class="cndbcoin-profile-line">📱 Instagram: ${escaparHTML(instagram)}</div>
          <div class="cndbcoin-profile-line">🛡️ Perfil: ${escaparHTML(tipo)}</div>
        </div>

        <div class="cndbcoin-actions">
          <button id="cndb-sair" class="cndbcoin-btn cndbcoin-btn-secondary" type="button">Sair</button>
        </div>
      `;

      document.getElementById("cndb-sair").addEventListener("click", sair);

    } catch (erro) {
      console.error("CNDBcoin: erro ao carregar perfil:", erro);
      mostrarMensagem("Erro ao carregar dados do perfil.", "erro");
    }
  }

  /* =========================================================
     SAIR / LOGOUT
     ========================================================= */

  async function sair() {
    try {
      await auth.signOut();
      mostrarMensagem("Você saiu da sua conta.");
      setTimeout(function () {
        telaLogin();
      }, 700);
    } catch (erro) {
      console.error("CNDBcoin: erro ao sair:", erro);
    }
  }

  /* =========================================================
     TRADUÇÃO DE ERROS DO FIREBASE
     ========================================================= */

  function traduzirErroFirebase(erro) {
    if (!erro || !erro.code) {
      return "Ocorreu um erro inesperado.";
    }

    switch (erro.code) {
      case "auth/invalid-email":
        return "O formato do e-mail é inválido.";
      case "auth/user-disabled":
        return "Esta conta foi desativada.";
      case "auth/user-not-found":
        return "Não encontramos uma conta com este e-mail.";
      case "auth/wrong-password":
        return "Senha incorreta. Tente novamente.";
      case "auth/email-already-in-use":
        return "Já existe uma conta cadastrada com este e-mail.";
      case "auth/weak-password":
        return "A senha deve ter pelo menos 6 caracteres.";
      case "auth/network-request-failed":
        return "Falha de conexão. Verifique sua internet.";
      case "permission-denied":
      case "firestore/permission-denied":
        return "Permissão negada pelo banco de dados.";
      default:
        return erro.message || "Erro desconhecido no sistema.";
    }
  }

  /* =========================================================
     VERIFICAR SESSÃO
     ========================================================= */

  function verificarSessao() {
    if (!auth) {
      telaLogin();
      return;
    }

    var usuarioAtual = auth.currentUser;

    if (usuarioAtual) {
      telaPerfil(usuarioAtual);
    } else {
      auth.onAuthStateChanged(function (usuario) {
        if (usuario) {
          telaPerfil(usuario);
        } else {
          telaLogin();
        }
      });
    }
  }

  /* =========================================================
     INICIALIZAÇÃO DO SCRIPT
     ========================================================= */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      criarEstilo();
      criarInterface();
    });
  } else {
    criarEstilo();
    criarInterface();
  }

  window.CNDBcoin = {
    abrir: abrirCNDBcoin,
    fechar: fecharCNDBcoin
  };

})();
