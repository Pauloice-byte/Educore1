/* ==========================================================
   EDUCORE
   COURSE DATABASE
========================================================== */

const courses = [

    // LANGUAGE
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

    // MS OFFICE
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

    // TRADING
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

    // BUSINESS
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

    // TECHNOLOGY
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

    // FINANCE
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

    // PERSONAL DEVELOPMENT
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
   START
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


    if (year) {
        year.textContent = new Date().getFullYear();
    }


    let activeFilter = "all";
    let searchTerm = "";


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
       CREATE COURSE CARDS
    ====================================================== */

    function createCourseCards() {

        if (!bookGrid) return;

        bookGrid.innerHTML = "";

        courses.forEach(course => {

            const article = document.createElement("article");

            article.className = "book-card";

            article.dataset.category = course.categoryKey;

            article.dataset.search = (
                course.title +
                " " +
                course.level +
                " " +
                course.category
            ).toLowerCase();


            article.innerHTML = `
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
                                <span class="open-arrow">→</span>
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

            bookGrid.appendChild(article);
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

            const searchableText =
                card.dataset.search;


            const matchesFilter =
                activeFilter === "all" ||
                category === activeFilter;


            const matchesSearch =
                searchTerm === "" ||
                searchableText.includes(searchTerm);


            const visible =
                matchesFilter && matchesSearch;


            card.classList.toggle("hide", !visible);
            card.classList.toggle("show", visible);


            if (visible) {
                visibleCount++;
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
    }


    /* ======================================================
       SIDEBAR
    ====================================================== */

    function openMobileSidebar() {

        if (!sidebar) return;

        sidebar.classList.add("mobile-open");

        if (backdrop) {
            backdrop.classList.add("active");
        }
    }


    function closeMobileSidebar() {

        if (!sidebar) return;

        sidebar.classList.remove("mobile-open");

        if (backdrop) {
            backdrop.classList.remove("active");
        }
    }


    function toggleSidebar() {

        if (!sidebar) return;


        if (window.innerWidth <= 768) {

            if (sidebar.classList.contains("mobile-open")) {
                closeMobileSidebar();
            } else {
                openMobileSidebar();
            }

            return;
        }


        /* Desktop */

        sidebar.classList.toggle("collapsed");

        document.body.classList.toggle(
            "sidebar-collapsed",
            sidebar.classList.contains("collapsed")
        );
    }


    if (menuButton) {
        menuButton.addEventListener(
            "click",
            toggleSidebar
        );
    }


    if (backdrop) {
        backdrop.addEventListener(
            "click",
            closeMobileSidebar
        );
    }


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeMobileSidebar();
            }

        }
    );


    /* ======================================================
       SIDEBAR NAVIGATION
    ====================================================== */

    navigationButtons.forEach(button => {

        button.addEventListener("click", () => {

            setFilter(button.dataset.filter);

            if (window.innerWidth <= 768) {
                closeMobileSidebar();
            }

        });

    });


    /* ======================================================
       FILTER BUTTONS
    ====================================================== */

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            setFilter(button.dataset.filter);

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
       HANDLE RESIZE
    ====================================================== */

    window.addEventListener("resize", () => {

        if (window.innerWidth > 768) {
            closeMobileSidebar();
        }

    });


    /* ======================================================
       INITIALIZE
    ====================================================== */

    createCourseCards();

    setFilter("all");

});
