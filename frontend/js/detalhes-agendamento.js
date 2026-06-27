document.addEventListener("DOMContentLoaded", async () => {
  redirectIfUnauthenticated(["login.html", "cadastro.html"]);

  const botaoReagendar = document.getElementById("botaoReagendar");
  const botaoCancelar = document.getElementById("botaoCancelar");
  const parametros = new URLSearchParams(window.location.search);
  const solicitacaoId = parametros.get("id");

  if (!solicitacaoId) {
    return;
  }

  try {
    const response = await getJson(`/solicitacaos/${solicitacaoId}?populate=*`);
    preencherDetalhes(response?.data || null);
  } catch (error) {
    console.error(error);
    alert(
      error.message || "Não foi possível carregar os detalhes do agendamento.",
    );
  }

  botaoReagendar?.addEventListener("click", async () => {
    const novaData = prompt("Informe a nova data desejada (AAAA-MM-DD):", "");

    if (!novaData) {
      return;
    }

    try {
      await putJson(`/solicitacaos/${solicitacaoId}`, {
        data: { dataDesejada: novaData },
      });
      alert("Agendamento reagendado com sucesso.");
      const response = await getJson(
        `/solicitacaos/${solicitacaoId}?populate=*`,
      );
      preencherDetalhes(response?.data || null);
    } catch (error) {
      console.error(error);
      alert(error.message || "Não foi possível reagendar o agendamento.");
    }
  });

  botaoCancelar?.addEventListener("click", async () => {
    const confirmarCancelamento = confirm("Deseja cancelar este agendamento?");

    if (!confirmarCancelamento) {
      return;
    }

    try {
      await putJson(`/solicitacaos/${solicitacaoId}`, {
        data: { statusSolicitacao: "RECUSADA" },
      });
      alert("Agendamento cancelado.");
      const response = await getJson(
        `/solicitacaos/${solicitacaoId}?populate=*`,
      );
      preencherDetalhes(response?.data || null);
    } catch (error) {
      console.error(error);
      alert(error.message || "Não foi possível cancelar o agendamento.");
    }
  });
});

function preencherDetalhes(solicitacao) {
  if (!solicitacao) {
    return;
  }

  const dados = solicitacao.attributes || solicitacao;
  const prestador =
    dados.prestador?.data?.[0]?.attributes ||
    dados.prestador?.data?.attributes ||
    null;
  const cliente = dados.cliente?.data?.attributes || null;
  const nomePrestador = prestador?.nomeCompleto || "Prestador";
  const especialidade =
    prestador?.servicos?.data?.[0]?.attributes?.titulo || "Serviço";
  const foto = getMediaUrl(prestador?.foto);
  const telefone = prestador?.telefone || "Não informado";
  const valor = "R$ 0,00";
  const descricao =
    stripHtml(dados.mensagem || "") || "Solicitação sem observação.";

  document
    .querySelector("header h1")
    ?.replaceChildren(document.createTextNode("Detalhes do Agendamento"));
  document
    .querySelector("header p")
    ?.replaceChildren(
      document.createTextNode(`Agendamento #${solicitacao.id}`),
    );
  document
    .querySelector(".status-agendamento")
    ?.replaceChildren(
      document.createTextNode(
        normalizeStatus(dados.statusSolicitacao || "PENDENTE"),
      ),
    );
  document.querySelector(".foto-profissional")?.setAttribute("src", foto);
  document
    .querySelector(".foto-profissional")
    ?.setAttribute("alt", nomePrestador);
  document
    .querySelector(".cartao-detalhes h3")
    ?.replaceChildren(document.createTextNode(nomePrestador));
  document
    .querySelector(".badge")
    ?.replaceChildren(document.createTextNode(especialidade));
  document
    .querySelector(".cartao-detalhes p[aria-label='Avaliação 5 estrelas']")
    ?.replaceChildren(document.createTextNode("★★★★★ 5.0"));
  document
    .querySelectorAll(".cartao-detalhes p")[2]
    ?.replaceChildren(document.createTextNode(telefone));
  document
    .querySelectorAll("dd")[0]
    ?.replaceChildren(document.createTextNode(descricao));
  document
    .querySelectorAll("dd")[1]
    ?.replaceChildren(document.createTextNode(valor));
  document
    .querySelectorAll("dd")[2]
    ?.replaceChildren(document.createTextNode(formatDate(dados.dataDesejada)));
  document.querySelectorAll("dd")[3]?.replaceChildren(
    document.createTextNode(
      dados.dataDesejada
        ? new Date(dados.dataDesejada).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Não informado",
    ),
  );
  document
    .querySelectorAll(".cartao-detalhes p")[4]
    ?.replaceChildren(
      document.createTextNode(
        `Cliente: ${cliente?.nomeCompleto || "Não informado"}`,
      ),
    );
}
