async function carregarCategoriasCadastro(select) {
  if (!select) {
    return;
  }

  select.innerHTML = '<option value="" disabled selected>Carregando...</option>';

  try {
    const response = await getJson("/categoria-servicos?sort=nome:asc");
    const categorias = (response?.data || [])
      .map((item) => ({
        id: item.id,
        nome: item.attributes?.nome || item.nome,
      }))
      .filter((item) => item.id && item.nome);

    if (!categorias.length) {
      select.innerHTML = '<option value="" disabled selected>Selecione</option>';
      return;
    }

    select.innerHTML =
      '<option value="" disabled selected>Selecione</option>' +
      categorias
        .map((categoria) => `<option value="${categoria.id}">${categoria.nome}</option>`)
        .join("");
  } catch (error) {
    console.error("Erro ao carregar categorias do cadastro:", error);
    select.innerHTML = '<option value="" disabled selected>Selecione</option>';
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  if (isAuthenticated()) {
    window.location.href = "tela-inicial-oficial.html";
    return;
  }

  const form = document.querySelector("form");

  if (!form) {
    return;
  }

  const selectCategoria = form.querySelector("#categoriaServico");
  await carregarCategoriasCadastro(selectCategoria);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = form
      .querySelector('input[placeholder="Digite seu nome"]')
      ?.value?.trim();
    const email = form.querySelector('input[type="email"]')?.value?.trim();
    const senha = form.querySelector('input[type="password"]')?.value;
    const telefone = form.querySelector('input[type="tel"]')?.value?.trim();
    const endereco = form
      .querySelectorAll('input[type="text"]')[1]
      ?.value?.trim();
    const complemento = form
      .querySelectorAll('input[type="text"]')[2]
      ?.value?.trim();
    const tipoUsuario =
      form.querySelector('input[name="tipoUsuario"]:checked')?.id ===
      "trabalhador"
        ? "prestador"
        : "cliente";
    const categoria = form.querySelector("#categoriaServico")?.value?.trim();
    const preco = form.querySelector("#precoServico")?.value?.trim();

    if (!nome || !email || !senha || !telefone || !endereco) {
      alert("Preencha os campos obrigatórios para concluir o cadastro.");
      return;
    }

    if (tipoUsuario === "prestador" && (!categoria || !preco)) {
      alert("Selecione uma categoria e informe o preço para o perfil profissional.");
      return;
    }

    try {
      const authResponse = await postJson("/auth/local/register", {
        username: email,
        email,
        password: senha,
      });

      const user = authResponse.user;
      const token = authResponse.jwt;

      if (!user || !token) {
        throw new Error("Não foi possível criar o usuário.");
      }
      saveAuthSession(user, token);

      const perfilPayload = {
        nomeCompleto: nome,
        telefone,
        endereco,
        descricao: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: complemento || "" }],
            },
          ],
        },
        tipoUsuario,
        categoria: tipoUsuario === "prestador" ? categoria : undefined,
        preco: tipoUsuario === "prestador" ? preco : undefined,
      };

      let perfil = null;

      try {
        const perfilResponse = await postJson(
          "/account/create-profile",
          perfilPayload,
        );

        if (perfilResponse?.data) {
          perfil = { id: perfilResponse.data.id, ...perfilResponse.data.attributes };
        } else if (perfilResponse?.id) {
          perfil = { id: perfilResponse.id, ...perfilResponse };
        } else {
          perfil = null;
        }
      } catch (profileError) {
        console.warn(
          "Não foi possível criar o perfil automaticamente.",
          profileError.message,
        );
      }

      saveAuthSession(user, token, perfil);

      alert("Cadastro realizado com sucesso!");

      if (tipoUsuario === "prestador") {
        window.location.href = "tela-inicial-prestador.html";
      } else {
        window.location.href = "tela-inicial-oficial.html";
      }
    } catch (error) {
      console.error(error);
      alert(
        error.message ||
          "Não foi possível concluir o cadastro. Tente novamente.",
      );
    }
  });
});
