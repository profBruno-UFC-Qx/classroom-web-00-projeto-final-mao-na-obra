document.addEventListener("DOMContentLoaded", () => {

    const filtros =
        document.querySelectorAll(".filtro-agendamento");

    filtros.forEach((filtro) => {

        filtro.addEventListener("click", () => {

            filtros.forEach((botao) => {
                botao.classList.remove("active");
            });

            filtro.classList.add("active");

        });

    });

});