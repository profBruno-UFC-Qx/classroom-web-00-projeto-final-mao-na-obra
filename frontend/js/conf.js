const ADDRESS_KEY = "contrataki_endereco";

function getStoredAddress() {
  return localStorage.getItem(ADDRESS_KEY) || "";
}

function saveStoredAddress(endereco) {
  if (endereco) {
    localStorage.setItem(ADDRESS_KEY, endereco);
  } else {
    localStorage.removeItem(ADDRESS_KEY);
  }
}

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

    perfilAtual = response?.data?.[0]
      ? { id: response.data[0].id, ...response.data[0].attributes }
      : null;

    const dados = perfilAtual || {};

    document.getElementById("nome").value =
      dados.nomeCompleto || usuarioAtual?.username || usuarioAtual?.email || "";

    document.getElementById("email").value =
      usuarioAtual?.email || usuarioAtual?.username || "";

    document.getElementById("telefone").value =
      dados.telefone || "";

    document.getElementById("endereco").value =
      dados.endereco || getStoredAddress();
  } catch (error) {
    console.error(error);

    document.getElementById("email").value =
      usuarioAtual?.email || usuarioAtual?.username || "";
    document.getElementById("endereco").value = getStoredAddress();
  }

  formDados?.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const endereco = document.getElementById("endereco").value.trim();

    try {
      const perfilPayload = {
        nomeCompleto: nome,
        telefone,
        tipoUsuario: perfilAtual?.tipoUsuario || "cliente",
      };

      if (!perfilAtual?.id) {
        perfilPayload.descricao = [{ type: "paragraph", children: [{ text: "" }] }];

        if (usuarioAtual?.id) {
          perfilPayload.users_permissions_user = { connect: usuarioAtual.id };
        }
      }

      if (perfilAtual?.id) {
        await putJson(`/perfils/${perfilAtual.id}`, { data: perfilPayload });
      } else {
        const resposta = await postJson("/perfils", { data: perfilPayload });
        perfilAtual = resposta?.data
          ? { id: resposta.data.id, ...resposta.data.attributes }
          : null;
      }

      saveStoredAddress(endereco);

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
