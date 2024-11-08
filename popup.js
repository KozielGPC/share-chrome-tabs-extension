document.getElementById("saveTabs").addEventListener("click", saveTabs);
document.getElementById("exportTabs").addEventListener("click", exportTabs);
document.getElementById("importTabs").addEventListener("click", () => {
  document.getElementById("importFile").click();
});
document.getElementById("importFile").addEventListener("change", importTabs);

async function saveTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const tabData = tabs.map(tab => ({
    title: tab.title,
    url: tab.url
  }));
  
  chrome.storage.local.set({ savedTabs: tabData }, () => {
    alert("Tabs saved!");
  });
}

async function exportTabs() {
  chrome.storage.local.get("savedTabs", data => {
    const savedTabs = data.savedTabs || [];
    const blob = new Blob([JSON.stringify(savedTabs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "tabs.json";
    a.click();
    
    URL.revokeObjectURL(url);
  });
}

function importTabs(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const importedTabs = JSON.parse(reader.result);
      for (const tab of importedTabs) {
        chrome.tabs.create({ url: tab.url });
      }
      alert("Tabs imported successfully!");
    } catch (error) {
      console.error("Error importing tabs:", error);
      alert("Failed to import tabs.");
    }
  };
  reader.readAsText(file);
}
