(function () {
  var CHAVE = "cndb_admin_edicoes_v2";

  function chave(el) {
    if (!el) return "";
    if (el.id) return "id:" + el.id;

    var tela = el.closest ? el.closest(".app-screen") : null;
    var base = tela && tela.id ? tela.id : "main";

    var lista = Array.prototype.slice.call(
      document.querySelectorAll(
        "#" + base +
        " h1,#" + base +
        " h2,#" + base +
        " h3,#" + base +
        " h4,#" + base +
        " h5,#" + base +
        " p,#" + base +
        " span:not(.cndb-stat-num),#" + base +
        " .cndb-panel-title"
      )
    );

    return base + ":" + el.tagName.toLowerCase() + ":" + lista.indexOf(el);
  }

  function editaveis() {
    return document.querySelectorAll(
      ".cndb-main h1," +
      ".cndb-main h2," +
      ".cndb-main h3," +
      ".cndb-main h4," +
      ".cndb-main h5," +
      ".cndb-main p," +
      ".cndb-main span:not(.cndb-stat-num)," +
      ".cndb-main .cndb-panel-title"
    );
  }

  function salvar() {
    var itens = {};

    editaveis().forEach(function (el) {
      var k = chave(el);
      if (!k) return;

      itens[k] = {
        html: el.innerHTML,
        link: el.getAttribute("data-cndb-link") || ""
      };
    });

    localStorage.setItem(
      CHAVE,
      JSON.stringify({
        versao: 2,
        atualizadoEm: new Date().toISOString(),
        itens: itens
      })
    );

    return true;
  }

  function restaurar() {
    try {
      var pacote = JSON.parse(localStorage.getItem(CHAVE) || "{}");
      var itens = pacote.itens || {};

      editaveis().forEach(function (el) {
        var item = itens[chave(el)];
        if (!item) return;

        if (typeof item.html === "string") {
          el.innerHTML = item.html;
        }

        if (item.link) {
          el.setAttribute("data-cndb-link", item.link);
          el.style.cursor = "pointer";
        }
      });
    } catch (e) {
      console.log("Arena CNDB: erro ao restaurar.", e);
    }
  }

  window.cndbSalvarLinks = salvar;

  restaurar();

  document.addEventListener("click", function (e) {
    var botao = e.target.closest && e.target.closest("button");
    if (!botao) return;

    if (
      botao.textContent.indexOf("Salvar") !== -1 ||
      botao.textContent.indexOf("💾") !== -1
    ) {
      setTimeout(salvar, 100);
    }
  });

  console.log("Arena CNDB: salvamento administrativo conectado.");
})();
