document.addEventListener("DOMContentLoaded", async () => {
  redirectIfUnauthenticated(["login.html", "cadastro.html"]);

  const botaoContratar = document.getElementById("botaoContratar");
  const parametros = new URLSearchParams(window.location.search);
  const perfilId = parametros.get("id");

  try {
    const response = await getJson(
      perfilId ? `/perfils/${perfilId}?populate=*` : "/perfils?populate=*",
    );
    const perfil = perfilId ? response?.data : (response?.data || [])[0];
    preencherPerfil(perfil);
  } catch (error) {
    console.error(error);
    alert(error.message || "Não foi possível carregar o perfil.");
  }

  if (botaoContratar) {
    botaoContratar.addEventListener("click", async () => {
      const mensagem = prompt(
        "Descreva o serviço que deseja solicitar:",
        "Gostaria de contratar este profissional.",
      );
      const endereco = prompt("Informe o endereço para o atendimento:", "");

      if (!mensagem || !endereco) {
        alert("Preencha a mensagem e o endereço para continuar.");
        return;
      }

      try {
        await postJson("/solicitacaos", {
          data: {
            mensagem: [{ type: "paragraph", children: [{ text: mensagem }] }],
            endereco,
            dataDesejada: new Date().toISOString(),
            statusSolicitacao: "PENDENTE",
          },
        });
        alert("Solicitação enviada com sucesso!");
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
  const descricao =
    stripHtml(dados.descricao || "") ||
    "Especialista em serviços com atendimento de qualidade.";
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
