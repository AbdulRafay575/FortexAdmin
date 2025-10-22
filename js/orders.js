document.addEventListener('DOMContentLoaded', function() {
    const adminToken = localStorage.getItem('adminToken');
    const ordersBody = document.getElementById('orders-body');
    
    // Load orders
    function loadOrders() {
        fetch('https://fortexbackend.onrender.com/api/orders/admin/orders', {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to load orders');
            }
            
            const orders = data.data;
            ordersBody.innerHTML = '';
            
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
                let statusBadgeClass = 'badge-primary';
                if (order.orderStatus === 'Delivered') statusBadgeClass = 'badge-success';
                else if (order.orderStatus === 'Shipped') statusBadgeClass = 'badge-info';
                else if (order.orderStatus === 'Processing') statusBadgeClass = 'badge-warning';
                else if (order.orderStatus === 'Cancelled') statusBadgeClass = 'badge-danger';
                
                // Payment badge
                let paymentBadgeClass = 'badge-warning';
                if (order.paymentStatus === 'Paid') paymentBadgeClass = 'badge-success';
                else if (order.paymentStatus === 'Failed') paymentBadgeClass = 'badge-danger';
                
                row.innerHTML = `
                    <td>${order.orderId}</td>
                    <td>${order.user?.name || 'N/A'}</td>
                    <td>${formattedDate}</td>
                    <td>${order.items.length}</td>
                    <td>€${order.totalAmount.toFixed(2)}</td>
                    <td><span class="badge ${paymentBadgeClass}">${order.paymentStatus}</span></td>
                    <td><span class="badge ${statusBadgeClass}">${order.orderStatus}</span></td>
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
        })
        .catch(error => {
            console.error('Error loading orders:', error);
            ordersBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error loading orders: ${error.message}</td></tr>`;
        });
    }
    
    // View order details with design images
    window.viewOrderDetails = function(orderId) {
        fetch(`https://fortexbackend.onrender.com/api/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Failed to load order details');
            }
            
            const order = data.data;
            
            // Populate modal
            document.getElementById('orderDetailId').textContent = order.orderId;
            
            // Customer info
            document.getElementById('customerInfo').innerHTML = `
                <strong>Name:</strong> ${order.shippingDetails.name}<br>
                <strong>Email:</strong> ${order.user?.email || 'N/A'}<br>
                <strong>Phone:</strong> ${order.shippingDetails.phone}
            `;
            
            // Shipping info
            document.getElementById('shippingInfo').innerHTML = `
                ${order.shippingDetails.street}<br>
                ${order.shippingDetails.city}, ${order.shippingDetails.state} ${order.shippingDetails.zip}<br>
                ${order.shippingDetails.country}
            `;
            
            // Order items with design images
            const orderItemsBody = document.getElementById('orderItemsBody');
            orderItemsBody.innerHTML = '';
            
            order.items.forEach(item => {
                const row = document.createElement('tr');
                
                let productName = 'Custom T-Shirt';
                if (item.product && item.product.name) {
                    productName = item.product.name;
                }
                
                // Check if item has custom design
                const hasDesign = item.design && item.design !== '';
                const designCell = hasDesign ? 
                    `<img src="${item.design}" alt="Custom Design" class="design-thumbnail" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" data-bs-toggle="modal" data-bs-target="#designModal" onclick="showDesignImage('${item.design}')">` :
                    '<span class="text-muted">No Design</span>';
                
                row.innerHTML = `
                    <td>
                        <div class="d-flex align-items-center">
                            ${item.product?.images?.[0] ? 
                                `<img src="${item.product.images[0].url}" alt="${productName}" class="product-thumbnail me-2">` : 
                                '<i class="fas fa-tshirt text-muted me-2"></i>'
                            }
                            ${productName}
                        </div>
                    </td>
                    <td>${item.size}</td>
                    <td>
                        <span class="color-badge" style="background-color: ${getColorHex(item.color)}"></span>
                        ${item.color}
                    </td>
                    <td>${designCell}</td>
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
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
            modal.show();
        })
        .catch(error => {
            console.error('Error loading order details:', error);
            alert('Error loading order details: ' + error.message);
        });
    }
    
    // Show design image in modal
    window.showDesignImage = function(designUrl) {
        document.getElementById('designImage').src = designUrl;
        const modal = new bootstrap.Modal(document.getElementById('designModal'));
        modal.show();
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
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Close modal and refresh data
                const modal = bootstrap.Modal.getInstance(document.getElementById('orderDetailModal'));
                modal.hide();
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
    
    // Initialize orders
    loadOrders();
});

// Color HEX Helper
function getColorHex(colorName) {
    const colors = {
        'Red': '#ff0000',
        'Blue': '#0000ff',
        'Green': '#008000',
        'Black': '#000000',
        'White': '#ffffff',
        'Yellow': '#ffff00',
        'Grey': '#808080',
        'Pink': '#ffc0cb',
        'Navy': '#000080',
        'Purple': '#800080',
        'Orange': '#ffa500',
        'Brown': '#a52a2a'
    };
    return colors[colorName] || '#cccccc';
}