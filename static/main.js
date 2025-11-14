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

  const createParkForm = document.getElementById("create-park-form");
  if (createParkForm) {
    createParkForm.addEventListener("submit", handleCreatePark);
  }

  const profileUpdateForm = document.getElementById("profile-update-form");
  if (profileUpdateForm) {
    profileUpdateForm.addEventListener("submit", handleProfileUpdate);
  }

  if (window.location.pathname === "/profile") {
    loadProfileData();
  }

  if (window.location.pathname === "/") {
    loadParks();
  }

  if (window.location.pathname === "/admin") {
    loadAdminDashboard();
    loadAdminParks();
  }

  if (window.location.pathname.startsWith("/parks/")) {
    loadParkDetail();
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
    if (event.target.classList.contains("delete-park-btn")) {
      const parkId = event.target.dataset.parkId;
      if (
        confirm("Are you sure you want to delete this park? This is irreversible.")
      ) {
        await handleDeletePark(parkId);
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
                <a class="nav-link" href="/admin">Admin</a>
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

async function handleCreatePark(event) {
  event.preventDefault();
  const token = getToken();
  if (!token) {
    showAlert("Authentication error. Please log in again.", "danger");
    return;
  }

  const parkName = document.getElementById("park-name").value;
  const parkLocation = document.getElementById("park-location").value;
  const parkDescription = document.getElementById("park-description").value;

  const parkData = {
    name: parkName,
    location: parkLocation,
    description: parkDescription,
  };

  try {
    const response = await fetch("/api/admin/parks/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(parkData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Failed to create park.");
    }

    showAlert("Park created successfully.", "success");
    document.getElementById("create-park-form").reset();
    loadAdminParks(); // Refresh the list of parks
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

async function loadAdminParks() {
  const token = getToken();
  if (!token) return;

  const container = document.getElementById("parks-management-container");
  try {
    const response = await fetch("/api/admin/parks/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch parks.");

    const parks = await response.json();
    if (parks.length === 0) {
      container.innerHTML = "<p>No parks have been created yet.</p>";
      return;
    }

    const parksHtml = parks
      .map(
        (park) => `
      <div class="d-flex justify-content-between align-items-center border-bottom py-2">
        <div>
          <strong>${park.name}</strong>
          <small class="d-block text-muted">${park.location || "No location"}</small>
        </div>
        <div>
          <button class="btn btn-danger btn-sm delete-park-btn" data-park-id="${
            park.id
          }">Delete</button>
        </div>
      </div>
    `
      )
      .join("");

    container.innerHTML = parksHtml;
  } catch (error) {
    container.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
}

async function handleDeletePark(parkId) {
  const token = getToken();
  if (!token) {
    showAlert("Authentication error. Please log in again.", "danger");
    return;
  }

  try {
    const response = await fetch(`/api/admin/parks/${parkId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Failed to delete park.");
    }

    showAlert("Park deleted successfully.", "success");
    loadAdminParks(); // Refresh the list
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

async function handleProfileUpdate(event) {
  event.preventDefault();
  const token = getToken();
  if (!token) {
    showAlert("Authentication error. Please log in again.", "danger");
    return;
  }

  const fullName = document.getElementById("profile-full-name").value;
  const updateData = {
    full_name: fullName,
  };

  try {
    const response = await fetch("/api/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Failed to update profile.");
    }

    showAlert("Profile updated successfully.", "success");
    // Optionally, re-set the value in case the backend modifies it
    document.getElementById("profile-full-name").value = data.full_name || "";
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
    document.getElementById("profile-full-name").value =
      userData.full_name || "";
    document.getElementById("profile-email").value = userData.email;

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

async function loadParks() {
  const parksContainer = document.getElementById("parks-container");
  try {
    const response = await fetch("/api/parks/");
    if (!response.ok) {
      throw new Error("Failed to fetch parks.");
    }
    const parks = await response.json();

    if (parks.length === 0) {
      parksContainer.innerHTML = "<p>No parks are available at the moment.</p>";
      return;
    }

    const parksHtml = parks
      .map(
        (park) => `
        <div class="col-md-4 mb-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${park.name}</h5>
                    <p class="card-text">${
                      park.description || "No description available."
                    }</p>
                    <a href="/parks/${
                      park.id
                    }" class="btn btn-primary">View Details</a>
                </div>
            </div>
        </div>
    `
      )
      .join("");

    parksContainer.innerHTML = parksHtml;
  } catch (error) {
    parksContainer.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
}

async function loadParkDetail() {
  const pathParts = window.location.pathname.split("/");
  const parkId = pathParts[pathParts.length - 1];
  const parkDetailContainer = document.getElementById("park-detail-container");
  const orderFormContainer = document.getElementById("order-form-container");

  try {
    // Fetch park details and ticket types in parallel
    const [parkResponse, ticketTypesResponse] = await Promise.all([
      fetch(`/api/parks/${parkId}`),
      fetch(`/api/parks/${parkId}/ticket-types/`),
    ]);

    if (!parkResponse.ok) throw new Error("Failed to fetch park details.");
    const park = await parkResponse.json();

    if (!ticketTypesResponse.ok) throw new Error("Failed to fetch ticket types.");
    const ticketTypes = await ticketTypesResponse.json();

    // Render park details
    parkDetailContainer.innerHTML = `
            <h2>${park.name}</h2>
            <p><strong>Location:</strong> ${park.location || "N/A"}</p>
            <p>${park.description || "No description available."}</p>
        `;

    // Render order form if logged in
    const token = getToken();
    if (token) {
      if (ticketTypes.length === 0) {
        orderFormContainer.innerHTML =
          "<p>No tickets available for this park at the moment.</p>";
      } else {
        const today = new Date().toISOString().split("T")[0];
        const ticketInputs = ticketTypes
          .map(
            (tt) => `
                    <div class="mb-3 border p-3 rounded">
                        <h5>${tt.name} (RM ${tt.price.toFixed(2)})</h5>
                        <div class="row">
                            <div class="col-md-6">
                                <label for="quantity-${
                                  tt.id
                                }" class="form-label">Quantity</label>
                                <input type="number" id="quantity-${
                                  tt.id
                                }" class="form-control ticket-quantity" min="0" value="0" data-ticket-type-id="${
              tt.id
            }">
                            </div>
                            <div class="col-md-6">
                                <label for="visit-date-${
                                  tt.id
                                }" class="form-label">Visit Date</label>
                                <input type="date" id="visit-date-${
                                  tt.id
                                }" class="form-control visit-date" min="${today}">
                            </div>
                        </div>
                    </div>
                `
          )
          .join("");

        orderFormContainer.innerHTML = `
                    <h3>Book Tickets</h3>
                    <form id="order-form">
                        ${ticketInputs}
                        <button type="submit" class="btn btn-success mt-3">Place Order</button>
                    </form>
                `;
        document
          .getElementById("order-form")
          .addEventListener("submit", handleOrderSubmit);
      }
    } else {
      orderFormContainer.innerHTML =
        '<p><a href="/login">Log in</a> to book tickets.</p>';
    }
  } catch (error) {
    parkDetailContainer.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
}

async function handleOrderSubmit(event) {
  event.preventDefault();
  const token = getToken();
  if (!token) {
    showAlert("You must be logged in to place an order.", "warning");
    return;
  }

  const items = [];
  const quantityInputs = document.querySelectorAll(".ticket-quantity");
  let validationFailed = false;

  quantityInputs.forEach((input) => {
    if (validationFailed) return;
    const quantity = parseInt(input.value, 10);
    if (quantity > 0) {
      const ticketTypeId = input.dataset.ticketTypeId;
      const visitDateInput = document.getElementById(
        `visit-date-${ticketTypeId}`
      );
      const visitDate = visitDateInput.value;

      if (!visitDate) {
        const ticketName = input.closest(".border").querySelector("h5").textContent;
        showAlert(`Please select a visit date for: ${ticketName}`, "warning");
        validationFailed = true;
        return;
      }

      items.push({
        ticket_type_id: ticketTypeId,
        quantity: quantity,
        visit_date: visitDate,
      });
    }
  });

  if (validationFailed) return;

  if (items.length === 0) {
    showAlert("Please select at least one ticket.", "warning");
    return;
  }

  const orderData = { items: items };

  try {
    const response = await fetch("/api/orders/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Failed to place order.");
    }

    showAlert(
      "Order placed successfully! You will be redirected to your profile.",
      "success"
    );
    setTimeout(() => {
      window.location.href = "/profile";
    }, 2000);
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

async function loadAdminDashboard() {
  const token = getToken();
  if (!token) {
    window.location.href = "/login";
    return;
  }

  const statsContainer = document.getElementById("statistics-container");

  try {
    const response = await fetch("/api/admin/statistics/visitors/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 403) {
      throw new Error("You do not have permission to view this page.");
    }
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Failed to fetch visitor statistics.");
    }

    const stats = await response.json();

    if (stats.revenue_by_park.length === 0) {
      statsContainer.innerHTML = `
        <h5>Overall Summary</h5>
        <p><strong>Total Revenue:</strong> RM 0.00</p>
        <p><strong>Total Tickets Sold:</strong> 0</p>
        <hr>
        <p>No park data available to generate statistics.</p>
      `;
      return;
    }

    const parkStatsHtml = stats.revenue_by_park
      .map(
        (p) => `
        <tr>
            <td>${p.park_name}</td>
            <td>${p.tickets_sold}</td>
            <td>RM ${p.total_revenue.toFixed(2)}</td>
        </tr>
    `
      )
      .join("");

    statsContainer.innerHTML = `
        <h5>Overall Summary</h5>
        <p><strong>Total Revenue:</strong> RM ${stats.total_revenue.toFixed(2)}</p>
        <p><strong>Total Tickets Sold:</strong> ${stats.total_tickets_sold}</p>
        <hr>
        <h5>Revenue by Park</h5>
        <table class="table">
            <thead>
                <tr>
                    <th>Park</th>
                    <th>Tickets Sold</th>
                    <th>Total Revenue</th>
                </tr>
            </thead>
            <tbody>
                ${parkStatsHtml}
            </tbody>
        </table>
    `;
  } catch (error) {
    statsContainer.innerHTML = ""; // Clear the "Loading..." message
    showAlert(error.message, "danger");
  }
}
