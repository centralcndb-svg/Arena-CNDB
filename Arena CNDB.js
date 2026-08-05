(function () {
  const CHAVE = "arena_cndb_links";

  function salvarLinks() {
    const dados = {};

    document.querySelectorAll("a[href]").forEach((link, i) => {
      if (!link.id) link.id = "cndb-link-" + i;
      dados[link.id] = link.getAttribute("href");
    });

    localStorage.setItem(CHAVE, JSON.stringify(dados));
    alert("Links salvos com sucesso!");
  }

  function restaurarLinks() {
    const salvo = localStorage.getItem(CHAVE);
    if (!salvo) return;

    try {
      const dados = JSON.parse(salvo);

      Object.keys(dados).forEach(id => {
        const link = document.getElementById(id);
        if (link) link.setAttribute("href", dados[id]);
      });
    } catch (e) {
      console.log("Arena CNDB: erro ao restaurar links.", e);
    }
  }

  restaurarLinks();

  window.cndbSalvarLinks = salvarLinks;

  console.log("Arena CNDB: módulo de links carregado.");
})();
