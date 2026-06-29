document.addEventListener("DOMContentLoaded", async () => {
  redirectIfUnauthenticated(["login.html", "cadastro.html"]);

  const botaoContratar = document.getElementById("botaoContratar");
  const parametros = new URLSearchParams(window.location.search);
  const perfilPrestadorId = parametros.get("id");

  let perfilPrestador = null;

  try {
    const response = await getJson(
      perfilPrestadorId ? `/perfils/${perfilPrestadorId}?populate=*` : "/perfils?populate=*",
    );
    perfilPrestador = perfilPrestadorId ? response?.data : (response?.data || [])[0];
    preencherPerfil(perfilPrestador);
  } catch (error) {
    console.error(error);
    alert(error.message || "Não foi possível carregar o perfil.");
  }

  if (botaoContratar) {
    botaoContratar.addEventListener("click", async () => {
      try {
        // Obter perfil do usuário logado (cliente)
        const perfilCliente = getStoredProfile();
        if (!perfilCliente?.id) {
          alert("Você precisa estar logado para contratar um serviço.");
          return;
        }

        const mensagem = prompt(
          "Descreva o serviço que deseja solicitar:",
          "Gostaria de contratar este profissional.",
        );
        if (!mensagem) return;

        const endereco = prompt("Informe o endereço para o atendimento:", "");
        if (!endereco) {
          alert("Informe um endereço para continuar.");
          return;
        }

        const dataSolicitada = prompt(
          "Informe a data desejada (YYYY-MM-DD):",
          new Date().toISOString().split("T")[0],
        );
        if (!dataSolicitada) {
          alert("Informe uma data para continuar.");
          return;
        }

        const clienteId = perfilCliente.id;
        const prestadorId = perfilPrestador?.id;

        if (!prestadorId) {
          alert("Não foi possível identificar o prestador.");
          return;
        }

        // Criar solicitação
        const solicitacaoPayload = {
          mensagem: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: mensagem }],
              },
            ],
          },
          endereco,
          dataDesejada: dataSolicitada,
          statusSolicitacao: "PENDENTE",
          cliente: clienteId,
          prestador: prestadorId,
        };

        const response = await postJson("/solicitacaos", solicitacaoPayload);
        
        alert("Solicitação enviada com sucesso! Acompanhe em 'Meus Agendamentos'.");
        window.location.href = "agendamentos-cliente.html";
      } catch (error) {
        console.error(error);
        alert(error.message || "Não foi possível enviar a solicitação.");
      }
    });
  }
});

function preencherPerfil(perfil) {
  if (!perfil) {
    return;
  }

  const dados = perfil.attributes || perfil;
  const nome = dados.nomeCompleto || "Profissional";
  
  let descricao = "Especialista em serviços com atendimento de qualidade.";
  const descricaoRaw = dados.descricao;
  
  // Se descricao é string, usa direto
  if (typeof descricaoRaw === "string" && descricaoRaw.trim()) {
    descricao = descricaoRaw.trim();
  } else {
    // Se for formato de bloco, extrai o texto
    const extraida = extractDescriptionText(descricaoRaw);
    if (extraida) {
      descricao = extraida;
    }
  }
  
  const foto = getMediaUrl(dados.foto);
  const servicos = (dados.servicos?.data || [])
    .map((servico) => servico.attributes?.titulo || servico.titulo)
    .filter(Boolean);
  const preco = dados.servicos?.data?.[0]?.attributes?.preco || "Não informado";

  document.querySelector(".foto-perfil")?.setAttribute("src", foto);
  document.querySelector(".foto-perfil")?.setAttribute("alt", nome);
  document
    .querySelector(".perfil-profissional h1")
    ?.replaceChildren(document.createTextNode(nome));
  document
    .querySelector(".perfil-profissional p")
    ?.replaceChildren(
      document.createTextNode(dados.tipoUsuario || "Profissional"),
    );
  document
    .querySelectorAll(".card-informacao h2")[0]
    ?.replaceChildren(document.createTextNode(String(servicos.length || 0)));
  document
    .querySelectorAll(".card-informacao h2")[1]
    ?.replaceChildren(document.createTextNode("5.0"));
  document
    .querySelectorAll(".card-informacao h2")[2]
    ?.replaceChildren(
      document.createTextNode(
        preco === "Não informado" ? preco : `R$${Number(preco).toFixed(2)}`,
      ),
    );
  document.querySelector(".lista-servicos-oferecidos")?.replaceChildren(
    ...servicos.map((servico) => {
      const item = document.createElement("li");
      item.textContent = servico;
      return item;
    }),
  );
  document
    .querySelector(".card p:last-of-type")
    ?.replaceChildren(document.createTextNode(descricao));
}
