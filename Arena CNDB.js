(function () {
  var tecnicoAtual = null;
  var CHAVE = "cndb_tecnicos_individuais_v1";

  function slug(txt) {
    return String(txt || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function ler() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE) || "{}");
    } catch (e) {
      return {};
    }
  }

  function gravar(dados) {
    localStorage.setItem(CHAVE, JSON.stringify(dados));
  }

  var abrirOriginal = window.abrirPerfilTecnico;

  window.abrirPerfilTecnico = function (tec) {
    tecnicoAtual = tec;

    var id = "tecnico-" + slug(tec.insta || tec.nome);

    var tela = document.getElementById("screen-tecnico-perfil");
    if (tela) {
      tela.setAttribute("data-tecnico-id", id);
    }

    if (abrirOriginal) {
      abrirOriginal(tec);
    }

    restaurarTecnico();
  };

  function restaurarTecnico() {
    if (!tecnicoAtual) return;

    var id = "tecnico-" + slug(tecnicoAtual.insta || tecnicoAtual.nome);
    var banco = ler();
    var dados = banco[id];

    var tela = document.getElementById("screen-tecnico-perfil");
    if (!tela) return;

    tela.querySelectorAll("[data-cndb-link]").forEach(function (el) {
      el.removeAttribute("data-cndb-link");
      el.style.removeProperty("cursor");
    });

    if (!dados || !dados.links) return;

    Object.keys(dados.links).forEach(function (chave) {
      var el = document.getElementById(chave);

      if (el && dados.links[chave]) {
        el.setAttribute("data-cndb-link", dados.links[chave]);
        el.style.cursor = "pointer";
      }
    });
  }

  function salvarTecnico() {
    if (!tecnicoAtual) return;

    var id = "tecnico-" + slug(tecnicoAtual.insta || tecnicoAtual.nome);
    var banco = ler();

    if (!banco[id]) {
      banco[id] = {
        nome: tecnicoAtual.nome,
        insta: tecnicoAtual.insta,
        equipe: tecnicoAtual.equipe,
        links: {}
      };
    }

    var tela = document.getElementById("screen-tecnico-perfil");
    if (!tela) return;

    tela.querySelectorAll("[data-cndb-link]").forEach(function (el) {
      if (!el.id) return;

      banco[id].links[el.id] =
        el.getAttribute("data-cndb-link") || "";
    });

    banco[id].atualizadoEm = new Date().toISOString();

    gravar(banco);
  }

  var salvarOriginal = window.salvarEdicoesAdmin;

  window.salvarEdicoesAdmin = function (mostrarMensagem) {
    if (salvarOriginal) {
      salvarOriginal(false);
    }

    salvarTecnico();

    if (mostrarMensagem !== false) {
      alert("✅ Alterações do técnico salvas.");
    }
  };

  document.addEventListener("click", function (event) {
    if (!document.body.classList.contains("admin-active")) return;

    var perfil = event.target.closest("#screen-tecnico-perfil");

    if (perfil) {
      setTimeout(salvarTecnico, 200);
    }
  });

  console.log("Arena CNDB: fichas individuais dos técnicos ativadas.");
})();
