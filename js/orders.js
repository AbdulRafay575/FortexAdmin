document.addEventListener('DOMContentLoaded', function() {
    const adminToken = localStorage.getItem('adminToken');
    const ordersBody = document.getElementById('orders-body');
    
    // Load orders
    function loadOrders() {
        fetch('http://localhost:5000/api/orders/admin/orders', {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        })
        .then(response => response.json())
        .then(orders => {
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
                
                // Payment badge
                let paymentBadgeClass = 'badge-warning';
                if (order.paymentStatus === 'Paid') paymentBadgeClass = 'badge-success';
                else if (order.paymentStatus === 'Failed') paymentBadgeClass = 'badge-danger';
                
                row.innerHTML = `
                    <td>${order.orderId}</td>
                    <td>${order.user.name}</td>
                    <td>${formattedDate}</td>
                    <td>${order.items.length}</td>
                    <td>$${order.totalAmount.toFixed(2)}</td>
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
        .catch(error => console.error('Error loading orders:', error));
    }
    
    // View order details (similar to dashboard.js version)
    window.viewOrderDetails = function(orderId)  {
        fetch(`http://localhost:5000/api/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
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
                    <td>$${item.priceAtPurchase.toFixed(2)}</td>
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
        .catch(error => console.error('Error loading order details:', error));
    }
    
    // Update order status (similar to dashboard.js version)
    function updateOrderStatus(orderId, status) {
        fetch(`http://localhost:5000/api/orders/admin/orders/${orderId}`, {
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
                alert('Order status updated successfully');
            } else {
                throw new Error('Failed to update order status');
            }
        })
        .catch(error => {
            console.error('Error updating order status:', error);
            alert('Failed to update order status');
        });
    }
});