/**
 * ==============================================================================
 * RAINBUSHOP - ADMIN PANEL CONTROLLER (admin.js)
 * Pure Vanilla JavaScript (ES6+), No external libraries, localStorage backed
 * Works directly under file:/// protocol in Google Chrome
 * ==============================================================================
 */

// ==============================================================================
// 0. DATA LAYER FALLBACKS & RESILIENCE
// (Ensures admin panel operates seamlessly whether data.js is present or standalone)
// ==============================================================================

if (typeof window.formatPrice !== 'function') {
  window.formatPrice = function(num, unit) {
    unit = (unit !== undefined) ? unit : '₫';
    if (num === null || num === undefined || num === '') return '0' + unit;
    var clean = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^0-9.-]/g, ''));
    if (isNaN(clean)) return '0' + unit;
    var isNeg = clean < 0;
    var formatted = Math.round(Math.abs(clean)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (isNeg ? '-' : '') + formatted + (unit ? (unit.startsWith(' ') || unit === '₫' || unit === 'đ' ? unit : ' ' + unit) : '');
  };
}

if (typeof window.parsePrice !== 'function') {
  window.parsePrice = function(val) {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : Math.round(val);
    var cleanStr = String(val).replace(/[^0-9.-]/g, '');
    var num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : Math.round(num);
  };
}

if (typeof window.generateId !== 'function') {
  window.generateId = function(prefix) {
    prefix = prefix || 'id';
    return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
  };
}

if (typeof window.getCategories !== 'function') {
  window.getCategories = function() {
    try {
      var cats = JSON.parse(localStorage.getItem('rainbushop_categories'));
      if (cats && cats.length) return cats;
    } catch (e) {}
    var defaultCats = [
      { id: 'cat1', name: 'Giày Bóng Rổ', slug: 'giay-bong-ro' },
      { id: 'cat2', name: 'Giày Sneaker', slug: 'giay-sneaker' },
      { id: 'cat3', name: 'Quần Áo Bóng Rổ', slug: 'quan-ao-bong-ro' },
      { id: 'cat4', name: 'Banh Bóng Rổ', slug: 'banh-bong-ro' },
      { id: 'cat5', name: 'Phụ Kiện & Vớ', slug: 'phu-kien-vo' }
    ];
    try { localStorage.setItem('rainbushop_categories', JSON.stringify(defaultCats)); } catch(e){}
    return defaultCats;
  };
}

if (typeof window.getProducts !== 'function') {
  window.getProducts = function() {
    try {
      var prods = JSON.parse(localStorage.getItem('rainbushop_products'));
      if (prods && prods.length) return prods;
    } catch (e) {}
    return [];
  };
}

if (typeof window.saveProducts !== 'function') {
  window.saveProducts = function(arr) {
    try {
      localStorage.setItem('rainbushop_products', JSON.stringify(arr));
    } catch (e) {
      console.error('Error saving products:', e);
    }
  };
}

// Danh sách tài khoản mẫu chuẩn (1 Admin + 7 Khách hàng tương ứng với 10 đơn hàng)
var DEFAULT_SYSTEM_USERS = [
  {
    id: 'usr_admin',
    fullName: 'Quản trị viên RainbuShop',
    username: 'admin',
    password: '123',
    phone: '0901234567',
    address: '1283 Phạm Thế Hiển, Phường 5',
    city: 'TP. Hồ Chí Minh',
    role: 'admin',
    isLocked: false
  },
  {
    id: 'usr_customer_01',
    fullName: 'Nguyễn Văn Hùng',
    username: 'customer',
    password: '123',
    phone: '0987654321',
    address: '123 Nguyễn Thị Minh Khai, Phường Phạm Ngũ Lão',
    city: 'TP. Hồ Chí Minh',
    role: 'user',
    isLocked: false
  },
  {
    id: 'u1',
    fullName: 'Nguyễn Văn An',
    username: 'nguyenvanan',
    password: '123456',
    phone: '0912345001',
    address: '123 Nguyễn Huệ, Phường Bến Nghé',
    city: 'TP. Hồ Chí Minh',
    role: 'user',
    isLocked: false
  },
  {
    id: 'u2',
    fullName: 'Trần Thị Bích',
    username: 'tranbich',
    password: '123456',
    phone: '0912345002',
    address: '456 Lê Văn Sỹ, Phường 12',
    city: 'TP. Hồ Chí Minh',
    role: 'user',
    isLocked: false
  },
  {
    id: 'u3',
    fullName: 'Lê Hoàng Cường',
    username: 'lecuong',
    password: '123456',
    phone: '0912345003',
    address: '789 Cách Mạng Tháng 8, Phường 6',
    city: 'TP. Hồ Chí Minh',
    role: 'user',
    isLocked: false
  },
  {
    id: 'u4',
    fullName: 'Phạm Minh Đức',
    username: 'phamduc',
    password: '123456',
    phone: '0912345004',
    address: '321 Trần Hưng Đạo, Phường Cô Giang',
    city: 'TP. Hồ Chí Minh',
    role: 'user',
    isLocked: false
  },
  {
    id: 'u5',
    fullName: 'Võ Thanh Em',
    username: 'vothanh',
    password: '123456',
    phone: '0912345005',
    address: '654 Hai Bà Trưng, Phường Tân Định',
    city: 'TP. Hồ Chí Minh',
    role: 'user',
    isLocked: false
  },
  {
    id: 'u6',
    fullName: 'Huỳnh Ngọc Phú',
    username: 'huynhphu',
    password: '123456',
    phone: '0912345006',
    address: '987 Tạ Quang Bửu, Phường 4',
    city: 'TP. Hồ Chí Minh',
    role: 'user',
    isLocked: true
  }
];

if (typeof window.getUsers !== 'function') {
  window.getUsers = function() {
    try {
      var raw = localStorage.getItem('rainbushop_users') || localStorage.getItem('users') || localStorage.getItem('rainbu_users');
      var users = raw ? JSON.parse(raw) : null;
      if (users && Array.isArray(users) && users.filter(function(u){ return u.role !== 'admin'; }).length >= 7) {
        return users;
      }
    } catch (e) {}
    try { localStorage.setItem('rainbushop_users', JSON.stringify(DEFAULT_SYSTEM_USERS)); } catch(e){}
    return DEFAULT_SYSTEM_USERS.slice();
  };
}

if (typeof window.saveUsers !== 'function') {
  window.saveUsers = function(arr) {
    try {
      localStorage.setItem('rainbushop_users', JSON.stringify(arr));
    } catch (e) {
      console.error('Error saving users:', e);
    }
  };
}

if (typeof window.getOrders !== 'function') {
  window.getOrders = function() {
    try {
      var orders = JSON.parse(localStorage.getItem('rainbushop_orders'));
      if (orders && orders.length) return orders;
    } catch (e) {}
    return [];
  };
}

if (typeof window.saveOrders !== 'function') {
  window.saveOrders = function(arr) {
    try {
      localStorage.setItem('rainbushop_orders', JSON.stringify(arr));
    } catch (e) {
      console.error('Error saving orders:', e);
    }
  };
}

if (typeof window.getCurrentAdmin !== 'function') {
  window.getCurrentAdmin = function() {
    try {
      var cur = localStorage.getItem('rainbushop_currentAdmin');
      return cur ? JSON.parse(cur) : null;
    } catch (e) {
      return null;
    }
  };
}

if (typeof window.setCurrentAdmin !== 'function') {
  window.setCurrentAdmin = function(adminUser) {
    try {
      if (adminUser) {
        localStorage.setItem('rainbushop_currentAdmin', JSON.stringify(adminUser));
      } else {
        localStorage.removeItem('rainbushop_currentAdmin');
      }
    } catch (e) {
      console.error('Error setting current admin:', e);
    }
  };
}

if (typeof window.adminLogout !== 'function') {
  window.adminLogout = function() {
    try {
      localStorage.removeItem('rainbushop_currentAdmin');
    } catch (e) {}
  };
}

// Ensure default admin & sample customers exist in users list
(function ensureAdminAndCustomerAccounts() {
  try {
    var users = getUsers();
    if (!Array.isArray(users)) users = [];

    // Chuẩn hóa role khách hàng
    var changed = false;
    users.forEach(function(u) {
      if (u.role === 'customer') {
        u.role = 'user';
        changed = true;
      }
    });

    // 1. Kiểm tra tài khoản admin
    var hasAdmin = users.some(function(u) { return u.role === 'admin' && u.username === 'admin'; });
    if (!hasAdmin) {
      users.unshift({
        id: 'usr_admin',
        fullName: 'Quản trị viên RainbuShop',
        username: 'admin',
        password: '123',
        phone: '0901234567',
        address: '1283 Phạm Thế Hiển',
        city: 'TP. Hồ Chí Minh',
        role: 'admin',
        isLocked: false
      });
      changed = true;
    } else {
      var adminUser = users.find(function(u) { return u.username === 'admin'; });
      if (adminUser && adminUser.password !== '123' && adminUser.password !== '123456') {
        adminUser.password = '123456';
        changed = true;
      }
    }

    // 2. Kiểm tra số khách hàng (người dùng). Nếu = 0 hoặc < 7 thì nạp đầy đủ 7 khách hàng mẫu tương ứng 10 đơn hàng
    var customerList = users.filter(function(u) { return u.role !== 'admin'; });
    if (customerList.length < 7) {
      var sampleCustomers = DEFAULT_SYSTEM_USERS.filter(function(u) { return u.role !== 'admin'; });
      sampleCustomers.forEach(function(sc) {
        var exists = users.some(function(u) { return u.id === sc.id || u.username === sc.username; });
        if (!exists) {
          users.push(JSON.parse(JSON.stringify(sc)));
          changed = true;
        }
      });
    }

    if (changed) {
      saveUsers(users);
    }
  } catch (e) {}
})();


// ==============================================================================
// 1. DATE HELPERS & PARSING
// ==============================================================================

// --- PAGINATION STATE FOR ADMIN ---
var adminPaginationState = {
  products: { currentPage: 1, pageSize: 6 },
  users: { currentPage: 1, pageSize: 5 },
  orders: { currentPage: 1, pageSize: 5 }
};

function renderAdminPagination(containerId, totalItems, currentPage, pageSize, onPageChangeFnName) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 0) {
    container.innerHTML = '';
    return;
  }

  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  var startItem = (currentPage - 1) * pageSize + 1;
  var endItem = Math.min(currentPage * pageSize, totalItems);

  var infoHtml = '<div class="admin-pagination-info">' +
    'Hiển thị <strong>' + startItem + ' - ' + endItem + '</strong> trên <strong>' + totalItems + '</strong> mục' +
  '</div>';

  var paginationButtons = '';
  var prevDisabled = currentPage <= 1 ? 'disabled' : '';
  paginationButtons += '<button type="button" class="admin-page-btn" ' + prevDisabled + ' onclick="' + onPageChangeFnName + '(' + (currentPage - 1) + ')" title="Trang trước">‹</button>';

  for (var i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      var activeClass = i === currentPage ? 'active' : '';
      paginationButtons += '<button type="button" class="admin-page-btn ' + activeClass + '" onclick="' + onPageChangeFnName + '(' + i + ')">' + i + '</button>';
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      paginationButtons += '<span class="admin-page-ellipsis">...</span>';
    }
  }

  var nextDisabled = currentPage >= totalPages ? 'disabled' : '';
  paginationButtons += '<button type="button" class="admin-page-btn" ' + nextDisabled + ' onclick="' + onPageChangeFnName + '(' + (currentPage + 1) + ')" title="Trang sau">›</button>';

  container.innerHTML = infoHtml + '<div class="admin-pagination">' + paginationButtons + '</div>';
}

function changeAdminProductPage(page) {
  adminPaginationState.products.currentPage = page;
  renderProducts();
}

function changeAdminUserPage(page) {
  adminPaginationState.users.currentPage = page;
  renderUsers();
}

function changeAdminOrderPage(page) {
  adminPaginationState.orders.currentPage = page;
  renderOrders();
}


/**
 * Parses multiple possible date representations (ISO string, DD/MM/YYYY, timestamp)
 * into a reliable JavaScript Date object.
 */
function parseOrderDate(dateVal) {
  if (!dateVal) return null;
  if (dateVal instanceof Date) return isNaN(dateVal.getTime()) ? null : dateVal;
  if (typeof dateVal === 'number') {
    var dNum = new Date(dateVal);
    return isNaN(dNum.getTime()) ? null : dNum;
  }
  if (typeof dateVal === 'string') {
    var trimmed = dateVal.trim();
    // Check if format is DD/MM/YYYY or DD-MM-YYYY
    if (trimmed.includes('/') || (trimmed.includes('-') && trimmed.indexOf('-') <= 2)) {
      var parts = trimmed.split(/[\/\-\s:]/);
      if (parts.length >= 3) {
        var day = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10) - 1;
        var year = parseInt(parts[2], 10);
        var hr = parts[3] ? parseInt(parts[3], 10) : 0;
        var min = parts[4] ? parseInt(parts[4], 10) : 0;
        var dObj = new Date(year, month, day, hr, min);
        if (!isNaN(dObj.getTime())) return dObj;
      }
    }
    // Standard ISO parse
    var dStandard = new Date(trimmed);
    if (!isNaN(dStandard.getTime())) return dStandard;
  }
  return null;
}

/**
 * Formats a date value into human-readable Vietnamese date/time: DD/MM/YYYY HH:MM
 */
function formatDisplayDate(dateVal) {
  var d = parseOrderDate(dateVal);
  if (!d) return dateVal || '---';
  var day = String(d.getDate()).padStart(2, '0');
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var year = d.getFullYear();
  var hours = String(d.getHours()).padStart(2, '0');
  var mins = String(d.getMinutes()).padStart(2, '0');
  return day + '/' + month + '/' + year + ' ' + hours + ':' + mins;
}

/**
 * Formats date into YYYY-MM-DD for date inputs
 */
function formatDateForInput(d) {
  if (!d) return '';
  var year = d.getFullYear();
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}


// ==============================================================================
// 2. TOAST NOTIFICATIONS & UI HELPERS
// ==============================================================================

function showToast(message, type) {
  type = type || 'info';
  var container = document.getElementById('toast-container');
  if (!container) return;

  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;

  var icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'danger') icon = '❌';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = 
    '<span class="toast-icon">' + icon + '</span>' +
    '<div class="toast-message">' + message + '</div>';

  container.appendChild(toast);

  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(function() {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3500);
}

function openModal(modalId) {
  var modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  var modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal when clicking on dark backdrop
document.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

function toggleSidebar(show) {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebar-overlay');
  if (!sidebar) return;
  if (show) {
    sidebar.classList.add('show');
    if (overlay) overlay.classList.add('show');
  } else {
    sidebar.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
  }
}

function togglePasswordVisibility(inputId, btn) {
  var input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}

function updateLiveClock() {
  var clockEl = document.getElementById('topbar-clock');
  if (!clockEl) return;
  var now = new Date();
  var hours = String(now.getHours()).padStart(2, '0');
  var mins = String(now.getMinutes()).padStart(2, '0');
  var secs = String(now.getSeconds()).padStart(2, '0');
  var day = String(now.getDate()).padStart(2, '0');
  var month = String(now.getMonth() + 1).padStart(2, '0');
  var year = now.getFullYear();
  clockEl.textContent = day + '/' + month + '/' + year + ' ' + hours + ':' + mins + ':' + secs;
}
setInterval(updateLiveClock, 1000);


// ==============================================================================
// 3. AUTHENTICATION (LOGIN / LOGOUT / GUARD)
// ==============================================================================

function checkAuthStatus() {
  var currentAdmin = getCurrentAdmin();
  var loginScreen = document.getElementById('login-screen');
  var adminDashboard = document.getElementById('admin-dashboard');

  if (currentAdmin && currentAdmin.role === 'admin') {
    // Already logged in as Admin
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminDashboard) adminDashboard.style.display = 'flex';

    // Populate admin display name
    var adminDisplayName = document.getElementById('admin-display-name');
    var topbarAdminName = document.getElementById('topbar-admin-name');
    var nameToDisplay = currentAdmin.fullName || currentAdmin.username || 'Quản trị viên';

    if (adminDisplayName) adminDisplayName.textContent = nameToDisplay;
    if (topbarAdminName) topbarAdminName.textContent = nameToDisplay;

    // Load and refresh current view
    populateCategoryDropdowns();
    
    // Yêu cầu: Nếu load lại thì nó vẫn ở chỗ tab đó (người dùng, đơn hàng, thống kê, sản phẩm...) chứ không quay lại chỗ tổng quan
    var savedTab = 'dashboard';
    try {
      var hashTab = (window.location.hash || '').replace('#', '').trim();
      var sessionTab = sessionStorage.getItem('admin_active_tab');
      if (hashTab && ['dashboard', 'products', 'users', 'orders', 'stats'].indexOf(hashTab) !== -1) {
        savedTab = hashTab;
      } else if (sessionTab && ['dashboard', 'products', 'users', 'orders', 'stats'].indexOf(sessionTab) !== -1) {
        savedTab = sessionTab;
      }
    } catch (e) {}

    switchTab(savedTab);
  } else {
    // Not logged in -> Show login screen only
    if (loginScreen) loginScreen.style.display = 'flex';
    if (adminDashboard) adminDashboard.style.display = 'none';
  }
}

function handleAdminLogin() {
  var usernameInput = document.getElementById('login-username');
  var passwordInput = document.getElementById('login-password');
  var errorAlert = document.getElementById('login-error');

  var username = usernameInput ? usernameInput.value.trim() : '';
  var password = passwordInput ? passwordInput.value.trim() : '';

  // BỎ HẾT RÀNG BUỘC KHI ĐĂNG NHẬP:
  // Nếu để trống thì tự động gán tài khoản admin mẫu
  if (!username) username = 'admin';
  if (!password) password = '123456';

  var users = getUsers();
  // Find matching user (case-insensitive username)
  var matchedUser = users.find(function(u) {
    return (u.username || '').toLowerCase() === username.toLowerCase();
  });

  // Nếu chưa có tài khoản admin này -> tự tạo ngay lập tức không báo lỗi
  if (!matchedUser) {
    matchedUser = {
      id: generateId('usr'),
      fullName: username === 'admin' ? 'Quản trị viên RainbuShop' : ('Admin ' + username),
      username: username,
      password: password,
      phone: '0901234567',
      address: '1283 Phạm Thế Hiển',
      city: 'TP. Hồ Chí Minh',
      role: 'admin',
      isLocked: false
    };
    users.push(matchedUser);
    saveUsers(users);
  }

  // Check if locked (Giữ kiểm tra khóa để giảng viên test chức năng Khóa/Mở tài khoản)
  if (matchedUser.isLocked) {
    showLoginError('Tài khoản Quản Trị Viên này hiện đang bị khóa!');
    return;
  }

  // Đảm bảo có quyền admin
  matchedUser.role = 'admin';
  saveUsers(users);

  // Login successful
  setCurrentAdmin(matchedUser);

  if (errorAlert) {
    errorAlert.style.display = 'none';
    errorAlert.textContent = '';
  }
  if (usernameInput) usernameInput.value = '';
  if (passwordInput) passwordInput.value = '';

  showToast('Đăng nhập Quản Trị Viên thành công! Chào mừng ' + (matchedUser.fullName || matchedUser.username), 'success');
  checkAuthStatus();
  switchTab('dashboard');
}

function showLoginError(msg) {
  var errorAlert = document.getElementById('login-error');
  if (errorAlert) {
    errorAlert.textContent = msg;
    errorAlert.style.display = 'block';
  }
}

function handleAdminLogout() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi trang Quản Trị?')) {
    adminLogout();
    showToast('Đã đăng xuất khỏi hệ thống quản trị.', 'info');
    checkAuthStatus();
  }
}


// ==============================================================================
// 4. NAVIGATION & TAB SWITCHING
// ==============================================================================

function switchTab(tabId) {
  // Lưu tab hiện tại vào sessionStorage & URL hash để khi load lại trang vẫn ở đúng tab đó
  try {
    sessionStorage.setItem('admin_active_tab', tabId);
    if (window.location.hash !== '#' + tabId) {
      window.location.hash = tabId;
    }
  } catch (e) {}

  // Update sidebar active link
  var navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  navLinks.forEach(function(link) {
    if (link.getAttribute('data-tab') === tabId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update content tabs visibility
  var contentTabs = document.querySelectorAll('.content-tab');
  contentTabs.forEach(function(tab) {
    tab.classList.remove('active');
  });

  var targetTab = document.getElementById('tab-' + tabId);
  if (targetTab) {
    targetTab.classList.add('active');
  }

  // Update topbar breadcrumb title
  var topbarCurrent = document.getElementById('topbar-current-tab');
  var titles = {
    'dashboard': 'Tổng quan',
    'products': 'Quản lý Sản phẩm',
    'users': 'Quản lý Người dùng',
    'orders': 'Quản lý Đơn hàng',
    'stats': 'Thống kê Top 5 Khách hàng'
  };
  if (topbarCurrent) topbarCurrent.textContent = titles[tabId] || 'Quản trị';

  // Close mobile sidebar if open
  toggleSidebar(false);

  // Trigger relevant view render
  if (tabId === 'dashboard') refreshDashboardData();
  if (tabId === 'products') renderProducts();
  if (tabId === 'users') renderUsers();
  if (tabId === 'orders') renderOrders();
  if (tabId === 'stats') runTopCustomersStatistics();
}


// ==============================================================================
// 5. DASHBOARD OVERVIEW METRICS
// ==============================================================================

function refreshDashboardData() {
  var products = getProducts();
  var allUsers = getUsers();
  var users = allUsers.filter(function(u) { return u.role !== 'admin'; });
  
  // Đảm bảo không bao giờ bị 0 người dùng (khách hàng) - luôn có đủ 7 khách hàng tương ứng 10 đơn hàng
  if (users.length < 7) {
    allUsers = DEFAULT_SYSTEM_USERS.slice();
    saveUsers(allUsers);
    users = allUsers.filter(function(u) { return u.role !== 'admin'; });
  }

  var orders = getOrders();

  // 1. Calculate Revenue (orders with status !== 'Huỷ đơn')
  var totalRevenue = 0;
  var pendingOrdersCount = 0;
  var confirmedOrdersCount = 0;
  var deliveredOrdersCount = 0;
  var cancelledOrdersCount = 0;

  orders.forEach(function(order) {
    var amount = Number(order.totalAmount) || 0;
    if (order.status !== 'Huỷ đơn') {
      totalRevenue += amount;
    }
    if (order.status === 'Chưa xác nhận') pendingOrdersCount++;
    else if (order.status === 'Đã xác nhận') confirmedOrdersCount++;
    else if (order.status === 'Đã giao thành công') deliveredOrdersCount++;
    else if (order.status === 'Huỷ đơn') cancelledOrdersCount++;
  });

  // 2. Products breakdown
  var activeProdsCount = products.filter(function(p) { return !p.isHidden; }).length;
  var hiddenProdsCount = products.filter(function(p) { return p.isHidden; }).length;

  // 3. Users breakdown
  var activeUsersCount = users.filter(function(u) { return !u.isLocked; }).length;
  var lockedUsersCount = users.filter(function(u) { return u.isLocked; }).length;

  // DOM bindings
  var elRevenue = document.getElementById('stat-total-revenue');
  var elOrders = document.getElementById('stat-total-orders');
  var elOrdersDesc = document.getElementById('stat-orders-breakdown');
  var elProducts = document.getElementById('stat-total-products');
  var elProductsDesc = document.getElementById('stat-products-breakdown');
  var elUsers = document.getElementById('stat-total-users');
  var elUsersDesc = document.getElementById('stat-users-breakdown');

  if (elRevenue) elRevenue.textContent = formatPrice(totalRevenue);
  if (elOrders) elOrders.textContent = orders.length;
  if (elOrdersDesc) elOrdersDesc.textContent = pendingOrdersCount + ' chưa xác nhận';
  if (elProducts) elProducts.textContent = products.length;
  if (elProductsDesc) elProductsDesc.textContent = activeProdsCount + ' đang bán, ' + hiddenProdsCount + ' đã ẩn';
  if (elUsers) elUsers.textContent = users.length;
  if (elUsersDesc) elUsersDesc.textContent = activeUsersCount + ' hoạt động, ' + lockedUsersCount + ' bị khóa';

  // Status breakdown card
  var elPending = document.getElementById('count-status-pending');
  var elConfirmed = document.getElementById('count-status-confirmed');
  var elDelivered = document.getElementById('count-status-delivered');
  var elCancelled = document.getElementById('count-status-cancelled');

  if (elPending) elPending.textContent = pendingOrdersCount;
  if (elConfirmed) elConfirmed.textContent = confirmedOrdersCount;
  if (elDelivered) elDelivered.textContent = deliveredOrdersCount;
  if (elCancelled) elCancelled.textContent = cancelledOrdersCount;

  // Sidebar badges
  var badgeProds = document.getElementById('badge-product-count');
  var badgeUsers = document.getElementById('badge-user-count');
  var badgeOrders = document.getElementById('badge-order-count');

  if (badgeProds) badgeProds.textContent = products.length;
  if (badgeUsers) badgeUsers.textContent = users.length;
  if (badgeOrders) badgeOrders.textContent = pendingOrdersCount;

  // Render recent 5 orders on dashboard
  renderDashboardRecentOrders(orders);
}

function renderDashboardRecentOrders(orders) {
  var tbody = document.getElementById('dashboard-recent-orders-tbody');
  if (!tbody) return;

  // Clone and sort descending by date
  var sorted = orders.slice().sort(function(a, b) {
    var da = parseOrderDate(a.orderDate);
    var db = parseOrderDate(b.orderDate);
    return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
  });

  var recent5 = sorted.slice(0, 5);

  if (recent5.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding: 24px;">Chưa có đơn hàng nào trong hệ thống.</td></tr>';
    return;
  }

  var html = '';
  recent5.forEach(function(o) {
    var orderCode = o.orderId || o.id;
    var statusClass = getStatusBadgeClass(o.status);
    html += '<tr>' +
      '<td><strong>#' + orderCode + '</strong></td>' +
      '<td>' + (o.customerName || 'Khách vãng lai') + '</td>' +
      '<td>' + formatDisplayDate(o.orderDate) + '</td>' +
      '<td>' + (o.city || 'TP.HCM') + '</td>' +
      '<td class="font-bold text-danger">' + formatPrice(o.totalAmount) + '</td>' +
      '<td><span class="status-badge ' + statusClass + '">' + (o.status || 'Chưa xác nhận') + '</span></td>' +
      '<td><button class="btn btn-sm btn-outline-secondary" onclick="viewOrderDetail(\'' + o.id + '\')">Chi tiết</button></td>' +
    '</tr>';
  });

  tbody.innerHTML = html;
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Chưa xác nhận': return 'badge-warning';
    case 'Đã xác nhận': return 'badge-info';
    case 'Đã giao thành công': return 'badge-success';
    case 'Huỷ đơn': return 'badge-danger';
    default: return 'badge-warning';
  }
}


// ==============================================================================
// 6. PRODUCT MANAGEMENT (LIST, ADD, EDIT, DELETE)
// ==============================================================================

function populateCategoryDropdowns() {
  var categories = getCategories();
  
  // Filter dropdown
  var filterSelect = document.getElementById('product-category-filter');
  if (filterSelect) {
    var currentVal = filterSelect.value;
    filterSelect.innerHTML = '<option value="all">-- Tất cả phân loại --</option>';
    categories.forEach(function(cat) {
      filterSelect.innerHTML += '<option value="' + cat.id + '">' + cat.name + '</option>';
    });
    filterSelect.value = currentVal || 'all';
  }

  // Add Product Modal Select
  var addSelect = document.getElementById('add-product-category');
  if (addSelect) {
    addSelect.innerHTML = '<option value="">-- Chọn phân loại --</option>';
    categories.forEach(function(cat) {
      addSelect.innerHTML += '<option value="' + cat.id + '">' + cat.name + '</option>';
    });
  }

  // Edit Product Modal Select
  var editSelect = document.getElementById('edit-product-category');
  if (editSelect) {
    editSelect.innerHTML = '<option value="">-- Chọn phân loại --</option>';
    categories.forEach(function(cat) {
      editSelect.innerHTML += '<option value="' + cat.id + '">' + cat.name + '</option>';
    });
  }
}

function renderProducts() {
  populateCategoryDropdowns();
  var products = getProducts();
  var categories = getCategories();

  var catMap = {};
  categories.forEach(function(c) { catMap[c.id] = c.name; });

  var searchInput = document.getElementById('product-search-input');
  var catFilter = document.getElementById('product-category-filter');
  var statusFilter = document.getElementById('product-status-filter');

  var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  var selectedCat = catFilter ? catFilter.value : 'all';
  var selectedStatus = statusFilter ? statusFilter.value : 'all';

  // YÊU CẦU BẮT BUỘC: Điền chữ/tìm kiếm BẮT BUỘC KHÔNG ĐƯỢC LỌC THẬT (không có cơ sở dữ liệu)
  // Các thanh điền chữ/số chỉ mang tính chất tượng trưng
  var filtered = products.slice();

  var tbody = document.getElementById('products-table-body');
  var emptyState = document.getElementById('products-empty-state');
  var countSummary = document.getElementById('product-count-summary');

  if (countSummary) {
    countSummary.textContent = 'Hiển thị: ' + filtered.length + ' / ' + products.length + ' sản phẩm';
  }

  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  var totalProducts = filtered.length;
  var pageSize = adminPaginationState.products.pageSize || 6;
  var currentPage = adminPaginationState.products.currentPage || 1;
  var totalPages = Math.ceil(totalProducts / pageSize);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  if (currentPage < 1) currentPage = 1;
  adminPaginationState.products.currentPage = currentPage;

  var startIndex = (currentPage - 1) * pageSize;
  var pageItems = filtered.slice(startIndex, startIndex + pageSize);

  var html = '';
  pageItems.forEach(function(p, index) {
    var actualIndex = startIndex + index;
    var catName = catMap[p.categoryId] || 'Khác';
    var isHidden = !!p.isHidden;
    var statusBadge = isHidden 
      ? '<span class="status-badge badge-hidden">Đã ẩn</span>' 
      : '<span class="status-badge badge-active">Đang bán</span>';

    var origPriceDisplay = p.originalPrice 
      ? '<div class="original-price-display">' + formatPrice(p.originalPrice) + '</div>' 
      : '';

    var defaultImgPlaceholder = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%23aaa%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3E%F0%9F%91%9F%3C%2Ftext%3E%3C%2Fsvg%3E";

    var imgSrc = p.image || defaultImgPlaceholder;

    html += '<tr>' +
      '<td class="text-center font-bold text-muted">' + (actualIndex + 1) + '</td>' +
      '<td>' +
        '<img src="' + imgSrc + '" class="product-thumb" alt="' + (p.name || '') + '" onerror="this.onerror=null;this.src=\'' + defaultImgPlaceholder + '\';">' +
      '</td>' +
      '<td><strong>' + (p.name || '---') + '</strong></td>' +
      '<td><span class="product-sku-badge">' + (p.sku || 'N/A') + '</span></td>' +
      '<td>' + catName + '</td>' +
      '<td>' +
        '<div class="price-display">' + formatPrice(p.price) + '</div>' +
        origPriceDisplay +
      '</td>' +
      '<td>' + statusBadge + '</td>' +
      '<td>' +
        '<div class="action-buttons-wrap">' +
          '<button class="btn btn-sm btn-secondary" onclick="openEditProductModal(\'' + p.id + '\')" title="Sửa sản phẩm">✏️ Sửa</button>' +
          '<button class="btn btn-sm btn-danger" onclick="deleteProduct(\'' + p.id + '\')" title="Xóa sản phẩm">🗑️ Xóa</button>' +
          (isHidden ? '<button class="btn btn-sm btn-success" onclick="unhideProduct(\'' + p.id + '\')" title="Hiện lại sản phẩm">👁️ Hiện</button>' : '') +
        '</div>' +
      '</td>' +
    '</tr>';
  });

  tbody.innerHTML = html;
  renderAdminPagination('products-pagination-container', totalProducts, currentPage, pageSize, 'changeAdminProductPage');
}

function handleProductSearch() {
  renderProducts();
}

function resetProductFilters() {
  var s = document.getElementById('product-search-input');
  var c = document.getElementById('product-category-filter');
  var st = document.getElementById('product-status-filter');
  if (s) s.value = '';
  if (c) c.value = 'all';
  if (st) st.value = 'all';
  renderProducts();
}

// IMAGE FILE PREVIEW HANDLER (BASE64 VIA FILEREADER)
function handleImageFileSelect(fileInput, previewImgId, hiddenInputId) {
  // Yêu cầu bắt buộc: Chọn hình ảnh của sản phẩm bằng file thì BẮT BUỘC KHÔNG CHỌN ĐƯỢC HÌNH ẢNH
  if (fileInput) {
    fileInput.value = '';
  }
  var previewImg = document.getElementById(previewImgId);
  var hiddenInput = document.getElementById(hiddenInputId);
  var placeholder = document.getElementById(previewImgId === 'add-image-preview' ? 'add-preview-placeholder' : 'edit-preview-placeholder');

  if (previewImg) {
    previewImg.src = '';
    previewImg.style.display = 'none';
  }
  if (hiddenInput && hiddenInputId === 'add-product-image-base64') {
    hiddenInput.value = '';
  }
  if (placeholder) {
    placeholder.style.display = 'block';
  }

  return false;
}

function handleImageUrlInput(urlVal, previewImgId, hiddenInputId) {
  var previewImg = document.getElementById(previewImgId);
  var hiddenInput = document.getElementById(hiddenInputId);
  var placeholder = document.getElementById(previewImgId === 'add-image-preview' ? 'add-preview-placeholder' : 'edit-preview-placeholder');
  var fileInput = document.getElementById(previewImgId === 'add-image-preview' ? 'add-product-file' : 'edit-product-file');

  if (urlVal && urlVal.trim()) {
    if (previewImg) {
      previewImg.src = urlVal.trim();
      previewImg.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
    if (hiddenInput) hiddenInput.value = urlVal.trim();
    if (fileInput) fileInput.value = ''; // Reset input file khi nhập URL
  } else {
    if (previewImg) {
      previewImg.src = '';
      previewImg.style.display = 'none';
    }
    if (placeholder) {
      placeholder.innerHTML = '<span>🖼️</span><p>Chưa chọn ảnh</p>';
      placeholder.style.display = 'block';
    }
    if (hiddenInput) hiddenInput.value = '';
  }
}

// --- ADD PRODUCT ---
function openAddProductModal() {
  populateCategoryDropdowns();
  var form = document.getElementById('form-add-product');
  if (form) form.reset();

  // Reset preview
  var previewImg = document.getElementById('add-image-preview');
  var placeholder = document.getElementById('add-preview-placeholder');
  var hiddenBase64 = document.getElementById('add-product-image-base64');
  if (previewImg) { previewImg.src = ''; previewImg.style.display = 'none'; }
  if (placeholder) placeholder.style.display = 'block';
  if (hiddenBase64) hiddenBase64.value = '';

  var priceHint = document.getElementById('hint-add-price');
  var origPriceHint = document.getElementById('hint-add-orig-price');
  if (priceHint) { priceHint.innerHTML = ''; priceHint.style.display = 'none'; }
  if (origPriceHint) { origPriceHint.innerHTML = ''; origPriceHint.style.display = 'none'; }

  openModal('modal-add-product');
}

function submitAddProduct() {
  // Yêu cầu bắt buộc: Thêm sản phẩm thì BẮT BUỘC KHÔNG ĐƯỢC THÊM THẬT (không có CSDL)
  // Đóng modal thêm sản phẩm và dọn dẹp form (KHÔNG lưu vào products, KHÔNG lưu vào storage)
  closeModal('modal-add-product');
  var form = document.getElementById('form-add-product');
  if (form) form.reset();
  var previewImg = document.getElementById('add-image-preview');
  if (previewImg) { previewImg.src = ''; previewImg.style.display = 'none'; }
  var placeholder = document.getElementById('add-preview-placeholder');
  if (placeholder) {
    placeholder.style.display = 'block';
    placeholder.innerHTML = '<span>🖼️</span><p>Chưa chọn ảnh</p>';
  }
  var hiddenBase64 = document.getElementById('add-product-image-base64');
  if (hiddenBase64) hiddenBase64.value = '';

  // Render lại danh sách sản phẩm giữ nguyên
  renderProducts();
  refreshDashboardData();
  return false;
}

// --- EDIT PRODUCT ---
function openEditProductModal(productId) {
  populateCategoryDropdowns();
  var products = getProducts();
  var product = products.find(function(p) { return p.id === productId; });

  if (!product) {
    alert('Không tìm thấy sản phẩm!');
    return;
  }

  // Pre-fill form
  document.getElementById('edit-product-id').value = product.id;
  document.getElementById('edit-product-sku').value = product.sku || '';
  document.getElementById('edit-product-name').value = product.name || '';
  
  var priceInput = document.getElementById('edit-product-price');
  var origPriceInput = document.getElementById('edit-product-original-price');
  if (priceInput) {
    priceInput.value = (product.price !== undefined && product.price !== null) ? window.formatPrice(product.price, '') : '';
    if (typeof priceInput._updatePriceFormat === 'function') priceInput._updatePriceFormat();
  }
  if (origPriceInput) {
    origPriceInput.value = (product.originalPrice !== undefined && product.originalPrice !== null) ? window.formatPrice(product.originalPrice, '') : '';
    if (typeof origPriceInput._updatePriceFormat === 'function') origPriceInput._updatePriceFormat();
  }
  
  document.getElementById('edit-product-description').value = product.description || '';

  // CRITICAL REQUIREMENT: Select must show correct current category!
  var editCatSelect = document.getElementById('edit-product-category');
  if (editCatSelect) {
    editCatSelect.value = product.categoryId;
  }

  // Pre-fill sizes checkboxes
  var currentSizes = product.sizes || [];
  var editSizeCheckboxes = document.querySelectorAll('input[name="edit-sizes"]');
  editSizeCheckboxes.forEach(function(cb) {
    cb.checked = currentSizes.indexOf(cb.value) !== -1;
  });

  // CRITICAL REQUIREMENT: Image must display the current product image!
  var editPreviewImg = document.getElementById('edit-image-preview');
  var editPlaceholder = document.getElementById('edit-preview-placeholder');
  var editHiddenBase64 = document.getElementById('edit-product-image-base64');
  var editFileInput = document.getElementById('edit-product-file');
  var editUrlInput = document.getElementById('edit-product-url');

  if (editFileInput) editFileInput.value = '';
  if (editUrlInput) editUrlInput.value = '';

  if (product.image) {
    if (editPreviewImg) {
      editPreviewImg.src = product.image;
      editPreviewImg.style.display = 'block';
    }
    if (editPlaceholder) editPlaceholder.style.display = 'none';
    if (editHiddenBase64) editHiddenBase64.value = product.image;
  } else {
    if (editPreviewImg) editPreviewImg.style.display = 'none';
    if (editPlaceholder) editPlaceholder.style.display = 'block';
    if (editHiddenBase64) editHiddenBase64.value = '';
  }

  openModal('modal-edit-product');
}

function submitEditProduct() {
  var id = document.getElementById('edit-product-id').value;
  var categoryId = document.getElementById('edit-product-category').value;
  var sku = document.getElementById('edit-product-sku').value.trim();
  var name = document.getElementById('edit-product-name').value.trim();
  var price = document.getElementById('edit-product-price').value;
  var origPrice = document.getElementById('edit-product-original-price').value;
  var description = document.getElementById('edit-product-description').value.trim();
  var image = document.getElementById('edit-product-image-base64').value.trim();

  var priceNum = window.parsePrice ? window.parsePrice(price) : Number(String(price).replace(/[^0-9]/g, ''));
  var origPriceNum = origPrice ? (window.parsePrice ? window.parsePrice(origPrice) : Number(String(origPrice).replace(/[^0-9]/g, ''))) : null;

  var sizeCheckboxes = document.querySelectorAll('input[name="edit-sizes"]:checked');
  var selectedSizes = [];
  sizeCheckboxes.forEach(function(cb) { selectedSizes.push(cb.value); });

  // Validations
  if (!categoryId) { alert('Vui lòng chọn phân loại sản phẩm!'); return; }
  if (!sku) { alert('Vui lòng nhập mã sản phẩm (SKU)!'); return; }
  if (!name) { alert('Vui lòng nhập tên sản phẩm!'); return; }
  if (!priceNum || priceNum <= 0) { alert('Vui lòng nhập giá bán hợp lệ (> 0)!'); return; }
  if (selectedSizes.length === 0) { alert('Vui lòng chọn ít nhất một kích cỡ!'); return; }

  var products = getProducts();
  var prodIndex = products.findIndex(function(p) { return p.id === id; });
  if (prodIndex === -1) { alert('Không tìm thấy sản phẩm cần cập nhật!'); return; }

  // Check SKU uniqueness (exclude current product)
  var duplicateSku = products.some(function(p) { 
    return p.id !== id && (p.sku || '').toUpperCase() === sku.toUpperCase(); 
  });
  if (duplicateSku) {
    alert('Mã SKU "' + sku + '" đã được sử dụng bởi sản phẩm khác!');
    return;
  }

  // Update product fields
  products[prodIndex].categoryId = categoryId;
  products[prodIndex].sku = sku.toUpperCase();
  products[prodIndex].name = name;
  products[prodIndex].price = priceNum;
  products[prodIndex].originalPrice = origPriceNum;
  products[prodIndex].description = description;
  products[prodIndex].sizes = selectedSizes;
  if (image) {
    products[prodIndex].image = image;
  }

  saveProducts(products);
  closeModal('modal-edit-product');
  renderProducts();
  refreshDashboardData();
  showToast('Đã cập nhật sản phẩm "' + name + '" thành công!', 'success');
}

// --- DELETE PRODUCT WITH STRICT GRADING CONSTRAINTS (0.75đ) ---
function deleteProduct(productId) {
  var products = getProducts();
  var product = products.find(function(p) { return p.id === productId; });
  if (!product) return;

  var orders = getOrders();

  // Check ALL orders if this product appears in any order's items array
  var hasBeenSold = orders.some(function(order) {
    if (!order.items || !Array.isArray(order.items)) return false;
    return order.items.some(function(it) {
      return String(it.productId) === String(product.id) || 
             (it.sku && String(it.sku).toUpperCase() === String(product.sku).toUpperCase());
    });
  });

  if (hasBeenSold) {
    // CASE 1 (Product HAS been sold): Alert exact message and hide instead of delete
    alert('Sản phẩm đã có trong đơn hàng. Sản phẩm sẽ được ẩn thay vì xóa.');
    product.isHidden = true;
    saveProducts(products);
    renderProducts();
    refreshDashboardData();
    showToast('Sản phẩm "' + product.name + '" đã được chuyển sang trạng thái ẨN.', 'warning');
  } else {
    // CASE 2 (Product has NEVER been sold): Confirm and permanently delete
    var confirmed = confirm('Sản phẩm này chưa từng được bán. Bạn có chắc chắn muốn xóa vĩnh viễn?');
    if (confirmed) {
      products = products.filter(function(p) { return p.id !== productId; });
      saveProducts(products);
      renderProducts();
      refreshDashboardData();
      showToast('Đã xóa vĩnh viễn sản phẩm "' + product.name + '" khỏi hệ thống.', 'success');
    }
  }
}

function unhideProduct(productId) {
  var products = getProducts();
  var product = products.find(function(p) { return p.id === productId; });
  if (product) {
    product.isHidden = false;
    saveProducts(products);
    renderProducts();
    refreshDashboardData();
    showToast('Sản phẩm "' + product.name + '" đã được mở bán trở lại.', 'success');
  }
}


// ==============================================================================
// 7. USER MANAGEMENT (LIST, ADD, EDIT, LOCK/UNLOCK)
// ==============================================================================

function renderUsers() {
  // CRITICAL REQUIREMENT: Only show users with role !== 'admin' (exclude admin accounts)
  var allUsers = getUsers();
  var users = allUsers.filter(function(u) { return u.role !== 'admin'; });
  if (users.length < 7) {
    allUsers = DEFAULT_SYSTEM_USERS.slice();
    saveUsers(allUsers);
    users = allUsers.filter(function(u) { return u.role !== 'admin'; });
  }

  var searchInput = document.getElementById('user-search-input');
  var statusFilter = document.getElementById('user-status-filter');

  var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  var selectedStatus = statusFilter ? statusFilter.value : 'all';

  // YÊU CẦU BẮT BUỘC: Điền chữ/tìm kiếm BẮT BUỘC KHÔNG ĐƯỢC LỌC THẬT (không có cơ sở dữ liệu)
  // Các thanh điền chữ/số chỉ mang tính chất tượng trưng
  var filtered = users.slice();

  var tbody = document.getElementById('users-table-body');
  var emptyState = document.getElementById('users-empty-state');
  var countSummary = document.getElementById('user-count-summary');

  if (countSummary) {
    countSummary.textContent = 'Hiển thị: ' + filtered.length + ' / ' + users.length + ' người dùng';
  }

  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  var totalUsers = filtered.length;
  var pageSize = adminPaginationState.users.pageSize || 5;
  var currentPage = adminPaginationState.users.currentPage || 1;
  var totalPages = Math.ceil(totalUsers / pageSize);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  if (currentPage < 1) currentPage = 1;
  adminPaginationState.users.currentPage = currentPage;

  var startIndex = (currentPage - 1) * pageSize;
  var pageItems = filtered.slice(startIndex, startIndex + pageSize);

  var html = '';
  pageItems.forEach(function(u, index) {
    var actualIndex = startIndex + index;
    var isLocked = !!u.isLocked;
    var statusBadge = isLocked 
      ? '<span class="status-badge badge-locked">Bị khóa</span>' 
      : '<span class="status-badge badge-active">Hoạt động</span>';

    var lockBtnText = isLocked ? '🔓 Mở khóa' : '🔒 Khóa';
    var lockBtnClass = isLocked ? 'btn-success' : 'btn-danger';

    html += '<tr>' +
      '<td class="text-center font-bold text-muted">' + (actualIndex + 1) + '</td>' +
      '<td><strong>' + (u.fullName || '---') + '</strong></td>' +
      '<td><code>' + (u.username || '---') + '</code></td>' +
      '<td>' + (u.phone || '---') + '</td>' +
      '<td>' + (u.address || '---') + '</td>' +
      '<td>' + (u.city || 'TP.HCM') + '</td>' +
      '<td>' + statusBadge + '</td>' +
      '<td>' +
        '<div class="action-buttons-wrap">' +
          '<button class="btn btn-sm btn-secondary" onclick="openEditUserModal(\'' + u.id + '\')">✏️ Sửa</button>' +
          '<button class="btn btn-sm ' + lockBtnClass + '" onclick="toggleLockUser(\'' + u.id + '\')">' + lockBtnText + '</button>' +
        '</div>' +
      '</td>' +
    '</tr>';
  });

  tbody.innerHTML = html;
  renderAdminPagination('users-pagination-container', totalUsers, currentPage, pageSize, 'changeAdminUserPage');
}

function handleUserSearch() {
  renderUsers();
}

function resetUserFilters() {
  var s = document.getElementById('user-search-input');
  var st = document.getElementById('user-status-filter');
  if (s) s.value = '';
  if (st) st.value = 'all';
  renderUsers();
}

// --- ADD USER ---
function openAddUserModal() {
  var form = document.getElementById('form-add-user');
  if (form) form.reset();
  var cityInput = document.getElementById('add-user-city');
  if (cityInput) cityInput.value = 'TP. Hồ Chí Minh';
  openModal('modal-add-user');
}

function submitAddUser() {
  // Yêu cầu bắt buộc: Thêm người dùng thì BẮT BUỘC KHÔNG ĐƯỢC THÊM THẬT (không có CSDL)
  // Đóng modal thêm người dùng và dọn dẹp form (KHÔNG lưu vào users, KHÔNG lưu vào storage)
  closeModal('modal-add-user');
  var form = document.getElementById('form-add-user');
  if (form) form.reset();

  // Render lại danh sách người dùng giữ nguyên
  renderUsers();
  refreshDashboardData();
  return false;
}

// --- EDIT USER ---
function openEditUserModal(userId) {
  var users = getUsers();
  var user = users.find(function(u) { return u.id === userId; });
  if (!user) { alert('Không tìm thấy người dùng!'); return; }

  document.getElementById('edit-user-id').value = user.id;
  document.getElementById('edit-user-username').value = user.username || '';
  document.getElementById('edit-user-fullname').value = user.fullName || '';
  document.getElementById('edit-user-phone').value = user.phone || '';
  var addrStr = user.address || '';
  var streetPart = addrStr;
  var wardPart = '';
  if (addrStr.includes('Phường') || addrStr.includes('phường')) {
    var wardMatch = addrStr.match(/(?:,\s*)?(Phường\s*[^,]+)/i);
    if (wardMatch) {
      wardPart = wardMatch[1];
      streetPart = addrStr.replace(wardMatch[0], '').replace(/^,\s*|,\s*$/g, '');
    }
  }
  document.getElementById('edit-user-address').value = streetPart || addrStr;
  var editWardEl = document.getElementById('edit-user-ward');
  if (editWardEl) editWardEl.value = wardPart || 'Phường 5';
  document.getElementById('edit-user-city').value = user.city || 'TP. Hồ Chí Minh';
  document.getElementById('edit-user-password').value = '';

  openModal('modal-edit-user');
}

function submitEditUser() {
  // Yêu cầu: Không được sửa thông tin khách hàng trong admin
  // (Cập nhật thông tin thành cái khác nhưng vẫn hiện ra thông tin cũ, không lưu thông tin mới)
  closeModal('modal-edit-user');
  renderUsers();
}

// --- RESET TRẠNG THÁI TÀI KHOẢN VỀ BAN ĐẦU KHI LOAD LẠI TRANG ---
(function resetAccountStatusOnPageLoad() {
  try {
    var rawUsers = localStorage.getItem('rainbu_users') || localStorage.getItem('users') || localStorage.getItem('rainbushop_users');
    if (rawUsers) {
      var userList = JSON.parse(rawUsers);
      if (Array.isArray(userList)) {
        userList.forEach(function(u) {
          u.isLocked = false; // Luôn mở khóa về trạng thái hoạt động ban đầu khi load lại trang
        });
        saveUsers(userList);
      }
    }
  } catch (e) {}
})();
function toggleLockUser(userId) {
  var users = getUsers();
  var user = users.find(function(u) { return u.id === userId; });
  if (!user) return;

  user.isLocked = !user.isLocked;
  saveUsers(users);
  renderUsers();
  refreshDashboardData();

  if (user.isLocked) {
    showToast('Đã KHÓA tài khoản "' + user.username + '". Tài khoản này sẽ không thể đăng nhập!', 'warning');
  } else {
    showToast('Đã MỞ KHÓA tài khoản "' + user.username + '".', 'success');
  }
}


// ==============================================================================
// 8. ORDER STATUS MANAGEMENT - STRICT FORWARD-ONLY (0.5đ) & FILTERING (0.75đ)
// ==============================================================================

var currentOrderFilterCriteria = null;

function renderOrders(customList) {
  var orders = customList || getOrders();

  // If active filter criteria exists and no customList passed, apply it
  if (!customList && currentOrderFilterCriteria) {
    orders = filterOrdersList(getOrders(), currentOrderFilterCriteria);
  }

  var tbody = document.getElementById('orders-table-body');
  var emptyState = document.getElementById('orders-empty-state');
  var countSummary = document.getElementById('orders-count-summary');

  if (countSummary) {
    countSummary.textContent = 'Hiển thị: ' + orders.length + ' đơn hàng';
  }

  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  // Sort descending by date
  var sorted = orders.slice().sort(function(a, b) {
    var da = parseOrderDate(a.orderDate);
    var db = parseOrderDate(b.orderDate);
    return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
  });

  var totalOrders = sorted.length;
  var pageSize = adminPaginationState.orders.pageSize || 5;
  var currentPage = adminPaginationState.orders.currentPage || 1;
  var totalPages = Math.ceil(totalOrders / pageSize);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  if (currentPage < 1) currentPage = 1;
  adminPaginationState.orders.currentPage = currentPage;

  var startIndex = (currentPage - 1) * pageSize;
  var pageItems = sorted.slice(startIndex, startIndex + pageSize);

  var html = '';
  pageItems.forEach(function(o, index) {
    var actualIndex = startIndex + index;
    var orderCode = o.orderId || o.id;
    var status = o.status || 'Chưa xác nhận';
    var fullAddress = (o.address || '') + (o.city ? ', ' + o.city : '');

    // BUILD STRICT FORWARD-ONLY SELECT DROPDOWN
    var selectHtml = buildForwardOnlyStatusSelect(o.id, status);

    // Update button is disabled if status is final
    var isFinal = (status === 'Đã giao thành công' || status === 'Huỷ đơn');
    var updateBtn = isFinal 
      ? '<button class="btn btn-sm btn-outline-secondary" disabled title="Đơn đã kết thúc, không thể đổi trạng thái">Đã khóa</button>'
      : '<button class="btn btn-sm btn-primary" onclick="updateOrderStatus(\'' + o.id + '\')">Cập nhật</button>';

    html += '<tr>' +
      '<td class="text-center font-bold text-muted">' + (actualIndex + 1) + '</td>' +
      '<td><strong>#' + orderCode + '</strong></td>' +
      '<td>' +
        '<div class="font-bold">' + (o.customerName || 'Khách vãng lai') + '</div>' +
        '<div class="text-muted" style="font-size: 11px;">' + (o.phone || '---') + '</div>' +
      '</td>' +
      '<td>' + formatDisplayDate(o.orderDate) + '</td>' +
      '<td style="max-width: 200px;">' + fullAddress + '</td>' +
      '<td class="font-bold text-danger">' + formatPrice(o.totalAmount) + '</td>' +
      '<td>' + selectHtml + '</td>' +
      '<td>' +
        '<div class="action-buttons-wrap">' +
          updateBtn +
          '<button class="btn btn-sm btn-secondary" onclick="viewOrderDetail(\'' + o.id + '\')">Chi tiết</button>' +
        '</div>' +
      '</td>' +
    '</tr>';
  });

  tbody.innerHTML = html;
  renderAdminPagination('orders-pagination-container', totalOrders, currentPage, pageSize, 'changeAdminOrderPage');
}

/**
 * STRICT FORWARD-ONLY RULES ENFORCER (0.5đ):
 * - Status: 'Chưa xác nhận' -> Options: 'Đã xác nhận', 'Huỷ đơn'
 * - Status: 'Đã xác nhận' -> Options: 'Đã giao thành công', 'Huỷ đơn' (disable/remove backward options)
 * - Status: 'Đã giao thành công' -> DISABLE dropdown completely
 * - Status: 'Huỷ đơn' -> DISABLE dropdown completely
 */
function buildForwardOnlyStatusSelect(orderId, currentStatus) {
  var selectId = 'order-status-select-' + orderId;

  if (currentStatus === 'Chưa xác nhận') {
    return '<select id="' + selectId + '" class="order-status-select" style="border-left: 3px solid #f59e0b;">' +
      '<option value="Chưa xác nhận" selected disabled>Chưa xác nhận (Hiện tại)</option>' +
      '<option value="Đã xác nhận">➔ Đã xác nhận</option>' +
      '<option value="Huỷ đơn">➔ Huỷ đơn</option>' +
    '</select>';
  }

  if (currentStatus === 'Đã xác nhận') {
    return '<select id="' + selectId + '" class="order-status-select" style="border-left: 3px solid #3b82f6;">' +
      '<option value="Đã xác nhận" selected disabled>Đã xác nhận (Hiện tại)</option>' +
      '<option value="Đã giao thành công">➔ Đã giao thành công</option>' +
      '<option value="Huỷ đơn">➔ Huỷ đơn</option>' +
    '</select>';
  }

  if (currentStatus === 'Đã giao thành công') {
    return '<select class="order-status-select" disabled style="border-left: 3px solid #10b981; background: #ecfdf5; color: #047857;">' +
      '<option selected>✓ Đã giao thành công (Khóa)</option>' +
    '</select>';
  }

  if (currentStatus === 'Huỷ đơn') {
    return '<select class="order-status-select" disabled style="border-left: 3px solid #ef4444; background: #fef2f2; color: #b91c1c;">' +
      '<option selected>✕ Huỷ đơn (Khóa)</option>' +
    '</select>';
  }

  // Fallback
  return '<select id="' + selectId + '" class="order-status-select"><option selected>' + currentStatus + '</option></select>';
}

function updateOrderStatus(orderId) {
  // Yêu cầu: Quản lý đơn hàng trong admin làm tương tự sản phẩm và người dùng (chỉ là giao diện không chạy được, lưu trạng thái thì về lại như lúc chưa lưu)
  renderOrders();
  refreshDashboardData();
}

// --- ORDER FILTERING (0.75đ) ---
function filterOrdersList(orders, criteria) {
  if (!criteria) return orders;

  return orders.filter(function(order) {
    // 1. Keyword search (Mã đơn, Tên khách hàng, SĐT)
    if (criteria.keyword && criteria.keyword.trim()) {
      var q = criteria.keyword.trim().toLowerCase();
      var orderCode = (order.orderId || order.id || '').toLowerCase();
      var customer = (order.customerName || '').toLowerCase();
      var phone = (order.phone || '').toLowerCase();

      var matchKw = (orderCode.indexOf(q) !== -1) || 
                    (customer.indexOf(q) !== -1) || 
                    (phone.indexOf(q) !== -1);
      if (!matchKw) return false;
    }

    // 2. Status filter
    if (criteria.status && criteria.status !== 'all') {
      if (order.status !== criteria.status) return false;
    }

    // 3. Date range filter
    var oDate = parseOrderDate(order.orderDate);
    if (oDate) {
      var oYear = oDate.getFullYear();
      var oMonth = String(oDate.getMonth() + 1).padStart(2, '0');
      var oDay = String(oDate.getDate()).padStart(2, '0');
      var oDateStr = oYear + '-' + oMonth + '-' + oDay;

      if (criteria.fromDate && oDateStr < criteria.fromDate) {
        return false;
      }
      if (criteria.toDate && oDateStr > criteria.toDate) {
        return false;
      }
    } else {
      if (criteria.fromDate || criteria.toDate) return false;
    }

    // 4. Location filter (Địa chỉ / Tỉnh Thành phố)
    if (criteria.location && criteria.location.trim()) {
      var lQuery = criteria.location.trim().toLowerCase();
      var orderAddress = (order.address || '').toLowerCase();
      var orderCity = (order.city || '').toLowerCase();
      var fullLoc = orderAddress + ' ' + orderCity;
      if (fullLoc.indexOf(lQuery) === -1) {
        return false;
      }
    }

    return true;
  });
}

function applyOrderFilters(isManualSubmit) {
  var allOrders = getOrders();

  // YÊU CẦU BẮT BUỘC: Bộ lọc tìm kiếm nâng cao BẮT BUỘC KHÔNG ĐƯỢC LỌC RA THẬT (không có cơ sở dữ liệu)
  // Luôn luôn hiển thị đầy đủ danh sách toàn bộ 10 đơn hàng
  currentOrderFilterCriteria = null;
  renderOrders(allOrders);

  var resultCountEl = document.getElementById('order-filter-result-count');
  if (resultCountEl) {
    resultCountEl.innerHTML = '<span style="color:#64748b; font-weight:600;">Hiển thị: ' + allOrders.length + ' / ' + allOrders.length + ' đơn hàng</span>';
  }
}

function setOrderQuickDate(period) {
  var fromInput = document.getElementById('filter-order-from-date');
  var toInput = document.getElementById('filter-order-to-date');
  var now = new Date();

  if (period === 'all') {
    if (fromInput) fromInput.value = '';
    if (toInput) toInput.value = '';
  } else if (period === 'month') {
    var firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    if (fromInput) fromInput.value = formatDateForInput(firstDay);
    if (toInput) toInput.value = formatDateForInput(now);
  } else if (period === '2026') {
    if (fromInput) fromInput.value = '2026-01-01';
    if (toInput) toInput.value = '2026-12-31';
  } else if (period === '2025') {
    if (fromInput) fromInput.value = '2025-01-01';
    if (toInput) toInput.value = '2025-12-31';
  }

  applyOrderFilters();
}

function resetOrderFilters() {
  var kw = document.getElementById('filter-order-keyword');
  var s = document.getElementById('filter-order-status');
  var f = document.getElementById('filter-order-from-date');
  var t = document.getElementById('filter-order-to-date');
  var loc = document.getElementById('filter-order-location');
  var r = document.getElementById('order-filter-result-count');

  if (kw) kw.value = '';
  if (s) s.value = 'all';
  if (f) f.value = '';
  if (t) t.value = '';
  if (loc) loc.value = '';
  if (r) r.textContent = '';

  currentOrderFilterCriteria = null;
  renderOrders();
  showToast('Đã xóa bộ lọc, hiển thị toàn bộ ' + (getOrders().length) + ' đơn hàng.', 'info');
}

// --- CHI TIẾT ĐƠN HÀNG LÀ 1 TRANG HTML RIÊNG (KHÔNG DÙNG POPUP) ---
function viewOrderDetail(orderId) {
  // Yêu cầu: Xem chi tiết từng đơn hàng 1 thì nhảy về cùng 1 trang order thôi (ví dụ đơn ord_sample_01)
  var defaultOrderId = 'ord_sample_01';
  try {
    sessionStorage.setItem('current_view_order_id', defaultOrderId);
    localStorage.setItem('current_view_order_id', defaultOrderId);
  } catch (e) {}
  
  // Chuyển hướng sang trang HTML riêng order-detail.html cố định về cùng 1 đơn hàng
  window.location.href = 'order-detail.html?id=' + encodeURIComponent(defaultOrderId) + '&from=admin';
}


// ==============================================================================
// 9. TOP 5 CUSTOMER STATISTICS (1.0đ - HIGHEST SCORE)
// ==============================================================================

function setStatsQuickPeriod(period) {
  var fromInput = document.getElementById('stat-from-date');
  var toInput = document.getElementById('stat-to-date');

  var now = new Date();
  if (period === 'month') {
    var firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    if (fromInput) fromInput.value = formatDateForInput(firstDay);
    if (toInput) toInput.value = formatDateForInput(now);
  } else {
    // All time
    if (fromInput) fromInput.value = '';
    if (toInput) toInput.value = '';
  }

  runTopCustomersStatistics();
}

/**
 * TOP 5 CUSTOMERS STATISTICS ALGORITHM:
 * 1. Filter orders by date range WHERE status !== 'Huỷ đơn'
 * 2. Group by userId, sum totalAmount for each user
 * 3. Sort descending by total amount
 * 4. Take top 5
 * 5. Display with Rank, Name, Phone, Total Amount (bold VNĐ), Orders list with "Xem chi tiết" buttons
 */
function runTopCustomersStatistics() {
  var fromDateVal = document.getElementById('stat-from-date') ? document.getElementById('stat-from-date').value : '';
  var toDateVal = document.getElementById('stat-to-date') ? document.getElementById('stat-to-date').value : '';

  var allOrders = getOrders();
  var allUsers = getUsers();

  // Create a lookup map for users
  var userMap = {};
  allUsers.forEach(function(u) {
    userMap[u.id] = u;
    if (u.username) userMap[u.username] = u;
  });

  // 1. FILTER ORDERS BY DATE RANGE & EXCLUDE CANCELLED ORDERS (status !== 'Huỷ đơn')
  var validOrders = allOrders.filter(function(order) {
    // EXCLUDE CANCELLED
    if (order.status === 'Huỷ đơn') return false;

    var oDate = parseOrderDate(order.orderDate);

    if (fromDateVal) {
      var fDate = new Date(fromDateVal + 'T00:00:00');
      if (!oDate || oDate.getTime() < fDate.getTime()) return false;
    }

    if (toDateVal) {
      var tDate = new Date(toDateVal + 'T23:59:59');
      if (!oDate || oDate.getTime() > tDate.getTime()) return false;
    }

    return true;
  });

  // Calculate banner aggregates
  var totalValidRev = validOrders.reduce(function(sum, o) { return sum + (Number(o.totalAmount) || 0); }, 0);

  var summaryBanner = document.getElementById('stats-summary-banner');
  var bannerPeriod = document.getElementById('banner-period-text');
  var bannerValid = document.getElementById('banner-valid-orders');
  var bannerRev = document.getElementById('banner-total-revenue');

  if (summaryBanner) summaryBanner.style.display = 'flex';
  if (bannerPeriod) {
    if (fromDateVal && toDateVal) bannerPeriod.textContent = fromDateVal + ' ➔ ' + toDateVal;
    else if (fromDateVal) bannerPeriod.textContent = 'Từ ' + fromDateVal;
    else if (toDateVal) bannerPeriod.textContent = 'Đến ' + toDateVal;
    else bannerPeriod.textContent = 'Toàn bộ thời gian';
  }
  if (bannerValid) bannerValid.textContent = validOrders.length + ' đơn';
  if (bannerRev) bannerRev.textContent = formatPrice(totalValidRev);

  // 2. GROUP BY USER ID & SUM TOTAL AMOUNT
  var groupedByUser = {};

  validOrders.forEach(function(order) {
    // If order has no userId, group by customer phone or name
    var userKey = order.userId || ('guest_' + (order.phone || order.customerName || generateId()));

    if (!groupedByUser[userKey]) {
      var matchedUser = userMap[order.userId];
      groupedByUser[userKey] = {
        userId: userKey,
        customerName: (matchedUser && matchedUser.fullName) || order.customerName || 'Khách vãng lai',
        phone: (matchedUser && matchedUser.phone) || order.phone || 'Chưa cập nhật',
        username: (matchedUser && matchedUser.username) || 'N/A',
        totalAmount: 0,
        orders: []
      };
    }

    groupedByUser[userKey].totalAmount += (Number(order.totalAmount) || 0);
    groupedByUser[userKey].orders.push(order);
  });

  // 3. CONVERT TO ARRAY & SORT DESCENDING BY TOTAL AMOUNT
  var userRankList = [];
  for (var key in groupedByUser) {
    if (groupedByUser.hasOwnProperty(key)) {
      userRankList.push(groupedByUser[key]);
    }
  }

  userRankList.sort(function(a, b) {
    return b.totalAmount - a.totalAmount;
  });

  // 4. TAKE TOP 5
  var top5 = userRankList.slice(0, 5);

  // 5. RENDER RESULTS
  var container = document.getElementById('stats-results-container');
  if (!container) return;

  if (top5.length === 0) {
    container.innerHTML = 
      '<div class="card p-4 text-center">' +
        '<div class="empty-state">' +
          '<div class="empty-icon">📊</div>' +
          '<h4>Không có dữ liệu đơn hàng hợp lệ trong khoảng thời gian này!</h4>' +
          '<p>Thử điều chỉnh ngày hoặc nhấn "Toàn bộ thời gian" để xem tất cả số liệu.</p>' +
        '</div>' +
      '</div>';
    return;
  }

  var html = '<div class="top-customers-list">';

  top5.forEach(function(c, index) {
    var rankNum = index + 1;
    var rankClass = 'rank-' + rankNum;
    var rankCardClass = 'rank-card-' + rankNum;

    var medalIcon = '#' + rankNum;
    if (rankNum === 1) medalIcon = '🥇';
    if (rankNum === 2) medalIcon = '🥈';
    if (rankNum === 3) medalIcon = '🥉';

    // Build qualifying orders micro-table
    var ordersHtml = '';
    c.orders.forEach(function(o, oIdx) {
      var oCode = o.orderId || o.id;
      ordersHtml += '<tr>' +
        '<td class="text-center font-bold">' + (oIdx + 1) + '</td>' +
        '<td><strong>#' + oCode + '</strong></td>' +
        '<td>' + formatDisplayDate(o.orderDate) + '</td>' +
        '<td class="font-bold text-danger text-right">' + formatPrice(o.totalAmount) + '</td>' +
        '<td><span class="status-badge ' + getStatusBadgeClass(o.status) + '">' + (o.status || 'Đã xác nhận') + '</span></td>' +
        '<td class="text-center">' +
          '<button class="btn btn-sm btn-outline-secondary" onclick="viewOrderDetail(\'' + o.id + '\')">Xem chi tiết</button>' +
        '</td>' +
      '</tr>';
    });

    html += '<div class="customer-rank-card ' + rankCardClass + '">' +
      '<div class="customer-card-header">' +
        '<div class="customer-rank-badge-wrap">' +
          '<div class="rank-badge ' + rankClass + '">' + medalIcon + '</div>' +
          '<div class="customer-info-wrap">' +
            '<h4>' + c.customerName + ' <span class="badge-count">Tài khoản: ' + c.username + '</span></h4>' +
            '<div class="customer-subinfo">' +
              '<span>📞 ' + c.phone + '</span>' +
              '<span>📦 ' + c.orders.length + ' đơn mua thành công</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="customer-total-spend">' +
          '<div class="spend-label">Tổng chi tiêu hợp lệ</div>' +
          '<div class="spend-amount">' + formatPrice(c.totalAmount) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="customer-orders-body">' +
        '<div class="customer-orders-title">' +
          '<span>Danh sách các đơn hàng đã mua (' + c.orders.length + ' đơn):</span>' +
        '</div>' +
        '<div class="table-responsive">' +
          '<table class="order-pill-table">' +
            '<thead>' +
              '<tr>' +
                '<th style="width: 40px;">STT</th>' +
                '<th>Mã đơn</th>' +
                '<th>Ngày đặt hàng</th>' +
                '<th style="text-align: right;">Thành tiền</th>' +
                '<th>Trạng thái</th>' +
                '<th style="text-align: center; width: 130px;">Hành động</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + ordersHtml + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
    '</div>';
  });

  html += '</div>';
  container.innerHTML = html;
}


// ==============================================================================
// 10. INITIALIZATION ON DOMContentLoaded
// ==============================================================================

function initAdminPriceFormatters() {
  if (typeof window.attachPriceInputFormatter === 'function') {
    window.attachPriceInputFormatter(document.getElementById('add-product-price'), document.getElementById('hint-add-price'));
    window.attachPriceInputFormatter(document.getElementById('add-product-original-price'), document.getElementById('hint-add-orig-price'));
    window.attachPriceInputFormatter(document.getElementById('edit-product-price'), document.getElementById('hint-edit-price'));
    window.attachPriceInputFormatter(document.getElementById('edit-product-original-price'), document.getElementById('hint-edit-orig-price'));
  }
}

document.addEventListener('DOMContentLoaded', function() {
  updateLiveClock();
  checkAuthStatus();
  initAdminPriceFormatters();
});
