document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       COURSE DATA
    ========================================== */

    const courses = [

        {
            title: "English",
            level: "Language",
            category: "Language",
            categoryKey: "language",
            cover: "images/books/english.jpg",
            url: "#"
        },

        {
            title: "French",
            level: "Language",
            category: "Language",
            categoryKey: "language",
            cover: "images/books/french.jpg",
            url: "#"
        },

        {
            title: "Portuguese",
            level: "Language",
            category: "Language",
            categoryKey: "language",
            cover: "images/books/portuguese.jpg",
            url: "#"
        },

        {
            title: "Microsoft Word",
            level: "MS Office",
            category: "MS Office",
            categoryKey: "ms-office",
            cover: "images/books/ms-word.jpg",
            url: "#"
        },

        {
            title: "Microsoft Excel",
            level: "MS Office",
            category: "MS Office",
            categoryKey: "ms-office",
            cover: "images/books/ms-excel.jpg",
            url: "#"
        },

        {
            title: "Microsoft PowerPoint",
            level: "MS Office",
            category: "MS Office",
            categoryKey: "ms-office",
            cover: "images/books/ms-powerpoint.jpg",
            url: "#"
        },

        {
            title: "Trading Fundamentals",
            level: "Trading",
            category: "Trading",
            categoryKey: "trading",
            cover: "images/books/trading-fundamentals.jpg",
            url: "#"
        },

        {
            title: "Technical Analysis",
            level: "Trading",
            category: "Trading",
            categoryKey: "trading",
            cover: "images/books/technical-analysis.jpg",
            url: "#"
        },

        {
            title: "Business Fundamentals",
            level: "Business",
            category: "Business",
            categoryKey: "business",
            cover: "images/books/business-fundamentals.jpg",
            url: "#"
        },

        {
            title: "Entrepreneurship",
            level: "Business",
            category: "Business",
            categoryKey: "business",
            cover: "images/books/entrepreneurship.jpg",
            url: "#"
        },

        {
            title: "Web Development",
            level: "Technology",
            category: "Technology",
            categoryKey: "technology",
            cover: "images/books/web-development.jpg",
            url: "#"
        },

        {
            title: "Artificial Intelligence",
            level: "Technology",
            category: "Technology",
            categoryKey: "technology",
            cover: "images/books/artificial-intelligence.jpg",
            url: "#"
        },

        {
            title: "Personal Finance",
            level: "Finance",
            category: "Finance",
            categoryKey: "finance",
            cover: "images/books/personal-finance.jpg",
            url: "#"
        },

        {
            title: "Financial Literacy",
            level: "Finance",
            category: "Finance",
            categoryKey: "finance",
            cover: "images/books/financial-literacy.jpg",
            url: "#"
        },

        {
            title: "Communication Skills",
            level: "Personal Development",
            category: "Personal Development",
            categoryKey: "personal-development",
            cover: "images/books/communication.jpg",
            url: "#"
        },

        {
            title: "Time Management",
            level: "Personal Development",
            category: "Personal Development",
            categoryKey: "personal-development",
            cover: "images/books/time-management.jpg",
            url: "#"
        }

    ];


    /* =========================================
       ELEMENTS
    ========================================== */

    const sidebar =
        document.getElementById("sidebar");

    const menuButton =
        document.getElementById("menuButton");

    const backdrop =
        document.getElementById("sidebarBackdrop");

    const bookGrid =
        document.getElementById("bookGrid");

    const noResults =
        document.getElementById("noResults");

    const searchInput =
        document.getElementById("searchInput");

    const libraryTitle =
        document.getElementById("libraryTitle");

    const year =
        document.getElementById("year");

    const navigationButtons =
        document.querySelectorAll(
            ".navigation-button"
        );

    const filterButtons =
        document.querySelectorAll(
            ".filter-button"
        );


    /* =========================================
       STATE
    ========================================== */

    let activeFilter = "all";
    let searchTerm = "";


    /* =========================================
       YEAR
    ========================================== */

    if (year) {
        year.textContent =
            new Date().getFullYear();
    }


    /* =========================================
       TITLES
    ========================================== */

    const titles = {

        all: "All Areas",

        language: "Language",

        "ms-office": "MS Office",

        trading: "Trading",

        business: "Business",

        technology: "Technology",

        finance: "Finance",

        "personal-development":
            "Personal Development"

    };


    /* =========================================
       CREATE COURSE CARDS
    ========================================== */

    function createCourseCards() {

        if (!bookGrid) return;

        bookGrid.innerHTML = "";

        courses.forEach(course => {

            const card =
                document.createElement("article");

            card.className = "book-card";

            card.dataset.category =
                course.categoryKey;

            card.dataset.search = (
                course.title +
                " " +
                course.category +
                " " +
                course.level
            ).toLowerCase();


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

                                <span>
                                    EXPLORE
                                </span>

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

    }


    /* =========================================
       FILTER COURSES
    ========================================== */

    function filterCourses() {

        const cards =
            document.querySelectorAll(
                ".book-card"
            );

        let visibleCount = 0;


        cards.forEach(card => {

            const category =
                card.dataset.category;

            const text =
                card.dataset.search;


            const matchesCategory =
                activeFilter === "all" ||
                category === activeFilter;


            const matchesSearch =
                searchTerm === "" ||
                text.includes(searchTerm);


            const visible =
                matchesCategory &&
                matchesSearch;


            if (visible) {

                card.classList.remove("hide");

                visibleCount++;

                setTimeout(() => {
                    card.classList.add("show");
                }, 30);

            } else {

                card.classList.remove("show");
                card.classList.add("hide");

            }

        });


        if (noResults) {

            noResults.classList.toggle(
                "visible",
                visibleCount === 0
            );

        }

    }


    /* =========================================
       SET FILTER
    ========================================== */

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
                titles[filter] || "All Areas";

        }


        filterCourses();


        /* On mobile, close sidebar */

        if (window.innerWidth <= 768) {

            closeMobileSidebar();

        }

    }


    /* =========================================
       SIDEBAR NAVIGATION
    ========================================== */

    navigationButtons.forEach(button => {

        button.addEventListener("click", () => {

            const filter =
                button.dataset.filter;

            setFilter(filter);

        });

    });


    /* =========================================
       FILTER BUTTONS
    ========================================== */

    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            const filter =
                button.dataset.filter;

            setFilter(filter);

        });

    });


    /* =========================================
       SEARCH
    ========================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            event => {

                searchTerm =
                    event.target.value
                        .toLowerCase()
                        .trim();

                filterCourses();

            }
        );

    }


    /* =========================================
       SIDEBAR TOGGLE
    ========================================== */

    if (menuButton && sidebar) {

        menuButton.addEventListener(
            "click",
            () => {

                const mobile =
                    window.innerWidth <= 768;


                if (mobile) {

                    const opened =
                        sidebar.classList.toggle(
                            "mobile-open"
                        );

                    if (backdrop) {

                        backdrop.classList.toggle(
                            "active",
                            opened
                        );

                    }

                    menuButton.setAttribute(
                        "aria-expanded",
                        opened
                    );

                }

                else {

                    const collapsed =
                        sidebar.classList.toggle(
                            "collapsed"
                        );

                    menuButton.setAttribute(
                        "aria-expanded",
                        !collapsed
                    );

                }

            }
        );

    }


    /* =========================================
       CLOSE MOBILE SIDEBAR
    ========================================== */

    function closeMobileSidebar() {

        if (sidebar) {

            sidebar.classList.remove(
                "mobile-open"
            );

        }

        if (backdrop) {

            backdrop.classList.remove(
                "active"
            );

        }

        if (menuButton) {

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }


    /* =========================================
       BACKDROP
    ========================================== */

    if (backdrop) {

        backdrop.addEventListener(
            "click",
            closeMobileSidebar
        );

    }


    /* =========================================
       ESCAPE
    ========================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeMobileSidebar();

            }

        }
    );


    /* =========================================
       HANDLE SCREEN RESIZE
    ========================================== */

    window.addEventListener(
        "resize",
        () => {

            if (window.innerWidth > 768) {

                closeMobileSidebar();

            }

        }
    );


    /* =========================================
       INITIALIZE
    ========================================== */

    createCourseCards();

    setFilter("all");

});
