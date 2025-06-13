document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/";
    return;
  }

  const teamsList = document.getElementById("teams-list");
  const createTeamForm = document.getElementById("create-team-form");

  // Carregar times
  const loadTeams = async () => {
    try {
      const response = await fetch("/teams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const teams = await response.json();
      displayTeams(teams);
    } catch (error) {
      alert("Erro ao carregar times");
    }
  };

  // Exibir times na tabela
  const displayTeams = (teams) => {
    teamsList.innerHTML = teams
      .map(
        (team) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px;">${team.name}</td>
        <td style="padding: 10px;">
          <button onclick="viewTasks('${team.id}')" style="padding: 5px 10px; margin-right: 5px;">Ver Tarefas</button>
          <button onclick="deleteTeam('${team.id}')" style="padding: 5px 10px; background-color: #ef4444;">Excluir</button>
        </td>
      </tr>
    `
      )
      .join("");
  };

  // Criar time (via formulário)
  createTeamForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const teamName = document.getElementById("team-name").value;

    try {
      const response = await fetch("/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: teamName }),
      });

      if (response.ok) {
        document.getElementById("team-name").value = ""; // Limpar campo
        loadTeams(); // Recarregar tabela
      } else {
        const error = await response.json();
        alert(error.error || "Erro ao criar time");
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor");
    }
  });

  // Funções globais para ações
  window.viewTasks = (teamId) => {
    window.location.href = `/teams/${teamId}/tasks`;
  };

  window.deleteTeam = async (teamId) => {
    if (!confirm("Tem certeza que deseja excluir este time?")) return;

    try {
      const response = await fetch(`/teams/${teamId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        loadTeams();
      } else {
        const error = await response.json();
        alert(error.error || "Erro ao excluir time");
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor");
    }
  };

  // Inicializar
  loadTeams();
});
