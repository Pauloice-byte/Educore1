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
            cover: "images/english.jpg",
            url: "#",
            description:
                "Build practical English skills through structured lessons designed for independent learning. Develop your vocabulary, grammar, listening, speaking and communication skills step by step.",
            time: "25 minutes",
            learning:
                "Vocabulary, grammar, listening, speaking, pronunciation, reading and practical communication.",
            structure:
                "Short structured lessons, practice activities, repeated practice and immediate feedback."
        },


        {
            title: "French",
            level: "Language",
            category: "Language",
            categoryKey: "language",
            cover: "images/french.jpg",
            url: "#",
            description:
                "Develop useful French communication skills through structured autonomous lessons. Learn progressively while practising vocabulary, grammar, pronunciation and real-world communication.",
            time: "25 minutes",
            learning:
                "Vocabulary, grammar, pronunciation, listening, speaking, reading and everyday communication.",
            structure:
                "Progressive lessons with explanations, guided practice, activities and continuous review."
        },


        {
            title: "Portuguese",
            level: "Language",
            category: "Language",
            categoryKey: "language",
            cover: "images/portuguese.jpg",
            url: "#",
            description:
                "Learn Portuguese through a practical and structured learning path designed to help you communicate confidently in everyday situations.",
            time: "25 minutes",
            learning:
                "Vocabulary, grammar, pronunciation, listening, speaking, reading and practical communication.",
            structure:
                "Structured lessons followed by practice, activities, review and immediate feedback."
        },


        {
            title: "Microsoft Word",
            level: "MS Office",
            category: "MS Office",
            categoryKey: "ms-office",
            cover: "images/ms-word.jpg",
            url: "#",
            description:
                "Learn how to use Microsoft Word effectively to create professional documents, organise information and work confidently with essential document tools.",
            time: "25 minutes",
            learning:
                "Document creation, formatting, page layout, tables, images, styles and professional documents.",
            structure:
                "Practical demonstrations followed by guided exercises and independent practice."
        },


        {
            title: "Microsoft Excel",
            level: "MS Office",
            category: "MS Office",
            categoryKey: "ms-office",
            cover: "images/ms-excel.jpg",
            url: "#",
            description:
                "Develop practical Excel skills for organising information, working with data, using formulas and creating useful spreadsheets.",
            time: "25 minutes",
            learning:
                "Spreadsheets, formulas, functions, formatting, data organisation, charts and practical analysis.",
            structure:
                "Step-by-step lessons with demonstrations, exercises and repeated practice."
        },


        {
            title: "Microsoft PowerPoint",
            level: "MS Office",
            category: "MS Office",
            categoryKey: "ms-office",
            cover: "images/ms-powerpoint.jpg",
            url: "#",
            description:
                "Learn to create clear, professional and engaging presentations using Microsoft PowerPoint and its most important presentation tools.",
            time: "25 minutes",
            learning:
                "Slides, layouts, text, images, charts, animations, transitions and presentation design.",
            structure:
                "Practical lessons combining demonstrations, guided activities and presentation projects."
        },


        {
            title: "Trading Fundamentals",
            level: "Trading",
            category: "Trading",
            categoryKey: "trading",
            cover: "images/trading-fundamentals.jpg",
            url: "#",
            description:
                "Build a solid foundation in financial markets and trading concepts before moving into more advanced market analysis and strategies.",
            time: "25 minutes",
            learning:
                "Markets, financial instruments, orders, risk, trading terminology and fundamental concepts.",
            structure:
                "Concept-based lessons followed by examples, practice and knowledge checks."
        },


        {
            title: "Technical Analysis",
            level: "Trading",
            category: "Trading",
            categoryKey: "trading",
            cover: "images/technical-analysis.jpg",
            url: "#",
            description:
                "Learn the principles of technical analysis and how traders study price movements, charts and market behaviour.",
            time: "25 minutes",
            learning:
                "Charts, trends, support and resistance, indicators, patterns and technical analysis concepts.",
            structure:
                "Visual explanations, chart examples, guided analysis and repeated practice."
        },


        {
            title: "Business Fundamentals",
            level: "Business",
            category: "Business",
            categoryKey: "business",
            cover: "images/business-fundamentals.jpg",
            url: "#",
            description:
                "Understand the essential concepts behind modern business and develop a practical foundation for working in business environments.",
            time: "25 minutes",
            learning:
                "Business models, customers, markets, operations, strategy and essential business concepts.",
            structure:
                "Short lessons with practical examples, activities and knowledge checks."
        },


        {
            title: "Entrepreneurship",
            level: "Business",
            category: "Business",
            categoryKey: "business",
            cover: "images/entrepreneurship.jpg",
            url: "#",
            description:
                "Explore the principles of entrepreneurship and learn how ideas can be developed into practical business opportunities.",
            time: "25 minutes",
            learning:
                "Business ideas, opportunity identification, customers, business models, planning and execution.",
            structure:
                "Progressive lessons supported by practical activities and real-world examples."
        },


        {
            title: "Web Development",
            level: "Technology",
            category: "Technology",
            categoryKey: "technology",
            cover: "images/web-development.jpg",
            url: "#",
            description:
                "Build a practical foundation in web development and understand how modern websites are structured, designed and developed.",
            time: "25 minutes",
            learning:
                "HTML, CSS, JavaScript, web structure, styling, interaction and development fundamentals.",
            structure:
                "Concept explanations followed by coding demonstrations, exercises and projects."
        },


        {
            title: "Artificial Intelligence",
            level: "Technology",
            category: "Technology",
            categoryKey: "technology",
            cover: "images/artificial-intelligence.jpg",
            url: "#",
            description:
                "Explore the fundamentals of artificial intelligence and understand how AI systems are changing technology, business and everyday life.",
            time: "25 minutes",
            learning:
                "AI concepts, machine learning, generative AI, applications, limitations and practical use.",
            structure:
                "Conceptual lessons, demonstrations, examples and practical activities."
        },


        {
            title: "Personal Finance",
            level: "Finance",
            category: "Finance",
            categoryKey: "finance",
            cover: "images/personal-finance.jpg",
            url: "#",
            description:
                "Develop practical knowledge for managing personal money, making informed financial decisions and building stronger financial habits.",
            time: "25 minutes",
            learning:
                "Budgeting, saving, spending, debt, financial planning and responsible money management.",
            structure:
                "Practical lessons with examples, activities and financial decision-making exercises."
        },


        {
            title: "Financial Literacy",
            level: "Finance",
            category: "Finance",
            categoryKey: "finance",
            cover: "images/financial-literacy.jpg",
            url: "#",
            description:
                "Build the knowledge needed to understand money, financial products, economic concepts and everyday financial decisions.",
            time: "25 minutes",
            learning:
                "Money, banking, interest, credit, investing, risk and essential financial concepts.",
            structure:
                "Structured lessons with explanations, examples, activities and regular review."
        },


        {
            title: "Communication Skills",
            level: "Personal Development",
            category: "Personal Development",
            categoryKey: "personal-development",
            cover: "images/communication.jpg",
            url: "#",
            description:
                "Improve the way you communicate in professional and everyday situations by developing practical communication skills and greater confidence.",
            time: "25 minutes",
            learning:
                "Speaking, listening, clarity, confidence, professional communication and interpersonal skills.",
            structure:
                "Short lessons with examples, practical exercises, reflection and repeated practice."
        },


        {
            title: "Time Management",
            level: "Personal Development",
            category: "Personal Development",
            categoryKey: "personal-development",
            cover: "images/time-management.jpg",
            url: "#",
            description:
                "Learn practical methods for organising your time, prioritising important tasks and creating more effective working and learning habits.",
            time: "25 minutes",
            learning:
                "Priorities, planning, organisation, productivity, routines and effective time use.",
            structure:
                "Practical lessons supported by planning activities and real-world exercises."
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


    /* COURSE DETAILS */

    const homeContent =
        document.getElementById("homeContent");

    const courseDetails =
        document.getElementById("courseDetails");

    const courseBackButton =
        document.getElementById("courseBackButton");

    const courseDetailsCover =
        document.getElementById("courseDetailsCover");

    const courseDetailsCategory =
        document.getElementById("courseDetailsCategory");

    const courseDetailsTitle =
        document.getElementById("courseDetailsTitle");

    const courseDetailsLevel =
        document.getElementById("courseDetailsLevel");

    const courseDetailsDescription =
        document.getElementById("courseDetailsDescription");

    const courseDetailsStatLevel =
        document.getElementById("courseDetailsStatLevel");

    const courseDetailsTime =
        document.getElementById("courseDetailsTime");

    const courseDetailsLearning =
        document.getElementById("courseDetailsLearning");

    const courseDetailsStructure =
        document.getElementById("courseDetailsStructure");

    const courseStartButton =
        document.getElementById("courseStartButton");



    /* =========================================
       STATE
    ========================================== */

    let activeFilter = "all";

    let searchTerm = "";

    let activeCourse = null;



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


            card.className =
                "book-card";


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
                    href="#"
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


            const cardLink =
                card.querySelector(
                    ".book-card-link"
                );


            if (cardLink) {

                cardLink.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        openCourseDetails(course);

                    }
                );

            }


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

            }

            else {

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

        button.addEventListener(
            "click",
            () => {

                const filter =
                    button.dataset.filter;

                setFilter(filter);

            }
        );

    });



    /* =========================================
       FILTER BUTTONS
    ========================================== */

    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const filter =
                    button.dataset.filter;

                setFilter(filter);

            }
        );

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
       OPEN COURSE DETAILS
    ========================================== */

    function openCourseDetails(course) {

        if (
            !courseDetails ||
            !homeContent
        ) {
            return;
        }


        activeCourse = course;


        /* -------------------------------------
           COURSE COVER
        ------------------------------------- */

        if (courseDetailsCover) {

            courseDetailsCover.src =
                course.cover;

            courseDetailsCover.alt =
                course.title;

        }


        /* -------------------------------------
           COURSE INFORMATION
        ------------------------------------- */

        if (courseDetailsCategory) {

            courseDetailsCategory.textContent =
                course.category.toUpperCase();

        }


        if (courseDetailsTitle) {

            courseDetailsTitle.textContent =
                course.title;

        }


        if (courseDetailsLevel) {

            courseDetailsLevel.textContent =
                course.level;

        }


        if (courseDetailsDescription) {

            courseDetailsDescription.textContent =
                course.description;

        }


        if (courseDetailsStatLevel) {

            courseDetailsStatLevel.textContent =
                course.level;

        }


        if (courseDetailsTime) {

            courseDetailsTime.textContent =
                course.time;

        }


        if (courseDetailsLearning) {

            courseDetailsLearning.textContent =
                course.learning;

        }


        if (courseDetailsStructure) {

            courseDetailsStructure.textContent =
                course.structure;

        }


        /* -------------------------------------
           HIDE HOME
        ------------------------------------- */

        homeContent.classList.add(
            "home-hidden"
        );


        /* -------------------------------------
           SHOW DETAILS
        ------------------------------------- */

        courseDetails.classList.add(
            "visible"
        );


        courseDetails.setAttribute(
            "aria-hidden",
            "false"
        );


        /* -------------------------------------
           CLOSE MOBILE SIDEBAR
        ------------------------------------- */

        closeMobileSidebar();


        /* -------------------------------------
           MOVE TO TOP
        ------------------------------------- */

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }



    /* =========================================
       CLOSE COURSE DETAILS
    ========================================== */

    function closeCourseDetails() {

        if (
            !courseDetails ||
            !homeContent
        ) {
            return;
        }


        courseDetails.classList.remove(
            "visible"
        );


        courseDetails.setAttribute(
            "aria-hidden",
            "true"
        );


        homeContent.classList.remove(
            "home-hidden"
        );


        activeCourse = null;


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }



    /* =========================================
       BACK BUTTON
    ========================================== */

    if (courseBackButton) {

        courseBackButton.addEventListener(
            "click",
            closeCourseDetails
        );

    }



    /* =========================================
       COURSE START BUTTON
    ========================================== */

    if (courseStartButton) {

        courseStartButton.addEventListener(
            "click",
            () => {

                if (
                    activeCourse &&
                    activeCourse.url &&
                    activeCourse.url !== "#"
                ) {

                    window.location.href =
                        activeCourse.url;

                }

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

                if (
                    courseDetails &&
                    courseDetails.classList.contains(
                        "visible"
                    )
                ) {

                    closeCourseDetails();

                }

                else {

                    closeMobileSidebar();

                }

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
