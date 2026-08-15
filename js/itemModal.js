const ItemModal = (() => {
  const element = document.querySelector(".item-modal");
  const title = element.querySelector(".title");
  const nameInput = element.querySelector(".name-input");
  const urlInput = element.querySelector(".url-input");
  const contentInput = element.querySelector(".content-input");
  const iconInput = element.querySelector(".icon-input input");
  const iconPreview = element.querySelector(".icon-input img");
  const submitBtn = element.querySelector(".submit");
  const deleteBtn = element.querySelector(".delete");

  let currentItem = null;
  let currentItemType = "text";

  iconInput.oninput = (event) => {
    const file = event.target.files[0];
    iconPreview.src = URL.createObjectURL(file);
  };

  submitBtn.onclick = handleSubmit;
  deleteBtn.onclick = handleDelete;

  async function createItemData(item = {}) {
    const itemData = {
      id: item.id || generateId(),
      order: currentItems.reduce((max, item) => Math.max(max, item.order), 0) + 1,
      name: nameInput.value,
      type: item.type || currentItemType,
      parentId: item.parentId || currentFolder.id,
      path: item.path || [...currentFolder.path, { id: currentFolder.id, name: currentFolder.name }],
      url: urlInput.value,
      content: contentInput.value,
      icon: iconInput.value ? await getFileDataUrl(iconInput.files[0]) : item.icon || null,
      lastModified: Date.now(),
    };
    return itemData;
  }

  function openCreate(itemType = "text") {
    currentItemType = itemType;
    update();
    open();
  }

  function openUpdate(itemId) {
    const item = getItem(itemId);
    currentItem = item;
    update();
    open();
  }

  function update() {
    const itemType = currentItem?.type || currentItemType || "text";
    iconInput.value = "";
    iconPreview.src = currentItem?.icon || `assets/images/${itemType}.png`;
    title.textContent = currentItem ? `Edit ${currentItem.name}` : `Create new ${itemType}`;
    nameInput.value = currentItem ? currentItem.name : createItemName(`New ${itemType}`);
    urlInput.classList.toggle("hidden", itemType !== "shortcut");
    urlInput.value = currentItem ? currentItem.url : "";
    contentInput.classList.toggle("hidden", itemType !== "text");
    contentInput.value = currentItem ? currentItem.content : "";

    submitBtn.textContent = currentItem ? "Update" : "Create";
    deleteBtn.classList.toggle("hidden", currentItem == null);
  }

  async function handleSubmit() {
    if (iconInput.value) {
      const file = iconInput.files[0];
      if (file.size > 5 * 1024 * 1024) {
        Toast.show("Upload failed: That file exceeds 5MB limit");
        return;
      }
    }
    const itemData = await createItemData(currentItem || {});
    currentItem ? updateItem(currentItem.id, itemData) : createItem(itemData);
    close();
  }

  async function handleDelete() {
    const deleted = await deleteItem(currentItem.id);
    if (deleted) close();
  }

  function open() {
    element.classList.toggle("hidden", false);
  }

  function close() {
    element.classList.toggle("hidden", true);

    currentItem = null;
  }

  function createItemName(baseName) {
    let count = 1;
    let name;
    do {
      name = `${baseName + (count > 1 ? ` (${count})` : "")}`;
      count++;
    } while (currentItems.some((item) => item.parentId === currentFolder.id && item.name === name));
    return name;
  }

  return { openCreate, openUpdate, close };
})();
