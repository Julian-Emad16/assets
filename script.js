const AUTH_URL = 'https://script.google.com/macros/s/AKfycbzDi-X2w3zsYCTX0Syw8PevL2tLwomaIS1JpMAdJogKUDL3KiWQK8cUIknnVkMFx1q7/exec';
const APP_URL = 'https://script.google.com/macros/s/AKfycbzVaqyuPeA9n9DEkEpmew-l2HXor3onnLcUfzZdPeg7QTKSZVJDcyiNUzcJeYaJknBP/exec';

let currentLang = localStorage.getItem('crm_lang') || 'en';
let currentMode = localStorage.getItem('crm_mode') || 'light';
let authMode = 'login'; 
let currentUser = sessionStorage.getItem('crm_user');
let allRows = [];

const statusOptions = {
    en: ["Stagnation", "Introduction", "Negotiations", "Quotation", "Supply", "Collection"],
    ar: ["ركود", "تعارف", "مفاوضات", "عرض سعر", "توريد", "تحصيل"]
};

const translations = {
    en: {
        signIn: "Sign In", authDescLogin: "Access your CRM dashboard",
        authDescSignup: "Create your account to continue",
        userLabel: "Your Username", userPlace: "Enter your username",
        passLabel: "Password", passPlace: "Enter password",
        repeatPassLabel: "Repeat Password", repeatPassPlace: "Confirm password",
        refresh: "Refresh", signOut: "Sign Out", dashboard: "Dashboard",
        totalEntries: "Total Entries", activeLeads: "Active Value",
        addLead: "Add Lead", thClient: "Client", thProject: "Project",
        thLocation: "Location", thPhone: "Phone", thValue: "Value (EGY)", 
        thStatus: "Status", thDate: "Date", thUser: "Sales Rep",
        all: "All Status", searchPlace: "Search clients...",
        projectPlace: "Project", locationPlace: "Location", namePlace: "Name",
        phonePlace: "Phone", valuePlace: "Value", darkMode: "Dark Mode", lightMode: "Light Mode", 
        langSwitch: "العربية", questionLogin: "Don't have an account?", createAccount: "Create Account",
        questionSignup: "Already have an account?", backLogin: "Sign In",
        loading: "Loading Data...", saved: "Data Saved Successfully!",
        editTitle: "Edit Lead",
        saveChanges: "Save Changes",
        cancel: "Cancel",
        thClient: "Client Name",
        thProject: "Project",
        thLocation: "Location",
        thPhone: "Phone",
        thStatus: "Status",
        thValue: "Value",
        deleteTitle: "Confirm Delete",
        deleteConfirmText: "Are you sure you want to delete this lead? This action cannot be undone.",
        deleteBtn: "Delete",
        deleteSuccess: "Deleted successfully",  
        thNotes: "Notes",
        currLabel: "EGY",
        phNotes: "Notes"
    },
    ar: {
        signIn: "تسجيل الدخول", authDescLogin: "الدخول لنظام إدارة العملاء",
        authDescSignup: "أنشئ حسابك للمتابعة",
        userLabel: "مستخدم", userPlace:"أدخل اسم المستخدم الخاص بك",
        passLabel: "كلمة المرور", passPlace: "أدخل كلمة المرور",
        repeatPassLabel: "تأكيد كلمة المرور", repeatPassPlace: "أعد كتابة كلمة المرور",
        refresh: "تحديث", signOut: "خروج", dashboard: "لوحة التحكم",
        totalEntries: "إجمالي العمليات", activeLeads: "القيمة النشطة",
        addLead: "إضافة عملية", thClient: "العميل", thProject: "المشروع",
        thLocation: "الموقع", thPhone: "الهاتف", thValue: "القيمة (جنيه)", 
        thStatus: "الحالة", thDate: "التاريخ", thUser: "الموظف",
        all: "كل الحالات", searchPlace: "بحث...",
        projectPlace: "المشروع", locationPlace: "الموقع", namePlace: "الاسم",
        phonePlace: "الهاتف", valuePlace: "القيمة", darkMode: "الوضع الليلي", lightMode: "الوضع النهاري", 
        langSwitch: "English", questionLogin: "ليس لديك حساب؟", createAccount: "إنشاء حساب",
        questionSignup: "لديك حساب بالفعل؟", backLogin: "تسجيل دخول",
        loading: "جاري تحميل البيانات...", saved: "تم حفظ البيانات بنجاح!", editTitle: "تعديل البيانات",
        saveChanges: "حفظ التغييرات",
        cancel: "إلغاء",
        // Reuse existing table headers for labels:
        hClient: "اسم العميل",
        thProject: "المشروع",
        thLocation: "الموقع",
        thPhone: "الهاتف",
        thStatus: "الحالة",
        thValue: "القيمة", 
        deleteTitle: "تأكيد الحذف",
        deleteConfirmText: "هل أنت متأكد من حذف هذه البيانات؟ لا يمكن التراجع عن هذا الإجراء.",
        deleteBtn: "حذف",
        deleteSuccess: "تم الحذف بنجاح",
        thNotes: "ملاحظات",
        currLabel: "ج.م",
        phNotes: "ملاحظات"
    }
};

// Inside your language toggle function
const notesInput = document.getElementById('Notes');
if (notesInput) {
    notesInput.placeholder = translations[currentLang].phNotes;
    notesInput.style.textAlign = (currentLang === 'ar') ? 'right' : 'left';
    notesInput.dir = (currentLang === 'ar') ? 'rtl' : 'ltr';
}

function showLoader(show) {
    const loader = document.getElementById('globalLoader');
    loader.style.opacity = show ? '1' : '0';
    setTimeout(() => { loader.style.display = show ? 'flex' : 'none'; }, 500);
}

function isAdmin() { 
    return sessionStorage.getItem('crm_role') === 'admin'; 
}        

function checkMobile() {
    const isMobile = window.innerWidth <= 850;
    if (isMobile) {
        document.body.classList.add('mobile-view');
        document.body.dir = 'ltr'; // Force LTR on mobile
    } else {
        document.body.classList.remove('mobile-view');
        document.body.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    }
}

function updateUI() {
    checkMobile();
    const t = translations[currentLang];
    lucide.createIcons();
    const isAr = currentLang === 'ar';
    
    // Global & Auth Text
    document.getElementById('loadingText').innerText = t.loading;
    document.getElementById('authTitle').innerText = authMode === 'login' ? t.signIn : t.createAccount;
    document.getElementById('authDesc').innerText = authMode === 'login' ? t.authDescLogin : t.authDescSignup;
    document.getElementById('authSubmitBtn').innerText = authMode === 'login' ? t.signIn : t.createAccount;
    document.getElementById('questionText').innerText = authMode === 'login' ? t.questionLogin : t.questionSignup;
    document.getElementById('toggleText').innerText = authMode === 'login' ? t.createAccount : t.backLogin;

    // Login Labels
    document.getElementById('userLabel').innerText = t.userLabel;
    document.getElementById('passLabel').innerText = t.passLabel;
    document.getElementById('repeatPassLabel').innerText = t.repeatPassLabel;

    // Login Placeholders
    document.getElementById('authUser').placeholder = t.userPlace;
    document.getElementById('authPass').placeholder = t.passPlace;
    document.getElementById('authPassRepeat').placeholder = t.repeatPassPlace;

    // Dashboard Placeholders
    document.getElementById('projectName').placeholder = t.projectPlace;
    document.getElementById('location').placeholder = t.locationPlace;
    document.getElementById('clientName').placeholder = t.namePlace;
    document.getElementById('clientPhone').placeholder = t.phonePlace;
    document.getElementById('clientValue').placeholder = t.valuePlace;
    document.getElementById('searchFilter').placeholder = t.searchPlace;
    
    // Controls
    document.getElementById('modeLabel').innerText = currentMode === 'dark' ? t.lightMode : t.darkMode;
    document.getElementById('langLabel').innerText = t.langSwitch;

    // Batch updates for data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerText = t[key];
    });

    const currencyEl = document.getElementById('currencyLabel');
    if (currencyEl) {
        currencyEl.innerText = t.currLabel;
        if (isAr) {
            currencyEl.style.right = 'auto'; // Clear the right position
            currencyEl.style.left = '15px';  // Move to the left
            currencyEl.style.direction = 'rtl';
        } else {
            currencyEl.style.left = 'auto';  // Clear the left position
            currencyEl.style.right = '15px'; // Move back to the right
            currencyEl.style.direction = 'ltr';
        }
    }

    // Select Menus (Status)
    const statusSelect = document.getElementById('clientStatus');
    const filterSelect = document.getElementById('statusFilter');
    
    if (statusSelect) {
        statusSelect.innerHTML = statusOptions[currentLang].map((s, i) => 
            `<option value="${statusOptions.en[i]}">${s}</option>`).join('');
    }
    
    if (filterSelect) {
        filterSelect.innerHTML = `<option value="All">${t.all}</option>` + 
            statusOptions[currentLang].map((s, i) => 
            `<option value="${statusOptions.en[i]}">${s}</option>`).join('');
    }
}

function toggleAuthMode() {
    authMode = authMode === 'login' ? 'signup' : 'login';
    document.getElementById('repeatPasswordGroup').classList.toggle('hidden', authMode === 'login');
    updateUI();
}

function toggleDarkMode() {
    currentMode = currentMode === 'light' ? 'dark' : 'light';
    applyMode(currentMode);
}

function applyMode(mode) {
    document.body.classList.toggle('dark-mode', mode === 'dark');
    localStorage.setItem('crm_mode', mode);
    const icon = mode === 'dark' ? 'sun' : 'moon';
    document.querySelectorAll('.modeIcon').forEach(el => el.setAttribute('data-lucide', icon));
    lucide.createIcons();
    updateUI();
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    localStorage.setItem('crm_lang', currentLang);
    updateUI();
    if(allRows.length > 0) renderTable(allRows);
}

function handleAuth() {
    const user = document.getElementById('authUser').value.trim();
    const pass = document.getElementById('authPass').value.trim();
    
    // Translation-friendly alerts (Optional, but good for your Arabic support)
    if (!user || !pass) return alert(currentLang === 'ar' ? "يرجى ملء جميع الحقول" : "Please fill all fields");
    
    showLoader(true);
    const action = authMode === 'login' ? 'login' : 'signup';
    
    // Note: We use GET for login to match your doGet script, 
    // and POST for signup if you prefer, but sticking to your current logic:
    fetch(`${AUTH_URL}?action=${action}&user=${user}&pass=${pass}`)
    .then(res => res.text())
    .then(res => {
        if (res.includes('success')) {
            // res looks like: "success|dark|admin"
            const parts = res.split('|');
            const userMode = parts[1] || 'light';
            const userRole = parts[2] || 'user';

            // 1. Store the username
            sessionStorage.setItem('crm_user', user);
            
            // 2. Store the role (essential for your isAdmin() check)
            sessionStorage.setItem('crm_role', userRole);
            
            // 3. Store the theme preference
            localStorage.setItem('crm_mode', userMode);
            
            location.reload();
        } else {
            showLoader(false);
            // Handle specific error messages
            if (res === 'exists') {
                alert(currentLang === 'ar' ? "المستخدم موجود بالفعل" : "User already exists");
            } else {
                alert(currentLang === 'ar' ? "بيانات الدخول غير صحيحة" : "Invalid Login Credentials");
            }
        }
    })
    .catch(err => {
        showLoader(false);
        console.error("Auth Error:", err);
    });
}

function triggerRefresh() {
    showLoader(true);
    loadData();
}

function loadData() {
    fetch(`${APP_URL}?action=fetchData`)
        .then(res => res.json())
        .then(data => {
            allRows = data.slice(1).filter(r => isAdmin() || r[0] == currentUser);
            renderTable(allRows);
            showLoader(false);
            document.getElementById('appContent').classList.add('loaded');
        });
}

function renderTable(rows) {
    const body = document.getElementById('clientTableBody');
    body.innerHTML = '';
    const isAdm = isAdmin();

    rows.forEach((r) => {
        // --- CORRECTED Index Mapping to match Google Script ---
        // 0:User, 1:Client Name, 2:Project, 3:Location, 4:Phone, 5:Status, 6:Date, 7:Value, 8:Notes
        
        const clientName = r[1] || '-'; 
        const projectName = r[2] || '-';
        const locationName = r[3] || '-';
        const phone = r[4] || '-';
        const status = r[5] || 'Stagnation';
        const value = r[7] || 0;
        const notes = r[8] || '';

        const statusIndex = statusOptions.en.indexOf(status);
        const localizedStatus = statusIndex > -1 ? statusOptions[currentLang][statusIndex] : status;
        const cleanStatusClass = status.toLowerCase().replace(/\s/g, '');

        let displayDate = r[6] || '-';
        if (displayDate !== '-' && !isNaN(Date.parse(displayDate))) {
            const d = new Date(displayDate);
            // Use local date methods to stop the "one day earlier" shift
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            displayDate = `${y}-${m}-${day}`;
        }

        const tr = document.createElement('tr');
        const encodedRow = encodeURIComponent(JSON.stringify(r));
        
        const actionButtons = `
            <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
                <button title="Edit" class="action-btn btn-edit" onclick="openEditModal('${encodedRow}')">
                    <i data-lucide="edit-3" style="width:16px;"></i>
                </button>
                <button title="Delete" class="action-btn btn-delete" onclick="confirmDelete('${r[0]}')">
                    <i data-lucide="x" style="width:16px;"></i>
                </button>
            </div>
        `;

        // We removed the "if (isMobile)" block here so it always uses the standard table
        tr.innerHTML = `
            <td style="font-weight:700">${clientName}</td> 
            <td>${projectName}</td> 
            <td>${locationName}</td> 
            <td><a href="tel:${phone}" style="color: inherit; text-decoration: none; font-family: monospace;">${phone}</a></td>
            <td style="font-weight:800; color:#34C759;">${Number(value).toLocaleString()} EGY</td> 
            <td><span class="status-pill status-${cleanStatusClass}">${localizedStatus}</span></td>
            ${isAdm ? `<td style="color:var(--apple-blue); font-weight:600;">${r[0]}</td>` : ''}
            <td style="color:var(--apple-secondary); font-size:13px;">${displayDate}</td>
            <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${notes}">${notes || '-'}</td>
            <td>${actionButtons}</td>`;
            
        body.appendChild(tr);
    });

    document.getElementById('stat-total').innerText = rows.length;
    const totalValue = rows.reduce((sum, r) => sum + (Number(r[7]) || 0), 0);
    document.getElementById('stat-active').innerText = totalValue.toLocaleString();
    lucide.createIcons();
}

let deleteTargetUser = ""; 

function confirmDelete(userId) {
    // This captures the value from Column A (r[0])
    deleteTargetUser = userId;
    
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        // Re-initialize icons for the trash icon inside the modal
        if (window.lucide) lucide.createIcons(); 
    }
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

function executeDelete() {
    if (!deleteTargetUser) return;
    
    showLoader(true);
    
    // We use "id" as the key because your doPost uses: data.id
    const payload = {
        action: "deleteLead",
        id: deleteTargetUser 
    };

    fetch(APP_URL, {
        method: 'POST',
        mode: 'no-cors', 
        body: JSON.stringify(payload)
    })
    .then(() => {
        closeDeleteModal();
        // Success message
        const msg = currentLang === 'ar' ? "تم الحذف بنجاح" : "Deleted Successfully";
        alert(msg);
        loadData(); // Refresh the table
    })
    .catch(err => {
        console.error("Delete Error:", err);
        showLoader(false);
        alert("Error during deletion.");
    });
}

function filterData() {
    const term = document.getElementById('searchFilter').value.toLowerCase();
    const stat = document.getElementById('statusFilter').value;
    const filtered = allRows.filter(r => {
        const matchSearch = String(r[1]).toLowerCase().includes(term) || String(r[2]).toLowerCase().includes(term);
        const matchStat = stat === 'All' || r[5] === stat;
        return matchSearch && matchStat;
    });
    renderTable(filtered);
}

function logout() { 
    showLoader(true);
    sessionStorage.clear(); 
    location.reload(); 
}
// Add these variables to your script
let currentEditOriginal = {}; 

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.add('hidden');
    modal.style.display = 'none';
}

window.onload = () => {
    applyMode(currentMode);
    window.addEventListener('resize', checkMobile);
    
    if (currentUser) {
        document.getElementById('authOverlay').style.display = 'none';
        document.getElementById('userDisplay').innerText = `Logged in as: ${currentUser}`;
        if(isAdmin()) document.getElementById('userHeader').classList.remove('hidden');
        loadData();
    } else {
        showLoader(false);
    }
    updateUI();
};
let originalLeadData = {}; // To remember which row we are editing

function openEditModal(encodedData) {
    const data = JSON.parse(decodeURIComponent(encodedData));
    
    // Store original keys for the update action (Match Col B and Col C)
    originalLeadData = { name: data[1], project: data[2] };

    // Fill the standard inputs
    document.getElementById('editClientName').value = data[1] || '';
    document.getElementById('editProject').value = data[2] || '';
    document.getElementById('editLocation').value = data[3] || '';
    document.getElementById('editPhone').value = data[4] || '';
    document.getElementById('editValue').value = data[7] || '';
    
    // FIX: Load Date from Index 6 (Column G)
    const dateField = document.getElementById('editDate');
    if (dateField && data[6]) {
        // Ensure date is in YYYY-MM-DD format for the input
        const d = new Date(data[6]);
        if (!isNaN(d)) {
            dateField.value = d.toISOString().split('T')[0];
        }
    }

    // FIX: Load Notes from Index 8 (Column I)
    const notesField = document.getElementById('editNotes');
    if (notesField) {
        notesField.value = data[8] || ''; 
        notesField.dir = (currentLang === 'ar') ? 'rtl' : 'ltr';
    }

    // Status mapping
    const editStatus = document.getElementById('editStatus');
    editStatus.innerHTML = statusOptions.en.map((val, i) => 
        `<option value="${val}" ${data[5] === val ? 'selected' : ''}>${statusOptions[currentLang][i]}</option>`
    ).join('');

    const modal = document.getElementById('editModal');
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function saveEdit() {
    const name = document.getElementById('editClientName').value;
    if (!name) return alert(currentLang === 'ar' ? "الاسم مطلوب" : "Name is required");

    showLoader(true);
    
    const payload = {
        action: "updateLead",
        oldName: originalLeadData.name,
        oldProject: originalLeadData.project,
        name: name,
        project: document.getElementById('editProject').value,
        location: document.getElementById('editLocation').value,
        phone: document.getElementById('editPhone').value,
        status: document.getElementById('editStatus').value,
        date: document.getElementById('editDate').value, // Added Date to Edit
        value: document.getElementById('editValue').value,
        notes: document.getElementById('editNotes').value
    };

    fetch(APP_URL, {
        method: 'POST',
        mode: 'no-cors', 
        body: JSON.stringify(payload)
    }).then(() => {
        closeEditModal();
        setTimeout(loadData, 1200); 
    }).catch(err => {
        console.error("Save Error:", err);
        showLoader(false);
    });
}

function addClient() {
    const nameVal = document.getElementById('clientName').value;
    const projectVal = document.getElementById('projectName').value;
    const locationVal = document.getElementById('location').value;
    const phoneVal = document.getElementById('clientPhone').value;
    const statusVal = document.getElementById('clientStatus').value;
    const amountVal = document.getElementById('clientValue').value;
    const notesVal = document.getElementById('Notes').value; 
    const selectedDate = document.getElementById('clientDate').value;
    
    // Use selected date or default to today
    const finalDate = selectedDate || new Date().toISOString().split('T')[0];

    if(!nameVal) {
        alert(currentLang === 'ar' ? "الاسم مطلوب" : "Name is required");
        return;
    }

    showLoader(true);

    const payload = {
        action: "addClient", 
        user: currentUser,
        name: nameVal,
        project: projectVal,
        location: locationVal,
        phone: phoneVal,
        status: statusVal,
        date: finalDate, // Corrected: removed the second 'date' key below
        value: amountVal,
        notes: notesVal 
    };

    fetch(APP_URL, { 
        method: 'POST', 
        mode: 'no-cors', 
        body: JSON.stringify(payload) 
    }).then(() => {
        // Success message handling
        const msg = currentLang === 'ar' ? "تم الحفظ بنجاح" : "Saved Successfully";
        alert(msg);
        
        // Clear all inputs
        document.getElementById('clientName').value = '';
        document.getElementById('projectName').value = '';
        document.getElementById('location').value = '';
        document.getElementById('clientPhone').value = '';
        document.getElementById('clientValue').value = '';
        document.getElementById('Notes').value = '';
        document.getElementById('clientDate').value = '';
        loadData();
    }).catch(err => {
        console.error("Error:", err);
        showLoader(false);
        alert("Submission failed.");
    });
}


async function exportToExcel() {
    showLoader(true);
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('تقرير المبيعات', {
            pageSetup: { 
                paperSize: 9, // A4
                orientation: 'portrait', 
                fitToPage: true, 
                fitToWidth: 1 
            }
        });

        worksheet.views = [{ rightToLeft: true }];

        const styles = {
            mainTitle: { bold: true, size: 16, color: { argb: 'FF000000' } },
            tableHeaderFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF444444' } }, 
            columnHeaderFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8EAED' } }, 
            footerFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } },       
            whiteText: { color: { argb: 'FFFFFFFF' }, bold: true },
            border: { style: 'thin', color: { argb: 'FFBBBBBB' } }
        };

        // 1. Main Title - Adjusted to 4 columns (A:D)
        const titleRow = worksheet.addRow(['تقرير متابعة العملاء حسب التاريخ والحالة']);
        worksheet.mergeCells('A1:D1');
        titleRow.font = styles.mainTitle;
        titleRow.alignment = { horizontal: 'center' };
        worksheet.addRow([]); 

        let grandTotal = 0;
        const statuses = ["ركود", "تعارف", "مفاوضات", "عرض سعر", "توريد", "تحصيل"];

        // 2. Loop through each status
        statuses.forEach((statusAr) => {
            const statusIdx = statusOptions.ar.indexOf(statusAr);
            const statusEn = statusOptions.en[statusIdx];
            const filteredData = allRows.filter(r => r[5] === statusEn);

            if (filteredData.length > 0) {
                // Individual Table Header
                const tableTitleRow = worksheet.addRow([`حالة: ${statusAr}`]);
                worksheet.mergeCells(`A${tableTitleRow.number}:D${tableTitleRow.number}`);
                tableTitleRow.eachCell(cell => {
                    cell.fill = styles.tableHeaderFill;
                    cell.font = styles.whiteText;
                    cell.alignment = { horizontal: 'center' };
                });

                // Column Labels: Date, Employee, Company, Value
                const colHeaderRow = worksheet.addRow(['التاريخ', 'الموظف', 'الشركة', 'القيمة']);
                colHeaderRow.eachCell(cell => {
                    cell.fill = styles.columnHeaderFill;
                    cell.font = { bold: true };
                    cell.alignment = { horizontal: 'center' };
                    cell.border = styles.border;
                });

                let statusSum = 0;

                // Data Rows
                filteredData.forEach(dr => {
                    const val = parseFloat(dr[7]) || 0;
                    statusSum += val;
                    grandTotal += val;

                    // Date Formatting
                    let cleanDate = '-';
                    if (dr[6]) {
                        const d = new Date(dr[6]);
                        if (!isNaN(d)) {
                            cleanDate = d.toLocaleDateString('ar-EG');
                        }
                    }

                    // Mapping: dr[6]:Date, dr[0]:Employee, dr[1]:Company, val:Amount
                    const row = worksheet.addRow([cleanDate, dr[0], dr[1], val]);

                    row.eachCell((cell, colIndex) => {
                        cell.border = styles.border;
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                        if (colIndex === 4) cell.numFmt = '#,##0.00 "EGY"';
                    });
                });

                // Individual Table Footer
                const tableFooter = worksheet.addRow([`إجمالي (${statusAr})`, '', '', statusSum]);
                worksheet.mergeCells(`A${tableFooter.number}:C${tableFooter.number}`);
                tableFooter.eachCell((cell, colIndex) => {
                    cell.font = { bold: true };
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
                    cell.border = styles.border;
                    cell.alignment = { horizontal: 'center' };
                    if (colIndex === 4) cell.numFmt = '#,##0.00 "EGY"';
                });

                worksheet.addRow([]); // Spacer
            }
        });

        // 3. Final Summary Section
        const grandTotalRow = worksheet.addRow(['القيمة الإجمالية لجميع الحالات', '', '', grandTotal]);
        worksheet.mergeCells(`A${grandTotalRow.number}:C${grandTotalRow.number}`);
        grandTotalRow.eachCell((cell, colIdx) => {
            cell.fill = styles.footerFill;
            cell.font = { bold: true, size: 12 };
            cell.border = styles.border;
            cell.alignment = { horizontal: 'center' };
            if (colIdx === 4) cell.numFmt = '#,##0.00 "EGY"';
        });

        // 4. Branding
        worksheet.addRow([]);
        const currentUser = sessionStorage.getItem('crm_user') || 'Admin';
        const brandRow = worksheet.addRow([`مستخرج بواسطة: ${currentUser}`, '', '', `بتاريخ: ${new Date().toLocaleDateString('ar-EG')}`]);
        worksheet.mergeCells(`A${brandRow.number}:B${brandRow.number}`);
        worksheet.mergeCells(`C${brandRow.number}:D${brandRow.number}`);

        // 5. AUTOMATIC CELL SCALING
        worksheet.columns.forEach(column => {
            let maxColumnLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
                // Calculate only based on non-merged cells or master cells to avoid XML issues
                if (!cell.isMerged || cell.address === cell.master.address) {
                    const cellValue = cell.value ? cell.value.toString() : "";
                    if (cellValue.length > maxColumnLength) {
                        maxColumnLength = cellValue.length;
                    }
                }
            });
            let calculatedWidth = maxColumnLength + 5; 
            column.width = calculatedWidth < 15 ? 15 : (calculatedWidth > 45 ? 45 : calculatedWidth);
        });

        // 6. Save
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `CRM_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

    } catch (err) {
        console.error("Export Error:", err);
        alert("Error exporting.");
    } finally {
        showLoader(false);
    }
}
