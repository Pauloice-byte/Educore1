/* ==========================================================
   EDUCORE
   MAIN JAVASCRIPT
========================================================== */

const courses = [

    /* LANGUAGE */

    {
        title: "English A1",
        level: "Beginner",
        category: "Language",
        categoryKey: "language",
        cover: "images/books/english-a1.jpg",
        url: "https://hwa1.vercel.app"
    },

    {
        title: "English A2",
        level: "Elementary",
        category: "Language",
        categoryKey: "language",
        cover: "images/books/english-a2.jpg",
        url: "https://hwa2.vercel.app"
    },

    {
        title: "English B1",
        level: "Pre-Intermediate",
        category: "Language",
        categoryKey: "language",
        cover: "images/books/english-b1.jpg",
        url: "https://YOUR-ENGLISH-B1-SITE.vercel.app"
    },

    {
        title: "English B2",
        level: "Intermediate",
        category: "Language",
        categoryKey: "language",
        cover: "images/books/english-b1plus.jpg",
        url: "https://test1965.vercel.app"
    },

    {
        title: "French A1",
        level: "Beginner",
        category: "Language",
        categoryKey: "language",
        cover: "images/books/french-a1.jpg",
        url: "https://YOUR-FRENCH-A1-SITE.vercel.app"
    },

    {
        title: "French A2",
        level: "Elementary",
        category: "Language",
        categoryKey: "language",
        cover: "images/books/french-a2.jpg",
        url: "https://YOUR-FRENCH-A2-SITE.vercel.app"
    },

    {
        title: "Portuguese A1",
        level: "Beginner",
        category: "Language",
        categoryKey: "language",
        cover: "images/books/portuguese-a1.jpg",
        url: "https://YOUR-PORTUGUESE-A1-SITE.vercel.app"
    },

    {
        title: "Spanish A1",
        level: "Beginner",
        category: "Language",
        categoryKey: "language",
        cover: "images/books/spanish-a1.jpg",
        url: "https://YOUR-SPANISH-A1-SITE.vercel.app"
    },


    /* MS OFFICE */

    {
        title: "Microsoft Word",
        level: "Beginner",
        category: "MS Office",
        categoryKey: "ms-office",
        cover: "images/books/ms-word.jpg",
        url: "https://YOUR-WORD-COURSE.vercel.app"
    },

    {
        title: "Microsoft Excel",
        level: "Beginner",
        category: "MS Office",
        categoryKey: "ms-office",
        cover: "images/books/ms-excel.jpg",
        url: "https://YOUR-EXCEL-COURSE.vercel.app"
    },

    {
        title: "Microsoft Excel Advanced",
        level: "Advanced",
        category: "MS Office",
        categoryKey: "ms-office",
        cover: "images/books/ms-excel-advanced.jpg",
        url: "https://YOUR-EXCEL-ADVANCED-COURSE.vercel.app"
    },

    {
        title: "Microsoft PowerPoint",
        level: "Beginner",
        category: "MS Office",
        categoryKey: "ms-office",
        cover: "images/books/ms-powerpoint.jpg",
        url: "https://YOUR-POWERPOINT-COURSE.vercel.app"
    },


    /* TRADING */

    {
        title: "Trading Fundamentals",
        level: "Beginner",
        category: "Trading",
        categoryKey: "trading",
        cover: "images/books/trading-fundamentals.jpg",
        url: "https://YOUR-TRADING-FUNDAMENTALS.vercel.app"
    },

    {
        title: "Technical Analysis",
        level: "Intermediate",
        category: "Trading",
        categoryKey: "trading",
        cover: "images/books/technical-analysis.jpg",
        url: "https://YOUR-TECHNICAL-ANALYSIS.vercel.app"
    },

    {
        title: "Risk Management",
        level: "Intermediate",
        category: "Trading",
        categoryKey: "trading",
        cover: "images/books/risk-management.jpg",
        url: "https://YOUR-RISK-MANAGEMENT.vercel.app"
    },


    /* BUSINESS */

    {
        title: "Business Fundamentals",
        level: "Beginner",
        category: "Business",
        categoryKey: "business",
        cover: "images/books/business-fundamentals.jpg",
        url: "https://YOUR-BUSINESS-COURSE.vercel.app"
    },

    {
        title: "Entrepreneurship",
        level: "Beginner",
        category: "Business",
        categoryKey: "business",
        cover: "images/books/entrepreneurship.jpg",
        url: "https://YOUR-ENTREPRENEURSHIP-COURSE.vercel.app"
    },


    /* TECHNOLOGY */

    {
        title: "Computer Fundamentals",
        level: "Beginner",
        category: "Technology",
        categoryKey: "technology",
        cover: "images/books/computer-fundamentals.jpg",
        url: "https://YOUR-COMPUTER-COURSE.vercel.app"
    },

    {
        title: "Web Development",
        level: "Beginner",
        category: "Technology",
        categoryKey: "technology",
        cover: "images/books/web-development.jpg",
        url: "https://YOUR-WEB-DEVELOPMENT-COURSE.vercel.app"
    },

    {
        title: "Artificial Intelligence",
        level: "Beginner",
        category: "Technology",
        categoryKey: "technology",
        cover: "images/books/artificial-intelligence.jpg",
        url: "https://YOUR-AI-COURSE.vercel.app"
    },


    /* FINANCE */

    {
        title: "Personal Finance",
        level: "Beginner",
        category: "Finance",
        categoryKey: "finance",
        cover: "images/books/personal-finance.jpg",
        url: "https://YOUR-PERSONAL-FINANCE-COURSE.vercel.app"
    },

    {
        title: "Financial Literacy",
        level: "Beginner",
        category: "Finance",
        categoryKey: "finance",
        cover: "images/books/financial-literacy.jpg",
        url: "https://YOUR-FINANCIAL-LITERACY-COURSE.vercel.app"
    },


    /* PERSONAL DEVELOPMENT */

    {
        title: "Communication Skills",
        level: "Beginner",
        category: "Personal Development",
        categoryKey: "personal-development",
        cover: "images/books/communication.jpg",
        url: "https://YOUR-COMMUNICATION-COURSE.vercel.app"
    },

    {
        title: "Time Management",
        level: "Beginner",
        category: "Personal Development",
        categoryKey: "personal-development",
        cover: "images/books/time-management.jpg",
        url: "https://YOUR-TIME-MANAGEMENT-COURSE.vercel.app"
    }

];


/* ==========================================================
   WAIT FOR PAGE
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const sidebar = document.getElementById("sidebar");
    const menuButton = document.getElementById("menuButton");
    const backdrop = document.getElementById("sidebarBackdrop");

    const bookGrid = document.getElementById("bookGrid");
    const noResults = document.getElementById("noResults");
    const searchInput = document.getElementById("searchInput");
    const libraryTitle = document.getElementById("libraryTitle");
    const year = document.getElementById("year");

    const navigationButtons =
        document.querySelectorAll(".navigation-button");

    const filterButtons =
        document.querySelectorAll(".filter-button");


    let activeFilter = "all";
    let searchTerm = "";


    /* ======================================================
       YEAR
    ====================================================== */

    if (year) {
        year.textContent = new Date().getFullYear();
    }


    /* ======================================================
       SIDEBAR
    ====================================================== */

    if (menuButton && sidebar) {

        menuButton.addEventListener("click", () => {

            if (window.innerWidth <= 768) {

                const isOpen =
                    sidebar.classList.toggle("mobile-open");

                if (backdrop) {
                    backdrop.classList.toggle(
                        "active",
                        isOpen
                    );
                }

                menuButton.setAttribute(
                    "aria-expanded",
                    isOpen
                );

            } else {

                sidebar.classList.toggle("collapsed");

                const isCollapsed =
                    sidebar.classList.contains("collapsed");

                menuButton.setAttribute(
                    "aria-expanded",
                    !isCollapsed
                );

            }

        });

    }


    /* ======================================================
       CLOSE MOBILE SIDEBAR
    ====================================================== */

    function closeMobileSidebar() {

        if (sidebar) {
            sidebar.classList.remove("mobile-open");
        }

        if (backdrop) {
            backdrop.classList.remove("active");
        }

        if (menuButton) {
            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );
        }

    }


    if (backdrop) {
        backdrop.addEventListener(
            "click",
            closeMobileSidebar
        );
    }


    /* ======================================================
       ESCAPE KEY
    ====================================================== */

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") {
            closeMobileSidebar();
        }

    });


    /* ======================================================
       COURSE CARDS
    ====================================================== */

    function createCourseCards() {

        if (!bookGrid) return;

        bookGrid.innerHTML = "";

        courses.forEach(course => {

            const card = document.createElement("article");

            card.className = "book-card";

            card.dataset.category =
                course.categoryKey;

            card.dataset.search =
                `${course.title} ${course.level} ${course.category}`
                .toLowerCase();

            card.innerHTML = `
                <a
                    href="${course.url}"
                    class="book-card-link"
                    aria-label="Open ${course.title}"
                >

                    <div class="book-cover-wrapper">

                        <img
                            src="${course.cover}"
                            alt="${course.title}"
                            class="book-cover"
                            loading="lazy"
                        >

                        <div class="book-hover">

                            <div class="open-button">

                                <span>OPEN COURSE</span>

                                <span class="open-arrow">
                                    →
                                </span>

                            </div>

                        </div>

                    </div>

                    <div class="book-information">

                        <div class="book-language">
                            ${course.category.toUpperCase()}
                        </div>

                        <div class="book-title">
                            ${course.title}
                        </div>

                        <div class="book-level">
                            ${course.level}
                        </div>

                    </div>

                </a>
            `;

            bookGrid.appendChild(card);

        });

        filterBooks();

    }


    /* ======================================================
       FILTER COURSES
    ====================================================== */

    function filterBooks() {

        if (!bookGrid) return;

        const cards =
            bookGrid.querySelectorAll(".book-card");

        let visibleCount = 0;

        cards.forEach(card => {

            const category =
                card.dataset.category;

            const text =
                card.dataset.search;

            const categoryMatch =
                activeFilter === "all" ||
                category === activeFilter;

            const searchMatch =
                !searchTerm ||
                text.includes(searchTerm);

            const visible =
                categoryMatch && searchMatch;

            card.classList.toggle(
                "hide",
                !visible
            );

            if (visible) {
                visibleCount++;

                requestAnimationFrame(() => {
                    card.classList.add("show");
                });
            } else {
                card.classList.remove("show");
            }

        });


        if (noResults) {

            noResults.classList.toggle(
                "visible",
                visibleCount === 0
            );

        }

    }


    /* ======================================================
       TITLES
    ====================================================== */

    const titles = {

        all: "All Courses",
        language: "Language",
        "ms-office": "MS Office",
        trading: "Trading",
        business: "Business",
        technology: "Technology",
        finance: "Finance",
        "personal-development": "Personal Development"

    };


    /* ======================================================
       SET FILTER
    ====================================================== */

    function setFilter(filter) {

        activeFilter = filter;

        navigationButtons.forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.filter === filter
            );

        });

        filterButtons.forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.filter === filter
            );

        });

        if (libraryTitle) {

            libraryTitle.textContent =
                titles[filter] || "All Courses";

        }

        filterBooks();


        /* Close mobile sidebar */

        if (window.innerWidth <= 768) {
            closeMobileSidebar();
        }

    }


    /* ======================================================
       SIDEBAR NAVIGATION
    ====================================================== */

    navigationButtons.forEach(button => {

        button.addEventListener("click", () => {

            const filter =
                button.dataset.filter;

            /*
             * The three learning-mode buttons do not
             * currently have courses assigned to them.
             * Therefore they are ignored rather than
             * making the entire library disappear.
             */

            if (
                filter === "autonomous" ||
                filter === "blended" ||
                filter === "guided"
            ) {
                return;
            }

            setFilter(filter);

        });

    });


    /* ======================================================
       FILTER BUTTONS
    ====================================================== */

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            setFilter(
                button.dataset.filter
            );

        });

    });


    /* ======================================================
       SEARCH
    ====================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            event => {

                searchTerm =
                    event.target.value
                        .toLowerCase()
                        .trim();

                filterBooks();

            }
        );

    }


    /* ======================================================
       START
    ====================================================== */

    createCourseCards();

});
