let currentOrdersPage = 1;
const ordersPerPage = 10;
let allOrders = [];
let filteredOrders = [];

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle
    const menuToggle = document.getElementById('menu-toggle');
    const wrapper = document.getElementById('wrapper');

    menuToggle.addEventListener('click', function() {
        wrapper.classList.toggle('toggled');
    });

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
    const adminToken = localStorage.getItem('adminToken');

    // Set active link and content
    function setActiveContent(contentElement, title) {
        
        // Hide all content with fade out animation
        if (!contentElement.classList.contains('d-none')) return;
        [dashboardContent, productsContent, ordersContent, customersContent].forEach(content => {
            if (!content.classList.contains('d-none')) {
                content.classList.add('animate__animated', 'animate__fadeOut');
                setTimeout(() => {
                    content.classList.add('d-none');
                    content.classList.remove('animate__animated', 'animate__fadeOut');
                }, 0);
            }
        });

        // Remove active class from all links
        [dashboardLink, productsLink, ordersLink, customersLink].forEach(link => {
            link.classList.remove('active');
        });

        // Show selected content with fade in animation
        contentElement.classList.remove('d-none');
        contentElement.classList.add('animate__animated', 'animate__fadeIn');
        setTimeout(() => {
            contentElement.classList.remove('animate__animated', 'animate__fadeIn');
        }, 0);
        
        document.getElementById('current-page-title').textContent = title;
    }

    // Dashboard link click
    dashboardLink.addEventListener('click', function(e) {
        e.preventDefault();
        setActiveContent(dashboardContent, 'Dashboard');
        dashboardLink.classList.add('active');
        loadDashboardData();
        loadRecentOrders();
function loadRecentOrders() {
    const adminToken = localStorage.getItem('adminToken');
    const recentOrdersBody = document.getElementById('recent-orders-body');
    
    fetch('https://fortexbackend.onrender.com/api/orders/admin/orders?limit=10&sort=-createdAt', {
        headers: {
            'Authorization': `Bearer ${adminToken}`
        }
    })
    .then(response => response.json())
    .then(orders => {
        recentOrdersBody.innerHTML = '';
        
        // Make sure we only show exactly 10 orders
        const recentOrders = orders.slice(0, 10);
        
        recentOrders.forEach(order => {
            const row = document.createElement('tr');
            
            // Format date
            const orderDate = new Date(order.createdAt);
            const formattedDate = orderDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Status badge
            let statusBadgeClass = 'badge bg-primary';
            if (order.orderStatus === 'Delivered') statusBadgeClass = 'badge bg-success';
            else if (order.orderStatus === 'Shipped') statusBadgeClass = 'badge bg-info';
            else if (order.orderStatus === 'Processing') statusBadgeClass = 'badge bg-warning';
            else if (order.orderStatus === 'Pending') statusBadgeClass = 'badge bg-secondary';
            
            row.innerHTML = `
                <td>${order.orderId}</td>
                <td>${order.user.name}</td>
                <td>${formattedDate}</td>
                <td>€${order.totalAmount.toFixed(2)}</td>
                <td><span class="${statusBadgeClass}">${order.orderStatus}</span></td>
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
    })
    .catch(error => console.error('Error loading recent orders:', error));
}

    });

    // Products link click
    productsLink.addEventListener('click', function(e) {
        e.preventDefault();
        setActiveContent(productsContent, 'Products');
        productsLink.classList.add('active');
        if(typeof loadProducts === 'function') loadProducts();
    });

    // Orders link click
    ordersLink.addEventListener('click', function(e) {
        e.preventDefault();
        setActiveContent(ordersContent, 'Orders');
        ordersLink.classList.add('active');
        loadOrders();
            initOrderFilters(); // Add this line
    });

    // Customers link click
    customersLink.addEventListener('click', function(e) {
        e.preventDefault();
        setActiveContent(customersContent, 'Customers');
        customersLink.classList.add('active');
        loadCustomers();
    });

    // Default to dashboard on load
    dashboardLink.classList.add('active');
    loadDashboardData();

function loadRecentOrders() {
    const adminToken = localStorage.getItem('adminToken');
    const recentOrdersBody = document.getElementById('recent-orders-body');
    
    fetch('https://fortexbackend.onrender.com/api/orders/admin/orders?limit=10', {
        headers: {
            'Authorization': `Bearer ${adminToken}`
        }
    })
    .then(response => response.json())
    .then(orders => {
        recentOrdersBody.innerHTML = '';
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            
            // Format date
            const orderDate = new Date(order.createdAt);
            const formattedDate = orderDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Status badge
            let statusBadgeClass = 'badge bg-primary';
            if (order.orderStatus === 'Delivered') statusBadgeClass = 'badge bg-success';
            else if (order.orderStatus === 'Shipped') statusBadgeClass = 'badge bg-info';
            else if (order.orderStatus === 'Processing') statusBadgeClass = 'badge bg-warning';
            else if (order.orderStatus === 'Pending') statusBadgeClass = 'badge bg-secondary';
            
            row.innerHTML = `
                <td>${order.orderId}</td>
                <td>${order.user.name}</td>
                <td>${formattedDate}</td>
                <td>€${order.totalAmount.toFixed(2)}</td>
                <td><span class="${statusBadgeClass}">${order.orderStatus}</span></td>
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
    })
    .catch(error => console.error('Error loading recent orders:', error));
}
        loadRecentOrders();

    // ========== DASHBOARD FUNCTIONS ==========
    function loadDashboardData() {
        fetch('https://fortexbackend.onrender.com/api/orders/admin/orders', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        })
        .then(res => res.json())
        .then(orders => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentOrders = orders.filter(o => new Date(o.createdAt) > thirtyDaysAgo);
            const totalSales = recentOrders.reduce((sum, o) => sum + o.totalAmount, 0);

            document.getElementById('total-orders').textContent = recentOrders.length;
            document.getElementById('total-sales').textContent = `£${totalSales.toFixed(2)}`;

            const ordersBodyDashboard = document.getElementById('recent-orders-body');
            ordersBodyDashboard.innerHTML = '';

            recentOrders.slice(0, 5).forEach(order => {
                const orderDate = new Date(order.createdAt);
                const formattedDate = orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

                let statusClass = 'badge-primary';
                if (order.orderStatus === 'Delivered') statusClass = 'badge-success';
                else if (order.orderStatus === 'Shipped') statusClass = 'badge-info';
                else if (order.orderStatus === 'Processing') statusClass = 'badge-warning';

                const row = document.createElement('tr');
                row.className = 'animate__animated animate__fadeIn';
                row.innerHTML = `
                    <td>${order.orderId}</td>
                    <td>${order.user.name}</td>
                    <td>${formattedDate}</td>
                    <td>€${order.totalAmount.toFixed(2)}</td>
                    <td><span class="badge ${statusClass}">${order.orderStatus}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-order-btn" data-order-id="${order._id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
                ordersBodyDashboard.appendChild(row);
            });

            // Add click listeners on view buttons
            document.querySelectorAll('.view-order-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    viewOrderDetails(this.getAttribute('data-order-id'));
                });
            });
        })
        .catch(err => console.error('Error loading dashboard data:', err));

        // Fetch total products
        fetch('https://fortexbackend.onrender.com/api/products', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        })
        .then(res => res.json())
        .then(products => {
            document.getElementById('total-products').textContent = products.length;
        });

        // Fetch total customers
        fetch('https://fortexbackend.onrender.com/api/admin/customers', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        })
        .then(res => res.json())
        .then(customers => {
            document.getElementById('total-customers').textContent = customers.length;
        });
    }

    // ========== ORDERS FUNCTIONS ==========
    function loadOrders(page = 1, searchTerm = '', statusFilter = '', dateFrom = '', dateTo = '') {
        fetch('https://fortexbackend.onrender.com/api/orders/admin/orders', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        })
        .then(res => res.json())
        .then(orders => {
            allOrders = orders;
            applyOrderFilters(searchTerm, statusFilter, dateFrom, dateTo, page);
        })
        .catch(err => console.error('Error loading orders:', err));
    }

    function applyOrderFilters(searchTerm = '', statusFilter = '', dateFrom = '', dateTo = '', page = 1) {
        currentOrdersPage = page;
        
        // Filter orders
        filteredOrders = allOrders.filter(order => {
            // Search by order ID
            const matchesSearch = searchTerm ? order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) : true;
            
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
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            let statusBadgeClass = 'badge-primary';
            if (order.orderStatus === 'Delivered') statusBadgeClass = 'badge-success';
            else if (order.orderStatus === 'Shipped') statusBadgeClass = 'badge-info';
            else if (order.orderStatus === 'Processing') statusBadgeClass = 'badge-warning';

            let paymentBadgeClass = 'badge-warning';
            if (order.paymentStatus === 'Paid') paymentBadgeClass = 'badge-success';
            else if (order.paymentStatus === 'Failed') paymentBadgeClass = 'badge-danger';

            const row = document.createElement('tr');
            row.className = 'animate__animated animate__fadeIn';
            row.innerHTML = `
                <td>
                    <span class="fw-bold">${order.orderId}</span>
                </td>
                <td>${order.user.name}</td>
                <td>
                    <small class="text-muted">${formattedDate}</small>
                </td>
                <td>${order.items.length}</td>
                <td class="fw-bold">$${order.totalAmount.toFixed(2)}</td>
                <td>
                    <span class="badge ${paymentBadgeClass}">
                        <i class="fas ${order.paymentStatus === 'Paid' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-1"></i>
                        ${order.paymentStatus}
                    </span>
                </td>
                <td>
                    <span class="badge ${statusBadgeClass}">
                        ${order.orderStatus}
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
        document.getElementById('orders-pagination-info').textContent = 
            `Showing ${startCount} to ${endCount} of ${filteredOrders.length} entries`;

        // Add click listeners to view buttons
        document.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                viewOrderDetails(this.getAttribute('data-order-id'));
            });
        });
    }

    function renderOrdersPagination() {
        const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
        const paginationEl = document.getElementById('orders-pagination');
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
                    document.getElementById('order-search').value,
                    document.querySelector('.dropdown-menu .active')?.dataset.status || '',
                    document.getElementById('order-date-from').value,
                    document.getElementById('order-date-to').value,
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
                    document.getElementById('order-search').value,
                    document.querySelector('.dropdown-menu .active')?.dataset.status || '',
                    document.getElementById('order-date-from').value,
                    document.getElementById('order-date-to').value,
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
                    document.getElementById('order-search').value,
                    document.querySelector('.dropdown-menu .active')?.dataset.status || '',
                    document.getElementById('order-date-from').value,
                    document.getElementById('order-date-to').value,
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
                    document.getElementById('order-search').value,
                    document.querySelector('.dropdown-menu .active')?.dataset.status || '',
                    document.getElementById('order-date-from').value,
                    document.getElementById('order-date-to').value,
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
                    document.getElementById('order-search').value,
                    document.querySelector('.dropdown-menu .active')?.dataset.status || '',
                    document.getElementById('order-date-from').value,
                    document.getElementById('order-date-to').value,
                    currentOrdersPage + 1
                );
            }
        });
        paginationEl.appendChild(nextLi);
    }

    function initOrderFilters() {
        // Status filter dropdown
        document.querySelectorAll('#orders-content .dropdown-item[data-status]').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const status = this.dataset.status;
                
                // Update dropdown text
                const dropdownToggle = document.querySelector('#orders-content .dropdown-toggle');
                dropdownToggle.innerHTML = `
                    <i class="fas fa-filter me-1"></i> 
                    ${status ? `Status: ${status}` : 'All Orders'}
                `;
                
                // Set active item
                document.querySelectorAll('#orders-content .dropdown-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                applyOrderFilters(
                    document.getElementById('order-search').value,
                    status,
                    document.getElementById('order-date-from').value,
                    document.getElementById('order-date-to').value
                );
            });
        });
        
        // Date filters - auto-apply when changed
        document.getElementById('order-date-from').addEventListener('change', function() {
            applyOrderFilters(
                document.getElementById('order-search').value,
                document.querySelector('.dropdown-menu .active')?.dataset.status || '',
                this.value,
                document.getElementById('order-date-to').value
            );
        });
        
        document.getElementById('order-date-to').addEventListener('change', function() {
            applyOrderFilters(
                document.getElementById('order-search').value,
                document.querySelector('.dropdown-menu .active')?.dataset.status || '',
                document.getElementById('order-date-from').value,
                this.value
            );
        });

        // Clear date filters button
        const clearDateBtn = document.getElementById('clear-date-filters');
        if (clearDateBtn) {
            clearDateBtn.addEventListener('click', function() {
                document.getElementById('order-date-from').value = '';
                document.getElementById('order-date-to').value = '';
                applyOrderFilters(
                    document.getElementById('order-search').value,
                    document.querySelector('.dropdown-menu .active')?.dataset.status || '',
                    '',
                    ''
                );
            });
        }
        
        // Search functionality
        document.getElementById('search-order-btn').addEventListener('click', function() {
            const searchTerm = document.getElementById('order-search').value;
            applyOrderFilters(
                searchTerm,
                document.querySelector('.dropdown-menu .active')?.dataset.status || '',
                document.getElementById('order-date-from').value,
                document.getElementById('order-date-to').value
            );
        });
        
        document.getElementById('order-search').addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value;
                applyOrderFilters(
                    searchTerm,
                    document.querySelector('.dropdown-menu .active')?.dataset.status || '',
                    document.getElementById('order-date-from').value,
                    document.getElementById('order-date-to').value
                );
            }
        });
    }

    // View order details
    function viewOrderDetails(orderId) {
        fetch(`https://fortexbackend.onrender.com/api/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        })
        .then(response => response.json())
        .then(order => {
            // Populate modal
            document.getElementById('orderDetailId').textContent = order.orderId;
            
            // Customer info
            document.getElementById('customerInfo').innerHTML = `
                <strong>Name:</strong> ${order.shippingDetails.name}<br>
                <strong>Email:</strong> ${order.user.email}<br>
                <strong>Phone:</strong> ${order.shippingDetails.phone}
            `;
            
            // Shipping info
            document.getElementById('shippingInfo').innerHTML = `
                ${order.shippingDetails.street}<br>
                ${order.shippingDetails.city}, ${order.shippingDetails.state} ${order.shippingDetails.zip}<br>
                ${order.shippingDetails.country}
            `;
            
            // Order items
            const orderItemsBody = document.getElementById('orderItemsBody');
            orderItemsBody.innerHTML = '';
            
            order.items.forEach(item => {
                const row = document.createElement('tr');
                row.className = 'animate__animated animate__fadeIn';
                
                let productName = 'Custom T-Shirt';
                if (item.product && item.product.name) {
                    productName = item.product.name;
                }
                
                row.innerHTML = `
                    <td>${productName}</td>
                    <td>${item.size}</td>
                    <td>${item.color}</td>
                    <td>${item.customText || 'None'}</td>
                    <td>${item.quantity}</td>
                    <td>€${item.priceAtPurchase.toFixed(2)}</td>
                `;
                
                orderItemsBody.appendChild(row);
            });
            
            // Payment status
            document.getElementById('paymentStatus').textContent = order.paymentStatus;
            
            // Order status select
            const statusSelect = document.getElementById('orderStatusSelect');
            statusSelect.value = order.orderStatus;
            
            // Set up update button
            document.getElementById('updateOrderStatusBtn').onclick = function() {
                updateOrderStatus(order._id, statusSelect.value);
            };
            
            // Show modal with animation
            const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
            modal.show();
        })
        .catch(error => console.error('Error loading order details:', error));
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
            if (response.ok) {
                // Close modal and refresh data
                const modal = bootstrap.Modal.getInstance(document.getElementById('orderDetailModal'));
                modal.hide();
                loadOrders();
                loadDashboardData();
                showToast('Order status updated successfully', 'success');
            } else {
                throw new Error('Failed to update order status');
            }
        })
        .catch(error => {
            console.error('Error updating order status:', error);
            showToast('Failed to update order status', 'error');
        });
    }

    // ========== CUSTOMERS FUNCTIONS ==========
    const customersBody = document.getElementById('customers-body');
    const customerDetailModal = new bootstrap.Modal(document.getElementById('customerDetailModal'));
    let allCustomers = [];

    function loadCustomers() {
        fetch('https://fortexbackend.onrender.com/api/admin/customers', {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        })
        .then(response => response.json())
        .then(customers => {
            allCustomers = customers;
            displayCustomers(customers);
            initCustomerSearch();
        })
        .catch(err => console.error('Error loading customers:', err));
    }

    function displayCustomers(customers) {
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
        
        searchButton.addEventListener('click', function() {
            const searchTerm = searchInput.value.toLowerCase();
            filterCustomers(searchTerm);
        });
        
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.toLowerCase();
                filterCustomers(searchTerm);
            }
        });
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
            headers: { 'Authorization': `Bearer ${adminToken}` }
        })
        .then(response => response.json())
        .then(customer => {
            document.getElementById('customerName').textContent = customer.name;
            document.getElementById('customerEmail').textContent = customer.email;

            const joinDate = new Date(customer.createdAt);
            document.getElementById('customerJoined').textContent = joinDate.toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            const customerOrdersBody = document.getElementById('customerOrdersBody');
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

                    let statusClass = 'badge-secondary';
                    if (order.orderStatus === 'Delivered') statusClass = 'badge-success';
                    else if (order.orderStatus === 'Pending') statusClass = 'badge-warning';
                    else if (order.orderStatus === 'Shipped') statusClass = 'badge-info';

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
                document.body.removeChild(toastContainer);
            }, 300);
        }, 3000);
    }
});