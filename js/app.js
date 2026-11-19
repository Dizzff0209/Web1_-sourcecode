/**
 * ==========================================================================
 * RAINBUSHOP - Customer Facing Application Logic
 * Pure Vanilla JavaScript (ES6)
 * ==========================================================================
 */

(function () {
  'use strict';

  // ================= FALLBACK DATA HELPER SAFEGUARDS =================
  if (typeof window.formatPrice !== 'function') {
    window.formatPrice = function (num, unit) {
      unit = (unit !== undefined) ? unit : '₫';
      if (num === undefined || num === null || num === '') return '0' + unit;
      var clean = typeof num === 'number' ? num : parseFloat(String(num).replace(/[^0-9.-]/g, ''));
      if (isNaN(clean)) return '0' + unit;
      var isNeg = clean < 0;
      var formatted = Math.round(Math.abs(clean)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return (isNeg ? '-' : '') + formatted + (unit ? (unit.startsWith(' ') || unit === '₫' || unit === 'đ' ? unit : ' ' + unit) : '');
    };
  }

  if (typeof window.parsePrice !== 'function') {
    window.parsePrice = function (value) {
      if (value === undefined || value === null || value === '') return 0;
      if (typeof value === 'number') return isNaN(value) ? 0 : Math.round(value);
      var cleanStr = String(value).replace(/[^0-9.-]/g, '');
      var num = parseFloat(cleanStr);
      return isNaN(num) ? 0 : Math.round(num);
    };
  }

  if (typeof window.generateId !== 'function') {
    window.generateId = function () {
      return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    };
  }

  if (typeof window.getProducts !== 'function') {
    window.getProducts = function () {
      try {
        const d = localStorage.getItem('rainbu_products');
        return d ? JSON.parse(d) : [];
      } catch (e) { return []; }
    };
  }

  if (typeof window.saveProducts !== 'function') {
    window.saveProducts = function (arr) {
      localStorage.setItem('rainbu_products', JSON.stringify(arr));
    };
  }

  if (typeof window.getCategories !== 'function') {
    window.getCategories = function () {
      try {
        const d = localStorage.getItem('rainbu_categories');
        return d ? JSON.parse(d) : [];
      } catch (e) { return []; }
    };
  }

  if (typeof window.getUsers !== 'function') {
    window.getUsers = function () {
      try {
        const d = localStorage.getItem('rainbu_users');
        return d ? JSON.parse(d) : [];
      } catch (e) { return []; }
    };
  }

  if (typeof window.saveUsers !== 'function') {
    window.saveUsers = function (arr) {
      localStorage.setItem('rainbu_users', JSON.stringify(arr));
    };
  }

  if (typeof window.getOrders !== 'function') {
    window.getOrders = function () {
      try {
        const d = localStorage.getItem('rainbu_orders');
        return d ? JSON.parse(d) : [];
      } catch (e) { return []; }
    };
  }

  if (typeof window.saveOrders !== 'function') {
    window.saveOrders = function (arr) {
      localStorage.setItem('rainbu_orders', JSON.stringify(arr));
    };
  }

  if (typeof window.getCart !== 'function') {
    window.getCart = function () {
      try {
        const d = localStorage.getItem('rainbu_cart');
        return d ? JSON.parse(d) : [];
      } catch (e) { return []; }
    };
  }

  if (typeof window.saveCart !== 'function') {
    window.saveCart = function (arr) {
      localStorage.setItem('rainbu_cart', JSON.stringify(arr));
    };
  }

  if (typeof window.getCurrentUser !== 'function') {
    window.getCurrentUser = function () {
      try {
        const d = localStorage.getItem('rainbu_current_user');
        return d ? JSON.parse(d) : null;
      } catch (e) { return null; }
    };
  }

  if (typeof window.setCurrentUser !== 'function') {
    window.setCurrentUser = function (user) {
      if (!user) localStorage.removeItem('rainbu_current_user');
      else localStorage.setItem('rainbu_current_user', JSON.stringify(user));
    };
  }

  if (typeof window.logout !== 'function') {
    window.logout = function () {
      localStorage.removeItem('rainbu_current_user');
    };
  }

  // ================= APPLICATION STATE =================
  const state = {
    currentCategory: 'all',
    basicSearchQuery: '',
    advFilter: {
      keyword: '',
      categoryId: 'all',
      minPrice: null,
      maxPrice: null
    },
    isAdvFilterActive: false,
    sortBy: 'default',
    currentPage: 1,
    itemsPerPage: 8,
    sliderIndex: 0,
    sliderTimer: null,
    pendingCheckoutAfterLogin: false,
    selectedDetailSize: null,
    selectedDetailQty: 1,
    activeDetailProduct: null
  };

  // Fallback image SVG in case network images are unavailable
  const FALLBACK_IMAGE_SVG = "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20400%22%3E%3Crect%20fill%3D%22%23222%22%20width%3D%22400%22%20height%3D%22400%22%2F%3E%3Ccircle%20cx%3D%22200%22%20cy%3D%22200%22%20r%3D%22120%22%20fill%3D%22none%22%20stroke%3D%22%23e53935%22%20stroke-width%3D%228%22%2F%3E%3Ctext%20fill%3D%22%23fff%22%20font-family%3D%22sans-serif%22%20font-size%3D%2224%22%20font-weight%3D%22bold%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ERAINBUSHOP%3C%2Ftext%3E%3C%2Fsvg%3E";

  // ================= MAIN INITIALIZATION =================
  document.addEventListener('DOMContentLoaded', function () {
    initHeroSlider();
    initHeaderScroll();
    initNavigation();
    initSearch();
    initAdvancedSearch();
    initSort();
    initUserArea();
    initModals();
    initForms();

    // Render initial data
    renderProducts();
    updateCartUI();

    // Export public app API to window for inline HTML onclick handlers
    window.app = {
      filterByCategory,
      quickViewProduct,
      addToCartFromCard,
      changePage,
      openModal,
      closeModal,
      switchToLogin,
      switchToRegister,
      openCart,
      closeCart,
      updateCartItemQuantity,
      removeCartItem,
      openCheckout,
      handleAddressTypeChange,
      handlePaymentMethodChange,
      submitOrder,
      openOrderHistory,
      openSizeGuide,
      showPolicyModal,
      resetAllFilters,
      handleLogout,
      toggleUserDropdown,
      openUserProfileModal,
      saveUserProfile
    };
  });

  // ================= HERO SLIDER =================
  function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const sliderContainer = document.getElementById('hero-slider');

    if (!slides.length) return;

    function goToSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;

      slides.forEach(function (s, i) {
        s.classList.toggle('active', i === index);
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === index);
      });
      state.sliderIndex = index;
    }

    function startAutoSlide() {
      stopAutoSlide();
      state.sliderTimer = setInterval(function () {
        goToSlide(state.sliderIndex + 1);
      }, 4000);
    }

    function stopAutoSlide() {
      if (state.sliderTimer) {
        clearInterval(state.sliderTimer);
        state.sliderTimer = null;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goToSlide(state.sliderIndex - 1);
        startAutoSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goToSlide(state.sliderIndex + 1);
        startAutoSlide();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const idx = parseInt(this.getAttribute('data-index'), 10);
        goToSlide(idx);
        startAutoSlide();
      });
    });

    if (sliderContainer) {
      sliderContainer.addEventListener('mouseenter', stopAutoSlide);
      sliderContainer.addEventListener('mouseleave', startAutoSlide);
    }

    startAutoSlide();
  }

  // ================= HEADER SCROLL & MOBILE MENU =================
  function initHeaderScroll() {
    const header = document.getElementById('site-header');
    window.addEventListener('scroll', function () {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    const mobileBtn = document.getElementById('btn-mobile-menu');
    const navMenu = document.getElementById('main-nav');
    if (mobileBtn && navMenu) {
      mobileBtn.addEventListener('click', function () {
        navMenu.classList.toggle('mobile-open');
      });
    }
  }

  // ================= NAVIGATION & CATEGORY FILTERING =================
  function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        const categoryId = this.getAttribute('data-category');
        if (!categoryId) return; // Cho phép các link điều hướng thông thường (như order-detail.html)
        e.preventDefault();
        filterByCategory(categoryId);

        // Update active class
        navLinks.forEach(function (l) { l.classList.remove('active'); });
        this.classList.add('active');

        // Close mobile nav if open
        const navMenu = document.getElementById('main-nav');
        if (navMenu) navMenu.classList.remove('mobile-open');
      });
    });
  }

  function filterByCategory(categoryId) {
    state.currentCategory = categoryId;
    state.currentPage = 1;

    // Reset basic search and advanced filter when clicking direct category nav
    state.basicSearchQuery = '';
    const searchInput = document.getElementById('header-search-input');
    const searchClear = document.getElementById('btn-header-search-clear');
    if (searchInput) searchInput.value = '';
    if (searchClear) searchClear.style.display = 'none';

    state.isAdvFilterActive = false;
    hideAdvancedSearchPanel();

    // Update active nav styling
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(function (link) {
      if (link.getAttribute('data-category') === categoryId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    renderProducts();

    // Scroll smoothly to products section if clicked from hero or footer
    const productSection = document.getElementById('product-section');
    if (productSection && window.scrollY > 400) {
      productSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ================= BASIC SEARCH =================
  function initSearch() {
    const searchInput = document.getElementById('header-search-input');
    const searchForm = document.getElementById('header-search-form');
    const searchClear = document.getElementById('btn-header-search-clear');

    if (!searchInput) return;

    // YÊU CẦU BẮT BUỘC: Thanh tìm kiếm bình thường trong index.html KHÔNG CHẠY ĐƯỢC, KHÔNG TÌM KIẾM ĐƯỢC THIỆT
    // Người dùng gõ chữ bình thường nhưng không thực hiện tìm kiếm / không lọc sản phẩm thiệt
    searchInput.addEventListener('input', function () {
      const q = searchInput.value;
      if (searchClear) {
        searchClear.style.display = q ? 'block' : 'none';
      }
    });

    if (searchForm) {
      searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        // Không chạy lọc / không tìm kiếm thật
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', function () {
        searchInput.value = '';
        searchClear.style.display = 'none';
        searchInput.focus();
      });
    }
  }

  // ================= ADVANCED SEARCH =================
  function initAdvancedSearch() {
    const toggleBtn = document.getElementById('btn-toggle-adv-search');
    const closeBtn = document.getElementById('btn-close-adv-search');
    const advPanel = document.getElementById('advanced-search-panel');
    const advForm = document.getElementById('adv-search-form');
    const resetBtn = document.getElementById('btn-adv-reset');
    const clearCurrentFilterBtn = document.getElementById('btn-clear-current-filter');

    // Attach live currency formatters to price inputs
    const minPriceInput = document.getElementById('adv-min-price');
    const minPriceHint = document.getElementById('hint-adv-min-price');
    const maxPriceInput = document.getElementById('adv-max-price');
    const maxPriceHint = document.getElementById('hint-adv-max-price');

    if (typeof window.attachPriceInputFormatter === 'function') {
      window.attachPriceInputFormatter(minPriceInput, minPriceHint);
      window.attachPriceInputFormatter(maxPriceInput, maxPriceHint);
    }

    if (toggleBtn && advPanel) {
      toggleBtn.addEventListener('click', function () {
        const isHidden = advPanel.style.display === 'none' || !advPanel.style.display;
        if (isHidden) {
          showAdvancedSearchPanel();
        } else {
          hideAdvancedSearchPanel();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', hideAdvancedSearchPanel);
    }

    if (advForm) {
      advForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const kw = document.getElementById('adv-keyword').value.trim();
        const cat = document.getElementById('adv-category').value;
        const minP = document.getElementById('adv-min-price').value.trim();
        const maxP = document.getElementById('adv-max-price').value.trim();

        const parseP = function(val) {
          if (!val) return null;
          if (typeof window.parsePrice === 'function') return window.parsePrice(val);
          const n = parseFloat(String(val).replace(/[^0-9]/g, ''));
          return isNaN(n) ? null : n;
        };

        state.advFilter.keyword = kw;
        state.advFilter.categoryId = cat;
        state.advFilter.minPrice = parseP(minP);
        state.advFilter.maxPrice = parseP(maxP);
        state.isAdvFilterActive = true;
        state.basicSearchQuery = ''; // clear basic search

        // Clear header basic search input
        const headerSearchInput = document.getElementById('header-search-input');
        if (headerSearchInput) headerSearchInput.value = '';

        state.currentPage = 1;
        renderProducts();

        const productSection = document.getElementById('product-section');
        if (productSection) productSection.scrollIntoView({ behavior: 'smooth' });
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        resetAdvForm();
        state.isAdvFilterActive = false;
        state.currentPage = 1;
        renderProducts();
      });
    }

    if (clearCurrentFilterBtn) {
      clearCurrentFilterBtn.addEventListener('click', function () {
        resetAllFilters();
      });
    }
  }

  function showAdvancedSearchPanel() {
    const advPanel = document.getElementById('advanced-search-panel');
    const toggleBtn = document.getElementById('btn-toggle-adv-search');
    if (advPanel) advPanel.style.display = 'block';
    if (toggleBtn) toggleBtn.classList.add('active');
  }

  function hideAdvancedSearchPanel() {
    const advPanel = document.getElementById('advanced-search-panel');
    const toggleBtn = document.getElementById('btn-toggle-adv-search');
    if (advPanel) advPanel.style.display = 'none';
    if (toggleBtn) toggleBtn.classList.remove('active');
  }

  function resetAdvForm() {
    const kw = document.getElementById('adv-keyword');
    const cat = document.getElementById('adv-category');
    const minP = document.getElementById('adv-min-price');
    const maxP = document.getElementById('adv-max-price');
    const minHint = document.getElementById('hint-adv-min-price');
    const maxHint = document.getElementById('hint-adv-max-price');
    if (kw) kw.value = '';
    if (cat) cat.value = 'all';
    if (minP) minP.value = '';
    if (maxP) maxP.value = '';
    if (minHint) { minHint.innerHTML = ''; minHint.style.display = 'none'; }
    if (maxHint) { maxHint.innerHTML = ''; maxHint.style.display = 'none'; }
    state.advFilter = { keyword: '', categoryId: 'all', minPrice: null, maxPrice: null };
  }

  function resetAllFilters() {
    state.currentCategory = 'all';
    state.basicSearchQuery = '';
    state.isAdvFilterActive = false;
    resetAdvForm();
    hideAdvancedSearchPanel();

    const searchInput = document.getElementById('header-search-input');
    const searchClear = document.getElementById('btn-header-search-clear');
    if (searchInput) searchInput.value = '';
    if (searchClear) searchClear.style.display = 'none';

    // Update active nav styling
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('data-category') === 'all');
    });

    state.currentPage = 1;
    renderProducts();
  }

  // ================= SORTING =================
  function initSort() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        state.sortBy = this.value;
        state.currentPage = 1;
        renderProducts();
      });
    }
  }

  // ================= PRODUCT FILTERING & RENDERING =================
  function getFilteredProducts() {
    const allProducts = window.getProducts() || [];

    // Rule: Hidden products are always excluded
    let products = allProducts.filter(function (p) {
      return !p.isHidden;
    });

    // 1. If Advanced Filter is active
    // YÊU CẦU BẮT BUỘC: Tìm kiếm nâng cao CŨNG KHÔNG ĐƯỢC LỌC THIỆT, chỉ có mấy thanh điền chữ số tượng trưng thôi
    if (state.isAdvFilterActive) {
      // BẮT BUỘC KHÔNG ĐƯỢC LỌC THẬT: Giữ nguyên toàn bộ danh sách sản phẩm hiển thị tượng trưng
    }
    // 2. Otherwise apply Basic Search (if any)
    else if (state.basicSearchQuery) {
      // BẮT BUỘC KHÔNG ĐƯỢC LỌC THẬT: Thanh điền chữ chỉ mang tính chất tượng trưng, giữ nguyên toàn bộ sản phẩm
    }
    // 3. Otherwise apply Category filter
    else if (state.currentCategory !== 'all') {
      products = products.filter(function (p) {
        return p.categoryId === state.currentCategory;
      });
    }

    // Apply Sorting
    products.sort(function (a, b) {
      if (state.sortBy === 'price-asc') {
        return a.price - b.price;
      } else if (state.sortBy === 'price-desc') {
        return b.price - a.price;
      } else if (state.sortBy === 'name-asc') {
        return a.name.localeCompare(b.name, 'vi');
      }
      return 0; // default order
    });

    return products;
  }

  function renderProducts() {
    const grid = document.getElementById('product-grid');
    const emptyState = document.getElementById('empty-state');
    const countDisplay = document.getElementById('product-count-display');
    const sectionTitle = document.getElementById('section-title');
    const activeFilterBadge = document.getElementById('active-filter-badge');
    const activeFilterText = document.getElementById('active-filter-text');

    if (!grid) return;

    const filtered = getFilteredProducts();
    const totalCount = filtered.length;

    // Update section title & count display
    const categories = window.getCategories() || [];
    const catObj = categories.find(function (c) { return c.id === state.currentCategory; });

    if (state.isAdvFilterActive) {
      sectionTitle.textContent = 'KẾT QUẢ TÌM KIẾM NÂNG CAO';
      activeFilterBadge.style.display = 'inline-flex';
      
      let filterDetails = [];
      if (state.advFilter.keyword) filterDetails.push('"' + state.advFilter.keyword + '"');
      if (catObj && catObj.id !== 'all') filterDetails.push(catObj.name);
      if (state.advFilter.minPrice !== null && state.advFilter.maxPrice !== null) {
        filterDetails.push('Giá: ' + window.formatPrice(state.advFilter.minPrice) + ' - ' + window.formatPrice(state.advFilter.maxPrice));
      } else if (state.advFilter.minPrice !== null) {
        filterDetails.push('Giá từ: ' + window.formatPrice(state.advFilter.minPrice));
      } else if (state.advFilter.maxPrice !== null) {
        filterDetails.push('Giá đến: ' + window.formatPrice(state.advFilter.maxPrice));
      }
      
      activeFilterText.textContent = 'Hiển thị: ' + totalCount + ' sản phẩm' + (filterDetails.length ? ' (' + filterDetails.join(' • ') + ')' : '');
    } else if (state.basicSearchQuery) {
      sectionTitle.textContent = 'KẾT QUẢ TÌM KIẾM: "' + state.basicSearchQuery + '"';
      activeFilterBadge.style.display = 'inline-flex';
      activeFilterText.textContent = 'Từ khóa: "' + state.basicSearchQuery + '"';
    } else {
      sectionTitle.textContent = catObj ? catObj.name.toUpperCase() : 'TẤT CẢ SẢN PHẨM';
      activeFilterBadge.style.display = 'none';
    }

    countDisplay.textContent = '(Hiển thị ' + totalCount + ' sản phẩm)';

    // Empty state handling
    if (totalCount === 0) {
      grid.innerHTML = '';
      emptyState.style.display = 'block';
      renderPagination(0, 1);
      return;
    }

    emptyState.style.display = 'none';

    // Pagination calculations (8 products per page)
    const totalPages = Math.ceil(totalCount / state.itemsPerPage);
    if (state.currentPage > totalPages) state.currentPage = totalPages;
    if (state.currentPage < 1) state.currentPage = 1;

    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const pageProducts = filtered.slice(startIndex, startIndex + state.itemsPerPage);

    // Build product card markup
    let html = '';
    pageProducts.forEach(function (product) {
      const pCat = categories.find(function (c) { return c.id === product.categoryId; });
      const catName = pCat ? pCat.name : 'Bóng Rổ';

      // Sale badge percentage
      let discountBadge = '';
      if (product.originalPrice && product.originalPrice > product.price) {
        const percent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        discountBadge = '<span class="sale-badge">-' + percent + '%</span>';
      }

      const origPriceHtml = (product.originalPrice && product.originalPrice > product.price)
        ? '<span class="price-original">' + window.formatPrice(product.originalPrice) + '</span>'
        : '';

      const safeImg = product.image || FALLBACK_IMAGE_SVG;

      html += `
        <div class="product-card" data-product-id="${product.id}">
          <div class="card-img-wrap" onclick="app.quickViewProduct('${product.id}')" style="cursor: pointer;">
            ${discountBadge}
            <img class="card-img" src="${safeImg}" alt="${escapeHtml(product.name)}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE_SVG}';">
          </div>
          <div class="card-body">
            <span class="card-category">${escapeHtml(catName)}</span>
            <h3 class="card-title" title="${escapeHtml(product.name)}" onclick="app.quickViewProduct('${product.id}')" style="cursor: pointer;">
              ${escapeHtml(product.name)}
            </h3>
            <div class="card-price-wrap">
              <span class="price-current">${window.formatPrice(product.price)}</span>
              ${origPriceHtml}
            </div>
            <div class="card-actions">
              <button type="button" class="btn-card-detail" onclick="app.quickViewProduct('${product.id}')">
                XEM CHI TIẾT
              </button>
              <button type="button" class="btn-card-add" onclick="app.addToCartFromCard('${product.id}')">
                THÊM VÀO GIỎ
              </button>
            </div>
          </div>
        </div>
      `;
    });

    grid.innerHTML = html;
    renderPagination(totalPages, state.currentPage);
  }

  // ================= PAGINATION =================
  function renderPagination(totalPages, currentPage) {
    const container = document.getElementById('pagination');
    if (!container) return;

    if (totalPages <= 0) {
      container.innerHTML = '';
      return;
    }

    let html = '';

    // Prev Button
    const prevDisabled = currentPage <= 1 ? 'disabled' : '';
    html += `
      <button class="page-btn prev" ${prevDisabled} onclick="app.changePage(${currentPage - 1})" aria-label="Trang trước">
        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
    `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        const activeClass = i === currentPage ? 'active' : '';
        html += `
          <button class="page-btn ${activeClass}" onclick="app.changePage(${i})">${i}</button>
        `;
      } else if (i === currentPage - 3 || i === currentPage + 3) {
        html += `<span class="page-ellipsis" style="padding: 0 4px; color: #888;">...</span>`;
      }
    }

    // Next Button
    const nextDisabled = currentPage >= totalPages ? 'disabled' : '';
    html += `
      <button class="page-btn next" ${nextDisabled} onclick="app.changePage(${currentPage + 1})" aria-label="Trang sau">
        <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    `;

    container.innerHTML = html;
  }

  function changePage(page) {
    state.currentPage = page;
    renderProducts();
    const productSection = document.getElementById('product-section');
    if (productSection) {
      productSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ================= PRODUCT DETAIL MODAL =================
  function quickViewProduct(productId) {
    const products = window.getProducts() || [];
    const product = products.find(function (p) { return p.id === productId; });
    if (!product) return;

    state.activeDetailProduct = product;
    state.selectedDetailQty = 1;

    const categories = window.getCategories() || [];
    const category = categories.find(function (c) { return c.id === product.categoryId; });
    const catName = category ? category.name : 'Bóng Rổ';

    // Sizes handling
    const sizes = Array.isArray(product.sizes) && product.sizes.length ? product.sizes : ['Freesize'];
    state.selectedDetailSize = sizes[0]; // default select first size

    let sizesHtml = '';
    sizes.forEach(function (size, idx) {
      const activeClass = idx === 0 ? 'active' : '';
      sizesHtml += `
        <button type="button" class="size-btn ${activeClass}" data-size="${escapeHtml(size)}" onclick="selectDetailSize(this)">
          ${escapeHtml(size)}
        </button>
      `;
    });

    // Discount percentage
    let discountTag = '';
    let origPriceHtml = '';
    if (product.originalPrice && product.originalPrice > product.price) {
      const percent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      discountTag = '<span class="detail-discount-tag">TIẾT KIỆM ' + percent + '%</span>';
      origPriceHtml = '<span class="detail-price-orig">' + window.formatPrice(product.originalPrice) + '</span>';
    }

    const safeImg = product.image || FALLBACK_IMAGE_SVG;

    const detailHtml = `
      <div class="detail-gallery">
        <div class="detail-main-img-wrap">
          <img class="detail-main-img" src="${safeImg}" alt="${escapeHtml(product.name)}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE_SVG}';">
        </div>
      </div>
      <div class="detail-info">
        <div class="detail-meta-row">
          <span class="detail-category-badge">${escapeHtml(catName)}</span>
          <span class="detail-sku">Mã SP: <strong>${escapeHtml(product.sku || 'N/A')}</strong></span>
        </div>
        <h2 class="detail-title">${escapeHtml(product.name)}</h2>
        <div class="detail-price-box">
          <span class="detail-price-current">${window.formatPrice(product.price)}</span>
          ${origPriceHtml}
          ${discountTag}
        </div>
        <div class="detail-desc">
          <p>${escapeHtml(product.description || 'Sản phẩm bóng rổ chính hãng cao cấp tại RainbuShop.')}</p>
        </div>
        <div class="detail-size-section">
          <div class="detail-size-header">
            <label>Chọn Kích Thước (Size):</label>
            <button type="button" class="btn-open-sizeguide" onclick="app.openSizeGuide()">Xem bảng size</button>
          </div>
          <div class="size-selector-grid" id="detail-size-selector">
            ${sizesHtml}
          </div>
        </div>
        <div class="detail-qty-section">
          <label>Số lượng:</label>
          <div class="qty-control">
            <button type="button" class="qty-btn" onclick="adjustDetailQty(-1)">&minus;</button>
            <input type="number" class="qty-input" id="detail-qty-input" value="1" min="1" max="99" readonly>
            <button type="button" class="qty-btn" onclick="adjustDetailQty(1)">&plus;</button>
          </div>
        </div>
        <div class="detail-actions">
          <button type="button" class="btn btn-primary btn-lg" onclick="addActiveProductToCart()">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            THÊM VÀO GIỎ
          </button>
          <button type="button" class="btn btn-outline-dark btn-lg" onclick="buyNowFromDetail()">
            MUA NGAY
          </button>
        </div>
      </div>
    `;

    const detailContainer = document.getElementById('product-detail-content');
    if (detailContainer) {
      detailContainer.innerHTML = detailHtml;
    }
    openModal('modal-product-detail');
  }

  window.selectDetailSize = function (btnElement) {
    const parent = btnElement.parentElement;
    parent.querySelectorAll('.size-btn').forEach(function (btn) {
      btn.classList.remove('active');
    });
    btnElement.classList.add('active');
    state.selectedDetailSize = btnElement.getAttribute('data-size');
  };

  window.adjustDetailQty = function (delta) {
    const input = document.getElementById('detail-qty-input');
    if (!input) return;
    let qty = parseInt(input.value, 10) || 1;
    qty += delta;
    if (qty < 1) qty = 1;
    if (qty > 99) qty = 99;
    input.value = qty;
    state.selectedDetailQty = qty;
  };

  window.addActiveProductToCart = function () {
    if (!state.activeDetailProduct) return;
    const p = state.activeDetailProduct;
    const size = state.selectedDetailSize || (p.sizes && p.sizes[0]) || 'Freesize';
    const qty = state.selectedDetailQty || 1;

    addItemToCart(p, size, qty);
    showToast('Đã thêm "' + p.name + '" (Size ' + size + ') vào giỏ hàng!', 'success');
    closeModal('modal-product-detail');
  };

  window.buyNowFromDetail = function () {
    if (!state.activeDetailProduct) return;
    const p = state.activeDetailProduct;
    const size = state.selectedDetailSize || (p.sizes && p.sizes[0]) || 'Freesize';
    const qty = state.selectedDetailQty || 1;

    addItemToCart(p, size, qty);
    closeModal('modal-product-detail');
    openCheckout();
  };

  // Add from product card button
  function addToCartFromCard(productId) {
    const products = window.getProducts() || [];
    const product = products.find(function (p) { return p.id === productId; });
    if (!product) return;

    // If product has sizes and more than 1 option, opening modal ensures customer picks the right fit
    if (product.sizes && product.sizes.length > 1) {
      quickViewProduct(productId);
      showToast('Vui lòng chọn size giày/áo phù hợp trước khi thêm vào giỏ!', 'info');
      return;
    }

    const defaultSize = (product.sizes && product.sizes[0]) || 'Freesize';
    addItemToCart(product, defaultSize, 1);
    showToast('Đã thêm "' + product.name + '" vào giỏ hàng!', 'success');
  }

  // ================= CART MANAGEMENT =================
  function addItemToCart(product, size, quantity) {
    // Yêu cầu bắt buộc: Thêm sản phẩm vào giỏ hàng thì BẮT BUỘC KHÔNG ĐƯỢC THÊM THIỆT
    // Không thêm sản phẩm vào mảng giỏ hàng, không lưu vào storage
    updateCartUI();
  }

  function updateCartUI() {
    const cart = window.getCart() || [];
    const badge = document.getElementById('cart-count-badge');
    const drawerCount = document.getElementById('cart-drawer-count');
    const body = document.getElementById('cart-sidebar-body');
    const subtotalDisplay = document.getElementById('cart-subtotal-display');
    const checkoutBtn = document.getElementById('btn-proceed-checkout');

    // Total quantity in cart
    const totalQty = cart.reduce(function (sum, item) { return sum + item.quantity; }, 0);
    const totalPrice = cart.reduce(function (sum, item) { return sum + (item.price * item.quantity); }, 0);

    if (badge) badge.textContent = totalQty;
    if (drawerCount) drawerCount.textContent = totalQty;
    if (subtotalDisplay) subtotalDisplay.textContent = window.formatPrice(totalPrice);

    if (!body) return;

    if (cart.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          </div>
          <p class="cart-empty-text">Giỏ hàng của bạn đang trống!</p>
          <button class="btn btn-primary" onclick="app.closeCart()">KHÁM PHÁ SẢN PHẨM</button>
        </div>
      `;
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;

    let itemsHtml = '';
    cart.forEach(function (item, index) {
      const safeImg = item.image || FALLBACK_IMAGE_SVG;
      itemsHtml += `
        <div class="cart-item-card">
          <img class="cart-item-thumb" src="${safeImg}" alt="${escapeHtml(item.productName)}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE_SVG}';">
          <div class="cart-item-details">
            <h4 class="cart-item-name">${escapeHtml(item.productName)}</h4>
            <span class="cart-item-size">Size: <strong>${escapeHtml(item.size)}</strong></span>
            <div class="cart-item-bottom">
              <span class="cart-item-price">${window.formatPrice(item.price)}</span>
              <div class="cart-item-qty">
                <button type="button" class="cart-item-qty-btn" onclick="app.updateCartItemQuantity(${index}, -1)">&minus;</button>
                <span class="cart-item-qty-val">${item.quantity}</span>
                <button type="button" class="cart-item-qty-btn" onclick="app.updateCartItemQuantity(${index}, 1)">&plus;</button>
              </div>
            </div>
          </div>
          <button type="button" class="cart-item-remove" onclick="app.removeCartItem(${index})" title="Xóa sản phẩm">&times;</button>
        </div>
      `;
    });

    body.innerHTML = itemsHtml;
  }

  function updateCartItemQuantity(index, delta) {
    const cart = window.getCart() || [];
    if (!cart[index]) return;

    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    window.saveCart(cart);
    updateCartUI();
  }

  function removeCartItem(index) {
    const cart = window.getCart() || [];
    if (!cart[index]) return;
    const removedName = cart[index].productName;
    cart.splice(index, 1);
    window.saveCart(cart);
    updateCartUI();
    showToast('Đã xóa "' + removedName + '" khỏi giỏ hàng', 'info');
  }

  function openCart() {
    updateCartUI();
    const overlay = document.getElementById('cart-sidebar-overlay');
    const drawer = document.getElementById('cart-sidebar');
    if (overlay) overlay.style.display = 'block';
    if (drawer) drawer.classList.add('open');
  }

  function closeCart() {
    const overlay = document.getElementById('cart-sidebar-overlay');
    const drawer = document.getElementById('cart-sidebar');
    if (overlay) overlay.style.display = 'none';
    if (drawer) drawer.classList.remove('open');
  }

  // ================= CHECKOUT & ORDER FLOW =================
  function openCheckout() {
    const cart = window.getCart() || [];
    if (cart.length === 0) {
      showToast('Giỏ hàng trống! Vui lòng chọn sản phẩm trước khi thanh toán.', 'warning');
      return;
    }

    // Requirement 7b: Login required before checkout!
    const currentUser = window.getCurrentUser();
    if (!currentUser) {
      state.pendingCheckoutAfterLogin = true;
      closeCart();
      showToast('Vui lòng đăng nhập để tiến hành đặt hàng.', 'info');
      openModal('modal-login');
      return;
    }

    closeCart();

    // Auto-fill customer name + phone
    const chkName = document.getElementById('chk-name');
    const chkPhone = document.getElementById('chk-phone');
    if (chkName) chkName.value = currentUser.fullName || '';
    if (chkPhone) chkPhone.value = currentUser.phone || '';

    // Set default address preview
    const addrPreview = document.getElementById('chk-default-address-preview');
    const fullDefaultAddr = [currentUser.address, currentUser.city].filter(Boolean).join(', ');
    if (addrPreview) {
      addrPreview.textContent = fullDefaultAddr || 'Chưa cập nhật địa chỉ tài khoản';
    }

    // Default to 'default' address radio
    const radioDefault = document.getElementById('radio-addr-default');
    if (radioDefault) radioDefault.checked = true;
    handleAddressTypeChange();

    // Default to COD payment
    handlePaymentMethodChange();

    // Render Order Summary in Checkout Modal
    renderCheckoutSummary(cart);

    openModal('modal-checkout');
  }

  function handleAddressTypeChange() {
    const isNew = document.getElementById('radio-addr-new')?.checked;
    const newFields = document.getElementById('chk-new-address-fields');
    if (newFields) {
      newFields.style.display = isNew ? 'block' : 'none';
    }
  }

  function handlePaymentMethodChange() {
    const isBanking = document.querySelector('input[name="chk-payment-method"]:checked')?.value === 'Banking';
    const bankPanel = document.getElementById('banking-info-panel');
    const syntaxPreview = document.getElementById('banking-syntax-preview');

    if (bankPanel) {
      bankPanel.style.display = isBanking ? 'block' : 'none';
    }

    if (isBanking && syntaxPreview) {
      const name = document.getElementById('chk-name')?.value.trim() || 'KHACH HANG';
      const phone = document.getElementById('chk-phone')?.value.trim() || '0909xxxxxx';
      syntaxPreview.textContent = `RAINBU ${removeVietnameseTones(name).toUpperCase()} ${phone}`;
    }
  }

  function renderCheckoutSummary(cart) {
    const container = document.getElementById('checkout-items-list');
    const subtotalEl = document.getElementById('chk-subtotal-val');
    const grandtotalEl = document.getElementById('chk-grandtotal-val');
    const errorMsg = document.getElementById('checkout-error-msg');

    if (errorMsg) errorMsg.style.display = 'none';
    if (!container) return;

    let itemsHtml = '';
    let total = 0;

    cart.forEach(function (item) {
      const itemSubtotal = item.price * item.quantity;
      total += itemSubtotal;
      const safeImg = item.image || FALLBACK_IMAGE_SVG;

      itemsHtml += `
        <div class="summary-item-row">
          <img class="summary-item-thumb" src="${safeImg}" alt="${escapeHtml(item.productName)}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE_SVG}';">
          <div class="summary-item-info">
            <div class="summary-item-name">${escapeHtml(item.productName)}</div>
            <div class="summary-item-size-qty">Size: ${escapeHtml(item.size)} | SL: ${item.quantity}</div>
          </div>
          <div class="summary-item-total">${window.formatPrice(itemSubtotal)}</div>
        </div>
      `;
    });

    container.innerHTML = itemsHtml;
    if (subtotalEl) subtotalEl.textContent = window.formatPrice(total);
    if (grandtotalEl) grandtotalEl.textContent = window.formatPrice(total);
  }

  function submitOrder() {
    const currentUser = window.getCurrentUser();
    if (!currentUser) {
      showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'error');
      openModal('modal-login');
      return;
    }

    const cart = window.getCart() || [];
    if (cart.length === 0) {
      showToast('Giỏ hàng trống, không thể đặt hàng!', 'error');
      closeModal('modal-checkout');
      return;
    }

    const errorMsg = document.getElementById('checkout-error-msg');
    const name = document.getElementById('chk-name')?.value.trim();
    const phone = document.getElementById('chk-phone')?.value.trim();
    const addrType = document.querySelector('input[name="chk-address-type"]:checked')?.value || 'default';
    const paymentMethod = document.querySelector('input[name="chk-payment-method"]:checked')?.value || 'COD';

    if (!name || !phone) {
      if (errorMsg) {
        errorMsg.textContent = 'Vui lòng nhập đầy đủ họ tên và số điện thoại người nhận.';
        errorMsg.style.display = 'block';
      }
      return;
    }

    let address = '';
    let city = '';

    if (addrType === 'default') {
      address = currentUser.address || '1283 Phạm Thế Hiển, Phường 5';
      city = currentUser.city || 'TP. Hồ Chí Minh';
    } else {
      const street = document.getElementById('chk-address')?.value.trim();
      const ward = document.getElementById('chk-ward')?.value.trim();
      city = document.getElementById('chk-city')?.value.trim();

      if (!street || !city) {
        if (errorMsg) {
          errorMsg.textContent = 'Vui lòng điền đầy đủ thông tin địa chỉ, phường và tỉnh/thành phố nhận hàng mới.';
          errorMsg.style.display = 'block';
        }
        return;
      }
      address = ward ? (street + ', ' + (ward.toLowerCase().startsWith('phường') ? ward : 'Phường ' + ward)) : street;
    }

    // Generate Order ID: ORD-YYYYMMDD-XXX
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const orderId = `ORD-${yyyy}${mm}${dd}-${randomSuffix}`;

    const totalAmount = cart.reduce(function (sum, item) {
      return sum + (item.price * item.quantity);
    }, 0);

    const formattedDate = `${yyyy}-${mm}-${dd} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Construct Order Object
    const newOrder = {
      id: window.generateId(),
      orderId: orderId,
      userId: currentUser.id,
      customerName: name,
      phone: phone,
      address: address,
      city: city,
      items: JSON.parse(JSON.stringify(cart)),
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      status: 'Chưa xác nhận',
      orderDate: formattedDate
    };

    // Save to orders array in localStorage
    const orders = window.getOrders() || [];
    orders.unshift(newOrder);
    window.saveOrders(orders);

    // Clear Cart
    window.saveCart([]);
    updateCartUI();

    // Close checkout modal
    closeModal('modal-checkout');

    // Yêu cầu: Chi tiết đơn hàng phải là 1 trang html riêng, không dùng popup
    try {
      sessionStorage.setItem('current_view_order_id', newOrder.id);
      localStorage.setItem('current_view_order_id', newOrder.id);
    } catch (e) {}

    showToast('Đặt hàng thành công! Mã đơn: ' + newOrder.orderId, 'success');

    // Chuyển hướng trực tiếp sang trang HTML riêng order-detail.html
    window.location.href = 'order-detail.html?id=' + encodeURIComponent(newOrder.id) + '&from=user&placed=1';
  }

  function showOrderConfirmationInvoice(order) {
    const container = document.getElementById('order-invoice-content');
    if (!container) return;

    let itemsTableRows = '';
    order.items.forEach(function (item) {
      const subtotal = item.price * item.quantity;
      itemsTableRows += `
        <tr>
          <td>
            <strong>${escapeHtml(item.productName)}</strong><br>
            <small style="color: #666;">Size: ${escapeHtml(item.size)}</small>
          </td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">${window.formatPrice(item.price)}</td>
          <td style="text-align: right; font-weight: bold;">${window.formatPrice(subtotal)}</td>
        </tr>
      `;
    });

    const fullAddress = [order.address, order.city].filter(Boolean).join(', ');

    container.innerHTML = `
      <div class="invoice-header-row">
        <div>
          <div>Mã đơn hàng:</div>
          <div class="invoice-code">${order.orderId}</div>
        </div>
        <div style="text-align: right;">
          <div>Ngày đặt:</div>
          <strong>${order.orderDate}</strong>
        </div>
      </div>
      <div class="invoice-customer-info">
        <div><strong>Người nhận:</strong> ${escapeHtml(order.customerName)} (${escapeHtml(order.phone)})</div>
        <div><strong>Địa chỉ:</strong> ${escapeHtml(fullAddress)}</div>
        <div><strong>Hình thức thanh toán:</strong> ${order.paymentMethod === 'Banking' ? 'Chuyển khoản ngân hàng' : 'Thanh toán tiền mặt khi nhận (COD)'}</div>
        <div><strong>Trạng thái đơn:</strong> <span class="status-badge status-unconfirmed">${order.status}</span></div>
      </div>
      <table class="invoice-table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th style="text-align: center;">SL</th>
            <th style="text-align: right;">Đơn giá</th>
            <th style="text-align: right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsTableRows}
        </tbody>
      </table>
      <div class="invoice-total-row">
        <span>Tổng số tiền:</span>
        <span class="text-primary">${window.formatPrice(order.totalAmount)}</span>
      </div>
    `;

    // Yêu cầu: Chi tiết đơn hàng phải là 1 trang html riêng, không dùng popup
    try {
      sessionStorage.setItem('current_view_order_id', order.id);
      localStorage.setItem('current_view_order_id', order.id);
    } catch (e) {}
    window.location.href = 'order-detail.html?id=' + encodeURIComponent(order.id || order.orderId) + '&from=user&placed=1';
  }

  // ================= ORDER HISTORY =================
  function openOrderHistory() {
    const currentUser = window.getCurrentUser();
    if (!currentUser) {
      showToast('Vui lòng đăng nhập để xem lịch sử mua hàng.', 'info');
      openModal('modal-login');
      return;
    }

    closeModal('modal-order-confirm');
    const container = document.getElementById('order-history-list');
    if (!container) return;

    const allOrders = window.getOrders() || [];
    // Filter orders belonging to currentUser
    const userOrders = allOrders.filter(function (ord) {
      return ord.userId === currentUser.id ||
             (ord.phone && ord.phone === currentUser.phone);
    });

    if (userOrders.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="border: none; padding: 40px 10px;">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <h3 class="empty-title">Bạn chưa có đơn hàng nào</h3>
          <p class="empty-desc">Các đơn hàng bạn đặt tại RainbuShop sẽ được lưu trữ và theo dõi chi tiết tại đây.</p>
          <button class="btn btn-primary" onclick="app.closeModal('modal-order-history')">MUA SẮM NGAY</button>
        </div>
      `;
    } else {
      let ordersHtml = '';
      userOrders.forEach(function (order) {
        let statusBadgeClass = 'status-unconfirmed';
        if (order.status === 'Đã xác nhận') statusBadgeClass = 'status-confirmed';
        else if (order.status === 'Đang giao hàng') statusBadgeClass = 'status-shipping';
        else if (order.status === 'Đã giao' || order.status === 'Hoàn thành' || order.status === 'Đã giao thành công') statusBadgeClass = 'status-delivered';
        else if (order.status === 'Đã hủy' || order.status === 'Huỷ đơn') statusBadgeClass = 'status-cancelled';

        let itemsRows = '';
        if (Array.isArray(order.items)) {
          order.items.forEach(function (item) {
            itemsRows += `
              <div class="order-history-item-row">
                <div>
                  <strong>${escapeHtml(item.productName)}</strong>
                  <span style="color: #666; font-size: 0.8rem; margin-left: 8px;">(Size: ${escapeHtml(item.size || 'N/A')})</span>
                </div>
                <div>
                  <span style="color: #666; margin-right: 12px;">x${item.quantity}</span>
                  <strong>${window.formatPrice(item.price * item.quantity)}</strong>
                </div>
              </div>
            `;
          });
        }

        const fullAddr = [order.address, order.city].filter(Boolean).join(', ');

        ordersHtml += `
          <div class="order-history-card">
            <div class="order-history-header">
              <div class="order-id-date">
                <span class="order-id-label">${escapeHtml(order.orderId || 'ORD')}</span>
                <span class="order-date-label">${escapeHtml(order.orderDate || '')}</span>
              </div>
              <span class="status-badge ${statusBadgeClass}">${escapeHtml(order.status || 'Chưa xác nhận')}</span>
            </div>
            <div class="order-history-content">
              <div class="order-history-items">
                ${itemsRows}
              </div>
              <div class="order-history-footer">
                <div class="order-history-address">
                  <strong>Địa chỉ:</strong> ${escapeHtml(fullAddr)} | <strong>PTTT:</strong> ${order.paymentMethod === 'Banking' ? 'Chuyển khoản' : 'COD'}
                </div>
                <div class="order-history-total">
                  ${window.formatPrice(order.totalAmount)}
                </div>
              </div>
              <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #e2e8f0; display: flex; justify-content: flex-end;">
                <a href="order-detail.html?id=${encodeURIComponent(order.id || order.orderId)}&from=user" class="btn btn-outline-primary btn-sm" style="text-decoration: none; display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">
                  📄 Xem chi tiết đơn hàng (Trang HTML riêng) →
                </a>
              </div>
            </div>
          </div>
        `;
      });

      container.innerHTML = ordersHtml;
    }

    openModal('modal-order-history');
  }

  // ================= USER AUTHENTICATION =================
  function initUserArea() {
    updateUserAreaUI();
  }

  function updateUserAreaUI() {
    const container = document.getElementById('header-user-area');
    if (!container) return;

    const currentUser = window.getCurrentUser();

    if (!currentUser) {
      container.innerHTML = `
        <button type="button" class="action-btn" onclick="app.openModal('modal-login')" title="Đăng nhập / Đăng ký">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span class="action-label">Tài khoản</span>
        </button>
      `;
    } else {
      const firstLetter = (currentUser.fullName || currentUser.username || 'U').charAt(0).toUpperCase();
      container.innerHTML = `
        <button type="button" class="user-profile-btn" onclick="app.toggleUserDropdown(event)" title="Tài khoản của bạn">
          <span class="user-avatar-badge">${firstLetter}</span>
          <span class="user-name-text">${escapeHtml(currentUser.fullName || currentUser.username)}</span>
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="user-dropdown-menu" id="user-dropdown-menu" style="display: none;">
          <div class="user-dropdown-header">
            <div class="user-name">${escapeHtml(currentUser.fullName)}</div>
            <div class="user-role">${currentUser.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</div>
          </div>
          ${currentUser.role === 'admin' ? `
          <a href="admin.html" class="user-dropdown-item" style="color: #e53935; font-weight: 600;">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Vào Trang Quản Trị
          </a>` : ''}
          <button type="button" class="user-dropdown-item" onclick="app.openUserProfileModal()">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Thông tin cá nhân
          </button>
          <a href="order-detail.html?from=user" class="user-dropdown-item" style="color: #2563eb; font-weight: 600;">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Chi tiết đơn hàng (Trang HTML riêng)
          </a>
          <button type="button" class="user-dropdown-item" onclick="app.openOrderHistory()">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Lịch sử mua hàng
          </button>
          <button type="button" class="user-dropdown-item" onclick="app.openSizeGuide()">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            Hướng dẫn chọn size
          </button>
          <div class="user-dropdown-divider"></div>
          <button type="button" class="user-dropdown-item text-danger" onclick="app.handleLogout()" style="cursor: pointer;">
            <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Đăng xuất
          </button>
        </div>
      `;
    }
  }

  function toggleUserDropdown(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('user-dropdown-menu');
    if (!dropdown) return;
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
  }

  // Close dropdown on click outside
  document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('user-dropdown-menu');
    const profileBtn = document.querySelector('.user-profile-btn');
    if (dropdown && !dropdown.contains(e.target) && (!profileBtn || !profileBtn.contains(e.target))) {
      dropdown.style.display = 'none';
    }
  });

  function openUserProfileModal() {
    const dropdown = document.getElementById('user-dropdown-menu');
    if (dropdown) dropdown.style.display = 'none';

    const currentUser = window.getCurrentUser();
    if (!currentUser) {
      openModal('modal-login');
      return;
    }

    const uInput = document.getElementById('profile-username');
    const nInput = document.getElementById('profile-fullname');
    const pInput = document.getElementById('profile-phone');
    const cInput = document.getElementById('profile-city');
    const aInput = document.getElementById('profile-address');

    if (uInput) uInput.value = currentUser.username || '';
    if (nInput) nInput.value = currentUser.fullName || '';
    if (pInput) pInput.value = currentUser.phone || '';
    if (cInput) cInput.value = currentUser.city || 'TP. Hồ Chí Minh';
    if (aInput) aInput.value = currentUser.address || '';

    openModal('modal-user-profile');
  }

  function saveUserProfile() {
    const currentUser = window.getCurrentUser();
    if (!currentUser) return;

    const fullName = document.getElementById('profile-fullname')?.value.trim() || currentUser.fullName;
    const phone = document.getElementById('profile-phone')?.value.trim() || currentUser.phone;
    const city = document.getElementById('profile-city')?.value.trim() || currentUser.city;
    const address = document.getElementById('profile-address')?.value.trim() || currentUser.address;

    currentUser.fullName = fullName;
    currentUser.phone = phone;
    currentUser.city = city;
    currentUser.address = address;

    // Save to users list
    const users = window.getUsers() || [];
    const idx = users.findIndex(function (u) {
      return (u.id === currentUser.id) || ((u.username || '').toLowerCase() === (currentUser.username || '').toLowerCase());
    });
    if (idx !== -1) {
      users[idx] = Object.assign({}, users[idx], currentUser);
      window.saveUsers(users);
    }

    // Save current user session
    window.setCurrentUser(currentUser);
    updateUserAreaUI();
    closeModal('modal-user-profile');
    showToast('Đã lưu cập nhật thông tin cá nhân thành công!', 'success');
  }

  function handleLogout() {
    const dropdown = document.getElementById('user-dropdown-menu');
    if (dropdown) dropdown.style.display = 'none';
    window.logout();
    updateUserAreaUI();
    showToast('Đã đăng xuất thành công!', 'info');
  }

  function initForms() {
    // LOGIN FORM (BỎ HẾT MỌI RÀNG BUỘC)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        const errorAlert = document.getElementById('login-error-msg');

        let username = usernameInput ? usernameInput.value.trim() : '';
        let password = passwordInput ? passwordInput.value : '';

        // Bỏ hết ràng buộc: Nếu để trống tự gán tài khoản mẫu
        if (!username) {
          username = 'nguyenvanan';
        }
        if (!password) {
          password = '123456';
        }

        const users = window.getUsers() || [];
        let found = users.find(function (u) {
          return (u.username || '').toLowerCase() === username.toLowerCase();
        });

        // Nếu người dùng chưa có tài khoản -> Tự động đăng ký luôn và đăng nhập, không báo lỗi
        if (!found) {
          found = {
            id: window.generateId('usr'),
            fullName: username,
            username: username,
            password: password,
            phone: '0901234567',
            address: '1283 Phạm Thế Hiển',
            city: 'TP. Hồ Chí Minh',
            role: 'user',
            isLocked: false
          };
          users.push(found);
          window.saveUsers(users);
        } else {
          // Rule 7b: Giữ kiểm tra isLocked để giảng viên test chức năng Khóa/Mở tài khoản
          if (found.isLocked) {
            if (errorAlert) {
              errorAlert.textContent = 'Tài khoản đã bị khóa bởi Quản trị viên!';
              errorAlert.style.display = 'block';
            }
            return;
          }
        }

        // Login success - không bắt buộc mật khẩu phải khớp
        window.setCurrentUser(found);
        updateUserAreaUI();
        closeModal('modal-login');
        showToast('Đăng nhập thành công! Chào mừng ' + (found.fullName || found.username), 'success');

        // Reset fields
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
        if (errorAlert) errorAlert.style.display = 'none';

        // If checkout was requested before login, resume to checkout
        if (state.pendingCheckoutAfterLogin) {
          state.pendingCheckoutAfterLogin = false;
          openCheckout();
        }
      });
    }

    // REGISTER FORM (BỎ HẾT MỌI RÀNG BUỘC)
    const regForm = document.getElementById('register-form');
    if (regForm) {
      regForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const errorAlert = document.getElementById('register-error-msg');

        let fullName = document.getElementById('reg-fullname')?.value.trim();
        let username = document.getElementById('reg-username')?.value.trim();
        let password = document.getElementById('reg-password')?.value;
        let phone = document.getElementById('reg-phone')?.value.trim();
        let city = document.getElementById('reg-city')?.value.trim();
        let address = document.getElementById('reg-address')?.value.trim();

        // Bỏ hết các ràng buộc: giá trị để trống tự nhận giá trị mặc định hợp lệ
        if (!username) {
          username = 'user_' + Math.floor(1000 + Math.random() * 9000);
        }
        if (!fullName) {
          fullName = username;
        }
        if (!password) {
          password = '123456';
        }
        if (!phone) {
          phone = '0901234567';
        }
        if (!city) {
          city = 'TP. Hồ Chí Minh';
        }
        if (!address) {
          address = '1283 Phạm Thế Hiển, TP. Hồ Chí Minh';
        }

        const users = window.getUsers() || [];
        let existingUser = users.find(function (u) {
          return (u.username || '').toLowerCase() === username.toLowerCase();
        });

        let targetUser;
        if (existingUser) {
          // Nếu đã tồn tại username thì cập nhật thông tin và đăng nhập luôn, không chặn
          existingUser.fullName = fullName || existingUser.fullName;
          existingUser.password = password || existingUser.password;
          existingUser.phone = phone || existingUser.phone;
          existingUser.address = address || existingUser.address;
          existingUser.city = city || existingUser.city;
          existingUser.role = 'user';
          targetUser = existingUser;
        } else {
          // Tạo user mới (role: 'user' đồng bộ)
          targetUser = {
            id: window.generateId('usr'),
            fullName: fullName,
            username: username,
            password: password,
            phone: phone,
            address: address,
            city: city,
            role: 'user',
            isLocked: false
          };
          users.push(targetUser);
        }

        window.saveUsers(users);

        // Auto login newly registered user
        window.setCurrentUser(targetUser);
        updateUserAreaUI();
        closeModal('modal-register');
        showToast('Đăng ký tài khoản thành công! Xin chào ' + targetUser.fullName, 'success');

        // Reset form
        regForm.reset();
        if (errorAlert) errorAlert.style.display = 'none';

        // If checkout pending
        if (state.pendingCheckoutAfterLogin) {
          state.pendingCheckoutAfterLogin = false;
          openCheckout();
        }
      });
    }

    // Open Cart Button
    const openCartBtn = document.getElementById('btn-open-cart');
    if (openCartBtn) {
      openCartBtn.addEventListener('click', openCart);
    }
  }

  function switchToRegister() {
    closeModal('modal-login');
    openModal('modal-register');
  }

  function switchToLogin() {
    closeModal('modal-register');
    openModal('modal-login');
  }

  // ================= GENERAL MODAL HELPERS =================
  function initModals() {
    // Click outside to close modals
    const overlays = document.querySelectorAll('.modal-overlay');
    overlays.forEach(function (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          closeModal(overlay.id);
        }
      });
    });

    // ESC key to close any active modal
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        overlays.forEach(function (overlay) {
          if (overlay.style.display === 'flex' || overlay.style.display === 'block') {
            closeModal(overlay.id);
          }
        });
        closeCart();
      }
    });
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'none';

    // Only restore scroll if no other modals are open
    const openModals = document.querySelectorAll('.modal-overlay[style*="display: flex"], .modal-overlay[style*="display: block"]');
    if (openModals.length === 0) {
      document.body.style.overflow = '';
    }
  }

  // ================= SIZE GUIDE & POLICIES =================
  function openSizeGuide() {
    openModal('modal-size-guide');
  }

  function showPolicyModal(type) {
    const titleEl = document.getElementById('policy-modal-title');
    const contentEl = document.getElementById('policy-modal-content');
    if (!titleEl || !contentEl) return;

    if (type === 'exchange') {
      titleEl.textContent = 'CHÍNH SÁCH ĐỔI TRẢ & HOÀN TIỀN';
      contentEl.innerHTML = `
        <p>RainbuShop hỗ trợ quý khách đổi size và đổi mẫu linh hoạt trong vòng <strong>07 ngày</strong> kể từ ngày nhận hàng với các điều kiện:</p>
        <ul>
          <li>Sản phẩm còn nguyên tem mác, hộp giày nguyên vẹn không móp méo hư hại.</li>
          <li>Đế giày chưa qua sử dụng ngoài sân bê tông, không dính đất cát bẩn.</li>
          <li>Khách hàng được thử size trên bề mặt thảm hoặc sàn nhà sạch.</li>
          <li>Hỗ trợ đổi size miễn phí nếu lỗi do nhân viên tư vấn sai form chân.</li>
        </ul>
        <p>Liên hệ Hotline <strong>0909.123.456</strong> để được chuyên viên hướng dẫn đóng gói gửi đổi trả nhanh nhất!</p>
      `;
    } else if (type === 'warranty') {
      titleEl.textContent = 'CHÍNH SÁCH BẢO HÀNH KEO TRỌN ĐỜI';
      contentEl.innerHTML = `
        <p>Tất cả sản phẩm giày bóng rổ chính hãng mua tại RainbuShop đều nhận được đặc quyền:</p>
        <ul>
          <li><strong>Bảo hành dán keo, may viền trọn đời sản phẩm</strong> hoàn toàn miễn phí.</li>
          <li>Hỗ trợ kiểm tra phục hồi độ bám sân và vệ sinh giày cơ bản.</li>
          <li>Bảo hành nổ bóng đối với các dòng banh Molten, Spalding trong 30 ngày đầu do lỗi van hoặc lỗi sản xuất.</li>
        </ul>
        <p>Địa chỉ bảo hành: 1283 Phạm Thế Hiển, TP. Hồ Chí Minh.</p>
      `;
    } else if (type === 'shipping') {
      titleEl.textContent = 'PHƯƠNG THỨC GIAO HÀNG & THANH TOÁN';
      contentEl.innerHTML = `
        <p>RainbuShop áp dụng chính sách ưu đãi vận chuyển trên toàn lãnh thổ Việt Nam:</p>
        <ul>
          <li><strong>Miễn phí vận chuyển (Freeship)</strong> cho tất cả đơn hàng thanh toán qua website.</li>
          <li>Nội thành TP.HCM: Giao hàng hỏa tốc trong 2 - 4 giờ hoặc nhận hàng ngày hôm sau.</li>
          <li>Các tỉnh thành khác: Giao qua Viettel Post / GHTK từ 2 - 4 ngày làm việc.</li>
          <li>Được mở hộp đồng kiểm tra hàng cùng nhân viên giao hàng trước khi thanh toán (COD).</li>
        </ul>
      `;
    } else {
      titleEl.textContent = 'ĐIỀU KHOẢN BẢO MẬT THÔNG TIN';
      contentEl.innerHTML = `
        <p>RainbuShop cam kết bảo mật 100% dữ liệu cá nhân của quý khách hàng:</p>
        <ul>
          <li>Thông tin số điện thoại, địa chỉ nhận hàng chỉ phục vụ cho công tác xử lý và giao hàng.</li>
          <li>Không chia sẻ hoặc bán dữ liệu khách hàng cho bất kỳ bên thứ ba nào.</li>
          <li>Khách hàng có quyền yêu cầu cập nhật hoặc xóa thông tin tài khoản bất kỳ lúc nào.</li>
        </ul>
      `;
    }

    openModal('modal-policy');
  }

  // ================= TOAST NOTIFICATION SYSTEM =================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg class="toast-icon text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg class="toast-icon text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else {
      iconSvg = '<svg class="toast-icon text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML = `
      ${iconSvg}
      <span class="toast-message">${escapeHtml(message)}</span>
      <button class="toast-close" title="Đóng">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        removeToast(toast);
      });
    }

    container.appendChild(toast);

    setTimeout(function () {
      removeToast(toast);
    }, 4000);
  }

  function removeToast(toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(function () {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  // ================= UTILITIES =================
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
  }

})();
