const saveTabsButton = document.getElementById('saveTabs');
const snapshotList = document.getElementById('snapshotList');
const modalOverlay = document.getElementById('modalOverlay');
const modalSnapshotName = document.getElementById('modalSnapshotName');
const tabList = document.getElementById('tabList');
const cancelModal = document.getElementById('cancelModal');
const confirmSaveTabs = document.getElementById('confirmSaveTabs');

let snapshots = [];

window.onload = function() {
  const savedSnapshots = JSON.parse(localStorage.getItem('snapshots')) || [];
  snapshots = savedSnapshots;
  renderSnapshots();
};

saveTabsButton.addEventListener('click', async () => {
  modalOverlay.classList.add('show');
  await listOpenTabs();
});

cancelModal.addEventListener('click', () => {
  closeModal();
});

async function listOpenTabs() {
  const tabs = await getOpenTabs();
  tabList.innerHTML = ''; 

  tabs.forEach((tab, index) => {
    const tabItem = document.createElement('div');
    tabItem.className = 'tab-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `tab-${index}`;
    checkbox.checked = true;

    const label = document.createElement('label');
    label.htmlFor = `tab-${index}`;
    label.textContent = tab.title || tab.url;

    tabItem.appendChild(checkbox);
    tabItem.appendChild(label);
    tabList.appendChild(tabItem);
  });
}

async function getOpenTabs() {
  return new Promise((resolve) => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      resolve(tabs.map(tab => ({ url: tab.url, title: tab.title })));
    });
  });
}

confirmSaveTabs.addEventListener('click', async () => {
  const snapshotName = modalSnapshotName.value.trim();
  if (!snapshotName) {
    alert("Please enter a name for the snapshot.");
    return;
  }

  const selectedTabs = [];
  const checkboxes = tabList.querySelectorAll('input[type="checkbox"]');
  const tabs = await getOpenTabs();

  checkboxes.forEach((checkbox, index) => {
    if (checkbox.checked) {
      selectedTabs.push(tabs[index]);
    }
  });

  const newSnapshot = { name: snapshotName, tabs: selectedTabs };
  snapshots.push(newSnapshot);

  localStorage.setItem('snapshots', JSON.stringify(snapshots));
  closeModal();
  renderSnapshots();
});

function closeModal() {
  modalOverlay.classList.remove('show');
  modalSnapshotName.value = '';
}

function renderSnapshots() {
  snapshotList.innerHTML = ''; 
  snapshots.forEach((snapshot, index) => {
    const snapshotItem = document.createElement('li');
    snapshotItem.className = 'snapshot-item';

    const snapshotName = document.createElement('span');
    snapshotName.className = 'snapshot-name';
    snapshotName.textContent = snapshot.name;
    snapshotName.onclick = () => openTabs(snapshot.tabs);

    const iconContainer = document.createElement('div');
    iconContainer.className = 'snapshot-icons';

    const editButton = document.createElement('button');
    editButton.className = 'icon-button';
    editButton.title = 'Edit';
    editButton.innerHTML = '✏️';
    editButton.onclick = () => editSnapshot(index);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'icon-button';
    deleteButton.title = 'Delete';
    deleteButton.innerHTML = '🗑️';
    deleteButton.onclick = () => deleteSnapshot(index);

    iconContainer.appendChild(editButton);
    iconContainer.appendChild(deleteButton);
    snapshotItem.appendChild(snapshotName);
    snapshotItem.appendChild(iconContainer);
    snapshotList.appendChild(snapshotItem);
  });
}

function openTabs(tabs) {
  tabs.forEach(tab => {
    chrome.tabs.create({ url: tab.url });
  });
}

function editSnapshot(index) {
  const newName = prompt("Enter the new name for this snapshot:", snapshots[index].name);
  if (newName && newName.trim() !== '') {
    snapshots[index].name = newName.trim();
    localStorage.setItem('snapshots', JSON.stringify(snapshots));
    renderSnapshots();
  }
}


function deleteSnapshot(index) {
  if (confirm("Are you sure you want to delete this snapshot?")) {
    snapshots.splice(index, 1);
    localStorage.setItem('snapshots', JSON.stringify(snapshots));
    renderSnapshots();
  }
}
