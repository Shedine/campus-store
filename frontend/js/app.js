let currentUser = localStorage.getItem("user") || null;
let allProducts = [];
const cartModal = document.getElementById("cart-modal");


const productList = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");
const adminPreview = document.getElementById("admin-preview");

//let currentUser = "guest"; // no login for now

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

    fetch("http://localhost:5000/api/products")
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
            <button onclick="addToCart('${product._id}')">Add to Cart</button>
        `;
        productList.appendChild(div);
    });
}

function displayAdminPreview(products) {
    adminPreview.innerHTML = "";
    products.forEach(p => {
        const div = document.createElement("div");
        div.classList.add("product");
        div.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>KES ${p.price}</p>
        `;
        adminPreview.appendChild(div);
    });
}

// Cart functionality
const cartItemsDiv = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");

function fetchCart() {
    fetch(`http://localhost:5000/api/cart/${currentUser}`)
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
function addToCart(productId) {
    if (!currentUser) {
        alert("Please login first");
        return;
    }

    fetch("http://localhost:5000/api/cart/add", { 
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
            userId: currentUser,
            productId: productId,
            quantity: 1
        })
    })
    .then(res => res.json())
    .then(() => {
    fetchCart();
    showToast("🛒 Added to cart!");
})

    .catch(err => console.log(err));
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 2000);
}




function removeFromCart(id) {
    fetch(`http://localhost:5000/api/cart/remove/${id}`, {method:"DELETE"})
    .then(()=>fetchCart());
}

function changeQty(id,newQty) {
    if(newQty<1) return;
    fetch(`http://localhost:5000/api/cart/update/${id}`, {
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({quantity:newQty})
    }).then(()=>fetchCart());
}

function openCart() {
    cartModal.style.display = "block";
    fetchCart();
}

function checkout() {
    if (!currentUser) {
        alert("Login first");
        return;
    }

    const phone = prompt("Enter phone (2547XXXXXXXX):");

    fetch("http://localhost:5000/api/mpesa/pay", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            phone: phone,
            amount: 1
        })
    })
    .then(res => res.json())
    .then(() => {
        alert("📲 Complete payment on your phone");

        // ⏳ simulate waiting for payment
        setTimeout(() => {
            placeOrderAfterPayment();
        }, 5000);
    })
    .catch(err => console.log(err));
}



// Admin add product
document.getElementById("add-product-btn").addEventListener("click",()=>{
    const name = document.getElementById("admin-name").value;
    const price = document.getElementById("admin-price").value;
    const image = document.getElementById("admin-image").value;
    if(!name || !price || !image){alert("Fill all fields"); return;}
    fetch("http://localhost:5000/api/products", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({name,price,image})
    }).then(()=>loadProducts());
});

// Tabs
const sections = {
    home: document.getElementById("home-section"),
    shop: document.getElementById("shop-section"),
    //cart: document.getElementById("cart-section"),
    admin: document.getElementById("admin-section"),
    orders: document.getElementById("orders-section"),
    login: document.getElementById("login-section")
};

function placeOrderAfterPayment() {
    fetch("http://localhost:5000/api/orders/checkout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId: currentUser
        })
    })
    .then(res => res.json())
    .then(data => {
        alert("✅ Payment successful! Order placed.");

        fetchCart();     // clear cart
        loadOrders();    // refresh orders page
    })
    .catch(err => console.log(err));
}


function showSection(sectionId){
    // hide all sections
    for(let key in sections){
        sections[key].style.display = key === sectionId ? "block" : "none";
    }

    // close cart modal if open
    cartModal.style.display = "none";

    // update active tab
    document.querySelectorAll(".navbar li").forEach(li => li.classList.remove("active"));
    document.getElementById("tab-" + sectionId).classList.add("active");
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
            <button onclick="addToCart('${product._id}')">Add</button>
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
            <strong>Total: KES ${order.total}</strong>
            <p>Status: <span class="status">${order.status}</span></p>
            <hr>
        `;

        ordersDiv.appendChild(div);
    });
}

//Register Function
function register() {
    const username = document.getElementById("auth-username").value;
    const password = document.getElementById("auth-password").value;

    fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => alert(data.message))
    .catch(err => console.log(err));
}
//Login function
function login() {
    const username = document.getElementById("auth-username").value;
    const password = document.getElementById("auth-password").value;

    fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.userId) {
            localStorage.setItem("user", data.userId);
            currentUser = data.userId;
            alert("✅ Logged in!");
            showSection("home");
        } else {
            alert(data.message);
        }
    });
}
//logout
function logout() {
    localStorage.removeItem("user");
    currentUser = null;
    alert("Logged out");
}




document.getElementById("tab-home").addEventListener("click",()=>showSection("home"));
document.getElementById("tab-shop").addEventListener("click",()=>showSection("shop"));
document.getElementById("tab-cart").addEventListener("click", () => {
    cartModal.style.display = "block";
    fetchCart();
});
document.getElementById("close-cart").onclick = () => {
    cartModal.style.display = "none";
};
document.getElementById("tab-login").addEventListener("click", () => showSection("login"));

window.onclick = (e) => {
    if (e.target === cartModal) {
        cartModal.style.display = "none";
    }
};


document.getElementById("tab-admin").addEventListener("click",()=>showSection("admin"));
document.getElementById("tab-orders").addEventListener("click",()=>showSection("orders"));

// Load products initially
loadProducts();
fetchCart();
