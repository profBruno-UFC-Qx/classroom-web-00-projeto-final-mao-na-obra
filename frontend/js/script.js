document.addEventListener("DOMContentLoaded", async () => {
  redirectIfUnauthenticated(["login.html", "cadastro.html"]);

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

    if (perfil?.attributes?.nomeCompleto || usuario?.username) {
      nomeUsuario.textContent =
        perfil?.attributes?.nomeCompleto || usuario?.username || "Usuário";
    }

    if (perfil?.attributes?.tipoUsuario) {
      tipoUsuario.textContent = perfil.attributes.tipoUsuario;
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

  await carregarPaginaInicial();
});

async function carregarPaginaInicial() {
  const containerCategorias = document.querySelector("#categorias ul");
  const containerProfissionais = document.querySelector("#profissionais ul");

  if (!containerCategorias || !containerProfissionais) {
    return;
  }

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

  try {
    const categoriasResponse = await getJson("/categoria-servicos?populate=*");
    const perfisResponse = await getJson("/perfils?populate=*");

    const categorias = (categoriasResponse?.data || []).map(
      (item) => item.attributes || item,
    );
    const perfis = (perfisResponse?.data || []).map(
      (item) => item.attributes || item,
    );

    renderizarCategorias(
      categorias.length ? categorias : categoriasFallback,
      containerCategorias,
    );
    renderizarProfissionais(
      perfis.length ? perfis : perfisFallback,
      containerProfissionais,
    );
  } catch (error) {
    console.error(error);
    renderizarCategorias(categoriasFallback, containerCategorias);
    renderizarProfissionais(perfisFallback, containerProfissionais);
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
      const nome = perfil.nomeCompleto || "Profissional";
      const descricao =
        stripHtml(perfil.descricao || "") || "Especialista em serviços.";
      const foto = getMediaUrl(perfil.foto);
      const especialidade =
        perfil.servicos?.data?.[0]?.attributes?.titulo || "Serviço disponível";

      return `
        <li class="col-md-6 col-lg-4">
          <article class="cartao-profissional text-center">
            <img src="${foto}" alt="${nome}" />
            <h3>${nome}</h3>
            <p class="text-secondary">${especialidade}</p>
            <p class="avaliacao">${descricao}</p>
          </article>
        </li>`;
    })
    .join("");
}

function obterIconeCategoria(nome) {
  const mapa = {
    jardinagem: "bi-flower1",
    limpeza: "bi-house",
    manutenção: "bi-tools",
    construção: "bi-hammer",
    eletricista: "bi-lightning",
    encanador: "bi-droplet",
    pintor: "bi-brush",
  };

  return mapa[nome.toLowerCase()] || "bi-briefcase";
}
