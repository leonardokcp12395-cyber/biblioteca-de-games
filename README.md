# Biblioteca de Games

Uma simples aplicação web para criar e gerenciar uma biblioteca de jogos pessoal. A aplicação possui uma interface para usuários visualizarem e filtrarem os jogos, e uma área de administração para adicionar novos jogos à biblioteca.

## Funcionalidades

- **Visualização de Jogos**: A página principal exibe todos os jogos em um layout de cards.
- **Busca e Filtro**: Permite buscar jogos por título e filtrar por gênero.
- **Painel de Administração**: Uma página separada (`/admin.html`) para adicionar novos jogos.
- **Backend com Node.js**: Um servidor Express gerencia os dados dos jogos, que são persistidos em um arquivo `games.json`.

## Estrutura do Projeto

- `index.html`: A página principal para os usuários.
- `admin.html`: O painel de administração.
- `style.css`: Folha de estilos para ambas as páginas.
- `script.js`: Lógica do frontend para a página do usuário (busca, filtro, etc.).
- `admin.js`: Lógica do frontend para o painel de administração (envio do formulário).
- `server.js`: O servidor backend (Node.js/Express).
- `games.json`: O "banco de dados" que armazena os jogos.
- `package.json`: Define as dependências do projeto Node.js.

## Como Executar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/) (que inclui o npm) instalado em sua máquina.

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd <NOME_DO_DIRETORIO>
    ```

2.  **Instale as dependências do servidor:**
    Execute o seguinte comando na raiz do projeto para instalar o Express e outras dependências necessárias.
    ```bash
    npm install
    ```

3.  **Inicie o servidor:**
    Este comando irá iniciar o servidor backend na porta 3000. O servidor também será responsável por servir os arquivos do frontend.
    ```bash
    node server.js
    ```
    Você verá a mensagem `Servidor rodando na porta 3000` no seu terminal.

4.  **Acesse a aplicação:**
    - Para ver a biblioteca de games, abra seu navegador e acesse: [http://localhost:3000](http://localhost:3000)
    - Para adicionar novos jogos, acesse o painel de administração em: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)