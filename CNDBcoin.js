/* =========================================================
   ARENA CNDB - CNDBcoin
   Login + Cadastro + Perfil
   ========================================================= */

(function () {
  "use strict";

  /* =========================================================
     CONFIGURAÇÃO OFICIAL FIREBASE - ARENA CNDB
     Copiada da configuração Web do Firebase
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
      var existente = document.querySelector(
        'script[src="' + src + '"]'
      );

      if (existente) {
        resolve();
        return;
      }

      var script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;

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
        await carregarScript(
          "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"
        );
      }

      if (!firebase.auth) {
        await carregarScript(
          "https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"
        );
      }

      if (!firebase.firestore) {
        await carregarScript(
          "https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"
        );
      }

      if (!firebase.apps.length) {
        firebase.initializeApp(FIREBASE_CONFIG);
      }

      auth = firebase.auth();
      db = firebase.firestore();

      firebaseReady = true;

      console.log("CNDBcoin: Firebase iniciado.");
      console.log(
        "CNDBcoin: projeto:",
        firebase.app().options.projectId
      );

      return true;

    } catch (erro) {

      console.error(
        "CNDBcoin: erro ao iniciar Firebase:",
        erro
      );

      return false;
    }
  }

  /* =========================================================
     CSS
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
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 999px;
        padding: 14px 20px;
        background: #152334;
        color: #f4f7fb;
        font-weight: 800;
        font-size: 15px;
        cursor: pointer;
        box-shadow: 0 10px 30px rgba(0,0,0,.35);
      }

      #cndbcoin-open:hover {
        transform: translateY(-1px);
      }

      #cndbcoin-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(0,8,18,.86);
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
        background: #0d1c2c;
        border-radius: 24px;
        padding: 34px;
        box-sizing: border-box;
        color: white;
        box-shadow: 0 25px 80px rgba(0,0,0,.55);
        position: relative;
        font-family: Arial, sans-serif;
      }

      #cndbcoin-close {
        position: absolute;
        right: 28px;
        top: 28px;
        width: 62px;
        height: 62px;
        border: 1px solid #bbb;
        background: #fff;
        color: #111;
        font-size: 34px;
        cursor: pointer;
        border-radius: 3px;
      }

      #cndbcoin-title {
        font-size: 38px;
        font-weight: 900;
        margin: 5px 85px 34px 0;
        line-height: 1.1;
      }

      .cndbcoin-input {
        display: block;
        width: 100%;
        box-sizing: border-box;
        padding: 19px 18px;
        margin: 0 0 16px;
        border: 1px solid #bbb;
        border-radius: 3px;
        background: #fff;
        color: #111;
        font-size: 20px;
        outline: none;
      }

      .cndbcoin-input:focus {
        border-color: #ffb000;
        box-shadow: 0 0 0 2px rgba(255,176,0,.18);
      }

      .cndbcoin-btn {
        border: 0;
        border-radius: 5px;
        padding: 16px 22px;
        font-size: 18px;
        font-weight: 800;
        cursor: pointer;
      }

      .cndbcoin-btn:disabled {
        opacity: .65;
        cursor: not-allowed;
      }

      .cndbcoin-btn-primary {
        background: #ffb000;
        color: #07111c;
      }

      .cndbcoin-btn-secondary {
        background: #fff;
        color: #111;
        border: 1px solid #bbb;
      }

      .cndbcoin-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 8px;
      }

      #cndbcoin-msg {
        display: none;
        padding: 13px;
        border: 1px solid;
        border-radius: 7px;
        margin: 0 0 17px;
        line-height: 1.4;
        word-break: break-word;
      }

      .cndbcoin-link {
        color: #ffb000;
        cursor: pointer;
        font-weight: bold;
        text-decoration: underline;
      }

      .cndbcoin-small {
        color: #b8c5d4;
        margin-top: 22px;
        line-height: 1.5;
      }

      .cndbcoin-profile {
        background: #13263a;
        border: 1px solid rgba(255,255,255,.10);
        border-radius: 14px;
        padding: 20px;
        margin-bottom: 18px;
      }

      .cndbcoin-profile-name {
        font-size: 25px;
        font-weight: 900;
        margin-bottom: 7px;
      }

      .cndbcoin-profile-line {
        color: #cbd7e4;
        margin-top: 7px;
        word-break: break-word;
      }

      @media(max-width:600px) {
        #cndbcoin-box {
          padding: 28px 24px;
        }

        #cndbcoin-title {
          font-size: 31px;
        }

        #cndbcoin-close {
          width: 55px;
          height: 55px;
          right: 22px;
          top: 22px;
        }

        .cndbcoin-input {
          font-size: 18px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* =========================================================
     INTERFACE
     ========================================================= */

  function criarInterface() {

    if (!document.getElementById("cndbcoin-open")) {

      var botao = document.createElement("button");

      botao.id = "cndbcoin-open";
      botao.type = "button";
      botao.innerHTML = "🪙 CNDBcoin";

      botao.addEventListener(
        "click",
        abrirCNDBcoin
      );

      document.body.appendChild(botao);
    }

    if (!document.getElementById("cndbcoin-overlay")) {

      var overlay = document.createElement("div");

      overlay.id = "cndbcoin-overlay";

      overlay.innerHTML = `
        <div id="cndbcoin-box">

          <button
            id="cndbcoin-close"
            type="button">
            ×
          </button>

          <div id="cndbcoin-title">
            🪙 Minha Conta
          </div>

          <div id="cndbcoin-msg"></div>

          <div id="cndbcoin-content"></div>

        </div>
      `;

      document.body.appendChild(overlay);

      document
        .getElementById("cndbcoin-close")
        .addEventListener(
          "click",
          fecharCNDBcoin
        );

      overlay.addEventListener(
        "click",
        function (event) {
          if (event.target === overlay) {
            fecharCNDBcoin();
          }
        }
      );
    }
  }

  function abrirCNDBcoin() {

    var overlay =
      document.getElementById("cndbcoin-overlay");

    if (!overlay) return;

    overlay.style.display = "flex";

    limparMensagem();

    iniciarFirebase().then(
      function (ok) {

        if (!ok) {

          mostrarMensagem(
            "Não foi possível conectar ao sistema da Arena CNDB.",
            "erro"
          );

          return;
        }

        verificarSessao();
      }
    );
  }

  function fecharCNDBcoin() {

    var overlay =
      document.getElementById("cndbcoin-overlay");

    if (overlay) {
      overlay.style.display = "none";
    }
  }

  /* =========================================================
     LOGIN
     ========================================================= */

  function telaLogin() {

    limparMensagem();

    var content =
      document.getElementById("cndbcoin-content");

    content.innerHTML = `
      <input
        id="cndb-login-email"
        class="cndbcoin-input"
        type="email"
        placeholder="E-mail"
        autocomplete="email"
      />

      <input
        id="cndb-login-senha"
        class="cndbcoin-input"
        type="password"
        placeholder="Senha"
        autocomplete="current-password"
      />

      <div class="cndbcoin-actions">

        <button
          id="cndb-login-btn"
          class="cndbcoin-btn cndbcoin-btn-primary"
          type="button">
          Entrar
        </button>

        <button
          id="cndb-cadastro-btn"
          class="cndbcoin-btn cndbcoin-btn-secondary"
          type="button">
          Criar minha conta
        </button>

      </div>

      <div class="cndbcoin-small">

        Ainda não participa da Arena?

        <span
          id="cndb-cadastro-link"
          class="cndbcoin-link">
          Cadastre-se
        </span>

      </div>
    `;

    document
      .getElementById("cndb-login-btn")
      .addEventListener(
        "click",
        fazerLogin
      );

    document
      .getElementById("cndb-cadastro-btn")
      .addEventListener(
        "click",
        telaCadastro
      );

    document
      .getElementById("cndb-cadastro-link")
      .addEventListener(
        "click",
        telaCadastro
      );
  }

  async function fazerLogin() {

    limparMensagem();

    var email =
      document
        .getElementById("cndb-login-email")
        .value
        .trim()
        .toLowerCase();

    var senha =
      document
        .getElementById("cndb-login-senha")
        .value;

    if (!email || !senha) {

      mostrarMensagem(
        "Informe o e-mail e a senha.",
        "erro"
      );

      return;
    }

    var botao =
      document.getElementById("cndb-login-btn");

    botao.disabled = true;
    botao.textContent = "Entrando...";

    try {

      await auth.signInWithEmailAndPassword(
        email,
        senha
      );

      mostrarMensagem(
        "✅ Login realizado com sucesso!"
      );

      setTimeout(
        function () {
          verificarSessao();
        },
        500
      );

    } catch (erro) {

      console.error(
        "CNDBcoin: erro no login:",
        erro
      );

      mostrarMensagem(
        traduzirErroFirebase(erro),
        "erro"
      );

    } finally {

      botao.disabled = false;
      botao.textContent = "Entrar";
    }
  }

  /* =========================================================
     CADASTRO
     ========================================================= */

  function telaCadastro() {

    limparMensagem();

    var content =
      document.getElementById("cndbcoin-content");

    content.innerHTML = `
      <input
        id="cndb-cadastro-nome"
        class="cndbcoin-input"
        type="text"
        placeholder="Nome ou apelido"
        maxlength="60"
      />

      <input
        id="cndb-cadastro-instagram"
        class="cndbcoin-input"
        type="text"
        placeholder="@Instagram"
        maxlength="50"
      />

      <input
        id="cndb-cadastro-email"
        class="cndbcoin-input"
        type="email"
        placeholder="E-mail"
        autocomplete="email"
      />

      <input
        id="cndb-cadastro-senha"
        class="cndbcoin-input"
        type="password"
        placeholder="Senha"
        autocomplete="new-password"
      />

      <input
        id="cndb-cadastro-confirmar"
        class="cndbcoin-input"
        type="password"
        placeholder="Confirmar senha"
        autocomplete="new-password"
      />

      <div class="cndbcoin-actions">

        <button
          id="cndb-criar-conta"
          class="cndbcoin-btn cndbcoin-btn-primary"
          type="button">
          CRIAR CONTA
        </button>

        <button
          id="cndb-vol
