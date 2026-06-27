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

    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = form.querySelector('input[type="password"]');
    const perfilCliente = document.getElementById("cliente");
    const perfilTrabalhador = document.getElementById("trabalhador");

    const email = emailInput?.value?.trim();
    const password = passwordInput?.value;
    const perfil = perfilCliente?.checked
      ? "cliente"
      : perfilTrabalhador?.checked
        ? "prestador"
        : "cliente";

    if (!email || !password) {
      alert("Informe o e-mail e a senha para entrar.");
      return;
    }

    try {
      const authResponse = await postJson("/auth/local", {
        identifier: email,
        password,
      });

      const user = authResponse.user;
      const token = authResponse.jwt;

      if (!user || !token) {
        throw new Error("Resposta de autenticação inválida.");
      }

      let profile = null;

      try {
        const profileResponse = await getJson(
          `/perfils?filters[users_permissions_user][id][$eq]=${user.id}&populate=*`,
        );
        profile = profileResponse?.data?.[0] || null;
      } catch (profileError) {
        console.warn(
          "Não foi possível carregar o perfil após o login.",
          profileError.message,
        );
      }

      saveAuthSession(user, token, profile);

      alert("Login realizado com sucesso!");
      window.location.href = "tela-inicial-oficial.html";
    } catch (error) {
      console.error(error);
      alert(
        error.message ||
          "Não foi possível entrar. Verifique seus dados e tente novamente.",
      );
    }
  });
});
