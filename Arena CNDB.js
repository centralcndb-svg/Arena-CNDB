(function () {
  const firebaseConfig = {
    apiKey: "AIzaSyBAj0HK2Dq4lE5tHgZfiC-7XbxfiN5H05w",
    authDomain: "arena-cndb.firebaseapp.com",
    projectId: "arena-cndb",
    storageBucket: "arena-cndb.firebasestorage.app",
    messagingSenderId: "799022193573",
    appId: "1:799022193573:web:65724effdb80f2d3afe64c"
  };

  let tecnicoAtual = null;
  let db = null;

  function slug(valor) {
    return String(valor || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function carregarScript(src) {
    return new Promise((resolve, reject) => {
      const existente = document.querySelector(
        'script[src="' + src + '"]'
      );

      if (existente) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function iniciarFirebase() {
    if (!window.firebase) {
      await carregarScript(
        "https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js"
      );

      await carregarScript(
        "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js"
      );
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    db = firebase.firestore();

    console.log("Arena CNDB: Firestore conectado.");
  }

  function idTecnico(tec) {
    if (!tec) return null;

    return "tecnico-" + slug(
      tec.insta ||
      tec.instagram ||
      tec.arroba ||
      tec.nome
    );
  }

  function limparLinksDaFicha() {
    const tela = document.getElementById("screen-tecnico-perfil");
    if (!tela) return;

    tela.querySelectorAll("[data-cndb-link]").forEach(el => {
      el.removeAttribute("data-cndb-link");
      el.style.removeProperty("cursor");
    });
  }

  async function carregarTecnico() {
    if (!db || !tecnicoAtual) return;

    const id = idTecnico(tecnicoAtual);
    if (!id) return;

    limparLinksDaFicha();

    try {
      const doc = await db
        .collection("tecnicos")
        .doc(id)
        .get();

      if (!doc.exists) return;

      const dados = doc.data() || {};
      const links = dados.links || {};

      Object.keys(links).forEach(campoId => {
        const elemento = document.getElementById(campoId);

        if (elemento && links[campoId]) {
          elemento.setAttribute(
            "data-cndb-link",
            links[campoId]
          );

          elemento.style.cursor = "pointer";
        }
      });

      console.log(
        "Arena CNDB: técnico carregado:",
        id
      );

    } catch (erro) {
      console.error(
        "Erro ao carregar técnico:",
        erro
      );
    }
  }

  async function salvarTecnico() {
    if (!db || !tecnicoAtual) {
      alert("Abra primeiro a ficha de um técnico.");
      return;
    }

    const id = idTecnico(tecnicoAtual);

    const tela =
      document.getElementById("screen-tecnico-perfil");

    if (!id || !tela) return;

    const links = {};

    tela
      .querySelectorAll("[data-cndb-link]")
      .forEach(el => {

        if (!el.id) {
          el.id =
            id +
            "-campo-" +
            Math.random()
              .toString(36)
              .slice(2, 8);
        }

        links[el.id] =
          el.getAttribute("data-cndb-link") || "";
      });

    try {
      await db
        .collection("tecnicos")
        .doc(id)
        .set(
          {
            id: id,

            nome:
              tecnicoAtual.nome || "",

            insta:
              tecnicoAtual.insta ||
              tecnicoAtual.instagram ||
              tecnicoAtual.arroba ||
              "",

            equipe:
              tecnicoAtual.equipe || "",

            links: links,

            atualizadoEm:
              firebase.firestore
                .FieldValue
                .serverTimestamp()
          },
          { merge: true }
        );

      alert("✅ Técnico salvo online.");

    } catch (erro) {
      console.error(erro);

      alert(
        "Não foi possível salvar online: " +
        erro.message
      );
    }
  }

  function conectarPerfil() {
    const original =
      window.abrirPerfilTecnico;

    if (typeof original !== "function") {
      setTimeout(conectarPerfil, 500);
      return;
    }

    if (original.__cndbOnline) return;

    function novaFuncao(tec) {
      tecnicoAtual = tec;

      limparLinksDaFicha();

      const resultado =
        original.apply(this, arguments);

      setTimeout(
        carregarTecnico,
        100
      );

      return resultado;
    }

    novaFuncao.__cndbOnline = true;

    window.abrirPerfilTecnico =
      novaFuncao;
  }

  function conectarSalvar() {
    document.addEventListener(
      "click",
      function (evento) {

        const botao =
          evento.target.closest("button");

        if (!botao) return;

        const texto =
          (botao.textContent || "")
            .toLowerCase();

        if (
          texto.includes("salvar") ||
          texto.includes("💾")
        ) {
          const tela =
            document.getElementById(
              "screen-tecnico-perfil"
            );

          if (
            tela &&
            tela.classList.contains("active")
          ) {
            setTimeout(
              salvarTecnico,
              150
            );
          }
        }
      },
      true
    );
  }

  iniciarFirebase()
    .then(() => {
      conectarPerfil();
      conectarSalvar();

      console.log(
        "Arena CNDB: técnicos individuais online ativados."
      );
    })
    .catch(erro => {
      console.error(
        "Arena CNDB: Firebase não iniciou.",
        erro
      );
    });

})();
