document.addEventListener("DOMContentLoaded", () => {
  if (isAuthenticated()) {
    window.location.href = "tela-inicial-oficial.html";
    return;
  }

  const form = document.querySelector("form");

  if (!form) {
    return;
  }

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
    const categoria = form.querySelector("select")?.value?.trim();
    const preco = form.querySelector('input[type="number"]')?.value?.trim();

    if (!nome || !email || !senha || !telefone || !endereco) {
      alert("Preencha os campos obrigatórios para concluir o cadastro.");
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

      const perfilPayload = {
        data: {
          nomeCompleto: nome,
          telefone,
          descricao: [
            {
              type: "paragraph",
              children: [{ text: complemento || "" }],
            },
          ],
          tipoUsuario,
          users_permissions_user: { connect: user.id },
        },
      };

      let perfil = null;

      try {
        const perfilResponse = await postJson(
          "/perfils",
          perfilPayload,
        );

        perfil = perfilResponse?.data
          ? { id: perfilResponse.data.id, ...perfilResponse.data.attributes }
          : null;
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
