/* ARENA CNDB - CNDBcoin v2.3
   Cadastro + Login + Perfil + Carteira
*/

(function () {
  "use strict";

  var CFG = {
    apiKey: "AIzaSyBAj0HK2Dq4lE5tHgZfiC-7XbxfiN5H05w",
    projectId: "arena-cndb"
  };

  var token = sessionStorage.getItem("cndb_coin_token") || "";
  var currentUser = null;

  try {
    currentUser = JSON.parse(
      sessionStorage.getItem("cndb_coin_user") || "null"
    );
  } catch (error) {
    currentUser = null;
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function createInterface() {
    if (byId("cndbcoin-open")) {
      return;
    }

    var root = document.createElement("div");

    root.innerHTML = `
      <button id="cndbcoin-open" type="button">
        🪙 CNDBcoin
      </button>

      <div id="cndbcoin-modal" style="display:none;">
        <div class="cndbcoin-card">

          <button id="cndbcoin-close" type="button">
            ✕
          </button>

          <h2>🪙 Minha Conta</h2>

          <div id="cndbcoin-login">

            <input
              id="cndbcoin-email"
              type="email"
              placeholder="E-mail"
            />

            <input
              id="cndbcoin-password"
              type="password"
              placeholder="Senha"
            />

            <button
              id="cndbcoin-login-button"
              class="cndbcoin-primary"
              type="button"
            >
              ENTRAR
            </button>

            <p class="cndbcoin-info">
              Ainda não possui uma conta?
            </p>

            <button
              id="cndbcoin-register-button"
              class="cndbcoin-secondary"
              type="button"
            >
              👤 CRIAR MINHA CONTA
            </button>

          </div>

          <div
            id="cndbcoin-register"
            style="display:none;"
          >

            <h3>👤 Criar Conta Arena CNDB</h3>

            <input
              id="cndbcoin-name"
              type="text"
              placeholder="Nome / Apelido"
            />

            <input
              id="cndbcoin-instagram"
              type="text"
              placeholder="@Instagram"
            />

            <input
              id="cndbcoin-register-email"
              type="email"
              placeholder="E-mail"
            />

            <input
              id="cndbcoin-register-password"
              type="password"
              placeholder="Senha"
            />

            <input
              id="cndbcoin-register-password2"
              type="password"
              placeholder="Confirmar senha"
            />

            <button
              id="cndbcoin-create-account"
              class="cndbcoin-primary"
              type="button"
            >
              CRIAR CONTA
            </button>

            <button
              id="cndbcoin-back-login"
              type="button"
            >
              ← VOLTAR
            </button>

          </div>

          <div
            id="cndbcoin-wallet"
            style="display:none;"
          >

            <div class="cndbcoin-profile">

              <div class="cndbcoin-avatar">
                👤
              </div>

              <div>
                <div id="cndbcoin-profile-name">
                  Conta Arena CNDB
                </div>

                <div id="cndbcoin-profile-instagram">
                </div>

                <div id="cndbcoin-profile-email">
                </div>
              </div>

            </div>

            <div class="cndbcoin-wallet-box">

              <span>MEU SALDO</span>

              <div class="cndbcoin-number">
                🪙
                <strong id="cndbcoin-balance">
                  0
                </strong>
              </div>

              <b>CNDBcoins</b>

            </div>

            <button
              id="cndbcoin-refresh"
              class="cndbcoin-secondary"
              type="button"
            >
              🔄 ATUALIZAR SALDO
            </button>

            <button
              id="cndbcoin-logout"
              type="button"
            >
              SAIR
            </button>

          </div>

        </div>
      </div>
    `;

    document.body.appendChild(root);

    createStyles();
    createEvents();
    updateInterface();
  }

  function createStyles() {
    if (byId("cndbcoin-style")) {
      return;
    }

    var style = document.createElement("style");

    style.id = "cndbcoin-style";

    style.textContent = `
      #cndbcoin-open {
        position: fixed;
        right: 14px;
        bottom: 72px;
        z-index: 99990;
        background: #ffffff;
        color: #111111;
        border: 2px solid #d8a51d;
        border-radius: 30px;
        padding: 13px 19px;
        font-size: 16px;
        font-weight: 900;
        box-shadow: 0 6px 20px rgba(0,0,0,.4);
      }

      #cndbcoin-modal {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(0,8,18,.94);
        padding: 18px;
        overflow-y: auto;
        box-sizing: border-box;
      }

      .cndbcoin-card {
        position: relative;
        width: 100%;
        max-width: 500px;
        margin: 7vh auto;
        box-sizing: border-box;
        padding: 25px;
        border-radius: 22px;
        background: #0c1a2a;
        color: #ffffff;
        border: 1px solid rgba(255,183,0,.25);
        box-shadow: 0 15px 45px rgba(0,0,0,.45);
      }

      .cndbcoin-card h2 {
        margin: 5px 55px 25px 0;
        font-size: 29px;
      }

      .cndbcoin-card h3 {
        color: #ffb800;
        margin-top: 5px;
      }

      #cndbcoin-close {
        position: absolute;
        right: 15px;
        top: 15px;
        width: 48px;
        height: 48px;
        border-radius: 8px;
        font-size: 22px;
      }

      .cndbcoin-card input {
        display: block;
        width: 100%;
        box-sizing: border-box;
        margin: 11px 0;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #68788b;
        background: #ffffff;
        color: #111111;
        font-size: 16px;
      }

      .cndbcoin-card button {
        padding: 13px 17px;
        margin: 8px 0;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
      }

      .cndbcoin-primary {
        background: #ffb800;
        color: #08111d;
        border: none;
        font-weight: 900;
      }

      .cndbcoin-secondary {
        background: #14283d;
        color: #ffffff;
        border: 1px solid #ffb800;
        font-weight: 800;
      }

      .cndbcoin-info {
        color: #bec9d5;
        margin-top: 22px;
      }

      .cndbcoin-profile {
        display: flex;
        align-items: center;
        gap: 14px;
        background: #13263a;
        border-radius: 15px;
        padding: 15px;
      }

      .cndbcoin-avatar {
        width: 58px;
        height: 58px;
        min-width: 58px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #ffb800;
        border-radius: 50%;
        font-size: 28px;
      }

      #cndbcoin-profile-name {
        font-size: 20px;
        font-weight: 900;
      }

      #cndbcoin-profile-instagram {
        color: #ffb800;
        margin-top: 3px;
      }

      #cndbcoin-profile-email {
        color: #aebbc9;
        font-size: 13px;
        margin-top: 3px;
      }

      .cndbcoin-wallet-box {
        margin: 22px 0;
        padding: 22px;
        text-align: center;
        background: #071421;
        border-radius: 15px;
      }

      .cndbcoin-wallet-box span {
        display: block;
        color: #9eacbb;
        font-size: 12px;
        margin-bottom: 7px;
      }

      .cndbcoin-number {
        font-size: 32px;
        margin: 6px 0;
      }
    `;

    document.head.appendChild(style);
  }

  function createEvents() {
    byId("cndbcoin-open").onclick = function () {
      byId("cndbcoin-modal").style.display = "block";
      updateInterface();
    };

    byId("cndbcoin-close").onclick = function () {
      byId("cndbcoin-modal").style.display = "none";
    };

    byId("cndbcoin-register-button").onclick = function () {
      byId("cndbcoin-login").style.display = "none";
      byId("cndbcoin-register").style.display = "block";
      byId("cndbcoin-wallet").style.display = "none";
    };

    byId("cndbcoin-back-login").onclick = function () {
      byId("cndbcoin-register").style.display = "none";
      byId("cndbcoin-login").style.display = "block";
    };

    byId("cndbcoin-login-button").onclick = login;
    byId("cndbcoin-create-account").onclick = register;
    byId("cndbcoin-refresh").onclick = loadBalance;
    byId("cndbcoin-logout").onclick = logout;
  }

  async function register() {
    var name = byId("cndbcoin-name").value.trim();

    var instagram =
      byId("cndbcoin-instagram").value.trim();

    var email =
      byId("cndbcoin-register-email")
        .value
        .trim()
        .toLowerCase();

    var password =
      byId("cndbcoin-register-password").value;

    var password2 =
      byId("cndbcoin-register-password2").value;

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
          translateFirebaseError(
            data.error && data.error.message
          )
        );
      }

      token = data.idToken;

      currentUser = {
        uid: data.localId,
        email: data.email,
        name: name,
        instagram: instagram
      };

      saveSession();

      await saveProfile();

      updateInterface();

      alert("✅ Conta Arena CNDB criada com sucesso!");

    } catch (error) {
      alert(
        "Cadastro Arena CNDB: " +
        error.message
      );
    }
  }

  async function login() {
    var email =
      byId("cndbcoin-email")
        .value
        .trim()
        .toLowerCase();

    var password =
      byId("cndbcoin-password").value;

    if (!email || !password) {
      alert("Informe o e-mail e a senha.");
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
          translateFirebaseError(
            data.error && data.error.message
          )
        );
      }

      token = data.idToken;

      currentUser = {
        uid: data.localId,
        email: data.email
      };

      await loadProfile();

      saveSession();

      updateInterface();

      await loadBalance();

    } catch (error) {
      alert(
        "Conta Arena CNDB: " +
        error.message
      );
    }
  }

  async function saveProfile() {
    if (!token || !currentUser) {
      return;
    }

    var url =
      "https://firestore.googleapis.com/v1/projects/" +
      CFG.projectId +
      "/databases/(default)/documents/users/" +
      currentUser.uid;

    var body = {
      fields: {
        uid: {
          stringValue: currentUser.uid
        },
        name: {
          stringValue: currentUser.name || ""
        },
        instagram: {
          stringValue: currentUser.instagram || ""
        },
        email: {
          stringValue: currentUser.email || ""
        },
        accountType: {
          stringValue: "user"
        },
        createdAt: {
          timestampValue: new Date().toISOString()
        }
      }
    };

    var response = await fetch(
      url,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(body)
      }
    );

    var data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error && data.error.message
          ? data.error.message
          : "Erro ao salvar o perfil."
      );
    }
  }

  async function loadProfile() {
    if (!token || !currentUser) {
      return;
    }

    try {
      var response = await fetch(
        "https://firestore.googleapis.com/v1/projects/" +
          CFG.projectId +
          "/databases/(default)/documents/users/" +
          currentUser.uid,
        {
          headers: {
            "Authorization": "Bearer " + token
          }
        }
      );

      if (!response.ok) {
        return;
      }

      var data = await response.json();

      var fields = data.fields || {};

      if (
        fields.name &&
        fields.name.stringValue
      ) {
        currentUser.name =
          fields.name.stringValue;
      }

      if (
        fields.instagram &&
        fields.instagram.stringValue
      ) {
        currentUser.instagram =
          fields.instagram.stringValue;
      }

    } catch (error) {
      console.log(
        "Arena CNDB profile error:",
        error
      );
    }
  }

  async function loadBalance() {
    if (!token || !currentUser) {
      return;
    }

    try {
      var response = await fetch(
        "https://firestore.googleapis.com/v1/projects/" +
          CFG.projectId +
          "/databases/(default)/documents/wallets/" +
          currentUser.uid,
        {
          headers: {
            "Authorization": "Bearer " + token
          }
        }
      );

      if (response.status === 404) {
        byId("cndbcoin-balance").textContent = "0";
        return;
      }

      var data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error && data.error.message
            ? data.error.message
            : "Erro ao carregar saldo."
        );
      }

      var fields = data.fields || {};

      var balance = 0;

      if (fields.balance) {
        balance =
          fields.balance.integerValue ||
          fields.balance.doubleValue ||
          0;
      }

      byId("cndbcoin-balance").textContent =
        Number(balance).toLocaleString("pt-BR");

    } catch (error) {
      alert(
        "Carteira CNDBcoin: " +
        error.message
      );
    }
  }

  function saveSession() {
    sessionStorage.setItem(
      "cndb_coin_token",
      token
    );

    sessionStorage.setItem(
      "cndb_coin_user",
      JSON.stringify(currentUser)
    );
  }

  function updateInterface() {
    var logged =
      Boolean(token && currentUser);

    byId("cndbcoin-login").style.display =
      logged ? "none" : "block";

    byId("cndbcoin-register").style.display =
      "none";

    byId("cndbcoin-wallet").style.display =
      logged ? "block" : "none";

    if (logged) {
      byId("cndbcoin-profile-name").textContent =
        currentUser.name ||
        "Conta Arena CNDB";

      byId("cndbcoin-profile-instagram").textContent =
        currentUser.instagram || "";

      byId("cndbcoin-profile-email").textContent =
        currentUser.email || "";

      loadBalance();
    }
  }

  function logout() {
    token = "";
    currentUser = null;

    sessionStorage.removeItem(
      "cndb_coin_token"
    );

    sessionStorage.removeItem(
      "cndb_coin_user"
    );

    updateInterface();
  }

  function translateFirebaseError(message) {
    if (!message) {
      return "Ocorreu um erro.";
    }

    if (
      message.indexOf("EMAIL_EXISTS") !== -1
    ) {
      return "Este e-mail já possui uma conta.";
    }

    if (
      message.indexOf(
        "INVALID_LOGIN_CREDENTIALS"
      ) !== -1
    ) {
      return "E-mail ou senha incorretos.";
    }

    if (
      message.indexOf("INVALID_PASSWORD") !== -1
    ) {
      return "E-mail ou senha incorretos.";
    }

    if (
      message.indexOf("INVALID_EMAIL") !== -1
    ) {
      return "E-mail inválido.";
    }

    if (
      message.indexOf("WEAK_PASSWORD") !== -1
    ) {
      return "A senha precisa ter pelo menos 6 caracteres.";
    }

    return message;
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      createInterface
    );
  } else {
    createInterface();
  }

})();
