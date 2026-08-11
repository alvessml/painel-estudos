import sqlite3
from flask import Blueprint, jsonify, request
from database.models import listar_disciplinas, criar_disciplina, excluir_disciplina

disciplinas = Blueprint("disciplinas", __name__)


@disciplinas.route("/disciplinas", methods=["GET"])
def obter_disciplinas():
    registros = listar_disciplinas()

    return jsonify([
        {
            "id": registro["id"],
            "nome": registro["nome"]
        }
        for registro in registros
    ])


@disciplinas.route("/disciplinas", methods=["POST"])
def adicionar_disciplina():
    dados = request.get_json()
    nome = dados.get("nome", "").strip()

    if not nome:
        return jsonify({"erro": "O nome da disciplina é obrigatório."}), 400

    try:
        criar_disciplina(nome)
    except sqlite3.IntegrityError:
        return jsonify({"erro": "Essa disciplina já está cadastrada."}), 409

    return jsonify({"mensagem": "Disciplina criada com sucesso."}), 201



@disciplinas.route("/disciplinas/<int:id_disciplina>", methods=["DELETE"])
def deletar_disciplina(id_disciplina):
    excluir_disciplina(id_disciplina)

    return jsonify({
        "mensagem": "Disciplina excluída com sucesso."
    }), 200