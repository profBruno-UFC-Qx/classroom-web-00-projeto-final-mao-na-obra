document.addEventListener("DOMContentLoaded", async () => {
  //redirectIfUnauthenticated(["login.html", "cadastro.html"]);

  const linkAgendamentos = document.querySelector("#linkAgendamentos");

  if (linkAgendamentos) {
    linkAgendamentos.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "agendamentos-cliente.html";
    });
  }

  const botaoSair = document.getElementById("botaoSair");
  const nomeUsuario = document.querySelector(".perfil-usuario h6");
  const tipoUsuario = document.querySelector(".perfil-usuario small");

  if (nomeUsuario || tipoUsuario) {
    const perfil = getStoredProfile();
    const usuario = getStoredUser();

    const nome =
      perfil?.nomeCompleto ||
      perfil?.attributes?.nomeCompleto ||
      usuario?.username;

    if (nomeUsuario) {
      nomeUsuario.textContent = nome;
    }

    if (tipoUsuario) {
      tipoUsuario.textContent =
        perfil?.tipoUsuario ||
        perfil?.attributes?.tipoUsuario ||
        "cliente";
    }
  }

  if (botaoSair) {
    botaoSair.addEventListener("click", () => {
      const confirmar = confirm("Deseja sair da conta?");

      if (confirmar) {
        clearAuthSession();
        window.location.href = "login.html";
      }
    });
  }

  const searchForm = document.querySelector(".caixa-busca");
  const searchInput = document.querySelector("#servico_procurado");

  if (searchForm) {
    searchForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const termo = searchInput?.value?.trim();

      if (!termo) {
        await carregarPaginaInicial();
        return;
      }

      await pesquisarServicos(termo);
    });
  }

  await carregarPaginaInicial();
});

async function carregarPaginaInicial() {
  const containerCategorias = document.querySelector("#categorias ul");
  const containerProfissionais = document.querySelector("#profissionais ul");

  const categoriasFallback = [
    { nome: "Limpeza" },
    { nome: "Encanamento" },
    { nome: "Eletricista" },
  ];

  const perfisFallback = [
    {
      nomeCompleto: "Ana Paula Martins",
      descricao: "Especialista em limpeza e organização.",
      tipoUsuario: "prestador",
      foto: null,
    },
    {
      nomeCompleto: "João Mendes",
      descricao: "Atende reparos hidráulicos e manutenção.",
      tipoUsuario: "prestador",
      foto: null,
    },
  ];

  if (containerCategorias) {
    try {
      const categoriasResponse = await getJson("/categoria-servicos?populate=*");
      const categorias = (categoriasResponse?.data || []).map(
        (item) => item.attributes || item,
      );
      renderizarCategorias(
        categorias.length ? categorias : categoriasFallback,
        containerCategorias,
      );
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      renderizarCategorias(categoriasFallback, containerCategorias);
    }
  }

  if (containerProfissionais) {
    try {
      const perfisResponse = await getJson(
        "/perfils?populate=*&filters[tipoUsuario][$eq]=prestador",
      );
      const perfis = (perfisResponse?.data || []).map(
        (item) => item.attributes || item,
      );
      renderizarProfissionais(
        perfis.length ? perfis : perfisFallback,
        containerProfissionais,
      );
    } catch (error) {
      console.error("Erro ao buscar perfis:", error);
      renderizarProfissionais(perfisFallback, containerProfissionais);
    }
  }
}

async function pesquisarServicos(termo) {
  const containerResultados = document.querySelector("#profissionais ul");
  if (!containerResultados) {
    return;
  }

  try {
    const query = encodeURIComponent(termo);
    const response = await getJson(
      `/servicos?filters[$or][0][titulo][$containsi]=${query}&filters[$or][1][categoria][$containsi]=${query}&populate=prestador&pagination[pageSize]=100`,
    );

    const servicos = (response?.data || []).map((item) => item.attributes || item);
    renderizarServicos(servicos, containerResultados, termo);
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    containerResultados.innerHTML =
      '<li class="col-12"><p class="text-muted">Não foi possível buscar serviços no momento.</p></li>';
  }
}

function renderizarCategorias(categorias, container) {
  if (!categorias.length) {
    container.innerHTML =
      '<li class="col-12"><p class="text-muted">Nenhuma categoria disponível.</p></li>';
    return;
  }

  container.innerHTML = categorias
    .map((categoria, index) => {
      const nome = categoria.nome || `Categoria ${index + 1}`;
      const icone = obterIconeCategoria(nome);
      return `
        <li class="col-md-4 col-lg-2">
          <a href="#" class="cartao-categoria">
            <i class="bi ${icone} fs-1"></i>
            <h3>${nome}</h3>
          </a>
        </li>`;
    })
    .join("");
}

function renderizarProfissionais(perfis, container) {
  const profissionais = perfis.filter((perfil) =>
    (perfil.tipoUsuario || "").toLowerCase().includes("prestador"),
  );

  if (!profissionais.length) {
    container.innerHTML =
      '<li class="col-12"><p class="text-muted">Nenhum profissional disponível no momento.</p></li>';
    return;
  }

  container.innerHTML = profissionais
    .map((perfil) => {
      const perfilId = perfil.id || "";
      const nome = perfil.nomeCompleto || "Profissional";
      const descricaoRaw = perfil.descricao;
      let descricao = "Especialista em serviços.";
      
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
      
      const foto = getMediaUrl(perfil.foto);
      const especialidade =
        perfil.servicos?.[0]?.titulo ||
        perfil.servicos?.data?.[0]?.attributes?.titulo ||
        "Serviço disponível";
      
      const perfilUrl = perfilId ? `perfil.html?id=${perfilId}` : "#";

      return `
        <li class="col-md-6 col-lg-4">
          <a href="${perfilUrl}" class="text-decoration-none">
            <article class="cartao-profissional text-center">
              <img src="${foto}" alt="${nome}" />
              <h3>${nome}</h3>
              <p class="text-secondary">${especialidade}</p>
              <p class="avaliacao">${descricao}</p>
            </article>
          </a>
        </li>`;
    })
    .join("");
}

function renderizarServicos(servicos, container, termo) {
  if (!servicos.length) {
    container.innerHTML =
      `<li class="col-12"><p class="text-muted">Nenhum serviço encontrado para "${termo}".</p></li>`;
    return;
  }

  container.innerHTML = servicos
    .map((servico) => {
      const titulo = servico.titulo || "Serviço";
      const categoria = servico.categoria || "Sem categoria";
      
      let descricao = "Descrição não disponível.";
      const descricaoServico = servico.descricao;
      const descricaoPrestador = servico.prestador?.data?.attributes?.descricao || servico.prestador?.descricao;
      
      // Tenta usar descrição do serviço se for string
      if (typeof descricaoServico === "string" && descricaoServico.trim()) {
        descricao = descricaoServico.trim();
      } else if (typeof descricaoPrestador === "string" && descricaoPrestador.trim()) {
        // Se não, usa descrição do prestador se for string
        descricao = descricaoPrestador.trim();
      } else {
        // Fallback para extração de bloco
        const desc1 = extractDescriptionText(descricaoServico);
        const desc2 = extractDescriptionText(descricaoPrestador);
        if (desc1) {
          descricao = desc1;
        } else if (desc2) {
          descricao = desc2;
        }
      }
      
      const prestadorId = servico.prestador?.data?.id || servico.prestador?.id;
      const prestador =
        servico.prestador?.data?.attributes?.nomeCompleto ||
        servico.prestador?.nomeCompleto ||
        "Prestador não informado";
      const foto = getMediaUrl(servico.prestador?.data?.attributes?.foto || servico.prestador?.foto);
      
      const perfilUrl = prestadorId ? `perfil.html?id=${prestadorId}` : "#";

      return `
        <li class="col-md-6 col-lg-4">
          <a href="${perfilUrl}" class="text-decoration-none">
            <article class="cartao-profissional text-center">
              <img src="${foto}" alt="${prestador}" />
              <h3>${prestador}</h3>
              <p class="text-secondary">${titulo}</p>
              <p class="avaliacao">${descricao}</p>
              <small class="text-muted">${categoria}</small>
            </article>
          </a>
        </li>`;
    })
    .join("");
}

function obterIconeCategoria(nome) {
  const normalized = (nome || "").toLowerCase();

  if (normalized.includes("jardin")) {
    return "bi-flower1";
  }
  if (normalized.includes("limpeza")) {
    return "bi-house";
  }
  if (normalized.includes("manuten")) {
    return "bi-tools";
  }
  if (normalized.includes("constru")) {
    return "bi-hammer";
  }
  if (normalized.includes("eletric")) {
    return "bi-lightning";
  }
  if (normalized.includes("encan")) {
    return "bi-droplet";
  }
  if (normalized.includes("pint")) {
    return "bi-brush";
  }

  return "bi-briefcase";
}
