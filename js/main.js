const header = document.querySelector("body .header");
const clockEl = document.querySelector(".clock");
const itemContainer = document.querySelector(".item-container");
const breadcrumbs = document.querySelector(".breadcrumbs");
const settingsModal = document.querySelector(".settings-modal");

const rootFolder = { id: null, name: "Root", path: [] };
let currentItems = null;
let currentFolder = rootFolder;
let darkTheme = load("darkTheme", true);
let selectedItem = null;
let shouldSortByName = load("shouldSortByName", false);
let currentWallpaper = null;

document.addEventListener("DOMContentLoaded", () => {
  update();
});

async function update() {
  currentItems = (await DB.getItems("currentItems")) || [];
  displayItems();
  displayBreadcrumbs();
  toggleTheme(darkTheme);
  DB.getItem("settings", "wallpaper").then((value) => {
    if (!value) return;
    currentWallpaper = value.value;
    updateWallpaper();
  });
}

function getItem(itemId) {
  return currentItems.filter((item) => item.id === itemId)[0];
}

function createItem(itemData) {
  if (!itemData.name) return;

  currentItems.push(itemData);
  DB.addItem("currentItems", itemData);

  selectedItem = itemData.id;
  displayItems();
  Toast.show("Item has been successfully created");
}

function updateItem(itemId, updates) {
  if (!updates.name) return;
  const item = getItem(itemId);
  const updatedItem = { ...item, ...updates };

  currentItems = currentItems.map((item) => (item.id === itemId ? updatedItem : item));
  DB.putItem("currentItems", updatedItem);
  displayItems();
  Toast.show("Item has been successfully updated");
}

async function deleteItem(itemId = selectedItem) {
  if (!itemId) return;

  const item = currentItems.find((item) => item.id === itemId);

  const confirmed = await ConfirmModal.confirmAction(`Delete "${item.name}"?`, "This action cannot be undone.");
  if (!confirmed) return;

  currentItems = currentItems.filter((item) => !(item.id === itemId || item.path.some((item) => item.id === itemId)));
  deselectItem();
  DB.deleteItem("currentItems", itemId);
  displayItems();
  Toast.show("Item has been successfully deleted");
}

function sortItems(items) {
  if (shouldSortByName) items.sort((a, b) => a.name.localeCompare(b.name));
  else items.sort((a, b) => b.lastModified - a.lastModified);

  const sortedItems = [...items.filter((item) => item.type === "folder"), ...items.filter((item) => item.type === "shortcut" || item.type === "text")];

  return sortedItems;
}

function toggleSort() {
  shouldSortByName = !shouldSortByName;
  save("shouldSortByName", shouldSortByName);
  displayItems();
}

function displayItems(items) {
  if (!items) items = currentItems.filter((item) => item.parentId === currentFolder.id);

  items = sortItems(items);
  itemContainer.innerHTML =
    items
      .map(
        (item) =>
          `
            <div class="item ${item.type} ${selectedItem === item.id ? "selected" : ""}" data-id="${item.id}" onclick="handleItem('${item.id}')">
              <img src="${getItemIcon(item)}">
              <p>${item.name}</p>
            </div>
          `,
      )
      .join("") || `<span class="message">No items found</span>`;
}

function getItemIcon(item) {
  const icon = item.icon || `assets/images/${item.type}.png`;

  if (item.url) {
    if (!isValidUrl(item.url)) return icon;

    const newUrl = new URL(item.url);
    if (newUrl.hostname === "cipher8800.github.io") {
      return `${item.url}/favicon.png`;
    } else if (!newUrl.hostname || newUrl.hostname === "127.0.0.1") {
      return icon;
    } else {
      return `https://www.google.com/s2/favicons?domain=${newUrl.hostname}&sz=128`;
    }
  }

  return icon;
}

function handleItem(itemId) {
  if (selectedItem === itemId) {
    const item = getItem(itemId);
    switch (item.type) {
      case "folder":
        openFolder(item.id);
        break;
      case "shortcut":
        if (!isValidUrl(item.url)) break;
        window.open(item.url, "_blank");
        break;
      case "text":
        ItemModal.openUpdate(item.id);
        break;
      default:
        break;
    }
  } else {
    selectItem(itemId);
  }
}

function selectItem(itemId) {
  deselectItem();
  selectedItem = itemId;
  document.querySelector(`[data-id="${selectedItem}"]`).classList.add("selected");
}

function deselectItem() {
  if (!selectedItem) return;
  document.querySelector(`[data-id="${selectedItem}"]`).classList.remove("selected");
  selectedItem = null;
}

function editItem() {
  if (!selectedItem) return;
  ItemModal.openUpdate(selectedItem);
}

function openFolder(ref) {
  deselectItem();
  if (Number.isFinite(ref)) {
    currentFolder = currentItems[ref];
  } else if (typeof ref === "string") {
    currentFolder = currentItems.filter((item) => item.id === ref)[0];
  }
  if (!currentFolder) currentFolder = rootFolder;
  displayItems();
  displayBreadcrumbs();
}

function toggleTheme(force = undefined) {
  const checkbox = document.querySelector(".theme-checkbox");
  const descEl = document.querySelector(".theme-desc");
  force === undefined ? (darkTheme = !darkTheme) : (darkTheme = force);
  save("darkTheme", darkTheme);
  document.body.classList.toggle("dark-theme", darkTheme);
  checkbox.checked = darkTheme;
  descEl.textContent = darkTheme ? "Enabled" : "Disabled";
}

function displayBreadcrumbs() {
  breadcrumbs.innerHTML = "";
  breadcrumbs.innerHTML += currentFolder.path
    .map(
      (route) => `
            <button onclick="openFolder('${route.id}')">${route.name}</button> /
          `,
    )
    .join("");
  breadcrumbs.innerHTML += `<button>${currentFolder.name}</button>`;
  breadcrumbs.scrollLeft = breadcrumbs.scrollWidth;
}

async function changeWallpaper(file) {
  if (!file) return;

  currentWallpaper = file;
  await DB.putItem("settings", {
    id: "wallpaper",
    value: file,
  });

  updateWallpaper();
}

function updateWallpaper() {
  if (!currentWallpaper) return;
  document.querySelector(".app").style.background = `
    var(--overlay-gradient),
    url("${URL.createObjectURL(currentWallpaper)}")
    center / cover no-repeat
  `;
}

// Clock

function updateClock() {
  const now = new Date();

  let hours = now.getHours() % 12;
  hours = hours || 12;

  const minutes = String(now.getMinutes()).padStart(2, "0");

  clockEl.textContent = `${hours}:${minutes}`;
}

updateClock();
setInterval(updateClock, 1000);

// Export items + settings
async function exportData() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),

    currentItems: await DB.getItems("currentItems"),
  };

  const json = JSON.stringify(data, null, 2);

  const blob = new Blob([json], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  download(url, `homescreen-items-${new Date().toISOString().slice(0, 10)}.json`);
}

async function importData(file) {
  const text = await file.text();
  const data = JSON.parse(text);

  // Basic validation
  if (!data || typeof data !== "object") {
    throw new Error("Invalid backup file.");
  }

  for (const item of data.currentItems) {
    await DB.putItem("currentItems", item);
  }

  update();
}

function toggleSettingsModal() {
  hide(settingsModal);
}
