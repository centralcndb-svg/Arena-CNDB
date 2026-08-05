/* Arena CNDB - CNDBcoin v1 */
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
  } catch (e) {}

  function el(id) {
    return document.getElementById(id);
  }

  function criarUI() {
    if (el("cndbcoin-open")) return;

    var box = document.createElement("div");

    box.innerHTML =
      '<button id="cndbcoin-open" type="button">🪙 CNDBcoin</button>' +
      '<div id="cndbcoin-modal" style="display:none">' +
        '<div class="cndbcoin-card">' +
          '<button id="cndbcoin-close" type="button">✕</button>' +
          '<h2>🪙 Minha Conta</h2>' +

          '<div id="cndbcoin-login">' +
            '<input id="cndbcoin-email" type="email" placeholder="E-mail">' +
            '<input id="cndbcoin-pass" type="password" placeholder="Senha">' +
            '<button id="cndbcoin-enter" type="button">Entrar</button>' +
          '</div>' +

          '<div id="cndbcoin-wallet" style="display:none">' +
            '<div id="cndbcoin-user"></div>' +

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

    document.body.appendChild(box);

    var css = document.createElement("style");

    css.textContent =
      "#cndbcoin-open{" +
        "position:fixed;" +
        "right:12px;" +
        "bottom:72px;" +
        "z-index:9997;" +
        "padding:11px 15px;" +
        "border-radius:24px;" +
        "font-weight:800;" +
      "}" +

      "#cndbcoin-modal{" +
        "position:fixed;" +
        "inset:0;" +
        "z-index:99999;" +
        "background:rgba(3,10,20,.94);" +
        "padding:20px;" +
        "color:#fff;" +
      "}" +

      ".cndbcoin-card{" +
        "max-width:480px;" +
        "margin:8vh auto;" +
        "background:#0c1929;" +
        "padding:20px;" +
        "border-radius:16px;" +
      "}" +

      "#cndbcoin-close{" +
        "float:right;" +
      "}" +

      ".cndbcoin-card input," +
      ".cndbcoin-card button{" +
        "box-sizing:border-box;" +
        "padding:11px;" +
        "margin:5px 0;" +
      "}" +

      ".cndbcoin-card input{" +
        "width:100%;" +
      "}" +

      ".cndbcoin-balance{" +
        "font-size:26px;" +
        "margin:22px 0;" +
      "}";

    document.head.appendChild(css);

    el("cndbcoin-open").onclick = function () {
      el("cndbcoin-modal").style.display = "block";
      atualizarTela();
    };

    el("cndbcoin-close").onclick = function () {
      el("cndbcoin-modal").style.display = "none";
    };

    el("cndbcoin-enter").onclick = login;
    el("cndbcoin-refresh").onclick = carregarSaldo;
    el("cndbcoin-logout").onclick = logout;
  }

  async function login() {
    var email = el("cndbcoin-email").value.trim();
    var password = el("cndbcoin-pass").value;

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
          (j.error && j.error.message) ||
          "Falha no login"
        );
      }

      token = j.idToken;

      user = {
        uid: j.localId,
        email: j.email
      };

      sessionStorage.setItem(
        "cndb_coin_token",
        token
      );

      sessionStorage.setItem(
        "cndb_coin_user",
        JSON.stringify(user)
      );

      atualizarTela();
      await carregarSaldo();

    } catch (e) {
      alert("Conta CNDB: " + e.message);
    }
  }

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

      el("cndbcoin-balance").textContent =
        f.balance &&
        (
          f.balance.integerValue ||
          f.balance.doubleValue
        ) ||
        "0";

    } catch (e) {
      alert(
        "Carteira CNDBcoin: " + e.message
      );
    }
  }

  function atualizarTela() {
    var conectado = !!(token && user);

    el("cndbcoin-login").style.display =
      conectado ? "none" : "block";

    el("cndbcoin-wallet").style.display =
      conectado ? "block" : "none";

    if (conectado) {
      el("cndbcoin-user").textContent =
        user.email || "Conta CNDB";

      carregarSaldo();
    }
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
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      criarUI
    );
  } else {
    criarUI();
  }

})();
