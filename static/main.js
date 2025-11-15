let allParks = []; // To store all parks for client-side searching

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

  const saveParkBtn = document.getElementById("save-park-changes-btn");
  if (saveParkBtn) {
    saveParkBtn.addEventListener("click", handleUpdatePark);
  }

  const saveTicketTypeBtn = document.getElementById("save-tt-changes-btn");
  if (saveTicketTypeBtn) {
    saveTicketTypeBtn.addEventListener("click", handleSaveTicketType);
  }

  const saveMerchBtn = document.getElementById("save-merch-changes-btn");
  if (saveMerchBtn) {
    saveMerchBtn.addEventListener("click", handleSaveMerchandise);
  }

  const editParkModal = document.getElementById("editParkModal");
  if (editParkModal) {
    editParkModal.addEventListener("show.bs.modal", (event) => {
      // Button that triggered the modal
      const button = event.relatedTarget;
      // Extract info from data-* attributes
      const id = button.getAttribute("data-park-id");
      const name = button.getAttribute("data-park-name");
      const location = button.getAttribute("data-park-location");
      const description = button.getAttribute("data-park-description");

      // Update the modal's content.
      const modalIdInput = editParkModal.querySelector("#edit-park-id");
      const modalNameInput = editParkModal.querySelector("#edit-park-name");
      const modalLocationInput =
        editParkModal.querySelector("#edit-park-location");
      const modalDescriptionInput = editParkModal.querySelector(
        "#edit-park-description"
      );

      modalIdInput.value = id;
      modalNameInput.value = name;
      modalLocationInput.value = location;
      modalDescriptionInput.value = description;
    });
  }

  const ticketTypeModal = document.getElementById("ticketTypeModal");
  if (ticketTypeModal) {
    ticketTypeModal.addEventListener("show.bs.modal", (event) => {
      const button = event.relatedTarget;
      const parkId = button.getAttribute("data-park-id");
      const ttId = button.getAttribute("data-tt-id");
      const ttName = button.getAttribute("data-tt-name");
      const ttPrice = button.getAttribute("data-tt-price");

      const modalTitle = ticketTypeModal.querySelector(".modal-title");
      const modalParkIdInput = ticketTypeModal.querySelector("#tt-park-id");
      const modalTtIdInput = ticketTypeModal.querySelector("#tt-id");
      const modalTtNameInput = ticketTypeModal.querySelector("#tt-name");
      const modalTtPriceInput = ticketTypeModal.querySelector("#tt-price");

      modalParkIdInput.value = parkId;
      if (ttId) {
        // Editing existing ticket type
        modalTitle.textContent = "Edit Ticket Type";
        modalTtIdInput.value = ttId;
        modalTtNameInput.value = ttName;
        modalTtPriceInput.value = ttPrice;
      } else {
        // Adding new ticket type
        modalTitle.textContent = "Add New Ticket Type";
        modalTtIdInput.value = "";
        modalTtNameInput.value = "";
        modalTtPriceInput.value = "";
      }
    });
  }

  const merchandiseModal = document.getElementById("merchandiseModal");
  if (merchandiseModal) {
    merchandiseModal.addEventListener("show.bs.modal", (event) => {
      const button = event.relatedTarget;
      const parkId = button.getAttribute("data-park-id");
      const merchId = button.getAttribute("data-merch-id");
      const merchName = button.getAttribute("data-merch-name");
      const merchDescription = button.getAttribute("data-merch-description");
      const merchPrice = button.getAttribute("data-merch-price");
      const merchStock = button.getAttribute("data-merch-stock");

      const modalTitle = merchandiseModal.querySelector(".modal-title");
      const modalParkIdInput = merchandiseModal.querySelector("#merch-park-id");
      const modalMerchIdInput = merchandiseModal.querySelector("#merch-id");
      const modalMerchNameInput = merchandiseModal.querySelector("#merch-name");
      const modalMerchDescInput =
        merchandiseModal.querySelector("#merch-description");
      const modalMerchPriceInput =
        merchandiseModal.querySelector("#merch-price");
      const modalMerchStockInput =
        merchandiseModal.querySelector("#merch-stock");

      modalParkIdInput.value = parkId;
      if (merchId) {
        // Editing existing merchandise
        modalTitle.textContent = "Edit Merchandise";
        modalMerchIdInput.value = merchId;
        modalMerchNameInput.value = merchName;
        modalMerchDescInput.value = merchDescription;
        modalMerchPriceInput.value = merchPrice;
        modalMerchStockInput.value = merchStock;
      } else {
        // Adding new merchandise
        modalTitle.textContent = "Add New Merchandise";
        modalMerchIdInput.value = "";
        document.getElementById("merchandise-form").reset();
      }
    });
  }

  const profileUpdateForm = document.getElementById("profile-update-form");
  if (profileUpdateForm) {
    profileUpdateForm.addEventListener("submit", handleProfileUpdate);
  }

  const passwordRecoveryForm = document.getElementById("password-recovery-form");
  if (passwordRecoveryForm) {
    passwordRecoveryForm.addEventListener("submit", handlePasswordRecovery);
  }

  const resetPasswordForm = document.getElementById("reset-password-form");
  if (resetPasswordForm) {
    // On page load, extract token from URL fragment and populate the hidden field
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1)); // remove #
      const accessToken = params.get("access_token");
      if (accessToken) {
        const tokenInput = document.getElementById("reset-token");
        if (tokenInput) {
          tokenInput.value = accessToken;
        }
      } else {
        const error = params.get("error_description");
        if (error) {
          showAlert(error.replace(/\+/g, " "), "danger");
        }
      }
    }
    resetPasswordForm.addEventListener("submit", handleResetPassword);
  }

  if (window.location.pathname === "/profile") {
    loadProfileData();
  }

  if (window.location.pathname === "/") {
    loadParks();
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("keyup", handleParkSearch);
    }
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
    if (event.target.classList.contains("delete-tt-btn")) {
      const parkId = event.target.dataset.parkId;
      const ttId = event.target.dataset.ttId;
      if (confirm("Are you sure you want to delete this ticket type?")) {
        await handleDeleteTicketType(parkId, ttId);
      }
    }
    if (event.target.classList.contains("delete-merch-btn")) {
      const parkId = event.target.dataset.parkId;
      const merchId = event.target.dataset.merchId;
      if (confirm("Are you sure you want to delete this merchandise?")) {
        await handleDeleteMerchandise(parkId, merchId);
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
  const userStr = localStorage.getItem("user");

  if (token && userStr) {
    const user = JSON.parse(userStr);
    const adminLink = user.is_admin
      ? `<li class="nav-item"><a class="nav-link" href="/admin">Admin</a></li>`
      : "";

    navItems.innerHTML = `
            <li class="nav-item">
                <span class="navbar-text me-3">Hello, ${
                  user.full_name || user.email
                }</span>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/profile">Profile</a>
            </li>
            ${adminLink}
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
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "/"; // Redirect to home page
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

async function handlePasswordRecovery(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.querySelector("#email").value;

  try {
    const response = await fetch(`/api/password-recovery/${email}`, {
      method: "POST",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Failed to request password recovery.");
    }

    showAlert(data.msg, "info");
    // Disable the form to prevent multiple submissions
    form.querySelector("button[type='submit']").disabled = true;
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

async function handleResetPassword(event) {
  event.preventDefault();
  const form = event.target;
  const token = form.querySelector("#reset-token").value;
  const newPassword = form.querySelector("#new-password").value;

  const resetData = {
    token: token,
    new_password: newPassword,
  };

  try {
    const response = await fetch("/api/reset-password/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resetData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Failed to reset password.");
    }

    showAlert(
      "Password has been reset successfully. You can now log in.",
      "success"
    );
    setTimeout(() => {
      window.location.href = "/login";
    }, 3000);
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
    const parksResponse = await fetch("/api/admin/parks/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!parksResponse.ok) throw new Error("Failed to fetch parks.");

    const parks = await parksResponse.json();
    if (parks.length === 0) {
      container.innerHTML = "<p>No parks have been created yet.</p>";
      return;
    }

    // Fetch ticket types and merchandise for all parks in parallel
    const parksWithDetailsPromises = parks.map(async (park) => {
      const [ticketTypesResponse, merchandiseResponse] = await Promise.all([
        fetch(`/api/admin/parks/${park.id}/ticket-types/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/admin/parks/${park.id}/merchandise/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const ticketTypes = ticketTypesResponse.ok
        ? await ticketTypesResponse.json()
        : [];
      const merchandise = merchandiseResponse.ok
        ? await merchandiseResponse.json()
        : [];
      return { ...park, ticketTypes, merchandise };
    });

    const parksWithDetails = await Promise.all(parksWithDetailsPromises);

    const accordionId = "parks-accordion";
    const parksHtml = parksWithDetails
      .map((park) => {
        const ticketTypesHtml =
          park.ticketTypes.length > 0
            ? park.ticketTypes
                .map(
                  (tt) => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span>${tt.name} - RM ${tt.price.toFixed(2)}</span>
                    <div>
                        <button
                            class="btn btn-outline-secondary btn-sm edit-tt-btn"
                            data-bs-toggle="modal"
                            data-bs-target="#ticketTypeModal"
                            data-park-id="${park.id}"
                            data-tt-id="${tt.id}"
                            data-tt-name="${tt.name}"
                            data-tt-price="${tt.price}"
                        >
                            Edit
                        </button>
                        <button
                            class="btn btn-outline-danger btn-sm delete-tt-btn"
                            data-park-id="${park.id}"
                            data-tt-id="${tt.id}"
                        >
                            Delete
                        </button>
                    </div>
                </li>
            `
                )
                .join("")
            : '<li class="list-group-item">No ticket types found for this park.</li>';

        const merchandiseHtml =
          park.merchandise.length > 0
            ? park.merchandise
                .map(
                  (m) => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        ${m.name} - RM ${m.price.toFixed(2)}<br>
                        <small class="text-muted">Stock: ${m.stock}</small>
                    </div>
                    <div>
                        <button
                            class="btn btn-outline-secondary btn-sm edit-merch-btn"
                            data-bs-toggle="modal"
                            data-bs-target="#merchandiseModal"
                            data-park-id="${park.id}"
                            data-merch-id="${m.id}"
                            data-merch-name="${m.name}"
                            data-merch-description="${m.description || ""}"
                            data-merch-price="${m.price}"
                            data-merch-stock="${m.stock}"
                        >
                            Edit
                        </button>
                        <button
                            class="btn btn-outline-danger btn-sm delete-merch-btn"
                            data-park-id="${park.id}"
                            data-merch-id="${m.id}"
                        >
                            Delete
                        </button>
                    </div>
                </li>
            `
                )
                .join("")
            : '<li class="list-group-item">No merchandise found for this park.</li>';

        return `
        <div class="accordion-item">
            <h2 class="accordion-header" id="heading-${park.id}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${
                  park.id
                }" aria-expanded="false" aria-controls="collapse-${park.id}">
                    ${park.name}
                </button>
            </h2>
            <div id="collapse-${
              park.id
            }" class="accordion-collapse collapse" aria-labelledby="heading-${
          park.id
        }" data-bs-parent="#${accordionId}">
                <div class="accordion-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <strong>Location:</strong> ${
                              park.location || "N/A"
                            }<br>
                            <strong>Description:</strong> ${
                              park.description || "N/A"
                            }
                        </div>
                        <div>
                            <button
                                class="btn btn-secondary btn-sm edit-park-btn"
                                data-bs-toggle="modal"
                                data-bs-target="#editParkModal"
                                data-park-id="${park.id}"
                                data-park-name="${park.name}"
                                data-park-location="${park.location || ""}"
                                data-park-description="${park.description || ""}"
                            >
                                Edit Park
                            </button>
                            <button class="btn btn-danger btn-sm delete-park-btn" data-park-id="${
                              park.id
                            }">Delete Park</button>
                        </div>
                    </div>
                    
                    <h6>Ticket Types</h6>
                    <ul class="list-group mb-3">
                        ${ticketTypesHtml}
                    </ul>
                    <button
                        class="btn btn-primary btn-sm add-tt-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#ticketTypeModal"
                        data-park-id="${park.id}"
                    >
                        Add Ticket Type
                    </button>

                    <hr class="my-3">

                    <h6>Merchandise</h6>
                    <ul class="list-group mb-3">
                        ${merchandiseHtml}
                    </ul>
                    <button
                        class="btn btn-primary btn-sm add-merch-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#merchandiseModal"
                        data-park-id="${park.id}"
                    >
                        Add Merchandise
                    </button>
                </div>
            </div>
        </div>
      `;
      })
      .join("");

    container.innerHTML = `<div class="accordion" id="${accordionId}">${parksHtml}</div>`;
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

async function handleSaveTicketType() {
  const token = getToken();
  if (!token) {
    showAlert("Authentication error. Please log in again.", "danger");
    return;
  }

  const parkId = document.getElementById("tt-park-id").value;
  const ttId = document.getElementById("tt-id").value;
  const ttName = document.getElementById("tt-name").value;
  const ttPrice = parseFloat(document.getElementById("tt-price").value);

  if (!ttName || !ttPrice) {
    showAlert("Ticket type name and price are required.", "warning");
    return;
  }

  const isEditing = !!ttId;
  const url = isEditing
    ? `/api/admin/parks/${parkId}/ticket-types/${ttId}`
    : `/api/admin/parks/${parkId}/ticket-types/`;
  const method = isEditing ? "PUT" : "POST";

  const ttData = {
    name: ttName,
    price: ttPrice,
  };

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(ttData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Failed to save ticket type.");
    }

    showAlert("Ticket type saved successfully.", "success");
    const modalEl = document.getElementById("ticketTypeModal");
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) {
        modal.hide();
      }
    }
    loadAdminParks(); // Refresh the accordion
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

async function handleDeleteTicketType(parkId, ttId) {
  const token = getToken();
  if (!token) {
    showAlert("Authentication error. Please log in again.", "danger");
    return;
  }

  try {
    const response = await fetch(`/api/admin/parks/${parkId}/ticket-types/${ttId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Failed to delete ticket type.");
    }

    showAlert("Ticket type deleted successfully.", "success");
    loadAdminParks(); // Refresh the accordion
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

async function handleUpdatePark() {
  const token = getToken();
  if (!token) {
    showAlert("Authentication error. Please log in again.", "danger");
    return;
  }

  const parkId = document.getElementById("edit-park-id").value;
  const parkName = document.getElementById("edit-park-name").value;
  const parkLocation = document.getElementById("edit-park-location").value;
  const parkDescription = document.getElementById("edit-park-description").value;

  const parkData = {
    name: parkName,
    location: parkLocation,
    description: parkDescription,
  };

  try {
    const response = await fetch(`/api/admin/parks/${parkId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(parkData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Failed to update park.");
    }

    showAlert("Park updated successfully.", "success");
    const modalEl = document.getElementById("editParkModal");
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) {
        modal.hide();
      }
    }
    loadAdminParks(); // Refresh the list of parks
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

async function handleSaveMerchandise() {
  const token = getToken();
  if (!token) {
    showAlert("Authentication error. Please log in again.", "danger");
    return;
  }

  const parkId = document.getElementById("merch-park-id").value;
  const merchId = document.getElementById("merch-id").value;
  const merchName = document.getElementById("merch-name").value;
  const merchDescription = document.getElementById("merch-description").value;
  const merchPrice = parseFloat(document.getElementById("merch-price").value);
  const merchStock = parseInt(document.getElementById("merch-stock").value, 10);

  if (!merchName || !merchPrice || isNaN(merchStock)) {
    showAlert("Name, price, and stock are required.", "warning");
    return;
  }

  const isEditing = !!merchId;
  const url = isEditing
    ? `/api/admin/parks/${parkId}/merchandise/${merchId}`
    : `/api/admin/parks/${parkId}/merchandise/`;
  const method = isEditing ? "PUT" : "POST";

  const merchData = {
    name: merchName,
    description: merchDescription,
    price: merchPrice,
    stock: merchStock,
  };

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(merchData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Failed to save merchandise.");
    }

    showAlert("Merchandise saved successfully.", "success");
    const modalEl = document.getElementById("merchandiseModal");
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) {
        modal.hide();
      }
    }
    loadAdminParks(); // Refresh the accordion
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

async function handleDeleteMerchandise(parkId, merchId) {
  const token = getToken();
  if (!token) {
    showAlert("Authentication error. Please log in again.", "danger");
    return;
  }

  try {
    const response = await fetch(
      `/api/admin/parks/${parkId}/merchandise/${merchId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Failed to delete merchandise.");
    }

    showAlert("Merchandise deleted successfully.", "success");
    loadAdminParks(); // Refresh the accordion
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
  localStorage.removeItem("user");
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
                      .map((item) => {
                        if (item.ticket_type_id && item.ticket_types) {
                          return `<li>${item.quantity} x ${
                            item.ticket_types.name
                          } (Visit: ${item.visit_date})</li>`;
                        } else if (item.merchandise_id && item.merchandise) {
                          return `<li>${item.quantity} x ${item.merchandise.name}</li>`;
                        }
                        return `<li>${item.quantity} x Unknown Item</li>`;
                      })
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
    allParks = await response.json();
    renderParks(allParks);
  } catch (error) {
    parksContainer.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
}

function renderParks(parks) {
  const parksContainer = document.getElementById("parks-container");
  if (parks.length === 0) {
    parksContainer.innerHTML = "<p>No parks match your search.</p>";
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
}

function handleParkSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  const filteredParks = allParks.filter(
    (park) =>
      park.name.toLowerCase().includes(searchTerm) ||
      (park.description && park.description.toLowerCase().includes(searchTerm))
  );
  renderParks(filteredParks);
}

async function loadParkDetail() {
  const pathParts = window.location.pathname.split("/");
  const parkId = pathParts[pathParts.length - 1];
  const parkDetailContainer = document.getElementById("park-detail-container");
  const orderFormContainer = document.getElementById("order-form-container");

  try {
    // Fetch park details, ticket types, and merchandise in parallel
    const [parkResponse, ticketTypesResponse, merchandiseResponse] =
      await Promise.all([
        fetch(`/api/parks/${parkId}`),
        fetch(`/api/parks/${parkId}/ticket-types/`),
        fetch(`/api/parks/${parkId}/merchandise/`),
      ]);

    if (!parkResponse.ok) throw new Error("Failed to fetch park details.");
    const park = await parkResponse.json();

    if (!ticketTypesResponse.ok) throw new Error("Failed to fetch ticket types.");
    const ticketTypes = await ticketTypesResponse.json();

    if (!merchandiseResponse.ok) throw new Error("Failed to fetch merchandise.");
    const merchandise = await merchandiseResponse.json();

    // Render park details
    parkDetailContainer.innerHTML = `
            <h2>${park.name}</h2>
            <p><strong>Location:</strong> ${park.location || "N/A"}</p>
            <p>${park.description || "No description available."}</p>
        `;

    // Render order form if logged in
    const token = getToken();
    if (token) {
      if (ticketTypes.length === 0 && merchandise.length === 0) {
        orderFormContainer.innerHTML =
          "<p>No tickets or merchandise available for this park at the moment.</p>";
      } else {
        const today = new Date().toISOString().split("T")[0];
        const ticketInputs =
          ticketTypes.length > 0
            ? `<h3>Book Tickets</h3>` +
              ticketTypes
                .map(
                  (tt) => `
                    <div class="mb-3 border p-3 rounded">
                        <h5>${tt.name} (RM ${tt.price.toFixed(2)})</h5>
                        <div class="row">
                            <div class="col-md-6">
                                <label for="quantity-ticket-${
                                  tt.id
                                }" class="form-label">Quantity</label>
                                <input type="number" id="quantity-ticket-${
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
                .join("")
            : "";

        const merchandiseInputs =
          merchandise.length > 0
            ? `<h3>Purchase Merchandise</h3>` +
              merchandise
                .map(
                  (m) => `
                    <div class="mb-3 border p-3 rounded">
                        <h5>${m.name} (RM ${m.price.toFixed(2)})</h5>
                        <p class="mb-1">${m.description || ""}</p>
                        <div class="row">
                            <div class="col-md-6">
                                <label for="quantity-merch-${
                                  m.id
                                }" class="form-label">Quantity</label>
                                <input type="number" id="quantity-merch-${
                                  m.id
                                }" class="form-control merchandise-quantity" min="0" value="0" data-merchandise-id="${
                    m.id
                  }" max="${m.stock}">
                                <small class="text-muted">Stock: ${
                                  m.stock
                                }</small>
                            </div>
                        </div>
                    </div>
                `
                )
                .join("")
            : "";

        orderFormContainer.innerHTML = `
                    <form id="order-form">
                        ${ticketInputs}
                        ${merchandiseInputs}
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
  const ticketQuantityInputs = document.querySelectorAll(".ticket-quantity");
  let validationFailed = false;

  ticketQuantityInputs.forEach((input) => {
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

  const merchandiseQuantityInputs = document.querySelectorAll(
    ".merchandise-quantity"
  );
  merchandiseQuantityInputs.forEach((input) => {
    if (validationFailed) return;
    const quantity = parseInt(input.value, 10);
    if (quantity > 0) {
      const maxStock = parseInt(input.getAttribute("max"), 10);
      if (quantity > maxStock) {
        const merchName = input.closest(".border").querySelector("h5").textContent;
        showAlert(
          `Quantity for ${merchName} exceeds available stock (${maxStock}).`,
          "warning"
        );
        validationFailed = true;
        return;
      }
      const merchandiseId = input.dataset.merchandiseId;
      items.push({
        merchandise_id: merchandiseId,
        quantity: quantity,
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
        <p><strong>Total Merchandise Sold:</strong> 0</p>
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
            <td>${p.merchandise_items_sold}</td>
            <td>RM ${p.total_revenue.toFixed(2)}</td>
        </tr>
    `
      )
      .join("");

    statsContainer.innerHTML = `
        <h5>Overall Summary</h5>
        <p><strong>Total Revenue:</strong> RM ${stats.total_revenue.toFixed(2)}</p>
        <p><strong>Total Tickets Sold:</strong> ${stats.total_tickets_sold}</p>
        <p><strong>Total Merchandise Sold:</strong> ${
          stats.total_merchandise_items_sold
        }</p>
        <hr>
        <h5>Revenue by Park</h5>
        <table class="table">
            <thead>
                <tr>
                    <th>Park</th>
                    <th>Tickets Sold</th>
                    <th>Merchandise Sold</th>
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
