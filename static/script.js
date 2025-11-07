// static/script.js (Fully corrected to communicate with Flask/SQLite backend)
document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");
  const clearBtn = document.getElementById("clearBtn");
  const tableBody = document.querySelector("#foodTable tbody");

  // Determines the CSS class based on the 'days_left' status from the backend
  function getStatusClass(daysLeft) {
    if (daysLeft === 'Expired') return 'expired';
    // Expiring within 2 days
    if (typeof daysLeft === 'number' && daysLeft <= 2) return 'expiring';
    
    // Returns an empty string if the item is not expiring soon.
    // This empty string must be checked before classList.add()
    return ''; 
  }

  // --- API Functions (Connects to app.py) ---

  async function fetchItems() {
    try {
      // GET request to retrieve all items
      const response = await fetch('/api/items');
      if (!response.ok) throw new Error('Failed to fetch data');
      return await response.json();
    } catch (error) {
      console.error("Error fetching food items:", error);
      // Display a connection message if the server is unreachable
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Could not connect to server. Ensure 'python app.py' is running.</td></tr>`;
      return [];
    }
  }

  async function displayData() {
    tableBody.innerHTML = "";
    
    const foodItems = await fetchItems(); 

    foodItems.forEach((item) => {
      const tr = document.createElement("tr");
      
      // FIX for SyntaxError: Check if the class is empty before calling classList.add()
      const statusClass = getStatusClass(item.days_left);
      if (statusClass) {
          tr.classList.add(statusClass);
      }
      
      // Correctly formats the output string based on data received from Python
      let daysText = '';
      if (item.days_left === 'Expired') {
        daysText = 'Expired';
      } else if (typeof item.days_left === 'number') {
        daysText = item.days_left + " days";
      } else {
        daysText = 'N/A';
      }

      tr.innerHTML = `
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.expiry}</td>
        <td>${daysText}</td>
      `;

      tableBody.appendChild(tr);
    });
  }

  // --- Event Listeners ---

  addBtn.addEventListener("click", async () => {
    const nameInput = document.getElementById("name");
    const quantityInput = document.getElementById("quantity");
    const expiryInput = document.getElementById("expiry");

    const name = nameInput.value.trim();
    const quantity = quantityInput.value.trim();
    const expiry = expiryInput.value;

    if (!name || !quantity || !expiry) {
      alert("Please fill all fields!");
      return;
    }

    try {
      // POST request to add a new item
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, quantity, expiry })
      });

      if (!response.ok) {
        // Handle server-side errors (e.g., 400 or 500)
        const errorData = await response.json();
        alert(`Server Error: ${errorData.error || response.statusText}`);
        return;
      }

      // Clear fields and re-display data
      nameInput.value = "";
      quantityInput.value = "";
      expiryInput.value = "";
      
      // Refresh the displayed table
      await displayData(); 
      
    } catch (error) {
      console.error("Error during POST/display:", error);
      // Inform the user, but tell them to check the console for details
      alert("An error occurred during data processing. Check console for details."); 
    }
  });

  clearBtn.addEventListener("click", async () => {
    if (confirm("Are you sure you want to clear all data?")) {
      try {
        // POST request to clear all items
        const response = await fetch('/api/items/clear', { method: 'POST' });
        if (!response.ok) throw new Error('Failed to clear data');
        await displayData(); // Refresh the table
      } catch (error) {
        console.error("Error clearing items:", error);
        alert("An error occurred while clearing data.");
      }
    }
  });

  // Initial data load
  displayData();
});