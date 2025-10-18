document.getElementById('add-game-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o recarregamento da página ao enviar

    // Coleta os dados do formulário
    const title = document.getElementById('title').value;
    const genre = document.getElementById('genre').value;
    const description = document.getElementById('description').value;
    const downloadLink = document.getElementById('downloadLink').value;

    const newGame = {
        id: Date.now(), // Cria um ID único baseado no timestamp atual
        title: title,
        genre: genre,
        description: description,
        downloadLink: downloadLink
    };

    // --- NOTA IMPORTANTE ---
    // O JavaScript que roda no navegador (client-side) não tem permissão para
    // escrever arquivos diretamente no sistema de arquivos do servidor por razões de segurança.
    //
    // Em uma aplicação real, nós enviaríamos esses dados para um backend
    // (usando a API fetch com um método POST), e o backend seria responsável
    // por salvar os dados no banco de dados ou em um arquivo JSON.
    //
    // Exemplo de como a chamada para o backend seria:
    /*
    fetch('/api/add-game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGame),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Jogo adicionado com sucesso:', data);
        alert('Jogo adicionado com sucesso!');
        document.getElementById('add-game-form').reset();
    })
    .catch((error) => {
        console.error('Erro ao adicionar jogo:', error);
        alert('Ocorreu um erro ao adicionar o jogo.');
    });
    */

    // Para fins de demonstração, vamos apenas mostrar um alerta e limpar o formulário.
    // Isso simula uma submissão bem-sucedida.
    console.log("Novo jogo a ser adicionado (simulação):", newGame);
    alert(`Jogo "${title}" adicionado com sucesso! (Simulação)`);

    // Limpa o formulário
    document.getElementById('add-game-form').reset();
});