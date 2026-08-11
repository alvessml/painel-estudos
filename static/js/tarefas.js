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


const campoCodigo = document.getElementById("codigo-tarefa");
const campoTitulo = document.getElementById("titulo-tarefa");
const campoDisciplinaSelect = document.getElementById("disciplina-tarefa");
const botaoTarefa = document.getElementById("btn-tarefa");



botaoTarefa.addEventListener("click", async () => {

    const codigo = campoCodigo.value.trim();
    const titulo = campoTitulo.value.trim();
    const disciplina_id = campoDisciplinaSelect.value;

    if (!codigo || !titulo || !disciplina_id) {
        alert("Preencha todos os campos.");
        return;
    }

    const resposta = await fetch("/tarefas", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            codigo,
            titulo,
            disciplina_id: Number(disciplina_id)
        })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        alert(dados.erro || "Erro ao cadastrar tarefa.");
        return;
    }

    alert("Tarefa cadastrada com sucesso.");

    campoCodigo.value = "";
    campoTitulo.value = "";
    campoDisciplinaSelect.value = "";



    async function carregarTarefasDoBanco() {
        const resposta = await fetch("/tarefas");
        const tarefas = await resposta.json();

        tarefas.forEach((tarefa) => {
            if (!tarefa.codigo || !tarefa.codigo.startsWith("w")) {
                return;
            }

            const partes = tarefa.codigo.split("-");
            const numeroSemana = Number(partes[0].replace("w", ""));

            const semana = WEEKS.find(
                (item) => item.num === numeroSemana
            );

            if (!semana) {
                return;
            }

            const tarefaJaExiste = semana.tasks.some(
                (item) => item.id === tarefa.codigo
            );

            if (!tarefaJaExiste) {
                const mapaDisciplinas = {
                    "Português": "GER",
                    "Matemática": "ED",
                    "Arquitetura": "AC",
                    "Análise": "AS",
                    "Programação": "POO"
                };

                semana.tasks.push({
                    id: tarefa.codigo,
                    subj: mapaDisciplinas[tarefa.disciplina_nome] || "GER",
                    text: tarefa.titulo
                });
            }

            state[tarefa.codigo] = tarefa.concluida;
        });

        renderWeeks();
    }

});



renderizarTarefasDinamicas();