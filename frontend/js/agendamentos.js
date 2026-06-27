// Agendamento cliente

document.addEventListener("DOMContentLoaded", () => {

    const botoesDetalhes = document.querySelectorAll(".botao-detalhes");

    botoesDetalhes.forEach((botao) => {
        botao.addEventListener("click", () => {
            window.location.href = "detalhes-agendamento.html";
        });
    });

});