/* =========================================================
   ARENA CNDB - CNDBcoin
   Login + Cadastro + Perfil + Envio
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
    return String(texto === undefined || texto === null ? "" : texto)
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
          id="cndb-voltar-login"
          class="cndbcoin-btn cndbcoin-btn-secondary"
          type="button">
          VOLTAR
        </button>

      </div>

      <div class="cndbcoin-small">
        Ao criar sua conta, seu perfil será registrado na Arena CNDB.
      </div>
    `;

    document
      .getElementById("cndb-criar-conta")
      .addEventListener(
        "click",
        criarConta
      );

    document
      .getElementById("cndb-voltar-login")
      .addEventListener(
        "click",
        telaLogin
      );
  }

  async function criarConta() {
    limparMensagem();

    var nome =
      document
        .getElementById("cndb-cadastro-nome")
        .value
        .trim();

    var instagram =
      limparInstagram(
        document
          .getElementById("cndb-cadastro-instagram")
          .value
      ).toLowerCase();

    var email =
      document
        .getElementById("cndb-cadastro-email")
        .value
        .trim()
        .toLowerCase();

    var senha =
      document
        .getElementById("cndb-cadastro-senha")
        .value;

    var confirmar =
      document
        .getElementById("cndb-cadastro-confirmar")
        .value;

    if (!nome) {
      mostrarMensagem(
        "Informe seu nome ou apelido.",
        "erro"
      );
      return;
    }

    if (!instagram) {
      mostrarMensagem(
        "Informe seu Instagram.",
        "erro"
      );
      return;
    }

    if (!email) {
      mostrarMensagem(
        "Informe seu e-mail.",
        "erro"
      );
      return;
    }

    if (senha.length < 6) {
      mostrarMensagem(
        "A senha precisa ter pelo menos 6 caracteres.",
        "erro"
      );
      return;
    }

    if (senha !== confirmar) {
      mostrarMensagem(
        "As senhas não são iguais.",
        "erro"
      );
      return;
    }

    var botao =
      document.getElementById("cndb-criar-conta");

    botao.disabled = true;
    botao.textContent = "CRIANDO...";

    try {
      var credencial =
        await auth.createUserWithEmailAndPassword(
          email,
          senha
        );

      var usuario = credencial.user;

      var perfil = {
        uid: usuario.uid,
        nome: nome,
        instagram: instagram,
        email: email,
        saldo: 0,
        criadoEm:
          firebase.firestore.FieldValue.serverTimestamp(),
        atualizadoEm:
          firebase.firestore.FieldValue.serverTimestamp()
      };

      await db
        .collection("usuarios")
        .doc(usuario.uid)
        .set(
          perfil,
          { merge: true }
        );

      try {
        await usuario.updateProfile({
          displayName: nome
        });
      } catch (erroPerfil) {
        console.warn(
          "CNDBcoin: não foi possível atualizar displayName:",
          erroPerfil
        );
      }

      mostrarMensagem(
        "✅ Conta criada com sucesso!"
      );

      setTimeout(
        function () {
          verificarSessao();
        },
        700
      );

    } catch (erro) {
      console.error(
        "CNDBcoin: erro ao criar conta:",
        erro
      );

      mostrarMensagem(
        traduzirErroFirebase(erro),
        "erro"
      );

    } finally {
      botao.disabled = false;
      botao.textContent = "CRIAR CONTA";
    }
  }

  /* =========================================================
     SESSÃO E PERFIL
     ========================================================= */

  async function verificarSessao() {
    if (!auth) {
      telaLogin();
      return;
    }

    var usuario = auth.currentUser;

    if (!usuario) {
      telaLogin();
      return;
    }

    await mostrarPerfil(usuario);
  }

  async function mostrarPerfil(usuario) {
    limparMensagem();

    var content =
      document.getElementById("cndbcoin-content");

    content.innerHTML = `
      <div class="cndbcoin-profile">
        <div class="cndbcoin-profile-name">
          Carregando perfil...
        </div>
      </div>
    `;

    try {
      var documento =
        await db
          .collection("usuarios")
          .doc(usuario.uid)
          .get();

      var dados =
        documento.exists
          ? documento.data()
          : {};

      var nome =
        dados.nome ||
        usuario.displayName ||
        "Participante CNDB";

      var instagram =
        dados.instagram || "";

      var email =
        dados.email ||
        usuario.email ||
        "";

      var saldo =
        typeof dados.saldo === "number"
          ? dados.saldo
          : 0;

      var instagramHTML = instagram
        ? "@" + escaparHTML(instagram)
        : "Não informado";

      content.innerHTML = `
        <div class="cndbcoin-profile">

          <div class="cndbcoin-profile-name">
            👤 ${escaparHTML(nome)}
          </div>

          <div class="cndbcoin-profile-line">
            📧 ${escaparHTML(email)}
          </div>

          <div class="cndbcoin-profile-line">
            📱 ${instagramHTML}
          </div>

          <div
            class="cndbcoin-profile-line"
            style="
              margin-top:18px;
              font-size:22px;
              font-weight:900;
              color:#ffb000;
            ">
            🪙 ${escaparHTML(saldo)} CNDBcoin
          </div>

        </div>

        <div class="cndbcoin-actions">

          <button
            id="cndb-enviar-coin"
            class="cndbcoin-btn cndbcoin-btn-primary"
            type="button">
            🪙 ENVIAR CNDBcoin
          </button>

          <button
            id="cndb-atualizar-perfil"
            class="cndbcoin-btn cndbcoin-btn-secondary"
            type="button">
            ATUALIZAR
          </button>

          <button
            id="cndb-sair-conta"
            class="cndbcoin-btn cndbcoin-btn-secondary"
            type="button">
            SAIR
          </button>

        </div>
      `;

      document
        .getElementById("cndb-enviar-coin")
        .addEventListener(
          "click",
          function () {
            telaEnviarCNDBcoin(
              usuario,
              saldo
            );
          }
        );

      document
        .getElementById("cndb-atualizar-perfil")
        .addEventListener(
          "click",
          function () {
            mostrarPerfil(usuario);
          }
        );

      document
        .getElementById("cndb-sair-conta")
        .addEventListener(
          "click",
          sairConta
        );

    } catch (erro) {
      console.error(
        "CNDBcoin: erro ao carregar perfil:",
        erro
      );

      content.innerHTML = `
        <div class="cndbcoin-profile">

          <div class="cndbcoin-profile-name">
            👤 ${escaparHTML(
              usuario.displayName ||
              "Participante CNDB"
            )}
          </div>

          <div class="cndbcoin-profile-line">
            📧 ${escaparHTML(
              usuario.email || ""
            )}
          </div>

        </div>

        <div class="cndbcoin-actions">

          <button
            id="cndb-sair-conta"
            class="cndbcoin-btn cndbcoin-btn-secondary"
            type="button">
            SAIR
          </button>

        </div>
      `;

      document
        .getElementById("cndb-sair-conta")
        .addEventListener(
          "click",
          sairConta
        );

      mostrarMensagem(
        "A conta está conectada, mas não foi possível carregar os dados do perfil.",
        "erro"
      );
    }
  }

  /* =========================================================
     ENVIAR CNDBcoin
     ========================================================= */

  function telaEnviarCNDBcoin(
    usuario,
    saldoAtual
  ) {
    limparMensagem();

    var content =
      document.getElementById("cndbcoin-content");

    content.innerHTML = `
      <div class="cndbcoin-profile">

        <div class="cndbcoin-profile-name">
          🪙 Enviar CNDBcoin
        </div>

        <div class="cndbcoin-profile-line">
          Seu saldo disponível:
        </div>

        <div
          class="cndbcoin-profile-line"
          style="
            font-size:26px;
            font-weight:900;
            color:#ffb000;
            margin-top:10px;
          ">
          🪙 ${escaparHTML(saldoAtual)} CNDBcoin
        </div>

      </div>

      <input
        id="cndb-envio-instagram"
        class="cndbcoin-input"
        type="text"
        placeholder="@Instagram do destinatário"
        maxlength="50"
        autocomplete="off"
      />

      <input
        id="cndb-envio-quantidade"
        class="cndbcoin-input"
        type="number"
        placeholder="Quantidade de CNDBcoin"
        min="1"
        step="1"
        inputmode="numeric"
      />

      <div class="cndbcoin-actions">

        <button
          id="cndb-buscar-destinatario"
          class="cndbcoin-btn cndbcoin-btn-primary"
          type="button">
          CONTINUAR
        </button>

        <button
          id="cndb-cancelar-envio"
          class="cndbcoin-btn cndbcoin-btn-secondary"
          type="button">
          VOLTAR
        </button>

      </div>

      <div class="cndbcoin-small">
        Informe o @Instagram da pessoa que receberá os CNDBcoin.
      </div>
    `;

    document
      .getElementById("cndb-buscar-destinatario")
      .addEventListener(
        "click",
        function () {
          prepararEnvioCNDBcoin(
            usuario,
            saldoAtual
          );
        }
      );

    document
      .getElementById("cndb-cancelar-envio")
      .addEventListener(
        "click",
        function () {
          mostrarPerfil(usuario);
        }
      );
  }

  async function prepararEnvioCNDBcoin(
    usuario,
    saldoAtual
  ) {
    limparMensagem();

    var instagram =
      limparInstagram(
        document
          .getElementById("cndb-envio-instagram")
          .value
      ).toLowerCase();

    var quantidade =
      Number(
        document
          .getElementById("cndb-envio-quantidade")
          .value
      );

    if (!instagram) {
      mostrarMensagem(
        "Informe o @Instagram do destinatário.",
        "erro"
      );

      return;
    }

    if (
      !Number.isInteger(quantidade) ||
      quantidade <= 0
    ) {
      mostrarMensagem(
        "Informe uma quantidade válida de CNDBcoin.",
        "erro"
      );

      return;
    }

    if (quantidade > saldoAtual) {
      mostrarMensagem(
        "Você não possui CNDBcoin suficiente para esse envio.",
        "erro"
      );

      return;
    }

    var botao =
      document.getElementById(
        "cndb-buscar-destinatario"
      );

    botao.disabled = true;
    botao.textContent = "BUSCANDO...";

    try {
      var consulta =
        await db
          .collection("usuarios")
          .where(
            "instagram",
            "==",
            instagram
          )
          .limit(1)
          .get();

      if (consulta.empty) {
        mostrarMensagem(
          "Não encontramos uma conta com @" +
          instagram +
          ".",
          "erro"
        );

        return;
      }

      var documento =
        consulta.docs[0];

      if (documento.id === usuario.uid) {
        mostrarMensagem(
          "Você não pode enviar CNDBcoin para sua própria conta.",
          "erro"
        );

        return;
      }

      var destinatario =
        documento.data();

      confirmarEnvioCNDBcoin(
        usuario,
        saldoAtual,
        documento.id,
        destinatario,
        quantidade
      );

    } catch (erro) {
      console.error(
        "CNDBcoin: erro ao localizar destinatário:",
        erro
      );

      mostrarMensagem(
        "Não foi possível localizar o destinatário.",
        "erro"
      );

    } finally {
      botao.disabled = false;
      botao.textContent = "CONTINUAR";
    }
  }

  function confirmarEnvioCNDBcoin(
    usuario,
    saldoAtual,
    destinatarioUid,
    destinatario,
    quantidade
  ) {
    limparMensagem();

    var content =
      document.getElementById("cndbcoin-content");

    var nome =
      destinatario.nome ||
      "Participante CNDB";

    var instagram =
      destinatario.instagram ||
      "";

    content.innerHTML = `
      <div class="cndbcoin-profile">

        <div class="cndbcoin-profile-name">
          Confirmar envio
        </div>

        <div class="cndbcoin-profile-line">
          Você vai enviar:
        </div>

        <div
          style="
            font-size:30px;
            font-weight:900;
            color:#ffb000;
            margin:16px 0;
          ">
          🪙 ${escaparHTML(quantidade)} CNDBcoin
        </div>

        <div class="cndbcoin-profile-line">
          Para:
        </div>

        <div
          style="
            font-size:22px;
            font-weight:900;
            margin-top:8px;
          ">
          👤 ${escaparHTML(nome)}
        </div>

        <div class="cndbcoin-profile-line">
          📱 @${escaparHTML(instagram)}
        </div>

      </div>

      <div class="cndbcoin-actions">

        <button
          id="cndb-confirmar-transferencia"
          class="cndbcoin-btn cndbcoin-btn-primary"
          type="button">
          CONFIRMAR ENVIO
        </button>

        <button
          id="cndb-cancelar-transferencia"
          class="cndbcoin-btn cndbcoin-btn-secondary"
          type="button">
          CANCELAR
        </button>

      </div>
    `;

    document
      .getElementById(
        "cndb-confirmar-transferencia"
      )
      .addEventListener(
        "click",
        function () {
          mostrarMensagem(
            "✅ Destinatário confirmado. A transferência segura ainda não está ativada."
          );
        }
      );

    document
      .getElementById(
        "cndb-cancelar-transferencia"
      )
      .addEventListener(
        "click",
        function () {
          telaEnviarCNDBcoin(
            usuario,
            saldoAtual
          );
        }
      );
  }

  /* =========================================================
     SAIR
     ========================================================= */

  async function sairConta() {
    limparMensagem();

    try {
      await auth.signOut();

      mostrarMensagem(
        "✅ Você saiu da sua conta."
      );

      setTimeout(
        function () {
          telaLogin();
        },
        400
      );

    } catch (erro) {
      console.error(
        "CNDBcoin: erro ao sair:",
        erro
      );

      mostrarMensagem(
        traduzirErroFirebase(erro),
        "erro"
      );
    }
  }

  /* =========================================================
     ERROS FIREBASE
     ========================================================= */

  function traduzirErroFirebase(erro) {
    var codigo =
      erro && erro.code
        ? erro.code
        : "";

    switch (codigo) {

      case "auth/email-already-in-use":
        return "Este e-mail já possui uma conta na Arena CNDB.";

      case "auth/invalid-email":
        return "O endereço de e-mail informado é inválido.";

      case "auth/weak-password":
        return "A senha é muito fraca. Use pelo menos 6 caracteres.";

      case "auth/user-not-found":
        return "Conta não encontrada.";

      case "auth/wrong-password":
        return "Senha incorreta.";

      case "auth/invalid-login-credentials":
      case "auth/invalid-credential":
        return "E-mail ou senha incorretos.";

      case "auth/user-disabled":
        return "Esta conta foi desativada.";

      case "auth/too-many-requests":
        return "Muitas tentativas. Aguarde um pouco e tente novamente.";

      case "auth/network-request-failed":
        return "Falha de conexão. Verifique sua internet.";

      case "auth/operation-not-allowed":
        return "O login por e-mail e senha ainda não está habilitado no Firebase.";

      case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
        return "A chave API configurada no Firebase não foi aceita.";

      default:
        if (
          erro &&
          erro.message
        ) {
          return "Erro Firebase: " + erro.message;
        }

        return "Ocorreu um erro ao acessar sua conta.";
    }
  }

  /* =========================================================
     INICIALIZAÇÃO
     ========================================================= */

  function iniciarCNDBcoin() {
    criarEstilo();
    criarInterface();

    iniciarFirebase()
      .then(function (ok) {

        if (!ok) {
          console.warn(
            "CNDBcoin: Firebase não pôde ser iniciado."
          );
          return;
        }

        auth.onAuthStateChanged(
          function (usuario) {

            var overlay =
              document.getElementById(
                "cndbcoin-overlay"
              );

            if (
              !overlay ||
              overlay.style.display !== "flex"
            ) {
              return;
            }

            if (usuario) {
              mostrarPerfil(usuario);
            } else {
              telaLogin();
            }
          }
        );
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      iniciarCNDBcoin
    );

  } else {
    iniciarCNDBcoin();
  }

})();
