/* ==========================================
   GMAIL SERVICES - SHOPPING AND ORDER SYSTEM
   TEST PAYMENT SIMULATION
========================================== */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw9TWyjMshPjsQUYAgj6C1DQFiF8-fx6GE1seCqeT5CKbVe_cF8qzlmvyH4CJU2u02HKQ/exec";


// ==========================================
// PUBLIC PAYMENT DISPLAY PLACEHOLDERS
// ==========================================

const PAYMENT_DETAILS = {
    gcash: {
        accountName: "Account owner",
        number: "Provided after confirmation"
    },

    bank: {
        bankName: "MariBank",
        accountName: "Account owner",
        accountNumber: "Provided after confirmation"
    }
};


// ==========================================
// PRODUCTS
// ==========================================

const PRODUCTS = {
    "Email Setup Assistance": 199,
    "Business Email Setup": 299,
    "Email Configuration": 149
};


// ==========================================
// CART
// ==========================================

let cart = [];
let testPaymentSelected = false;

try {
    const savedCart = JSON.parse(localStorage.getItem("gmailCart"));

    if (Array.isArray(savedCart)) {
        cart = savedCart;
    }
} catch (error) {
    cart = [];
}


// ==========================================
// ADD TO CART
// ==========================================

function addToCart(productName, price) {

    if (PRODUCTS[productName] !== Number(price)) {
        alert("Invalid product.");
        return;
    }

    const existingItem = cart.find(
        item => item.name === productName
    );

    if (existingItem) {
        if (existingItem.quantity >= 50) {
            alert("Maximum quantity reached.");
            return;
        }

        existingItem.quantity++;
    } else {
        cart.push({
            name: productName,
            price: PRODUCTS[productName],
            quantity: 1
        });
    }

    updateCart();
    resetTestPayment();

    alert(productName + " added to cart!");
}


// ==========================================
// UPDATE CART
// ==========================================

function updateCart() {

    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");

    if (!cartItems || !cartCount || !cartTotal) return;

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

    try {
        localStorage.setItem("gmailCart", JSON.stringify(cart));
    } catch (error) {
        console.error("Unable to save cart:", error);
    }

    updatePaymentInstructions();
}


// ==========================================
// RESET TEST PAYMENT
// ==========================================

function resetTestPayment() {

    testPaymentSelected = false;

    const button =
        document.getElementById("simulate-payment-button");

    const result =
        document.getElementById("test-payment-result");

    if (button) {
        button.textContent = "SIMULATE TEST PAYMENT";
    }

    if (result) {
        result.style.display = "none";
    }
}


// ==========================================
// PAYMENT INSTRUCTIONS
// ==========================================

function updatePaymentInstructions() {

    const paymentMethod =
        document.getElementById("payment-method");

    const instructions =
        document.getElementById("payment-instructions");

    const gcash =
        document.getElementById("gcash-instructions");

    const bank =
        document.getElementById("bank-instructions");

    const binance =
        document.getElementById("binance-instructions");

    const testButton =
        document.getElementById("simulate-payment-button");

    if (!paymentMethod || !instructions) return;

    instructions.style.display = "none";

    if (gcash) gcash.style.display = "none";
    if (bank) bank.style.display = "none";
    if (binance) binance.style.display = "none";

    if (testButton) {
        testButton.style.display = "none";
    }

    const selectedPayment = paymentMethod.value;

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    document.querySelectorAll(".payment-amount").forEach(element => {
        element.textContent = total.toFixed(2);
    });

    if (selectedPayment === "GCash") {

        const accountName =
            document.getElementById("gcash-account-name");

        const number =
            document.getElementById("gcash-number");

        if (accountName) {
            accountName.textContent =
                PAYMENT_DETAILS.gcash.accountName;
        }

        if (number) {
            number.textContent =
                PAYMENT_DETAILS.gcash.number;
        }

        if (gcash) {
            instructions.style.display = "block";
            gcash.style.display = "block";
        }
    }

    else if (selectedPayment === "Bank Transfer") {

        const bankName =
            document.getElementById("bank-name");

        const accountName =
            document.getElementById("bank-account-name");

        const accountNumber =
            document.getElementById("bank-account-number");

        if (bankName) {
            bankName.textContent =
                PAYMENT_DETAILS.bank.bankName;
        }

        if (accountName) {
            accountName.textContent =
                PAYMENT_DETAILS.bank.accountName;
        }

        if (accountNumber) {
            accountNumber.textContent =
                PAYMENT_DETAILS.bank.accountNumber;
        }

        if (bank) {
            instructions.style.display = "block";
            bank.style.display = "block";
        }

        if (testButton) {
            testButton.style.display = "inline-block";
        }
    }

    else if (selectedPayment === "Binance Pay") {

        if (binance) {
            instructions.style.display = "block";
            binance.style.display = "block";
        }
    }
}


// ==========================================
// CHANGE QUANTITY
// ==========================================

function changeQuantity(index, amount) {

    if (!cart[index]) return;

    const newQuantity = cart[index].quantity + amount;

    if (newQuantity > 50) {
        alert("Maximum quantity is 50.");
        return;
    }

    cart[index].quantity = newQuantity;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updateCart();
    resetTestPayment();
}


// ==========================================
// REMOVE ITEM
// ==========================================

function removeItem(index) {

    if (!cart[index]) return;

    cart.splice(index, 1);

    updateCart();
    resetTestPayment();
}


// ==========================================
// CLEAR CART
// ==========================================

function clearCart() {

    if (cart.length === 0) {
        alert("Your cart is already empty.");
        return;
    }

    if (confirm("Are you sure you want to clear your cart?")) {
        cart = [];
        updateCart();
        resetTestPayment();
    }
}


// ==========================================
// PAYMENT METHOD CHANGE
// ==========================================

const paymentMethodElement =
    document.getElementById("payment-method");

if (paymentMethodElement) {

    paymentMethodElement.addEventListener("change", function() {
        resetTestPayment();
        updatePaymentInstructions();
    });
}


// ==========================================
// SIMULATE MARI BANK PAYMENT
// ==========================================

const testPaymentButton =
    document.getElementById("simulate-payment-button");

if (testPaymentButton) {

    testPaymentButton.addEventListener("click", function() {

        const paymentMethod =
            document.getElementById("payment-method");

        if (!paymentMethod ||
            paymentMethod.value !== "Bank Transfer") {

            alert("Please select Bank Transfer first.");
            return;
        }

        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        const confirmed = confirm(
            "MARI BANK TEST PAYMENT\n\n" +
            "This is a simulation only.\n" +
            "No money will be deducted or transferred.\n\n" +
            "Continue?"
        );

        if (!confirmed) return;

        testPaymentSelected = true;

        const result =
            document.getElementById("test-payment-result");

        if (result) {
            result.style.display = "block";
        }

        testPaymentButton.textContent =
            "TEST PAYMENT SIMULATED ✓";

        alert(
            "Test simulation completed!\n\n" +
            "No real bank transaction occurred."
        );
    });
}


// ==========================================
// CHECKOUT
// ==========================================

const checkoutForm =
    document.getElementById("checkout-form");

if (checkoutForm) {

    checkoutForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        if (cart.length === 0) {
            alert("Your cart is empty. Please add a service first.");
            return;
        }

        const name =
            document.getElementById("customer-name").value.trim();

        const email =
            document.getElementById("customer-email").value.trim();

        const phone =
            document.getElementById("customer-phone").value.trim();

        const paymentMethod =
            document.getElementById("payment-method").value;

        if (!name || !email || !phone || !paymentMethod) {
            alert("Please complete all required fields.");
            return;
        }

        const allowedPayments = [
            "GCash",
            "Bank Transfer",
            "Binance Pay"
        ];

        if (!allowedPayments.includes(paymentMethod)) {
            alert("Invalid payment method.");
            return;
        }

        if (paymentMethod === "Bank Transfer" &&
            !testPaymentSelected) {

            alert("Please click SIMULATE TEST PAYMENT first.");
            return;
        }

        const validItems = cart.every(item =>
            PRODUCTS[item.name] === Number(item.price) &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0 &&
            item.quantity <= 50
        );

        if (!validItems) {
            alert("Your cart contains invalid items.");
            return;
        }

        const policyAgreement =
            document.getElementById("policy-agreement");

        if (policyAgreement && !policyAgreement.checked) {
            alert("Please agree to the website policies.");
            return;
        }

        const submitButton =
            document.getElementById("place-order-button");

        if (!submitButton) return;

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

            await fetch(SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },
                body: JSON.stringify(orderData)
            });

            const orderNumberElement =
                document.getElementById("order-number");

            const confirmationName =
                document.getElementById("confirmation-name");

            const confirmationPayment =
                document.getElementById("confirmation-payment");

            const confirmationTotal =
                document.getElementById("confirmation-total");

            const confirmationStatus =
                document.getElementById("confirmation-status");

            const confirmation =
                document.getElementById("order-confirmation");

            if (orderNumberElement) {
                orderNumberElement.textContent = orderNumber;
            }

            if (confirmationName) {
                confirmationName.textContent = name;
            }

            if (confirmationPayment) {
                confirmationPayment.textContent =
                    paymentMethod +
                    (testPaymentSelected ? " (SIMULATED TEST)" : "");
            }

            if (confirmationTotal) {
                confirmationTotal.textContent =
                    "₱" + total.toFixed(2);
            }

            if (confirmationStatus) {
                confirmationStatus.textContent =
                    testPaymentSelected
                        ? "Pending Verification — TEST ONLY"
                        : "Pending Verification";
            }

            if (confirmation) {
                confirmation.style.display = "block";
            }

            alert(
                "Your order submission was sent.\n\n" +
                "Check your Google Sheet to confirm it was saved.\n\n" +
                (testPaymentSelected
                    ? "Remember: this was only a simulation. No money was transferred."
                    : "")
            );

            cart = [];
            updateCart();

            this.reset();

            resetTestPayment();
            updatePaymentInstructions();

            if (confirmation) {
                confirmation.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

        } catch (error) {

            console.error("Order error:", error);

            alert("Unable to send your order. Please try again.");

        } finally {

            submitButton.disabled = false;
            submitButton.textContent = "PLACE ORDER";

        }
    });
}


// ==========================================
// INITIALIZE WEBSITE
// ==========================================

document.addEventListener("DOMContentLoaded", function() {
    updateCart();
    updatePaymentInstructions();
    resetTestPayment();
});