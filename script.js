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
  const heroPhoto = document.querySelector(".hero-photo");
  const focusContainers = Array.from(document.querySelectorAll("[data-true-focus]"));
  const shinyTextEls = Array.from(document.querySelectorAll("[data-shiny-text]"));

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

  function initTrueFocus(container) {
    const words = Array.from(container.querySelectorAll(".focus-word"));
    const frame = container.querySelector(".focus-frame");
    if (!words.length || !frame) return;

    const manualMode = container.dataset.manualMode === "true";
    const blurAmount = Number(container.dataset.blurAmount || 5);
    const animationDuration = Number(container.dataset.animationDuration || 0.5);
    const pauseBetweenAnimations = Number(container.dataset.pauseBetweenAnimations || 1);

    let currentIndex = 0;
    let lastActiveIndex = 0;
    let timer = null;

    frame.style.transition = `transform ${animationDuration}s ease, width ${animationDuration}s ease, height ${animationDuration}s ease, opacity 220ms ease`;

    function applyWordState() {
      for (const [index, word] of words.entries()) {
        const isActive = index === currentIndex;
        word.classList.toggle("is-active", isActive);
        word.style.filter = isActive ? "blur(0px)" : `blur(${blurAmount}px)`;
        word.style.transition = `filter ${animationDuration}s ease`;
      }
    }

    function updateFrame() {
      const activeWord = words[currentIndex];
      if (!activeWord) return;

      const parentRect = container.getBoundingClientRect();
      const activeRect = activeWord.getBoundingClientRect();

      const x = activeRect.left - parentRect.left;
      const y = activeRect.top - parentRect.top;
      frame.style.transform = `translate(${x}px, ${y}px)`;
      frame.style.width = `${activeRect.width}px`;
      frame.style.height = `${activeRect.height}px`;
      frame.classList.add("is-visible");
    }

    function setActive(index) {
      currentIndex = (index + words.length) % words.length;
      applyWordState();
      updateFrame();
    }

    function startAutoPlay() {
      if (manualMode || words.length < 2) return;
      const intervalMs = (animationDuration + pauseBetweenAnimations) * 1000;
      timer = window.setInterval(() => {
        setActive(currentIndex + 1);
      }, intervalMs);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (manualMode) {
      words.forEach((word, index) => {
        word.style.cursor = "pointer";
        word.addEventListener("mouseenter", () => {
          lastActiveIndex = index;
          setActive(index);
        });
      });
      container.addEventListener("mouseleave", () => {
        setActive(lastActiveIndex);
      });
    }

    setActive(0);
    startAutoPlay();

    window.addEventListener("resize", updateFrame);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoPlay();
      } else if (!timer) {
        startAutoPlay();
        updateFrame();
      }
    });
  }

  for (const container of focusContainers) {
    initTrueFocus(container);
  }

  function initShinyText(el) {
    const disabled = el.dataset.disabled === "true";
    const speed = Number(el.dataset.speed || 2);
    const delay = Number(el.dataset.delay || 0);
    const color = el.dataset.color || "#b5b5b5";
    const shineColor = el.dataset.shineColor || "#ffffff";
    const spread = Number(el.dataset.spread || 120);
    const yoyo = el.dataset.yoyo === "true";
    const pauseOnHover = el.dataset.pauseOnHover === "true";
    const direction = el.dataset.direction === "right" ? "right" : "left";

    let isPaused = false;
    let elapsed = 0;
    let lastTime = null;
    let rafId = null;

    const animationDuration = speed * 1000;
    const delayDuration = delay * 1000;
    const directionSign = direction === "left" ? 1 : -1;

    el.style.backgroundImage = `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`;

    function setProgress(percent) {
      const p = Math.max(0, Math.min(100, percent));
      const position = 150 - p * 2;
      el.style.backgroundPosition = `${position}% center`;
    }

    function tick(time) {
      if (disabled || isPaused) {
        lastTime = null;
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      if (lastTime === null) {
        lastTime = time;
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      const deltaTime = time - lastTime;
      lastTime = time;
      elapsed += deltaTime;

      if (yoyo) {
        const cycleDuration = animationDuration + delayDuration;
        const fullCycle = cycleDuration * 2;
        const cycleTime = elapsed % fullCycle;

        if (cycleTime < animationDuration) {
          const p = (cycleTime / animationDuration) * 100;
          setProgress(directionSign === 1 ? p : 100 - p);
        } else if (cycleTime < cycleDuration) {
          setProgress(directionSign === 1 ? 100 : 0);
        } else if (cycleTime < cycleDuration + animationDuration) {
          const reverseTime = cycleTime - cycleDuration;
          const p = 100 - (reverseTime / animationDuration) * 100;
          setProgress(directionSign === 1 ? p : 100 - p);
        } else {
          setProgress(directionSign === 1 ? 0 : 100);
        }
      } else {
        const cycleDuration = animationDuration + delayDuration;
        const cycleTime = elapsed % cycleDuration;
        if (cycleTime < animationDuration) {
          const p = (cycleTime / animationDuration) * 100;
          setProgress(directionSign === 1 ? p : 100 - p);
        } else {
          setProgress(directionSign === 1 ? 100 : 0);
        }
      }

      rafId = window.requestAnimationFrame(tick);
    }

    if (pauseOnHover) {
      el.addEventListener("mouseenter", () => {
        isPaused = true;
      });
      el.addEventListener("mouseleave", () => {
        isPaused = false;
      });
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || disabled) {
      setProgress(40);
      return;
    }

    setProgress(0);
    rafId = window.requestAnimationFrame(tick);

    window.addEventListener("beforeunload", () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    });
  }

  for (const shinyTextEl of shinyTextEls) {
    initShinyText(shinyTextEl);
  }

  // Subtle pointer parallax for hero portrait.
  if (heroPhoto && window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
    const maxX = 8;
    const maxY = 6;
    heroPhoto.style.transition = "transform 320ms ease";

    window.addEventListener("mousemove", (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      const moveX = x * maxX;
      const moveY = y * maxY;
      heroPhoto.style.transform = `translate3d(${moveX}px, ${moveY - 12}px, 0)`;
    });

    window.addEventListener("mouseleave", () => {
      heroPhoto.style.transform = "translate3d(0px, -12px, 0)";
    });
  }
})();
