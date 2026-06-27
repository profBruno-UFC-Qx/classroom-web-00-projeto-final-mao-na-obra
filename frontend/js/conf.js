
const formDados = document.getElementById('formDados');
const formSeguranca = document.getElementById('formSeguranca');


const btnSair = document.getElementById('btnSair');
const btnExcluir = document.getElementById('btnExcluir');


formDados.addEventListener('submit', function(evento) {
    evento.preventDefault(); 
    alert('Dados salvos com sucesso!');
});


formSeguranca.addEventListener('submit', function(evento) {
    evento.preventDefault(); 
    
    const senha1 = document.getElementById('novaSenha').value;
    const senha2 = document.getElementById('confirmarSenha').value;

    if (senha1 === '' || senha2 === '') {
        alert('Por favor, preencha a nova senha.');
    } else if (senha1 !== senha2) {
        alert('As senhas não coincidem!');
    } else {
        alert('Senha alterada com sucesso!');
    }
});


btnSair.addEventListener('click', function() {
    const confirmacao = confirm('Você quer mesmo sair do sistema?');
    if (confirmacao) {
        alert('Sessão encerrada!');
    }
});


btnExcluir.addEventListener('click', function() {
    const confirmacao = confirm('ATENÇÃO: Deseja realmente excluir a conta? Esta ação não tem volta.');
    if (confirmacao) {
        alert('Conta excluída com sucesso.');
    }
});