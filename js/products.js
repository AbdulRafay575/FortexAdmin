// Global variables
let adminToken;
let productsBody;
let addProductBtn;
let productModal;
let productForm;
let saveProductBtn;
let productImages;
let imagePreviewContainer;
let currentProductImages = []; // Store existing product images
let selectedFiles = []; // Store newly selected files

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

            // Display multiple images with primary indicator
            let imagesCell = '<i class="fas fa-tshirt text-muted"></i>';
            if (product.images && product.images.length > 0) {
                const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
                const displayImages = product.images.slice(0, 3);
                
                imagesCell = `
                    <div class="product-image-grid">
                        ${displayImages.map((img, index) => `
                            <div class="image-thumb-container">
                                <img src="${img.url}" alt="${product.name}" class="product-image-thumb" 
                                     title="${img.isPrimary ? 'Primary Image' : 'Image ' + (index + 1)}">
                                ${img.isPrimary ? '<span class="primary-indicator">★</span>' : ''}
                            </div>
                        `).join('')}
                        ${product.images.length > 3 ? `
                            <div class="product-image-thumb more" title="+${product.images.length - 3} more">
                                +${product.images.length - 3}
                            </div>
                        ` : ''}
                    </div>
                `;
            }

            row.innerHTML = `
                <td>${imagesCell}</td>
                <td>${product.name}</td>
                <td>€${product.price.toFixed(2)}</td>
                <td>${sizes}</td>
                <td>${colors}</td>
                <td>${product.stylee || 'Regular'}</td>
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
    .catch(error => {
        console.error('Error loading products:', error);
        productsBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error loading products: ${error.message}</td></tr>`;
    });
}

// Delete product (GLOBAL)
function deleteProduct(productId) {
    fetch(`https://fortexbackend.onrender.com/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${adminToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadProducts();
            alert('Product deleted successfully');
        } else {
            throw new Error(data.message || 'Failed to delete product');
        }
    })
    .catch(error => {
        console.error('Error deleting product:', error);
        alert('Failed to delete product: ' + error.message);
    });
}

// Edit product
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
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.stylee || 'Regular';
        document.getElementById('productModalTitle').textContent = 'Edit Product';

        // Set size checkboxes
        document.querySelectorAll('.size-checkbox').forEach(cb => {
            cb.checked = product.availableSizes.includes(cb.value);
        });

        // Set color checkboxes
        const colorCheckboxes = document.getElementById('colorCheckboxes');
        colorCheckboxes.innerHTML = '';

        // Get all unique colors from the product
        const uniqueColors = [...new Set(product.availableColors)];
        uniqueColors.forEach(color => {
            const colorId = color.replace(/\s+/g, '-').toLowerCase();
            const div = document.createElement('div');
            div.className = 'form-check form-check-inline';
            div.innerHTML = `
                <input class="form-check-input color-checkbox" type="checkbox" value="${color}" id="color-${colorId}" checked>
                <label class="form-check-label" for="color-${colorId}">
                    <span class="color-badge" style="background-color: ${getColorHex(color)}"></span>
                    ${color}
                </label>
            `;
            colorCheckboxes.appendChild(div);
        });

        // Store and display existing images
        currentProductImages = product.images || [];
        selectedFiles = []; // Reset selected files for edit mode
        renderImagePreviews();

        productModal.show();
    })
    .catch(error => {
        console.error('Error loading product:', error);
        alert('Error loading product: ' + error.message);
    });
}

// Render image previews
function renderImagePreviews() {
    imagePreviewContainer.innerHTML = '';
    
    // Show existing images
    currentProductImages.forEach((img, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item existing';
        previewItem.innerHTML = `
            <img src="${img.url}" alt="Product Image ${index + 1}">
            ${img.isPrimary ? '<span class="primary-badge">Primary</span>' : ''}
            <div class="image-actions">
                <button type="button" class="btn btn-sm btn-danger delete-existing-btn" data-image-id="${img._id}" title="Delete Image">
                    <i class="fas fa-trash"></i>
                </button>
                ${!img.isPrimary ? `
                    <button type="button" class="btn btn-sm btn-primary set-primary-btn" data-image-id="${img._id}" title="Set as Primary">
                        <i class="fas fa-star"></i>
                    </button>
                ` : ''}
            </div>
        `;
        imagePreviewContainer.appendChild(previewItem);
    });
    
    // Show newly selected files
    selectedFiles.forEach((file, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item new';
        const objectUrl = URL.createObjectURL(file);
        previewItem.innerHTML = `
            <img src="${objectUrl}" alt="New Image ${index + 1}">
            <div class="image-actions">
                <button type="button" class="btn btn-sm btn-danger remove-new-btn" data-file-index="${index}" title="Remove Image">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        imagePreviewContainer.appendChild(previewItem);
    });
    
    // Add event listeners
    imagePreviewContainer.querySelectorAll('.delete-existing-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const imageId = this.getAttribute('data-image-id');
            deleteProductImage(document.getElementById('productId').value, imageId);
        });
    });
    
    imagePreviewContainer.querySelectorAll('.set-primary-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const imageId = this.getAttribute('data-image-id');
            setPrimaryImage(document.getElementById('productId').value, imageId);
        });
    });
    
    imagePreviewContainer.querySelectorAll('.remove-new-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const fileIndex = parseInt(this.getAttribute('data-file-index'));
            removeNewFile(fileIndex);
        });
    });
}

// Remove newly selected file
function removeNewFile(fileIndex) {
    selectedFiles.splice(fileIndex, 1);
    renderImagePreviews();
}

// Delete product image
function deleteProductImage(productId, imageId) {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    fetch(`https://fortexbackend.onrender.com/api/products/${productId}/images/${imageId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${adminToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Remove from current images array and re-render
            currentProductImages = currentProductImages.filter(img => img._id !== imageId);
            renderImagePreviews();
            alert('Image deleted successfully');
        } else {
            throw new Error(data.message || 'Failed to delete image');
        }
    })
    .catch(error => {
        console.error('Error deleting image:', error);
        alert('Failed to delete image: ' + error.message);
    });
}

// Set primary image
function setPrimaryImage(productId, imageId) {
    fetch(`https://fortexbackend.onrender.com/api/products/${productId}/images/${imageId}/primary`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${adminToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update current images array and re-render
            currentProductImages.forEach(img => {
                img.isPrimary = img._id === imageId;
            });
            renderImagePreviews();
            alert('Primary image updated successfully');
        } else {
            throw new Error(data.message || 'Failed to set primary image');
        }
    })
    .catch(error => {
        console.error('Error setting primary image:', error);
        alert('Failed to set primary image: ' + error.message);
    });
}

// Initialize products management
document.addEventListener('DOMContentLoaded', function () {
    adminToken = localStorage.getItem('adminToken');
    productsBody = document.getElementById('products-body');
    addProductBtn = document.getElementById('add-product-btn');
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
    productForm = document.getElementById('productForm');
    saveProductBtn = document.getElementById('saveProductBtn');
    productImages = document.getElementById('productImages');
    imagePreviewContainer = document.getElementById('imagePreviewContainer');

    // Add product button
    addProductBtn.addEventListener('click', function () {
        productForm.reset();
        document.getElementById('productId').value = '';
        document.getElementById('productModalTitle').textContent = 'Add Product';
        document.getElementById('productCategory').value = 'Regular';
        currentProductImages = [];
        selectedFiles = [];
        imagePreviewContainer.innerHTML = '';

        // Reset checkboxes
        document.querySelectorAll('.size-checkbox').forEach(cb => cb.checked = false);
        document.getElementById('colorCheckboxes').innerHTML = '';

        productModal.show();
    });

    // Add color button
    document.getElementById('addColorBtn').addEventListener('click', function () {
        const newColor = document.getElementById('newColor').value.trim();
        if (newColor) {
            const colorId = newColor.replace(/\s+/g, '-').toLowerCase();
            const colorCheckboxes = document.getElementById('colorCheckboxes');
            if (!document.getElementById(`color-${colorId}`)) {
                const div = document.createElement('div');
                div.className = 'form-check form-check-inline';
                div.innerHTML = `
                    <input class="form-check-input color-checkbox" type="checkbox" value="${newColor}" id="color-${colorId}" checked>
                    <label class="form-check-label" for="color-${colorId}">
                        <span class="color-badge" style="background-color: ${getColorHex(newColor)}"></span>
                        ${newColor}
                    </label>
                `;
                colorCheckboxes.appendChild(div);
                document.getElementById('newColor').value = '';
            } else {
                alert('Color already exists!');
            }
        }
    });

    // Handle multiple image selection
    productImages.addEventListener('change', function () {
        const files = Array.from(this.files);
        
        // Add new files to selectedFiles array
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                selectedFiles.push(file);
            }
        });
        
        // Update preview
        renderImagePreviews();
        
        // Clear the file input to allow selecting the same files again
        this.value = '';
    });

    // Save product
    saveProductBtn.addEventListener('click', function () {
        const productId = document.getElementById('productId').value;
        const formData = new FormData();

        // Basic product data
        formData.append('name', document.getElementById('productName').value);
        formData.append('description', document.getElementById('productDescription').value);
        formData.append('price', document.getElementById('productPrice').value);
        formData.append('stylee', document.getElementById('productCategory').value);

        // Handle arrays properly for sizes and colors
        const selectedSizes = Array.from(document.querySelectorAll('.size-checkbox:checked')).map(cb => cb.value);
        const selectedColors = Array.from(document.querySelectorAll('.color-checkbox:checked')).map(cb => cb.value);
        
        // Validate required fields
        if (!formData.get('name') || !formData.get('price')) {
            alert('Product name and price are required!');
            return;
        }

        if (selectedSizes.length === 0) {
            alert('Please select at least one size!');
            return;
        }

        if (selectedColors.length === 0) {
            alert('Please select at least one color!');
            return;
        }
        
        // Append each size and color individually
        selectedSizes.forEach(size => formData.append('availableSizes', size));
        selectedColors.forEach(color => formData.append('availableColors', color));
        
        // Add new image files
        selectedFiles.forEach(file => {
            formData.append('images', file);
        });

        const url = productId ? `https://fortexbackend.onrender.com/api/products/${productId}` : 'https://fortexbackend.onrender.com/api/products';
        const method = productId ? 'PUT' : 'POST';

        // Show loading state
        saveProductBtn.disabled = true;
        saveProductBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${adminToken}`
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                productModal.hide();
                loadProducts();
                alert('Product saved successfully');
            } else {
                throw new Error(data.message || 'Failed to save product');
            }
        })
        .catch(error => {
            console.error('Error saving product:', error);
            alert('Failed to save product: ' + error.message);
        })
        .finally(() => {
            // Reset button state
            saveProductBtn.disabled = false;
            saveProductBtn.innerHTML = '<i class="fas fa-save"></i> Save Product';
        });
    });

    // Load initial products
    loadProducts();
});

// Make functions globally accessible
window.loadProducts = loadProducts;
window.deleteProduct = deleteProduct;