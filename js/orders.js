document.addEventListener('DOMContentLoaded', function() {
    const adminToken = localStorage.getItem('adminToken');
    const ordersBody = document.getElementById('orders-body');
    
    // Check if filter elements exist before using them
    const searchInput = document.getElementById('searchOrders');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    let allOrders = []; // Store all orders for filtering

    // Load orders
    function loadOrders() {
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
            console.log('Orders API response:', data);
            
            // Handle different response structures
            if (data.success && Array.isArray(data.data)) {
                allOrders = data.data;
            } else if (Array.isArray(data)) {
                allOrders = data; // Fallback for direct array response
            } else {
                throw new Error('Invalid orders data format');
            }
            
            console.log('Loaded orders:', allOrders.length);
            applyOrderFilters();
        })
        .catch(error => {
            console.error('Error loading orders:', error);
            if (ordersBody) {
                ordersBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error loading orders: ${error.message}</td></tr>`;
            }
        });
    }

    // Apply filters to orders
    function applyOrderFilters() {
        console.log('Applying filters...');
        
        let filteredOrders = [...allOrders];
        
        // Search filter - only apply if element exists
        if (searchInput && searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            filteredOrders = filteredOrders.filter(order => 
                order.orderId.toLowerCase().includes(searchTerm) ||
                (order.user?.name && order.user.name.toLowerCase().includes(searchTerm)) ||
                (order.user?.email && order.user.email.toLowerCase().includes(searchTerm)) ||
                (order.shippingDetails?.name && order.shippingDetails.name.toLowerCase().includes(searchTerm))
            );
        }
        
        // Status filter - only apply if element exists
        if (statusFilter && statusFilter.value) {
            const statusValue = statusFilter.value;
            filteredOrders = filteredOrders.filter(order => order.orderStatus === statusValue);
        }
        
        // Date filter - only apply if element exists
        if (dateFilter && dateFilter.value) {
            const dateValue = dateFilter.value;
            const filterDate = new Date(dateValue);
            filteredOrders = filteredOrders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate.toDateString() === filterDate.toDateString();
            });
        }
        
        displayOrders(filteredOrders);
    }

    // Display orders in table
    function displayOrders(orders) {
        if (!ordersBody) {
            console.error('Orders body element not found');
            return;
        }
        
        ordersBody.innerHTML = '';
        
        if (orders.length === 0) {
            ordersBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No orders found</td></tr>`;
            return;
        }
        
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
            else if (order.orderStatus === 'Cancelled') statusBadgeClass = 'badge bg-danger';
            
            // Payment badge
            let paymentBadgeClass = 'badge bg-warning';
            if (order.paymentStatus === 'Paid') paymentBadgeClass = 'badge bg-success';
            else if (order.paymentStatus === 'Failed') paymentBadgeClass = 'badge bg-danger';
            
            row.innerHTML = `
                <td>${order.orderId}</td>
                <td>${order.user?.name || 'N/A'}</td>
                <td>${formattedDate}</td>
                <td>${order.items?.length || 0}</td>
                <td>€${order.totalAmount?.toFixed(2) || '0.00'}</td>
                <td><span class="badge ${paymentBadgeClass}">${order.paymentStatus || 'Pending'}</span></td>
                <td><span class="badge ${statusBadgeClass}">${order.orderStatus || 'Pending'}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-order-btn" data-order-id="${order._id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            ordersBody.appendChild(row);
        });
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-order-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const orderId = this.getAttribute('data-order-id');
                viewOrderDetails(orderId);
            });
        });
    }

    // View order details with design images
    window.viewOrderDetails = function(orderId) {
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
                order = data; // Fallback for direct object response
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
            
            // Order items with design images
            const orderItemsBody = document.getElementById('orderItemsBody');
            if (orderItemsBody) {
                orderItemsBody.innerHTML = '';
                
                if (order.items && order.items.length > 0) {
                    order.items.forEach(item => {
                        const row = document.createElement('tr');
                        
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
                            <td>
                                <div class="d-flex align-items-center">
                                    ${item.product?.images?.[0] ? 
                                        `<img src="${item.product.images[0].url}" alt="${productName}" class="product-thumbnail me-2" style="width: 30px; height: 30px; object-fit: cover; border-radius: 4px;">` : 
                                        item.product?.image ?
                                        `<img src="${item.product.image}" alt="${productName}" class="product-thumbnail me-2" style="width: 30px; height: 30px; object-fit: cover; border-radius: 4px;">` :
                                        '<i class="fas fa-tshirt text-muted me-2"></i>'
                                    }
                                    ${productName}
                                </div>
                            </td>
                            <td>${item.size || 'N/A'}</td>
                            <td>
                                <span class="color-badge" style="background-color: ${getColorHex(item.color)}"></span>
                                ${item.color || 'N/A'}
                            </td>
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
            alert('Error loading order details: ' + error.message);
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
                alert('Order status updated successfully');
            } else {
                throw new Error(data.message || 'Failed to update order status');
            }
        })
        .catch(error => {
            console.error('Error updating order status:', error);
            alert('Failed to update order status: ' + error.message);
        });
    }

    // Event listeners for filters - only add if elements exist
    if (searchInput) {
        searchInput.addEventListener('input', applyOrderFilters);
        console.log('Search input listener added');
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', applyOrderFilters);
        console.log('Status filter listener added');
    }
    if (dateFilter) {
        dateFilter.addEventListener('change', applyOrderFilters);
        console.log('Date filter listener added');
    }

    // Initialize orders
    if (ordersBody) {
        loadOrders();
    } else {
        console.error('Orders body element not found in DOM');
    }
});

// Color HEX Helper
function getColorHex(colorName) {
    if (!colorName) return '#cccccc';
    
    const colors = {
        'red': '#ff0000',
        'blue': '#0000ff',
        'green': '#008000',
        'black': '#000000',
        'white': '#ffffff',
        'yellow': '#ffff00',
        'grey': '#808080',
        'gray': '#808080',
        'pink': '#ffc0cb',
        'navy': '#000080',
        'purple': '#800080',
        'orange': '#ffa500',
        'brown': '#a52a2a',
        'maroon': '#800000',
        'teal': '#008080',
        'olive': '#808000',
        'silver': '#c0c0c0'
    };
    return colors[colorName.toLowerCase()] || '#cccccc';
}