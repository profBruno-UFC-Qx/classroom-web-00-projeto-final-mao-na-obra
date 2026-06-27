// Tela inicial

document.addEventListener("DOMContentLoaded", () => {

    const linkAgendamentos = document.querySelector("#linkAgendamentos");

    if (linkAgendamentos) {
        linkAgendamentos.addEventListener("click", (event) => {
            event.preventDefault();

            // TODO: Implementar lógica de verificação do perfil do usuário
            // Exemplo: verificar se o usuário é cliente ou prestador
            // Por enquanto, redireciona para cliente (padrão)

            const perfilUsuario = "cliente"; // Pode ser "cliente" ou "prestador"

            if (perfilUsuario === "cliente") {
                window.location.href = "agendamentos-cliente.html";
            } else if (perfilUsuario === "prestador") {
                window.location.href = "agendamentos-prestador.html";
            } else {
                // Fallback: redireciona para cliente
                window.location.href = "agendamentos-cliente.html";
            }
        });
    }

});

document.addEventListener("DOMContentLoaded", () => {

    const botaoSair =
        document.getElementById(
            "botaoSair"
        );

    botaoSair.addEventListener(
        "click",
        () => {

            const confirmar =
                confirm(
                    "Deseja sair da conta?"
                );

            if (confirmar) {

                window.location.href =
                    "login.html";

            }

        }
    );

});