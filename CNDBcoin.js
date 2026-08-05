/* ARENA CNDB - CNDBcoin v2.1
   Cadastro + Login + Carteira
*/

(function () {
  "use strict";

  var CFG = {
    apiKey: "AIzaSyBAj0HK2Dq4lE5tHgZfiC-7XbxfiN5H05w",
    projectId: "arena-cndb"
  };

  var token = sessionStorage.getItem("cndb_coin_token") || "";
  var user = null;

  try {
    user = JSON.parse(
      sessionStorage.getItem("cndb_coin_user") || "null"
    );
  } catch (e) {
    user = null;
  }

  function get(id) {
    return document.getElementById(id);
  }

  function start() {
    if (get("cndbcoin-open")) return;

    var wrap = document.createElement("div");

    wrap.innerHTML =
      '<button id="cndbcoin-open" type="button">🪙 CNDBcoin</button>' +

      '<div id="cndbcoin-modal" style="display:none">' +
        '<div class="cndbcoin-card">' +

          '<button id="cndbcoin-close" type="button">✕</button>' +

          '<h2>🪙 Minha Conta</h2>' +

          '<div id="cndbcoin-login">' +

            '<input id="cndbcoin-email" type="email" placeholder="E-mail">' +

            '<input id="cndbcoin-pass" type="password" placeholder="Senha">' +

            '<button id="cndbcoin-enter" type="button">' +
              'Entrar' +
            '</button>' +

            '<p class="cndbcoin-question">' +
              'Ainda não possui uma conta?' +
            '</p>' +

            '<button id="cndbcoin-register-open" type="button">' +
              '👤 Criar minha conta' +
            '</button>' +

          '</div>' +

          '<div id="cndbcoin-register" style="display:none">' +

            '<h3>👤 Criar Conta Arena CNDB</h3>' +

            '<input id="cndbcoin-name" type="text" placeholder="Nome / Apelido">' +

            '<input id="cndbcoin-instagram" type="text" placeholder="@Instagram">' +

            '<input id="cndbcoin-new-email" type="email" placeholder="E-mail">' +

            '<input id="cndbcoin-new-pass" type="password" placeholder="Senha">' +

            '<input id="cndbcoin-new-pass2" type="password" placeholder="Confirmar senha">' +

            '<button id="cndbcoin-create" type="button">' +
              'CRIAR CONTA' +
            '</button>' +

            '<button id="cndbcoin-login-back" type="button">' +
              '← Voltar' +
            '</button>' +

          '</div>' +

          '<div id="cndbcoin-wallet" style="display:none">' +

            '<div id="cndbcoin-profile-name"></div>' +

            '<div id="cndbcoin-profile-instagram"></div>' +

            '<div id="cndbcoin-profile-email"></div>' +

            '<div class="cndbcoin-balance">' +
              '🪙 <b id="cndbcoin-balance">0</b> CNDBcoins' +
            '</div>' +

            '<button id="cndbcoin-refresh" type="button">' +
              'Atualizar saldo' +
            '</button>' +

            '<button id="cndbcoin-logout" type="button">' +
              'Sair' +
            '</button>' +

          '</div>' +

        '</div>' +
      '</div>';

    document.body.appendChild(wrap);

    addStyle();
    addEvents();
    updateScreen();
  }

  function addStyle() {
    var style = document.createElement("style");

    style.textContent =
      "#cndbcoin-open{" +
        "position:fixed;" +
        "right:12px;" +
        "bottom:72px;" +
        "z-index:9997;" +
        "padding:12px 17px;" +
        "border-radius:28px;" +
        "border:1px solid #d9aa27;" +
        "background:#fff;" +
        "color:#111;" +
        "font-weight:800;" +
      "}" +

      "#cndbcoin-modal{" +
        "position:fixed;" +
        "inset:0;" +
        "z-index:99999;" +
        "background:rgba(2,10,20,.95);" +
        "padding:20px;" +
        "overflow:auto;" +
        "color:#fff;" +
      "}" +

      ".cndbcoin-card{" +
        "position:relative;" +
        "max-width:480px;" +
        "margin:8vh auto;" +
        "background:#0c1929;" +
        "padding:22px;" +
        "border-radius:18px;" +
      "}" +

      "#cndbcoin-close{" +
        "position:absolute;" +
        "right:15px;" +
        "top:15px;" +
        "width:42px;" +
        "height:42px;" +
        "font-size:20px;" +
      "}" +

      ".cndbcoin-card input{" +
        "box-sizing:border-box;" +
        "width:100%;" +
        "padding:14px;" +
        "margin:7px 0;" +
        "font-size:16px;" +
      "}" +

      ".cndbcoin-card button{" +
        "padding:12px 16px;" +
        "margin:7px 0;" +
        "font-size:16px;" +
      "}" +

      "#cndbcoin-enter," +
      "#cndbcoin-create," +
      "#cndbcoin-register-open{" +
        "background:#f0b51b;" +
        "border:0;" +
        "font-weight:800;" +
      "}" +

      ".cndbcoin-question{" +
        "margin-top:20px;" +
        "color:#bbc5d0;" +
      "}" +

      ".cndbcoin-balance{" +
        "font-size:27px;" +
        "margin:25px 0;" +
      "}" +

      "#cndbcoin-profile-name{" +
        "font-size:22px;" +
        "font-weight:800;" +
        "margin-top:15px;" +
      "}" +

      "#cndbcoin-profile-instagram{" +
        "color:#f0b51b;" +
        "margin-top:5px;" +
      "}" +

      "#cndbcoin-profile-email{" +
        "color:#bbc5d0;" +
        "margin-top:5px;" +
      "}";

    document.head.appendChild(style);
  }

  function addEvents() {
    get("cndbcoin-open").onclick = function () {
      get("cndbcoin-modal").style.display = "block";
      updateScreen();
    };

    get("cndbcoin-close").onclick = function () {
      get("cndbcoin-modal").style.display = "none";
    };

    get("cndbcoin-register-open").onclick = function () {
      get("cndbcoin-login").style.display = "none";
      get("cndbcoin-register").style.display = "block";
    };

    get("cndbcoin-login-back").onclick = function () {
      get("cndbcoin-register").style.display = "none";
      get("cndbcoin-login").style.display = "block";
    };

    get("cndbcoin-enter").onclick = login;
    get("cndbcoin-create").onclick = register;
    get("cndbcoin-refresh").onclick = loadBalance;
    get("cndbcoin-logout").onclick = logout;
  }

  async function register() {
    var name = get("cndbcoin-name").value.trim();
    var instagram = get("cndbcoin-instagram").value.trim();
    var email = get("cndbcoin-new-email").value.trim().toLowerCase();
    var password = get("cndbcoin-new-pass").value;
    var password2 = get("cndbcoin-new-pass2").value;

    if (!name) {
      alert("Informe seu nome ou apelido.");
      return;
    }

    if (!instagram) {
      alert("Informe seu Instagram.");
      return;
    }

    if (!email) {
      alert("Informe seu e-mail.");
      return;
    }

    if (password.length < 6) {
      alert("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== password2) {
      alert("As senhas não são iguais.");
      return;
    }

    if (instagram.charAt(0) !== "@") {
      instagram = "@" + instagram;
    }

    try {
      var response = await fetch(
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

      var data = await response.json();

      if (!response.ok) {
        throw new Error(
          firebaseMessage(
            data.error && data.error.message
          )
        );
      }

      token = data.idToken;

      user = {
        uid: data.localId,
        email: data.email,
        name: name,
        instagram: instagram
      };

      saveSession();

      await saveProfile();

      updateScreen();

      alert("✅ Conta Arena CNDB criada com sucesso!");

    } catch (error) {
      alert("Cadastro Arena CNDB: " + error.message);
    }
  }

  async function saveProfile() {
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
          timestampValue: new Date().toISOString()
        }
      }
    };

    var response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(body)
    });

    var data = await response.json();

    if (!response.ok) {
      throw new Error(
        (data.error && data.error.message) ||
        "Erro ao salvar perfil."
      );
    }
  }

  async function login() {
    var email =
      get("cndbcoin-email").value.trim().toLowerCase();

    var password =
      get("cndbcoin-pass").value;

    if (!email || !password) {
      alert("Informe e-mail e senha.");
      return;
    }

    try {
      var response = await fetch(
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

      var data = await response.json();

      if (!response.ok) {
        throw new Error(
          firebaseMessage(
            data.error && data.error.message
          )
        );
      }

      token = data.idToken;

      user = {
        uid: data.localId,
        email: data.email
      };

      await loadProfile();

      saveSession();
      updateScreen();
      await loadBalance();

    } catch (error) {
      alert("Conta CNDB: " + error.message);
    }
  }

  async function loadProfile() {
    if (!token || !user) return;

    try {
      var response = await fetch(
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

      if (!response.ok) return;

      var data = await response.json();
      var fields = data.fields || {};

      user.name =
        fields.name && fields.name.stringValue
          ? fields.name.stringValue
          : "";

      user.instagram =
        fields.instagram && fields.instagram.stringValue
          ? fields.instagram.stringValue
          : "";

    } catch (error) {
      console.log("CNDB profile error", error);
    }
  }

  async function loadBalance() {
    if (!token || !user) return;

    try {
      var response = await fetch(
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

      if (response.status === 404) {
        get("cndbcoin-balance").textContent = "0";
        return;
      }

      var data = await response.json();

      if (!response.ok) {
        throw new Error(
          (data.error && data.error.message) ||
          "Erro ao carregar saldo."
        );
      }

      var fields = data.fields || {};
      var balance = "0";

      if (fields.balance) {
        balance =
          fields.balance.integerValue ||
          fields.balance.doubleValue ||
          "0";
      }

      get("cndbcoin-balance").textContent =
        Number(balance).toLocaleString("pt-BR");

    } catch (error) {
      alert("Carteira CNDBcoin: " + error.message);
    }
  }

  function saveSession() {
    sessionStorage.setItem(
      "cndb_coin_token",
      token
    );

    sessionStorage.setItem(
      "cndb_coin_user",
      JSON.stringify(user)
    );
  }

  function updateScreen() {
    var logged = !!(token && user);

    get("cndbcoin-login").style.display =
      logged ? "none" : "block";

    get("cndbcoin-register").style.display =
      "none";

    get("cndbcoin-wallet").style.display =
      logged ? "block" : "none";

    if (logged) {
      get("cndbcoin-profile-name").textContent =
        user.name || "Conta Arena CNDB";

      get("cndbcoin-profile-instagram").textContent =
        user.instagram || "";

      get("cndbcoin-profile-email").textContent =
        user.email || "";

      loadBalance();
    }
  }

  function logout() {
    token = "";
    user = null;

    sessionStorage.removeItem("cndb_coin_token");
    sessionStorage.removeItem("cndb_coin_user");

    updateScreen();
  }

  function firebaseMessage(message) {
    if (!message) return "Ocorreu um erro.";

    if (message.indexOf("EMAIL_EXISTS") !== -1) {
      return "Este e-mail já possui uma conta.";
    }

    if (
      message.indexOf("INVALID_LOGIN_CREDENTIALS") !== -1 ||
      message.indexOf("INVALID_PASSWORD") !== -1
    ) {
      return "E-mail ou senha incorretos.";
    }

    if (message.indexOf("INVALID_EMAIL") !== -1) {
      return "E-mail inválido.";
    }

    if (message.indexOf("WEAK_PASSWORD") !== -1) {
      return "A senha precisa ter pelo menos 6 caracteres.";
    }

    return message;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

})();
