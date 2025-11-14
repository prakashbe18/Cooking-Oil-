// Data Management
const Storage = {
    getProducts() {
        const products = localStorage.getItem('products');
        return products ? JSON.parse(products) : [];
    },
    
    saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
    },
    
    getCart() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
    },
    
    saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    },
    
    getBills() {
        const bills = localStorage.getItem('bills');
        return bills ? JSON.parse(bills) : [];
    },
    
    saveBills(bills) {
        localStorage.setItem('bills', JSON.stringify(bills));
    }
};

// Initialize default products
function initializeDefaultProducts() {
    const products = Storage.getProducts();
    if (products.length === 0) {
        const defaultProducts = [
            {
                id: 1,
                name: 'Groundnut Oil',
                price: 150.00,
                image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400'
            },
            {
                id: 2,
                name: 'Sesame Oil',
                price: 200.00,
                image: 'https://images.unsplash.com/photo-1606914469633-bd39206ea739?w=400'
            },
            {
                id: 3,
                name: 'Coconut Oil',
                price: 180.00,
                image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400'
            }
        ];
        Storage.saveProducts(defaultProducts);
    }
}

// Product Management
let currentProductId = null;

function generateProductId() {
    const products = Storage.getProducts();
    return products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
}

function renderProducts() {
    const products = Storage.getProducts();
    const productsGrid = document.getElementById('products-grid');
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 2rem;">No products available. Add your first product!</p>';
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <img src="${product.image || 'https://via.placeholder.com/400x300?text=Oil'}" 
                 alt="${product.name}" 
                 class="product-image"
                 onerror="this.src='https://via.placeholder.com/400x300?text=Oil'">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">₹${product.price.toFixed(2)}</p>
                <div class="product-actions">
                    <button class="btn btn-primary btn-sm add-to-cart-btn" data-product-id="${product.id}">
                        Add to Cart
                    </button>
                    <button class="btn btn-secondary btn-sm edit-product-btn" data-product-id="${product.id}">
                        Edit
                    </button>
                    <button class="btn btn-danger btn-sm delete-product-btn" data-product-id="${product.id}">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Attach event listeners
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = parseInt(btn.dataset.productId);
            addToCart(productId);
        });
    });
    
    document.querySelectorAll('.edit-product-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = parseInt(btn.dataset.productId);
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.delete-product-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = parseInt(btn.dataset.productId);
            deleteProduct(productId);
        });
    });
}

function openProductModal(isEdit = false) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('modal-title');
    
    if (isEdit) {
        title.textContent = 'Edit Product';
    } else {
        title.textContent = 'Add Product';
        form.reset();
        document.getElementById('product-id').value = '';
        currentProductId = null;
    }
    
    modal.classList.add('active');
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('active');
    document.getElementById('product-form').reset();
    currentProductId = null;
}

function editProduct(productId) {
    const products = Storage.getProducts();
    const product = products.find(p => p.id === productId);
    
    if (product) {
        currentProductId = productId;
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-image').value = product.image || '';
        openProductModal(true);
    }
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        const products = Storage.getProducts();
        const filteredProducts = products.filter(p => p.id !== productId);
        Storage.saveProducts(filteredProducts);
        renderProducts();
    }
}

function saveProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const image = document.getElementById('product-image').value.trim();
    const productId = document.getElementById('product-id').value;
    
    if (!name || !price || price < 0) {
        alert('Please fill in all required fields with valid values.');
        return;
    }
    
    const products = Storage.getProducts();
    
    if (productId) {
        // Update existing product
        const index = products.findIndex(p => p.id === parseInt(productId));
        if (index !== -1) {
            products[index] = {
                id: parseInt(productId),
                name,
                price,
                image: image || products[index].image
            };
        }
    } else {
        // Add new product
        products.push({
            id: generateProductId(),
            name,
            price,
            image: image || ''
        });
    }
    
    Storage.saveProducts(products);
    renderProducts();
    closeProductModal();
}

// Cart Management
function addToCart(productId) {
    const products = Storage.getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const cart = Storage.getCart();
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    Storage.saveCart(cart);
    renderCart();
    updateCartCount();
    
    // Show notification
    showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    const cart = Storage.getCart();
    const filteredCart = cart.filter(item => item.productId !== productId);
    Storage.saveCart(filteredCart);
    renderCart();
    updateCartCount();
}

function updateCartQuantity(productId, change) {
    const cart = Storage.getCart();
    const item = cart.find(item => item.productId === productId);
    
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
            return;
        }
    }
    
    Storage.saveCart(cart);
    renderCart();
    updateCartCount();
}

function clearCart() {
    if (confirm('Are you sure you want to clear the cart?')) {
        Storage.saveCart([]);
        renderCart();
        updateCartCount();
    }
}

function renderCart() {
    const cart = Storage.getCart();
    const cartItems = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        updateCartSummary();
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price.toFixed(2)} each</div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.productId}, -1)">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity(${item.productId}, 1)">+</button>
                </div>
                <div class="cart-item-total">₹${(item.price * item.quantity).toFixed(2)}</div>
                <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.productId})">Remove</button>
            </div>
        </div>
    `).join('');
    
    updateCartSummary();
}

function updateCartSummary() {
    const cart = Storage.getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    document.getElementById('cart-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('cart-tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `₹${total.toFixed(2)}`;
}

function updateCartCount() {
    const cart = Storage.getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

// Billing System
function generateBillId() {
    return 'BILL-' + Date.now();
}

function payNow() {
    const cart = Storage.getCart();
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    // Generate bill
    const bill = {
        id: generateBillId(),
        date: new Date().toISOString(),
        items: cart.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        subtotal,
        tax,
        total
    };
    
    // Save bill
    const bills = Storage.getBills();
    bills.push(bill);
    Storage.saveBills(bills);
    
    // Show QR code
    showQRCode(total);
    
    // Clear cart
    Storage.saveCart([]);
    renderCart();
    updateCartCount();
    
    // Refresh bills view if active
    if (document.getElementById('bills-section').classList.contains('active')) {
        renderBills();
    }
    
    showNotification('Payment initiated! Please scan the QR code.');
}

function showQRCode(amount) {
    const modal = document.getElementById('qr-modal');
    const canvas = document.getElementById('qr-code');
    const amountDisplay = document.getElementById('qr-amount');
    
    amountDisplay.textContent = amount.toFixed(2);
    
    // Generate QR code with payment information
    const paymentInfo = `Payment Amount: ₹${amount.toFixed(2)}\nBill ID: ${generateBillId()}\nDate: ${new Date().toLocaleString()}`;
    
    QRCode.toCanvas(canvas, paymentInfo, {
        width: 300,
        margin: 2
    }, function (error) {
        if (error) {
            console.error('QR Code generation error:', error);
            canvas.getContext('2d').fillText('QR Code Error', 10, 50);
        }
    });
    
    modal.classList.add('active');
}

function closeQRModal() {
    document.getElementById('qr-modal').classList.remove('active');
}

function generateBill() {
    const cart = Storage.getCart();
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    const billId = generateBillId();
    const billDate = new Date().toLocaleString();
    
    // Display bill in modal
    document.getElementById('bill-id-display').textContent = billId;
    document.getElementById('bill-date-display').textContent = billDate;
    
    const billItemsDisplay = document.getElementById('bill-items-display');
    billItemsDisplay.innerHTML = cart.map(item => `
        <div class="bill-item-row">
            <div>
                <strong>${item.name}</strong><br>
                <span style="color: #6c757d;">₹${item.price.toFixed(2)} × ${item.quantity}</span>
            </div>
            <div style="font-weight: bold;">₹${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
    
    billItemsDisplay.innerHTML += `
        <div class="bill-item-row">
            <div><strong>Subtotal</strong></div>
            <div>₹${subtotal.toFixed(2)}</div>
        </div>
        <div class="bill-item-row">
            <div><strong>Tax (5%)</strong></div>
            <div>₹${tax.toFixed(2)}</div>
        </div>
    `;
    
    document.getElementById('bill-total-display').textContent = total.toFixed(2);
    
    document.getElementById('bill-modal').classList.add('active');
}

function printBill() {
    window.print();
}

function closeBillModal() {
    document.getElementById('bill-modal').classList.remove('active');
}

// Bills Management
function renderBills(searchTerm = '') {
    let bills = Storage.getBills();
    
    // Filter by search term
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        bills = bills.filter(bill => 
            bill.id.toLowerCase().includes(term) ||
            bill.date.toLowerCase().includes(term)
        );
    }
    
    // Sort by date (newest first)
    bills.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const billsContainer = document.getElementById('bills-container');
    
    if (bills.length === 0) {
        billsContainer.innerHTML = '<p style="text-align: center; padding: 2rem; grid-column: 1/-1;">No bills found.</p>';
        return;
    }
    
    billsContainer.innerHTML = bills.map(bill => {
        const billDate = new Date(bill.date).toLocaleString();
        return `
            <div class="bill-card">
                <div class="bill-header-info">
                    <span class="bill-id">${bill.id}</span>
                    <span class="bill-date">${billDate}</span>
                </div>
                <div class="bill-amount">₹${bill.total.toFixed(2)}</div>
                <p style="color: #6c757d; margin: 0.5rem 0;">${bill.items.length} item(s)</p>
                <div class="bill-actions">
                    <button class="btn btn-primary btn-sm" onclick="viewBill('${bill.id}')">View</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBill('${bill.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function viewBill(billId) {
    const bills = Storage.getBills();
    const bill = bills.find(b => b.id === billId);
    
    if (!bill) return;
    
    const billDate = new Date(bill.date).toLocaleString();
    
    document.getElementById('bill-id-display').textContent = bill.id;
    document.getElementById('bill-date-display').textContent = billDate;
    
    const billItemsDisplay = document.getElementById('bill-items-display');
    billItemsDisplay.innerHTML = bill.items.map(item => `
        <div class="bill-item-row">
            <div>
                <strong>${item.name}</strong><br>
                <span style="color: #6c757d;">₹${item.price.toFixed(2)} × ${item.quantity}</span>
            </div>
            <div style="font-weight: bold;">₹${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');
    
    billItemsDisplay.innerHTML += `
        <div class="bill-item-row">
            <div><strong>Subtotal</strong></div>
            <div>₹${bill.subtotal.toFixed(2)}</div>
        </div>
        <div class="bill-item-row">
            <div><strong>Tax (5%)</strong></div>
            <div>₹${bill.tax.toFixed(2)}</div>
        </div>
    `;
    
    document.getElementById('bill-total-display').textContent = bill.total.toFixed(2);
    
    document.getElementById('bill-modal').classList.add('active');
}

function deleteBill(billId) {
    if (confirm('Are you sure you want to delete this bill?')) {
        const bills = Storage.getBills();
        const filteredBills = bills.filter(b => b.id !== billId);
        Storage.saveBills(filteredBills);
        renderBills(document.getElementById('bill-search').value);
    }
}

// Reports
function generateReport() {
    const monthInput = document.getElementById('report-month').value;
    
    if (!monthInput) {
        alert('Please select a month');
        return;
    }
    
    const [year, month] = monthInput.split('-');
    const bills = Storage.getBills();
    
    // Filter bills for selected month
    const monthBills = bills.filter(bill => {
        const billDate = new Date(bill.date);
        return billDate.getFullYear() == year && (billDate.getMonth() + 1) == month;
    });
    
    // Calculate totals
    const totalSales = monthBills.reduce((sum, bill) => sum + bill.total, 0);
    const totalOrders = monthBills.length;
    const totalItems = monthBills.reduce((sum, bill) => 
        sum + bill.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    
    // Calculate sales by product
    const productSales = {};
    monthBills.forEach(bill => {
        bill.items.forEach(item => {
            if (!productSales[item.name]) {
                productSales[item.name] = {
                    quantity: 0,
                    revenue: 0
                };
            }
            productSales[item.name].quantity += item.quantity;
            productSales[item.name].revenue += item.price * item.quantity;
        });
    });
    
    // Update display
    document.getElementById('total-sales').textContent = `₹${totalSales.toFixed(2)}`;
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('total-items').textContent = totalItems;
    
    // Update chart
    renderSalesChart(productSales);
    
    // Update table
    const tableBody = document.getElementById('sales-table-body');
    if (Object.keys(productSales).length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem;">No sales data for this month</td></tr>';
    } else {
        tableBody.innerHTML = Object.entries(productSales)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .map(([product, data]) => `
                <tr>
                    <td>${product}</td>
                    <td>${data.quantity}</td>
                    <td>₹${data.revenue.toFixed(2)}</td>
                </tr>
            `).join('');
    }
}

// Chart rendering
function renderSalesChart(productSales) {
    const canvas = document.getElementById('sales-chart');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (Object.keys(productSales).length === 0) {
        ctx.font = '20px Arial';
        ctx.fillStyle = '#6c757d';
        ctx.textAlign = 'center';
        ctx.fillText('No sales data available', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const entries = Object.entries(productSales)
        .sort((a, b) => b[1].revenue - a[1].revenue);
    
    const maxRevenue = Math.max(...entries.map(e => e[1].revenue));
    const barWidth = (canvas.width - 200) / entries.length;
    const chartHeight = canvas.height - 100;
    const barSpacing = 20;
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];
    
    // Draw bars
    entries.forEach(([product, data], index) => {
        const barHeight = (data.revenue / maxRevenue) * chartHeight;
        const x = 100 + index * (barWidth + barSpacing);
        const y = canvas.height - 80 - barHeight;
        const color = colors[index % colors.length];
        
        // Draw bar
        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw value on top of bar
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`₹${data.revenue.toFixed(0)}`, x + barWidth / 2, y - 5);
        
        // Draw product name below
        ctx.fillStyle = '#667eea';
        ctx.font = 'bold 12px Arial';
        ctx.save();
        ctx.translate(x + barWidth / 2, canvas.height - 60);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(product, 0, 0);
        ctx.restore();
    });
    
    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(80, 20);
    ctx.lineTo(80, canvas.height - 80);
    ctx.stroke();
    // X-axis
    ctx.beginPath();
    ctx.moveTo(80, canvas.height - 80);
    ctx.lineTo(canvas.width - 20, canvas.height - 80);
    ctx.stroke();
    
    // Y-axis labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const value = (maxRevenue / 5) * i;
        const y = canvas.height - 80 - (i / 5) * chartHeight;
        ctx.fillText(`₹${value.toFixed(0)}`, 75, y + 5);
    }
    
    // Chart title
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Revenue by Product', canvas.width / 2, 15);
}

// Navigation
function switchSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    // Add active class to nav link
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Render appropriate content
    if (sectionName === 'products') {
        renderProducts();
    } else if (sectionName === 'cart') {
        renderCart();
    } else if (sectionName === 'bills') {
        renderBills();
    } else if (sectionName === 'reports') {
        // Set current month as default
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        document.getElementById('report-month').value = currentMonth;
        generateReport();
    }
}

// Utility Functions
function showNotification(message) {
    // Simple notification (can be enhanced with a toast library)
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 3000;
        animation: slideIn 0.3s;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize
    initializeDefaultProducts();
    renderProducts();
    renderCart();
    updateCartCount();
    renderBills();
    
    // Set current month for reports
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('report-month').value = currentMonth;
    generateReport();
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            switchSection(section);
        });
    });
    
    // Product form
    document.getElementById('product-form').addEventListener('submit', saveProduct);
    document.getElementById('add-product-btn').addEventListener('click', () => openProductModal(false));
    document.getElementById('cancel-product-btn').addEventListener('click', closeProductModal);
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Cart actions
    document.getElementById('clear-cart-btn').addEventListener('click', clearCart);
    document.getElementById('pay-now-btn').addEventListener('click', payNow);
    document.getElementById('bill-btn').addEventListener('click', generateBill);
    
    // QR modal
    document.getElementById('close-qr-btn').addEventListener('click', closeQRModal);
    
    // Bill modal
    document.getElementById('print-bill-btn').addEventListener('click', printBill);
    
    // Bill search
    document.getElementById('bill-search').addEventListener('input', (e) => {
        renderBills(e.target.value);
    });
    
    // Reports
    document.getElementById('generate-report-btn').addEventListener('click', generateReport);
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
});

// Make functions globally available for inline event handlers
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.viewBill = viewBill;
window.deleteBill = deleteBill;

