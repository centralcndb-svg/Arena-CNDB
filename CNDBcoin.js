/* =========================================================
   ARENA CNDB - CNDBcoin
   Login + Cadastro + Perfil
   ========================================================= */

(function () {
  "use strict";

  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyBAj0HK2Dq4lE5tHgzfiC-7XbxfiN5H05w",
    projectId: "arena-cndb",
    authDomain: "arena-cndb.firebaseapp.com"
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
    if (firebaseReady) return true;

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

      return true;
    } catch (erro) {
      console.error("CNDBcoin: erro ao iniciar Firebase:", erro);
      return false;
    }
  }

  /* =========================================================
     CSS
     ========================================================= */

  function criarEstilo() {
    if (document.getElementById("cndbcoin-style")) return;

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

      botao.addEventListener("click", abrirCNDBcoin);

      document.body.appendChild(botao);
    }

    if (!document.getElementById("cndbcoin-overlay")) {
      var overlay = document.createElement("div");

      overlay.id = "cndbcoin-overlay";

      overlay.innerHTML = `
        <div id="cndbcoin-box">

          <button id="cndbcoin-close" type="button">×</button>

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
        .addEventListener("click", fecharCNDBcoin);

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
        mostrarMensagem(
          "Não foi possível conectar ao sistema da Arena CNDB.",
          "erro"
        );
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
     LOGIN
     ========================================================= */

  function telaLogin() {
    limparMensagem();

    var content = document.getElementById("cndbcoin-content");

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
        <span id="cndb-cadastro-link" class="cndbcoin-link">
          Cadastre-se
        </span>
      </div>
    `;

    document
      .getElementById("cndb-login-btn")
      .addEventListener("click", fazerLogin);

    document
      .getElementById("cndb-cadastro-btn")
      .addEventListener("click", telaCadastro);

    document
      .getElementById("cndb-cadastro-link")
      .addEventListener("click", telaCadastro);
  }

  async function fazerLogin() {
    limparMensagem();

    var email = document
      .getElementById("cndb-login-email")
      .value.trim();

    var senha = document
      .getElementById("cndb-login-senha")
      .value;

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
      console.error(erro);

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

    var content = document.getElementById("cndbcoin-content");

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
          Voltar
        </button>

      </div>

      <div class="cndbcoin-small">
        Sua conta será vinculada à Arena CNDB.
      </div>
    `;

    document
      .getElementById("cndb-criar-conta")
      .addEventListener("click", criarConta);

    document
      .getElementById("cndb-voltar-login")
      .addEventListener("click", telaLogin);
  }

  async function criarConta() {
    limparMensagem();

    var nome = document
      .getElementById("cndb-cadastro-nome")
      .value.trim();

    var instagram = limparInstagram(
      document.getElementById("cndb-cadastro-instagram").value
    );

    var email = document
      .getElementById("cndb-cadastro-email")
      .value.trim()
      .toLowerCase();

    var senha = document
      .getElementById("cndb-cadastro-senha")
      .value;

    var confirmar = document
      .getElementById("cndb-cadastro-confirmar")
      .value;

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
      mostrarMensagem(
        "A senha precisa ter pelo menos 6 caracteres.",
        "erro"
      );
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

      var credencial =
        await auth.createUserWithEmailAndPassword(email, senha);

      var usuario = credencial.user;

      if (!usuario) {
        throw new Error("Usuário não criado.");
      }

      await usuario.updateProfile({
        displayName: nome
      });

      await db
        .collection("users")
        .doc(usuario.uid)
        .set({
          uid: usuario.uid,
          name: nome,
          displayName: nome,
          instagram: instagram,
          email: usuario.email,
          photoURL: "",
          accountType: "user",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

      mostrarMensagem(
        "✅ Conta Arena CNDB criada com sucesso!"
      );

      setTimeout(function () {
        telaPerfil(usuario);
      }, 900);

    } catch (erro) {

      console.error(
        "CNDBcoin: erro no cadastro:",
        erro
      );

      /*
       Se o Authentication criou a conta mas o Firestore
       recusou o documento, tentamos remover a conta recém-criada
       para evitar cadastro incompleto.
      */

      if (
        auth &&
        auth.currentUser &&
        erro &&
        erro.code === "permission-denied"
      ) {
        try {
          await auth.currentUser.delete();
        } catch (e) {
          console.warn(
            "Não foi possível desfazer usuário incompleto:",
            e
          );
        }
      }

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
     PERFIL
     ========================================================= */

  async function telaPerfil(usuario) {
    limparMensagem();

    var content = document.getElementById("cndbcoin-content");

    content.innerHTML = `
      <div class="cndbcoin-profile">

        <div class="cndbcoin-profile-name">
          ${escaparHTML(usuario.displayName || "Usuário CNDB")}
        </div>

        <div class="cndbcoin-profile-line">
          Carregando perfil...
        </div>

      </div>

      <div class="cndbcoin-actions">

        <button
          id="cndb-sair"
          class="cndbcoin-btn cndbcoin-btn-secondary"
          type="button">
          Sair
        </button>

      </div>
    `;

    document
      .getElementById("cndb-sair")
      .addEventListener("click", sair);

    try {

      var doc = await db
        .collection("users")
        .doc(usuario.uid)
        .get();

      var dados = doc.exists ? doc.data() : {};

      var nome =
        dados.name ||
        dados.displayName ||
        usuario.displayName ||
        "Usuário CNDB";

      var instagram =
        dados.instagram
          ? "@" + dados.instagram
          : "Instagram não informado";

      var tipo =
        dados.accountType === "admin"
          ? "Administrador"
          : dados.accountType === "coach"
          ? "Técnico"
          : "Usuário";

      content.querySelector(".cndbcoin-profile").innerHTML = `
        <div class="cndbcoin-profile-name">
          👤 ${escaparHTML(nome)}
        </div>

        <div class="cndbcoin-profile-line">
          ${escaparHTML(instagram)}
        </div>

        <div class="cndbcoin-profile-line">
          ${escaparHTML(usuario.email || "")}
        </div>

        <div class="cndbcoin-profile-line">
          Tipo de conta: <strong>${escaparHTML(tipo)}</strong>
        </div>
      `;

    } catch (erro) {

      console.error(
        "CNDBcoin: erro ao carregar perfil:",
        erro
      );

      mostrarMensagem(
        "A conta está conectada, mas não foi possível carregar os dados do perfil.",
        "erro"
      );

    }
  }

  /* =========================================================
     SESSÃO
     ========================================================= */

  function verificarSessao() {
    if (!auth) {
      telaLogin();
      return;
    }

    var usuario = auth.currentUser;

    if (usuario) {
      telaPerfil(usuario);
    } else {
      telaLogin();
    }
  }

  async function sair() {
    try {
      await auth.signOut();

      mostrarMensagem("Sessão encerrada.");

      setTimeout(function () {
        telaLogin();
      }, 300);

    } catch (erro) {

      mostrarMensagem(
        "Não foi possível sair da conta.",
        "erro"
      );

    }
  }

  /* =========================================================
     ERROS FIREBASE
     ========================================================= */

  function traduzirErroFirebase(erro) {
    var codigo = erro && erro.code ? erro.code : "";

    switch (codigo) {

      case "auth/email-already-in-use":
        return "Este e-mail já possui uma conta na Arena CNDB.";

      case "auth/invalid-email":
        return "O e-mail informado não é válido.";

      case "auth/weak-password":
        return "A senha é muito fraca. Use pelo menos 6 caracteres.";

      case "auth/user-not-found":
        return "Conta não encontrada.";

      case "auth/wrong-password":
        return "Senha incorreta.";

      case "auth/invalid-login-credentials":
      case "auth/invalid-credential":
        return "E-mail ou senha incorretos.";

      case "auth/too-many-requests":
        return "Muitas tentativas. Aguarde um pouco e tente novamente.";

      case "auth/network-request-failed":
        return "Falha de conexão. Verifique sua internet.";

      case "permission-denied":
      case "firestore/permission-denied":
        return "O Firebase bloqueou esta operação pelas regras de segurança.";

      default:
        return "Não foi possível concluir a operação. Tente novamente.";
    }
  }

  /* =========================================================
     INICIALIZAÇÃO
     ========================================================= */

  function iniciarCNDBcoin() {
    criarEstilo();
    criarInterface();

    iniciarFirebase().then(function (ok) {

      if (!ok) {
        console.error(
          "CNDBcoin: Firebase não pôde ser iniciado."
        );
        return;
      }

      auth.onAuthStateChanged(function () {
        /*
          Não abrimos a janela automaticamente.
          Apenas mantemos o estado da autenticação atualizado.
        */
      });

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
