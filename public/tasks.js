// public/tasks.js
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/";
    return;
  }

  const teamId = window.location.pathname.split("/")[2];
  const tasksList = document.getElementById("tasks-list");
  const createTaskBtn = document.getElementById("create-task");
  const teamNameEl = document.getElementById("team-name");

  // Carregar tarefas
  const loadTasks = async () => {
    try {
      const [teamRes, tasksRes] = await Promise.all([
        fetch(`/teams/${teamId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/teams/${teamId}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!teamRes.ok || !tasksRes.ok) {
        throw new Error("Erro ao carregar dados");
      }

      const team = await teamRes.json();
      const tasks = await tasksRes.json();

      teamNameEl.textContent = `Tarefas: ${team.name}`;
      displayTasks(tasks);
    } catch (error) {
      alert("Erro ao carregar tarefas");
    }
  };

  // Exibir tarefas
  const displayTasks = (tasks) => {
    tasksList.innerHTML = tasks
      .map(
        (task) => `
      <div class="task-card" style="margin-bottom: 15px; padding: 10px; background: #f8fafc; border-radius: 6px;">
        <h4>${task.title}</h4>
        <p>${task.description || "Sem descrição"}</p>
      </div>
    `
      )
      .join("");
  };

  // Criar tarefa
  createTaskBtn.addEventListener("click", async () => {
    const title = prompt("Título da tarefa:");
    if (!title) return;

    const description = prompt("Descrição (opcional):");

    try {
      const response = await fetch(`/teams/${teamId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (response.ok) {
        loadTasks(); // Recarregar lista após criação
      } else {
        const error = await response.json();
        alert(error.error || "Erro ao criar tarefa");
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor");
    }
  });

  // Inicializar
  loadTasks();
});
