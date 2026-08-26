// ============================================================
// EduCore — Public Homepage
// Dynamic Course Catalogue
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    // ========================================================
    // ELEMENTS
    // ========================================================

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

    const loadingCourses =
        document.getElementById("loadingCourses");

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


    // ========================================================
    // COURSE DETAILS
    // ========================================================

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


    // ========================================================
    // STATE
    // ========================================================

    let courses = [];

    let activeFilter = "all";

    let searchTerm = "";

    let activeCourse = null;


    // ========================================================
    // YEAR
    // ========================================================

    if (year) {

        year.textContent =
            new Date().getFullYear();

    }


    // ========================================================
    // CATEGORY TITLES
    // ========================================================

    const titles = {

        all:
            "All Areas",

        language:
            "Language",

        "ms-office":
            "MS Office",

        trading:
            "Trading",

        business:
            "Business",

        technology:
            "Technology",

        finance:
            "Finance",

        "personal-development":
            "Personal Development"

    };


    // ========================================================
    // ESCAPE HTML
    // ========================================================

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    // ========================================================
    // ESCAPE ATTRIBUTE
    // ========================================================

    function escapeAttribute(value) {

        return escapeHTML(value);

    }


    // ========================================================
    // NORMALIZE CATEGORY
    // ========================================================

    function normalizeCategory(category) {

        if (!category) {
            return "other";
        }

        return String(category)
            .trim()
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");

    }


    // ========================================================
    // COURSE DEFAULTS
    // ========================================================

    function getCourseTime(course) {

        /*
            The current courses table does not contain
            a lesson_length field.

            EduCore lessons are designed around 25 minutes.
        */

        return (
            course.lesson_length ||
            course.duration ||
            "25 minutes"
        );

    }


    function getCourseLearning(course) {

        /*
            The current Admin Create Course form does not yet
            have a "What you will learn" database field.

            Therefore we use a useful automatic description
            until that field is added to the database/Admin.
        */

        if (course.learning) {

            return course.learning;

        }

        if (course.description) {

            return course.description;

        }

        return (
            `Develop practical knowledge and skills through `
            + `structured autonomous learning in ${course.title || "this course"}.`
        );

    }


    function getCourseStructure(course) {

        /*
            The current Admin Create Course form does not yet
            contain a course structure field.

            Keep the existing EduCore lesson model as the
            default until those fields are added.
        */

        if (course.structure) {

            return course.structure;

        }

        return (
            "Structured 25-minute lessons with explanations, "
            + "practice activities, knowledge checks, repeated "
            + "practice and immediate feedback."
        );

    }


    // ========================================================
    // LOAD COURSES FROM SUPABASE
    // ========================================================

    async function loadCourses() {

        if (!bookGrid) {
            return;
        }


        if (loadingCourses) {

            loadingCourses.style.display =
                "block";

        }


        if (noResults) {

            noResults.classList.remove(
                "visible"
            );

        }


        bookGrid.innerHTML = "";


        try {

            // ------------------------------------------------
            // CHECK SUPABASE CLIENT
            // ------------------------------------------------

            if (
                typeof window.supabaseClient ===
                "undefined"
            ) {

                throw new Error(
                    "Supabase client is not available."
                );

            }


            // ------------------------------------------------
            // LOAD ONLY PUBLISHED COURSES
            // ------------------------------------------------

            const {
                data,
                error
            } =
                await window.supabaseClient
                    .from("courses")
                    .select(`
                        id,
                        title,
                        description,
                        category,
                        level,
                        cover_image,
                        status,
                        sort_order,
                        created_at,
                        slug
                    `)
                    .eq(
                        "status",
                        "published"
                    )
                    .order(
                        "sort_order",
                        {
                            ascending: true,
                            nullsFirst: false
                        }
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


            if (error) {

                throw error;

            }


            courses =
                (data || []).map(
                    course => {

                        return {

                            ...course,

                            categoryKey:
                                normalizeCategory(
                                    course.category
                                ),

                            cover:
                                course.cover_image ||
                                "images/course-placeholder.jpg",

                            url:
                                course.slug
                                    ? `course.html?slug=${encodeURIComponent(course.slug)}`
                                    : "#",

                            time:
                                getCourseTime(course),

                            learning:
                                getCourseLearning(course),

                            structure:
                                getCourseStructure(course)

                        };

                    }
                );


            // ------------------------------------------------
            // RENDER
            // ------------------------------------------------

            createCourseCards();

            setFilter("all");


        } catch (error) {

            console.error(
                "EduCore: Could not load courses:",
                error
            );


            courses = [];


            if (bookGrid) {

                bookGrid.innerHTML = `

                    <div class="courses-load-error">

                        <div class="courses-load-error-icon">
                            !
                        </div>

                        <h3>
                            Unable to load courses
                        </h3>

                        <p>
                            ${escapeHTML(
                                error?.message ||
                                "Please try again later."
                            )}
                        </p>

                        <button
                            type="button"
                            id="retryCoursesButton"
                        >
                            Try Again
                        </button>

                    </div>

                `;


                const retryButton =
                    document.getElementById(
                        "retryCoursesButton"
                    );


                if (retryButton) {

                    retryButton.addEventListener(
                        "click",
                        loadCourses
                    );

                }

            }

        } finally {

            if (loadingCourses) {

                loadingCourses.style.display =
                    "none";

            }

        }

    }


    // ========================================================
    // CREATE COURSE CARDS
    // ========================================================

    function createCourseCards() {

        if (!bookGrid) {
            return;
        }


        bookGrid.innerHTML = "";


        if (!courses.length) {

            if (noResults) {

                noResults.classList.add(
                    "visible"
                );

            }

            return;

        }


        courses.forEach(
            course => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "book-card";


                // --------------------------------------------
                // CATEGORY
                // --------------------------------------------

                card.dataset.category =
                    course.categoryKey;


                // --------------------------------------------
                // SEARCH TEXT
                // --------------------------------------------

                card.dataset.search = [

                    course.title,

                    course.category,

                    course.level,

                    course.description

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                // --------------------------------------------
                // CARD
                // --------------------------------------------

                card.innerHTML = `

                    <a
                        href="#"
                        class="book-card-link"
                        aria-label="Open ${escapeAttribute(
                            course.title
                        )}"
                    >

                        <div class="book-cover-wrapper">

                            <img
                                src="${escapeAttribute(
                                    course.cover
                                )}"
                                alt="${escapeAttribute(
                                    course.title
                                )}"
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
                                ${escapeHTML(
                                    course.category ||
                                    "Course"
                                ).toUpperCase()}
                            </div>

                            <div class="book-title">
                                ${escapeHTML(
                                    course.title ||
                                    "Untitled Course"
                                )}
                            </div>

                            <div class="book-level">
                                ${escapeHTML(
                                    course.level ||
                                    ""
                                )}
                            </div>

                        </div>

                    </a>

                `;


                // --------------------------------------------
                // OPEN COURSE
                // --------------------------------------------

                const cardLink =
                    card.querySelector(
                        ".book-card-link"
                    );


                if (cardLink) {

                    cardLink.addEventListener(
                        "click",
                        event => {

                            event.preventDefault();

                            openCourseDetails(
                                course
                            );

                        }
                    );

                }


                // --------------------------------------------
                // IMAGE ERROR
                // --------------------------------------------

                const image =
                    card.querySelector(
                        ".book-cover"
                    );


                if (image) {

                    image.addEventListener(
                        "error",
                        () => {

                            image.style.display =
                                "none";

                        }
                    );

                }


                bookGrid.appendChild(
                    card
                );

            }
        );

    }


    // ========================================================
    // FILTER COURSES
    // ========================================================

    function filterCourses() {

        const cards =
            document.querySelectorAll(
                ".book-card"
            );


        let visibleCount = 0;


        cards.forEach(
            card => {

                const category =
                    card.dataset.category ||
                    "";


                const text =
                    card.dataset.search ||
                    "";


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

                    card.classList.remove(
                        "hide"
                    );


                    visibleCount++;


                    setTimeout(
                        () => {

                            card.classList.add(
                                "show"
                            );

                        },
                        30
                    );

                } else {

                    card.classList.remove(
                        "show"
                    );

                    card.classList.add(
                        "hide"
                    );

                }

            }
        );


        if (noResults) {

            noResults.classList.toggle(
                "visible",
                visibleCount === 0
            );

        }

    }


    // ========================================================
    // SET FILTER
    // ========================================================

    function setFilter(filter) {

        activeFilter =
            filter ||
            "all";


        // --------------------------------------------
        // SIDEBAR
        // --------------------------------------------

        navigationButtons.forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.filter ===
                    activeFilter
                );

            }
        );


        // --------------------------------------------
        // FILTER BAR
        // --------------------------------------------

        filterButtons.forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.filter ===
                    activeFilter
                );

            }
        );


        // --------------------------------------------
        // TITLE
        // --------------------------------------------

        if (libraryTitle) {

            libraryTitle.textContent =
                titles[activeFilter] ||
                activeFilter === "all"
                    ? (
                        titles[activeFilter] ||
                        "All Areas"
                    )
                    : activeFilter;

        }


        // --------------------------------------------
        // FILTER
        // --------------------------------------------

        filterCourses();


        // --------------------------------------------
        // MOBILE SIDEBAR
        // --------------------------------------------

        if (
            window.innerWidth <= 768
        ) {

            closeMobileSidebar();

        }

    }


    // ========================================================
    // SIDEBAR NAVIGATION
    // ========================================================

    navigationButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    setFilter(
                        button.dataset.filter
                    );

                }
            );

        }
    );


    // ========================================================
    // FILTER BUTTONS
    // ========================================================

    filterButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    setFilter(
                        button.dataset.filter
                    );

                }
            );

        }
    );


    // ========================================================
    // SEARCH
    // ========================================================

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


    // ========================================================
    // OPEN COURSE DETAILS
    // ========================================================

    function openCourseDetails(course) {

        if (
            !courseDetails ||
            !homeContent ||
            !course
        ) {

            return;

        }


        activeCourse =
            course;


        // --------------------------------------------
        // COVER
        // --------------------------------------------

        if (courseDetailsCover) {

            courseDetailsCover.src =
                course.cover ||
                "";

            courseDetailsCover.alt =
                course.title ||
                "";

        }


        // --------------------------------------------
        // CATEGORY
        // --------------------------------------------

        if (courseDetailsCategory) {

            courseDetailsCategory.textContent =
                (
                    course.category ||
                    "Course"
                ).toUpperCase();

        }


        // --------------------------------------------
        // TITLE
        // --------------------------------------------

        if (courseDetailsTitle) {

            courseDetailsTitle.textContent =
                course.title ||
                "";

        }


        // --------------------------------------------
        // LEVEL
        // --------------------------------------------

        if (courseDetailsLevel) {

            courseDetailsLevel.textContent =
                course.level ||
                "";

        }


        // --------------------------------------------
        // DESCRIPTION
        // --------------------------------------------

        if (courseDetailsDescription) {

            courseDetailsDescription.textContent =
                course.description ||
                "";

        }


        // --------------------------------------------
        // STAT LEVEL
        // --------------------------------------------

        if (courseDetailsStatLevel) {

            courseDetailsStatLevel.textContent =
                course.level ||
                "";

        }


        // --------------------------------------------
        // LESSON LENGTH
        // --------------------------------------------

        if (courseDetailsTime) {

            courseDetailsTime.textContent =
                course.time ||
                "25 minutes";

        }


        // --------------------------------------------
        // LEARNING
        // --------------------------------------------

        if (courseDetailsLearning) {

            courseDetailsLearning.textContent =
                course.learning ||
                "";

        }


        // --------------------------------------------
        // STRUCTURE
        // --------------------------------------------

        if (courseDetailsStructure) {

            courseDetailsStructure.textContent =
                course.structure ||
                "";

        }


        // --------------------------------------------
        // HIDE HOME
        // --------------------------------------------

        homeContent.classList.add(
            "home-hidden"
        );


        // --------------------------------------------
        // SHOW DETAILS
        // --------------------------------------------

        courseDetails.classList.add(
            "visible"
        );


        courseDetails.setAttribute(
            "aria-hidden",
            "false"
        );


        // --------------------------------------------
        // CLOSE MOBILE SIDEBAR
        // --------------------------------------------

        closeMobileSidebar();


        // --------------------------------------------
        // TOP
        // --------------------------------------------

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }


    // ========================================================
    // CLOSE COURSE DETAILS
    // ========================================================

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


        activeCourse =
            null;


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }


    // ========================================================
    // BACK BUTTON
    // ========================================================

    if (courseBackButton) {

        courseBackButton.addEventListener(
            "click",
            closeCourseDetails
        );

    }


    // ========================================================
    // EXPLORE COURSE
    // ========================================================

    if (courseStartButton) {

        courseStartButton.addEventListener(
            "click",
            () => {

                if (
                    !activeCourse
                ) {

                    return;

                }


                /*
                    If a slug exists, use the course URL.

                    Example:

                    course.html?slug=english-a1
                */

                if (
                    activeCourse.slug
                ) {

                    window.location.href =
                        `course.html?slug=${encodeURIComponent(
                            activeCourse.slug
                        )}`;

                    return;

                }


                /*
                    If no slug exists, do nothing.
                    This prevents the button from navigating
                    to an invalid "#".
                */

            }
        );

    }


    // ========================================================
    // SIDEBAR TOGGLE
    // ========================================================

    if (
        menuButton &&
        sidebar
    ) {

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

                } else {

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


    // ========================================================
    // CLOSE MOBILE SIDEBAR
    // ========================================================

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


    // ========================================================
    // BACKDROP
    // ========================================================

    if (backdrop) {

        backdrop.addEventListener(
            "click",
            closeMobileSidebar
        );

    }


    // ========================================================
    // ESCAPE
    // ========================================================

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {

                return;

            }


            if (
                courseDetails &&
                courseDetails.classList.contains(
                    "visible"
                )
            ) {

                closeCourseDetails();

            } else {

                closeMobileSidebar();

            }

        }
    );


    // ========================================================
    // SCREEN RESIZE
    // ========================================================

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 768
            ) {

                closeMobileSidebar();

            }

        }
    );


    // ========================================================
    // INITIALIZE
    // ========================================================

    await loadCourses();

});
