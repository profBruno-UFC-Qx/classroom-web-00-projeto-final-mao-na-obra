const cliente = document.getElementById("cliente");
const trabalhador = document.getElementById("trabalhador");
const perfilProfissional = document.getElementById("camposTrabalhador");

function mostrarPerfil() {
    if (trabalhador.checked) {
        perfilProfissional.classList.add("ativo");
    } else {
        perfilProfissional.classList.remove("ativo");
    }
}

cliente.addEventListener("change", mostrarPerfil);
trabalhador.addEventListener("change", mostrarPerfil);


mostrarPerfil();