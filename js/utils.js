window.addEventListener("error", (event) => {
  const error = `${event.type}: ${event.message}`;
  console.error(error);
  alert(error);
});

function stopPropagation(event) {
  event.stopPropagation();
}

function sleep(ms) {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function save(key, value) {
  localStorage.setItem(`${PROJECT_NAME}_${key}`, JSON.stringify(value));
}

function load(key, defaultValue) {
  const savedValue = localStorage.getItem(`${PROJECT_NAME}_${key}`);
  if (savedValue == null) return defaultValue;
  return JSON.parse(savedValue);
}

function reset(key) {
  localStorage.removeItem(`${PROJECT_NAME}_${key}`);
}

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function getFileDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function getFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

function getFileExtension(file) {
  const fileName = file.name;
  const lastDot = fileName.lastIndexOf(".");
  
  return lastDot === -1 ? "" : fileName.slice(lastDot);
}

function getFileName(file) {
  const fileName = file.name
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex <= 0) return fileName;
  
  return fileName.slice(0, lastDotIndex);
}

function download(url, name) {
  const link = document.createElement("a");

  link.href = url;
  link.download = name;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function toggleFullscreen(force) {
  if (document.fullscreenElement && force !== true) {
    document.exitFullscreen();
  } else if (force !== false) {
    document.documentElement.requestFullscreen();
  }
}
