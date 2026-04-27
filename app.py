
from flask import Flask, request, jsonify, render_template
import sqlite3

print(" THIS FILE IS RUNNING")

app = Flask(__name__)

tasks = []

#show website 
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/test")
def test():
    return "WORKING"

# add task
@app.route("/add", methods=["POST"])
def add_task():
    data = request.get_json()

    conn = sqlite3.connect("tasks.db")
    cur = conn.cursor()
    priority = data.get("priority", "Medium")
    due_date = data.get("due_date", "")

    cur.execute(
        "INSERT INTO tasks (task, done, priority, due_date) VALUES (?, ?, ?, ?)",
        (data["task"], 0, priority, due_date)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Task added"})

#get all tasks
@app.route("/tasks")
def get_tasks():
    conn = sqlite3.connect("tasks.db")
    cur = conn.cursor()

    cur.execute("SELECT * FROM tasks")
    rows = cur.fetchall()

    conn.close()

    tasks = []
    for row in rows:
        tasks.append({
            "id": row[0],
            "task": row[1],
            "done": bool(row[2]),
            "priority": row[3] if len(row) > 3 else "Medium",
            "due_date": row[4] if len(row) > 4 else ""
            })

    return jsonify(tasks)

@app.route("/delete/<int:id>", methods=["DELETE"])
def delete_task(id):
    conn = sqlite3.connect("tasks.db")
    cur = conn.cursor()

    cur.execute("DELETE FROM tasks WHERE id = ?", (id,))

    conn.commit()
    conn.close()

    return jsonify({"message": "deleted"})


@app.route("/toggle/<int:id>", methods=["PUT"])
def toggle_task(id):
    conn = sqlite3.connect("tasks.db")
    cur = conn.cursor()

    cur.execute("UPDATE tasks SET done = NOT done WHERE id = ?", (id,))

    conn.commit()
    conn.close()

    return jsonify({"message": "updated"})

@app.route("/edit/<int:id>", methods=["PUT"])
def edit_task(id):
    data = request.get_json()

    conn = sqlite3.connect("tasks.db")
    cur = conn.cursor()

    cur.execute("UPDATE tasks SET task = ? WHERE id = ?", (data["task"], id))

    conn.commit()
    conn.close()

    return jsonify({"message": "updated"})

def init_db():
    conn = sqlite3.connect("tasks.db")
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT,
        done INTEGER,
        priority TEXT,
        due_date TEXT
    )
    """)
    #cur.execute("ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'Medium'")
    #cur.execute("ALTER TABLE tasks ADD COLUMN due_date TEXT")
    conn.commit()
    conn.close()

init_db()

#run server
if __name__ == "__main__":
     app.run(debug=True)