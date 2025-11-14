document.addEventListener("DOMContentLoaded", () => {
  updateNav();

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }

  // The logout button is dynamically added, so we need to use event delegation
  document.body.addEventListener("click", (event) => {
    if (event.target.id === "logout-btn") {
      handleLogout();
    }
  });
});

function getToken() {
  return localStorage.getItem("access_token");
}

function setToken(token) {
  localStorage.setItem("access_token", token);
}

function removeToken() {
  localStorage.removeItem("access_token");
}

function updateNav() {
  const navItems = document.getElementById("nav-items");
  const token = getToken();

  if (token) {
    navItems.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="/profile">Profile</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" id="logout-btn">Logout</a>
            </li>
        `;
  } else {
    navItems.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="/login">Login</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/register">Register</a>
            </li>
        `;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);

  try {
    const response = await fetch("/api/token", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Login failed");
    }

    setToken(data.access_token);
    window.location.href = "/"; // Redirect to home page
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.querySelector("#email").value;
  const fullName = form.querySelector("#full_name").value;
  const password = form.querySelector("#password").value;

  const userData = {
    email: email,
    full_name: fullName,
    password: password,
  };

  try {
    const response = await fetch("/api/users/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Registration failed");
    }

    showAlert("Registration successful! Please log in.", "success");
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

function handleLogout() {
  removeToken();
  window.location.href = "/login";
}

function showAlert(message, type = "info") {
  const placeholder = document.getElementById("alert-placeholder");
  if (!placeholder) return;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
        <div class="alert alert-${type} alert-dismissible" role="alert">
            <div>${message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
  // Clear previous alerts
  placeholder.innerHTML = "";
  placeholder.append(wrapper);
}
