document.addEventListener("DOMContentLoaded", async () => {


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const sidebar =
        document.getElementById("sidebar");

    const menuButton =
        document.getElementById("menuButton");

    const sidebarBackdrop =
        document.getElementById("sidebarBackdrop");

    const logoutButton =
        document.getElementById("logoutButton");

    const studentName =
        document.getElementById("studentName");

    const year =
        document.getElementById("year");

    const sidebarYear =
        document.getElementById("sidebarYear");

    const searchInput =
        document.getElementById("courseSearchInput");

    const coursesGrid =
        document.getElementById("coursesGrid");

    const coursesLoading =
        document.getElementById("coursesLoading");

    const coursesEmpty =
        document.getElementById("coursesEmpty");

    const searchResults =
        document.getElementById("searchResults");

    const searchEmpty =
        document.getElementById("searchEmpty");

    const myCoursesGrid =
        document.getElementById("myCoursesGrid");

    const myCoursesEmpty =
        document.getElementById("myCoursesEmpty");

    const headerSectionTitle =
        document.getElementById("headerSectionTitle");

    const headerSectionLabel =
        document.getElementById("headerSectionLabel");


    /* =====================================================
       COURSE DETAILS ELEMENTS
    ===================================================== */

    const courseDetails =
        document.getElementById(
            "studentCourseDetails"
        );

    const courseBackButton =
        document.getElementById(
            "studentCourseBackButton"
        );

    const courseDetailsCover =
        document.getElementById(
            "studentCourseDetailsCover"
        );

    const courseDetailsCategory =
        document.getElementById(
            "studentCourseDetailsCategory"
        );

    const courseDetailsTitle =
        document.getElementById(
            "studentCourseDetailsTitle"
        );

    const courseDetailsLevel =
        document.getElementById(
            "studentCourseDetailsLevel"
        );

    const courseDetailsDescription =
        document.getElementById(
            "studentCourseDetailsDescription"
        );

    const courseDetailsStatLevel =
        document.getElementById(
            "studentCourseDetailsStatLevel"
        );

    const courseDetailsTime =
        document.getElementById(
            "studentCourseDetailsTime"
        );

    const courseDetailsLearning =
        document.getElementById(
            "studentCourseDetailsLearning"
        );

    const courseDetailsStructure =
        document.getElementById(
            "studentCourseDetailsStructure"
        );

    const courseStartButton =
        document.getElementById(
            "studentCourseStartButton"
        );


    /* =====================================================
       YEAR
    ===================================================== */

    const currentYear =
        new Date().getFullYear();

    if (year) {
        year.textContent = currentYear;
    }

    if (sidebarYear) {
        sidebarYear.textContent = currentYear;
    }


    /* =====================================================
       AUTHENTICATION
    ===================================================== */

    const user =
        await getCurrentUser();

    if (!user) {

        window.location.replace(
            "index.html"
        );

        return;
    }


    const profile =
        await getCurrentProfile();

    if (!profile) {

        await supabaseClient.auth.signOut();

        window.location.replace(
            "index.html"
        );

        return;
    }


    if (profile.active !== true) {

        await supabaseClient.auth.signOut();

        window.location.replace(
            "index.html"
        );

        return;
    }


    if (profile.role === "admin") {

        window.location.replace(
            "admin.html"
        );

        return;
    }


    if (profile.role !== "student") {

        await supabaseClient.auth.signOut();

        window.location.replace(
            "index.html"
        );

        return;
    }


    /* =====================================================
       STUDENT NAME
    ===================================================== */

    if (
        studentName &&
        profile.full_name
    ) {

        const firstName =
            profile.full_name
                .trim()
                .split(/\s+/)[0];

        studentName.textContent =
            firstName || "Student";
    }


    /* =====================================================
       SIDEBAR
    ===================================================== */

    function openMobileSidebar() {

        if (!sidebar) return;

        sidebar.classList.add(
            "mobile-open"
        );

        if (sidebarBackdrop) {

            sidebarBackdrop.classList.add(
                "active"
            );
        }

        if (menuButton) {

            menuButton.setAttribute(
                "aria-expanded",
                "true"
            );
        }
    }


    function closeMobileSidebar() {

        if (!sidebar) return;

        sidebar.classList.remove(
            "mobile-open"
        );

        if (sidebarBackdrop) {

            sidebarBackdrop.classList.remove(
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


    function toggleSidebar() {

        if (!sidebar) return;

        const isMobile =
            window.innerWidth <= 900;


        if (isMobile) {

            if (
                sidebar.classList.contains(
                    "mobile-open"
                )
            ) {

                closeMobileSidebar();

            } else {

                openMobileSidebar();

            }

            return;
        }


        sidebar.classList.toggle(
            "collapsed"
        );


        if (menuButton) {

            menuButton.setAttribute(
                "aria-expanded",
                String(
                    !sidebar.classList.contains(
                        "collapsed"
                    )
                )
            );
        }
    }


    if (menuButton) {

        menuButton.addEventListener(
            "click",
            toggleSidebar
        );
    }


    if (sidebarBackdrop) {

        sidebarBackdrop.addEventListener(
            "click",
            closeMobileSidebar
        );
    }


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

                    return;
                }

                closeMobileSidebar();
            }

        }
    );


    window.addEventListener(
        "resize",
        () => {

            if (window.innerWidth > 900) {

                closeMobileSidebar();
            }

        }
    );


    /* =====================================================
       VIEW MANAGEMENT
    ===================================================== */

    const viewNames = [
        "home",
        "courses",
        "search",
        "my-courses"
    ];


    const viewTitles = {

        home:
            "Home",

        courses:
            "Courses",

        search:
            "Search",

        "my-courses":
            "My Courses"

    };


    const viewLabels = {

        home:
            "STUDENT AREA",

        courses:
            "COURSE LIBRARY",

        search:
            "COURSE SEARCH",

        "my-courses":
            "YOUR LEARNING"

    };


    let currentView = null;


    /*
     * The course details screen is a temporary
     * overlay-style view inside student.html.
     *
     * This remembers the student section that
     * opened the course.
     */

    let previousCourseView =
        "courses";

    let activeCourse =
        null;


    function normalizeView(viewName) {

        if (
            !viewNames.includes(viewName)
        ) {

            return "home";
        }

        return viewName;
    }


    function applyActiveView(
        viewName
    ) {

        viewName =
            normalizeView(viewName);


        currentView =
            viewName;


        document
            .querySelectorAll(
                ".student-view"
            )
            .forEach(
                view => {

                    view.classList.toggle(
                        "active",
                        view.id ===
                        `view-${viewName}`
                    );

                }
            );


        document
            .querySelectorAll(
                ".student-nav-button"
            )
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.view ===
                        viewName
                    );

                }
            );


        document
            .querySelectorAll(
                ".bottom-nav-button"
            )
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.view ===
                        viewName
                    );

                }
            );


        if (headerSectionTitle) {

            headerSectionTitle.textContent =
                viewTitles[viewName];
        }


        if (headerSectionLabel) {

            headerSectionLabel.textContent =
                viewLabels[viewName];
        }


        closeMobileSidebar();


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });


        if (
            viewName === "courses"
        ) {

            loadPublishedCourses();
        }


        if (
            viewName === "search"
        ) {

            renderSearchResults(
                searchInput
                    ? searchInput.value
                    : ""
            );
        }


        if (
            viewName === "my-courses"
        ) {

            loadMyCourses();
        }
    }


    function setActiveView(
        viewName,
        addHistory = true
    ) {

        viewName =
            normalizeView(viewName);


        if (
            viewName === currentView
        ) {

            return;
        }


        if (addHistory) {

            window.history.pushState(

                {
                    studentView:
                        viewName
                },

                "",

                `#${viewName}`

            );
        }


        applyActiveView(
            viewName
        );
    }


    /* =====================================================
       STUDENT NAVIGATION
    ===================================================== */

    document
        .querySelectorAll(
            ".student-nav-button[data-view]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        closeCourseDetails();

                        setActiveView(
                            button.dataset.view,
                            true
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".bottom-nav-button[data-view]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        closeCourseDetails();

                        setActiveView(
                            button.dataset.view,
                            true
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-view-target]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        closeCourseDetails();

                        setActiveView(
                            button.dataset.viewTarget,
                            true
                        );

                    }
                );

            }
        );


    /* =====================================================
       COURSE DETAILS
    ===================================================== */

    function getCourseCategory(
        course
    ) {

        return (
            course.category ||
            course.language ||
            "COURSE"
        )
            .toString()
            .toUpperCase();
    }


    function getCourseTime(
        course
    ) {

        return (
            course.lesson_time ||
            course.duration ||
            course.time ||
            "25 minutes"
        );
    }


    function getCourseLearning(
        course
    ) {

        return (
            course.learning_outcomes ||
            course.learning ||
            course.description ||
            "Build your knowledge and practical skills through structured lessons and practice."
        );
    }


    function getCourseStructure(
        course
    ) {

        return (
            course.structure ||
            course.course_structure ||
            course.modules ||
            "Structured lessons with guided learning, practice and progress tracking."
        );
    }


    function openCourseDetails(
        course,
        sourceView = currentView || "courses"
    ) {

        if (
            !course ||
            !courseDetails
        ) {

            return;
        }


        activeCourse =
            course;

        previousCourseView =
            normalizeView(
                sourceView
            );


        if (courseDetailsCover) {

            if (course.cover_image) {

                courseDetailsCover.src =
                    course.cover_image;

                courseDetailsCover.alt =
                    course.title ||
                    "Course cover";

                courseDetailsCover.style.display =
                    "block";

            } else {

                courseDetailsCover.removeAttribute(
                    "src"
                );

                courseDetailsCover.alt =
                    "";

                courseDetailsCover.style.display =
                    "none";
            }
        }


        if (courseDetailsCategory) {

            courseDetailsCategory.textContent =
                getCourseCategory(
                    course
                );
        }


        if (courseDetailsTitle) {

            courseDetailsTitle.textContent =
                course.title ||
                "Untitled Course";
        }


        if (courseDetailsLevel) {

            courseDetailsLevel.textContent =
                course.level ||
                "Level information unavailable";
        }


        if (courseDetailsDescription) {

            courseDetailsDescription.textContent =
                course.description ||
                "Explore this course and begin your learning journey on EduCore.";
        }


        if (courseDetailsStatLevel) {

            courseDetailsStatLevel.textContent =
                course.level ||
                "—";
        }


        if (courseDetailsTime) {

            courseDetailsTime.textContent =
                getCourseTime(
                    course
                );
        }


        if (courseDetailsLearning) {

            courseDetailsLearning.textContent =
                getCourseLearning(
                    course
                );
        }


        if (courseDetailsStructure) {

            courseDetailsStructure.textContent =
                getCourseStructure(
                    course
                );
        }


        /*
         * Hide all student navigation views while
         * keeping them in the DOM.
         */

        document
            .querySelectorAll(
                ".student-view"
            )
            .forEach(
                view => {

                    view.classList.remove(
                        "active"
                    );

                }
            );


        if (courseDetails) {

            courseDetails.classList.add(
                "visible"
            );

            courseDetails.setAttribute(
                "aria-hidden",
                "false"
            );
        }


        closeMobileSidebar();


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });
    }


    function closeCourseDetails(
        restoreView = true
    ) {

        if (!courseDetails) {

            return;
        }


        if (
            !courseDetails.classList.contains(
                "visible"
            )
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


        activeCourse =
            null;


        if (restoreView) {

            applyActiveView(
                previousCourseView
            );
        }
    }


    if (courseBackButton) {

        courseBackButton.addEventListener(
            "click",
            () => {

                closeCourseDetails(
                    true
                );

            }
        );
    }


    /*
     * This is intentionally the same destination
     * behavior used by the homepage.
     */

    if (courseStartButton) {

        courseStartButton.addEventListener(
            "click",
            () => {

                if (
                    !activeCourse
                ) {

                    return;
                }


                if (
                    activeCourse.slug
                ) {

                    window.location.href =
                        `course.html?slug=${encodeURIComponent(
                            activeCourse.slug
                        )}`;

                    return;
                }


                if (
                    activeCourse.id
                ) {

                    window.location.href =
                        `course.html?id=${encodeURIComponent(
                            activeCourse.id
                        )}`;

                }

            }
        );
    }


    /* =====================================================
       BROWSER / PHONE BACK BUTTON
    ===================================================== */

    window.addEventListener(
        "popstate",
        event => {

            /*
             * If course details are open, Back first
             * closes the course information and returns
             * to the student view from which it opened.
             */

            if (
                courseDetails &&
                courseDetails.classList.contains(
                    "visible"
                )
            ) {

                closeCourseDetails(
                    true
                );

                return;
            }


            let viewName = null;


            if (
                event.state &&
                event.state.studentView
            ) {

                viewName =
                    event.state.studentView;
            }


            if (!viewName) {

                viewName =
                    window.location.hash
                        .replace("#", "")
                        .trim();
            }


            viewName =
                normalizeView(
                    viewName
                );


            applyActiveView(
                viewName
            );
        }
    );


    window.addEventListener(
        "hashchange",
        () => {

            /*
             * Do not let a hash navigation destroy
             * the course details screen unexpectedly.
             */

            if (
                courseDetails &&
                courseDetails.classList.contains(
                    "visible"
                )
            ) {

                return;
            }


            const viewName =
                normalizeView(
                    window.location.hash
                        .replace("#", "")
                        .trim()
                );


            if (
                viewName !== currentView
            ) {

                applyActiveView(
                    viewName
                );
            }

        }
    );


    /* =====================================================
       PLACEHOLDER LINKS
    ===================================================== */

    document
        .querySelectorAll(
            ".placeholder-link"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                    }
                );

            }
        );


    /* =====================================================
       COURSE DATA
    ===================================================== */

    let publishedCourses = [];


    async function loadPublishedCourses() {

        if (!coursesGrid) {
            return;
        }


        if (coursesLoading) {

            coursesLoading.classList.remove(
                "hidden"
            );
        }


        coursesGrid.innerHTML = "";


        if (coursesEmpty) {

            coursesEmpty.classList.add(
                "hidden"
            );
        }


        const {
            data,
            error
        } =
            await supabaseClient
                .from("courses")
                .select("*")
                .eq(
                    "status",
                    "published"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (coursesLoading) {

            coursesLoading.classList.add(
                "hidden"
            );
        }


        if (error) {

            console.error(
                "Unable to load courses:",
                error
            );


            if (coursesEmpty) {

                coursesEmpty.classList.remove(
                    "hidden"
                );


                const title =
                    coursesEmpty.querySelector(
                        ".dashboard-empty-title"
                    );

                const text =
                    coursesEmpty.querySelector(
                        ".dashboard-empty-text"
                    );


                if (title) {

                    title.textContent =
                        "Unable to load courses";
                }


                if (text) {

                    text.textContent =
                        "There was a problem loading the course catalogue.";
                }
            }


            return;
        }


        publishedCourses =
            data || [];


        renderCourses(
            publishedCourses,
            coursesGrid
        );


        if (
            publishedCourses.length === 0 &&
            coursesEmpty
        ) {

            coursesEmpty.classList.remove(
                "hidden"
            );
        }
    }


    /* =====================================================
       COURSE CARD
    ===================================================== */

    function createCourseCard(
        course
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "student-course-card";


        card.setAttribute(
            "tabindex",
            "0"
        );


        card.setAttribute(
            "role",
            "button"
        );


        card.setAttribute(
            "aria-label",
            `Open ${course.title || "course"} information`
        );


        const cover =
            document.createElement(
                "div"
            );


        cover.className =
            "student-course-cover";


        if (course.cover_image) {

            const image =
                document.createElement(
                    "img"
                );


            image.src =
                course.cover_image;


            image.alt =
                course.title ||
                "Course";


            image.loading =
                "lazy";


            cover.appendChild(
                image
            );

        } else {

            const placeholder =
                document.createElement(
                    "div"
                );


            placeholder.className =
                "student-course-cover-placeholder";


            placeholder.textContent =
                course.title ||
                "EDUCORE COURSE";


            cover.appendChild(
                placeholder
            );
        }


        const information =
            document.createElement(
                "div"
            );


        information.className =
            "student-course-information";


        const language =
            document.createElement(
                "div"
            );


        language.className =
            "student-course-language";


        language.textContent =
            course.language ||
            course.category ||
            "COURSE";


        const title =
            document.createElement(
                "div"
            );


        title.className =
            "student-course-title";


        title.textContent =
            course.title ||
            "Untitled Course";


        const level =
            document.createElement(
                "div"
            );


        level.className =
            "student-course-level";


        level.textContent =
            course.level ||
            "Level information unavailable";


        information.appendChild(
            language
        );


        information.appendChild(
            title
        );


        information.appendChild(
            level
        );


        card.appendChild(
            cover
        );


        card.appendChild(
            information
        );


        /*
         * FIX:
         *
         * The old code only logged the course.
         * Cards now open the same type of course
         * information view used on the homepage.
         */

        function selectCourse() {

            openCourseDetails(
                course,
                currentView || "courses"
            );
        }


        card.addEventListener(
            "click",
            selectCourse
        );


        card.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    selectCourse();
                }

            }
        );


        return card;
    }


    function renderCourses(
        courses,
        container
    ) {

        if (!container) {
            return;
        }


        container.innerHTML = "";


        courses.forEach(
            course => {

                const card =
                    createCourseCard(
                        course
                    );


                container.appendChild(
                    card
                );

            }
        );
    }


    /* =====================================================
       SEARCH
    ===================================================== */

    function renderSearchResults(
        query
    ) {

        if (
            !searchResults ||
            !searchEmpty
        ) {

            return;
        }


        const cleanQuery =
            query
                .trim()
                .toLowerCase();


        if (!cleanQuery) {

            searchResults.innerHTML =
                "";


            searchEmpty.classList.remove(
                "hidden"
            );


            const title =
                searchEmpty.querySelector(
                    ".dashboard-empty-title"
                );


            const text =
                searchEmpty.querySelector(
                    ".dashboard-empty-text"
                );


            if (title) {

                title.textContent =
                    "Search the course catalogue";
            }


            if (text) {

                text.textContent =
                    "Start typing to find courses available on EduCore.";
            }


            return;
        }


        const results =
            publishedCourses.filter(
                course => {

                    const searchableText = [

                        course.title,

                        course.language,

                        course.level,

                        course.description,

                        course.category

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return searchableText.includes(
                        cleanQuery
                    );

                }
            );


        searchResults.innerHTML =
            "";


        if (
            results.length === 0
        ) {

            searchEmpty.classList.remove(
                "hidden"
            );


            const title =
                searchEmpty.querySelector(
                    ".dashboard-empty-title"
                );


            const text =
                searchEmpty.querySelector(
                    ".dashboard-empty-text"
                );


            if (title) {

                title.textContent =
                    "No courses found";
            }


            if (text) {

                text.textContent =
                    "Try another course name, language or level.";
            }


            return;
        }


        searchEmpty.classList.add(
            "hidden"
        );


        renderCourses(
            results,
            searchResults
        );
    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            async event => {

                if (
                    publishedCourses.length === 0
                ) {

                    await loadPublishedCourses();
                }


                renderSearchResults(
                    event.target.value
                );

            }
        );
    }


    /* =====================================================
       MY COURSES
       Enrollment system comes next.
    ===================================================== */

    async function loadMyCourses() {

        if (
            !myCoursesGrid ||
            !myCoursesEmpty
        ) {

            return;
        }


        myCoursesGrid.innerHTML =
            "";


        myCoursesEmpty.classList.remove(
            "hidden"
        );


        /*
         * Enrollment data will be connected
         * when the student enrollment table
         * is created.
         */
    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async () => {

                try {

                    await logoutUser();

                } catch (error) {

                    console.error(
                        "Logout failed:",
                        error
                    );

                }

            }
        );
    }


    /* =====================================================
       INITIAL VIEW
    ===================================================== */

    let initialView =
        window.location.hash
            .replace("#", "")
            .trim();


    if (
        !viewNames.includes(
            initialView
        )
    ) {

        initialView =
            "home";


        window.history.replaceState(
            {
                studentView:
                    "home"
            },
            "",
            `${window.location.pathname}#home`
        );

    } else {

        window.history.replaceState(
            {
                studentView:
                    initialView
            },
            "",
            `${window.location.pathname}#${initialView}`
        );
    }


    applyActiveView(
        initialView
    );


    /* =====================================================
       PRELOAD COURSE CATALOGUE
    ===================================================== */

    await loadPublishedCourses();


});
