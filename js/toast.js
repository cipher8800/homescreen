const Toast = (() => {
  const element = document.querySelector(".toast");

  currentItems = [];
  max = 5;
  time = 3;

  async function show(message) {
    element.classList.remove("hidden");
    const id = generateId();

    element.insertAdjacentHTML(
      "beforeend",
      `
      <div data-id="${id}" class="item">
        ${message}
      </div>
    `
    );
    const itemEl = element.querySelector(`[data-id="${id}"]`);

    if (element.children.length > max) element.children[0].remove();

    await sleep(1000 * time);

    itemEl.remove();
    if (element.children.length <= 0) element.classList.add("hidden");
  }

  return { show }
})();
