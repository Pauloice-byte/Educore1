// ============================================================
// EduCore — Public Homepage
// Dynamic Course Catalogue + Promotional Carousel
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    "use strict";


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

    let carouselItems = [];

    let activeFilter = "all";

    let searchTerm = "";

    let activeCourse = null;

    let activeHeroSlide = 0;

    let heroCarouselTimer = null;

    let heroTouchStartX = 0;

    let heroTouchEndX = 0;


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
    // MOBILE SWIPE
    // ========================================================

    if (heroCarousel) {

        heroCarousel.addEventListener(
            "touchstart",
            event => {

                heroTouchStartX =
                    event.touches[0].clientX;

            },
            {
                passive: true
            }
        );


        heroCarousel.addEventListener(
            "touchend",
            event => {

                heroTouchEndX =
                    event.changedTouches[0].clientX;

                const swipeDistance =
                    heroTouchEndX -
                    heroTouchStartX;


                if (swipeDistance < -50) {

                    nextHeroSlide();

                }


                if (swipeDistance > 50) {

                    previousHeroSlide();

                }

            },
            {
                passive: true
            }
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


            if (!session) {

                headerLogin.textContent =
                    "Log in";

                headerLogin.href =
                    "login.html";

                return;

            }


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
    // LOAD COURSES
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
    // LOAD PROMOTIONS
    // ========================================================

    async function loadPromotions() {

        if (
            typeof window.supabaseClient ===
            "undefined"
        ) {

            return;

        }


        try {

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
                (data || []).filter(
                    promotion => {

                        const starts =
                            promotion.start_date
                                ? new Date(
                                    promotion.start_date
                                )
                                : null;

                        const ends =
                            promotion.end_date
                                ? new Date(
                                    promotion.end_date
                                )
                                : null;


                        if (
                            starts &&
                            now < starts
                        ) {

                            return false;

                        }


                        if (
                            ends &&
                            now > ends
                        ) {

                            return false;

                        }


                        return true;

                    }
                );


        } catch (error) {

            console.error(
                "EduCore: Could not load promotions:",
                error
            );

            promotions = [];

        }

    }


    // ========================================================
    // CREATE CAROUSEL
    // ========================================================

    function createHeroCarousel() {

        if (!heroCarouselTrack) {

            return;

        }


        heroCarouselTrack.innerHTML = "";


        carouselItems = [];


        // ----------------------------------------------------
        // COURSES
        // ----------------------------------------------------

        courses.forEach(
            course => {

                carouselItems.push({

                    type: "course",

                    data: course

                });

            }
        );


        // ----------------------------------------------------
        // PROMOTIONS
        // ----------------------------------------------------

        promotions.forEach(
            promotion => {

                carouselItems.push({

                    type: "promotion",

                    data: promotion

                });

            }
        );


        // ----------------------------------------------------
        // NO ITEMS
        // ----------------------------------------------------

        if (!carouselItems.length) {

            heroCarousel.style.display =
                "none";

            return;

        }


        heroCarousel.style.display =
            "block";


        // ----------------------------------------------------
        // CREATE SLIDES
        // ----------------------------------------------------

        carouselItems.forEach(
            (item, index) => {

                const slide =
                    document.createElement(
                        "article"
                    );


                slide.className =
                    "hero-slide";


                slide.dataset.slideIndex =
                    index;


                if (
                    item.type ===
                    "course"
                ) {

                    createCourseHeroSlide(
                        slide,
                        item.data
                    );

                } else {

                    createPromotionHeroSlide(
                        slide,
                        item.data
                    );

                }


                heroCarouselTrack.appendChild(
                    slide
                );

            }
        );


        // ----------------------------------------------------
        // CREATE DOTS
        // ----------------------------------------------------

        if (heroCarouselDots) {

            heroCarouselDots.innerHTML = "";


            carouselItems.forEach(
                (item, index) => {

                    const dot =
                        document.createElement(
                            "button"
                        );


                    dot.type =
                        "button";


                    dot.className =
                        "hero-carousel-dot";


                    dot.setAttribute(
                        "aria-label",
                        `Go to slide ${index + 1}`
                    );


                    dot.addEventListener(
                        "click",
                        () => goToHeroSlide(index)
                    );


                    heroCarouselDots.appendChild(
                        dot
                    );

                }
            );

        }


        activeHeroSlide =
            0;


        updateHeroSlide();

        startHeroCarousel();

    }


    // ========================================================
    // COURSE CAROUSEL SLIDE
    // ========================================================

    function createCourseHeroSlide(
        slide,
        course
    ) {

        slide.classList.add(
            "hero-course-slide"
        );


        slide.dataset.slideType =
            "course";


        slide.dataset.courseId =
            course.id;


        slide.innerHTML = `

            <div class="hero-course-cover-wrapper">

                <img
                    class="hero-course-cover"
                    src="${escapeAttribute(course.cover)}"
                    alt="${escapeAttribute(course.title)}"
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

    }


    // ========================================================
    // PROMOTION CAROUSEL SLIDE
    // ========================================================

    function createPromotionHeroSlide(
        slide,
        promotion
    ) {

        slide.classList.add(
            "hero-promotion-slide"
        );


        slide.dataset.slideType =
            "promotion";


        slide.dataset.promotionId =
            promotion.id;


        const imageMarkup =
            promotion.image_url
                ? `
                    <img
                        class="hero-promotion-image"
                        src="${escapeAttribute(
                            promotion.image_url
                        )}"
                        alt="${escapeAttribute(
                            promotion.title ||
                            "EduCore promotion"
                        )}"
                    >
                `
                : `
                    <div class="hero-promotion-image-placeholder">
                        EDUCORE
                    </div>
                `;


        slide.innerHTML = `

            <div class="hero-promotion-image-wrapper">

                ${imageMarkup}

            </div>


            <div class="hero-promotion-information">

                <div class="hero-promotion-label">
                    ${escapeHTML(
                        promotion.area ||
                        "EDUCORE"
                    )}
                </div>


                <h2 class="hero-promotion-title">
                    ${escapeHTML(
                        promotion.title ||
                        "Discover EduCore"
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
                    promotion.button_url
                        ? `
                            <button
                                type="button"
                                class="hero-promotion-button"
                            >

                                ${escapeHTML(
                                    promotion.button_text ||
                                    "Learn More"
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


        const button =
            slide.querySelector(
                ".hero-promotion-button"
            );


        if (button) {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    if (
                        promotion.button_url
                    ) {

                        window.open(
                            promotion.button_url,
                            "_blank",
                            "noopener,noreferrer"
                        );

                    }

                }
            );

        }

    }


    // ========================================================
    // UPDATE ACTIVE SLIDE
    // ========================================================

    function updateHeroSlide() {

        if (!carouselItems.length) {

            return;

        }


        const slides =
            heroCarouselTrack.querySelectorAll(
                ".hero-slide"
            );


        slides.forEach(
            (slide, index) => {

                slide.classList.toggle(
                    "active",
                    index === activeHeroSlide
                );

            }
        );


        if (heroCarouselDots) {

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

    }


    // ========================================================
    // GO TO SLIDE
    // ========================================================

    function goToHeroSlide(index) {

        if (!carouselItems.length) {

            return;

        }


        if (index < 0) {

            index =
                carouselItems.length - 1;

        }


        if (
            index >=
            carouselItems.length
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
            carouselItems.length <= 1
        ) {

            return;

        }


        heroCarouselTimer =
            setInterval(
                () => {

                    activeHeroSlide++;


                    if (
                        activeHeroSlide >=
                        carouselItems.length
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
    // CAROUSEL CONTROLS
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


        if (courseDetailsCover) {

            courseDetailsCover.src =
                course.cover ||
                "";

            courseDetailsCover.alt =
                course.title ||
                "Course cover";

        }


        if (courseDetailsCategory) {

            courseDetailsCategory.textContent =
                course.category ||
                "Course";

        }


        if (courseDetailsTitle) {

            courseDetailsTitle.textContent =
                course.title ||
                "";

        }


        if (courseDetailsLevel) {

            courseDetailsLevel.textContent =
                course.level ||
                "";

        }


        if (courseDetailsDescription) {

            courseDetailsDescription.textContent =
                course.description ||
                "";

        }


        if (courseDetailsStatLevel) {

            courseDetailsStatLevel.textContent =
                course.level ||
                "";

        }


        if (courseDetailsTime) {

            courseDetailsTime.textContent =
                course.time ||
                "25 minutes";

        }


        if (courseDetailsLearning) {

            courseDetailsLearning.textContent =
                course.learning ||
                "";

        }


        if (courseDetailsStructure) {

            courseDetailsStructure.textContent =
                course.structure ||
                "";

        }


        homeContent.classList.add(
            "home-hidden"
        );


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
        loadCourses(),
        loadPromotions()
    ]);

    createHeroCarousel();

});
