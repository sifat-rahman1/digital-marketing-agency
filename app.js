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

// Interactive Growth Simulator / ROI Calculator
const spendSlider = document.getElementById("spend-slider");
const spendVal = document.getElementById("spend-val");
const projectedRev = document.getElementById("projected-rev");
const projectedAnnual = document.getElementById("projected-annual");

if (spendSlider) {
    spendSlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value);
        spendVal.textContent = `$${val.toLocaleString()}`;

        // 4.5x blended ROAS benchmark return model
        const monthlyRev = Math.round(val * 4.5);
        const annualGrowth = Math.round((monthlyRev - val) * 12);

        projectedRev.textContent = `$${monthlyRev.toLocaleString()}`;
        projectedAnnual.textContent = `+$${annualGrowth.toLocaleString()}`;
    });
}

// Case Studies Category Filter
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
