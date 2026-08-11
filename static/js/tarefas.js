async function renderizarTarefasDinamicas() {
    const resposta = await fetch("/tarefas");
    const tarefas = await resposta.json();

    const container = document.getElementById("weeks-dinamicas");
    container.innerHTML = "";

    const tarefasValidas = tarefas.filter(
        tarefa => tarefa.codigo && /^w\d+-/.test(tarefa.codigo)
    );

    const semanas = {};

    tarefasValidas.forEach((tarefa) => {
        const numeroSemana = Number(
            tarefa.codigo.split("-")[0].replace("w", "")
        );

        if (!semanas[numeroSemana]) {
            semanas[numeroSemana] = [];
        }

        semanas[numeroSemana].push(tarefa);
    });

    Object.keys(semanas)
        .sort((a, b) => Number(a) - Number(b))
        .forEach((numeroSemana) => {
            const tarefasSemana = semanas[numeroSemana];

            const concluidas = tarefasSemana.filter(
                tarefa => tarefa.concluida
            ).length;

            const blocoSemana = document.createElement("div");
            blocoSemana.className = "week open";

            const numeroFormatado = String(numeroSemana).padStart(2, "0");

            blocoSemana.innerHTML = `
                <div class="week-head">
                    <div class="week-num">${numeroFormatado}</div>

                    <div class="week-title">
                        <div class="name">Semana ${numeroFormatado}</div>
                        <div class="dates">Tarefas cadastradas</div>
                    </div>

                    <div class="week-progress">
                        ${concluidas}/${tarefasSemana.length}
                    </div>
                </div>

                <div class="week-body">
                    <div class="task-list"></div>
                </div>
            `;

            const lista = blocoSemana.querySelector(".task-list");

            tarefasSemana.forEach((tarefa) => {
                const item = document.createElement("div");

                item.className = tarefa.concluida
                    ? "task done"
                    : "task";

                item.innerHTML = `
                    <input
                        type="checkbox"
                        id="${tarefa.codigo}"
                        ${tarefa.concluida ? "checked" : ""}
                    >

                    <label for="${tarefa.codigo}">
                        <span class="tag">
                            ${tarefa.disciplina_nome || "Sem disciplina"}
                        </span>

                        ${tarefa.titulo}
                    </label>

                    <div class="acoes-tarefa">
                        <button class="btn-editar-tarefa">
                            Editar
                        </button>

                        <button class="btn-excluir-tarefa">
                            Excluir
                        </button>
                    </div>
                `;

                const botaoExcluir = item.querySelector(".btn-excluir-tarefa");
                const botaoEditar = item.querySelector(".btn-editar-tarefa");
                

                // BOTÃO DE EDITAR E EXCLUIR TAREFA
                botaoEditar.addEventListener("click", () => {

                    document
                        .getElementById("modal-editar-tarefa")
                        .classList.remove("escondido");

                    document
                        .getElementById("editar-tarefa-id")
                        .value = tarefa.id;

                    document
                        .getElementById("editar-tarefa-codigo")
                        .value = tarefa.codigo;

                    document
                        .getElementById("editar-tarefa-titulo")
                        .value = tarefa.titulo;

                    document
                        .getElementById("editar-tarefa-disciplina")
                        .value = tarefa.disciplina_id || "";
                });

                botaoExcluir.addEventListener("click", async () => {
                    const confirmar = confirm(
                        `Deseja excluir a tarefa "${tarefa.titulo}"?`
                    );

                    if (!confirmar) return;

                    const resposta = await fetch(`/tarefas/${tarefa.id}`, {
                        method: "DELETE"
                    });

                    const dados = await resposta.json();

                    if (!resposta.ok) {
                        alert(dados.erro || "Erro ao excluir tarefa.");
                        return;
                    }

                    await renderizarTarefasDinamicas();
                });

                const checkbox = item.querySelector('input[type="checkbox"]');

                checkbox.addEventListener("change", async () => {
                    const resposta = await fetch(`/tarefas/${tarefa.id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            concluida: checkbox.checked
                        })
                    });

                    const dados = await resposta.json();

                    if (!resposta.ok) {
                        alert(dados.erro || "Erro ao atualizar tarefa.");
                        checkbox.checked = !checkbox.checked;
                        return;
                    }

                    await renderizarTarefasDinamicas();
                });

                lista.appendChild(item);
            });

            container.appendChild(blocoSemana);
        });
}

renderizarTarefasDinamicas();


