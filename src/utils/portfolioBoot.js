const BOOT_TIMEOUT_MS = 10000;
const TASK_NAMES = ["shell", "fonts", "assets", "scene", "data"];
const STORE_KEY = "__nixlinPortfolioBoot";

function createStore() {
  return {
    started: false,
    timedOut: false,
    tasks: Object.fromEntries(TASK_NAMES.map((name) => [name, "pending"])),
    listeners: new Set(),
    timeoutId: null,
  };
}

function getStore(create = false) {
  if (typeof window === "undefined") return null;
  if (!window[STORE_KEY] && create) window[STORE_KEY] = createStore();
  return window[STORE_KEY] || null;
}

function toSnapshot(store) {
  const statuses = Object.values(store.tasks);
  const settled = statuses.filter((status) => status !== "pending").length;
  return {
    tasks: { ...store.tasks },
    progress: Math.round((settled / TASK_NAMES.length) * 100),
    timedOut: store.timedOut,
    failed: statuses.some((status) => status === "failed" || status === "timeout"),
  };
}

function notify(store) {
  const snapshot = toSnapshot(store);
  store.listeners.forEach((listener) => listener(snapshot));
  if (snapshot.progress === 100 && store.timeoutId) {
    window.clearTimeout(store.timeoutId);
    store.timeoutId = null;
  }
}

export function getPortfolioBootSnapshot() {
  const store = getStore(true);
  return store ? toSnapshot(store) : null;
}

export function subscribeToPortfolioBoot(listener) {
  const store = getStore(true);
  store.listeners.add(listener);
  listener(toSnapshot(store));
  return () => store.listeners.delete(listener);
}

export function markPortfolioBootTask(name, result = "ready") {
  const store = getStore();
  if (!store || !(name in store.tasks) || store.tasks[name] !== "pending") return;
  store.tasks[name] = result === "failed" ? "failed" : "ready";
  notify(store);
}

function waitForImage(image) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (loaded) => {
      if (settled) return;
      settled = true;
      image.removeEventListener("load", onLoad);
      image.removeEventListener("error", onError);
      resolve(loaded);
    };
    const decode = () => {
      if (typeof image.decode !== "function") {
        finish(image.naturalWidth > 0);
        return;
      }
      image.decode().then(() => finish(true)).catch(() => finish(false));
    };
    const onLoad = () => decode();
    const onError = () => finish(false);

    if (image.complete) {
      decode();
    } else {
      image.addEventListener("load", onLoad, { once: true });
      image.addEventListener("error", onError, { once: true });
    }
  });
}

function waitForVisibleImages() {
  const images = [...document.images].filter((image) => {
    const bounds = image.getBoundingClientRect();
    const style = window.getComputedStyle(image);
    return bounds.width > 0
      && bounds.height > 0
      && bounds.top < window.innerHeight
      && bounds.bottom > 0
      && style.display !== "none"
      && style.visibility !== "hidden";
  });

  return Promise.all(images.map(waitForImage)).then((results) => results.every(Boolean));
}

export function startPortfolioBoot({ projectDetails = false } = {}) {
  const store = getStore(true);
  if (store.started) return;
  store.started = true;

  store.timeoutId = window.setTimeout(() => {
    store.timedOut = true;
    TASK_NAMES.forEach((name) => {
      if (store.tasks[name] === "pending") store.tasks[name] = "timeout";
    });
    notify(store);
  }, BOOT_TIMEOUT_MS);

  markPortfolioBootTask("shell");

  Promise.resolve(document.fonts?.ready)
    .then(() => markPortfolioBootTask("fonts"))
    .catch(() => markPortfolioBootTask("fonts", "failed"));

  if (projectDetails) {
    // The detail page marks this after its existing API request and hero image decode.
    // It is not fetched a second time for the loader.
  } else {
    waitForVisibleImages()
      .then((loaded) => markPortfolioBootTask("assets", loaded ? "ready" : "failed"))
      .catch(() => markPortfolioBootTask("assets", "failed"));
  }

}
