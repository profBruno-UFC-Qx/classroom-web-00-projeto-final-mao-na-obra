document.addEventListener("DOMContentLoaded", async () => {
  const filtros = document.querySelectorAll(".filtro-agendamento");
  const container = document.querySelector(".row.mt-4 .col-12");

  if (!container) {
    return;
  }

  let solicitacoes = [];
  let filtroAtual = "Próximos";

  filtros.forEach((filtro) => {
    filtro.addEventListener("click", () => {
      filtros.forEach((botao) => botao.classList.remove("active"));
      filtro.classList.add("active");
      filtroAtual = filtro.textContent.trim();
      renderizarSolicitacoes(solicitacoes, filtroAtual, container);
    });
  });

  try {
    const response = await getJson("/solicitacaos?populate=*");
    solicitacoes = response?.data || [];
    renderizarSolicitacoes(solicitacoes, filtroAtual, container);
  } catch (error) {
    console.error(error);
    container.innerHTML =
      '<p class="text-danger">Não foi possível carregar os agendamentos.</p>';
  }
});

function renderizarSolicitacoes(solicitacoes, filtroAtual, container) {
  const itensFiltrados = solicitacoes.filter((solicitacao) => {
    const status = solicitacao.attributes?.statusSolicitacao || "PENDENTE";

    if (filtroAtual === "Próximos") {
      return status === "PENDENTE" || status === "ACEITA";
    }

    if (filtroAtual === "Em andamento") {
      return status === "ACEITA";
    }

    if (filtroAtual === "Concluídos") {
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
      const cliente = dados.cliente?.data?.attributes || null;
      const nomeCliente = cliente?.nomeCompleto || "Cliente";
      const mensagem =
        stripHtml(dados.mensagem || "") || "Solicitação sem observação.";
      const valor = "R$ 0,00";
      const data = formatDate(dados.dataDesejada);
      const horario = dados.dataDesejada
        ? new Date(dados.dataDesejada).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Não informado";
      const statusClass = getPrestadorStatusClass(status);
      const label = normalizeStatus(status);
      const foto = getMediaUrl(cliente?.foto);

      return `
        <section class="card card-agendamento mb-4">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div class="d-flex">
                <img src="${foto}" class="foto-cliente me-3" alt="${nomeCliente}">
                <div>
                  <h2 class="fw-bold h4">${nomeCliente}</h2>
                  <p class="text-secondary mb-2">${mensagem}</p>
                  <ul class="d-flex gap-4 list-unstyled">
                    <li>📅 ${data}</li>
                    <li>🕒 ${horario}</li>
                    <li class="fw-bold">${valor}</li>
                  </ul>
                </div>
              </div>
              <span class="status ${statusClass}">${label}</span>
            </div>
            <hr>
            <p>${mensagem}</p>
            <ul class="d-flex gap-2 list-unstyled">
              <li><button class="btn btn-success" data-id="${solicitacao.id}" data-status="ACEITA">Concluir Serviço</button></li>
              <li><button class="btn btn-outline-danger" data-id="${solicitacao.id}" data-status="RECUSADA">Cancelar</button></li>
              <li><a href="perfil.html?id=${cliente?.id || ""}" class="btn btn-outline-primary">Ver Cliente</a></li>
            </ul>
          </div>
        </section>`;
    })
    .join("");

  container.querySelectorAll("button[data-id]").forEach((botao) => {
    botao.addEventListener("click", async () => {
      const id = botao.getAttribute("data-id");
      const status = botao.getAttribute("data-status");

      try {
        await putJson(`/solicitacaos/${id}`, {
          data: { statusSolicitacao: status },
        });
        alert("Status atualizado com sucesso.");
        const response = await getJson("/solicitacaos?populate=*");
        solicitacoes = response?.data || [];
        renderizarSolicitacoes(solicitacoes, filtroAtual, container);
      } catch (error) {
        console.error(error);
        alert(error.message || "Não foi possível atualizar o agendamento.");
      }
    });
  });
}

function getPrestadorStatusClass(status) {
  if (status === "ACEITA") {
    return "status-confirmado";
  }
  if (status === "CONCLUIDA") {
    return "status-concluido";
  }
  if (status === "RECUSADA") {
    return "status-cancelado";
  }
  return "status-pendente";
}
