const form = document.getElementById("medicineForm");
const list = document.getElementById("medicineList");
const searchInput = document.getElementById("searchInput");
const notificationButton = document.getElementById("enableNotifications");
const reminderSound = document.getElementById("reminderSound");

let currentProfile = localStorage.getItem("currentProfile") || "Default";
let medicines = getMedicines();

document.getElementById("currentProfileText").textContent = currentProfile;

function getStorageKey() {
  return `medicines_${currentProfile}`;
}

function getMedicines() {
  return JSON.parse(localStorage.getItem(`medicines_${currentProfile}`)) || [];
}

function saveMedicines() {
  localStorage.setItem(getStorageKey(), JSON.stringify(medicines));
}

notificationButton.addEventListener("click", () => {
  if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
      alert(`Notification permission: ${permission}`);
    });
  } else {
    alert("Notifications are not supported in this browser.");
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const editIndex = document.getElementById("editIndex").value;
  const photoFile = document.getElementById("photo").files[0];

  const medicineData = {
    name: document.getElementById("medicineName").value,
    dosage: document.getElementById("dosage").value,
    time: document.getElementById("time").value,
    category: document.getElementById("category").value,
    repeat: document.getElementById("repeat").value,
    instructions: document.getElementById("instructions").value,
    taken: false,
    remindedToday: false,
    lastReminderDate: "",
    photo: ""
  };

  if (photoFile) {
    const reader = new FileReader();

    reader.onload = function () {
      medicineData.photo = reader.result;
      saveMedicineData(editIndex, medicineData);
    };

    reader.readAsDataURL(photoFile);
  } else {
    if (editIndex !== "") {
      medicineData.photo = medicines[editIndex].photo;
    }

    saveMedicineData(editIndex, medicineData);
  }
});

function saveMedicineData(editIndex, medicineData) {
  if (editIndex === "") {
    medicines.push(medicineData);
  } else {
    medicines[editIndex] = medicineData;
    document.getElementById("submitBtn").textContent = "Add Medication";
    document.getElementById("editIndex").value = "";
  }

  saveMedicines();
  displayMedicines();
  updateDashboard();
  displayCalendar();
  form.reset();
}

function displayMedicines() {
  list.innerHTML = "";

  const searchText = searchInput.value.toLowerCase().trim();

  const filteredMedicines = medicines.filter((med) => {
    return (
      med.name.toLowerCase().includes(searchText) ||
      med.dosage.toLowerCase().includes(searchText) ||
      med.time.toLowerCase().includes(searchText) ||
      med.category.toLowerCase().includes(searchText) ||
      med.repeat.toLowerCase().includes(searchText) ||
      med.instructions.toLowerCase().includes(searchText)
    );
  });

  if (filteredMedicines.length === 0) {
    list.innerHTML = "<p>No medications found.</p>";
    return;
  }

  filteredMedicines.forEach((med) => {
    const realIndex = medicines.indexOf(med);

    const div = document.createElement("div");
    div.className = "medicine-card";

    div.innerHTML = `
      ${med.photo ? `<img src="${med.photo}" alt="${med.name}">` : ""}

      <h3>${med.name}</h3>
      <p><strong>Dosage:</strong> ${med.dosage}</p>
      <p><strong>Time:</strong> ${med.time}</p>
      <p><strong>Category:</strong> ${med.category}</p>
      <p><strong>Repeat:</strong> ${med.repeat}</p>
      <p><strong>Instructions:</strong> ${med.instructions || "No instructions"}</p>

      <p class="${med.taken ? "taken" : "not-taken"}">
        ${med.taken ? "Taken" : "Not taken"}
      </p>

      <div class="card-actions">
        <button class="taken-btn" onclick="markAsTaken(${realIndex})">Taken</button>
        <button class="edit-btn" onclick="editMedicine(${realIndex})">Edit</button>
        <button class="snooze-btn" onclick="snoozeMedicine(${realIndex})">Snooze 5 mins</button>
        <button class="delete-btn" onclick="deleteMedicine(${realIndex})">Delete</button>
      </div>
    `;

    list.appendChild(div);
  });
}

function markAsTaken(index) {
  medicines[index].taken = true;
  saveMedicines();
  displayMedicines();
  updateDashboard();
}

function editMedicine(index) {
  const med = medicines[index];

  document.getElementById("medicineName").value = med.name;
  document.getElementById("dosage").value = med.dosage;
  document.getElementById("time").value = med.time;
  document.getElementById("category").value = med.category;
  document.getElementById("repeat").value = med.repeat;
  document.getElementById("instructions").value = med.instructions;
  document.getElementById("editIndex").value = index;

  document.getElementById("submitBtn").textContent = "Update Medication";
}

function deleteMedicine(index) {
  medicines.splice(index, 1);
  saveMedicines();
  displayMedicines();
  updateDashboard();
  displayCalendar();
}

function clearAllMedicines() {
  if (confirm("Are you sure you want to clear all medications?")) {
    medicines = [];
    saveMedicines();
    displayMedicines();
    updateDashboard();
    displayCalendar();
  }
}

function snoozeMedicine(index) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);

  medicines[index].time = now.toTimeString().slice(0, 5);
  medicines[index].taken = false;
  medicines[index].remindedToday = false;

  saveMedicines();
  displayMedicines();
  alert(`${medicines[index].name} snoozed for 5 minutes.`);
}

function updateDashboard() {
  const total = medicines.length;
  const taken = medicines.filter(med => med.taken).length;
  const missed = medicines.filter(med => !med.taken && med.time < new Date().toTimeString().slice(0, 5)).length;
  const upcoming = medicines.filter(med => !med.taken && med.time >= new Date().toTimeString().slice(0, 5)).length;

  document.getElementById("totalCount").textContent = total;
  document.getElementById("takenCount").textContent = taken;
  document.getElementById("missedCount").textContent = missed;
  document.getElementById("upcomingCount").textContent = upcoming;
}

function displayCalendar() {
  const calendar = document.getElementById("calendarView");

  if (medicines.length === 0) {
    calendar.innerHTML = "<p>No medication schedule yet.</p>";
    return;
  }

  calendar.innerHTML = medicines.map(med => `
    <p>
      📅 <strong>${med.name}</strong> - ${med.time} 
      (${med.category}, ${med.repeat})
    </p>
  `).join("");
}

function switchProfile() {
  const profileName = document.getElementById("profileName").value.trim();

  if (profileName === "") {
    alert("Please enter a profile name.");
    return;
  }

  currentProfile = profileName;
  localStorage.setItem("currentProfile", currentProfile);
  medicines = getMedicines();

  document.getElementById("currentProfileText").textContent = currentProfile;

  displayMedicines();
  updateDashboard();
  displayCalendar();
}

function exportSchedule() {
  let text = "Medication Schedule\n\n";

  medicines.forEach(med => {
    text += `Medication: ${med.name}\n`;
    text += `Dosage: ${med.dosage}\n`;
    text += `Time: ${med.time}\n`;
    text += `Category: ${med.category}\n`;
    text += `Repeat: ${med.repeat}\n`;
    text += `Instructions: ${med.instructions}\n`;
    text += "----------------------\n";
  });

  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "medication-schedule.txt";
  link.click();
}

document.getElementById("darkModeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

searchInput.addEventListener("input", displayMedicines);

setInterval(() => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const today = now.toDateString();

  medicines.forEach((med) => {
    if (med.time === currentTime && !med.taken && med.lastReminderDate !== today) {
      reminderSound.play();

      if (Notification.permission === "granted") {
        new Notification("Medication Reminder", {
          body: `Time to take ${med.name} (${med.dosage})`
        });
      } else {
        alert(`Time to take ${med.name} (${med.dosage})`);
      }

      med.lastReminderDate = today;

      if (med.repeat === "8hours") {
        const nextTime = new Date();
        nextTime.setHours(nextTime.getHours() + 8);
        med.time = nextTime.toTimeString().slice(0, 5);
      }

      saveMedicines();
      displayMedicines();
      updateDashboard();
      displayCalendar();
    }
  });
}, 1000);

displayMedicines();
updateDashboard();
displayCalendar();
searchInput.addEventListener("input", displayMedicines);