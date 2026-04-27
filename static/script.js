
let filter = "all";

function addTask() {
    let input = document.getElementById("taskInput");
    let task = input.value;

    if (task === "") return;

    let priority = document.getElementById("priority").value;
    let dueDate = document.getElementById("dueDate").value;

    fetch("/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            task: task,
            priority: priority,
            due_date: dueDate
            })
    }).then(() => {
        showTasks();
    });

    input.value = "";
}

function showTasks() {

    let list = document.getElementById("taskList");
    list.innerHTML = "";

    let search = document.getElementById("searchInput").value.toLowerCase();

    fetch("/tasks")
        .then(response => response.json())
        .then(data => {
            let total = data.length;
            let done = 0;

            for (let i = 0; i < data.length; i++) {

                if (data[i].done) done++;

                // 🔍 SEARCH FILTER
                if (!data[i].task.toLowerCase().includes(search)) {
                    continue;
                }
                let pending = total - done;

                document.getElementById("taskCounter").innerText =
                    `Total: ${total} | Done: ${done} | Pending: ${pending}`;

                // 🎯 STATUS FILTER
                if (filter === "done" && !data[i].done) continue;
                if (filter === "pending" && data[i].done) continue;

                let li = document.createElement("li");

                li.innerHTML = `
                    <div class="task-left">
                        <span class="${data[i].done ? 'done' : ''}">
                            ${data[i].task}
                        </span>

                        <span class="priority ${data[i].priority}">
                            ${data[i].priority}
                        </span>

                        <span class="date">
                            ${data[i].due_date || ""}
                        </span>
                    </div>

                    <input type="checkbox" ${data[i].done ? "checked" : ""}
                        onchange="toggleDone(${data[i].id})">
                    
                    <div class="task-buttons"> 
                        <button onclick="editTask(${data[i].id})">Edit</button>
                        <button onclick="deleteTask(${data[i].id})">Delete</button>
                    </div>
                `;

                list.appendChild(li);
            }
        });
}

function editTask(id) {

    fetch("/tasks")
        .then(res => res.json())
        .then(data => {

            let taskObj = data.find(t => t.id === id);

            let newTask = prompt("Edit your task:", taskObj.task);

            if (newTask === null || newTask.trim() === "") return;

            fetch(`/edit/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ task: newTask })
            }).then(() => showTasks());
        });
}

function deleteTask(id) {
    fetch(`/delete/${id}`, {
        method: "DELETE"
    }).then(() => showTasks());
}

function toggleDone(id) {
    fetch(`/toggle/${id}`, {
        method: "PUT"
    }).then(() => showTasks());
}
function toggleDarkMode() {
    document.body.classList.toggle("dark");

    let btn = document.getElementById("darkBtn");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        btn.innerText = "☀️";
    } else {
        localStorage.setItem("theme", "light");
        btn.innerText = "🌙";
    }
}
function setFilter(type) {
    filter = type;
    showTasks();
}
showTasks();

if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}