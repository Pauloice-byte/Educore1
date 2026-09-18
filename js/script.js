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
    // NORMALIZE CATEGORY / AREA
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
    // PROMOTION AREA MATCHING
    // ========================================================

    function promotionMatchesFilter(
        promotion,
        filter
    ) {

        if (
            !promotion ||
            filter === "all"
        ) {

            return true;

        }


        const area =
            normalizeCategory(
                promotion.area
            );


        /*
           A promotion can explicitly target
           a course area.

           Examples:
           Trading
           Language
           MS Office
           Business

           Generic areas such as "EduCore",
           "All", or "All Areas" remain available
           globally.
        */

        if (
            !area ||
            area === "other" ||
            area === "all" ||
            area === "all-areas" ||
            area === "edcore" ||
            area === "educore" ||
            area === "platform"
        ) {

            return true;

        }


        return area === filter;

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
        // FILTER COURSES FOR CAROUSEL
        // ----------------------------------------------------

        const visibleCourses =
            courses.filter(
                course => {

                    return (
                        activeFilter === "all" ||
                        course.categoryKey ===
                        activeFilter
                    );

                }
            );


        // ----------------------------------------------------
        // COURSES
        // ----------------------------------------------------

        visibleCourses.forEach(
            course => {

                carouselItems.push({

                    type: "course",

                    data: course

                });

            }
        );


        // ----------------------------------------------------
        // FILTER PROMOTIONS FOR CAROUSEL
        // ----------------------------------------------------

        const visiblePromotions =
            promotions.filter(
                promotion =>
                    promotionMatchesFilter(
                        promotion,
                        activeFilter
                    )
            );


        // ----------------------------------------------------
        // PROMOTIONS
        // ----------------------------------------------------

        visiblePromotions.forEach(
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

            stopHeroCarousel();

            if (heroCarouselDots) {

                heroCarouselDots.innerHTML =
                    "";

            }

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


      
