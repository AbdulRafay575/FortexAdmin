let currentOrdersPage = 1;
const ordersPerPage = 10;
let allOrders = [];
let filteredOrders = [];

document.addEventListener('DOMContentLoaded', function() {
    const adminToken = localStorage.getItem('adminToken');
    
    // Check if user is admin
    if (!adminToken) {
        window.location.href = 'login.html';
        return;
    }

    // Sidebar toggle
    const menuToggle = document.getElementById('menu-toggle');
    const wrapper = document.getElementById('wrapper');

    if (menuToggle && wrapper) {
        menuToggle.addEventListener('click', function() {
            wrapper.classList.toggle('toggled');
        });
    }

    // Navigation links
    const dashboardLink = document.querySelector('.dashboard-link');
    const productsLink = document.querySelector('.products-link');
    const ordersLink = document.querySelector('.orders-link');
    const customersLink = document.querySelector('.customers-link');

    const dashboardContent = document.getElementById('dashboard-content');
    const productsContent = document.getElementById('products-content');
    const ordersContent = document.getElementById('orders-content');
    const customersContent = document.getElementById('customers-content');

    const ordersBody = document.getElementById('orders-body');

    // Set active link and content
    function setActiveContent(contentElement, title) {
        if (!contentElement) return;
        
        // Hide all content with fade out animation
        [dashboardContent, productsContent, ordersContent, customersContent].forEach(content => {
            if (content && !content.classList.contains('d-none')) {
                content.classList.add('animate__animated', 'animate__fadeOut');
                setTimeout(() => {
                    content.classList.add('d-none');
                    content.classList.remove('animate__animated', 'animate__fadeOut');
                }, 300);
            }
        });

        // Remove active class from all links
        [dashboardLink, productsLink, ordersLink, customersLink].forEach(link => {
            if (link) link.classList.remove('active');
        });

        // Show selected content with fade in animation
        setTimeout(() => {
            contentElement.classList.remove('d-none');
            contentElement.classList.add('animate__animated', 'animate__fadeIn');
            setTimeout(() => {
                contentElement.classList.remove('animate__animated', 'animate__fadeIn');
            }, 300);
        }, 300);
        
        const pageTitle = document.getElementById('current-page-title');
        if (pageTitle) pageTitle.textContent = title;
    }

    // Dashboard link click
    if (dashboardLink) {
        dashboardLink.addEventListener('click', function(e) {
            e.preventDefault();
            setActiveContent(dashboardContent, 'Dashboard');
            dashboardLink.classList.add('active');
            loadDashboardData();
        });
    }

    // Products link click
    if (productsLink) {
        productsLink.addEventListener('click', function(e) {
            e.preventDefault();
            setActiveContent(productsContent, 'Products');
            productsLink.classList.add('active');
            if (typeof loadProducts === 'function') loadProducts();
        });
    }

    // Orders link click
    if (ordersLink) {
        ordersLink.addEventListener('click', function(e) {
            e.preventDefault();
            setActiveContent(ordersContent, 'Orders');
            ordersLink.classList.add('active');
            loadOrders();
            initOrderFilters();
        });
    }

    // Customers link click
    if (customersLink) {
        customersLink.addEventListener('click', function(e) {
            e.preventDefault();
            setActiveContent(customersContent, 'Customers');
            customersLink.classList.add('active');
            loadCustomers();
        });
    }

    // Default to dashboard on load
    if (dashboardLink) dashboardLink.classList.add('active');
    loadDashboardData();

    // ========== DASHBOARD FUNCTIONS ==========
    function loadDashboardData() {
        console.log('Loading dashboard data...');
        
        // Load statistics
        loadStatistics();
        
        // Load recent orders
        loadRecentOrders();
    }

    function loadStatistics() {
        console.log('Loading statistics...');
        
        // Load orders for statistics
        fetch('https://fortexbackend.onrender.com/api/orders/admin/orders', {
            headers: { 
                'Authorization': `Bearer ${adminToken}` 
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Statistics orders response:', data);
            
            let orders = [];
            if (data.success && Array.isArray(data.data)) {
                orders = data.data;
            } else if (Array.isArray(data)) {
                orders = data;
            } else {
                throw new Error('Invalid orders data format');
            }
            
            calculateStatistics(orders);
        })
        .catch(error => {
            console.error('Error loading statistics:', error);
            // Set default values on error
            updateStatistics(0, 0, 0, 0);
        });

        // Load products count
        fetch('https://fortexbackend.onrender.com/api/products', {
            headers: { 
                'Authorization': `Bearer ${adminToken}` 
            }
        })
        .then(response => response.json())
        .then(products => {
            const totalProducts = document.getElementById('total-products');
            if (totalProducts) {
                totalProducts.textContent = Array.isArray(products) ? products.length : 
                                          (products.success && Array.isArray(products.data)) ? products.data.length : 0;
            }
        })
        .catch(error => {
            console.error('Error loading products count:', error);
            const totalProducts = document.getElementById('total-products');
            if (totalProducts) totalProducts.textContent = '0';
        });

        // Load customers count
        fetch('https://fortexbackend.onrender.com/api/admin/customers', {
            headers: { 
                'Authorization': `Bearer ${adminToken}` 
            }
        })
        .then(response => response.json())
        .then(data => {
            const totalCustomers = document.getElementById('total-customers');
            if (totalCustomers) {
                const customers = Array.isArray(data) ? data : 
                                (data.success && Array.isArray(data.data)) ? data.data : [];
                totalCustomers.textContent = customers.length;
            }
        })
        .catch(error => {
            console.error('Error loading customers count:', error);
            const totalCustomers = document.getElementById('total-customers');
            if (totalCustomers) totalCustomers.textContent = '0';
        });
    }

    function calculateStatistics(orders) {
        console.log('Calculating statistics from', orders.length, 'orders');
        
        // Total orders
        const totalOrders = orders.length;
        
        // Total revenue (only paid orders)
        const totalRevenue = orders
            .filter(order => order.paymentStatus === 'Paid')
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        // Pending orders
        const pendingOrders = orders.filter(order => 
            order.orderStatus === 'Pending' || order.orderStatus === 'Processing'
        ).length;
        
        // This month's revenue
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = orders
            .filter(order => {
                if (order.paymentStatus !== 'Paid') return false;
                const orderDate = new Date(order.createdAt);
                return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
            })
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        updateStatistics(totalOrders, totalRevenue, pendingOrders, monthlyRevenue);
    }

    function updateStatistics(totalOrders, totalRevenue, pendingOrders, monthlyRevenue) {
        console.log('Updating statistics:', { totalOrders, totalRevenue, pendingOrders, monthlyRevenue });
        
        // Update total orders
        const totalOrdersElement = document.getElementById('total-orders');
        if (totalOrdersElement) totalOrdersElement.textContent = totalOrders;
        
        // Update total revenue
        const totalRevenueElement = document.getElementById('total-revenue');
        if (totalRevenueElement) totalRevenueElement.textContent = `€${totalRevenue.toFixed(2)}`;
        
        // Update pending orders
        const pendingOrdersElement = document.getElementById('pending-orders');
        if (pendingOrdersElement) pendingOrdersElement.textContent = pendingOrders;
        
        // Update monthly revenue
        const monthlyRevenueElement = document.getElementById('monthly-revenue');
        if (monthlyRevenueElement) monthlyRevenueElement.textContent = `€${monthlyRevenue.toFixed(2)}`;
    }

    function loadRecentOrders() {
        console.log('Loading recent orders...');
        const recentOrdersBody = document.getElementById('recent-orders-body');
        
        if (!recentOrdersBody) {
            console.error('Recent orders body not found');
            return;
        }
        
        fetch('https://fortexbackend.onrender.com/api/orders/admin/orders', {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Recent orders response:', data);
            
            let orders = [];
            if (data.success && Array.isArray(data.data)) {
                orders = data.data;
            } else if (Array.isArray(data)) {
                orders = data;
            } else {
                throw new Error('Invalid orders data format');
            }
            
            // Sort by date (newest first) and take first 5
            const recentOrders = orders
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);
            
            displayRecentOrders(recentOrders);
        })
        .catch(error => {
            console.error('Error loading recent orders:', error);
            recentOrdersBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error loading orders</td></tr>`;
        });
    }

    function displayRecentOrders(orders) {
        const recentOrdersBody = document.getElementById('recent-orders-body');
        if (!recentOrdersBody) return;
        
        recentOrdersBody.innerHTML = '';
        
        if (orders.length === 0) {
            recentOrdersBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No recent orders</td></tr>`;
            return;
        }
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            
            const orderDate = new Date(order.createdAt);
            const formattedDate = orderDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            
            // Status badge
            let statusBadgeClass = 'badge bg-primary';
            if (order.orderStatus === 'Delivered') statusBadgeClass = 'badge bg-success';
            else if (order.orderStatus === 'Shipped') statusBadgeClass = 'badge bg-info';
            else if (order.orderStatus === 'Processing') statusBadgeClass = 'badge bg-warning';
            else if (order.orderStatus === 'Pending') statusBadgeClass = 'badge bg-secondary';
            
            row.innerHTML = `
                <td>${order.orderId}</td>
                <td>${order.user?.name || 'N/A'}</td>
                <td>${formattedDate}</td>
                <td>€${order.totalAmount?.toFixed(2) || '0.00'}</td>
                <td><span class="badge ${statusBadgeClass}">${order.orderStatus || 'Pending'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-order-btn" data-order-id="${order._id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            recentOrdersBody.appendChild(row);
        });
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const orderId = this.getAttribute('data-order-id');
                viewOrderDetails(orderId);
            });
        });
    }

    // ========== ORDERS FUNCTIONS ==========
    function loadOrders(page = 1, searchTerm = '', statusFilter = '', dateFrom = '', dateTo = '') {
        console.log('Loading orders...');
        
        fetch('https://fortexbackend.onrender.com/api/orders/admin/orders', {
            headers: { 
                'Authorization': `Bearer ${adminToken}` 
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Orders response:', data);
            
            if (data.success && Array.isArray(data.data)) {
                allOrders = data.data;
            } else if (Array.isArray(data)) {
                allOrders = data;
            } else {
                throw new Error('Invalid orders data format');
            }
            
            applyOrderFilters(searchTerm, statusFilter, dateFrom, dateTo, page);
        })
        .catch(error => {
            console.error('Error loading orders:', error);
            if (ordersBody) {
                ordersBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error loading orders: ${error.message}</td></tr>`;
            }
        });
    }

    function applyOrderFilters(searchTerm = '', statusFilter = '', dateFrom = '', dateTo = '', page = 1) {
        currentOrdersPage = page;
        
        // Filter orders
        filteredOrders = allOrders.filter(order => {
            // Search by order ID or customer name
            const matchesSearch = searchTerm ? 
                order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.user?.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (order.user?.email && order.user.email.toLowerCase().includes(searchTerm.toLowerCase())) : 
                true;
            
            // Filter by status
            const matchesStatus = statusFilter ? order.orderStatus === statusFilter : true;
            
            // Filter by date range
            let matchesDate = true;
            if (dateFrom || dateTo) {
                const orderDate = new Date(order.createdAt);
                const fromDate = dateFrom ? new Date(dateFrom) : null;
                const toDate = dateTo ? new Date(dateTo) : null;
                
                if (fromDate && orderDate < fromDate) matchesDate = false;
                if (toDate && orderDate > toDate) matchesDate = false;
            }
            
            return matchesSearch && matchesStatus && matchesDate;
        });
        
        // Paginate results
        const startIndex = (page - 1) * ordersPerPage;
        const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);
        
        renderOrders(paginatedOrders);
        renderOrdersPagination();
    }

    function renderOrders(orders) {
        if (!ordersBody) return;
        
        ordersBody.innerHTML = '';

        if (orders.length === 0) {
            ordersBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-muted">
                        <i class="fas fa-box-open fa-2x mb-2"></i>
                        <p>No orders found</p>
                    </td>
                </tr>
            `;
            return;
        }

        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const formattedDate = orderDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric'
            });

            let statusBadgeClass = 'badge bg-primary';
            if (order.orderStatus === 'Delivered') statusBadgeClass = 'badge bg-success';
            else if (order.orderStatus === 'Shipped') statusBadgeClass = 'badge bg-info';
            else if (order.orderStatus === 'Processing') statusBadgeClass = 'badge bg-warning';
            else if (order.orderStatus === 'Cancelled') statusBadgeClass = 'badge bg-danger';

            let paymentBadgeClass = 'badge bg-warning';
            if (order.paymentStatus === 'Paid') paymentBadgeClass = 'badge bg-success';
            else if (order.paymentStatus === 'Failed') paymentBadgeClass = 'badge bg-danger';

            const row = document.createElement('tr');
            row.className = 'animate__animated animate__fadeIn';
            row.innerHTML = `
                <td>
                    <span class="fw-bold">${order.orderId}</span>
                </td>
                <td>${order.user?.name || 'N/A'}</td>
                <td>
                    <small class="text-muted">${formattedDate}</small>
                </td>
                <td>${order.items?.length || 0}</td>
                <td class="fw-bold">€${order.totalAmount?.toFixed(2) || '0.00'}</td>
                <td>
                    <span class="badge ${paymentBadgeClass}">
                        <i class="fas ${order.paymentStatus === 'Paid' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-1"></i>
                        ${order.paymentStatus || 'Pending'}
                    </span>
                </td>
                <td>
                    <span class="badge ${statusBadgeClass}">
                        ${order.orderStatus || 'Pending'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-order-btn" data-order-id="${order._id}">
                        <i class="fas fa-eye"></i> Details
                    </button>
                </td>
            `;
            ordersBody.appendChild(row);
        });

        // Update pagination info
        const startCount = ((currentOrdersPage - 1) * ordersPerPage) + 1;
        const endCount = Math.min(currentOrdersPage * ordersPerPage, filteredOrders.length);
        const paginationInfo = document.getElementById('orders-pagination-info');
        if (paginationInfo) {
            paginationInfo.textContent = `Showing ${startCount} to ${endCount} of ${filteredOrders.length} entries`;
        }

        // Add click listeners to view buttons
        document.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const orderId = this.getAttribute('data-order-id');
                viewOrderDetails(orderId);
            });
        });
    }

    function renderOrdersPagination() {
        const paginationEl = document.getElementById('orders-pagination');
        if (!paginationEl) return;
        
        const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
        paginationEl.innerHTML = '';

        if (totalPages <= 1) return;

        // Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentOrdersPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `
            <a class="page-link" href="#" aria-label="Previous" ${currentOrdersPage === 1 ? 'tabindex="-1"' : ''}>
                <span aria-hidden="true">&laquo;</span>
            </a>
        `;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentOrdersPage > 1) {
                applyOrderFilters(
                    getSearchTerm(),
                    getStatusFilter(),
                    getDateFrom(),
                    getDateTo(),
                    currentOrdersPage - 1
                );
            }
        });
        paginationEl.appendChild(prevLi);

        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentOrdersPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            const firstLi = document.createElement('li');
            firstLi.className = 'page-item';
            firstLi.innerHTML = `<a class="page-link" href="#">1</a>`;
            firstLi.addEventListener('click', (e) => {
                e.preventDefault();
                applyOrderFilters(
                    getSearchTerm(),
                    getStatusFilter(),
                    getDateFrom(),
                    getDateTo(),
                    1
                );
            });
            paginationEl.appendChild(firstLi);

            if (startPage > 2) {
                const ellipsisLi = document.createElement('li');
                ellipsisLi.className = 'page-item disabled';
                ellipsisLi.innerHTML = `<a class="page-link" href="#">...</a>`;
                paginationEl.appendChild(ellipsisLi);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === currentOrdersPage ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageLi.addEventListener('click', (e) => {
                e.preventDefault();
                applyOrderFilters(
                    getSearchTerm(),
                    getStatusFilter(),
                    getDateFrom(),
                    getDateTo(),
                    i
                );
            });
            paginationEl.appendChild(pageLi);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsisLi = document.createElement('li');
                ellipsisLi.className = 'page-item disabled';
                ellipsisLi.innerHTML = `<a class="page-link" href="#">...</a>`;
                paginationEl.appendChild(ellipsisLi);
            }

            const lastLi = document.createElement('li');
            lastLi.className = 'page-item';
            lastLi.innerHTML = `<a class="page-link" href="#">${totalPages}</a>`;
            lastLi.addEventListener('click', (e) => {
                e.preventDefault();
                applyOrderFilters(
                    getSearchTerm(),
                    getStatusFilter(),
                    getDateFrom(),
                    getDateTo(),
                    totalPages
                );
            });
            paginationEl.appendChild(lastLi);
        }

        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentOrdersPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `
            <a class="page-link" href="#" aria-label="Next" ${currentOrdersPage === totalPages ? 'tabindex="-1"' : ''}>
                <span aria-hidden="true">&raquo;</span>
            </a>
        `;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentOrdersPage < totalPages) {
                applyOrderFilters(
                    getSearchTerm(),
                    getStatusFilter(),
                    getDateFrom(),
                    getDateTo(),
                    currentOrdersPage + 1
                );
            }
        });
        paginationEl.appendChild(nextLi);
    }

    // Helper functions for filter values
    function getSearchTerm() {
        const searchInput = document.getElementById('order-search');
        return searchInput ? searchInput.value : '';
    }

    function getStatusFilter() {
        const activeItem = document.querySelector('#orders-content .dropdown-menu .active');
        return activeItem ? activeItem.dataset.status : '';
    }

    function getDateFrom() {
        const dateFrom = document.getElementById('order-date-from');
        return dateFrom ? dateFrom.value : '';
    }

    function getDateTo() {
        const dateTo = document.getElementById('order-date-to');
        return dateTo ? dateTo.value : '';
    }

    function initOrderFilters() {
        console.log('Initializing order filters...');
        
        // Status filter dropdown
        const statusItems = document.querySelectorAll('#orders-content .dropdown-item[data-status]');
        statusItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const status = this.dataset.status;
                
                // Update dropdown text
                const dropdownToggle = document.querySelector('#orders-content .dropdown-toggle');
                if (dropdownToggle) {
                    dropdownToggle.innerHTML = `
                        <i class="fas fa-filter me-1"></i> 
                        ${status ? `Status: ${status}` : 'All Orders'}
                    `;
                }
                
                // Set active item
                document.querySelectorAll('#orders-content .dropdown-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                applyOrderFilters(
                    getSearchTerm(),
                    status,
                    getDateFrom(),
                    getDateTo()
                );
            });
        });
        
        // Date filters
        const dateFrom = document.getElementById('order-date-from');
        const dateTo = document.getElementById('order-date-to');
        
        if (dateFrom) {
            dateFrom.addEventListener('change', function() {
                applyOrderFilters(
                    getSearchTerm(),
                    getStatusFilter(),
                    this.value,
                    getDateTo()
                );
            });
        }
        
        if (dateTo) {
            dateTo.addEventListener('change', function() {
                applyOrderFilters(
                    getSearchTerm(),
                    getStatusFilter(),
                    getDateFrom(),
                    this.value
                );
            });
        }

        // Clear date filters button
        const clearDateBtn = document.getElementById('clear-date-filters');
        if (clearDateBtn) {
            clearDateBtn.addEventListener('click', function() {
                if (dateFrom) dateFrom.value = '';
                if (dateTo) dateTo.value = '';
                applyOrderFilters(
                    getSearchTerm(),
                    getStatusFilter(),
                    '',
                    ''
                );
            });
        }
        
        // Search functionality
        const searchBtn = document.getElementById('search-order-btn');
        const searchInput = document.getElementById('order-search');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', function() {
                applyOrderFilters(
                    getSearchTerm(),
                    getStatusFilter(),
                    getDateFrom(),
                    getDateTo()
                );
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') {
                    applyOrderFilters(
                        this.value,
                        getStatusFilter(),
                        getDateFrom(),
                        getDateTo()
                    );
                }
            });
        }
    }

    // View order details
    function viewOrderDetails(orderId) {
        console.log('Viewing order details:', orderId);
        
        fetch(`https://fortexbackend.onrender.com/api/orders/${orderId}`, {
            headers: { 
                'Authorization': `Bearer ${adminToken}` 
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Order details response:', data);
            
            let order;
            if (data.success && data.data) {
                order = data.data;
            } else if (data._id) {
                order = data;
            } else {
                throw new Error('Invalid order data format');
            }
            
            // Populate modal
            const orderDetailId = document.getElementById('orderDetailId');
            if (orderDetailId) orderDetailId.textContent = order.orderId;
            
            // Customer info
            const customerInfo = document.getElementById('customerInfo');
            if (customerInfo) {
                customerInfo.innerHTML = `
                    <strong>Name:</strong> ${order.shippingDetails?.name || 'N/A'}<br>
                    <strong>Email:</strong> ${order.user?.email || 'N/A'}<br>
                    <strong>Phone:</strong> ${order.shippingDetails?.phone || 'N/A'}
                `;
            }
            
            // Shipping info
            const shippingInfo = document.getElementById('shippingInfo');
            if (shippingInfo) {
                shippingInfo.innerHTML = `
                    ${order.shippingDetails?.street || 'N/A'}<br>
                    ${order.shippingDetails?.city || 'N/A'}, ${order.shippingDetails?.state || 'N/A'} ${order.shippingDetails?.zip || 'N/A'}<br>
                    ${order.shippingDetails?.country || 'N/A'}
                `;
            }
            
            // Order items
            const orderItemsBody = document.getElementById('orderItemsBody');
            if (orderItemsBody) {
                orderItemsBody.innerHTML = '';
                
                if (order.items && order.items.length > 0) {
                    order.items.forEach(item => {
                        const row = document.createElement('tr');
                        row.className = 'animate__animated animate__fadeIn';
                        
                        let productName = 'Custom T-Shirt';
                        if (item.product && item.product.name) {
                            productName = item.product.name;
                        } else if (item.productName) {
                            productName = item.productName;
                        }
                        
                        // Check if item has custom design
                        const hasDesign = item.design && item.design !== '';
                        const designCell = hasDesign ? 
                            `<img src="${item.design}" alt="Custom Design" class="design-thumbnail" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; cursor: pointer;" onclick="showDesignImage('${item.design}')">` :
                            '<span class="text-muted">No Design</span>';
                        
                        row.innerHTML = `
                            <td>${productName}</td>
                            <td>${item.size || 'N/A'}</td>
                            <td>${item.color || 'N/A'}</td>
                            <td>${designCell}</td>
                            <td>${item.customText || 'None'}</td>
                            <td>${item.quantity || 1}</td>
                            <td>€${(item.priceAtPurchase || item.price || 0).toFixed(2)}</td>
                        `;
                        
                        orderItemsBody.appendChild(row);
                    });
                } else {
                    orderItemsBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No items in this order</td></tr>`;
                }
            }
            
            // Payment status
            const paymentStatus = document.getElementById('paymentStatus');
            if (paymentStatus) paymentStatus.textContent = order.paymentStatus || 'Pending';
            
            // Order status select
            const statusSelect = document.getElementById('orderStatusSelect');
            if (statusSelect) statusSelect.value = order.orderStatus || 'Pending';
            
            // Set up update button
            const updateBtn = document.getElementById('updateOrderStatusBtn');
            if (updateBtn) {
                updateBtn.onclick = function() {
                    updateOrderStatus(order._id, statusSelect.value);
                };
            }
            
            // Show modal
            const modalElement = document.getElementById('orderDetailModal');
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }
        })
        .catch(error => {
            console.error('Error loading order details:', error);
            showToast('Error loading order details: ' + error.message, 'error');
        });
    }

    // Show design image in modal
    window.showDesignImage = function(designUrl) {
        const designImage = document.getElementById('designImage');
        if (designImage) designImage.src = designUrl;
        
        const modalElement = document.getElementById('designModal');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }

    // Update order status
    function updateOrderStatus(orderId, status) {
        fetch(`https://fortexbackend.onrender.com/api/orders/admin/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                status: status
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success || data._id) {
                // Close modal and refresh data
                const modalElement = document.getElementById('orderDetailModal');
                if (modalElement) {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) modal.hide();
                }
                loadOrders();
                loadDashboardData();
                showToast('Order status updated successfully', 'success');
            } else {
                throw new Error(data.message || 'Failed to update order status');
            }
        })
        .catch(error => {
            console.error('Error updating order status:', error);
            showToast('Failed to update order status: ' + error.message, 'error');
        });
    }

    // ========== CUSTOMERS FUNCTIONS ==========
    const customersBody = document.getElementById('customers-body');
    let allCustomers = [];

    function loadCustomers() {
        console.log('Loading customers...');
        
        fetch('https://fortexbackend.onrender.com/api/admin/customers', {
            headers: { 
                'Authorization': `Bearer ${adminToken}` 
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Customers response:', data);
            
            if (Array.isArray(data)) {
                allCustomers = data;
            } else if (data.success && Array.isArray(data.data)) {
                allCustomers = data.data;
            } else {
                throw new Error('Invalid customers data format');
            }
            
            displayCustomers(allCustomers);
            initCustomerSearch();
        })
        .catch(err => {
            console.error('Error loading customers:', err);
            if (customersBody) {
                customersBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error loading customers</td></tr>`;
            }
        });
    }

    function displayCustomers(customers) {
        if (!customersBody) return;
        
        customersBody.innerHTML = '';

        if (customers.length === 0) {
            customersBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4 text-muted">
                        <i class="fas fa-user-slash fa-2x mb-2"></i>
                        <p>No customers found</p>
                    </td>
                </tr>
            `;
            return;
        }

        customers.forEach(customer => {
            const joinDate = new Date(customer.createdAt);
            const formattedDate = joinDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const row = document.createElement('tr');
            row.className = 'animate__animated animate__fadeIn';
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${formattedDate}</td>
                <td>${customer.orderHistory ? customer.orderHistory.length : 0}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-customer-btn" data-customer-id="${customer._id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
            customersBody.appendChild(row);
        });

        // Add click listeners to view buttons
        document.querySelectorAll('.view-customer-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                viewCustomerDetails(this.getAttribute('data-customer-id'));
            });
        });
    }

    function initCustomerSearch() {
        const searchInput = document.querySelector('#customers-content input[type="text"]');
        const searchButton = document.querySelector('#customers-content button');
        
        if (searchButton) {
            searchButton.addEventListener('click', function() {
                const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
                filterCustomers(searchTerm);
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('keyup', function(e) {
                if (e.key === 'Enter') {
                    const searchTerm = this.value.toLowerCase();
                    filterCustomers(searchTerm);
                }
            });
        }
    }

    function filterCustomers(searchTerm) {
        if (!searchTerm) {
            displayCustomers(allCustomers);
            return;
        }

        const filteredCustomers = allCustomers.filter(customer => 
            customer.name.toLowerCase().includes(searchTerm) || 
            customer.email.toLowerCase().includes(searchTerm)
        );
        
        displayCustomers(filteredCustomers);
    }

    function viewCustomerDetails(customerId) {
        fetch(`https://fortexbackend.onrender.com/api/admin/customers/${customerId}`, {
            headers: { 
                'Authorization': `Bearer ${adminToken}` 
            }
        })
        .then(response => response.json())
        .then(customer => {
            const customerName = document.getElementById('customerName');
            const customerEmail = document.getElementById('customerEmail');
            const customerJoined = document.getElementById('customerJoined');
            const customerOrdersBody = document.getElementById('customerOrdersBody');

            if (customerName) customerName.textContent = customer.name;
            if (customerEmail) customerEmail.textContent = customer.email;

            const joinDate = new Date(customer.createdAt);
            if (customerJoined) {
                customerJoined.textContent = joinDate.toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
            }

            if (customerOrdersBody) {
                customerOrdersBody.innerHTML = '';

                if (customer.orderHistory && customer.orderHistory.length > 0) {
                    customer.orderHistory.forEach(order => {
                        const orderDate = new Date(order.createdAt);
                        const formattedDate = orderDate.toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                        });

                        const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

                        const addressParts = [];
                        if (order.shippingDetails.street) addressParts.push(order.shippingDetails.street);
                        if (order.shippingDetails.city) addressParts.push(order.shippingDetails.city);
                        if (order.shippingDetails.state) addressParts.push(order.shippingDetails.state);
                        if (order.shippingDetails.country) addressParts.push(order.shippingDetails.country);

                        const shortAddress = addressParts.join(', ');

                        let statusClass = 'badge bg-secondary';
                        if (order.orderStatus === 'Delivered') statusClass = 'badge bg-success';
                        else if (order.orderStatus === 'Pending') statusClass = 'badge bg-warning';
                        else if (order.orderStatus === 'Shipped') statusClass = 'badge bg-info';

                        const row = document.createElement('tr');
                        row.className = 'animate__animated animate__fadeIn';
                        row.innerHTML = `
                            <td>${order.orderId}</td>
                            <td>${formattedDate}</td>
                            <td>${totalItems} item(s)</td>
                            <td>€${order.totalAmount.toFixed(2)}</td>
                            <td><span class="badge ${statusClass}">${order.orderStatus}</span></td>
                            <td>${shortAddress || 'N/A'}</td>
                            <td>${order.shippingDetails.phone || 'N/A'}</td>
                        `;
                        customerOrdersBody.appendChild(row);
                    });
                } else {
                    customerOrdersBody.innerHTML = `
                        <tr>
                            <td colspan="7" class="text-center py-4 text-muted">
                                <i class="fas fa-box-open fa-2x mb-2"></i>
                                <p>No orders found</p>
                            </td>
                        </tr>
                    `;
                }
            }

            const customerDetailModal = new bootstrap.Modal(document.getElementById('customerDetailModal'));
            customerDetailModal.show();
        })
        .catch(err => console.error('Error loading customer details:', err));
    }

    // Toast notification function
    function showToast(message, type = 'info') {
        const toastContainer = document.createElement('div');
        toastContainer.className = `toast show align-items-center text-white bg-${type} border-0`;
        toastContainer.setAttribute('role', 'alert');
        toastContainer.setAttribute('aria-live', 'assertive');
        toastContainer.setAttribute('aria-atomic', 'true');
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '1100';
        
        toastContainer.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        document.body.appendChild(toastContainer);
        
        setTimeout(() => {
            toastContainer.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toastContainer)) {
                    document.body.removeChild(toastContainer);
                }
            }, 300);
        }, 3000);
    }

    // Make functions globally accessible
    window.viewOrderDetails = viewOrderDetails;
    window.showDesignImage = showDesignImage;
});