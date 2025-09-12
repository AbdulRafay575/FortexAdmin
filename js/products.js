// Global variables
let adminToken;
let productsBody;
let addProductBtn;
let productModal;
let productForm;
let saveProductBtn;
let productImage;
let imagePreview;

// Load products (GLOBAL)
function loadProducts() {
    fetch('https://fortexbackend.onrender.com/api/products', {
        headers: {
            'Authorization': `Bearer ${adminToken}`
        }
    })
    .then(response => response.json())
    .then(products => {
        productsBody.innerHTML = '';

        products.forEach(product => {
            const row = document.createElement('tr');

            const sizes = product.availableSizes.join(', ');
            const colors = product.availableColors.map(color =>
                `<span class="color-badge" style="background-color: ${getColorHex(color)}"></span>${color}`
            ).join(', ');

            const createdAt = new Date(product.createdAt);
            const formattedDate = createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            let imageCell = '<i class="fas fa-tshirt text-muted"></i>';
            if (product.image) {
                imageCell = `<img src="http://localhost:5000${product.image}" alt="${product.name}" style="height: 50px;">`;
            }

            row.innerHTML = `
                <td>${imageCell}</td>
                <td>${product.name}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${sizes}</td>
                <td>${colors}</td>
                <td>${formattedDate}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary edit-product-btn" data-product-id="${product._id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-product-btn" data-product-id="${product._id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            productsBody.appendChild(row);
        });

        document.querySelectorAll('.edit-product-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const productId = this.getAttribute('data-product-id');
                editProduct(productId);
            });
        });

        document.querySelectorAll('.delete-product-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const productId = this.getAttribute('data-product-id');
                if (confirm('Are you sure you want to delete this product?')) {
                    deleteProduct(productId);
                }
            });
        });
    })
    .catch(error => console.error('Error loading products:', error));
}

// Delete product (GLOBAL)
function deleteProduct(productId) {
    fetch(`https://fortexbackend.onrender.com/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${adminToken}`
        }
    })
    .then(response => {
        if (response.ok) {
            loadProducts();
            alert('Product deleted successfully');
        } else {
            throw new Error('Failed to delete product');
        }
    })
    .catch(error => {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
    });
}

// Edit product (LOCAL)
function editProduct(productId) {
    fetch(`https://fortexbackend.onrender.com/api/products/${productId}`, {
        headers: {
            'Authorization': `Bearer ${adminToken}`
        }
    })
    .then(response => response.json())
    .then(product => {
        document.getElementById('productId').value = product._id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productModalTitle').textContent = 'Edit Product';

        document.querySelectorAll('.size-checkbox').forEach(cb => {
            cb.checked = product.availableSizes.includes(cb.value);
        });

        const colorCheckboxes = document.getElementById('colorCheckboxes');
        colorCheckboxes.innerHTML = '';

        product.availableColors.forEach(color => {
            const colorId = color.replace(/\s+/g, '-').toLowerCase();
            const div = document.createElement('div');
            div.className = 'form-check';
            div.innerHTML = `
                <input class="form-check-input color-checkbox" type="checkbox" value="${color}" id="color-${colorId}" checked>
                <label class="form-check-label" for="color-${colorId}">${color}</label>
            `;
            colorCheckboxes.appendChild(div);
        });

        if (product.image) {
            imagePreview.src = `http://localhost:5000${product.image}`;
            imagePreview.classList.remove('d-none');
        } else {
            imagePreview.classList.add('d-none');
        }

        productModal.show();
    })
    .catch(error => console.error('Error loading product:', error));
}

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
        'Pink': '#ffc0cb'
    };
    return colors[colorName] || '#cccccc';
}

document.addEventListener('DOMContentLoaded', function () {
    adminToken = localStorage.getItem('adminToken');
    productsBody = document.getElementById('products-body');
    addProductBtn = document.getElementById('add-product-btn');
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
    productForm = document.getElementById('productForm');
    saveProductBtn = document.getElementById('saveProductBtn');
    productImage = document.getElementById('productImage');
    imagePreview = document.getElementById('imagePreview');

    addProductBtn.addEventListener('click', function () {
        productForm.reset();
        document.getElementById('productId').value = '';
        document.getElementById('productModalTitle').textContent = 'Add Product';
        imagePreview.classList.add('d-none');

        document.querySelectorAll('.size-checkbox').forEach(cb => cb.checked = false);
        document.getElementById('colorCheckboxes').innerHTML = '';

        productModal.show();
    });

    document.getElementById('addColorBtn').addEventListener('click', function () {
        const newColor = document.getElementById('newColor').value.trim();
        if (newColor) {
            const colorId = newColor.replace(/\s+/g, '-').toLowerCase();
            const colorCheckboxes = document.getElementById('colorCheckboxes');
            if (!document.getElementById(`color-${colorId}`)) {
                const div = document.createElement('div');
                div.className = 'form-check';
                div.innerHTML = `
                    <input class="form-check-input color-checkbox" type="checkbox" value="${newColor}" id="color-${colorId}" checked>
                    <label class="form-check-label" for="color-${colorId}">${newColor}</label>
                `;
                colorCheckboxes.appendChild(div);
                document.getElementById('newColor').value = '';
            }
        }
    });

    productImage.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('d-none');
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    saveProductBtn.addEventListener('click', function () {
        const productId = document.getElementById('productId').value;
        const formData = new FormData();

        formData.append('name', document.getElementById('productName').value);
        formData.append('description', document.getElementById('productDescription').value);
        formData.append('price', document.getElementById('productPrice').value);

        document.querySelectorAll('.size-checkbox:checked').forEach(cb => {
            formData.append('availableSizes', cb.value);
        });
        document.querySelectorAll('.color-checkbox:checked').forEach(cb => {
            formData.append('availableColors', cb.value);
        });
        if (productImage.files[0]) {
            formData.append('image', productImage.files[0]);
        }

        const url = productId ? `https://fortexbackend.onrender.com/api/products/${productId}` : 'https://fortexbackend.onrender.com/api/products';
        const method = productId ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${adminToken}`
            },
            body: formData
        })
        .then(response => {
            if (response.ok) {
                productModal.hide();
                loadProducts();
                alert('Product saved successfully');
            } else {
                throw new Error('Failed to save product');
            }
        })
        .catch(error => {
            console.error('Error saving product:', error);
            alert('Failed to save product');
        });
    });
});

// Make functions globally accessible
window.loadProducts = loadProducts;
window.deleteProduct = deleteProduct;
