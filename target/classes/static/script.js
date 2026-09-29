// ============================================================
// WAGETRACK
// Daily Wage Worker Attendance & Payment Tracker
// ============================================================

const WORKER_API = "/api/workers";
const WORKSITE_API = "/api/worksites";
const ATTENDANCE_API = "/api/attendance";
const PAYMENT_API = "/api/payments";

let workers = [];
let worksites = [];
let attendanceRecords = [];
let paymentRecords = [];


// ============================================================
// START APPLICATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    setupNavigation();
    setupMenu();
    setupButtons();
    setupForms();
    setupModalClosing();
    setupSearch();
    setupAttendanceStatus();

    setCurrentDate();

    loadApplicationData();
});


// ============================================================
// LOAD ALL DATA
// ============================================================

async function loadApplicationData() {

    await loadWorkers();
    await loadWorksites();
    await loadAttendance();
    await loadPayments();

    updateDashboard();
}


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    document.querySelectorAll(".nav-item").forEach(item => {

        item.addEventListener("click", () => {

            const page = item.dataset.page;

            if (!page) return;

            showPage(page);
        });
    });


    document.querySelectorAll("[data-page]").forEach(button => {

        if (button.classList.contains("nav-item")) return;

        button.addEventListener("click", () => {

            const page = button.dataset.page;

            if (!page) return;

            showPage(page);
        });
    });
}


function showPage(pageName) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const page = document.getElementById(pageName);

    if (page) {
        page.classList.add("active");
    }


    document.querySelectorAll(".nav-item").forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === pageName
        );
    });


    const titles = {

        dashboard: [
            "Dashboard",
            "Workforce overview and daily operations"
        ],

        workers: [
            "Workers",
            "Manage registered daily wage workers"
        ],

        worksites: [
            "Worksites",
            "Manage your active work locations"
        ],

        attendance: [
            "Attendance",
            "Track daily worker attendance"
        ],

        payments: [
            "Payments",
            "Monitor worker payment records"
        ],

        reports: [
            "Reports",
            "Review workforce and payment information"
        ]
    };


    if (titles[pageName]) {

        document.getElementById("pageTitle").textContent =
            titles[pageName][0];

        document.getElementById("pageSubtitle").textContent =
            titles[pageName][1];
    }


    // Close mobile sidebar
    const sidebar = document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.remove("open");
    }
}


// ============================================================
// MENU
// ============================================================

function setupMenu() {

    const menuButton =
        document.getElementById("menuButton");

    const sidebar =
        document.getElementById("sidebar");

    if (!menuButton || !sidebar) return;

    menuButton.addEventListener("click", () => {

        sidebar.classList.toggle("open");

    });
}


// ============================================================
// BUTTONS
// ============================================================

function setupButtons() {

    // Add Worker
    const addWorkerBtn =
        document.getElementById("addWorkerBtn");

    const dashboardAddWorkerBtn =
        document.getElementById(
            "dashboardAddWorkerBtn"
        );

    if (addWorkerBtn) {
        addWorkerBtn.addEventListener(
            "click",
            openAddWorkerModal
        );
    }

    if (dashboardAddWorkerBtn) {
        dashboardAddWorkerBtn.addEventListener(
            "click",
            openAddWorkerModal
        );
    }


    // Add Worksite
    const addWorksiteBtn =
        document.getElementById("addWorksiteBtn");

    if (addWorksiteBtn) {
        addWorksiteBtn.addEventListener(
            "click",
            openAddWorksiteModal
        );
    }


    // Add Attendance
    const addAttendanceBtn =
        document.getElementById(
            "addAttendanceBtn"
        );

    if (addAttendanceBtn) {
        addAttendanceBtn.addEventListener(
            "click",
            openAttendanceModal
        );
    }


    // Dashboard quick actions
    document.querySelectorAll(".quick-action").forEach(button => {

        button.addEventListener("click", () => {

            const action = button.dataset.action;

            if (action === "worker") {
                openAddWorkerModal();
            }

            if (action === "worksite") {
                openAddWorksiteModal();
            }

            if (action === "attendance") {
                openAttendanceModal();
            }
        });
    });


    // Empty worksite button
    const emptyWorksiteBtn =
        document.getElementById(
            "emptyAddWorksiteBtn"
        );

    if (emptyWorksiteBtn) {

        emptyWorksiteBtn.addEventListener(
            "click",
            openAddWorksiteModal
        );
    }
}


// ============================================================
// WORKER
// ============================================================

async function loadWorkers() {

    try {

        const response =
            await fetch(WORKER_API);

        if (!response.ok) {
            throw new Error("Failed to load workers");
        }

        workers = await response.json();

        renderWorkers();
        updateWorkerDropdown();

    } catch (error) {

        console.error("Worker loading error:", error);

        workers = [];

        renderWorkers();
    }
}


function renderWorkers(searchText = "") {

    const container =
        document.getElementById("workerList");

    if (!container) return;


    const search =
        searchText.trim().toLowerCase();


    const filteredWorkers =
        workers.filter(worker => {

            return (
                worker.name
                    .toLowerCase()
                    .includes(search)
                ||
                worker.phone
                    .toLowerCase()
                    .includes(search)
            );

        });


    const count =
        document.getElementById("workerCount");

    if (count) {
        count.textContent =
            filteredWorkers.length;
    }


    if (filteredWorkers.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👷</div>
                <h3>No workers found</h3>
                <p>Add a worker to start managing your workforce.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        filteredWorkers.map(worker => {

            return `
                <div class="worker-card">

                    <div class="worker-card-top">

                        <div class="worker-avatar">
                            ${getInitials(worker.name)}
                        </div>

                        <div class="worker-info">

                            <h3>
                                ${escapeHTML(worker.name)}
                            </h3>

                            <p>
                                ${escapeHTML(worker.phone)}
                            </p>

                        </div>

                    </div>


                    <div class="worker-details">

                        <div class="detail-item">

                            <span>Daily Wage</span>

                            <strong>
                                ₹${formatMoney(worker.dailyWage)}
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>Worker ID</span>

                            <strong>
                                #${worker.id}
                            </strong>

                        </div>

                    </div>


                    <div class="worker-actions">

                        <button
                            type="button"
                            class="secondary-button"
                            data-edit-worker="${worker.id}">
                            Edit
                        </button>

                        <button
                            type="button"
                            class="danger-button"
                            data-delete-worker="${worker.id}">
                            Delete
                        </button>

                    </div>

                </div>
            `;

        }).join("");
}


// ============================================================
// WORKER MODAL
// ============================================================

function openAddWorkerModal() {

    const form =
        document.getElementById("workerForm");

    const modal =
        document.getElementById("workerModal");

    if (!form || !modal) return;


    form.reset();

    document.getElementById("workerId").value = "";

    document.getElementById(
        "workerModalTitle"
    ).textContent = "Add Worker";


    modal.classList.add("show");
}


function openEditWorkerModal(id) {

    const worker =
        workers.find(
            item => item.id === Number(id)
        );

    if (!worker) return;


    document.getElementById("workerId").value =
        worker.id;

    document.getElementById("workerName").value =
        worker.name;

    document.getElementById("workerPhone").value =
        worker.phone;

    document.getElementById("workerWage").value =
        worker.dailyWage;


    document.getElementById(
        "workerModalTitle"
    ).textContent = "Edit Worker";


    document.getElementById(
        "workerModal"
    ).classList.add("show");
}


aasync function saveWorker(event) {

    event.preventDefault();

    const id =
        document.getElementById("workerId").value;

    const name =
        document.getElementById("workerName").value.trim();

    const phone =
        document.getElementById("workerPhone").value.trim();

    const dailyWage =
        Number(
            document.getElementById("workerWage").value
        );


    // ========================================================
    // VALIDATE WORKER DETAILS
    // ========================================================

    if (!name || !phone || dailyWage <= 0) {

        showToast(
            "Invalid Details",
            "Please enter valid worker details.",
            "error"
        );

        return;
    }


    // ========================================================
    // PHONE NUMBER VALIDATION
    // Must contain exactly 10 digits
    // ========================================================

    if (!/^[0-9]{10}$/.test(phone)) {

        showToast(
            "Invalid Phone Number",
            "Enter valid phone number 10 digits.",
            "error"
        );

        return;
    }


    const data = {
        name: name,
        phone: phone,
        dailyWage: dailyWage
    };


    // ========================================================
    // SAVE WORKER
    // ========================================================

    try {

        let response;


        if (id) {

            response =
                await fetch(
                    `${WORKER_API}/${id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    }
                );

        } else {

            response =
                await fetch(
                    WORKER_API,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    }
                );
        }


        // ====================================================
        // SERVER ERROR
        // ====================================================

        if (!response.ok) {

            let errorMessage =
                "Unable to save worker.";

            try {

                const errorData =
                    await response.json();

                if (errorData.message) {
                    errorMessage =
                        errorData.message;
                }

                if (errorData.errors) {

                    const firstError =
                        Object.values(
                            errorData.errors
                        )[0];

                    if (firstError) {
                        errorMessage =
                            firstError;
                    }
                }

            } catch (error) {

                console.error(
                    "Error reading server response:",
                    error
                );
            }

            throw new Error(errorMessage);
        }


        // ====================================================
        // SUCCESS
        // ====================================================

        closeWorkerModal();

        await loadWorkers();

        updateDashboard();


        showToast(
            id
                ? "Worker Updated"
                : "Worker Added",

            id
                ? "Worker details updated successfully."
                : "Worker added successfully.",

            "success"
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Save Failed",
            error.message ||
            "Unable to save worker.",
            "error"
        );
    }
}
async function deleteWorker(id) {

    const worker =
        workers.find(
            item => item.id === Number(id)
        );

    if (!worker) return;


    if (
        !confirm(
            `Are you sure you want to delete ${worker.name}?`
        )
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                `${WORKER_API}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {
            throw new Error("Delete failed");
        }


        await loadWorkers();

        updateDashboard();


        showToast(
            "Worker Deleted",
            "Worker removed successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Delete Failed",
            "Unable to delete worker.",
            "error"
        );
    }
}


// ============================================================
// WORKSITES
// ============================================================

async function loadWorksites() {

    try {

        const response =
            await fetch(WORKSITE_API);

        if (!response.ok) {
            throw new Error("Failed to load worksites");
        }

        worksites =
            await response.json();

        renderWorksites();
        updateWorksiteDropdown();

    } catch (error) {

        console.error(
            "Worksite loading error:",
            error
        );

        worksites = [];

        renderWorksites();
    }
}


function renderWorksites() {

    const container =
        document.getElementById(
            "worksiteList"
        );

    if (!container) return;


    if (worksites.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🏗️</div>
                <h3>No worksites yet</h3>
                <p>Add your first worksite to begin tracking attendance.</p>

                <button
                    type="button"
                    id="emptyAddWorksiteBtn"
                    class="primary-button">
                    + Add Worksite
                </button>
            </div>
        `;


        const button =
            document.getElementById(
                "emptyAddWorksiteBtn"
            );

        if (button) {
            button.addEventListener(
                "click",
                openAddWorksiteModal
            );
        }

        return;
    }


    container.innerHTML =
        worksites.map(worksite => {

            return `
                <div class="worksite-card">

                    <div class="worksite-icon">
                        ⌂
                    </div>

                    <div class="worksite-info">

                        <h3>
                            ${escapeHTML(worksite.name)}
                        </h3>

                        <p>
                            📍
                            ${escapeHTML(worksite.location)}
                        </p>

                        <span>
                            Worksite #${worksite.id}
                        </span>

                    </div>


                    <div class="worksite-actions">

                        <button
                            type="button"
                            class="secondary-button"
                            data-edit-worksite="${worksite.id}">
                            Edit
                        </button>

                        <button
                            type="button"
                            class="danger-button"
                            data-delete-worksite="${worksite.id}">
                            Delete
                        </button>

                    </div>

                </div>
            `;

        }).join("");
}


// ============================================================
// WORKSITE MODAL
// ============================================================

function openAddWorksiteModal() {

    const form =
        document.getElementById(
            "worksiteForm"
        );

    const modal =
        document.getElementById(
            "worksiteModal"
        );

    if (!form || !modal) return;


    form.reset();

    document.getElementById(
        "worksiteId"
    ).value = "";


    document.getElementById(
        "worksiteModalTitle"
    ).textContent = "Add Worksite";


    modal.classList.add("show");
}


function openEditWorksiteModal(id) {

    const worksite =
        worksites.find(
            item => item.id === Number(id)
        );

    if (!worksite) return;


    document.getElementById(
        "worksiteId"
    ).value = worksite.id;


    document.getElementById(
        "worksiteName"
    ).value = worksite.name;


    document.getElementById(
        "worksiteLocation"
    ).value = worksite.location;


    document.getElementById(
        "worksiteModalTitle"
    ).textContent = "Edit Worksite";


    document.getElementById(
        "worksiteModal"
    ).classList.add("show");
}


async function saveWorksite(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "worksiteId"
        ).value;


    const name =
        document.getElementById(
            "worksiteName"
        ).value.trim();


    const location =
        document.getElementById(
            "worksiteLocation"
        ).value.trim();


    if (!name || !location) {

        showToast(
            "Invalid Details",
            "Please enter worksite name and location.",
            "error"
        );

        return;
    }


    const data = {
        name: name,
        location: location
    };


    try {

        let response;


        if (id) {

            response =
                await fetch(
                    `${WORKSITE_API}/${id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body:
                            JSON.stringify(data)
                    }
                );

        } else {

            response =
                await fetch(
                    WORKSITE_API,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body:
                            JSON.stringify(data)
                    }
                );
        }


        if (!response.ok) {
            throw new Error(
                "Worksite save failed"
            );
        }


        closeWorksiteModal();

        await loadWorksites();

        updateDashboard();


        showToast(
            id
                ? "Worksite Updated"
                : "Worksite Added",

            id
                ? "Worksite updated successfully."
                : "Worksite added successfully.",

            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Save Failed",
            "Unable to save worksite.",
            "error"
        );
    }
}


async function deleteWorksite(id) {

    const worksite =
        worksites.find(
            item => item.id === Number(id)
        );

    if (!worksite) return;


    if (
        !confirm(
            `Are you sure you want to delete ${worksite.name}?`
        )
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                `${WORKSITE_API}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {
            throw new Error(
                "Worksite delete failed"
            );
        }


        await loadWorksites();

        updateDashboard();


        showToast(
            "Worksite Deleted",
            "Worksite removed successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Delete Failed",
            "Unable to delete worksite.",
            "error"
        );
    }
}


// ============================================================
// ATTENDANCE
// ============================================================

async function loadAttendance() {

    try {

        const response =
            await fetch(
                ATTENDANCE_API
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load attendance"
            );
        }

        attendanceRecords =
            await response.json();

        renderAttendance();

    } catch (error) {

        console.error(
            "Attendance loading error:",
            error
        );

        attendanceRecords = [];

        renderAttendance();
    }
}


function renderAttendance() {

    const tbody =
        document.getElementById(
            "attendanceTableBody"
        );

    if (!tbody) return;


    if (attendanceRecords.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <h3>No attendance records</h3>
                        <p>Mark attendance to see records here.</p>
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        attendanceRecords.map(record => {

            const workerName =
                record.worker?.name || "Unknown";

            const worksiteName =
                record.worksite?.name || "Unknown";

            const status =
                record.status || "";


            let statusClass =
                status.toLowerCase();


            if (status === "HALF_DAY") {
                statusClass = "half-day";
            }


            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(workerName)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(worksiteName)}
                    </td>

                    <td>
                        ${formatDate(
                record.attendanceDate
            )}
                    </td>

                    <td>
                        <span class="status-badge ${statusClass}">
                            ${formatStatus(status)}
                        </span>
                    </td>

                    <td>
                        ${Number(
                record.overtimeHours || 0
            )} hrs
                    </td>

                    <td>

                        <button
                            type="button"
                            class="danger-button"
                            data-delete-attendance="${record.id}">
                            Delete
                        </button>

                    </td>

                </tr>
            `;

        }).join("");
}


// ============================================================
// ATTENDANCE MODAL
// ============================================================

function openAttendanceModal() {

    const modal =
        document.getElementById(
            "attendanceModal"
        );

    const form =
        document.getElementById(
            "attendanceForm"
        );

    if (!modal || !form) return;


    form.reset();


    updateWorkerDropdown();
    updateWorksiteDropdown();


    document.getElementById(
        "attendanceDate"
    ).value =
        new Date()
            .toISOString()
            .split("T")[0];


    document.getElementById(
        "overtimeHours"
    ).value = "0";


    modal.classList.add("show");
}


function setupAttendanceStatus() {

    const status =
        document.getElementById(
            "attendanceStatus"
        );

    const overtime =
        document.getElementById(
            "overtimeHours"
        );

    if (!status || !overtime) return;


    status.addEventListener(
        "change",
        () => {

            if (status.value === "ABSENT") {

                overtime.value = "0";
                overtime.disabled = true;

            } else {

                overtime.disabled = false;
            }
        }
    );
}


async function saveAttendance(event) {

    event.preventDefault();


    const workerId =
        Number(
            document.getElementById(
                "attendanceWorker"
            ).value
        );


    const worksiteId =
        Number(
            document.getElementById(
                "attendanceWorksite"
            ).value
        );


    const attendanceDate =
        document.getElementById(
            "attendanceDate"
        ).value;


    const status =
        document.getElementById(
            "attendanceStatus"
        ).value;


    const overtimeHours =
        Number(
            document.getElementById(
                "overtimeHours"
            ).value || 0
        );


    if (
        !workerId ||
        !worksiteId ||
        !attendanceDate ||
        !status
    ) {

        showToast(
            "Incomplete Details",
            "Please fill all attendance fields.",
            "error"
        );

        return;
    }


    const worker =
        workers.find(
            item => item.id === workerId
        );


    const worksite =
        worksites.find(
            item => item.id === worksiteId
        );


    if (!worker || !worksite) {

        showToast(
            "Invalid Selection",
            "Worker or worksite not found.",
            "error"
        );

        return;
    }


    const data = {

        worker: {
            id: workerId
        },

        worksite: {
            id: worksiteId
        },

        attendanceDate: attendanceDate,

        status: status,

        overtimeHours:
            status === "ABSENT"
                ? 0
                : overtimeHours
    };


    try {

        const response =
            await fetch(
                ATTENDANCE_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(data)
                }
            );


        if (!response.ok) {
            throw new Error(
                "Attendance save failed"
            );
        }


        const saved =
            await response.json();


        // Automatically create payment record
        try {

            await fetch(
                `${PAYMENT_API}/calculate?workerId=${workerId}&attendanceId=${saved.id}`,
                {
                    method: "POST"
                }
            );

        } catch (paymentError) {

            console.error(
                "Payment calculation failed:",
                paymentError
            );
        }


        closeAttendanceModal();

        await loadAttendance();
        await loadPayments();

        updateDashboard();


        showToast(
            "Attendance Saved",
            "Attendance marked successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Save Failed",
            "Unable to save attendance.",
            "error"
        );
    }
}


// ============================================================
// DELETE ATTENDANCE
// ============================================================

async function deleteAttendance(id) {

    if (
        !confirm(
            "Are you sure you want to delete this attendance record?"
        )
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                `${ATTENDANCE_API}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {
            throw new Error(
                "Attendance delete failed"
            );
        }


        await loadAttendance();

        updateDashboard();


        showToast(
            "Attendance Deleted",
            "Attendance record deleted successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Delete Failed",
            "Unable to delete attendance.",
            "error"
        );
    }
}


// ============================================================
// PAYMENTS
// ============================================================

async function loadPayments() {

    try {

        const response =
            await fetch(
                PAYMENT_API
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load payments"
            );
        }

        paymentRecords =
            await response.json();

        renderPayments();
        updatePaymentSummary();

    } catch (error) {

        console.error(
            "Payment loading error:",
            error
        );

        paymentRecords = [];

        renderPayments();
        updatePaymentSummary();
    }
}


function renderPayments() {

    const tbody =
        document.getElementById(
            "paymentTableBody"
        );

    if (!tbody) return;


    if (paymentRecords.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div class="empty-icon">₹</div>
                        <h3>No payment records</h3>
                        <p>Payment records will appear here.</p>
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        paymentRecords.map(payment => {

            const workerName =
                payment.worker?.name || "Unknown";


            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(workerName)}
                        </strong>
                    </td>

                    <td>
                        ${formatDate(
                payment.attendance?.attendanceDate
            )}
                    </td>

                    <td>
                        ₹${formatMoney(
                payment.basePay
            )}
                    </td>

                    <td>
                        ${payment.overtimeHours} hrs
                    </td>

                    <td>
                        ₹${formatMoney(
                payment.overtimePay
            )}
                    </td>

                    <td>
                        <strong>
                            ₹${formatMoney(
                payment.totalPay
            )}
                        </strong>
                    </td>

                    <td>
                        ${formatDate(
                payment.paymentDate
            )}
                    </td>

                </tr>
            `;

        }).join("");
}


function updatePaymentSummary() {

    const total =
        paymentRecords.reduce(
            (sum, payment) =>
                sum +
                Number(payment.totalPay || 0),
            0
        );


    const overtime =
        paymentRecords.reduce(
            (sum, payment) =>
                sum +
                Number(payment.overtimePay || 0),
            0
        );


    const totalElement =
        document.getElementById(
            "paymentTotalAmount"
        );

    const countElement =
        document.getElementById(
            "paymentRecordCount"
        );

    const overtimeElement =
        document.getElementById(
            "overtimePaymentAmount"
        );


    if (totalElement) {
        totalElement.textContent =
            `₹${formatMoney(total)}`;
    }


    if (countElement) {
        countElement.textContent =
            paymentRecords.length;
    }


    if (overtimeElement) {
        overtimeElement.textContent =
            `₹${formatMoney(overtime)}`;
    }
}


// ============================================================
// DROPDOWNS
// ============================================================

function updateWorkerDropdown() {

    const select =
        document.getElementById(
            "attendanceWorker"
        );

    if (!select) return;


    select.innerHTML = `
        <option value="">
            Select worker
        </option>
    `;


    workers.forEach(worker => {

        const option =
            document.createElement("option");

        option.value =
            worker.id;

        option.textContent =
            `${worker.name} — ₹${formatMoney(
                worker.dailyWage
            )}/day`;

        select.appendChild(option);
    });
}


function updateWorksiteDropdown() {

    const select =
        document.getElementById(
            "attendanceWorksite"
        );

    if (!select) return;


    select.innerHTML = `
        <option value="">
            Select worksite
        </option>
    `;


    worksites.forEach(worksite => {

        const option =
            document.createElement("option");

        option.value =
            worksite.id;

        option.textContent =
            `${worksite.name} — ${worksite.location}`;

        select.appendChild(option);
    });
}


// ============================================================
// FORMS
// ============================================================

function setupForms() {

    const workerForm =
        document.getElementById(
            "workerForm"
        );

    const worksiteForm =
        document.getElementById(
            "worksiteForm"
        );

    const attendanceForm =
        document.getElementById(
            "attendanceForm"
        );


    if (workerForm) {

        workerForm.addEventListener(
            "submit",
            saveWorker
        );
    }


    if (worksiteForm) {

        worksiteForm.addEventListener(
            "submit",
            saveWorksite
        );
    }


    if (attendanceForm) {

        attendanceForm.addEventListener(
            "submit",
            saveAttendance
        );
    }
}


// ============================================================
// SEARCH
// ============================================================

function setupSearch() {

    const input =
        document.getElementById(
            "workerSearch"
        );

    if (!input) return;


    input.addEventListener(
        "input",
        () => {

            renderWorkers(
                input.value
            );

        }
    );
}


// ============================================================
// MODALS
// ============================================================

function setupModalClosing() {

    document.getElementById(
        "closeWorkerModal"
    )?.addEventListener(
        "click",
        closeWorkerModal
    );


    document.getElementById(
        "cancelWorkerModal"
    )?.addEventListener(
        "click",
        closeWorkerModal
    );


    document.getElementById(
        "closeWorksiteModal"
    )?.addEventListener(
        "click",
        closeWorksiteModal
    );


    document.getElementById(
        "cancelWorksiteModal"
    )?.addEventListener(
        "click",
        closeWorksiteModal
    );


    document.getElementById(
        "closeAttendanceModal"
    )?.addEventListener(
        "click",
        closeAttendanceModal
    );


    document.getElementById(
        "cancelAttendanceModal"
    )?.addEventListener(
        "click",
        closeAttendanceModal
    );


    document.querySelectorAll(".modal").forEach(modal => {

        modal.addEventListener(
            "click",
            event => {

                if (event.target === modal) {

                    modal.classList.remove(
                        "show"
                    );
                }
            }
        );
    });
}


function closeWorkerModal() {

    document.getElementById(
        "workerModal"
    )?.classList.remove("show");
}


function closeWorksiteModal() {

    document.getElementById(
        "worksiteModal"
    )?.classList.remove("show");
}


function closeAttendanceModal() {

    document.getElementById(
        "attendanceModal"
    )?.classList.remove("show");
}


// ============================================================
// CARD / TABLE ACTIONS
// ============================================================

document.addEventListener(
    "click",
    event => {

        const editWorker =
            event.target.closest(
                "[data-edit-worker]"
            );

        if (editWorker) {

            openEditWorkerModal(
                editWorker.dataset.editWorker
            );

            return;
        }


        const deleteWorkerButton =
            event.target.closest(
                "[data-delete-worker]"
            );

        if (deleteWorkerButton) {

            deleteWorker(
                deleteWorkerButton.dataset.deleteWorker
            );

            return;
        }


        const editWorksite =
            event.target.closest(
                "[data-edit-worksite]"
            );

        if (editWorksite) {

            openEditWorksiteModal(
                editWorksite.dataset.editWorksite
            );

            return;
        }


        const deleteWorksiteButton =
            event.target.closest(
                "[data-delete-worksite]"
            );

        if (deleteWorksiteButton) {

            deleteWorksite(
                deleteWorksiteButton.dataset.deleteWorksite
            );

            return;
        }


        const deleteAttendanceButton =
            event.target.closest(
                "[data-delete-attendance]"
            );

        if (deleteAttendanceButton) {

            deleteAttendance(
                deleteAttendanceButton.dataset.deleteAttendance
            );
        }
    }
);


// ============================================================
// DASHBOARD
// ============================================================

function updateDashboard() {

    setText(
        "totalWorkers",
        workers.length
    );


    setText(
        "totalWorksites",
        worksites.length
    );


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const present =
        attendanceRecords.filter(
            record =>
                record.attendanceDate === today &&
                (
                    record.status === "PRESENT" ||
                    record.status === "HALF_DAY"
                )
        ).length;


    setText(
        "presentToday",
        present
    );


    const totalPayments =
        paymentRecords.reduce(
            (sum, payment) =>
                sum +
                Number(payment.totalPay || 0),
            0
        );


    const paymentElement =
        document.getElementById(
            "totalPayments"
        );


    if (paymentElement) {

        paymentElement.textContent =
            `₹${formatMoney(totalPayments)}`;
    }


    renderDashboardWorkers();
}


function renderDashboardWorkers() {

    const container =
        document.getElementById(
            "dashboardWorkerList"
        );

    if (!container) return;


    const latest =
        [...workers]
            .reverse()
            .slice(0, 5);


    if (latest.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <p>No workers registered yet.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        latest.map(worker => {

            return `
                <div class="dashboard-worker">

                    <div class="worker-avatar">
                        ${getInitials(worker.name)}
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(worker.name)}
                        </strong>

                        <span>
                            ₹${formatMoney(
                worker.dailyWage
            )}/day
                        </span>

                    </div>

                </div>
            `;

        }).join("");
}


// ============================================================
// DATE
// ============================================================

function setCurrentDate() {

    const element =
        document.getElementById(
            "currentDate"
        );

    if (!element) return;


    element.textContent =
        new Date().toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
}


// ============================================================
// TOAST
// ============================================================

function showToast(
    title,
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "toast"
        );

    const titleElement =
        document.getElementById(
            "toastTitle"
        );

    const messageElement =
        document.getElementById(
            "toastMessage"
        );


    if (!toast) return;


    if (titleElement) {
        titleElement.textContent =
            title;
    }


    if (messageElement) {
        messageElement.textContent =
            message;
    }


    toast.classList.remove(
        "success",
        "error",
        "show"
    );


    toast.classList.add(type);
    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 3500);
}


document.getElementById(
    "closeToast"
)?.addEventListener(
    "click",
    () => {

        document.getElementById(
            "toast"
        )?.classList.remove("show");

    }
);


// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function formatMoney(value) {

    return Number(value || 0)
        .toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
}


function formatDate(value) {

    if (!value) return "-";


    const date =
        new Date(value);


    if (isNaN(date.getTime())) {
        return value;
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


function formatStatus(status) {

    if (!status) return "-";


    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );
}


function getInitials(name) {

    if (!name) return "?";


    const words =
        name.trim().split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();
    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}


function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

