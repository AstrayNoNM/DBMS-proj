const cart = [];

function updateCart() {
  const cartList = document.getElementById("cart-list");
  cartList.innerHTML = cart
    .map(
      (entry, index) =>
        `<li>${entry.item} x ${entry.qty} <button class="remove-btn" onclick="removeFromCart(${index}, event)">Remove</button></li>`
    )
    .join("");
  document.getElementById("cartData").value = JSON.stringify(cart);
  document.getElementById("cart-container").style.display =
    cart.length > 0 ? "block" : "none";
}

const stockData = {
  "Eros": 10,
  "Aqua De Gio": 10,
  "Lacoste Red": 10,
  "Lacoste Black": 10,
  "Invictus": 10,
  "Polo Sport": 10,
  "Aqua Bvlgari": 10,
  "Bvlgari Extreme": 10,
  "CK One": 10,
  "Vanilla Lace": 10,
  "Bombshell": 10,
  "Ms. Dior": 10,
  "Pure Seduction": 10,
  "Bright Crystal": 10,
  "Incanto Shine": 10,
  "Cucumber Melon": 10,
  "Rush GE": 10,
  "Sweet Candy": 10,
  "Meow": 10,
  "YSL Libre": 10,
  "Cloud": 10,
  "Black Opium": 10,
  "Bacarrat Rouge": 10,
};

function updateStock(productId, newStock) {
  fetch("update_stock.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `product_id=${productId}&new_stock=${newStock}`,
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
      alert(data);
    })
    .catch((error) => console.error("Error updating stock:", error));
}

function showSection(id) {
  document.querySelectorAll(".section").forEach((sec) => {
    sec.style.display = sec.id === id ? "block" : "none";
  });
}

function addToCart() {
  const selectedPerfumes = document.querySelectorAll(
    'input[type="checkbox"]:checked'
  );
  const qty = parseInt(document.getElementById("qty").value);

  if (qty <= 0 || isNaN(qty)) {
    alert("Please enter a valid quantity.");
    return;
  }

  if (selectedPerfumes.length === 0) {
    alert("Please select at least one perfume.");
    return;
  }

  let itemsAdded = false;

  selectedPerfumes.forEach((perfume) => {
    const item = perfume.value;
    if (stockData[item] < qty) {
      alert(
        `Not enough stock for ${item}. Available stock: ${stockData[item]}`
      );
    } else {
      stockData[item] -= qty;
      cart.push({ item, qty });
      itemsAdded = true;
    }
  });

  if (itemsAdded) {
    updateCart();
    alert("Items added to cart successfully!");
  }
}

function removeFromCart(index, event) {
  // Prevent the default form submission behavior
  if (event) {
    event.preventDefault();
  }

  // Remove the item from the cart
  const removedItem = cart[index];
  const { item, qty } = removedItem;

  // Restore the stock for the removed item
  stockData[item] += qty;

  // Update the stock display if applicable
  const stockElement = document.getElementById(`stock-${item}`);
  if (stockElement) {
    stockElement.textContent = stockData[item];
  }

  // Remove the item from the cart array
  cart.splice(index, 1);

  // Update the cart display
  updateCart();
}


function checkTableVisibility() {
  const tableBody = document.getElementById("records-body");
  const table = document.getElementById("payment-records-table");

  if (tableBody.children.length === 0) {
    table.style.display = "none";
  } else {
    table.style.display = "table";
  }
}

function removeRecord(index) {
  const tableBody = document.getElementById("records-body");
  tableBody.removeChild(tableBody.children[index]);
  checkTableVisibility();
}

function addOrderRecord(event) {
  event.preventDefault();

  const currentYear = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const orderId = `${currentYear}${randomDigits}`;

  const customerName = document.getElementById("order-customer-name").value;
  const itemsBought = document.getElementById("order-items").value;
  const totalPrice = parseFloat(
    document.getElementById("order-total-price").value
  ).toFixed(2);
  const orderDate = new Date().toISOString().split("T")[0];

  const tableBody = document.getElementById("order-records-body");
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
      <td>${orderId}</td>
      <td>${customerName}</td>
      <td>${itemsBought}</td>
      <td>₱${totalPrice}</td>
      <td>${orderDate}</td>
      `;

  tableBody.appendChild(newRow);
  document.getElementById("order-records-table").style.display = "table";
  document.getElementById("order-form").reset();

  alert(`Order added successfully! Order ID: ${orderId}`);
}

function clearCart() {
  // Restore stock for all items in the cart
  cart.forEach(({ item, qty }) => {
    stockData[item] += qty;

    // Update the stock display if applicable
    const stockElement = document.getElementById(`stock-${item}`);
    if (stockElement) {
      stockElement.textContent = stockData[item];
    }
  });

  // Clear the cart array
  cart.length = 0;

  // Update the cart display
  updateCart();

  alert("Cart has been cleared!");
}

function filterOrderRecords() {
  const startDate = document.getElementById("start-date").value;
  const endDate = document.getElementById("end-date").value;

  if (!startDate || !endDate) {
    alert("Please enter both start and end dates.");
    return;
  }
  if (startDate > endDate) {
    alert("Start date cannot be after end date.");
    return;
  }
  fetch(`fetch_orders.php?start=${startDate}&end=${endDate}`)
    .then((response) => response.json())
    .then((data) => {
      const tbody = document.getElementById("order-records-body");
      tbody.innerHTML = "";
      data.forEach((order) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${order.order_id}</td>
          <td>${order.items_bought}</td>
          <td>₱${parseFloat(order.total_price).toFixed(2)}</td>
          <td>${order.date}</td>
        `;
        tbody.appendChild(tr);
      });
      document.getElementById('order-records-table').style.display = 'table';
    })
    .catch(() => {
      alert("Failed to fetch order records.");
    });
}

function loadPaymentRecords() {
  fetch('fetch_payments.php')
    .then(response => response.json())
    .then(data => {
      const tbody = document.getElementById('records-body');
      tbody.innerHTML = '';
      data.forEach(record => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${record.customer_name}</td>
          <td>${record.payment_status}</td>
          <td>₱${parseFloat(record.balance).toFixed(2)}</td>
          <td>${record.date}</td>
        `;
        tbody.appendChild(tr);
      });
      document.getElementById('payment-records-table').style.display = data.length ? 'table' : 'none';
    });
}
document.querySelector('button[onclick="showSection(\'records\')"]').addEventListener('click', loadPaymentRecords);

function addPaymentRecord(event) {
  event.preventDefault();
  const name = document.getElementById("costumer-name").value;
  const status = document.getElementById("payment-status").value;
  const date = document.getElementById("date").value;
  const balance = document.getElementById("balance").value;

  fetch('add_payment.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `customer_name=${encodeURIComponent(name)}&payment_status=${encodeURIComponent(status)}&date=${encodeURIComponent(date)}&balance=${encodeURIComponent(balance)}`
  })
    .then(response => response.text())
    .then(result => {
      if (result.trim() === "success") {
        alert("Record added successfully!");
        document.getElementById("payment-records-form").reset();
        loadPaymentRecords();
      } else {
        alert("Failed to add record.");
      }
    });
}
