const perfil = JSON.parse(localStorage.getItem("profile"));

document.querySelector(".perfil-usuario h2").innerText =
    perfil?.nomeCompleto || "Usuário";

document.querySelector(".perfil-usuario small").innerText =
    perfil?.tipoUsuario || "prestador";