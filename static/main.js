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

    // Initialize Home Page Animations
    initHomeAnimations();
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
    if (event.target.id === "confirm-reschedule-btn") {
      event.preventDefault(); // Prevent any default form submission
      await handleRescheduleSubmit();
    }
    if (event.target.id === "confirm-refund-btn") {
      event.preventDefault();
      await handleRefundSubmit();
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

  const rescheduleModal = document.getElementById("rescheduleModal");
  if (rescheduleModal) {
    rescheduleModal.addEventListener("show.bs.modal", (event) => {
      const button = event.relatedTarget;
      const orderId = button.getAttribute("data-order-id");
      document.getElementById("reschedule-order-id").value = orderId;
      
      // Set min date to today
      const today = new Date().toISOString().split("T")[0];
      document.getElementById("new-visit-date").min = today;
      document.getElementById("new-visit-date").value = ""; 
    });
  }

  const refundModal = document.getElementById("refundModal");
  if (refundModal) {
    refundModal.addEventListener("show.bs.modal", (event) => {
      const button = event.relatedTarget;
      const orderId = button.getAttribute("data-order-id");
      document.getElementById("refund-order-id").value = orderId;
      document.getElementById("refund-reason").value = ""; // Clear previous text
      const alertPlaceholder = document.getElementById("refund-alert-placeholder");
      if (alertPlaceholder) alertPlaceholder.innerHTML = "";
    });
  }

    const btnPay = document.getElementById("btn-confirm-payment");
    if(btnPay) {
        btnPay.addEventListener("click", async () => {
            if(!currentOrderPayload) return;
            
            const token = getToken();
            // Disable button to prevent double click
            btnPay.disabled = true; 
            btnPay.innerText = "Processing...";

            try {
                const response = await fetch("/api/orders/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(currentOrderPayload),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.detail || "Failed.");

                // Close Modal
                const modalEl = document.getElementById('orderSummaryModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if (modal) {
                  modal.hide();
                }

                showToast("✅ Payment Successful! Redirecting...", "success");
                
                setTimeout(() => {
                    window.location.href = "/profile";
                }, 1500);

            } catch (error) {
                showAlert(error.message, "danger");
                btnPay.disabled = false;
                btnPay.innerText = "Confirm & Pay";
            }
        });
    }
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
  // Handle Bootstrap Nav (Legacy/Other Pages)
  const navItems = document.getElementById("nav-items");
  const token = getToken();
  const userStr = localStorage.getItem("user");
  const user = token && userStr ? JSON.parse(userStr) : null;

  if (navItems) {
      if (user) {
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

  // Handle Tailwind Nav (Home Page)
  const authLinksContainer = document.getElementById("auth-links");
  if (authLinksContainer) {
      if (user) {
          const adminLink = user.is_admin 
            ? `<a href="/admin" class="hover:text-white transition-colors no-underline">Admin</a>` 
            : "";
          
          authLinksContainer.innerHTML = `
            <span class="text-gray-400">Hi, ${user.full_name || 'User'}</span>
            <a href="/profile" class="hover:text-white transition-colors no-underline">Profile</a>
            ${adminLink}
            <a href="#" id="logout-btn" class="hover:text-white transition-colors no-underline">Logout</a>
          `;
      } else {
          authLinksContainer.innerHTML = `
            <a href="/login" class="hover:text-white transition-colors no-underline">Login</a>
            <a href="/register" class="transition-colors border border-white px-6 py-2 rounded-full hover:bg-white hover:text-black transition-all duration-300 no-underline">Register</a>
          `;
      }
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
        const statusBadge = park.is_active
          ? ""
          : ' <span class="badge bg-secondary">Inactive</span>';
        const ticketTypesHtml =
          park.ticketTypes.length > 0
            ? park.ticketTypes
                .map((tt) => {
                  const statusBadge = tt.is_active
                    ? ""
                    : ' <span class="badge bg-secondary">Inactive</span>';
                  return `
                <li class="list-group-item list-group-item d-flex justify-content-between align-items-center">
                    <span>${tt.name} - RM ${tt.price.toFixed(2)}${statusBadge}</span>
                    <div>
                        <button
                            class="btn btn-outline-secondary btn-sm btn-secondary edit-tt-btn"
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
                            class="btn btn-outline-danger btn-sm btn-danger delete-tt-btn"
                            data-park-id="${park.id}"
                            data-tt-id="${tt.id}"
                        >
                            Delete
                        </button>
                    </div>
                </li>
            `;
                })
                .join("")
            : '<li class="list-group-item list-group-item">No ticket types found for this park.</li>';

        const merchandiseHtml =
          park.merchandise.length > 0
            ? park.merchandise
                .map((m) => {
                  const statusBadge = m.is_active
                    ? ""
                    : ' <span class="badge bg-secondary">Inactive</span>';
                  return `
                <li class="list-group-item list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        ${m.name} - RM ${m.price.toFixed(2)}${statusBadge}<br>
                        <small class="text-muted">Stock: ${m.stock}</small>
                    </div>
                    <div>
                        <button
                            class="btn btn-outline-secondary btn-sm btn-secondary edit-merch-btn"
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
                            class="btn btn-outline-danger btn-sm btn-danger delete-merch-btn"
                            data-park-id="${park.id}"
                            data-merch-id="${m.id}"
                        >
                            Delete
                        </button>
                    </div>
                </li>
            `;
                })
                .join("")
            : '<li class="list-group-item list-group-item">No merchandise found for this park.</li>';

        return `
        <div class="accordion-item accordion-item">
            <h2 class="accordion-header" id="heading-${park.id}">
                <button class="accordion-button collapsed accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${
                  park.id
                }" aria-expanded="false" aria-controls="collapse-${park.id}">
                    ${park.name}${statusBadge}
                </button>
            </h2>
            <div id="collapse-${
              park.id
            }" class="accordion-collapse collapse" aria-labelledby="heading-${
          park.id
        }" data-bs-parent="#${accordionId}">
                <div class="accordion-body accordion-body">
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
                                class="btn btn-secondary btn-sm btn-secondary edit-park-btn"
                                data-bs-toggle="modal"
                                data-bs-target="#editParkModal"
                                data-park-id="${park.id}"
                                data-park-name="${park.name}"
                                data-park-location="${park.location || ""}"
                                data-park-description="${park.description || ""}"
                            >
                                Edit Park
                            </button>
                            <button class="btn btn-danger btn-sm btn-danger delete-park-btn" data-park-id="${
                              park.id
                            }">Delete Park</button>
                        </div>
                    </div>
                    
                    <h6>Ticket Types</h6>
                    <ul class="list-group mb-3">
                        ${ticketTypesHtml}
                    </ul>
                    <button
                        class="btn btn-primary btn-sm btn-primary add-tt-btn"
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
                        class="btn btn-primary btn-sm btn-primary add-merch-btn"
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

    showBottomRightNotification("Profile updated successfully.", "success");
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

/**
 * NEW: Displays a floating Toast notification
 * Replaces the old static alert system.
 */
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) {
    console.warn("Toast container not found. Alerting in console instead:", message);
    return;
  }
  
  let bgClass = "text-white bg-" + type;
  if (type === 'warning') {
    bgClass = "text-dark bg-warning"; // Use dark text for better contrast on yellow
  }
  let icon = "";

  // Add a little icon based on type for polish
  if (type === "success") icon = "✅ ";
  if (type === "danger") icon = "⚠️ ";
  if (type === "warning") icon = "✋ ";
  if (type === "info") icon = "ℹ️ ";

  const toastHtml = `
    <div class="toast align-items-center ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body" style="font-size: 1rem;">
          ${icon}${message}
        </div>
        <button type="button" class="btn-close ${type === 'warning' ? '' : 'btn-close-white'} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  // Append to container
  const wrapper = document.createElement('div');
  wrapper.innerHTML = toastHtml;
  const toastElement = wrapper.firstElementChild;
  container.appendChild(toastElement);

  // Initialize Bootstrap Toast
  const toast = new bootstrap.Toast(toastElement, {
    delay: 5000, // Disappear after 5 seconds
    animation: true
  });

  toast.show();

  // Cleanup DOM after it hides
  toastElement.addEventListener('hidden.bs.toast', () => {
    toastElement.remove();
  });
}

/**
 * OVERRIDE: Update the existing showAlert to use Toasts instead.
 * This ensures all your previous code uses the new system automatically.
 */
function showAlert(message, type = "info") {
    showToast(message, type);
}

function initHomeAnimations() {
    // 1. Observer for Reveal Animations
    const observerOptions = {
        root: null, // Use viewport
        threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const revealElements = entry.target.querySelectorAll('.reveal-text');
                revealElements.forEach((el, index) => {
                    setTimeout(() => {
                        el.classList.add('active');
                    }, index * 300);
                });
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('.snap-section');
    sections.forEach(section => {
        observer.observe(section);
    });

    // 2. Navigation Dot Highlighter
    const dotObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                document.querySelectorAll('.dot').forEach(dot => {
                    dot.classList.remove('opacity-100', 'scale-125');
                    dot.classList.add('opacity-40');
                });
                const activeDot = document.querySelector(`.dot[data-target="${id}"]`);
                if(activeDot) {
                    activeDot.classList.remove('opacity-40');
                    activeDot.classList.add('opacity-100', 'scale-125');
                }
            }
        });
    }, { root: null, threshold: 0.5 });

    sections.forEach(section => {
        dotObserver.observe(section);
    });

    // 3. Click functionality for dots
    document.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const targetId = dot.getAttribute('data-target');
            document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function showBottomRightNotification(message, type = "success") {
  let notificationContainer = document.getElementById("bottom-right-notifications");
  if (!notificationContainer) {
    notificationContainer = document.createElement("div");
    notificationContainer.id = "bottom-right-notifications";
    notificationContainer.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 9999; max-width: 450px;";
    document.body.appendChild(notificationContainer);
  }

  const notificationId = "notification-" + Date.now();
  const notification = document.createElement("div");
  notification.id = notificationId;
  notification.className = `alert alert-${type} alert-dismissible fade show`;
  notification.style.cssText = "margin-bottom: 10px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); padding: 1rem 1.5rem; font-size: 1rem; min-width: 300px; display: flex; align-items: center; justify-content: space-between; gap: 1rem;";
  notification.innerHTML = `
    <div style="flex: 1; word-wrap: break-word; margin: 0;">${message}</div>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" style="flex-shrink: 0; margin: 0;"></button>
  `;

  notificationContainer.appendChild(notification);

  setTimeout(() => {
    const alertElement = document.getElementById(notificationId);
    if (alertElement && alertElement.parentNode) {
      const bsAlert = new bootstrap.Alert(alertElement);
      bsAlert.close();
    }
  }, 5000);
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
    if (!userResponse.ok) throw new Error("Failed to fetch user data.");
    const userData = await userResponse.json();
    
    // Update Profile inputs safely
    const nameInput = document.getElementById("profile-full-name");
    const emailInput = document.getElementById("profile-email");
    if(nameInput) nameInput.value = userData.full_name || "";
    if(emailInput) emailInput.value = userData.email;

    // Fetch orders
    const ordersResponse = await fetch(`/api/orders/?t=${new Date().getTime()}`, {
      headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
      },
    });
    if (!ordersResponse.ok) throw new Error("Failed to fetch orders.");
    const ordersData = await ordersResponse.json();
    console.log("FULL ORDERS DATA:", JSON.stringify(ordersData, null, 2)); // Debugging log

    const ordersContainer = document.getElementById("orders-container");
    if (ordersData.length === 0) {
      ordersContainer.innerHTML = `<div class="card card mb-4"><div class="card-body"><p class="text-center text-muted">You have no orders.</p></div></div>`;
      return;
    }

    // 1. Generate HTML String
    const ordersHtml = ordersData.map((order) => {
        // Determine Badge Color
        let badgeClass = "success";
        if (order.status === "cancelled") badgeClass = "danger";
        if (order.status === "refunded") badgeClass = "warning"; // Orange for refund

        return `
        <div class="card order-card mb-3">
            <div class="card-header card-header d-flex justify-content-between align-items-center">
                <span><strong>Order #${order.id.slice(0, 8)}</strong></span>
                <span class="badge bg-${badgeClass}">${order.status.toUpperCase()}</span>
            </div>
            <div class="card-body card-body">
                <div class="row">
                    <div class="col-md-8">
                        <p class="mb-2"><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-GB')}</p>
                        <p class="mb-3"><strong>Total:</strong> RM ${order.total_amount.toFixed(2)}</p>
                        <h6 class="text-muted text-uppercase small fw-bold">Items</h6>
                        <ul class="list-group list-group-flush mb-3">
                            ${order.items.map((item) => {
                                // Only show QR code placeholder if it is a TICKET (has ticket_type_id)
                                // and the order is NOT cancelled/refunded
                                let qrHtml = "";
                                if (item.ticket_type_id) { 
                                    // Generate placeholder
                                    if(order.status !== 'cancelled' && order.status !== 'refunded') {
                                        qrHtml = `<div class="mt-2 ms-3">
                                                    <small class="text-muted" style="font-size: 0.7rem;">Scan for Entry:</small>
                                                    <div id="qrcode-${item.id}" class="qr-placeholder"></div>
                                                  </div>`;
                                    }
                                }
                                
                                let itemText = "Unknown Item";
                                if (item.ticket_types) {
                                  itemText = `${item.quantity} x ${item.ticket_types.name} <span class="text-muted">(Visit: ${item.visit_date})</span>`;
                                } else if (item.merchandise) {
                                  itemText = `${item.quantity} x ${item.merchandise.name}`;
                                }

                                return `<li class="list-group-item d-flex justify-content-between align-items-start flex-wrap">
                                            <div class="ms-2 me-auto">
                                                <div class="fw-bold">${itemText}</div>
                                                ${qrHtml} 
                                            </div>
                                        </li>`;
                            }).join("")}
                        </ul>
                    </div>
                    
                    <div class="col-md-4 d-flex flex-column justify-content-center align-items-end">
                        ${
                          order.status !== "cancelled" && order.status !== "refunded"
                            ? `
                              <button class="btn btn-primary btn-sm mb-2 w-100 reschedule-btn" 
                                  data-order-id="${order.id}" 
                                  data-bs-toggle="modal" 
                                  data-bs-target="#rescheduleModal">
                                  Reschedule
                              </button>
                              <button class="btn btn-danger btn-sm w-100 refund-btn" 
                                  data-order-id="${order.id}"
                                  data-bs-toggle="modal"
                                  data-bs-target="#refundModal">
                                  Request Refund
                              </button>
                              `
                            : `<button class="btn btn-secondary btn-sm w-100" disabled>Action Unavailable</button>`
                        }
                    </div>
                </div>
            </div>
        </div>
    `}).join("");

    // 2. Inject HTML
    ordersContainer.innerHTML = ordersHtml;

    // 3. Render QR Codes (After HTML is injected)
    // We loop through the data again to find items that need QR codes
    ordersData.forEach(order => {
        if (order.status !== 'cancelled' && order.status !== 'refunded') {
            order.items.forEach(item => {
                // Look for the container we created above
                const qrContainer = document.getElementById(`qrcode-${item.id}`);
                if (qrContainer) {
                    // Clear previous content just in case
                    qrContainer.innerHTML = ""; 
                    
                    // Generate QR Code
                    new QRCode(qrContainer, {
                        text: item.id, // The content of the QR code (Ticket UUID)
                        width: 80,     // Width
                        height: 80,    // Height
                        colorDark : "#2d5016", // Dark green to match theme
                        colorLight : "#ffffff",
                        correctLevel : QRCode.CorrectLevel.H
                    });
                }
            });
        }
    });

  } catch (error) {
    console.error(error);
    showAlert(error.message, "danger");
    // Handle token expiry if needed, or just let the user stay on the page
    if(error.message.includes("401")) {
        removeToken();
        setTimeout(() => (window.location.href = "/login"), 2000);
    }
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
    showBottomRightNotification("Order cancelled successfully.", "success");
    loadProfileData(); // Reload profile data to show updated status
  } catch (error) {
    showBottomRightNotification(error.message, "danger");
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

// Mapping of park names to their images
const parkImageMap = {
  'bako': '/assets/bako.jpg',
  'mulu': '/assets/mulu.jpg',
  'niah': '/assets/niah.jpg'
};

// Fallback images for parks without specific images
const fallbackImages = [
  'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800', // Forest trail
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800', // Mountain landscape
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800', // Forest canopy
];

// Function to get image for park based on name
function getParkImage(parkName, index) {
  if (!parkName) {
    return fallbackImages[index % fallbackImages.length];
  }
  
  const parkNameLower = parkName.toLowerCase();
  
  // Check if park name contains any of the mapped park names
  for (const [key, imagePath] of Object.entries(parkImageMap)) {
    if (parkNameLower.includes(key)) {
      return imagePath;
    }
  }
  
  // Fallback to default images if no match found
  return fallbackImages[index % fallbackImages.length];
}

function renderParks(parks) {
  const parksContainer = document.getElementById("parks-container");
  if (parks.length === 0) {
    parksContainer.innerHTML = "<p class='text-white'>No parks match your search.</p>";
    return;
  }

  const parksHtml = parks
    .map(
      (park, index) => `
      <div class="group flex flex-col h-full bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-green-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-green-900/10">
          <div class="relative h-64 overflow-hidden">
            <img src="${getParkImage(park.name, index)}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="${park.name}" loading="lazy">
            <div class="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80"></div>
          </div>
          <div class="p-6 flex flex-col flex-grow relative">
              <h5 class="font-serif text-2xl text-white mb-2 group-hover:text-green-400 transition-colors">${park.name}</h5>
              <div class="h-px w-12 bg-green-500/50 mb-4 group-hover:w-24 transition-all duration-500"></div>
              <p class="font-sans text-sm text-gray-400 mb-6 flex-grow line-clamp-3 leading-relaxed">${
                park.description || "No description available."
              }</p>
              <a href="/parks/${
                park.id
              }" class="mt-auto inline-flex items-center justify-center px-6 py-3 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all duration-300 group-hover:border-white">
                  Discover
              </a>
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

let currentOrderPayload = null; // Store data temporarily

async function handleOrderSubmit(event) {
  event.preventDefault();
  
  // 1. Collect Data (Same as before)
  const items = [];
  let grandTotal = 0;
  let summaryHtml = "";
  
  // Tickets
  document.querySelectorAll(".ticket-quantity").forEach((input) => {
    const qty = parseInt(input.value);
    if (qty > 0) {
      const name = input.closest(".ticket-section").querySelector("h5").innerText.split(" (")[0];
      const priceText = input.closest(".ticket-section").querySelector("h5").innerText.split("RM ")[1];
      const price = priceText ? parseFloat(priceText) : 0;
      const total = qty * price;
      grandTotal += total;
      
      const dateVal = document.getElementById(`visit-date-${input.dataset.ticketTypeId}`).value;
      
      items.push({
        ticket_type_id: input.dataset.ticketTypeId,
        quantity: qty,
        visit_date: dateVal
      });

      summaryHtml += `
        <div class="d-flex justify-content-between mb-2">
            <span>${qty}x ${name} <small class="text-muted">(${dateVal})</small></span>
            <span>RM ${total.toFixed(2)}</span>
        </div>`;
    }
  });

  // Merchandise (Same logic)
  document.querySelectorAll(".merchandise-quantity").forEach((input) => {
    const qty = parseInt(input.value);
    if (qty > 0) {
      const name = input.closest(".merchandise-section").querySelector("h5").innerText.split(" (")[0];
      const priceText = input.closest(".merchandise-section").querySelector("h5").innerText.split("RM ")[1];
      const price = priceText ? parseFloat(priceText) : 0;
      const total = qty * price;
      grandTotal += total;

      items.push({
        merchandise_id: input.dataset.merchandiseId,
        quantity: qty
      });

      summaryHtml += `
        <div class="d-flex justify-content-between mb-2">
            <span>${qty}x ${name}</span>
            <span>RM ${total.toFixed(2)}</span>
        </div>`;
    }
  });

  if (items.length === 0) {
    showAlert("Please select at least one item.", "warning");
    return;
  }

  // 2. Populate Modal
  document.getElementById("summary-items-list").innerHTML = summaryHtml;
  document.getElementById("summary-total").innerText = `RM ${grandTotal.toFixed(2)}`;
  
  // Store payload for the actual send
  currentOrderPayload = { items: items };

  // 3. Show Modal
  const modal = new bootstrap.Modal(document.getElementById('orderSummaryModal'));
  modal.show();
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
            <h2 style="background: linear-gradient(135deg, #2d5016 0%, #3d6b1f 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 700; margin-bottom: 1.5rem;">${park.name}</h2>
            <p><strong style="color: #2d5016;">Location:</strong> ${park.location || "N/A"}</p>
            <p style="line-height: 1.8; color: #666;">${park.description || "No description available."}</p>
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
            ? `<h3 class="section-title">Book Tickets</h3>` +
              ticketTypes
                .map(
                  (tt) => `
                    <div class="ticket-section mb-3">
                        <h5 style="color: #2d5016; font-weight: 600;">${tt.name} (RM ${tt.price.toFixed(2)})</h5>
                        <div class="row">
                            <div class="col-md-6">
                                <label for="quantity-ticket-${
                                  tt.id
                                }" class="form-label form-label">Quantity</label>
                                <input type="number" id="quantity-ticket-${
                                  tt.id
                                }" class="form-control form-control ticket-quantity" min="0" value="0" data-ticket-type-id="${
                    tt.id
                  }">
                            </div>
                            <div class="col-md-6">
                                <label for="visit-date-${
                                  tt.id
                                }" class="form-label form-label">Visit Date</label>
                                <input type="date" id="visit-date-${
                                  tt.id
                                }" class="form-control form-control visit-date" min="${today}">
                            </div>
                        </div>
                    </div>
                `
                )
                .join("")
            : "";

        const merchandiseInputs =
          merchandise.length > 0
            ? `<h3 class="section-title">Purchase Merchandise</h3>` +
              merchandise
                .map(
                  (m) => `
                    <div class="merchandise-section mb-3">
                        <h5 style="color: #2d5016; font-weight: 600;">${m.name} (RM ${m.price.toFixed(2)})</h5>
                        <p class="mb-1">${m.description || ""}</p>
                        <div class="row">
                            <div class="col-md-6">
                                <label for="quantity-merch-${
                                  m.id
                                }" class="form-label form-label">Quantity</label>
                                <input type="number" id="quantity-merch-${
                                  m.id
                                }" class="form-control form-control merchandise-quantity" min="0" value="0" data-merchandise-id="${
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
                        <button type="submit" class="btn btn-success btn-success mt-3">Place Order</button>
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
    parkDetailContainer.innerHTML = `<div class="alert alert-danger alert">${error.message}</div>`;
  }
}

async function handleRescheduleSubmit() {
  const token = getToken();
  const orderId = document.getElementById("reschedule-order-id").value;
  const newDate = document.getElementById("new-visit-date").value;

  if (!newDate) {
    showAlert("Please select a new date.", "warning");
    return;
  }

  const payload = {
    new_visit_date: newDate
  };

  try {
    const response = await fetch(`/api/orders/${orderId}/reschedule`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Failed to reschedule order.");
    }

    showBottomRightNotification("Order rescheduled successfully.", "success");
    
    // Close Modal safely
    const modalEl = document.getElementById("rescheduleModal");
    const closeBtn = modalEl.querySelector(".btn-close");
    if (closeBtn) {
      closeBtn.click();
    } else {
      // Fallback if button is missing
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    loadProfileData(); // Refresh list to show new date
  } catch (error) {
    showBottomRightNotification(error.message, "danger");
  }
}

async function handleRefundSubmit() {
  const token = getToken();
  const orderId = document.getElementById("refund-order-id").value;
  const reason = document.getElementById("refund-reason").value;

  if (!reason) {
    const alertPlaceholder = document.getElementById("refund-alert-placeholder");
    if (alertPlaceholder) {
      alertPlaceholder.innerHTML = `
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
          Please provide a reason for the refund.
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;
    } else {
      showAlert("Please provide a reason for the refund.", "warning");
    }
    return;
  }

  const payload = { reason: reason };

  try {
    const response = await fetch(`/api/orders/${orderId}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Failed to process refund.");
    }

    showBottomRightNotification("Refund processed successfully.", "success");
    
    // Close Modal
    const modalEl = document.getElementById("refundModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    loadProfileData(); // Refresh list to show "refunded" status
  } catch (error) {
    showBottomRightNotification(error.message, "danger");
  }
}
