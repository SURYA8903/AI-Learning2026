(function () {
  const path = window.location.pathname || "/";
  const isAuthPage = path === "/" || path.endsWith("/index.html");
  const isDashboardPage = /admin-dashboard|student-dashboard|trainer-dashboard/.test(path);

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  }

  function onWindowLoad(callback) {
    if (document.readyState === "complete") {
      callback();
    } else {
      window.addEventListener("load", callback, { once: true });
    }
  }

  function injectBackdrop() {
    if (document.querySelector(".premium-orbs")) return;
    const orbs = document.createElement("div");
    orbs.className = "premium-orbs";
    orbs.setAttribute("aria-hidden", "true");
    orbs.innerHTML = "<span></span><span></span><span></span><span></span>";
    document.body.prepend(orbs);
  }

  function addRipple(target) {
    target.addEventListener("pointerdown", (event) => {
      const rect = target.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple-node";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      target.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 700);
    });
  }

  function setupRipples(root) {
    root.querySelectorAll("button, .nav-item, .role-chip, .skill-badge, .btn-action").forEach((node) => {
      if (!node.dataset.rippleBound) {
        node.dataset.rippleBound = "true";
        addRipple(node);
      }
    });
  }

  function setupRevealAnimations() {
    const revealTargets = Array.from(document.querySelectorAll(
      ".premium-hero, .stat-card, .panel-card, .course-card, .student-card, .task-card, .todo-card, .achievement-badge, .modal-content, .bg-white.rounded-lg.border-2.border-gray-200.overflow-hidden"
    ));

    revealTargets.forEach((node, index) => {
      node.classList.add("reveal-on-scroll");
      node.style.transitionDelay = `${Math.min(index % 6, 5) * 45}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealTargets.forEach((node) => observer.observe(node));
  }

  function setupTilt(root) {
    root.querySelectorAll(".stat-card, .panel-card, .course-card, .student-card, .task-card, .todo-card, .achievement-badge, .auth-card").forEach((card) => {
      if (card.dataset.tiltBound) return;
      card.dataset.tiltBound = "true";
      card.classList.add("interactive-tilt");

      card.addEventListener("pointermove", (event) => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 10;
        const rotateX = (0.5 - y) * 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  function upgradeLoadingAndEmptyStates(root) {
    root.querySelectorAll("div, p, td").forEach((node) => {
      const text = (node.textContent || "").trim();
      if (!text) return;

      if (/^Loading/i.test(text) && node.children.length === 0 && !node.dataset.placeholderReady) {
        node.dataset.placeholderReady = "true";
        node.classList.add("premium-loading");
        node.innerHTML = [
          '<div class="skeleton-stack" aria-hidden="true">',
          '<div class="skeleton-line"></div>',
          '<div class="skeleton-line short"></div>',
          '<div class="skeleton-line"></div>',
          "</div>"
        ].join("");
      }

      if (/^(No |Select |Unable )/i.test(text) && node.children.length === 0 && !node.classList.contains("premium-empty")) {
        node.classList.add("premium-empty");
      }
    });
  }

  function markProgressBars(root) {
    root.querySelectorAll('.progress-fill, [style*="width:"][class*="bg-gradient-to-r"]').forEach((node) => {
      node.setAttribute("data-progress-fill", "true");
    });
  }

  function animateMetric(node) {
    if (!node) return;
    const currentText = (node.textContent || "").trim();
    if (!currentText || node.dataset.metricLast === currentText || node.dataset.metricAnimating === "true") return;

    const normalized = currentText.replace(/,/g, "");
    const match = normalized.match(/-?\d+(\.\d+)?/);
    if (!match) {
      node.dataset.metricLast = currentText;
      return;
    }

    const target = Number(match[0]);
    const prefix = normalized.slice(0, match.index);
    const suffix = normalized.slice((match.index || 0) + match[0].length);
    const start = Number(node.dataset.metricValue || 0);
    const duration = 700;
    const startTime = performance.now();

    node.dataset.metricLast = currentText;
    node.dataset.metricValue = String(target);
    node.dataset.metricAnimating = "true";
    node.classList.remove("metric-pop");
    void node.offsetWidth;
    node.classList.add("metric-pop");

    const render = (value) => {
      const formatted = Number.isInteger(target) ? Math.round(value).toLocaleString() : value.toFixed(1);
      node.textContent = `${prefix}${formatted}${suffix}`;
    };

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      render(start + (target - start) * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        node.textContent = currentText;
        node.dataset.metricAnimating = "false";
      }
    };

    requestAnimationFrame(step);
  }

  function animateMetrics() {
    const selectors = [
      ".stat-card p:last-child",
      "#studentCount",
      "#trainerCount",
      "#courseCount",
      "#revenueCount",
      "#enrolledCount",
      "#averageProgress",
      "#completedCount",
      "#avgProgress",
      "#earnings",
      "#pendingTodoCount",
      "#highTodoCount",
      "#completedTodoCount",
      "#pendingTaskCount",
      "#completedTaskCount",
      "#settingsEnrollmentCount",
      "#settingsAverageProgress"
    ];

    document.querySelectorAll(selectors.join(",")).forEach(animateMetric);
  }

  function wrapSectionHero(section) {
    const firstChild = section.firstElementChild;
    if (!firstChild) return;

    let hero = null;
    if (firstChild.matches("div") && firstChild.querySelector("h1, h2, h3")) {
      hero = firstChild;
      hero.classList.add("premium-hero");
    } else if (firstChild.matches("h1, h2, h3")) {
      hero = document.createElement("div");
      hero.className = "premium-hero premium-hero-plain";
      section.insertBefore(hero, firstChild);
      hero.appendChild(firstChild);
    }

    if (!hero || hero.querySelector(".premium-pill")) return;

    const sectionName = section.dataset.section || "workspace";
    const pill = document.createElement("div");
    pill.className = "premium-pill";
    pill.textContent = `${sectionName.charAt(0).toUpperCase()}${sectionName.slice(1)} experience`;
    hero.prepend(pill);

    const meta = document.createElement("div");
    meta.className = "premium-hero-meta";
    meta.innerHTML = "<span></span><span></span><span></span>";
    hero.appendChild(meta);
  }

  function setupStickyScroll(main) {
    const topbar = document.querySelector("main nav");
    if (!main || !topbar) return;
    topbar.classList.add("dashboard-topbar");

    const onScroll = () => {
      topbar.classList.toggle("scrolled", main.scrollTop > 10);
    };

    main.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function setupMobileNav(sidebar, main) {
    if (!sidebar || !main || document.querySelector(".mobile-nav")) return;
    const navItems = Array.from(sidebar.querySelectorAll("[data-nav]"));
    if (!navItems.length) return;

    const mobileNav = document.createElement("div");
    mobileNav.className = "mobile-nav";
    const track = document.createElement("div");
    track.className = "mobile-nav-track";

    navItems.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mobile-nav-button";
      button.dataset.nav = item.dataset.nav;
      button.textContent = item.textContent.trim();
      button.addEventListener("click", () => {
        if (typeof window.showSection === "function") {
          window.showSection(item.dataset.nav);
        }
      });
      track.appendChild(button);
    });

    mobileNav.appendChild(track);
    const topbar = main.querySelector("nav");
    if (topbar) {
      topbar.insertAdjacentElement("afterend", mobileNav);
    } else {
      main.prepend(mobileNav);
    }
  }

  function syncActiveNav() {
    const activeNav = document.querySelector("[data-nav].active");
    const activeName = activeNav ? activeNav.dataset.nav : null;
    document.querySelectorAll(".mobile-nav-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.nav === activeName);
    });
  }

  function patchShowSection() {
    if (typeof window.showSection !== "function" || window.showSection.__premiumPatched) return;
    const original = window.showSection;
    const wrapped = function patchedShowSection(sectionName, event) {
      const result = original(sectionName, event);
      window.setTimeout(() => {
        syncActiveNav();
        setupRevealAnimations();
        upgradeLoadingAndEmptyStates(document.body);
        animateMetrics();
        const main = document.querySelector("main");
        if (main && event && window.innerWidth < 1024) {
          main.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 30);
      return result;
    };
    wrapped.__premiumPatched = true;
    window.showSection = wrapped;
  }

  function enhanceAuthPage() {
    document.body.classList.add("page-auth");
    const layout = document.body.querySelector(".flex.flex-col.lg\\:flex-row.min-h-screen");
    const brand = layout?.children?.[0];
    const formColumn = layout?.children?.[1];
    const card = formColumn?.querySelector(".max-w-md");
    const tabs = formColumn?.querySelector(".flex.gap-4.mb-8");

    if (layout) layout.classList.add("auth-layout");
    if (brand) brand.classList.add("auth-brand-panel");
    if (formColumn) formColumn.classList.add("auth-form-column");
    if (card) card.classList.add("auth-card");
    if (tabs) tabs.classList.add("tab-switcher");

    const brandText = brand?.querySelector(".relative.z-10.text-center.max-w-md");
    if (brandText && !brandText.querySelector(".auth-badge-row")) {
      const badgeRow = document.createElement("div");
      badgeRow.className = "auth-badge-row";
      badgeRow.innerHTML = "<span>Creative learning paths</span><span>Live dashboards</span><span>Kid-friendly polish</span>";
      brandText.appendChild(badgeRow);
    }
  }

  function enhanceDashboards() {
    document.body.classList.add("page-dashboard");
    const shell = document.body.querySelector(".flex.h-screen");
    const sidebar = document.querySelector("aside");
    const main = document.querySelector("main");
    const content = main?.querySelector(".p-6");

    if (shell) shell.classList.add("dashboard-shell");
    if (sidebar) sidebar.classList.add("dashboard-sidebar");
    if (main) main.classList.add("dashboard-main");
    if (content) content.classList.add("dashboard-content");

    document.querySelectorAll("section[data-section]").forEach(wrapSectionHero);
    setupMobileNav(sidebar, main);
    setupStickyScroll(main);
    patchShowSection();
    syncActiveNav();
  }

  function observeDynamicUpdates() {
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        setupRipples(document.body);
        setupTilt(document.body);
        setupRevealAnimations();
        upgradeLoadingAndEmptyStates(document.body);
        markProgressBars(document.body);
        animateMetrics();
        syncActiveNav();
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  onReady(() => {
    injectBackdrop();
    if (isAuthPage) enhanceAuthPage();
    if (isDashboardPage) enhanceDashboards();
    setupRipples(document.body);
    setupTilt(document.body);
    setupRevealAnimations();
    upgradeLoadingAndEmptyStates(document.body);
    markProgressBars(document.body);
    observeDynamicUpdates();
  });

  onWindowLoad(() => {
    animateMetrics();
    window.setTimeout(animateMetrics, 900);
    window.setTimeout(() => upgradeLoadingAndEmptyStates(document.body), 400);
    syncActiveNav();
  });
})();
