let currentUser = localStorage.getItem("user") || null;
localStorage.removeItem("guestCart");
let allProducts = [];
const cartModal = document.getElementById("cart-modal");


const productList = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");
const adminPreview = document.getElementById("admin-preview");


// Mobile menu toggle
const menuToggle = document.getElementById("mobile-menu");
const navLinks = document.querySelector(".nav-links");
menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});
//search function
document.getElementById("search-bar").addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();

    const filtered = allProducts.filter(p =>
        p.name.toLowerCase().includes(value)
    );

    displayProducts(filtered);
});

//Price filter
document.getElementById("price-filter").addEventListener("change", (e) => {
    const value = e.target.value;

    let filtered = allProducts;

    if (value === "low") {
        filtered = allProducts.filter(p => p.price < 500);
    } else if (value === "mid") {
        filtered = allProducts.filter(p => p.price >= 500 && p.price <= 1000);
    } else if (value === "high") {
        filtered = allProducts.filter(p => p.price > 1000);
    }

    displayProducts(filtered);
});



// Fetch products
function loadProducts() {
    productList.innerHTML = "<p>Loading products...</p>";

    fetch("https://campus-store-api.onrender.com/api/products")
    .then(res => res.json())
    .then(data => {
        allProducts = data;
        displayProducts(data);
        displayAdminPreview(data);
        displayTrending(data);
    });
}


function displayProducts(products) {
    productList.innerHTML = "";
    products.forEach(product => {
        const div = document.createElement("div");
        div.classList.add("product");
        div.setAttribute("onclick", `openProduct('${product._id}')`);
        div.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>KES ${product.price}</p>
            <button onclick="event.stopPropagation(); addToCart('${product._id}', this, 1)">Add to Cart</button>
        `;
        productList.appendChild(div);
    });
}
function openCart() {
    cartModal.style.display = "block";

    if (currentUser) {
        fetchCart();
    } else {
        displayGuestCart(); // ✅ NEW
    }
}
function displayGuestCart() {
    const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];

    cartItemsDiv.innerHTML = "";

    if (guestCart.length === 0) {
        cartItemsDiv.innerHTML = "<p>Your cart is empty</p>";
        cartTotal.textContent = "";
        cartCount.textContent = "0";
        return;
    }

    let total = 0;

    guestCart.forEach(item => {
        const product = allProducts.find(p => p._id === item.productId);
        if (!product) return;

        const itemTotal = product.price * item.quantity;
        total += itemTotal;

        const div = document.createElement("div");
        div.classList.add("cart-item");

        div.innerHTML = `
            <img src="${product.image}">
            <span>${product.name}</span>
            <span>KES ${product.price}</span>
            <span>${item.quantity}</span>
            <span>Total: KES ${itemTotal}</span>
        `;

        cartItemsDiv.appendChild(div);
    });

    cartTotal.textContent = "Cart Total: KES " + total;
    cartCount.textContent = guestCart.reduce((a,b)=> a+b.quantity,0);
}


// Open Product Detail Modal
function openProduct(productId) {
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;

    document.getElementById("product-modal-image").src = product.image;
    document.getElementById("product-modal-name").textContent = product.name;
    document.getElementById("product-modal-price").textContent = "KES " + product.price;
    document.getElementById("product-modal-description").textContent = product.description || "No description available";
    document.getElementById("product-quantity").value = 1;

    const addBtn = document.getElementById("product-add-cart-btn");
    addBtn.onclick = () => {
        const qty = parseInt(document.getElementById("product-quantity").value);
        addToCart(product._id, null, qty);
        closeProductModal();
    };

    document.getElementById("product-modal").style.display = "block";
}

// Close Product Modal
function closeProductModal() {
    document.getElementById("product-modal").style.display = "none";
}

// Close modal when X clicked
document.getElementById("close-product").onclick = closeProductModal;


const productModal = document.getElementById("product-modal");


function displayAdminPreview(products) {
    adminPreview.innerHTML = "";
    products.forEach(p => {
        const div = document.createElement("div");
        div.classList.add("product");
        div.innerHTML = `
    <img src="${p.image}">
    <h3>${p.name}</h3>
    <p>KES ${p.price}</p>
    <p>Stock: ${p.stock}</p>
    <button onclick="deleteProduct('${p._id}')">Delete</button>
    <button onclick="editProduct('${p._id}')">Edit</button>
`;
        adminPreview.appendChild(div);
    });
}

function editProduct(id) {
    const product = allProducts.find(p => p._id === id);

    if (!product) return;

    const name = prompt("New name:", product.name);
    if (name === null) return;

    const price = prompt("New price:", product.price);
    if (price === null) return;

    const stock = prompt("New stock:", product.stock || 0);
    if (stock === null) return;

    fetch(`https://campus-store-api.onrender.com/api/products/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name, price, stock })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            showToast("❌ Update failed");
            return;
        }

        showToast("✏️ Product updated");
        loadProducts();
    });
}



// Cart functionality
const cartItemsDiv = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");

function fetchCart() {
    fetch(`https://campus-store-api.onrender.com/api/cart/${currentUser}`, {
    headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
    }
})
    .then(res => res.json())
    .then(items => displayCart(items));
}

function displayCart(items) {
    cartItemsDiv.innerHTML = "";
    if(items.length === 0) {
        cartItemsDiv.innerHTML = "<p>Your cart is empty</p>";
        cartTotal.textContent = "";
        cartCount.textContent = "0";
        return;
    }
    let total = 0;
    items.forEach(item => {
        total += item.total;
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <img src="${item.image}">
            <span>${item.name}</span>
            <span>KES ${item.price}</span>
            <button class="qty-btn" onclick="changeQty('${item._id}', ${item.quantity-1})">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" onclick="changeQty('${item._id}', ${item.quantity+1})">+</button>
            <span>Total: KES ${item.total}</span>
            <button onclick="removeFromCart('${item._id}')">Remove</button>
        `;
        cartItemsDiv.appendChild(div);
    });
    cartTotal.textContent = "Cart Total: KES " + total;
    cartCount.textContent = items.reduce((a,b)=> a+b.quantity,0);
}

// Cart actions
function addToCart(productId, btn, quantity = 1) {

    // 🟡 GUEST CART (LOCAL STORAGE)
    if (!currentUser) {
        let guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];

        const existing = guestCart.find(item => item.productId === productId);

        if (existing) {
            existing.quantity += quantity;
        } else {
            guestCart.push({ productId, quantity });
        }

        localStorage.setItem("guestCart", JSON.stringify(guestCart));

        showToast("🛒 Added (Guest Cart)");
        updateCartCountGuest();
        return;
    }

    // 🔵 NORMAL USER CART (SERVER)
    if (btn) {
        btn.disabled = true;
        btn.textContent = "Adding...";
    }

    fetch("https://campus-store-api.onrender.com/api/cart/add", { 
        method: "POST",
        headers: {
    "Content-Type":"application/json",
    "Authorization": "Bearer " + localStorage.getItem("token")
},
       body: JSON.stringify({
    userId: currentUser,
    productId,
    quantity
})
    })
    .then(res => res.json())
    .then(data => {
    if (!data.success) {
            showToast(data.error || "Failed to add");
        } else {
            fetchCart();
            showToast("🛒 Added to cart!");
        }

        if (btn) {
            btn.disabled = false;
            btn.textContent = "Add to Cart";
        }
    })
    .catch(() => {
        showToast("Server error - check console");
console.log(err);
    });
}
function updateCartCountGuest() {
    const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
    const total = guestCart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = total;
}
function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.style.display = "block";
    toast.style.opacity = "1";

    setTimeout(() => {
        toast.style.opacity = "0";
    }, 2000);

    setTimeout(() => {
        toast.style.display = "none";
    }, 2500);
}




function removeFromCart(id) {
    fetch(`https://campus-store-api.onrender.com/api/cart/remove/${id}`, {
    method:"DELETE",
    headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
    }
})
    .then(()=>fetchCart());
}

function changeQty(id,newQty) {
    if(newQty<1) return;
    fetch(`https://campus-store-api.onrender.com/api/cart/update/${id}`, {
        method:"PUT",
        headers:{
    "Content-Type":"application/json",
    "Authorization": "Bearer " + localStorage.getItem("token")
},
        body: JSON.stringify({quantity:newQty})
    }).then(()=>fetchCart());
}

function checkout() {
    if (!currentUser) {
        showToast("Login to checkout");
        openAuthModal("login");
        return;
    }

    const phone = prompt("Enter phone (2547XXXXXXXX):");
    if (!phone) return;

    fetch("https://campus-store-api.onrender.com/api/mpesa/pay", {
        method: "POST",
        headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("token")
},
        body: JSON.stringify({
            phone: phone,
            amount: 100
        })
    })
    .then(res => res.json())
    .then(() => {
        alert("📲 Complete payment on your phone");
        placeOrderAfterPayment();
    })
    .catch(err => {
        console.log(err);
        showToast("Payment failed");
    });
}

function fetchOrders() {
    if (!currentUser) {
        showToast("Login first");
        return;
    }

    fetch(`https://campus-store-api.onrender.com/api/orders/${currentUser}`, {
    headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
    }
})
        .then(res => res.json())
        .then(data => displayOrders(data));
}




//" Admin add product
document.getElementById("add-product-btn").addEventListener("click",()=>{
    const name = document.getElementById("admin-name").value;
    const price = document.getElementById("admin-price").value;
    const image = document.getElementById("admin-image").value;
    const stock = document.getElementById("admin-stock").value;
    if(!name || !price || !image || !stock){
    alert("Fill all fields");
    return;
}
    fetch("https://campus-store-api.onrender.com/api/products", {
    method:"POST",
    headers:{
    "Content-Type":"application/json",
    "Authorization": "Bearer " + localStorage.getItem("token")
},
    body: JSON.stringify({name,price,image,stock})
}).then(()=>{
    loadProducts();

    // ✅ CLEAR INPUTS
    document.getElementById("admin-name").value = "";
    document.getElementById("admin-price").value = "";
    document.getElementById("admin-image").value = "";
    document.getElementById("admin-stock").value = "";
    
});
});

function deleteProduct(id) {
    fetch(`https://campus-store-api.onrender.com/api/products/${id}`, {
    method: "DELETE",
    headers: {
    "Authorization": "Bearer " + localStorage.getItem("token")
}
})
    .then(res => res.json())
    .then(data => {
        const msg = data.message || data.error || "Delete failed";

        if (data.success) {
            showToast("🗑 " + msg);
            loadProducts(); // reload list
            document.getElementById("otp-code").value = "";
        } else {
            showToast("❌ " + msg);
                          

            }
        if (data.requireOTP) {
        document.getElementById("otp-modal").style.display = "block";
        document.getElementById("otp-email").value = data.email;
        startResendTimer();
    }
    });
}

function updateAdminUI() {
    const role = localStorage.getItem("role");
    const adminTab = document.getElementById("tab-admin");

    if (role === "admin") {
        adminTab.style.display = "block";
    } else {
        adminTab.style.display = "none";
    }
    console.log("ROLE:", role);
}



// Tabs
const sections = {
    home: document.getElementById("home-section"),
    shop: document.getElementById("shop-section"),
    //cart: document.getElementById("cart-section"),
    admin: document.getElementById("admin-section"),
    orders: document.getElementById("orders-section"),
    };

function placeOrderAfterPayment() {
    fetch("https://campus-store-api.onrender.com/api/orders/checkout", {
        method: "POST",
       headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("token")
},
        body: JSON.stringify({
    
    location: localStorage.getItem("location")
})
    })
    .then(res => res.json())
    .then(data => {
        alert("✅ Payment successful! Order placed.");

        if (currentUser) fetchCart();    // clear cart
        //loadOrders();    // refresh orders page
    })
    .catch(err => console.log(err));
}

//userprofile
const profileTab = document.getElementById("tab-profile");
if (profileTab) {
    profileTab.addEventListener("click", loadProfile);
}

function showSection(sectionId){

    Object.values(sections).forEach(sec => {
    if (sec) sec.style.display = "none";
});

    if (sections[sectionId]) {
        sections[sectionId].style.display = "block";
    }

    document.querySelectorAll(".nav-links li").forEach(li => li.classList.remove("active"));

    const activeTab = document.getElementById("tab-" + sectionId);
    if (activeTab) activeTab.classList.add("active");
}

//trending products
function displayTrending(products) {
    const trendingDiv = document.getElementById("trending-products");
    trendingDiv.innerHTML = "";

    // just show first 4 products
    products.slice(0, 4).forEach(product => {
        const div = document.createElement("div");
        div.classList.add("product");

        div.innerHTML = `
            <img src="${product.image}">
            <h3>${product.name}</h3>
            <p>KES ${product.price}</p>
            <button onclick="addToCart('${product._id}', this, 1)">Add to Cart</button>
        `;

        trendingDiv.appendChild(div);
    });
}

function displayOrders(orders) {
    const ordersDiv = document.getElementById("orders-list");
    ordersDiv.innerHTML = "";

    if (orders.length === 0) {
        ordersDiv.innerHTML = "<p>No orders yet</p>";
        return;
    }

    orders.forEach(order => {
        const div = document.createElement("div");
        div.classList.add("order");

        let itemsHTML = "";
        order.items.forEach(item => {
            itemsHTML += `
                <p>${item.name} x ${item.quantity} - KES ${item.price}</p>
            `;
        });

        div.innerHTML = `
            <h3>🧾 Order</h3>
            ${itemsHTML}
            <strong>Total: KES ${order.totalAmount}</strong>
            <p>Status: <span class="status">${order.status}</span></p>
            <p>📍 ${order.location || "No location"}</p>
<p>Date: ${new Date(order.createdAt).toLocaleString()}</p>
            <hr>
        `;

        ordersDiv.appendChild(div);
    });
}
function saveLocation() {
    const loc = document.getElementById("user-location").value;

    if (!loc) {
        showToast("Enter location");
        return;
    }

    localStorage.setItem("location", loc);
    showToast("📍 Location saved");
}

//logout
function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("role"); // ✅ IMPORTANT

    currentUser = null;

    showToast("👋 Logged out");
    cartCount.textContent = "0";

    updateAuthUI();
    updateAdminUI(); // ✅ refresh admin visibility
}
const authModal = document.getElementById("auth-modal");
const authTitle = document.getElementById("auth-title");
const authBtn = document.getElementById("auth-action-btn");
const switchLink = document.getElementById("switch-link");

function openAuthModal(mode = "login") {
    clearAuthFields();

    authModal.style.display = "block";

    const confirmField = document.getElementById("auth-confirm");
    const emailField = document.getElementById("auth-email");
    
if (mode === "login") {
    authTitle.textContent = "Login";
    authBtn.textContent = "Login";

    confirmField.style.display = "none";
    emailField.style.display = "none";
    document.getElementById("password-strength-container").style.display = "none";
if (strengthText) strengthText.style.display = "none";

    const forgot = document.getElementById("forgot-password");
    if (forgot) forgot.style.display = "block";
} else {
        authTitle.textContent = "Register";
        authBtn.textContent = "Register";

        confirmField.style.display = "block";
        emailField.style.display = "block";
        document.getElementById("password-strength-container").style.display = "block";
        strengthText.style.display = "block";
        const forgot = document.getElementById("forgot-password");
if (forgot) forgot.style.display = "none";
    }
}

document.getElementById("close-auth").onclick = () => authModal.style.display = "none";

switchLink.addEventListener("click", () => {
    if (authTitle.textContent === "Login") {
        openAuthModal("register");
    } else {
        openAuthModal("login");
    }
});


document.getElementById("tab-home").addEventListener("click",()=>showSection("home"));
document.getElementById("tab-shop").addEventListener("click",()=>showSection("shop"));
document.getElementById("tab-cart").addEventListener("click", () => {
    cartModal.style.display = "block";
    if (currentUser) fetchCart();
});
document.getElementById("close-cart").onclick = () => {
    cartModal.style.display = "none";
};
document.getElementById("tab-login").addEventListener("click", () => openAuthModal("login"));

window.addEventListener("click", (e) => {
    if (e.target === cartModal) {
        cartModal.style.display = "none";
    }

    if (e.target === productModal) {
        productModal.style.display = "none";
    }

    if (e.target === authModal) {
        authModal.style.display = "none";
    }
});

authBtn.onclick = async () => {

    const username = document.getElementById("auth-username").value.trim();
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value.trim();
    const confirm = document.getElementById("auth-confirm").value.trim();

    if (!username) return showToast("Enter username");
    if (authTitle.textContent === "Register" && !email) return showToast("Enter email");
    if (!password) return showToast("Enter password");

    if (authTitle.textContent === "Register" && password !== confirm) {
        return showToast("Passwords do not match");
    }

    authBtn.disabled = true;
    authBtn.textContent = "Processing...";

    try {
        if (authTitle.textContent === "Login") {

            const res = await fetch("https://campus-store-api.onrender.com/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (data.requireOTP) {
    showToast("⚠️ Verify your account first. OTP sent to email.");

    document.getElementById("otp-modal").style.display = "block";
    document.getElementById("otp-email").value = data.email; // or email if backend sends

    startResendTimer();
    return;
}

            if (data.success) {
                localStorage.setItem("token", data.token);
localStorage.setItem("role", data.role);
localStorage.setItem("user", data.userId);
                currentUser = data.userId;

                showToast("Welcome back 👋");

                authModal.style.display = "none";
                updateAuthUI();
                updateAdminUI();

                fetchCart();
                // ✅ MERGE GUEST CART AFTER LOGIN
const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];

guestCart.forEach(item => {
    addToCart(item.productId, null, item.quantity);
});

localStorage.removeItem("guestCart");
            } else {
                
                showToast("❌ " + (data.message || "Invalid username or password"));
            }

        } else {

            const res = await fetch("https://campus-store-api.onrender.com/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (data.success) {
                showToast("OTP sent 📧");

                document.getElementById("otp-modal").style.display = "block";
                authModal.style.display = "none";
                document.getElementById("otp-email").value = email;

                startResendTimer();
                authModal.style.display = "none";
            } else {
                showToast(data.message || "Registration failed");
            }
        }

    } catch (err) {
        console.log(err);
        showToast("Server error");
    }

    authBtn.disabled = false;
    authBtn.textContent = authTitle.textContent;
};

let resendTime = 120;
let resendInterval;

function startResendTimer() {
    resendTime = 120;

    const timer = document.getElementById("resend-timer");
    const btn = document.getElementById("resend-btn");

    btn.disabled = true;

    resendInterval = setInterval(() => {
        resendTime--;
        timer.textContent = resendTime;

        if (resendTime <= 0) {
            clearInterval(resendInterval);
            btn.disabled = false;
            timer.textContent = "0";
        }
    }, 1000);
}
document.getElementById("resend-btn").addEventListener("click", () => {

    const email = document.getElementById("otp-email").value;

    fetch("https://campus-store-api.onrender.com/api/auth/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            username: "temp",
            email: email,
            password: "Temp123"
        })
    });

    showToast("OTP resent (check spam)");
    startResendTimer();
});

document.getElementById("verify-btn").addEventListener("click", () => {
    const email = document.getElementById("otp-email").value.trim();
    const otp = document.getElementById("otp-code").value.trim();

    if (!email || !otp) {
        showToast("Enter email and OTP");
        return;
    }

    fetch("https://campus-store-api.onrender.com/api/auth/verify", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, otp })
    })
    .then(res => res.json())
    .then(data => {
        console.log("VERIFY RESPONSE:", data); // 🔥 DEBUG

        if (data.success) {
    showToast("✅ Verification successful! Please login");

    document.getElementById("otp-modal").style.display = "none";

    openAuthModal("login"); // ✅ OPEN LOGIN
} else {
            document.getElementById("otp-message").textContent = data.message || "Verification failed";
        }
    })
    .catch(err => {
        console.log(err);
        showToast("Server error");
    });
});
document.getElementById("no-otp").addEventListener("click", () => {
    alert("📧 Please check your SPAM folder if you didn't receive the OTP.");
});
const closeOtp = document.getElementById("close-otp");

if (closeOtp) {
    closeOtp.onclick = () => {
        document.getElementById("otp-modal").style.display = "none";
        openAuthModal("login"); // 🔥 reopen login
    };
}


function clearAuthFields() {
    document.getElementById("auth-username").value = "";
    document.getElementById("auth-email").value = "";
    document.getElementById("auth-password").value = "";
    document.getElementById("auth-confirm").value = "";

    document.getElementById("password-strength").textContent = "";

    // ✅ RESET OTP FIELDS
    const otpInput = document.getElementById("otp-code");
    if (otpInput) otpInput.value = "";
    authBtn.textContent = "Login";
authBtn.disabled = false;


}

function updateAuthUI() {
    const loginTab = document.getElementById("tab-login");
    const logoutTab = document.getElementById("tab-logout");

    if (currentUser) {
        loginTab.style.display = "none";
        logoutTab.style.display = "block";
    } else {
        loginTab.style.display = "block";
        logoutTab.style.display = "none";
    }
}

function loadProfile() {
    fetch(`https://campus-store-api.onrender.com/api/auth/profile/${currentUser}`)
    .then(res => res.json())
    .then(data => {
        console.log("PROFILE:", data);
    });
}

const forgotBtn = document.getElementById("forgot-password");
if (forgotBtn) {
    forgotBtn.addEventListener("click", () => {
        const email = prompt("Enter your email:");

        if (!email) return;

        fetch("https://campus-store-api.onrender.com/api/auth/forgot", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email })
        })
        .then(res => res.json())
        .then(data => {
            showToast(data.message);
        })
        .catch(() => showToast("Error sending reset link"));
    });
}

//PASSWORD STRENGTH (LIVE)
const strengthText = document.getElementById("password-strength");
const passwordInput = document.getElementById("auth-password");



const strengthFill = document.getElementById("strength-fill");

passwordInput.addEventListener("input", () => {
    const val = passwordInput.value;

    if (val.length < 6) {
        strengthText.textContent = "Weak ❌";
        strengthText.style.color = "red";
        strengthFill.style.width = "30%";
        strengthFill.style.background = "red";
    } 
    else if (!/[A-Z]/.test(val) || !/[0-9]/.test(val)) {
        strengthText.textContent = "Medium ⚠️";
        strengthText.style.color = "orange";
        strengthFill.style.width = "60%";
        strengthFill.style.background = "orange";
    } 
    else {
        strengthText.textContent = "Strong 💪";
        strengthText.style.color = "green";
        strengthFill.style.width = "100%";
        strengthFill.style.background = "green";
    }
});
document.getElementById("tab-admin").addEventListener("click",()=>showSection("admin"));
document.getElementById("tab-orders").addEventListener("click",()=>{
    showSection("orders");
    fetchOrders(); // ✅ LOAD ORDERS
});


// CONFIRM PASSWORD TOGGLE
const toggleConfirm = document.getElementById("toggle-confirm");
const confirmInputField = document.getElementById("auth-confirm");

if (toggleConfirm) {
    toggleConfirm.addEventListener("click", () => {
    if (confirmInputField.type === "password") {
        confirmInputField.type = "text";
    } else {
        confirmInputField.type = "password";
    }
});}
// RESEND OTP
// Load products initially
loadProducts();
if (currentUser) fetchCart();
updateAuthUI();
updateAdminUI();