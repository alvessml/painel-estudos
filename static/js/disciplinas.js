async function carregarDisciplinas() {
    const resposta = await fetch("/disciplinas");
    const disciplinas = await resposta.json();
    const lista = document.getElementById("lista-disciplinas");
    const seletor = document.getElementById("disciplina-tarefa");
    const seletorEdicao = document.getElementById("editar-tarefa-disciplina");
    lista.innerHTML = "";
    seletor.innerHTML = '<option value="">Selecione uma disciplina</option>';
    seletorEdicao.innerHTML = '<option value="">Selecione uma disciplina</option>';

    // LISTA DE DISCIPLINAS E OPÇÕES DO SELECT
    disciplinas.forEach((disciplina) => {
        const item = document.createElement("li");
        item.textContent = `${disciplina.id} - ${disciplina.nome} `;

        const botaoExcluir = document.createElement("button");
        botaoExcluir.textContent = "Excluir";

        botaoExcluir.addEventListener("click", async () => {

          const confirmar = confirm(
              `Deseja excluir a disciplina "${disciplina.nome}"?`
          );

          if (!confirmar) return;

          await fetch(`/disciplinas/${disciplina.id}`, {
              method: "DELETE"
          });

          carregarDisciplinas();
        });

        item.appendChild(botaoExcluir);
        lista.appendChild(item);
          
        const opcao = document.createElement("option");
        opcao.value = disciplina.id;
        opcao.textContent = disciplina.nome;
        seletor.appendChild(opcao);

        const opcaoEdicao = document.createElement("option");
        opcaoEdicao.value = disciplina.id;
        opcaoEdicao.textContent = disciplina.nome;
        seletorEdicao.appendChild(opcaoEdicao);
     });
}



const botaoDisciplina = document.getElementById("btn-disciplina");
    const campoDisciplina = document.getElementById("nova-disciplina");



botaoDisciplina.addEventListener("click", async () => {
    const nome = campoDisciplina.value.trim();

    if (!nome) {
        alert("Digite o nome da disciplina.");
        return;
    }

    const resposta = await fetch("/disciplinas", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        alert(dados.erro || "Erro ao cadastrar disciplina.");
        return;
    }

    alert("Disciplina cadastrada com sucesso.");
    campoDisciplina.value = "";
    carregarDisciplinas();
});


carregarDisciplinas();



