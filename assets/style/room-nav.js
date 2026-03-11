(function () {
  function buildGreatHallHref(param, extraValue) {
    const params = new URLSearchParams(window.location.search || "");
    if (extraValue) {
      params.set(param, extraValue);
    }
    const query = params.toString();
    return query ? "grotezaal.html?" + query : "grotezaal.html";
  }

  function syncGreatHallLink(linkNode, param, extraValue) {
    if (!linkNode) {
      return;
    }
    linkNode.href = buildGreatHallHref(param, extraValue);
  }

  function updateOwnUrlParam(param, value) {
    try {
      const url = new URL(window.location.href);
      if (value) {
        url.searchParams.set(param, value);
      }
      const query = url.searchParams.toString();
      const next = query ? url.pathname + "?" + query : url.pathname;
      window.history.replaceState(null, "", next);
    } catch (_) {}
  }

  window.HPRoomNav = {
    buildGreatHallHref: buildGreatHallHref,
    syncGreatHallLink: syncGreatHallLink,
    updateOwnUrlParam: updateOwnUrlParam
  };
})();
