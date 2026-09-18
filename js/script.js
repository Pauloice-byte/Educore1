// ============================================================
// EduCore — Public Homepage
// Dynamic Course Catalogue + Promotional Carousel
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

    const heroCarousel =
        document.getElementById("heroCarousel");

    const heroCarouselTrack =
        document.getElementById("heroCarouselTrack");

    const heroCarouselDots =
        document.getElementById("heroCarouselDots");

    const heroCarouselPrevious =
        document.getElementById("heroCarouselPrevious");

    const heroCarouselNext =
        document.getElementById("heroCarouselNext");

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

    let promotions = [];

    let activeFilter = "all";

    let searchTerm = "";

    let activeCourse = null;

    let heroSlides = [];

    let activeHeroSlide = 0;

    let heroCarouselTimer = null;

    let heroTouchStartX = 0;

    let heroTouchEndX = 0;


    // ========================================================
    // MOBILE SWIPE
    // ========================================================

    if (heroCarousel) {

        heroCarousel.addEventListener(
            "touchstart",
            (event) => {

                heroTouchStartX =
                    event.touches[0].clientX;

            },
            { passive: true }
        );


        heroCarousel.addEventListener(
            "touchend",
            (event) => {

                heroTouchEndX =
                    event.changedTouches[0].clientX;

                const swipeDistance =
                    heroTouchEndX -
                    heroTouchStartX;


                // Swipe left = next

                if (swipeDistance < -50) {

                    nextHeroSlide();

                }


                // Swipe right = previous

                if (swipeDistance > 50) {

                    previousHeroSlide();

                }

            },
            { passive: true }
        );

    }


    // ========================================================
    // AUTHENTICATION / SESSION
    // ========================================================

    async function updateHeaderLogin() {

        const headerLogin =
            document.querySelector(".header-login");

        if (!headerLogin) {
            return;
        }


        try {

            const {
                data: {
                    session
                }
            } =
                await window.supabaseClient.auth.getSession();


            // ------------------------------------------------
            // NOT LOGGED IN
            // ------------------------------------------------

            if (!session) {

                headerLogin.textContent =
                    "Log in";

                headerLogin.href =
                    "login.html";

                return;

            }


            // ------------------------------------------------
            // LOGGED IN
            // ------------------------------------------------

            const profile =
                await getCurrentProfile();


            if (
                profile &&
                profile.role === "admin"
            ) {

                headerLogin.textContent =
                    "Dashboard";

                headerLogin.href =
                    "admin.html";

                return;

            }


            headerLogin.textContent =
                "Dashboard";

            headerLogin.href =
                "student.html";


        } catch (error) {

            console.error(
                "EduCore: Could not determine authentication state:",
                error
            );

        }

    }


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

        return (
            course.lesson_length ||
            course.duration ||
            "25 minutes"
        );

    }


    function getCourseLearning(course) {

        if (course.learning) {

            return course.learning;

        }

        if (course.description) {

            return course.description;

        }

        return (
            `Develop practical knowledge and skills through ` +
            `structured autonomous learning in ` +
            `${course.title || "this course"}.`
        );

    }


    function getCourseStructure(course) {

        if (course.structure) {

            return course.structure;

        }

        return (
            "Structured 25-minute lessons with explanations, " +
            "practice activities, knowledge checks, repeated " +
            "practice and immediate feedback."
        );

    }


    // ========================================================
    // HERO CAROUSEL
    // ========================================================

    function createHeroSlides() {

        if (
            !heroCarouselTrack ||
            !heroCarouselDots
        ) {

            return;

        }


        // ----------------------------------------------------
        // REMOVE ALL GENERATED SLIDES
        // ----------------------------------------------------

        heroCarouselTrack
            .querySelectorAll(
                ".hero-course-slide, .hero-promotion-slide"
            )
            .forEach(
                slide => slide.remove()
            );


        // ----------------------------------------------------
        // RESET DOTS
        // ----------------------------------------------------

        heroCarouselDots.innerHTML = "";


        // ----------------------------------------------------
        // INTRO DOT
        // ----------------------------------------------------

        const introDot =
            document.createElement("button");

        introDot.type =
            "button";

        introDot.className =
            "hero-carousel-dot active";

        introDot.setAttribute(
            "aria-label",
            "Go to slide 1"
        );

        introDot.addEventListener(
            "click",
            () => goToHeroSlide(0)
        );

        heroCarouselDots.appendChild(
            introDot
        );


        let slideIndex = 1;


        // ====================================================
        // PROMOTION SLIDES
        // ====================================================

        promotions.forEach(
            promotion => {

                if (
                    !promotion ||
                    !promotion.title
                ) {

                    return;

                }


                const slide =
                    document.createElement("article");

                slide.className =
                    "hero-slide hero-promotion-slide";

                slide.dataset.slideType =
                    "promotion";

                slide.dataset.promotionId =
                    promotion.id;


                slide.innerHTML = `

                    <div class="hero-promotion-image-wrapper">

                        ${
                            promotion.image_url
                                ? `
                                    <img
                                        class="hero-promotion-image"
                                        src="${escapeAttribute(
                                            promotion.image_url
                                        )}"
                                        alt="${escapeAttribute(
                                            promotion.title
                                        )}"
                                    >
                                `
                                : `
                                    <div class="hero-promotion-image-placeholder">
                                        EDUCORE
                                    </div>
                                `
                        }

                    </div>


                    <div class="hero-promotion-information">

                        <div class="hero-promotion-label">
                            PROMOTION
                        </div>


                        <h2 class="hero-promotion-title">
                            ${escapeHTML(
                                promotion.title
                            )}
                        </h2>


                        ${
                            promotion.description
                                ? `
                                    <p class="hero-promotion-description">
                                        ${escapeHTML(
                                            promotion.description
                                        )}
                                    </p>
                                `
                                : ""
                        }


                        ${
                            promotion.button_text
                                ? `
                                    <button
                                        type="button"
                                        class="hero-promotion-button"
                                    >

                                        ${escapeHTML(
                                            promotion.button_text
                                        )}

                                        <span>
                                            →
                                        </span>

                                    </button>
                                `
                                : ""
                        }

                    </div>

                `;


                // ------------------------------------------------
                // IMAGE FALLBACK
                // ------------------------------------------------

                const image =
                    slide.querySelector(
                        ".hero-promotion-image"
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


                // ------------------------------------------------
                // PROMOTION BUTTON
                // ------------------------------------------------

                const button =
                    slide.querySelector(
                        ".hero-promotion-button"
                    );

                if (
                    button &&
                    promotion.button_url
                ) {

                    button.addEventListener(
                        "click",
                        () => {

                            window.location.href =
                                promotion.button_url;

                        }
                    );

                }


                heroCarouselTrack.appendChild(
                    slide
                );


                // ------------------------------------------------
                // DOT
                // ------------------------------------------------

                const dot =
                    document.createElement("button");

                dot.type =
                    "button";

                dot.className =
                    "hero-carousel-dot";

                dot.setAttribute(
                    "aria-label",
                    `Go to slide ${slideIndex + 1}`
                );

                dot.addEventListener(
                    "click",
                    () => goToHeroSlide(slideIndex)
                );

                heroCarouselDots.appendChild(
                    dot
                );


                slideIndex++;

            }
        );


        // ====================================================
        // COURSE SLIDES
        // ====================================================

        courses.forEach(
            course => {

                const currentIndex =
                    slideIndex;

                const slide =
                    document.createElement("article");

                slide.className =
                    "hero-slide hero-course-slide";

                slide.dataset.slideType =
                    "course";

                slide.dataset.courseId =
                    course.id;


                slide.innerHTML = `

                    <div class="hero-course-cover-wrapper">

                        <img
                            class="hero-course-cover"
                            src="${escapeAttribute(
                                course.cover
                            )}"
                            alt="${escapeAttribute(
                                course.title
                            )}"
                        >

                    </div>


                    <div class="hero-course-information">

                        <div class="hero-course-category">

                            ${escapeHTML(
                                course.category ||
                                "COURSE"
                            )}

                        </div>


                        <h2 class="hero-course-title">

                            ${escapeHTML(
                                course.title
                            )}

                        </h2>


                        <div class="hero-course-level">

                            ${escapeHTML(
                                course.level ||
                                "All Levels"
                            )}

                        </div>


                        <div class="hero-course-stats">

                            <div class="hero-course-stat">

                                <span>
                                    LESSON LENGTH
                                </span>

                                <strong>
                                    ${escapeHTML(
                                        course.time
                                    )}
                                </strong>

                            </div>


                            <div class="hero-course-stat">

                                <span>
                                    COURSE TYPE
                                </span>

                                <strong>
                                    Autonomous
                                </strong>

                            </div>

                        </div>


                        <button
                            type="button"
                            class="hero-course-button"
                        >

                            Explore Course

                            <span>
                                →
                            </span>

                        </button>

                    </div>

                `;


                // ------------------------------------------------
                // IMAGE FALLBACK
                // ------------------------------------------------

                const image =
                    slide.querySelector(
                        ".hero-course-cover"
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


                // ------------------------------------------------
                // EXPLORE COURSE
                // ------------------------------------------------

                const button =
                    slide.querySelector(
                        ".hero-course-button"
                    );

                if (button) {

                    button.addEventListener(
                        "click",
                        () => openCourseDetails(course)
                    );

                }


                heroCarouselTrack.appendChild(
                    slide
                );


                // ------------------------------------------------
                // DOT
                // ------------------------------------------------

                const dot =
                    document.createElement("button");

                dot.type =
                    "button";

                dot.className =
                    "hero-carousel-dot";

                dot.setAttribute(
                    "aria-label",
                    `Go to slide ${currentIndex + 1}`
                );

                dot.addEventListener(
                    "click",
                    () => goToHeroSlide(currentIndex)
                );

                heroCarouselDots.appendChild(
                    dot
                );


                slideIndex++;

            }
        );


        // ----------------------------------------------------
        // GET ALL SLIDES
        // ----------------------------------------------------

        heroSlides =
            heroCarouselTrack.querySelectorAll(
                ".hero-slide"
            );


        activeHeroSlide = 0;


        updateHeroSlide();

        startHeroCarousel();

    }


    // ========================================================
    // UPDATE ACTIVE SLIDE
    // ========================================================

    function updateHeroSlide() {

        if (!heroSlides.length) {

            return;

        }


        heroSlides.forEach(
            (slide, index) => {

                slide.classList.toggle(
                    "active",
                    index === activeHeroSlide
                );

            }
        );


        const dots =
            heroCarouselDots.querySelectorAll(
                ".hero-carousel-dot"
            );


        dots.forEach(
            (dot, index) => {

                dot.classList.toggle(
                    "active",
                    index === activeHeroSlide
                );

            }
        );

    }


    // ========================================================
    // GO TO SLIDE
    // ========================================================

    function goToHeroSlide(index) {

        if (!heroSlides.length) {

            return;

        }


        if (index < 0) {

            index =
                heroSlides.length - 1;

        }


        if (
            index >=
            heroSlides.length
        ) {

            index = 0;

        }


        activeHeroSlide =
            index;

        updateHeroSlide();

        restartHeroCarousel();

    }


    // ========================================================
    // NEXT / PREVIOUS
    // ========================================================

    function nextHeroSlide() {

        goToHeroSlide(
            activeHeroSlide + 1
        );

    }


    function previousHeroSlide() {

        goToHeroSlide(
            activeHeroSlide - 1
        );

    }


    // ========================================================
    // AUTO ROTATION
    // ========================================================

    function startHeroCarousel() {

        stopHeroCarousel();


        if (
            heroSlides.length <= 1
        ) {

            return;

        }


        heroCarouselTimer =
            setInterval(
                () => {

                    activeHeroSlide++;

                    if (
                        activeHeroSlide >=
                        heroSlides.length
                    ) {

                        activeHeroSlide = 0;

                    }

                    updateHeroSlide();

                },
                6000
            );

    }


    function stopHeroCarousel() {

        if (heroCarouselTimer) {

            clearInterval(
                heroCarouselTimer
            );

            heroCarouselTimer = null;

        }

    }


    function restartHeroCarousel() {

        startHeroCarousel();

    }


    // ========================================================
    // HERO CAROUSEL CONTROLS
    // ========================================================

    if (heroCarouselPrevious) {

        heroCarouselPrevious.addEventListener(
            "click",
            previousHeroSlide
        );

    }


    if (heroCarouselNext) {

        heroCarouselNext.addEventListener(
            "click",
            nextHeroSlide
        );

    }


    // ========================================================
    // LOAD PROMOTIONS FROM SUPABASE
    // ========================================================

    async function loadPromotions() {

        try {

            if (
                typeof window.supabaseClient ===
                "undefined"
            ) {

                throw new Error(
                    "Supabase client is not available."
                );

            }


            const {
                data,
                error
            } =
                await window.supabaseClient
                    .from("carousel_items")
                    .select(`
                        id,
                        title,
                        description,
                        image_url,
                        area,
                        button_text,
                        button_url,
                        status,
                        start_date,
                        end_date,
                        sort_order,
                        created_at
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


            const now =
                new Date();


            promotions =
                (data || [])
                    .filter(
                        promotion => {

                            // --------------------------------
                            // AREA
                            // --------------------------------

                            const area =
                                String(
                                    promotion.area ||
                                    ""
                                )
                                    .trim()
                                    .toLowerCase();


                            const isHomepagePromotion =
                                !area ||
                                area === "homepage" ||
                                area === "home" ||
                                area === "all";


                            if (
                                !isHomepagePromotion
                            ) {

                                return false;

                            }


                            // --------------------------------
                            // START DATE
                            // --------------------------------

                            if (
                                promotion.start_date
                            ) {

                                const startDate =
                                    new Date(
                                        promotion.start_date
                                    );

                                if (
                                    !Number.isNaN(
                                        startDate.getTime()
                                    ) &&
                                    now < startDate
                                ) {

                                    return false;

                                }

                            }


                            // --------------------------------
                            // END DATE
                            // --------------------------------

                            if (
                                promotion.end_date
                            ) {

                                const endDate =
                                    new Date(
                                        promotion.end_date
                                    );

                                if (
                                    !Number.isNaN(
                                        endDate.getTime()
                                    ) &&
                                    now > endDate
                                ) {

                                    return false;

                                }

                            }


                            return true;

                        }
                    );


        } catch (error) {

            console.error(
                "EduCore: Could not load carousel promotions:",
                error
            );

            promotions = [];

        }

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

            if (
                typeof window.supabaseClient ===
                "undefined"
            ) {

                throw new Error(
                    "Supabase client is not available."
                );

            }


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

                            time:
                                getCourseTime(course),

                            learning:
                                getCourseLearning(course),

                            structure:
                                getCourseStructure(course)

                        };

                    }
                );


            createCourseCards();

            setFilter("all");

            createHeroSlides();


        } catch (error) {

            console.error(
                "EduCore: Could not load courses:",
                error
            );


            courses = [];


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


                card.dataset.category =
                    course.categoryKey;


                card.dataset.search = [

                    course.title,
                    course.category,
                    course.level,
                    course.description

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


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


        filterCourses();

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


        navigationButtons.forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.filter ===
                    activeFilter
                );

            }
        );


        filterButtons.forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.filter ===
                    activeFilter
                );

            }
        );


        if (libraryTitle) {

            libraryTitle.textContent =
                titles[activeFilter] ||
                "Courses";

        }


        filterCourses();

    }


    // ========================================================
    // OPEN COURSE DETAILS
    // ========================================================

    function openCourseDetails(course) {

        if (
            !course ||
            !courseDetails ||
            !homeContent
        ) {

            return;

        }


        activeCourse =
            course;


        // COVER

        if (courseDetailsCover) {

            courseDetailsCover.src =
                course.cover ||
                "";

            courseDetailsCover.alt =
                course.title ||
                "Course cover";

        }


        // CATEGORY

        if (courseDetailsCategory) {

            courseDetailsCategory.textContent =
                course.category ||
                "Course";

        }


        // TITLE

        if (courseDetailsTitle) {

            courseDetailsTitle.textContent =
                course.title ||
                "";

        }


        // LEVEL

        if (courseDetailsLevel) {

            courseDetailsLevel.textContent =
                course.level ||
                "";

        }


        // DESCRIPTION

        if (courseDetailsDescription) {

            courseDetailsDescription.textContent =
                course.description ||
                "";

        }


        // STAT LEVEL

        if (courseDetailsStatLevel) {

            courseDetailsStatLevel.textContent =
                course.level ||
                "";

        }


        // LESSON LENGTH

        if (courseDetailsTime) {

            courseDetailsTime.textContent =
                course.time ||
                "25 minutes";

        }


        // LEARNING

        if (courseDetailsLearning) {

            courseDetailsLearning.textContent =
                course.learning ||
                "";

        }


        // STRUCTURE

        if (courseDetailsStructure) {

            courseDetailsStructure.textContent =
                course.structure ||
                "";

        }


        // HIDE HOME

        homeContent.classList.add(
            "home-hidden"
        );


        // SHOW DETAILS

        courseDetails.classList.add(
            "visible"
        );


        courseDetails.setAttribute(
            "aria-hidden",
            "false"
        );


        closeMobileSidebar();


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
    // FILTER BUTTON EVENTS
    // ========================================================

    navigationButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    setFilter(
                        button.dataset.filter
                    );

                    closeMobileSidebar();

                }
            );

        }
    );


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
            () => {

                searchTerm =
                    searchInput.value
                        .trim()
                        .toLowerCase();


                filterCourses();

            }
        );

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

                if (!activeCourse) {

                    return;

                }


                if (activeCourse.slug) {

                    window.location.href =
                        `course.html?slug=${encodeURIComponent(
                            activeCourse.slug
                        )}`;

                }

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
    // ESCAPE KEY
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

    await updateHeaderLogin();

    await Promise.all([
        loadPromotions(),
        loadCourses()
    ]);

});
