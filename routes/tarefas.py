import sqlite3
from flask import Blueprint, jsonify, request
from database.database import conectar
from database.models import atualizar_tarefa, buscar_tarefa_por_codigo, atualizar_tarefa_por_codigo

tarefas = Blueprint("tarefas", __name__)


@tarefas.route("/tarefas", methods=["GET"])
def listar_tarefas():
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT
        tarefas.*,
        disciplinas.nome AS disciplina_nome
    FROM tarefas
    LEFT JOIN disciplinas
    ON tarefas.disciplina_id = disciplinas.id
    """)
    dados = cursor.fetchall()

    conn.close()

    resultado = []

    for tarefa in dados:
        resultado.append({
        "id": tarefa["id"],
        "codigo": tarefa["codigo"],
        "titulo": tarefa["titulo"],
        "concluida": bool(tarefa["concluida"]),
        "disciplina_id": tarefa["disciplina_id"],
        "disciplina_nome": tarefa["disciplina_nome"]
    })

    return jsonify(resultado)



@tarefas.route("/tarefas", methods=["POST"])
def adicionar_tarefa():
    dados = request.get_json()

    conn = conectar()
    cursor = conn.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO tarefas
            (codigo, titulo, concluida, disciplina_id)
            VALUES (?, ?, ?, ?)
            """,
            (
                dados["codigo"],
                dados["titulo"],
                False,
                dados["disciplina_id"]
            )
        )

        conn.commit()

    except sqlite3.IntegrityError:
        conn.close()

        return jsonify({
            "erro": "Já existe uma tarefa com esse código."
        }), 409

    conn.close()

    return jsonify({
        "mensagem": "Tarefa adicionada"
    }), 201



@tarefas.route("/tarefas/<int:id_tarefa>", methods=["PUT"])
def marcar_tarefa(id_tarefa):
    dados = request.get_json()

    atualizar_tarefa(
        id_tarefa,
        dados["concluida"]
    )

    return jsonify({
        "mensagem": "Tarefa atualizada"
    })



@tarefas.route("/tarefas/codigo/<codigo>", methods=["PUT"])
def atualizar_por_codigo(codigo):
    dados = request.get_json()

    atualizar_tarefa_por_codigo(
        codigo,
        dados["concluida"]
    )

    return jsonify({
        "mensagem": "Tarefa atualizada"
    })



@tarefas.route("/tarefas/<int:id_tarefa>", methods=["DELETE"])
def excluir_tarefa(id_tarefa):

    conn = conectar()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM tarefas WHERE id = ?",
        (id_tarefa,)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "mensagem": "Tarefa excluída com sucesso."
    })



@tarefas.route("/tarefas/<int:id_tarefa>", methods=["PATCH"])
def editar_tarefa(id_tarefa):
    dados = request.get_json()
    codigo = dados.get("codigo", "").strip()
    titulo = dados.get("titulo", "").strip()
    disciplina_id = dados.get("disciplina_id")

    if not codigo or not titulo:
        return jsonify({
            "erro": "Código e título são obrigatórios."
        }), 400

    conn = conectar()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE tarefas
        SET codigo = ?,
            titulo = ?,
            disciplina_id = ?
        WHERE id = ?
    """, (
        codigo,
        titulo,
        disciplina_id,
        id_tarefa
    ))

    conn.commit()
    conn.close()

    return jsonify({
        "mensagem": "Tarefa atualizada com sucesso."
    })