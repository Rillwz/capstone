// Flash notices leave on their own: 4s to read, then the fade-out. The URL params go
// with them so a refresh cannot show them twice. Each notice names the params it owns
// in `data-notice-params` (comma separated); without it no param is touched.
//
// The router swaps the DOM but keeps this module, so the notices are picked up again
// on every astro:page-load.
const init = () => {
  document.querySelectorAll<HTMLElement>("[data-notice]").forEach((notice) => {
    if (notice.dataset.noticeSeen) return;
    notice.dataset.noticeSeen = "1";

    const params = (notice.dataset.noticeParams ?? "")
      .split(",")
      .map((param) => param.trim())
      .filter(Boolean);

    setTimeout(() => {
      // The page may have moved on already.
      if (!notice.isConnected) return;
      notice.classList.add("is-leaving");
      setTimeout(() => {
        notice.remove();
        if (params.length === 0) return;
        const url = new URL(location.href);
        params.forEach((key) => url.searchParams.delete(key));
        history.replaceState(null, "", url.pathname + url.search);
      }, 400);
    }, 4000);
  });
};

document.addEventListener("astro:page-load", init);
init();
