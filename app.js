// NEBULA — app.js
// Accessibility, UX, and interactivity layer.

document.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) lucide.createIcons();

    initLoader();
    initTheme();
    initMobileMenu();
    initCounters();
    initCaseTabs();
    initEstimator();
    initFilters();
    initFaq();
    initContactForm();
    initScrollSpy();
    initSmoothScrollPolyfill();
    initBackToTop();
});

/* ----------------------------------------------------------------
 * Page Loader overlay fade out
 * ---------------------------------------------------------------- */
function initLoader() {
    const loader = document.getElementById("page-loader");
    if (!loader) return;
    
    // Wait for page to fully load, then fade out (Fix #7)
    if (document.readyState === "complete") {
        setTimeout(() => {
            loader.classList.add("fade-out");
            loader.setAttribute("aria-hidden", "true");
        }, 300);
    } else {
        window.addEventListener("load", () => {
            setTimeout(() => {
                loader.classList.add("fade-out");
                loader.setAttribute("aria-hidden", "true");
            }, 300);
        });
    /* ----------------------------------------------------------------
 * Mobile menu toggle (with aria-expanded sync)
 * ---------------------------------------------------------------- */
function initMobileMenu() {
    const menuBtn = document.getElementById("menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    const mobileLinks = document.querySelectorAll(".mobile-link");

    if (!menuBtn || !mobileMenu) return;

    const setOpen = (open) => {
        if (open) {
            mobileMenu.classList.remove("hidden");
            mobileMenu.classList.add("flex");
        } else {
            mobileMenu.classList.add("hidden");
            mobileMenu.classList.remove("flex");
        }
        menuBtn.setAttribute("aria-expanded", String(open));
        document.body.style.overflow = open ? "hidden" : "";
    };

    menuBtn.addEventListener("click", () => {
        const isOpen = !mobileMenu.classList.contains("hidden");
        setOpen(isOpen ? false : true);
    });

    // Backdrop click to close (Fix #11)
    mobileMenu.addEventListener("click", (e) => {
        if (e.target === mobileMenu) setOpen(false);
    });

    mobileLinks.forEach((link) =>
        link.addEventListener("click", () => setOpen(false))
    );

    // Focus trap (Fix #2)
    const setupFocusTrap = () => {
        const focusable = [...mobileMenu.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])')];
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        
        mobileMenu.addEventListener("keydown", (e) => {
            if (e.key !== "Tab") return;
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });
    };

    // Watch for menu open to set up focus trap
    const observer = new MutationObserver(() => {
        if (!mobileMenu.classList.contains("hidden")) setupFocusTrap();
    });
    observer.observe(mobileMenu, { attributes: true, attributeFilter: ["class"] });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !mobileMenu.classList.contains("hidden")) {
            setOpen(false);
            menuBtn.focus();
        }
    });
}

/* ----------------------------------------------------------------
 * Animated stat counters (respects prefers-reduced-motion)
 * ---------------------------------------------------------------- */
function initCounters() {
    const counters = document.querySelectorAll("[data-counter]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (counters.length === 0) return;

    if (!("IntersectionObserver" in window) || reduceMotion) {
        counters.forEach((el) => {
            const v = parseFloat(el.getAttribute("data-counter"));
            const p = el.getAttribute("data-prefix") || "";
            const s = el.getAttribute("data-suffix") || "";
            el.textContent = `${p}${v % 1 !== 0 ? v.toFixed(1) : v.toLocaleString()}${s}`;
        });
        return;
    }

    const obs = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseFloat(el.getAttribute("data-counter"));
            const prefix = el.getAttribute("data-prefix") || "";
            const suffix = el.getAttribute("data-suffix") || "";
            const isFloat = target % 1 !== 0;
            const duration = 1800;
            const start = performance.now();

            const tick = (now) => {
                const progress = Math.min((now - start) / duration, 1);
                const ease = progress * (2 - progress);
                const val = target * ease;
                el.textContent = isFloat
                    ? `${prefix}${val.toFixed(1)}${suffix}`
                    : `${prefix}${Math.floor(val).toLocaleString()}${suffix}`;
                if (progress < 1) requestAnimationFrame(tick);
                else el.textContent = isFloat
                    ? `${prefix}${target.toFixed(1)}${suffix}`
                    : `${prefix}${target.toLocaleString()}${suffix}`;
            };
            requestAnimationFrame(tick);
            observer.unobserve(el);
        });
    }, { threshold: 0.2 });

    counters.forEach((c) => obs.observe(c));
}

/* ----------------------------------------------------------------
 * Case study tabs (ARIA-aware, keyboard navigable, lazy-loaded)
 * ---------------------------------------------------------------- */
function initCaseTabs() {
    const groups = document.querySelectorAll('[role="tablist"]');

    groups.forEach((list) => {
        const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
        const widget = list.parentElement;

        // Lazy-load: cache inactive panel content on first init
        const panels = widget.querySelectorAll('.case-tab-content');
        panels.forEach((panel) => {
            if (panel.classList.contains('hidden')) {
                panel.dataset.lazyHtml = panel.innerHTML;
                panel.innerHTML = '';
            }
        });

        const activate = (tab, setFocus = true) => {
            const panelId = tab.getAttribute("aria-controls");
            tabs.forEach((t) => {
                const selected = t === tab;
                t.setAttribute("aria-selected", String(selected));
                t.classList.toggle("active", selected);
                t.classList.toggle("bg-white", selected);
                t.classList.toggle("text-slate-900", selected);
                t.classList.toggle("shadow-sm", selected);
                t.classList.toggle("text-slate-600", !selected);
            });
            widget.querySelectorAll(".case-tab-content").forEach((panel) => {
                const isActive = panel.id === panelId;
                panel.classList.toggle("hidden", !isActive);
                if (isActive && !panel.innerHTML.trim() && panel.dataset.lazyHtml) {
                    panel.innerHTML = panel.dataset.lazyHtml;
                    if (window.lucide) lucide.createIcons();
                }
            });
            if (setFocus) tab.focus();
        };

        tabs.forEach((tab, i) => {
            tab.addEventListener("click", () => activate(tab, false));
            tab.addEventListener("keydown", (e) => {
                let next = null;
                if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
                else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
                else if (e.key === "Home") next = tabs[0];
                else if (e.key === "End") next = tabs[tabs.length - 1];
                if (next) {
                    e.preventDefault();
                    activate(next);
                }
            });
        });
    });
}

/* ----------------------------------------------------------------
 * Interactive Growth Estimator + budget pre-fill bridge
 * ---------------------------------------------------------------- */
function initEstimator() {
    const slider = document.getElementById("est-budget-slider");
    const budgetVal = document.getElementById("est-budget-val");
    const monthlyRev = document.getElementById("est-monthly-rev");
    const annualNet = document.getElementById("est-annual-net");
    const roasRange = document.getElementById("est-roas-range");
    const cacReduction = document.getElementById("est-cac-reduction");
    const deliverablesList = document.getElementById("deliverables-list");
    const tierBadge = document.getElementById("tier-badge");
    const chips = document.querySelectorAll(".channel-chip");
    const contactBudget = document.getElementById("cf-budget");

    if (!slider) return;

    const STORAGE_KEY = "nebula_est_budget";

    const tierFor = (b) =>
        b < 25000 ? "10000-25000" : b < 75000 ? "25000-50000" : "50000-100000";

    const persistAndSync = (budget) => {
        try { localStorage.setItem(STORAGE_KEY, String(budget)); } catch (e) {}
        if (contactBudget) contactBudget.value = tierFor(budget);
    };

    const update = () => {
        const budget = parseInt(slider.value, 10);
        budgetVal.textContent = `$${budget.toLocaleString()} / mo`;

        const activeChannels = document.querySelectorAll(".channel-chip[aria-checked='true']");
        const channelCount = activeChannels.length || 1;

        let roas = 4.2;
        if (budget >= 50000) roas += 0.4;
        if (budget >= 100000) roas += 0.4;
        if (channelCount >= 3) roas += 0.3;

        const projectedMonthly = Math.round(budget * roas);
        const netAnnual = Math.round((projectedMonthly - budget) * 12);
        const cacDrop = Math.min(48, 20 + Math.round(channelCount * 5) + (budget >= 50000 ? 10 : 0));

        monthlyRev.textContent = `$${projectedMonthly.toLocaleString()}`;
        annualNet.textContent = `+$${netAnnual.toLocaleString()}`;
        roasRange.textContent = `${(roas - 0.3).toFixed(1)}x - ${(roas + 0.5).toFixed(1)}x`;
        cacReduction.textContent = `-${cacDrop}%`;

        let deliverables = [];
        if (budget < 25000) {
            tierBadge.textContent = "Emerging Tier";
            deliverables = [
                "Dedicated Growth Strategist & Paid Media Manager",
                "Bi-weekly Ad Creative Assets & Motion Hooks",
                "Meta & Google Search Campaign Architecture",
                "Server-Side CAPI Tracking & Standard Dashboard",
            ];
        } else if (budget < 75000) {
            tierBadge.textContent = "Growth Tier";
            deliverables = [
                "Dedicated Growth Pod (Strategist, Media Buyer & Copywriter)",
                "Weekly Ad Creative Concepts & Motion Graphics",
                "Multichannel Meta, Google, & TikTok Bidding Systems",
                "Landing Page CRO Sprints & Server CAPI Attribution",
                "Bi-weekly Executive Strategy Calls & Real-time Slack",
            ];
        } else {
            tierBadge.textContent = "Enterprise Tier";
            deliverables = [
                "Full Embedded Growth Unit (VP Strategist, Creative Director, CRO Lead)",
                "Unlimited Weekly Ad Creative Sprints (UGC + Motion)",
                "Programmatic SEO Topical Cluster Infrastructure",
                "Custom Conversion Landing Page Engineering & A/B Testing",
                "Real-time Enterprise Attribution OS & 24/7 Slack Channel",
            ];
        }

        activeChannels.forEach((chip) => {
            const ch = chip.getAttribute("data-channel");
            if (ch === "seo" && !deliverables.includes("Enterprise SEO Topical Authority Strategy"))
                deliverables.push("Enterprise SEO Topical Authority Strategy");
            if (ch === "cro" && !deliverables.includes("Conversion Landing Page CRO Optimization"))
                deliverables.push("Conversion Landing Page CRO Optimization");
        });

        if (deliverablesList) {
            deliverablesList.innerHTML = deliverables
                .map(
                    (item) => `<li class="flex items-center gap-2">
                        <i data-lucide="check" class="w-4 h-4 text-emerald-400" aria-hidden="true"></i>
                        <span>${item}</span>
                    </li>`
                )
                .join("");
            if (window.lucide) lucide.createIcons();
        }

        persistAndSync(budget);

        // Persist active channels to localStorage (Fix #8)
        const savedChannelStates = Array.from(chips)
            .filter(c => c.getAttribute("aria-checked") === "true")
            .map(c => c.dataset.channel);
        try { localStorage.setItem("nebula_est_channels", JSON.stringify(savedChannelStates)); } catch (e) {}

    chips.forEach((chip) => {
        chip.addEventListener("click", () => {
            const active = chip.getAttribute("aria-checked") === "true";
            chip.setAttribute("aria-checked", String(!active));
            chip.classList.toggle("active", !active);
            update();
        });
    });

    slider.addEventListener("input", update);

    // Restore previously selected budget from the estimator.
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const v = parseInt(saved, 10);
            if (v >= parseInt(slider.min, 10) && v <= parseInt(slider.max, 10)) {
                slider.value = v;
            }
        }
    } catch (e) {}

    // Restore active channel selections (Fix #8)
    try {
        const savedChannels = localStorage.getItem("nebula_est_channels");
        if (savedChannels) {
            const channels = JSON.parse(savedChannels);
            chips.forEach(chip => {
                const ch = chip.dataset.channel;
                if (channels.includes(ch)) {
                    chip.setAttribute("aria-checked", "true");
                    chip.classList.add("active");
                } else {
                    chip.setAttribute("aria-checked", "false");
                    chip.classList.remove("active");
                }
            });
        }
    } catch (e) {}

    update();

    // If the contact form loads with a pre-selected tier, reflect it on the slider.
    if (contactBudget) {
        const setFromContact = () => {
            const val = parseInt(contactBudget.value, 10);
            if (val) {
                slider.value = Math.min(
                    parseInt(slider.max, 10),
                    Math.max(parseInt(slider.min, 10), val)
                );
                update();
            }
        };
        contactBudget.addEventListener("change", setFromContact);
    }
}

/* ----------------------------------------------------------------
 * Case study category filter (active state + aria-pressed)
 * ---------------------------------------------------------------- */
function initFilters() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const workCards = document.querySelectorAll(".work-card");

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterBtns.forEach((b) => {
                const selected = b === btn;
                b.classList.toggle("bg-white", selected);
                b.classList.toggle("text-slate-900", selected);
                b.classList.toggle("shadow-sm", selected);
                b.classList.toggle("text-slate-600", !selected);
                b.setAttribute("aria-pressed", String(selected));
            });

            const filter = btn.getAttribute("data-filter");
            workCards.forEach((card) => {
                const show = filter === "all" || card.getAttribute("data-category") === filter;
                card.style.display = show ? "grid" : "none";
            });
        });
    });
}

/* ----------------------------------------------------------------
 * FAQ accordion
 * ---------------------------------------------------------------- */
function initFaq() {
    const toggles = document.querySelectorAll(".faq-toggle");
    toggles.forEach((btn) => {
        btn.addEventListener("click", () => {
            const expanded = btn.getAttribute("aria-expanded") === "true";
            const panel = document.getElementById(btn.getAttribute("aria-controls"));
            const icon = btn.querySelector(".faq-icon");
            btn.setAttribute("aria-expanded", String(!expanded));
            if (panel) panel.classList.toggle("hidden", expanded);
            if (icon) icon.style.transform = expanded ? "" : "rotate(180deg)";
        });
    });
}

/* ----------------------------------------------------------------
 * Contact form: inline validation + honeypot + AJAX submission to Formspree
 * ---------------------------------------------------------------- */
function initContactForm() {
    const form = document.getElementById("contact-form");
    const success = document.getElementById("form-success");
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnTexts = submitBtn.querySelectorAll('.btn-text');
    if (!form) return;

    const formLoader = document.getElementById("form-loader");
    const honeypot = document.getElementById("b_honeypot");
    const fields = {
        name: document.getElementById("cf-name"),
        email: document.getElementById("cf-email"),
        message: document.getElementById("cf-message"),
    };
    const errors = {
        name: document.getElementById("cf-name-error"),
        email: document.getElementById("cf-email-error"),
        message: document.getElementById("cf-message-error"),
    };

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const validateField = (key) => {
        const el = fields[key];
        const err = errors[key];
        let msg = "";
        if (key === "name" && !el.value.trim()) msg = "Please enter your name.";
        if (key === "email") {
            if (!el.value.trim()) msg = "Please enter your work email.";
            else if (!emailRe.test(el.value.trim())) msg = "Please enter a valid email address.";
        }
        if (key === "message" && !el.value.trim()) msg = "Please enter your message.";
        if (msg) {
            err.textContent = msg;
            err.classList.remove("hidden");
            el.setAttribute("aria-invalid", "true");
            return false;
        }
        err.textContent = "";
        err.classList.add("hidden");
        el.removeAttribute("aria-invalid");
        return true;
    };

    Object.keys(fields).forEach((key) => {
        fields[key].addEventListener("blur", () => validateField(key));
        fields[key].addEventListener("input", () => {
            if (fields[key].getAttribute("aria-invalid") === "true") validateField(key);
        });
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Honeypot: silently reject bot submissions.
        if (honeypot && honeypot.value.trim() !== "") return;

        const results = [validateField("name"), validateField("email"), validateField("message")];
        if (results.includes(false)) {
            const firstInvalid = Object.values(fields).find(
                (el) => el.getAttribute("aria-invalid") === "true"
            );
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        const formData = new FormData(form);

        // UI: show sending state & activate loader overlay
        submitBtn.disabled = true;
        const originalText = btnTexts[0]?.textContent || "Submit";
        btnTexts.forEach(span => span.textContent = "Sending...");
        if (formLoader) {
            formLoader.classList.add("active");
            formLoader.removeAttribute("aria-hidden");
        }

        // Exact Formspree AJAX fetch structure
        fetch("https://formspree.io/f/mljrvlnj", {
            method: "POST",
            body: formData,
            headers: { "Accept": "application/json" }
        }).then(response => {
            if (response.ok) {
                form.reset();
                form.classList.add("hidden");
                if (success) {
                    success.textContent = "Thank you! Strategy session request received.";
                    success.className = "text-emerald-400 mt-4 text-sm text-center";
                    success.classList.remove("hidden");
                }
            } else {
                response.json().then(data => {
                    if (Object.hasOwn(data, "errors")) {
                        success.textContent = data.errors.map(err => err.message).join(", ");
                    } else {
                        success.textContent = "Oops! There was a problem submitting your form.";
                    }
                    success.className = "text-red-400 mt-4 text-sm text-center";
                    success.classList.remove("hidden");
                });
            }
        }).catch(() => {
            success.textContent = "Oops! Network error. Please try again.";
            success.className = "text-red-400 mt-4 text-sm text-center";
            success.classList.remove("hidden");
        }).finally(() => {
            submitBtn.disabled = false;
            btnTexts.forEach(span => span.textContent = originalText);
            if (formLoader) {
                formLoader.classList.remove("active");
                formLoader.setAttribute("aria-hidden", "true");
            }
        });
    });
}

/* ----------------------------------------------------------------
 * Scroll-spy: highlight active nav link (Fix #10 - extended to all sections)
 * ---------------------------------------------------------------- */
function initScrollSpy() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    // Include all sections, not just nav-linked ones (Fix #10)
    const allSections = Array.from(document.querySelectorAll('section[id]'));
    const ids = Array.from(navLinks)
        .map((a) => a.getAttribute("href").slice(1))
        .filter(Boolean);
    
    // Combine nav-linked IDs with all section IDs for comprehensive spy
    const allIds = [...new Set([...ids, ...allSections.map(s => s.id)])];
    const sections = allIds
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    if (sections.length === 0 || !("IntersectionObserver" in window)) return;

    const linkFor = (id) =>
        document.querySelector(`nav a[href="#${id}"]`);

    const obs = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navLinks.forEach((l) =>
                    l.classList.remove("text-indigo-600", "font-bold")
                );
                const link = linkFor(entry.target.id);
                if (link) link.classList.add("text-indigo-600", "font-bold");
            });
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((s) => obs.observe(s));
}

/* ----------------------------------------------------------------
 * Smooth-scroll polyfill for Safari < 15.4
 * ---------------------------------------------------------------- */
function initSmoothScrollPolyfill() {
    const supportsSmooth = window.CSS && CSS.supports("scroll-behavior", "smooth");
    if (supportsSmooth) return;

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (e) => {
            const id = link.getAttribute("href").slice(1);
            if (!id) return;
            const target = document.getElementById(id);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top, behavior: "smooth" });
        });
    });
}

/* ----------------------------------------------------------------
 * Theme switcher: animated checkbox toggle switch with system preference sync
 * ---------------------------------------------------------------- */
function initTheme() {
    const html = document.documentElement;
    const toggleCheckbox = document.getElementById("theme-toggle");
    const toggleCheckboxMobile = document.getElementById("theme-toggle-mobile");
    const THEME_KEY = "theme";
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    // Read current theme set by head script
    let currentTheme = html.getAttribute("data-theme") || "light";

    // Update checkboxes state (checked = dark mode)
    const syncUI = (theme) => {
        const isDark = theme === "dark";
        if (toggleCheckbox) toggleCheckbox.checked = isDark;
        if (toggleCheckboxMobile) toggleCheckboxMobile.checked = isDark;
    };

    // Apply theme to document
    const applyTheme = (theme) => {
        html.setAttribute("data-theme", theme);
        try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
        syncUI(theme);
    };

    // Toggle handler driven by checkbox state change
    const handleToggle = (e) => {
        const targetTheme = e.target.checked ? "dark" : "light";
        currentTheme = targetTheme;
        applyTheme(targetTheme);
    };

    // Initialize UI to match current theme
    syncUI(currentTheme);

    // Change event handlers for both desktop & mobile inputs
    if (toggleCheckbox) toggleCheckbox.addEventListener("change", handleToggle);
    if (toggleCheckboxMobile) toggleCheckboxMobile.addEventListener("change", handleToggle);

    // System preference change listener
    mediaQuery.addEventListener("change", (e) => {
        try {
            const hasExplicit = localStorage.getItem(THEME_KEY) !== null;
            if (!hasExplicit) {
                currentTheme = e.matches ? "dark" : "light";
                applyTheme(currentTheme);
            }
        } catch (err) {
            // ignore
        }
    });
}

/* ----------------------------------------------------------------
 * Back to Top Button (Fix #16)
 * ---------------------------------------------------------------- */
function initBackToTop() {
    const btn = document.getElementById("backToTopBtn");
    if (!btn) return;

    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            btn.classList.add("visible");
        } else {
            btn.classList.remove("visible");
        }
    };

    // Throttled scroll listener for performance
    let ticking = false;
    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                toggleVisibility();
                ticking = false;
            });
            ticking = true;
        }
    });

    btn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    // Initialize visibility on load
    toggleVisibility();
}
