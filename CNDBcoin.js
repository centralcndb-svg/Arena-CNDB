/* =========================================================
   ARENA CNDB - CNDBcoin v2
   ETAPA 1: CADASTRO + LOGIN + CARTEIRA
   ========================================================= */

(function () {
  "use strict";

  /* =========================
     CONFIGURAÇÃO FIREBASE
     ========================= */

  var CFG = {
    apiKey: "AIzaSyBAj0HK2Dq4lE5tHgZfiC-7XbxfiN5H05w",
    projectId: "arena-cndb"
  };

  /* =========================
     SESSÃO
     ========================= */

  var token =
    sessionStorage.getItem("cndb_coin_token") || "";

  var user = null;

  try {
    user = JSON.parse(
      sessionStorage.getItem("cndb_coin_user") || "null"
    );
  } catch (e) {
    user = null;
  }

  function el(id) {
    return document.getElementById(id);
  }

  /* =========================
     INTERFACE
     ========================= */

  function criarUI() {
    if (el("cndbcoin-open")) return;

    var box = document.createElement("div");

    box.innerHTML = `
      <button id="cndbcoin-open" type="button">
        🪙 CNDBcoin
      </button>

      <div id="cndbcoin-modal" style="display:none">

        <div class="cndbcoin-card">

          <button id="cndbcoin-close" type="button">
            ✕
          </button>

          <h2>🪙 Arena CNDB</h2>

          <!-- LOGIN -->

          <div id="cndbcoin-login">

            <h3>Entrar</h3>

            <input
              id="cndbcoin-email"
              type="email"
              placeholder="E-mail"
              autocomplete="email"
            >

            <input
              id="cndbcoin-pass"
              type="password"
              placeholder="Senha"
              autocomplete="current-password"
            >

            <button
              id="cndbcoin-enter"
              class="cndbcoin-primary"
              type="button"
            >
              ENTRAR
            </button>

            <div class="cndbcoin-divider">
              Ainda não possui uma conta?
            </div>

            <button
              id="cndbcoin-show-register"
              type="button"
            >
              👤 CRIAR MINHA CONTA
            </button>

          </div>

          <!-- CADASTRO -->

          <div
            id="cndbcoin-register"
            style="display:none"
          >

            <h3>👤 Criar Conta Arena CNDB</h3>

            <input
              id="cndbcoin-name"
              type="text"
              placeholder="Nome / Apelido"
              maxlength="50"
            >

            <input
              id="cndbcoin-instagram"
              type="text"
              placeholder="@Instagram"
              maxlength="50"
            >

            <input
              id="cndbcoin-register-email"
              type="email"
              placeholder="E-mail"
              autocomplete="email"
            >

            <input
              id="cndbcoin-register-pass"
              type="password"
              placeholder="Senha"
              autocomplete="new-password"
            >

            <input
              id="cndbcoin-register-pass2"
              type="password"
              placeholder="Confirmar senha"
              autocomplete="new-password"
            >

            <button
              id="cndbcoin-create"
              class="cndbcoin-primary"
              type="button"
            >
              CRIAR CONTA
            </button>

            <button
              id="cndbcoin-back-login"
              type="button"
            >
              ← VOLTAR PARA ENTRAR
            </button>

          </div>

          <!-- CARTEIRA -->

          <div
            id="cndbcoin-wallet"
            style="display:none"
          >

            <div class="cndbcoin-profile">

              <div class="cndbcoin-avatar">
                👤
              </div>

              <div>
                <strong id="cndbcoin-user-name">
                  Conta CNDB
                </strong>

                <div id="cndbcoin-user-instagram">
                </div>

                <small id="cndbcoin-user-email">
                </small>
              </div>

            </div>

            <div class="cndbcoin-balance-box">

              <small>MEU SALDO</small>

              <div class="cndbcoin-balance">
                🪙
                <b id="cndbcoin-balance">0</b>
              </div>

              <strong>CNDBcoins</strong>

            </div>

            <button
              id="cndbcoin-refresh"
              type="button"
            >
              🔄 Atualizar saldo
            </button>

            <button
              id="cndbcoin-logout"
              type="button"
            >
              Sair
            </button>

          </div>

        </div>

      </div>
    `;

    document.body.appendChild(box);

    criarCSS();
    criarEventos();

    atualizarTela();
  }

  /* =========================
     VISUAL
     ========================= */

  function criarCSS() {
    if (el("cndbcoin-style")) return;

    var css = document.createElement("style");

    css.id = "cndbcoin-style";

    css.textContent = `

      #cndbcoin-open {
        position: fixed;
        right: 12px;
        bottom: 72px;
        z-index: 9997;
        padding: 12px 17px;
        border: 1px solid #e8bd4c;
        border-radius: 30px;
        background: #e8bd4c;
        color: #08111e;
        font-weight: 900;
        cursor: pointer;
        box-shadow: 0 5px 20px rgba(0,0,0,.35);
      }

      #cndbcoin-modal {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(3,10,20,.96);
        padding: 18px;
        color: #fff;
        overflow-y: auto;
      }

      .cndbcoin-card {
        position: relative;
        max-width: 460px;
        margin: 5vh auto;
        background: #0c1929;
        border: 1px solid rgba(232,189,76,.35);
        padding: 22px;
        border-radius: 20px;
        box-shadow: 0 15px 50px rgba(0,0,0,.45);
      }

      .cndbcoin-card h2 {
        color: #e8bd4c;
        margin-top: 5px;
      }

      .cndbcoin-card h3 {
        margin-top: 20px;
      }

      #cndbcoin-close {
        position: absolute;
        right: 14px;
        top: 12px;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 0;
        background: #18283b;
        color: #fff;
        font-size: 18px;
        cursor: pointer;
      }

      .cndbcoin-card input {
        box-sizing: border-box;
        display: block;
        width: 100%;
        padding: 13px;
        margin: 10px 0;
        border: 1px solid #33465d;
        border-radius: 10px;
        background: #081421;
        color: #fff;
        outline: none;
      }

      .cndbcoin-card input:focus {
        border-color: #e8bd4c;
      }

      .cndbcoin-card button {
        box-sizing: border-box;
        padding: 12px;
        margin: 6px 0;
        border-radius: 10px;
        cursor: pointer;
      }

      .cndbcoin-card button:not(#cndbcoin-close) {
        width: 100%;
      }

      .cndbcoin-primary {
        border: 0;
        background: #e8bd4c;
        color: #07111d;
        font-weight: 900;
      }

      #cndbcoin-show-register,
      #cndbcoin-back-login,
      #cndbcoin-refresh,
      #cndbcoin-logout {
        border: 1px solid #33465d;
        background: #132337;
        color: #fff;
        font-weight: 700;
      }

      .cndbcoin-divider {
        text-align: center;
        color: #aab6c5;
        padding: 18px 0 8px;
      }

      .cndbcoin-profile {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #101f31;
        padding: 14px;
        border-radius: 14px;
        margin: 15px 0;
      }

      .cndbcoin-avatar {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 54px;
        height: 54px;
        border-radius: 50%;
        background: #e8bd4c;
        color: #07111d;
        font-size: 25px;
      }

      #cndbcoin-user-instagram {
        color: #e8bd4c;
        margin-top: 3px;
      }

      #cndbcoin-user-email {
        color: #8fa1b5;
      }

      .cndbcoin-balance-box {
        text-align: center;
        background: #081421;
        border: 1px solid rgba(232,189,76,.25);
        padding: 22px;
        border-radius: 15px;
        margin: 15px 0;
      }

      .cndbcoin-balance {
        font-size: 34px;
        margin: 8px 0;
        color: #e8bd4c;
      }

    `;

    document.head.appendChild(css);
  }

  /* =========================
     EVENTOS
     ========================= */

  function criarEventos() {

    el("cndbcoin-open").onclick = function () {
      el("cndbcoin-modal").style.display = "block";
      atualizarTela();
    };

    el("cndbcoin-close").onclick = function () {
      el("cndbcoin-modal").style.display = "none";
    };

    el("cndbcoin-show-register").onclick =
      mostrarCadastro;

    el("cndbcoin-back-login").onclick =
      mostrarLogin;

    el("cndbcoin-enter").onclick =
      login;

    el("cndbcoin-create").onclick =
      criarConta;

    el("cndbcoin-refresh").onclick =
      carregarSaldo;

    el("cndbcoin-logout").onclick =
      logout;
  }

  function mostrarCadastro() {
    el("cndbcoin-login").style.display = "none";
    el("cndbcoin-register").style.display = "block";
  }

  function mostrarLogin() {
    el("cndbcoin-register").style.display = "none";
    el("cndbcoin-login").style.display = "block";
  }

  /* =========================
     CRIAR CONTA
     ========================= */

  async function criarConta() {

    var name =
      el("cndbcoin-name").value.trim();

    var instagram =
      el("cndbcoin-instagram").value.trim();

    var email =
      el("cndbcoin-register-email")
        .value.trim()
        .toLowerCase();

    var password =
      el("cndbcoin-register-pass").value;

    var password2 =
      el("cndbcoin-register-pass2").value;

    if (!name) {
      alert("Informe seu nome ou apelido.");
      return;
    }

    if (!instagram) {
      alert("Informe seu @Instagram.");
      return;
    }

    if (!email) {
      alert("Informe seu e-mail.");
      return;
    }

    if (password.length < 6) {
      alert(
        "A senha precisa ter pelo menos 6 caracteres."
      );
      return;
    }

    if (password !== password2) {
      alert("As senhas não são iguais.");
      return;
    }

    if (instagram.charAt(0) !== "@") {
      instagram = "@" + instagram;
    }

    var botao = el("cndbcoin-create");

    botao.disabled = true;
    botao.textContent = "CRIANDO CONTA...";

    try {

      /* CRIA USUÁRIO NO FIREBASE AUTH */

      var r = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" +
        CFG.apiKey,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email,
            password: password,
            returnSecureToken: true
          })
        }
      );

      var j = await r.json();

      if (!r.ok) {
        throw new Error(
          traduzirErroFirebase(
            j.error && j.error.message
          )
        );
      }

      token = j.idToken;

      user = {
        uid: j.localId,
        email: j.email,
        name: name,
        instagram: instagram
      };

      salvarSessao();

      /*
       * Salva o perfil.
       *
       * Nesta primeira versão não damos ainda
       * 1.000 ou 10.000 moedas automaticamente.
       * Isso será feito na próxima etapa com
       * proteção contra bônus duplicado.
       */

      await salvarPerfil();

      atualizarTela();

      alert(
        "✅ Conta Arena CNDB criada com sucesso!"
      );

    } catch (e) {

      alert(
        "Cadastro Arena CNDB: " + e.message
      );

    } finally {

      botao.disabled = false;
      botao.textContent = "CRIAR CONTA";
    }
  }

  /* =========================
     SALVAR PERFIL FIRESTORE
     ========================= */

  async function salvarPerfil() {

    if (!token || !user) return;

    var url =
      "https://firestore.googleapis.com/v1/projects/" +
      CFG.projectId +
      "/databases/(default)/documents/users/" +
      user.uid;

    var body = {
      fields: {

        uid: {
          stringValue: user.uid
        },

        name: {
          stringValue: user.name || ""
        },

        instagram: {
          stringValue: user.instagram || ""
        },

        email: {
          stringValue: user.email || ""
        },

        accountType: {
          stringValue: "user"
        },

        createdAt: {
          timestampValue:
            new Date().toISOString()
        }

      }
    };

    var r = await fetch(url, {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },

      body: JSON.stringify(body)
    });

    var j = await r.json();

    if (!r.ok) {
      throw new Error(
        (j.error && j.error.message) ||
        "Não foi possível salvar o perfil."
      );
    }

    return j;
  }

  /* =========================
     LOGIN
     ========================= */

  async function login() {

    var email =
      el("cndbcoin-email")
        .value.trim()
        .toLowerCase();

    var password =
      el("cndbcoin-pass").value;

    if (!email || !password) {
      alert("Informe e-mail e senha.");
      return;
    }

    var botao =
      el("cndbcoin-enter");

    botao.disabled = true;
    botao.textContent = "ENTRANDO...";

    try {

      var r = await fetch(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" +
        CFG.apiKey,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: email,
            password: password,
            returnSecureToken: true
          })
        }
      );

      var j = await r.json();

      if (!r.ok) {
        throw new Error(
          traduzirErroFirebase(
            j.error && j.error.message
          )
        );
      }

      token = j.idToken;

      user = {
        uid: j.localId,
        email: j.email
      };

      await carregarPerfil();

      salvarSessao();

      atualizarTela();

      await carregarSaldo();

    } catch (e) {

      alert(
        "Conta CNDB: " + e.message
      );

    } finally {

      botao.disabled = false;
      botao.textContent = "ENTRAR";
    }
  }

  /* =========================
     CARREGAR PERFIL
     ========================= */

  async function carregarPerfil() {

    if (!token || !user) return;

    try {

      var r = await fetch(
        "https://firestore.googleapis.com/v1/projects/" +
        CFG.projectId +
        "/databases/(default)/documents/users/" +
        user.uid,
        {
          headers: {
            "Authorization": "Bearer " + token
          }
        }
      );

      if (r.status === 404) {
        return;
      }

      var j = await r.json();

      if (!r.ok) return;

      var f = j.fields || {};

      user.name =
        f.name && f.name.stringValue
          ? f.name.stringValue
          : "";

      user.instagram =
        f.instagram && f.instagram.stringValue
          ? f.instagram.stringValue
          : "";

    } catch (e) {
      console.log(
        "Arena CNDB: perfil ainda não disponível.",
        e
      );
    }
  }

  /* =========================
     CARTEIRA
     ========================= */

  async function carregarSaldo() {

    if (!token || !user) return;

    try {

      var r = await fetch(
        "https://firestore.googleapis.com/v1/projects/" +
        CFG.projectId +
        "/databases/(default)/documents/wallets/" +
        user.uid,
        {
          headers: {
            "Authorization": "Bearer " + token
          }
        }
      );

      if (r.status === 404) {
        el("cndbcoin-balance").textContent = "0";
        return;
      }

      var j = await r.json();

      if (!r.ok) {
        throw new Error(
          (j.error && j.error.message) ||
          ("HTTP " + r.status)
        );
      }

      var f = j.fields || {};

      var balance = "0";

      if (f.balance) {
        balance =
          f.balance.integerValue ||
          f.balance.doubleValue ||
          "0";
      }

      el("cndbcoin-balance").textContent =
        formatarNumero(balance);

    } catch (e) {

      alert(
        "Carteira CNDBcoin: " + e.message
      );
    }
  }

  /* =========================
     TELA
     ========================= */

  function atualizarTela() {

    var conectado =
      !!(token && user);

    el("cndbcoin-login").style.display =
      conectado ? "none" : "block";

    el("cndbcoin-register").style.display =
      "none";

    el("cndbcoin-wallet").style.display =
      conectado ? "block" : "none";

    if (conectado) {

      el("cndbcoin-user-name").textContent =
        user.name ||
        "Conta Arena CNDB";

      el("cndbcoin-user-instagram").textContent =
        user.instagram || "";

      el("cndbcoin-user-email").textContent =
        user.email || "";

      carregarSaldo();
    }
  }

  /* =========================
     SESSÃO
     ========================= */

  function salvarSessao() {

    sessionStorage.setItem(
      "cndb_coin_token",
      token
    );

    sessionStorage.setItem(
      "cndb_coin_user",
      JSON.stringify(user)
    );
  }

  function logout() {

    token = "";
    user = null;

    sessionStorage.removeItem(
      "cndb_coin_token"
    );

    sessionStorage.removeItem(
      "cndb_coin_user"
    );

    atualizarTela();

    mostrarLogin();
  }

  /* =========================
     UTILIDADES
     ========================= */

  function formatarNumero(valor) {

    var n = Number(valor);

    if (!Number.isFinite(n)) {
      return "0";
    }

    return n.toLocaleString("pt-BR");
  }

  function traduzirErroFirebase(erro) {

    if (!erro) {
      return "Ocorreu um erro.";
    }

    if (
      erro.indexOf("EMAIL_EXISTS") !== -1
    ) {
      return "Este e-mail já possui uma conta.";
    }

    if (
      erro.indexOf("INVALID_LOGIN_CREDENTIALS") !== -1 ||
      erro.indexOf("INVALID_PASSWORD") !== -1
    ) {
      return "E-mail ou senha incorretos.";
    }

    if (
      erro.indexOf("EMAIL_NOT_FOUND") !== -1
    ) {
      return "Conta não encontrada.";
    }

    if (
      erro.indexOf("INVALID_EMAIL") !== -1
    ) {
      return "E-mail inválido.";
    }

    if (
      erro.indexOf("WEAK_PASSWORD") !== -1
    ) {
      return "A senha é muito fraca.";
    }

    if (
      erro.indexOf("TOO_MANY_ATTEMPTS") !== -1
    ) {
      return "Muitas tentativas. Aguarde um pouco.";
    }

    return erro;
  }

  /* =========================
     INICIAR
     ========================= */

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      criarUI
    );

  } else {

    criarUI();
  }

})();
