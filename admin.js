document.getElementById('add-game-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData();

    // Adiciona os campos de texto ao FormData
    formData.append('title', form.querySelector('#title').value);
    formData.append('genre', form.querySelector('#genre').value);
    formData.append('description', form.querySelector('#description').value);
    formData.append('downloadLink', form.querySelector('#downloadLink').value);

    // Adiciona a imagem de capa
    const coverImage = form.querySelector('#coverImage').files[0];
    if (coverImage) {
        formData.append('coverImage', coverImage);
    }

    // Adiciona as imagens da galeria
    const gameImages = form.querySelector('#gameImages').files;
    for (let i = 0; i < gameImages.length; i++) {
        formData.append('gameImages', gameImages[i]);
    }

    // Envia os dados para o backend como FormData
    fetch('/api/games', {
        method: 'POST',
        // Não defina o 'Content-Type' aqui. O navegador fará isso automaticamente
        // com o boundary correto para multipart/form-data.
        body: formData,
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text || 'Ocorreu um erro no servidor.') });
        }
        return response.json();
    })
    .then(data => {
        console.log('Jogo adicionado com sucesso:', data);
        alert(`Jogo "${data.title}" adicionado com sucesso!`);
        form.reset();
    })
    .catch((error) => {
        console.error('Erro ao adicionar jogo:', error);
        alert('Ocorreu um erro ao adicionar o jogo: ' + error.message);
    });
});