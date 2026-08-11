const modalEditarTarefa = document.getElementById("modal-editar-tarefa");
const botaoCancelarEdicao = document.getElementById("cancelar-edicao");
const botaoSalvarEdicao = document.getElementById("salvar-edicao");

botaoCancelarEdicao.addEventListener("click", () => {
    modalEditarTarefa.classList.add("escondido");
});

botaoSalvarEdicao.addEventListener("click", async () => {
    const id = document.getElementById("editar-tarefa-id").value;
    const codigo = document.getElementById("editar-tarefa-codigo").value.trim();
    const titulo = document.getElementById("editar-tarefa-titulo").value.trim();
    const disciplina_id = document.getElementById("editar-tarefa-disciplina").value;

    if (!codigo || !titulo) {
        alert("Código e título são obrigatórios.");
        return;
    }

    const resposta = await fetch(`/tarefas/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            codigo,
            titulo,
            disciplina_id: disciplina_id ? Number(disciplina_id) : null
        })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        alert(dados.erro || "Erro ao editar tarefa.");
        return;
    }

    modalEditarTarefa.classList.add("escondido");

    await renderizarTarefasDinamicas();
});