document.getElementById('add-game-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const genre = document.getElementById('genre').value;
    const description = document.getElementById('description').value;
    const downloadLink = document.getElementById('downloadLink').value;

    const newGame = {
        title: title,
        genre: genre,
        description: description,
        downloadLink: downloadLink
    };

    // Envia os dados para o backend
    fetch('/api/games', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGame),
    })
    .then(response => {
        if (!response.ok) {
            // Se a resposta não for OK, lança um erro para ser pego pelo .catch()
            return response.text().then(text => { throw new Error(text) });
        }
        return response.json();
    })
    .then(data => {
        console.log('Jogo adicionado com sucesso:', data);
        alert(`Jogo "${data.title}" adicionado com sucesso!`);
        document.getElementById('add-game-form').reset();
    })
    .catch((error) => {
        console.error('Erro ao adicionar jogo:', error);
        alert('Ocorreu um erro ao adicionar o jogo: ' + error.message);
    });
});