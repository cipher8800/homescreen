const ConfirmModal = (() => {
  const element = document.querySelector(".confirm-modal");
  const titleEl = element.querySelector(".title");
  const msgEl = element.querySelector(".msg");
  const confirmBtn = element.querySelector(".confirm");
  const cancelBtn = element.querySelector(".cancel");

  function confirmAction(title, message) {
    return new Promise((resolve) => {
      titleEl.textContent = title;
      msgEl.textContent = message;

      element.hidden = false

      confirmBtn.onclick = () => {
        close();
        resolve(true);
      };

      cancelBtn.onclick = () => {
        close();
        resolve(false);
      };
    });
  }

  function close() {
    element.hidden = true
  }

  return { confirmAction, close };
})();
