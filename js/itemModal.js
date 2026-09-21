const ItemModal = (() => {
  const element = document.querySelector(".item-modal");
  const title = element.querySelector(".title");
  const nameInput = element.querySelector(".name-input");
  const urlInput = element.querySelector(".url-input");
  const contentInput = element.querySelector(".content-input");
  const iconInput = element.querySelector(".icon-input input");
  const iconPreview = element.querySelector(".icon-input img");
  const submitBtn = element.querySelector(".submit-btn");
  const deleteBtn = element.querySelector(".delete-btn");
  const listenBtn = element.querySelector(".listen-btn");
  const copyBtn = element.querySelector(".copy-btn");

  let currentItem = null;
  let currentItemType = "text";

  iconInput.oninput = (event) => {
    const file = event.target.files[0];
    iconPreview.src = URL.createObjectURL(file);
  };

  submitBtn.onclick = handleSubmit;
  deleteBtn.onclick = handleDelete;

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
    element.classList.toggle("text-modal", itemType === "text");
    iconInput.value = "";
    iconPreview.src = currentItem?.icon || `assets/images/${itemType}.png`;
    title.textContent = currentItem ? `Edit ${currentItem.name}` : `Create new ${itemType}`;
    nameInput.value = currentItem ? currentItem.name : createItemName(`New ${itemType}`);
    urlInput.classList.toggle("hidden", itemType !== "shortcut");
    urlInput.value = currentItem ? currentItem.url : "";
    [contentInput, listenBtn, copyBtn].forEach((el) => el.classList.toggle("hidden", itemType !== "text"));
    contentInput.value = currentItem ? currentItem.content : "";

    submitBtn.innerHTML = currentItem ? `<i class="bi bi-check2"></i> Update` : `<i class="bi bi-plus-lg"></i> Create`;
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

    let itemData = {
      name: nameInput.value,
      type: currentItemType,
      url: urlInput.value,
      content: contentInput.value,
      icon: iconInput.value ? await getFileDataUrl(iconInput.files[0]) : currentItem?.icon || null,
    };

    itemData = await createItemData({ ...currentItem, ...itemData });
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

  function listenText() {
    const text = contentInput.value.trim();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }

  async function copyText() {
    // Select the text inside the textarea for visual feedback
    contentInput.select();
    contentInput.setSelectionRange(0, 99999); // For mobile devices

    // Write the text to the clipboard
    await navigator.clipboard.writeText(contentInput.value);
    Toast.show("Text copied successfully!");
  }

  return { openCreate, openUpdate, close, listenText, copyText };
})();
