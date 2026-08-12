const Toast = (() => {
  const container = document.querySelector(".toast-container");
  let currentItems = [];

  function show(message) {
    if (!message) return;
    const item = generateId();
    currentItems.push(item);
    container.innerHTML += `
      <div class="toast" data-toast="${item}">
        ${message}
      </div>
    `;
    container.classList.remove("hidden");

    setTimeout(() => {
      const itemEl = container.querySelector(`[data-toast="${item}"]`);
      itemEl.remove();
      const itemToRemove = item;
      currentItems = currentItems.filter((item) => item !== itemToRemove);
      if (currentItems.length <= 0) container.classList.add("hidden");
    }, 3000);
  }

  return { show };
})();
