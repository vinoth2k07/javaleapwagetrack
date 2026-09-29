// ============================================================
// WageTrack - Frontend JavaScript
// ============================================================

// =========================
// API URLs
// =========================

const WORKER_API = "/api/workers";
const WORKSITE_API = "/api/worksites";
const ATTENDANCE_API = "/api/attendance";
const PAYMENT_API = "/api/payments";


// =========================
// Global Data
// =========================

let workers = [];
let worksites = [];
let attendanceRecords = [];
let payments = [];

const OT_RATE = 100;


// ============================================================
// PAGE NAVIGATION
// ============================================================

const pageTitles = {
    dashboard: {
        title: "Dashboard",
        subtitle: "Workforce overview and daily operations"
    },

    workers: {
        title: "Workers",
        subtitle: "Register and manage daily wage workers"
    },

    worksites: {
        title: "Worksites",
        subtitle: "Manage construction and work locations"
    },

    attendance: {
        title: "Attendance",
        subtitle: "Track daily worker attendance and overtime"
    },

    payments: {
        title: "Payments",
        subtitle: "Monitor daily wage and overtime payments"
    },

    reports: {
        title: "Reports",
        subtitle: "Review workforce attendance and payment information"
    }
};


function showPage(pageName) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const selectedPage =
        document.getElementById(pageName);

    if (selectedPage) {
        selectedPage.classList.add("active");
    }

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");

        if (item.dataset.page === pageName) {
            item.classList.add("active");
        }
    });

    if (pageTitles[pageName]) {

        document.getElementById("pageTitle").textContent =
            pageTitles[pageName].title;

        document.getElementById("pageSubtitle").textContent =
            pageTitles[pageName].subtitle;
    }

    // Close sidebar on mobile
    document
        .getElementById("sidebar")
        ?.classList.remove("mobile-open");
}


// ============================================================
// LOAD ALL DATA
// ============================================================

async function loadAllData() {

    try {

        await Promise.all([
            loadWorkers(),
            loadWorksites(),
            loadAttendance(),
            loadPayments()
        ]);

        updateDashboard();

    } catch (error) {

        console.error("Error loading application data:", error);

        showToast(
            "Connection Error",
            "Unable to load data from the server.",
            "error"
        );
    }
}


// ============================================================
// WORKERS
// ============================================================

async function loadWorkers() {

    try {

        const response =
            await fetch(WORKER_API);

        if (!response.ok) {
            throw new Error("Unable to load workers.");
        }

        workers = await response.json();

        renderWorkers();
        populateAttendanceWorkers();
        updateDashboard();

    } catch (error) {

        console.error(error);

        workers = [];

        renderWorkers();
    }
}


// ------------------------------------------------------------
// Render Workers
// ------------------------------------------------------------

function renderWorkers() {

    const container =
        document.getElementById("workerList");

    const searchInput =
        document.getElementById("workerSearch");

    if (!container) return;

    const searchText =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

    const filteredWorkers =
        workers.filter(worker => {

            const name =
                worker.name?.toLowerCase() || "";

            const phone =
                worker.phone?.toLowerCase() || "";

            return (
                name.includes(searchText) ||
                phone.includes(searchText)
            );
        });

    document.getElementById("workerCount").textContent =
        filteredWorkers.length;


    if (filteredWorkers.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No workers found</h3>
                <p>Add a worker to get started.</p>
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

                        <div class="worker-card-info">

                            <h3>
                                ${escapeHtml(worker.name)}
                            </h3>

                            <span>
                                Worker ID: #${worker.id}
                            </span>

                        </div>

                    </div>


                    <div class="worker-details">

                        <div>
                            <span>PHONE</span>
                            <strong>
                                ${escapeHtml(worker.phone)}
                            </strong>
                        </div>

                        <div>
                            <span>DAILY WAGE</span>
                            <strong>
                                ${formatCurrency(worker.dailyWage)}
                            </strong>
                        </div>

                    </div>


                    <div class="worker-card-actions">

                        <button
                            class="secondary-button"
                            type="button"
                            onclick="editWorker(${worker.id})"
                        >
                            Edit
                        </button>

                        <button
                            class="danger-button"
                            type="button"
                            onclick="deleteWorker(${worker.id})"
                        >
                            Delete
                        </button>

                    </div>

                </div>
            `;

        }).join("");
}


// ------------------------------------------------------------
// Open Add Worker Modal
// ------------------------------------------------------------

function openWorkerModal() {

    document.getElementById("workerModal").classList.add("show");

    document.getElementById("workerModalTitle").textContent =
        "Add Worker";

    document.getElementById("workerForm").reset();

    document.getElementById("workerId").value = "";

    document.getElementById("workerPhone").value = "";

    document.getElementById("workerWage").value = "";
}


// ------------------------------------------------------------
// Close Worker Modal
// ------------------------------------------------------------

function closeWorkerModal() {

    document
        .getElementById("workerModal")
        .classList.remove("show");
}


// ------------------------------------------------------------
// Edit Worker
// ------------------------------------------------------------

function editWorker(id) {

    const worker =
        workers.find(item => item.id === id);

    if (!worker) return;

    document.getElementById("workerModal").classList.add("show");

    document.getElementById("workerModalTitle").textContent =
        "Edit Worker";

    document.getElementById("workerId").value =
        worker.id;

    document.getElementById("workerName").value =
        worker.name;

    document.getElementById("workerPhone").value =
        worker.phone;

    document.getElementById("workerWage").value =
        worker.dailyWage;
}


// ------------------------------------------------------------
// Save Worker
// ------------------------------------------------------------

async function saveWorker(event) {

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


    if (!name || !phone || dailyWage <= 0) {

        showToast(
            "Invalid Details",
            "Please enter valid worker details.",
            "error"
        );

        return;
    }


    // Phone validation
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


    try {

        let response;


        // UPDATE
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

        }

        // CREATE
        else {

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


// ------------------------------------------------------------
// Delete Worker
// ------------------------------------------------------------

async function deleteWorker(id) {

    const worker =
        workers.find(item => item.id === id);

    if (!worker) return;


    const confirmed =
        confirm(
            `Are you sure you want to delete ${worker.name}?`
        );

    if (!confirmed) return;


    try {

        const response =
            await fetch(
                `${WORKER_API}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to delete worker."
            );
        }


        await loadWorkers();

        await loadAttendance();

        await loadPayments();

        updateDashboard();


        showToast(
            "Worker Deleted",
            "Worker deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Delete Failed",
            error.message,
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
            throw new Error("Unable to load worksites.");
        }

        worksites =
            await response.json();

        renderWorksites();

        populateAttendanceWorksites();

        updateDashboard();

    } catch (error) {

        console.error(error);

        worksites = [];

        renderWorksites();
    }
}


// ------------------------------------------------------------
// Render Worksites
// ------------------------------------------------------------

function renderWorksites() {

    const container =
        document.getElementById("worksiteList");

    if (!container) return;


    if (worksites.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No worksites found</h3>
                <p>Add a worksite to get started.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        worksites.map(worksite => {

            return `
                <div class="worksite-card">

                    <div class="worksite-icon">
                        ⌂
                    </div>

                    <div class="worksite-content">

                        <span class="panel-kicker">
                            WORKSITE #${worksite.id}
                        </span>

                        <h2>
                            ${escapeHtml(worksite.name)}
                        </h2>

                        <p>
                            ${escapeHtml(worksite.location)}
                        </p>

                    </div>


                    <div class="worksite-actions">

                        <button
                            class="secondary-button"
                            type="button"
                            onclick="editWorksite(${worksite.id})"
                        >
                            Edit
                        </button>

                        <button
                            class="danger-button"
                            type="button"
                            onclick="deleteWorksite(${worksite.id})"
                        >
                            Delete
                        </button>

                    </div>

                </div>
            `;

        }).join("");
}


// ------------------------------------------------------------
// Open Worksite Modal
// ------------------------------------------------------------

function openWorksiteModal() {

    document
        .getElementById("worksiteModal")
        .classList.add("show");

    document.getElementById("worksiteForm").reset();

    document.getElementById("worksiteId").value = "";

    document.getElementById("worksiteModalTitle").textContent =
        "Add Worksite";
}


// ------------------------------------------------------------
// Close Worksite Modal
// ------------------------------------------------------------

function closeWorksiteModal() {

    document
        .getElementById("worksiteModal")
        .classList.remove("show");
}


// ------------------------------------------------------------
// Edit Worksite
// ------------------------------------------------------------

function editWorksite(id) {

    const worksite =
        worksites.find(item => item.id === id);

    if (!worksite) return;


    document
        .getElementById("worksiteModal")
        .classList.add("show");


    document.getElementById("worksiteModalTitle").textContent =
        "Edit Worksite";


    document.getElementById("worksiteId").value =
        worksite.id;

    document.getElementById("worksiteName").value =
        worksite.name;

    document.getElementById("worksiteLocation").value =
        worksite.location;
}


// ------------------------------------------------------------
// Save Worksite
// ------------------------------------------------------------

async function saveWorksite(event) {

    event.preventDefault();


    const id =
        document.getElementById("worksiteId").value;

    const name =
        document.getElementById("worksiteName").value.trim();

    const location =
        document.getElementById("worksiteLocation").value.trim();


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
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(data)
                    }
                );

        } else {

            response =
                await fetch(
                    WORKSITE_API,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(data)
                    }
                );
        }


        if (!response.ok) {

            throw new Error(
                "Unable to save worksite."
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
            error.message,
            "error"
        );
    }
}


// ------------------------------------------------------------
// Delete Worksite
// ------------------------------------------------------------

async function deleteWorksite(id) {

    const worksite =
        worksites.find(item => item.id === id);

    if (!worksite) return;


    const confirmed =
        confirm(
            `Are you sure you want to delete ${worksite.name}?`
        );

    if (!confirmed) return;


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
                "Unable to delete worksite."
            );
        }


        await loadWorksites();

        await loadAttendance();

        updateDashboard();


        showToast(
            "Worksite Deleted",
            "Worksite deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Delete Failed",
            error.message,
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
            await fetch(ATTENDANCE_API);

        if (!response.ok) {
            throw new Error(
                "Unable to load attendance."
            );
        }

        attendanceRecords =
            await response.json();

        renderAttendance();

        updateDashboard();

    } catch (error) {

        console.error(error);

        attendanceRecords = [];

        renderAttendance();
    }
}


// ------------------------------------------------------------
// Populate Worker Dropdown
// ------------------------------------------------------------

function populateAttendanceWorkers() {

    const select =
        document.getElementById("attendanceWorker");

    if (!select) return;


    select.innerHTML = `
        <option value="">
            Select worker
        </option>
    `;


    workers.forEach(worker => {

        const option =
            document.createElement("option");

        option.value = worker.id;

        option.textContent =
            `${worker.name} - ₹${worker.dailyWage}/day`;

        select.appendChild(option);
    });
}


// ------------------------------------------------------------
// Populate Worksite Dropdown
// ------------------------------------------------------------

function populateAttendanceWorksites() {

    const select =
        document.getElementById("attendanceWorksite");

    if (!select) return;


    select.innerHTML = `
        <option value="">
            Select worksite
        </option>
    `;


    worksites.forEach(worksite => {

        const option =
            document.createElement("option");

        option.value = worksite.id;

        option.textContent =
            `${worksite.name} - ${worksite.location}`;

        select.appendChild(option);
    });
}


// ------------------------------------------------------------
// Render Attendance
// ------------------------------------------------------------

function renderAttendance() {

    const tbody =
        document.getElementById(
            "attendanceTableBody"
        );

    if (!tbody) return;


    if (attendanceRecords.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    No attendance records found.
                </td>
            </tr>
        `;

        return;
    }


    const sorted =
        [...attendanceRecords].sort(
            (a, b) =>
                new Date(b.attendanceDate) -
                new Date(a.attendanceDate)
        );


    tbody.innerHTML =
        sorted.map(record => {

            const workerName =
                record.worker?.name ||
                getWorkerName(record.worker?.id);


            const worksiteName =
                record.worksite?.name ||
                getWorksiteName(record.worksite?.id);


            const statusClass =
                record.status
                    ?.toLowerCase()
                    .replace("_", "-");


            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHtml(workerName)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(worksiteName)}
                    </td>

                    <td>
                        ${formatDate(record.attendanceDate)}
                    </td>

                    <td>
                        <span class="status-badge ${statusClass}">
                            ${formatStatus(record.status)}
                        </span>
                    </td>

                    <td>
                        ${record.overtimeHours || 0} hrs
                    </td>

                    <td>

                        <button
                            class="danger-button small"
                            type="button"
                            onclick="deleteAttendance(${record.id})"
                        >
                            Delete
                        </button>

                    </td>

                </tr>
            `;

        }).join("");
}


// ------------------------------------------------------------
// Open Attendance Modal
// ------------------------------------------------------------

function openAttendanceModal() {

    document
        .getElementById("attendanceModal")
        .classList.add("show");


    document
        .getElementById("attendanceForm")
        .reset();


    document.getElementById("attendanceDate").value =
        getTodayDate();


    document.getElementById("attendanceStatus").value =
        "PRESENT";


    document.getElementById("overtimeHours").value =
        "0";


    populateAttendanceWorkers();

    populateAttendanceWorksites();
}


// ------------------------------------------------------------
// Close Attendance Modal
// ------------------------------------------------------------

function closeAttendanceModal() {

    document
        .getElementById("attendanceModal")
        .classList.remove("show");
}


// ------------------------------------------------------------
// Save Attendance
// ------------------------------------------------------------

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


    let overtimeHours =
        Number(
            document.getElementById(
                "overtimeHours"
            ).value
        );


    if (!workerId || !worksiteId || !attendanceDate) {

        showToast(
            "Invalid Details",
            "Please fill all attendance fields.",
            "error"
        );

        return;
    }


    if (overtimeHours < 0) {

        showToast(
            "Invalid Overtime",
            "Overtime hours cannot be negative.",
            "error"
        );

        return;
    }


    // Absent workers cannot have overtime
    if (status === "ABSENT") {
        overtimeHours = 0;
    }


    const data = {

        worker: {
            id: workerId
        },

        worksite: {
            id: worksiteId
        },

        attendanceDate:
        attendanceDate,

        status:
        status,

        overtimeHours:
        overtimeHours
    };


    try {

        const response =
            await fetch(
                ATTENDANCE_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body:
                        JSON.stringify(data)
                }
            );


        if (!response.ok) {

            let message =
                "Unable to save attendance.";

            try {

                const errorData =
                    await response.json();

                if (errorData.message) {
                    message =
                        errorData.message;
                }

            } catch (error) {
                console.error(error);
            }

            throw new Error(message);
        }


        const saved =
            await response.json();


        // Automatically calculate payment
        try {

            const paymentResponse =
                await fetch(
                    `${PAYMENT_API}/calculate?workerId=${workerId}&attendanceId=${saved.id}`,
                    {
                        method: "POST"
                    }
                );


            if (!paymentResponse.ok) {

                console.warn(
                    "Attendance saved, but payment calculation failed."
                );
            }

        } catch (paymentError) {

            console.error(
                "Payment calculation error:",
                paymentError
            );
        }


        closeAttendanceModal();


        await loadAttendance();

        await loadPayments();

        updateDashboard();


        showToast(
            "Attendance Saved",
            "Attendance and payment recorded successfully.",
            "success"
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Save Failed",
            error.message,
            "error"
        );
    }
}


// ------------------------------------------------------------
// Delete Attendance
// ------------------------------------------------------------

async function deleteAttendance(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this attendance record?"
        );

    if (!confirmed) return;


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
                "Unable to delete attendance."
            );
        }


        await loadAttendance();

        await loadPayments();

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
            error.message,
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
            await fetch(PAYMENT_API);

        if (!response.ok) {

            throw new Error(
                "Unable to load payments."
            );
        }


        payments =
            await response.json();


        renderPayments();

        updatePaymentSummary();

        updateDashboard();


    } catch (error) {

        console.error(error);

        payments = [];

        renderPayments();

        updatePaymentSummary();
    }
}


// ------------------------------------------------------------
// Render Payments
// ------------------------------------------------------------

function renderPayments() {

    const tbody =
        document.getElementById(
            "paymentTableBody"
        );

    if (!tbody) return;


    if (payments.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">
                    No payment records found.
                </td>
            </tr>
        `;

        return;
    }


    const sorted =
        [...payments].sort(
            (a, b) =>
                new Date(b.paymentDate) -
                new Date(a.paymentDate)
        );


    tbody.innerHTML =
        sorted.map(payment => {

            const workerName =
                payment.worker?.name ||
                getWorkerName(payment.worker?.id);


            const attendanceDate =
                payment.attendance?.attendanceDate ||
                "";


            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHtml(workerName)}
                        </strong>
                    </td>

                    <td>
                        ${formatDate(attendanceDate)}
                    </td>

                    <td>
                        ${formatCurrency(payment.basePay)}
                    </td>

                    <td>
                        ${payment.overtimeHours || 0} hrs
                    </td>

                    <td>
                        ${formatCurrency(payment.overtimePay)}
                    </td>

                    <td>
                        <strong>
                            ${formatCurrency(payment.totalPay)}
                        </strong>
                    </td>

                    <td>
                        ${formatDate(payment.paymentDate)}
                    </td>

                </tr>
            `;

        }).join("");
}


// ------------------------------------------------------------
// Payment Summary
// ------------------------------------------------------------

function updatePaymentSummary() {

    const totalAmount =
        payments.reduce(
            (sum, payment) =>
                sum + Number(payment.totalPay || 0),
            0
        );


    const overtimeAmount =
        payments.reduce(
            (sum, payment) =>
                sum + Number(payment.overtimePay || 0),
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
            formatCurrency(totalAmount);
    }


    if (countElement) {
        countElement.textContent =
            payments.length;
    }


    if (overtimeElement) {
        overtimeElement.textContent =
            formatCurrency(overtimeAmount);
    }
}


// ============================================================
// DASHBOARD
// ============================================================

function updateDashboard() {

    const totalWorkers =
        document.getElementById(
            "totalWorkers"
        );


    const totalWorksites =
        document.getElementById(
            "totalWorksites"
        );


    const presentToday =
        document.getElementById(
            "presentToday"
        );


    const totalPayments =
        document.getElementById(
            "totalPayments"
        );


    if (totalWorkers) {

        totalWorkers.textContent =
            workers.length;
    }


    if (totalWorksites) {

        totalWorksites.textContent =
            worksites.length;
    }


    const today =
        getTodayDate();


    const todayAttendance =
        attendanceRecords.filter(
            record =>
                record.attendanceDate === today &&
                (
                    record.status === "PRESENT" ||
                    record.status === "HALF_DAY"
                )
        );


    if (presentToday) {

        presentToday.textContent =
            todayAttendance.length;
    }


    const paymentTotal =
        payments.reduce(
            (sum, payment) =>
                sum + Number(payment.totalPay || 0),
            0
        );


    if (totalPayments) {

        totalPayments.textContent =
            formatCurrency(paymentTotal);
    }


    renderDashboardWorkers();
}


// ------------------------------------------------------------
// Dashboard Recent Workers
// ------------------------------------------------------------

function renderDashboardWorkers() {

    const container =
        document.getElementById(
            "dashboardWorkerList"
        );

    if (!container) return;


    const recentWorkers =
        [...workers]
            .sort(
                (a, b) =>
                    Number(b.id) -
                    Number(a.id)
            )
            .slice(0, 5);


    if (recentWorkers.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No workers yet</h3>
                <p>Add your first worker.</p>
            </div>
        `;

        return;
    }


    container.innerHTML =
        recentWorkers.map(worker => {

            return `
                <div class="dashboard-worker-item">

                    <div class="worker-avatar">
                        ${getInitials(worker.name)}
                    </div>

                    <div>

                        <strong>
                            ${escapeHtml(worker.name)}
                        </strong>

                        <span>
                            ${escapeHtml(worker.phone)}
                        </span>

                    </div>

                    <strong>
                        ${formatCurrency(worker.dailyWage)}
                    </strong>

                </div>
            `;

        }).join("");
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
        document.getElementById("toast");


    const toastTitle =
        document.getElementById("toastTitle");


    const toastMessage =
        document.getElementById("toastMessage");


    if (!toast) return;


    toastTitle.textContent =
        title;


    toastMessage.textContent =
        message;


    toast.classList.remove(
        "success",
        "error"
    );


    toast.classList.add(type);


    toast.classList.add("show");


    clearTimeout(
        window.toastTimer
    );


    window.toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 4000);
}


// ------------------------------------------------------------
// Close Toast
// ------------------------------------------------------------

function closeToast() {

    document
        .getElementById("toast")
        ?.classList.remove("show");
}


// ============================================================
// DATE / FORMATTING FUNCTIONS
// ============================================================

function getTodayDate() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    if (isNaN(date.getTime())) {
        return dateString;
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


function formatCurrency(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }
    ).format(
        Number(value || 0)
    );
}


function formatStatus(status) {

    if (!status) {
        return "-";
    }


    return status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );
}


// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getWorkerName(id) {

    const worker =
        workers.find(
            item => Number(item.id) === Number(id)
        );


    return worker
        ? worker.name
        : `Worker #${id || "-"}`;
}


function getWorksiteName(id) {

    const worksite =
        worksites.find(
            item => Number(item.id) === Number(id)
        );


    return worksite
        ? worksite.name
        : `Worksite #${id || "-"}`;
}


function getInitials(name) {

    if (!name) {
        return "WT";
    }


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


function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ============================================================
// CURRENT DATE
// ============================================================

function updateCurrentDate() {

    const element =
        document.getElementById(
            "currentDate"
        );


    if (!element) return;


    const today =
        new Date();


    element.textContent =
        today.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
}


// ============================================================
// EVENT LISTENERS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {


        // ----------------------------------------------------
        // Navigation
        // ----------------------------------------------------

        document
            .querySelectorAll(".nav-item")
            .forEach(item => {

                item.addEventListener(
                    "click",
                    () => {

                        showPage(
                            item.dataset.page
                        );
                    }
                );

            });


        // ----------------------------------------------------
        // Other buttons with data-page
        // ----------------------------------------------------

        document
            .querySelectorAll("[data-page]")
            .forEach(button => {

                if (
                    button.classList.contains(
                        "nav-item"
                    )
                ) {
                    return;
                }


                button.addEventListener(
                    "click",
                    () => {

                        showPage(
                            button.dataset.page
                        );
                    }
                );

            });


        // ----------------------------------------------------
        // Dashboard Add Worker
        // ----------------------------------------------------

        document
            .getElementById(
                "dashboardAddWorkerBtn"
            )
            ?.addEventListener(
                "click",
                openWorkerModal
            );


        // ----------------------------------------------------
        // Add Worker
        // ----------------------------------------------------

        document
            .getElementById(
                "addWorkerBtn"
            )
            ?.addEventListener(
                "click",
                openWorkerModal
            );


        // ----------------------------------------------------
        // Add Worksite
        // ----------------------------------------------------

        document
            .getElementById(
                "addWorksiteBtn"
            )
            ?.addEventListener(
                "click",
                openWorksiteModal
            );


        // ----------------------------------------------------
        // Add Attendance
        // ----------------------------------------------------

        document
            .getElementById(
                "addAttendanceBtn"
            )
            ?.addEventListener(
                "click",
                openAttendanceModal
            );


        // ----------------------------------------------------
        // Worker Form
        // ----------------------------------------------------

        document
            .getElementById(
                "workerForm"
            )
            ?.addEventListener(
                "submit",
                saveWorker
            );


        // ----------------------------------------------------
        // Worksite Form
        // ----------------------------------------------------

        document
            .getElementById(
                "worksiteForm"
            )
            ?.addEventListener(
                "submit",
                saveWorksite
            );


        // ----------------------------------------------------
        // Attendance Form
        // ----------------------------------------------------

        document
            .getElementById(
                "attendanceForm"
            )
            ?.addEventListener(
                "submit",
                saveAttendance
            );


        // ----------------------------------------------------
        // Worker Modal Close
        // ----------------------------------------------------

        document
            .getElementById(
                "closeWorkerModal"
            )
            ?.addEventListener(
                "click",
                closeWorkerModal
            );


        document
            .getElementById(
                "cancelWorkerModal"
            )
            ?.addEventListener(
                "click",
                closeWorkerModal
            );


        // ----------------------------------------------------
        // Worksite Modal Close
        // ----------------------------------------------------

        document
            .getElementById(
                "closeWorksiteModal"
            )
            ?.addEventListener(
                "click",
                closeWorksiteModal
            );


        document
            .getElementById(
                "cancelWorksiteModal"
            )
            ?.addEventListener(
                "click",
                closeWorksiteModal
            );


        // ----------------------------------------------------
        // Attendance Modal Close
        // ----------------------------------------------------

        document
            .getElementById(
                "closeAttendanceModal"
            )
            ?.addEventListener(
                "click",
                closeAttendanceModal
            );


        document
            .getElementById(
                "cancelAttendanceModal"
            )
            ?.addEventListener(
                "click",
                closeAttendanceModal
            );


        // ----------------------------------------------------
        // Toast Close
        // ----------------------------------------------------

        document
            .getElementById(
                "closeToast"
            )
            ?.addEventListener(
                "click",
                closeToast
            );


        // ----------------------------------------------------
        // Worker Search
        // ----------------------------------------------------

        document
            .getElementById(
                "workerSearch"
            )
            ?.addEventListener(
                "input",
                renderWorkers
            );


        // ----------------------------------------------------
        // Mobile Menu
        // ----------------------------------------------------

        document
            .getElementById(
                "menuButton"
            )
            ?.addEventListener(
                "click",
                () => {

                    document
                        .getElementById("sidebar")
                        ?.classList.toggle(
                        "mobile-open"
                    );
                }
            );


        // ----------------------------------------------------
        // Attendance Status
        // ----------------------------------------------------

        document
            .getElementById(
                "attendanceStatus"
            )
            ?.addEventListener(
                "change",
                event => {

                    const overtimeInput =
                        document.getElementById(
                            "overtimeHours"
                        );


                    if (
                        event.target.value ===
                        "ABSENT"
                    ) {

                        overtimeInput.value =
                            "0";

                        overtimeInput.disabled =
                            true;

                    } else {

                        overtimeInput.disabled =
                            false;
                    }
                }
            );


        // ----------------------------------------------------
        // Close modal when clicking outside
        // ----------------------------------------------------

        document
            .querySelectorAll(".modal")
            .forEach(modal => {

                modal.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target === modal
                        ) {

                            modal.classList.remove(
                                "show"
                            );
                        }
                    }
                );

            });


        // ----------------------------------------------------
        // Initialize
        // ----------------------------------------------------

        updateCurrentDate();

        loadAllData();

    }
);

