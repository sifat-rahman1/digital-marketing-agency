// Initialize Lucide Icons after DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) {
        lucide.createIcons();
    }
});

// Mobile Menu Toggle
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
const mobileLinks = document.querySelectorAll(".mobile-link");

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
        mobileMenu.classList.toggle("flex");
    });

    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            mobileMenu.classList.add("hidden");
            mobileMenu.classList.remove("flex");
        });
    });
}

// Animated Stat Counter on Scroll
const counters = document.querySelectorAll("[data-counter]");

if (counters.length > 0 && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const targetVal = parseFloat(el.getAttribute("data-counter"));
                const prefix = el.getAttribute("data-prefix") || "";
                const suffix = el.getAttribute("data-suffix") || "";
                const isFloat = targetVal % 1 !== 0;
                
                let startVal = 0;
                const duration = 1800; // 1.8s duration
                const startTime = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out quad formula
                    const easeProgress = progress * (2 - progress);
                    const currentVal = startVal + (targetVal - startVal) * easeProgress;

                    if (isFloat) {
                        el.textContent = `${prefix}${currentVal.toFixed(1)}${suffix}`;
                    } else {
                        el.textContent = `${prefix}${Math.floor(currentVal).toLocaleString()}${suffix}`;
                    }

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        if (isFloat) {
                            el.textContent = `${prefix}${targetVal.toFixed(1)}${suffix}`;
                        } else {
                            el.textContent = `${prefix}${targetVal.toLocaleString()}${suffix}`;
                        }
                    }
                }

                requestAnimationFrame(updateCounter);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.2 });

    counters.forEach(counter => counterObserver.observe(counter));
}

// Case Study View Tabs (Before/After Chart, Simulated Ad Creative, Live Audit)
const caseTabBtns = document.querySelectorAll(".case-tab-btn");

caseTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const parentWidget = btn.closest(".lg\\:col-span-5");
        if (!parentWidget) return;

        const siblingBtns = parentWidget.querySelectorAll(".case-tab-btn");
        siblingBtns.forEach(b => {
            b.classList.remove("active", "bg-white", "text-slate-900", "shadow-sm");
            b.classList.add("text-slate-600");
        });

        btn.classList.remove("text-slate-600");
        btn.classList.add("active", "bg-white", "text-slate-900", "shadow-sm");

        const targetTabId = btn.getAttribute("data-tab");
        const tabContents = parentWidget.querySelectorAll(".case-tab-content");

        tabContents.forEach(content => {
            if (content.id === targetTabId) {
                content.classList.remove("hidden");
            } else {
                content.classList.add("hidden");
            }
        });
    });
});

// Interactive "Estimate Your Growth Campaign" Widget Logic
const estBudgetSlider = document.getElementById("est-budget-slider");
const estBudgetVal = document.getElementById("est-budget-val");
const estMonthlyRev = document.getElementById("est-monthly-rev");
const estAnnualNet = document.getElementById("est-annual-net");
const estRoasRange = document.getElementById("est-roas-range");
const estCacReduction = document.getElementById("est-cac-reduction");
const deliverablesList = document.getElementById("deliverables-list");
const tierBadge = document.getElementById("tier-badge");
const channelChips = document.querySelectorAll(".channel-chip");

// Channel Chips Toggle
channelChips.forEach(chip => {
    chip.addEventListener("click", () => {
        chip.classList.toggle("active");
        chip.classList.toggle("text-slate-300");
        updateCampaignEstimate();
    });
});

if (estBudgetSlider) {
    estBudgetSlider.addEventListener("input", updateCampaignEstimate);
}

function updateCampaignEstimate() {
    if (!estBudgetSlider) return;

    const budget = parseInt(estBudgetSlider.value);
    estBudgetVal.textContent = `$${budget.toLocaleString()} / mo`;

    // Active channels count
    const activeChannels = document.querySelectorAll(".channel-chip.active");
    const channelCount = activeChannels.length || 1;

    // Calculate ROAS multiplier (Base 4.2x + boost for higher budget & channel synergy)
    let roasMultiplier = 4.2;
    if (budget >= 50000) roasMultiplier += 0.4;
    if (budget >= 100000) roasMultiplier += 0.4;
    if (channelCount >= 3) roasMultiplier += 0.3;

    const projectedMonthly = Math.round(budget * roasMultiplier);
    const netAnnualGrowth = Math.round((projectedMonthly - budget) * 12);
    const cacDrop = Math.min(48, 20 + Math.round(channelCount * 5) + (budget >= 50000 ? 10 : 0));

    estMonthlyRev.textContent = `$${projectedMonthly.toLocaleString()}`;
    estAnnualNet.textContent = `+$${netAnnualGrowth.toLocaleString()}`;
    estRoasRange.textContent = `${(roasMultiplier - 0.3).toFixed(1)}x - ${(roasMultiplier + 0.5).toFixed(1)}x`;
    estCacReduction.textContent = `-${cacDrop}%`;

    // Dynamic Deliverables & Tier Badge based on budget
    let deliverables = [];
    if (budget < 25000) {
        tierBadge.textContent = "Emerging Tier";
        deliverables = [
            "Dedicated Growth Strategist & Paid Media Manager",
            "Bi-weekly Ad Creative Assets & Motion Hooks",
            "Meta & Google Search Campaign Architecture",
            "Server-Side CAPI Tracking & Standard Dashboard"
        ];
    } else if (budget < 75000) {
        tierBadge.textContent = "Growth Tier";
        deliverables = [
            "Dedicated Growth Pod (Strategist, Media Buyer & Copywriter)",
            "Weekly Ad Creative Concepts & Motion Graphics",
            "Multichannel Meta, Google, & TikTok Bidding Systems",
            "Landing Page CRO Sprints & Server CAPI Attribution",
            "Bi-weekly Executive Strategy Calls & Real-time Slack"
        ];
    } else {
        tierBadge.textContent = "Enterprise Tier";
        deliverables = [
            "Full Embedded Growth Unit (VP Strategist, Creative Director, CRO Lead)",
            "Unlimited Weekly Ad Creative Sprints (UGC + Motion)",
            "Programmatic SEO Topical Cluster Infrastructure",
            "Custom Conversion Landing Page Engineering & A/B Testing",
            "Real-time Enterprise Attribution OS & 24/7 Slack Channel"
        ];
    }

    // Append active channel specific deliverables
    activeChannels.forEach(chip => {
        const channel = chip.getAttribute("data-channel");
        if (channel === "seo" && !deliverables.includes("Enterprise SEO Topical Authority Strategy")) {
            deliverables.push("Enterprise SEO Topical Authority Strategy");
        }
        if (channel === "cro" && !deliverables.includes("Conversion Landing Page CRO Optimization")) {
            deliverables.push("Conversion Landing Page CRO Optimization");
        }
    });

    if (deliverablesList) {
        deliverablesList.innerHTML = deliverables.map(item => `
            <li class="flex items-center gap-2">
                <i data-lucide="check" class="w-4 h-4 text-emerald-400"></i>
                <span>${item}</span>
            </li>
        `).join("");
        
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}

// Initial calculation on page load
updateCampaignEstimate();

// Category Filter for Case Studies
const filterBtns = document.querySelectorAll(".filter-btn");
const workCards = document.querySelectorAll(".work-card");

filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        filterBtns.forEach(b => {
            b.classList.remove("bg-white", "text-slate-900", "shadow-sm");
            b.classList.add("text-slate-600");
        });
        btn.classList.remove("text-slate-600");
        btn.classList.add("bg-white", "text-slate-900", "shadow-sm");

        const filter = btn.getAttribute("data-filter");

        workCards.forEach(card => {
            if (filter === "all" || card.getAttribute("data-category") === filter) {
                card.style.display = "grid";
            } else {
                card.style.display = "none";
            }
        });
    });
});

// Contact Form Handler
const contactForm = document.getElementById("contact-form");
const formSuccess = document.getElementById("form-success");

if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        contactForm.classList.add("hidden");
        formSuccess.classList.remove("hidden");
    });
}
