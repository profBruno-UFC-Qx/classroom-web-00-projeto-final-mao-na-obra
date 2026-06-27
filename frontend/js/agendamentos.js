document.addEventListener("DOMContentLoaded", async () => {
  redirectIfUnauthenticated(["login.html", "cadastro.html"]);

  const listaAgendamentos = document.querySelector(".lista-agendamentos");
  const botoesFiltro = document.querySelectorAll(".botao-filtro");

  if (!listaAgendamentos) {
    return;
  }

  let solicitacoes = [];
  let filtroAtual = "todos";

  botoesFiltro.forEach((botao) => {
    botao.addEventListener("click", () => {
      botoesFiltro.forEach((botaoFiltro) =>
        botaoFiltro.classList.remove("btn-primary", "active"),
      );
      botoesFiltro.forEach((botaoFiltro) =>
        botaoFiltro.classList.add("btn-outline-primary"),
      );
      botao.classList.remove("btn-outline-primary");
      botao.classList.add("btn-primary", "active");
      filtroAtual = botao.textContent.trim().toLowerCase();
      renderizarSolicitacoes(solicitacoes, filtroAtual, listaAgendamentos);
    });
  });

  try {
    const response = await getJson("/solicitacaos?populate=*");
    solicitacoes = response?.data || [];
    renderizarSolicitacoes(solicitacoes, filtroAtual, listaAgendamentos);
  } catch (error) {
    console.error(error);
    listaAgendamentos.innerHTML =
      '<p class="text-danger">Não foi possível carregar os agendamentos.</p>';
  }
});

function renderizarSolicitacoes(solicitacoes, filtroAtual, container) {
  const itensFiltrados = solicitacoes.filter((solicitacao) => {
    const status = solicitacao.attributes?.statusSolicitacao || "PENDENTE";

    if (filtroAtual === "todos") {
      return true;
    }

    if (filtroAtual === "pendentes") {
      return status === "PENDENTE";
    }

    if (filtroAtual === "aceitos") {
      return status === "ACEITA";
    }

    if (filtroAtual === "concluídos") {
      return status === "CONCLUIDA";
    }

    return status === "RECUSADA";
  });

  if (!itensFiltrados.length) {
    container.innerHTML =
      '<p class="text-muted">Nenhum agendamento encontrado.</p>';
    return;
  }

  container.innerHTML = itensFiltrados
    .map((solicitacao) => {
      const dados = solicitacao.attributes || solicitacao;
      const status = dados.statusSolicitacao || "PENDENTE";
      const prestador =
        dados.prestador?.data?.[0]?.attributes ||
        dados.prestador?.data?.attributes ||
        null;
      const nomePrestador = prestador?.nomeCompleto || "Prestador";
      const descricao =
        stripHtml(dados.mensagem || "") || "Solicitação em análise.";
      const data = formatDate(dados.dataDesejada);
      const horario = dados.dataDesejada
        ? new Date(dados.dataDesejada).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Não informado";
      const statusClass = getStatusClass(status);
      const statusLabel = normalizeStatus(status);
      const foto = getMediaUrl(prestador?.foto);

      return `
        <article class="card cartao-agendamento mb-4">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div class="d-flex">
                <a href="perfil.html?id=${prestador?.id || ""}" class="text-decoration-none">
                  <img src="${foto}" class="foto-profissional me-3" alt="${nomePrestador}">
                </a>
                <div>
                  <a href="perfil.html?id=${prestador?.id || ""}" class="text-decoration-none text-dark">
                    <h2 class="fw-bold h4">${nomePrestador}</h2>
                  </a>
                  <p class="text-secondary mb-2">${descricao}</p>
                  <ul class="d-flex gap-4 list-unstyled">
                    <li>📅 ${data}</li>
                    <li>🕘 ${horario}</li>
                  </ul>
                </div>
              </div>
              <span class="${statusClass}">${statusLabel}</span>
            </div>
            <hr>
            <ul class="d-flex gap-2 list-unstyled">
              <li><a href="detalhes-agendamento.html?id=${solicitacao.id}" class="btn btn-primary">Ver Detalhes</a></li>
              <li><button class="btn btn-outline-danger" data-id="${solicitacao.id}">Cancelar</button></li>
            </ul>
          </div>
        </article>`;
    })
    .join("");

  container.querySelectorAll("button[data-id]").forEach((botao) => {
    botao.addEventListener("click", async () => {
      const id = botao.getAttribute("data-id");
      const confirmar = confirm("Deseja cancelar esta solicitação?");

      if (!confirmar) {
        return;
      }

      try {
        await putJson(`/solicitacaos/${id}`, {
          data: { statusSolicitacao: "RECUSADA" },
        });
        alert("Solicitação cancelada com sucesso.");
        const response = await getJson("/solicitacaos?populate=*");
        solicitacoes = response?.data || [];
        renderizarSolicitacoes(solicitacoes, filtroAtual, container);
      } catch (error) {
        console.error(error);
        alert(error.message || "Não foi possível cancelar a solicitação.");
      }
    });
  });
}
