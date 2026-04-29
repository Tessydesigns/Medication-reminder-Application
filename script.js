const form = document.getElementById('medicineForm');
const list = document.getElementById('medicineList');

let medicines = JSON.parse(localStorage.getItem('medicines')) || [];

function save() {
  localStorage.setItem('medicines', JSON.stringify(medicines));
}

function display() {
  list.innerHTML = '';

  if (medicines.length === 0) {
    list.innerHTML = '<p>No medications yet.</p>';
    return;
  }

  medicines.forEach((med, index) => {
    const div = document.createElement('div');
    div.className = 'medicine-card';

    div.innerHTML = `
      <h3>${med.name}</h3>
      <p>Dosage: ${med.dosage}</p>
      <p>Time: ${med.time}</p>
      <p>${med.instructions || ''}</p>
      <p>${med.taken ? 'Taken' : 'Not taken'}</p>

      <div class="card-actions">
        <button class="taken-btn" onclick="markTaken(${index})">Taken</button>
        <button class="delete-btn" onclick="deleteMed(${index})">Delete</button>
      </div>
    `;

    list.appendChild(div);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const med = {
    name: medicineName.value,
    dosage: dosage.value,
    time: time.value,
    instructions: instructions.value,
    taken: false
  };

  medicines.push(med);
  save();
  display();
  form.reset();
});

function markTaken(index) {
  medicines[index].taken = true;
  save();
  display();
}

function deleteMed(index) {
  medicines.splice(index, 1);
  save();
  display();
}

function clearAllMedicines() {
  medicines = [];
  save();
  display();
}

// Reminder check
setInterval(() => {
  const now = new Date().toTimeString().slice(0, 5);

  medicines.forEach(med => {
    if (med.time === now && !med.taken) {
      alert(`Time to take ${med.name}`);
    }
  });
}, 60000);

display();