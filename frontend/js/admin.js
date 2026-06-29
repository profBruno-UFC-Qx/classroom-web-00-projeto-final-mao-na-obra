const listaUsuarios = document.getElementById("listaUsuarios");


async function carregarUsuariosDoStrapi() {
    try {
        
        const resposta = await fetch('http://localhost:1337/api/usuarios');
        const dados = await resposta.json();

      
        const usuariosStrapi = dados.data;

      
        usuariosStrapi.forEach(item => {
           
            const usuario = item.attributes;

            const linha = document.createElement("tr");

            const colunaNome = document.createElement("td");
            colunaNome.textContent = usuario.nome;

           
            listaUsuarios.appendChild(linha);
        });

    } catch (erro) {
        console.error("Erro ao buscar dados do Strapi:", erro);
    }
}


carregarUsuariosDoStrapi();