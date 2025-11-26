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
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("keyup", handleParkSearch);
    }

    loadParks().then(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get("q");
      if (query && searchInput) {
        searchInput.value = query;
        searchInput.dispatchEvent(new Event("keyup"));

        if (window.location.hash === "#parks-grid") {
          const grid = document.getElementById("parks-grid");
          if (grid) grid.scrollIntoView();
        }
      }
    });

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
    const logoutBtn = event.target.closest("#logout-btn");
    if (logoutBtn) {
      event.preventDefault();
      handleLogout();
      return;
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
    // Park Actions
    if (event.target.classList.contains("deactivate-park-btn")) {
      const parkId = event.target.dataset.parkId;
      if (confirm("Are you sure you want to deactivate this park? It will be hidden from visitors.")) {
        await handleDeletePark(parkId, false);
      }
    }
    if (event.target.classList.contains("delete-park-permanent-btn")) {
      const parkId = event.target.dataset.parkId;
      if (confirm("⚠️ DANGER: Are you sure you want to PERMANENTLY delete this park? This cannot be undone and will delete all associated tickets and merchandise.")) {
        await handleDeletePark(parkId, true);
      }
    }

    // Ticket Type Actions
    if (event.target.classList.contains("deactivate-tt-btn")) {
      const parkId = event.target.dataset.parkId;
      const ttId = event.target.dataset.ttId;
      if (confirm("Deactivate this ticket type?")) {
        await handleDeleteTicketType(parkId, ttId, false);
      }
    }
    if (event.target.classList.contains("delete-tt-permanent-btn")) {
      const parkId = event.target.dataset.parkId;
      const ttId = event.target.dataset.ttId;
      if (confirm("Permanently delete this ticket type?")) {
        await handleDeleteTicketType(parkId, ttId, true);
      }
    }

    // Merchandise Actions
    if (event.target.classList.contains("deactivate-merch-btn")) {
      const parkId = event.target.dataset.parkId;
      const merchId = event.target.dataset.merchId;
      if (confirm("Deactivate this merchandise?")) {
        await handleDeleteMerchandise(parkId, merchId, false);
      }
    }
    if (event.target.classList.contains("delete-merch-permanent-btn")) {
      const parkId = event.target.dataset.parkId;
      const merchId = event.target.dataset.merchId;
      if (confirm("Permanently delete this merchandise?")) {
        await handleDeleteMerchandise(parkId, merchId, true);
      }
    }
  });

  const refundSelect = document.getElementById("refund-reason-select");
  if (refundSelect) {
    refundSelect.addEventListener("change", (e) => {
      const customContainer = document.getElementById("refund-custom-reason-container");
      if (e.target.value === "Other") {
        customContainer.classList.remove("hidden");
        document.getElementById("refund-reason").required = true;
      } else {
        customContainer.classList.add("hidden");
        document.getElementById("refund-reason").required = false;
      }
    });
  }

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
        
        // Attach listener directly
        const logoutBtn = navItems.querySelector("#logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                handleLogout();
            });
        }

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

          // Attach listener directly
          const logoutBtn = authLinksContainer.querySelector("#logout-btn");
          if (logoutBtn) {
              logoutBtn.addEventListener("click", (e) => {
                  e.preventDefault();
                  handleLogout();
              });
          }

      } else {
          authLinksContainer.innerHTML = `
            <a href="/login" class="hover:text-white transition-colors no-underline">Login</a>
            <a href="/register" class="hover:text-white transition-colors no-underline">Register</a>
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
  const fileInput = document.getElementById("park-image");
  const file = fileInput.files[0];

  const formData = new FormData();
  formData.append("name", parkName);
  if (parkLocation) formData.append("location", parkLocation);
  if (parkDescription) formData.append("description", parkDescription);
  if (file) {
    formData.append("image", file);
  }

  try {
    const response = await fetch("/api/admin/parks/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
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

async function loadAdminDashboard() {
  const token = getToken();
  if (!token) return;

  const container = document.getElementById("statistics-container");

  try {
    const response = await fetch("/api/admin/statistics/visitors/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to load statistics.");

    const stats = await response.json();

    const revenueByParkHtml = stats.revenue_by_park.map(park => `
        <div class="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
            <span class="text-gray-300 font-serif">${park.park_name}</span>
            <div class="text-right">
                <div class="text-green-400 font-bold">RM ${park.total_revenue.toFixed(2)}</div>
                <div class="text-xs text-gray-500">${park.tickets_sold} Tickets | ${park.merchandise_items_sold} Merch</div>
            </div>
        </div>
    `).join("");

    container.innerHTML = `
        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white/5 p-4 rounded-lg text-center border border-white/10">
                    <h6 class="text-gray-400 text-xs uppercase tracking-widest mb-2">Total Revenue</h6>
                    <p class="text-3xl font-serif text-green-400 font-bold">RM ${stats.total_revenue.toFixed(2)}</p>
                </div>
                <div class="bg-white/5 p-4 rounded-lg text-center border border-white/10">
                    <h6 class="text-gray-400 text-xs uppercase tracking-widest mb-2">Tickets Sold</h6>
                    <p class="text-3xl font-serif text-white font-bold">${stats.total_tickets_sold}</p>
                </div>
                <div class="bg-white/5 p-4 rounded-lg text-center border border-white/10">
                    <h6 class="text-gray-400 text-xs uppercase tracking-widest mb-2">Merchandise Sold</h6>
                    <p class="text-3xl font-serif text-white font-bold">${stats.total_merchandise_items_sold}</p>
                </div>
            </div>

            <div class="bg-white/5 p-6 rounded-lg border border-white/10">
                <h6 class="text-gray-400 text-xs uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Revenue Breakdown by Park</h6>
                <div class="space-y-1">
                    ${revenueByParkHtml || '<p class="text-gray-500 italic text-sm">No data available.</p>'}
                </div>
            </div>
        </div>
    `;

  } catch (error) {
    console.error("Dashboard Error:", error); // Added logging
    container.innerHTML = `<div class="p-6 text-red-400">Error loading statistics: ${error.message}</div>`;
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
      container.innerHTML = "<p class='text-gray-400 p-4'>No parks have been created yet.</p>";
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

    // Generate Tabs Navigation
    const tabsNav = `
      <ul class="nav nav-pills mb-4 gap-2 overflow-x-auto flex-nowrap pb-2" id="pills-tab" role="tablist">
        ${parksWithDetails.map((park, index) => `
          <li class="nav-item whitespace-nowrap" role="presentation">
            <button class="nav-link ${index === 0 ? 'active' : ''} rounded-full border border-white/10 text-white px-6" 
                    id="pills-${park.id}-tab" 
                    data-bs-toggle="pill" 
                    data-bs-target="#pills-${park.id}" 
                    type="button" 
                    role="tab" 
                    aria-controls="pills-${park.id}" 
                    aria-selected="${index === 0}">
              ${park.name}
            </button>
          </li>
        `).join('')}
      </ul>
    `;

    // Generate Tabs Content
    const tabsContent = `
      <div class="tab-content" id="pills-tabContent">
        ${parksWithDetails.map((park, index) => {
          const statusBadge = park.is_active
            ? ""
            : ' <span class="inline-block px-2 py-1 text-xs font-bold text-white bg-gray-600 rounded-full ml-2">Inactive</span>';
          
          const ticketTypesHtml =
            park.ticketTypes.length > 0
              ? park.ticketTypes
                  .map((tt) => {
                    const ttBadge = tt.is_active
                      ? ""
                      : ' <span class="text-xs text-gray-500 ml-2">(Inactive)</span>';
                    return `
                  <li class="flex flex-col items-start p-4 border-b border-white/10 last:border-0 text-gray-300 hover:bg-white/5 transition-colors gap-3">
                      <div class="w-full">
                          <span class="font-bold text-white block">${tt.name}</span>
                          <span class="text-sm text-gray-400">RM ${tt.price.toFixed(2)}${ttBadge}</span>
                      </div>
                      <div class="flex gap-2 w-full flex-wrap">
                          <button
                              class="flex-1 px-3 py-2 text-xs border border-white/30 rounded-lg hover:bg-white hover:text-black transition-colors text-white edit-tt-btn whitespace-nowrap text-center"
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
                              class="flex-1 px-3 py-2 text-xs border border-yellow-500/50 text-yellow-400 rounded-lg hover:bg-yellow-500 hover:text-black transition-colors deactivate-tt-btn whitespace-nowrap text-center"
                              data-park-id="${park.id}"
                              data-tt-id="${tt.id}"
                          >
                              Deactivate
                          </button>
                          <button
                              class="flex-1 px-3 py-2 text-xs border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors delete-tt-permanent-btn whitespace-nowrap text-center"
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
              : '<li class="p-3 text-gray-500 italic text-sm">No ticket types found.</li>';

          const merchandiseHtml =
            park.merchandise.length > 0
              ? park.merchandise
                  .map((m) => {
                    const mBadge = m.is_active
                      ? ""
                      : ' <span class="text-xs text-gray-500 ml-2">(Inactive)</span>';
                    return `
                  <li class="flex flex-col items-start p-4 border-b border-white/10 last:border-0 text-gray-300 hover:bg-white/5 transition-colors gap-3">
                      <div class="w-full">
                          <span class="font-bold text-white block">${m.name}</span>
                          <div class="flex justify-between items-center text-sm text-gray-400">
                              <span>RM ${m.price.toFixed(2)}${mBadge}</span>
                              <span class="text-xs bg-white/10 px-2 py-0.5 rounded">Stock: ${m.stock}</span>
                          </div>
                      </div>
                      <div class="flex gap-2 w-full flex-wrap">
                          <button
                              class="flex-1 px-3 py-2 text-xs border border-white/30 rounded-lg hover:bg-white hover:text-black transition-colors text-white edit-merch-btn whitespace-nowrap text-center"
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
                              class="flex-1 px-3 py-2 text-xs border border-yellow-500/50 text-yellow-400 rounded-lg hover:bg-yellow-500 hover:text-black transition-colors deactivate-merch-btn whitespace-nowrap text-center"
                              data-park-id="${park.id}"
                              data-merch-id="${m.id}"
                          >
                              Deactivate
                          </button>
                          <button
                              class="flex-1 px-3 py-2 text-xs border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors delete-merch-permanent-btn whitespace-nowrap text-center"
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
              : '<li class="p-3 text-gray-500 italic text-sm">No merchandise found.</li>';

          return `
            <div class="tab-pane fade ${index === 0 ? 'show active' : ''}" 
                 id="pills-${park.id}" 
                 role="tabpanel" 
                 aria-labelledby="pills-${park.id}-tab">
              
              <div class="glass-panel p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <div class="flex flex-col xl:flex-row justify-between items-start mb-6 pb-6 border-b border-white/10 gap-4">
                      <div class="text-gray-300 text-sm w-full xl:w-auto">
                          <h4 class="text-2xl font-serif text-white font-bold mb-2">${park.name}${statusBadge}</h4>
                          <p class="mb-1"><strong class="text-white">Location:</strong> ${park.location || "N/A"}</p>
                          <p><strong class="text-white">Description:</strong> ${park.description || "N/A"}</p>
                      </div>
                      <div class="flex gap-2 flex-wrap shrink-0">
                          <button
                              class="px-4 py-2 text-sm border border-white/30 rounded-full hover:bg-white hover:text-black transition-colors text-white edit-park-btn whitespace-nowrap"
                              data-bs-toggle="modal"
                              data-bs-target="#editParkModal"
                              data-park-id="${park.id}"
                              data-park-name="${park.name}"
                              data-park-location="${park.location || ""}"
                              data-park-description="${park.description || ""}"
                          >
                              Edit Park
                          </button>
                          <button class="px-4 py-2 text-sm border border-yellow-500/50 text-yellow-400 rounded-full hover:bg-yellow-500 hover:text-black transition-colors deactivate-park-btn whitespace-nowrap" data-park-id="${park.id}">
                            Deactivate
                          </button>
                          <button class="px-4 py-2 text-sm border border-red-500/50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-colors delete-park-permanent-btn whitespace-nowrap" data-park-id="${park.id}">
                            Delete
                          </button>
                      </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h6 class="text-green-400 font-bold uppercase text-xs tracking-widest mb-3">Ticket Types</h6>
                        <ul class="rounded-lg border border-white/10 overflow-hidden mb-3">
                            ${ticketTypesHtml}
                        </ul>
                        <button
                            class="px-4 py-2 text-xs bg-green-700 hover:bg-green-600 text-white rounded-full transition-colors add-tt-btn uppercase tracking-wider font-bold"
                            data-bs-toggle="modal"
                            data-bs-target="#ticketTypeModal"
                            data-park-id="${park.id}"
                        >
                            + Add Ticket Type
                        </button>
                    </div>

                    <div>
                        <h6 class="text-green-400 font-bold uppercase text-xs tracking-widest mb-3">Merchandise</h6>
                        <ul class="rounded-lg border border-white/10 overflow-hidden mb-3">
                            ${merchandiseHtml}
                        </ul>
                        <button
                            class="px-4 py-2 text-xs bg-green-700 hover:bg-green-600 text-white rounded-full transition-colors add-merch-btn uppercase tracking-wider font-bold"
                            data-bs-toggle="modal"
                            data-bs-target="#merchandiseModal"
                            data-park-id="${park.id}"
                        >
                            + Add Merchandise
                        </button>
                    </div>
                  </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.innerHTML = tabsNav + tabsContent;
  } catch (error) {
    console.error("Parks Loading Error:", error); // Added logging
    container.innerHTML = `<div class="alert alert-danger bg-red-900/50 text-red-200 border-red-800">${error.message}</div>`;
  }
}

async function handleDeletePark(parkId, permanent = false) {
  const token = getToken();
  if (!token) {
    showAlert("Authentication error. Please log in again.", "danger");
    return;
  }

  const url = permanent 
    ? `/api/admin/parks/${parkId}?permanent=true` 
    : `/api/admin/parks/${parkId}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Failed to delete park.");
    }

    showAlert(permanent ? "Park permanently deleted." : "Park deactivated.", "success");
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

async function handleDeleteTicketType(parkId, ttId, permanent = false) {
  const token = getToken();
  if (!token) {
    showAlert("Authentication error. Please log in again.", "danger");
    return;
  }

  const url = permanent
    ? `/api/admin/parks/${parkId}/ticket-types/${ttId}?permanent=true`
    : `/api/admin/parks/${parkId}/ticket-types/${ttId}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Failed to delete ticket type.");
    }

    showAlert(permanent ? "Ticket type permanently deleted." : "Ticket type deactivated.", "success");
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

async function handleDeleteMerchandise(parkId, merchId, permanent = false) {
  const token = getToken();
  if (!token) {
    showAlert("Authentication error. Please log in again.", "danger");
    return;
  }

  const url = permanent
    ? `/api/admin/parks/${parkId}/merchandise/${merchId}?permanent=true`
    : `/api/admin/parks/${parkId}/merchandise/${merchId}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || "Failed to delete merchandise.");
    }

    showAlert(permanent ? "Merchandise permanently deleted." : "Merchandise deactivated.", "success");
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
                                        qrHtml = `<div class="mt-4 flex flex-col items-center gap-2 w-full sm:w-auto">
                                                    <small class="text-gray-400 text-xs uppercase tracking-wider font-bold">Scan for Entry</small>
                                                    <div id="qrcode-${item.id}" class="p-2 bg-white rounded-lg shadow-md"></div>
                                                  </div>`;
                                    }
                                }
                                
                                let itemText = "Unknown Item";
                                if (item.ticket_types) {
                                  itemText = `${item.quantity} x ${item.ticket_types.name} <span class="text-muted">(Visit: ${item.visit_date})</span>`;
                                } else if (item.merchandise) {
                                  itemText = `${item.quantity} x ${item.merchandise.name}`;
                                }

                                return `<li class="list-group-item d-flex flex-column sm:flex-row justify-content-between align-items-center sm:align-items-start p-4 bg-transparent border-b border-white/10">
                                            <div class="mb-3 sm:mb-0">
                                                <div class="fw-bold text-white text-lg mb-1">${itemText}</div>
                                            </div>
                                            ${qrHtml}
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
function getParkImage(park, index) {
  if (park.image_url) {
    return park.image_url;
  }
  if (!park.name) {
    return fallbackImages[index % fallbackImages.length];
  }

  const parkNameLower = park.name.toLowerCase();

  // Check if park name contains any of the mapped park names
  for (const [key, imagePath] of Object.entries(parkImageMap)) {
    if (parkNameLower.includes(key)) {
      return imagePath;
    }
  }

  // Fallback to default images if no match found
  // Use a simple hash of the name to pick a stable fallback image
  let hash = 0;
  for (let i = 0; i < park.name.length; i++) {
    hash = park.name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const positiveHash = Math.abs(hash);

  return fallbackImages[positiveHash % fallbackImages.length];
}

function renderParks(parks, skipClear = false) {
  const parksContainer = document.getElementById("parks-container");

  if (!skipClear) {
    while (parksContainer.firstChild) {
      parksContainer.removeChild(parksContainer.firstChild);
    }
  }

  if (parks.length === 0) {
    parksContainer.innerHTML = "<p class='text-white'>No parks match your search.</p>";
    return;
  }

  const fragment = document.createDocumentFragment();

  parks.forEach((park, index) => {
    // Create the main card element
    const parkCard = document.createElement('div');
    // The parent grid now has a fixed row height, so the card just needs to fill it.
    parkCard.className = 'group relative glass-panel rounded-xl overflow-hidden transform transition hover:-translate-y-2 duration-300 text-left h-full flex flex-col';


    // Get image and description
    const image = getParkImage(park, index);
    const description = park.description || "No description available.";

    // Use innerHTML for the static structure
    parkCard.innerHTML = `
      <div class="h-48 shrink-0 relative">
          <img src="${image}" class="w-full h-full object-cover" alt="${park.name}" loading="lazy">
          <div class="absolute top-0 left-0 right-0 h-48 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>
      </div>
      <div class="p-6 flex-grow flex flex-col">
          <h5 class="font-serif text-2xl text-white mb-3 group-hover:text-green-400 transition-colors">${park.name}</h5>
          <p class="font-sans text-sm text-gray-300 mb-4 line-clamp-3 leading-relaxed">${description}</p>
      </div>
      <div class="p-6 pt-0 text-center mt-auto">
          <a href="/parks/${park.id}" class="inline-block bg-white/10 backdrop-blur-sm border border-white/50 px-6 py-3 text-sm font-sans font-bold tracking-widest uppercase transition-all duration-300 text-white hover:bg-white hover:!text-black hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] no-underline w-full">
              Buy Tickets Now
          </a>
      </div>
    `;

    // Append the fully constructed card to the fragment
    fragment.appendChild(parkCard);
  });

  // Append the fragment to the DOM in a single operation
  parksContainer.appendChild(fragment);
}

function handleParkSearch(event) {
  const parksContainer = document.getElementById("parks-container");
  const searchTerm = event.target.value.toLowerCase();

  const filteredParks = allParks.filter(
    (park) =>
      park.name.toLowerCase().includes(searchTerm) ||
      (park.description && park.description.toLowerCase().includes(searchTerm))
  );

  // Force the browser to calculate layout before we change anything.
  const containerHeight = parksContainer.offsetHeight;
  parksContainer.style.height = `${containerHeight}px`;

  // Frame 1: Clear the container. This gives the browser a full frame to process the removal.
  requestAnimationFrame(() => {
    while (parksContainer.firstChild) {
        parksContainer.removeChild(parksContainer.firstChild);
    }

    // Frame 2: Render the new content. This happens on the *next* frame.
    requestAnimationFrame(() => {
        // Release the fixed height before adding new content
        parksContainer.style.height = '';
        renderParks(filteredParks, true); // Pass a flag to skip clearing
    });
  });
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

    // Render park details (Dark Text for Light Background)
    parkDetailContainer.innerHTML = `
            <h2 class="text-4xl md:text-5xl mb-6 font-serif font-bold text-green-900">${park.name}</h2>
            <p class="text-lg text-gray-800 mb-4"><strong class="text-green-700">Location:</strong> ${park.location || "N/A"}</p>
            <p class="text-gray-700 leading-relaxed text-lg">${park.description || "No description available."}</p>
        `;

    // Render order form if logged in
    const token = getToken();
    if (token) {
      if (ticketTypes.length === 0 && merchandise.length === 0) {
        orderFormContainer.innerHTML =
          "<p class='text-gray-700'>No tickets or merchandise available for this park at the moment.</p>";
      } else {
        const today = new Date().toISOString().split("T")[0];
        const ticketInputs =
          ticketTypes.length > 0
            ? `<h3 class="text-2xl mb-6 border-b border-gray-300 pb-2 text-green-900 font-serif">Book Tickets</h3>` +
              ticketTypes
                .map(
                  (tt) => `
                    <div class="ticket-section mb-6 p-4 rounded-lg bg-white/50 border border-gray-200 hover:bg-white/80 transition-colors">
                        <h5 class="text-xl font-bold text-green-800 mb-4">${tt.name} <span class="text-gray-600 text-base font-normal">(RM ${tt.price.toFixed(2)})</span></h5>
                        <div class="row g-4">
                            <div class="col-md-6">
                                <label for="quantity-ticket-${tt.id}" class="form-label text-gray-700 uppercase tracking-wider text-xs font-bold mb-2">Quantity</label>
                                <input type="number" id="quantity-ticket-${tt.id}" class="form-control bg-white border-gray-300 text-gray-900 ticket-quantity" min="0" value="0" data-ticket-type-id="${tt.id}">
                            </div>
                            <div class="col-md-6">
                                <label for="visit-date-${tt.id}" class="form-label text-gray-700 uppercase tracking-wider text-xs font-bold mb-2">Visit Date</label>
                                <input type="date" id="visit-date-${tt.id}" class="form-control bg-white border-gray-300 text-gray-900 visit-date" min="${today}">
                            </div>
                        </div>
                    </div>
                `
                )
                .join("")
            : "";

        const merchandiseInputs =
          merchandise.length > 0
            ? `<h3 class="text-2xl mb-6 border-b border-gray-300 pb-2 mt-8 text-green-900 font-serif">Purchase Merchandise</h3>` +
              merchandise
                .map(
                  (m) => `
                    <div class="merchandise-section mb-6 p-4 rounded-lg bg-white/50 border border-gray-200 hover:bg-white/80 transition-colors">
                        <h5 class="text-xl font-bold text-green-800 mb-2">${m.name} <span class="text-gray-600 text-base font-normal">(RM ${m.price.toFixed(2)})</span></h5>
                        <p class="mb-4 text-gray-600 text-sm">${m.description || ""}</p>
                        <div class="row g-4">
                            <div class="col-md-6">
                                <label for="quantity-merch-${m.id}" class="form-label text-gray-700 uppercase tracking-wider text-xs font-bold mb-2">Quantity</label>
                                <input type="number" id="quantity-merch-${m.id}" class="form-control bg-white border-gray-300 text-gray-900 merchandise-quantity" min="0" value="0" data-merchandise-id="${m.id}" max="${m.stock}">
                                <small class="text-gray-500 block mt-1">Stock: ${m.stock}</small>
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
                        <button type="submit" class="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300 mt-6 shadow-lg shadow-green-900/20 uppercase tracking-widest text-sm">Place Order</button>
                    </form>
                `;
        document
          .getElementById("order-form")
          .addEventListener("submit", handleOrderSubmit);
      }
    } else {
      orderFormContainer.innerHTML =
        '<div class="text-center p-8"><p class="text-gray-700 mb-4">Please log in to book tickets.</p><a href="/login" class="inline-block border border-green-700 text-green-700 px-6 py-2 rounded-full hover:bg-green-700 hover:text-white transition-colors no-underline">Log In</a></div>';
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
  const selectVal = document.getElementById("refund-reason-select").value;
  let reason = selectVal;

  // If "Other" is selected, use the text area value
  if (selectVal === "Other") {
    reason = document.getElementById("refund-reason").value;
  }

  if (!reason) {
    showAlert("Please provide a reason for the refund.", "warning");
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
