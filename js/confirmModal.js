const ConfirmModal = (() => {
  const element = document.querySelector(".confirm-modal");
  const titleEl = element.querySelector(".title");
  const msgEl = element.querySelector(".msg");
  let resolveConfirm = null;

  function confirmAction(title, message) {
    return new Promise((resolve) => {
      titleEl.textContent = title;
      msgEl.textContent = message;
      element.classList.toggle("hidden", false);

      resolveConfirm = resolve;
    });
  }

  function close(result = false) {
    element.classList.toggle("hidden", true);

    const resolve = resolveConfirm;
    resolveConfirm = null;

    if (resolve) resolve(result);
  }

  return { confirmAction, close };
})();
