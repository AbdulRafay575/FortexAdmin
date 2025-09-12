document.addEventListener('DOMContentLoaded', function() {
    const adminToken = localStorage.getItem('adminToken');
    const customersBody = document.getElementById('customers-body');
    const customerDetailModal = new bootstrap.Modal(document.getElementById('customerDetailModal'));
    
    // Load customers
    function loadCustomers() {
        fetch('http://localhost:5000/api/admin/customers', {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        })
        .then(response => response.json())
        .then(customers => {
            customersBody.innerHTML = '';
            
            customers.forEach(customer => {
                const row = document.createElement('tr');
                
                // Format date
                const joinDate = new Date(customer.createdAt);
                const formattedDate = joinDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                row.innerHTML = `
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                    <td>${formattedDate}</td>
                    <td>${customer.orderHistory ? customer.orderHistory.length : 0}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-customer-btn" data-customer-id="${customer._id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
                
                customersBody.appendChild(row);
            });
            
            // Add event listeners to view buttons
            document.querySelectorAll('.view-customer-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const customerId = this.getAttribute('data-customer-id');
                    viewCustomerDetails(customerId);
                });
            });
        })
        .catch(error => console.error('Error loading customers:', error));
    }
    
    // View customer details
    function viewCustomerDetails(customerId) {
        fetch(`http://localhost:5000/api/admin/customers/${customerId}`, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        })
        .then(response => response.json())
        .then(customer => {
            // Populate basic info
            document.getElementById('customerName').textContent = customer.name;
            document.getElementById('customerEmail').textContent = customer.email;
            document.getElementById('customerPhone').textContent = customer.phone || 'N/A';
            
            // Format join date
            const joinDate = new Date(customer.createdAt);
            const formattedDate = joinDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            document.getElementById('customerJoined').textContent = formattedDate;
            
            // Address - Check if customer has shipping details in any order
            let addressHtml = 'No address on file';
            if (customer.orderHistory && customer.orderHistory.length > 0 && customer.orderHistory[0].shippingDetails) {
                const shipping = customer.orderHistory[0].shippingDetails;
                addressHtml = `
                    ${shipping.street || ''}<br>
                    ${shipping.city || ''}, ${shipping.state || ''} ${shipping.zip || ''}<br>
                    ${shipping.country || ''}
                `;
            }
            document.getElementById('customerAddress').innerHTML = addressHtml;
            
            // Order history
            const customerOrdersBody = document.getElementById('customerOrdersBody');
            customerOrdersBody.innerHTML = '';
            
            if (customer.orderHistory && customer.orderHistory.length > 0) {
                // The order history already contains full order objects - no need to fetch again
                customer.orderHistory.forEach(order => {
                    const row = document.createElement('tr');
                    
                    // Format date
                    const orderDate = new Date(order.createdAt);
                    const formattedDate = orderDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                    
                    // Calculate total items (sum quantities)
                    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                    
                    row.innerHTML = `
                        <td>${order.orderId}</td>
                        <td>${formattedDate}</td>
                        <td>${totalItems} item(s)</td>
                        <td>$${order.totalAmount.toFixed(2)}</td>
                        <td>${order.orderStatus}</td>
                    `;
                    
                    customerOrdersBody.appendChild(row);
                });
            } else {
                customerOrdersBody.innerHTML = '<tr><td colspan="5" class="text-center">No orders found</td></tr>';
            }
            
            // Show modal
            customerDetailModal.show();
        })
        .catch(error => console.error('Error loading customer details:', error));
    }

    // Initialize the page
    loadCustomers();
});