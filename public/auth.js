document.addEventListener("DOMContentLoaded", () => {
  // Elementos do DOM
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const showRegister = document.getElementById("show-register");
  const showLogin = document.getElementById("show-login");
  const authForms = document.getElementById("auth-forms");
  const dashboard = document.getElementById("dashboard");
  const userGreeting = document.getElementById("user-greeting");
  const logoutBtn = document.getElementById("logout");

  // Alternar entre login e registro
  showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.style.display = "none";
    registerForm.style.display = "block";
  });

  showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    registerForm.style.display = "none";
    loginForm.style.display = "block";
  });

  // Verificar se já está logado
  if (localStorage.getItem("token")) {
    showDashboard();
  }

  // Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        showDashboard();
      } else {
        alert(data.error || "Erro no login");
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor");
    }
  });

  // Registro
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        showDashboard();
      } else {
        alert(data.error || "Erro no registro");
      }
    } catch (error) {
      alert("Erro ao conectar com o servidor");
    }
  });

  // Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    dashboard.style.display = "none";
    authForms.style.display = "block";
    loginForm.style.display = "block";
    registerForm.style.display = "none";
  });

  // Mostrar dashboard
  function showDashboard() {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Decodificar o token para obter informações do usuário
    const payload = JSON.parse(atob(token.split(".")[1]));
    userGreeting.textContent = payload.name;

    authForms.style.display = "none";
    dashboard.style.display = "block";
  }

  // Botões do dashboard
  document.getElementById("view-teams").addEventListener("click", () => {
    window.location.href = "/teams";
  });

  document.getElementById("create-team").addEventListener("click", () => {
    // Implementar criação de time
    alert("Funcionalidade de criar time será implementada");
  });
});
