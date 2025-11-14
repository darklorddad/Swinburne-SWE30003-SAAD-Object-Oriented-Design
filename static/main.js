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

  if (window.location.pathname === "/profile") {
    loadProfileData();
  }

  // Event delegation for dynamically added buttons
  document.body.addEventListener("click", async (event) => {
    if (event.target.id === "logout-btn") {
      handleLogout();
    }
    if (event.target.classList.contains("cancel-order-btn")) {
      const orderId = event.target.dataset.orderId;
      if (confirm("Are you sure you want to cancel this order?")) {
        await cancelOrder(orderId);
      }
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

async function loadProfileData() {
  const token = getToken();
  if (!token) {
    window.location.href = "/login";
    return;
  }

  try {
    // Fetch user info
    const userResponse = await fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!userResponse.ok)
      throw new Error("Failed to fetch user data. Please log in again.");
    const userData = await userResponse.json();
    document.getElementById("user-full-name").textContent =
      userData.full_name || "N/A";
    document.getElementById("user-email").textContent = userData.email;

    // Fetch orders
    const ordersResponse = await fetch("/api/orders/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!ordersResponse.ok) throw new Error("Failed to fetch orders.");
    const ordersData = await ordersResponse.json();

    const ordersContainer = document.getElementById("orders-container");
    if (ordersData.length === 0) {
      ordersContainer.innerHTML = "<p>You have no orders.</p>";
      return;
    }

    const ordersHtml = ordersData
      .map(
        (order) => `
        <div class="card mb-3">
            <div class="card-header d-flex justify-content-between">
                <span>Order ID: ${order.id}</span>
                <span>Date: ${new Date(
                  order.created_at
                ).toLocaleDateString()}</span>
            </div>
            <div class="card-body">
                <h5 class="card-title">Status: <span class="badge bg-${
                  order.status === "cancelled" ? "danger" : "success"
                }">${order.status}</span></h5>
                <p class="card-text">Total: RM ${order.total_amount.toFixed(
                  2
                )}</p>
                <h6>Items:</h6>
                <ul>
                    ${order.items
                      .map(
                        (item) =>
                          `<li>${item.quantity} x Ticket (Visit: ${item.visit_date})</li>`
                      )
                      .join("")}
                </ul>
                ${
                  order.status !== "cancelled"
                    ? `<button class="btn btn-danger btn-sm cancel-order-btn" data-order-id="${order.id}">Cancel Order</button>`
                    : ""
                }
            </div>
        </div>
    `
      )
      .join("");

    ordersContainer.innerHTML = ordersHtml;
  } catch (error) {
    showAlert(error.message, "danger");
    removeToken();
    setTimeout(() => (window.location.href = "/login"), 2000);
  }
}

async function cancelOrder(orderId) {
  const token = getToken();
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Failed to cancel order.");
    }
    showAlert("Order cancelled successfully.", "success");
    loadProfileData(); // Reload profile data to show updated status
  } catch (error) {
    showAlert(error.message, "danger");
  }
}
