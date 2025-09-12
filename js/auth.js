document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the login page
    if (document.getElementById('loginForm')) {
        const loginForm = document.getElementById('loginForm');
        const loginError = document.getElementById('loginError');
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            fetch('http://localhost:5000/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Login failed');
                }
                return response.json();
            })
            .then(data => {
                // Store the token and admin data
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminEmail', data.email);
                localStorage.setItem('adminId', data._id);
                
                // Redirect to dashboard
                window.location.href = 'index.html';
            })
            .catch(error => {
                loginError.textContent = 'Invalid email or password';
                loginError.classList.remove('d-none');
                console.error('Error:', error);
            });
        });
    }
    
    // Check if we're on the dashboard and need to verify auth
    if (document.getElementById('logout-btn')) {
        const adminToken = localStorage.getItem('adminToken');
        
        if (!adminToken) {
            // Not logged in, redirect to login
            window.location.href = 'login.html';
        } else {
            // Set admin name in navbar
            const adminEmail = localStorage.getItem('adminEmail');
            document.getElementById('admin-name').textContent = adminEmail.split('@')[0];
        }
        
        // Logout functionality
        document.getElementById('logout-btn').addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminEmail');
            localStorage.removeItem('adminId');
            window.location.href = 'login.html';
        });
    }
});