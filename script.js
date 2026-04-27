(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const toast = document.querySelector(".toast");
  let toastTimer = null;

  function showToast() {
    if (!toast) return;
    toast.hidden = false;
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(8px)";
    requestAnimationFrame(() => {
      toast.style.transition = "opacity 220ms ease, transform 220ms ease";
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%) translateY(0px)";
    });

    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(8px)";
      toastTimer = window.setTimeout(() => {
        toast.hidden = true;
        toast.style.transition = "";
      }, 240);
    }, 2400);
  }

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.matches("[data-toast]")) {
      e.preventDefault();
      showToast();
    }
  });

  const revealEls = Array.from(document.querySelectorAll(".reveal"));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );

    for (const el of revealEls) io.observe(el);
  } else {
    for (const el of revealEls) el.classList.add("is-visible");
  }
})();
