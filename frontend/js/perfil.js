document.addEventListener("DOMContentLoaded", () => {

    const botaoContratar = document.getElementById("botaoContratar");

    if (botaoContratar) {
        botaoContratar.addEventListener("click", () => {
            alert("Redirecionando para a solicitação do serviço.");
        });
    }

});