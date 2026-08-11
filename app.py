from flask import Flask, render_template
from database.models import criar_tabelas, criar_ou_atualizar_tarefa
from routes.tarefas import tarefas
from routes.disciplinas import disciplinas

app = Flask(__name__)

app.register_blueprint(tarefas)
app.register_blueprint(disciplinas)

criar_tabelas()

@app.route("/")
def inicio():
    return render_template("painel_estudos.html")

if __name__ == "__main__":
    app.run(debug=True)