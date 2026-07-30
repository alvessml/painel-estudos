from database.database import conectar

def criar_tabelas():
    conn = conectar()
    cursor = conn.cursor()


    cursor.execute("""
            CREATE TABLE IF NOT EXISTS disciplinas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL UNIQUE
            )
        """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tarefas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            codigo TEXT UNIQUE,
            titulo TEXT NOT NULL,
            concluida INTEGER DEFAULT 0,
            disciplina_id INTEGER
        )
    """)    

    conn.commit()
    conn.close()



def listar_disciplinas():
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, nome
        FROM disciplinas
        ORDER BY nome
    """)

    disciplinas = cursor.fetchall()
    conn.close()

    return disciplinas



def criar_disciplina(nome):
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO disciplinas (nome)
        VALUES (?)
    """, (nome,))

    conn.commit()
    conn.close()



def atualizar_tarefa(id_tarefa, concluida):
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE tarefas SET concluida = ? WHERE id = ?",
        (1 if concluida else 0, id_tarefa)
    )

    conn.commit()
    conn.close()



def buscar_tarefa_por_codigo(codigo):
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM tarefas WHERE codigo = ?",
        (codigo,)
    )

    tarefa = cursor.fetchone()

    conn.close()

    return tarefa



def atualizar_tarefa_por_codigo(codigo, concluida):
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE tarefas SET concluida = ? WHERE codigo = ?",
        (1 if concluida else 0, codigo)
    )

    conn.commit()
    conn.close()



def criar_ou_atualizar_tarefa(codigo, titulo, concluida=False):
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO tarefas (codigo, titulo, concluida)
        VALUES (?, ?, ?)
        ON CONFLICT(codigo) DO UPDATE SET
            titulo = excluded.titulo
    """, (
        codigo,
        titulo,
        1 if concluida else 0
    ))

    conn.commit()
    conn.close()



def excluir_disciplina(id_disciplina):
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute("""
        DELETE FROM disciplinas
        WHERE id = ?
    """, (id_disciplina,))

    conn.commit()
    conn.close()