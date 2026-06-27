document.addEventListener("DOMContentLoaded", () => {

    const botaoReagendar = document.getElementById("botaoReagendar");
    const botaoCancelar = document.getElementById("botaoCancelar");

    botaoReagendar.addEventListener("click", () => {
        alert("Redirecionando para reagendamento.");
    });

    botaoCancelar.addEventListener("click", () => {
        const confirmarCancelamento = confirm("Deseja cancelar este agendamento?");
        if (confirmarCancelamento) {
            alert("Agendamento cancelado.");
        }
    });

});