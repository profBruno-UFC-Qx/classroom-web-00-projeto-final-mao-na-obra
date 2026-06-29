document.addEventListener("DOMContentLoaded", async () => {
  // Redirecionar se não autenticado
  redirectIfUnauthenticated(["login.html", "cadastro.html"]);

  // Verificar se é admin
  const perfil = getStoredProfile();
  if (perfil?.tipoUsuario !== "admin") {
    alert("Acesso negado. Apenas administradores podem acessar esta página.");
    window.location.href = "tela-inicial-oficial.html";
    return;
  }

  // Preencher iniciais do admin
  const usuario = getStoredUser();
  const nome = perfil?.nomeCompleto || usuario?.email || "Admin";
  const iniciais = nome
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const iniciaisAdmin = document.getElementById("iniciaisAdmin");
  if (iniciaisAdmin) {
    iniciaisAdmin.textContent = iniciais;
  }

  // Carregar usuários
  await carregarUsuarios();

  // Eventos
  const botaoSair = document.getElementById("botaoSair");
  if (botaoSair) {
    botaoSair.addEventListener("click", () => {
      const confirmar = confirm("Deseja sair da conta?");
      if (confirmar) {
        clearAuthSession();
        window.location.href = "login.html";
      }
    });
  }

  const botaoRecarregar = document.getElementById("botaoRecarregar");
  if (botaoRecarregar) {
    botaoRecarregar.addEventListener("click", carregarUsuarios);
  }
});

async function carregarUsuarios() {
  const tabelaUsuarios = document.getElementById("listaUsuarios");

  if (!tabelaUsuarios) {
    return;
  }

  // Mostrar loading
  tabelaUsuarios.innerHTML = `
    <tr>
      <td colspan="4" class="text-center text-secondary py-4">
        <div class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
        Carregando usuários...
      </td>
    </tr>
  `;

  try {
    const response = await getJson("/admin/users");
    const usuarios = response?.data || [];

    if (!usuarios.length) {
      tabelaUsuarios.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-secondary py-4">
            Nenhum usuário encontrado.
          </td>
        </tr>
      `;
      return;
    }

    tabelaUsuarios.innerHTML = usuarios
      .map((usuario) => {
        const tipoBadge = getBadgeTipo(usuario.tipoUsuario);
        return `
          <tr>
            <td class="ps-4">
              <strong>${usuario.nomeCompleto}</strong>
            </td>
            <td>${usuario.email}</td>
            <td>
              <span class="badge ${tipoBadge}">
                ${usuario.tipoUsuario === "prestador" ? "Prestador" : usuario.tipoUsuario === "admin" ? "Admin" : "Cliente"}
              </span>
            </td>
            <td class="text-end pe-4">
              <button
                class="btn btn-sm btn-danger"
                onclick="excluirUsuario('${usuario.documentId}', '${usuario.nomeCompleto}')"
                aria-label="Excluir usuário"
              >
                <i class="bi bi-trash"></i>
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
  } catch (error) {
    console.error(error);
    tabelaUsuarios.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger py-4">
          <i class="bi bi-exclamation-triangle"></i> Não foi possível carregar os usuários.
        </td>
      </tr>
    `;
  }
}

function getBadgeTipo(tipo) {
  switch (tipo) {
    case "admin":
      return "bg-danger";
    case "prestador":
      return "bg-info";
    case "cliente":
      return "bg-primary";
    default:
      return "bg-secondary";
  }
}

async function excluirUsuario(documentId, nome) {
  const confirmar = confirm(
    `Tem certeza que deseja excluir o usuário "${nome}"?\n\nEsta ação é irreversível e removerá todos os seus dados associados.`
  );

  if (!confirmar) {
    return;
  }

  try {
    const response = await deleteJson(`/admin/users/${documentId}`);

    alert("Usuário excluído com sucesso!");
    await carregarUsuarios();
  } catch (error) {
    console.error(error);
    alert(error.message || "Não foi possível excluir o usuário.");
  }
}