/* ==========================================
   GMAIL SERVICES - SHOPPING AND ORDER SYSTEM
========================================== */

// GOOGLE APPS SCRIPT WEB APP URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw9TWyjMshPjsQUYAgj6C1DQFiF8-fx6GE1seCqeT5CKbVe_cF8qzlmvyH4CJU2u02HKQ/exec";

// AVAILABLE SERVICES AND OFFICIAL PRICES
const PRODUCTS = {
    "Email Setup Assistance": 199,
    "Business Email Setup": 299,
    "Email Configuration": 149
};

// LOAD SAVED CART
let cart = [];

try {
    cart = JSON.parse(localStorage.getItem("gmailCart")) || [];
} catch (error) {
    cart = [];
}


/* ==========================================
   ADD TO CART
========================================== */

function addToCart(productName, price) {

    if (PRODUCTS[productName] !== Number(price)) {
        alert("Invalid product.");
        return;
    }

    const existingItem = cart.find(
        item => item.name === productName
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            name: productName,
            price: PRODUCTS[productName],
            quantity: 1
        });
    }

    updateCart();

    alert(productName + " added to cart!");
}


/* ==========================================
   UPDATE CART
========================================== */

function updateCart() {

    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");

    cartItems.innerHTML = "";

    let total = 0;
    let count = 0;

    if (cart.length === 0) {

        cartItems.innerHTML =
            "<li>Your cart is currently empty.</li>";

    }

    cart.forEach((item, index) => {

        total += item.price * item.quantity;
        count += item.quantity;

        const li = document.createElement("li");

        const details = document.createElement("span");

        details.textContent =
            `${item.name} - ₱${item.price.toFixed(2)} × ${item.quantity}`;

        const minus = document.createElement("button");
        minus.className = "btn btn-default btn-xs";
        minus.textContent = "−";
        minus.type = "button";
        minus.onclick = () => changeQuantity(index, -1);

        const plus = document.createElement("button");
        plus.className = "btn btn-default btn-xs";
        plus.textContent = "+";
        plus.type = "button";
        plus.onclick = () => changeQuantity(index, 1);

        const remove = document.createElement("button");
        remove.className = "btn btn-danger btn-xs";
        remove.textContent = "Remove";
        remove.type = "button";
        remove.onclick = () => removeItem(index);

        li.appendChild(details);
        li.appendChild(document.createTextNode(" "));
        li.appendChild(minus);
        li.appendChild(plus);
        li.appendChild(remove);

        cartItems.appendChild(li);

    });

    cartCount.textContent = count;
    cartTotal.textContent = total.toFixed(2);

    localStorage.setItem("gmailCart", JSON.stringify(cart));

}


/* ==========================================
   CHANGE QUANTITY
========================================== */

function changeQuantity(index, amount) {

    if (!cart[index]) return;

    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updateCart();

}


/* ==========================================
   REMOVE ITEM
========================================== */

function removeItem(index) {

    cart.splice(index, 1);

    updateCart();

}


/* ==========================================
   CLEAR CART
========================================== */

function clearCart() {

    if (cart.length === 0) {
        alert("Your cart is already empty.");
        return;
    }

    if (confirm("Are you sure you want to clear your cart?")) {

        cart = [];

        updateCart();

    }

}


/* ==========================================
   CHECKOUT
========================================== */

document.getElementById("checkout-form").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        if (cart.length === 0) {
            alert("Your cart is empty. Please add a service first.");
            return;
        }

        const name = document.getElementById("customer-name").value.trim();
        const email = document.getElementById("customer-email").value.trim();
        const phone = document.getElementById("customer-phone").value.trim();
        const paymentMethod = document.getElementById("payment-method").value;

        if (!name || !email || !phone || !paymentMethod) {
            alert("Please complete all required fields.");
            return;
        }

        const allowedPayments = [
            "GCash",
            "Bank Transfer",
            "Cash on Delivery / Pay in Person"
        ];

        if (!allowedPayments.includes(paymentMethod)) {
            alert("Please select a valid payment method.");
            return;
        }

        // VERIFY PRODUCTS AND QUANTITIES
        const validItems = cart.every(item =>
            PRODUCTS[item.name] === Number(item.price) &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0 &&
            item.quantity <= 50
        );

        if (!validItems) {
            alert("Your cart contains invalid items. Please refresh your cart.");
            return;
        }

        const submitButton = document.getElementById("place-order-button");

        submitButton.disabled = true;
        submitButton.textContent = "SUBMITTING ORDER...";

        const orderNumber = "GMAIL-" + Date.now();

        const total = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const orderData = {

            orderNumber: orderNumber,

            name: name,

            email: email,

            phone: phone,

            paymentMethod: paymentMethod,

            items: cart.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),

            total: total

        };

        try {

            // SEND ORDER TO GOOGLE APPS SCRIPT
            await fetch(SCRIPT_URL, {

                method: "POST",

                mode: "no-cors",

                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },

                body: JSON.stringify(orderData)

            });

            /*
             * no-cors does not allow JavaScript to read
             * Google's response. This is only a submission
             * attempt, not proof of successful storage.
             */

            // SHOW SUBMISSION MESSAGE
            document.getElementById("order-number").textContent =
                orderNumber;

            document.getElementById("confirmation-name").textContent =
                name;

            document.getElementById("confirmation-payment").textContent =
                paymentMethod;

            document.getElementById("confirmation-total").textContent =
                "₱" + total.toFixed(2);

            document.getElementById("order-confirmation").style.display =
                "block";

            alert(
                "Your order submission was sent. " +
                "Please wait for confirmation from the service provider."
            );

            // CLEAR CART
            cart = [];

            updateCart();

            // RESET CHECKOUT FORM
            this.reset();

            // SCROLL TO CONFIRMATION
            document.getElementById("order-confirmation").scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        } catch (error) {

            console.error("Order error:", error);

            alert("Unable to send your order. Please try again.");

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "PLACE ORDER";

        }

    }
);


/* ==========================================
   INITIALIZE WEBSITE
========================================== */

document.addEventListener("DOMContentLoaded", function() {

    updateCart();

});