document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");
  const clearBtn = document.getElementById("clearBtn");
  const tableBody = document.querySelector("#foodTable tbody");

  let foodItems = JSON.parse(localStorage.getItem("foodItems")) || [];

  function saveData() {
    localStorage.setItem("foodItems", JSON.stringify(foodItems));
  }

  function calculateDaysLeft(expiry) {
    const today = new Date();
    const expDate = new Date(expiry);
    return Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
  }

  function displayData() {
    tableBody.innerHTML = "";
    foodItems.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

    foodItems.forEach((item) => {
      const diff = calculateDaysLeft(item.expiry);
      const tr = document.createElement("tr");

      if (diff <= 0) tr.classList.add("expired");
      else if (diff <= 2) tr.classList.add("expiring");

      tr.innerHTML = `
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.expiry}</td>
        <td>${diff <= 0 ? "Expired" : diff + " days"}</td>
      `;

      tableBody.appendChild(tr);
    });
  }

  addBtn.addEventListener("click", () => {
    const name = document.getElementById("name").value.trim();
    const quantity = document.getElementById("quantity").value.trim();
    const expiry = document.getElementById("expiry").value;

    if (!name || !quantity || !expiry) {
      alert("Please fill all fields!");
      return;
    }

    foodItems.push({ name, quantity, expiry });
    saveData();
    displayData();

    document.getElementById("name").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("expiry").value = "";
  });

  clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all data?")) {
      foodItems = [];
      saveData();
      displayData();
    }
  });

  displayData();
});
