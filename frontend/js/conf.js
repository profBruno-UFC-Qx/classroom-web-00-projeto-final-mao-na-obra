document.addEventListener("DOMContentLoaded", async () => {
  redirectIfUnauthenticated(["login.html", "cadastro.html"]);

  const formDados = document.getElementById("formDados");
  const formSeguranca = document.getElementById("formSeguranca");
  const btnSair = document.getElementById("btnSair");
  const btnExcluir = document.getElementById("btnExcluir");

  let perfilAtual = null;
  let usuarioAtual = getStoredUser();

  try {
  const response = await getJson(
    `/perfils?filters[users_permissions_user][id][$eq]=${usuarioAtual.id}&populate=*`
  );

  perfilAtual = response?.data?.[0] || null;

  if (perfilAtual) {
    const dados = perfilAtual.attributes || perfilAtual;

    document.getElementById("nome").value =
      dados.nomeCompleto || "";

    document.getElementById("email").value =
      usuarioAtual?.email || "";

    document.getElementById("telefone").value =
      dados.telefone || "";
  }
} catch (error) {
  console.error(error);
}

  formDados?.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("telefone").value.trim();

    try {
      if (perfilAtual?.id) {
        await putJson(`/perfils/${perfilAtual.id}`, {
          data: {
            nomeCompleto: nome,
            telefone,
            descricao: [{ type: "paragraph", children: [{ text: "" }] }],
            tipoUsuario: "cliente",
          },
        });
      } else {
        const resposta = await postJson("/perfils", {
          data: {
            nomeCompleto: nome,
            telefone,
            descricao: [{ type: "paragraph", children: [{ text: "" }] }],
            tipoUsuario: "cliente",
          },
        });
        perfilAtual = resposta?.data || null;
      }

      if (usuarioAtual?.id) {
        await putJson(`/users/${usuarioAtual.id}`, { username: email, email });
        usuarioAtual = { ...usuarioAtual, email, username: email };
        saveAuthSession(usuarioAtual, getStoredToken(), perfilAtual);
      }

      showFeedback(formDados.parentElement, "Dados salvos com sucesso.");
    } catch (error) {
      console.error(error);
      showFeedback(
        formDados.parentElement,
        error.message || "Não foi possível salvar os dados.",
        "error",
      );
    }
  });

  formSeguranca?.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const senha1 = document.getElementById("novaSenha").value;
    const senha2 = document.getElementById("confirmarSenha").value;

    if (!senha1 || !senha2) {
      showFeedback(
        formSeguranca.parentElement,
        "Preencha a nova senha.",
        "error",
      );
      return;
    }

    if (senha1 !== senha2) {
      showFeedback(
        formSeguranca.parentElement,
        "As senhas não coincidem.",
        "error",
      );
      return;
    }

    const senhaAtual = prompt(
      "Informe sua senha atual para alterar a senha:",
      "",
    );

    if (!senhaAtual) {
      showFeedback(
        formSeguranca.parentElement,
        "A senha atual é necessária para continuar.",
        "error",
      );
      return;
    }

    try {
      await postJson("/auth/change-password", {
        currentPassword: senhaAtual,
        password: senha1,
        passwordConfirmation: senha2,
      });
      showFeedback(formSeguranca.parentElement, "Senha alterada com sucesso.");
    } catch (error) {
      console.error(error);
      showFeedback(
        formSeguranca.parentElement,
        error.message || "Não foi possível alterar a senha.",
        "error",
      );
    }
  });

  btnSair?.addEventListener("click", () => {
    const confirmacao = confirm("Você quer mesmo sair do sistema?");

    if (confirmacao) {
      clearAuthSession();
      window.location.href = "login.html";
    }
  });

  btnExcluir?.addEventListener("click", async () => {
    const confirmacao = confirm(
      "ATENÇÃO: Deseja realmente excluir a conta? Esta ação não tem volta.",
    );

    if (!confirmacao) {
      return;
    }

    try {
      if (usuarioAtual?.id) {
        await deleteJson(`/users/${usuarioAtual.id}`);
      }
      clearAuthSession();
      alert("Conta excluída com sucesso.");
      window.location.href = "login.html";
    } catch (error) {
      console.error(error);
      alert(error.message || "Não foi possível excluir a conta.");
    }
  });
});
