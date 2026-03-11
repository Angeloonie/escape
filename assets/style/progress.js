(function () {
  const BAG_KEY = "__hp_room_progress_v1__";
  function readBag() {
    try {
      const raw = window.name || "";
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return {};
      }
      return parsed;
    } catch (_) {
      return {};
    }
  }
  function writeBag(bag) {
    try {
      window.name = JSON.stringify(bag || {});
    } catch (_) {}
  }
  function setValue(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (_) {}
    const bag = readBag();
    if (!bag[BAG_KEY] || typeof bag[BAG_KEY] !== "object") {
      bag[BAG_KEY] = {};
    }
    bag[BAG_KEY][key] = value;
    writeBag(bag);
  }
  function getValue(key) {
    try {
      const value = localStorage.getItem(key);
      if (typeof value === "string" && value.length > 0) {
        return value;
      }
    } catch (_) {}
    const bag = readBag();
    const progress = bag[BAG_KEY];
    if (!progress || typeof progress !== "object") {
      return null;
    }
    return typeof progress[key] === "string" ? progress[key] : null;
  }
  function removeValue(key) {
    try {
      localStorage.removeItem(key);
    } catch (_) {}
    const bag = readBag();
    if (!bag[BAG_KEY] || typeof bag[BAG_KEY] !== "object") {
      return;
    }
    delete bag[BAG_KEY][key];
    writeBag(bag);
  }
  window.HPProgress = {
    set: setValue,
    get: getValue,
    remove: removeValue
  };
})();
