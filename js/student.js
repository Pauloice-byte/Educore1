document.addEventListener("DOMContentLoaded", async () => {

    "use strict";


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

    const courseDetailsCoverPlaceholder =
        document.getElementById(
            "studentCourseDetailsCoverPlaceholder"
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
        year.textContent =
            currentYear;
    }

    if (sidebarYear) {
        sidebarYear.textContent =
            currentYear;
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


    if (
        profile.active !== true
    ) {

        await supabaseClient.auth.signOut();

        window.location.replace(
            "index.html"
        );

        return;
    }


    if (
        profile.role === "admin"
    ) {

        window.location.replace(
            "admin.html"
        );

        return;
    }


    if (
        profile.role !== "student"
    ) {

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

            if (
                event.key === "Escape"
            ) {

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
        }
    );


    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 900
            ) {

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


    let currentView =
        null;


    let previousView =
        "courses";


    let activeCourse =
        null;


    function normalizeView(
        viewName
    ) {

        if (
            !viewNames.includes(
                viewName
            )
        ) {

            return "home";
        }

        return viewName;
    }


    function applyActiveView(
        viewName
    ) {

        viewName =
            normalizeView(
                viewName
            );


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
            normalizeView(
                viewName
            );


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

    function getCourseTime(
        course
    ) {

        return (
            course.duration ||
            course.total_hours ||
            course.hours ||
            course.lesson_duration ||
            "—"
        );
    }


    function getCourseLearning(
        course
    ) {

        return (
            course.learning_outcomes ||
            course.learning ||
            course.what_you_learn ||
            "Course learning information will be available as you progress through the course."
        );
    }


    function getCourseStructure(
        course
    ) {

        return (
            course.structure ||
            course.course_structure ||
            course.modules ||
            "The course is organised into structured learning modules."
        );
    }


    function getCourseCategory(
        course
    ) {

        return (
            course.category ||
            course.language ||
            "COURSE"
        );
    }


    function showCourseDetails(
        course
    ) {

        if (
            !course ||
            !courseDetails
        ) {

            return;
        }


        activeCourse =
            course;


        if (
            courseDetailsCategory
        ) {

            courseDetailsCategory.textContent =
                getCourseCategory(
                    course
                );
        }


        if (
            courseDetailsTitle
        ) {

            courseDetailsTitle.textContent =
                course.title ||
                "Untitled Course";
        }


        if (
            courseDetailsLevel
        ) {

            courseDetailsLevel.textContent =
                course.level ||
                "Level information unavailable";
        }


        if (
            courseDetailsStatLevel
        ) {

            courseDetailsStatLevel.textContent =
                course.level ||
                "—";
        }


        if (
            courseDetailsTime
        ) {

            courseDetailsTime.textContent =
                getCourseTime(
                    course
                );
        }


        if (
            courseDetailsDescription
        ) {

            courseDetailsDescription.textContent =
                course.description ||
                "Course information will be available here.";
        }


        if (
            courseDetailsLearning
        ) {

            courseDetailsLearning.textContent =
                getCourseLearning(
                    course
                );
        }


        if (
            courseDetailsStructure
        ) {

            courseDetailsStructure.textContent =
                getCourseStructure(
                    course
                );
        }


        if (
            courseDetailsCover &&
            courseDetailsCoverPlaceholder
        ) {

            if (
                course.cover_image
            ) {

                courseDetailsCover.src =
                    course.cover_image;

                courseDetailsCover.alt =
                    course.title ||
                    "Course";

                courseDetailsCover.style.display =
                    "block";

                courseDetailsCoverPlaceholder.style.display =
                    "none";

            } else {

                courseDetailsCover.removeAttribute(
                    "src"
                );

                courseDetailsCover.alt =
                    "";

                courseDetailsCover.style.display =
                    "none";

                courseDetailsCoverPlaceholder.textContent =
                    course.title ||
                    "EDUCORE COURSE";

                courseDetailsCoverPlaceholder.style.display =
                    "flex";
            }
        }


        /*
         * Remember where the student came from.
         * This lets the Details Back button return
         * to Courses or Search.
         */

        if (
            currentView === "search"
        ) {

            previousView =
                "search";

        } else {

            previousView =
                "courses";
        }


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


        closeMobileSidebar();


        courseDetails.classList.add(
            "visible"
        );

        courseDetails.setAttribute(
            "aria-hidden",
            "false"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        /*
         * Add a browser history state.
         * Therefore phone/browser Back returns
         * to the previous student view.
         */

        window.history.pushState(
            {
                studentView:
                    currentView,
                courseDetails:
                    true
            },
            "",
            `#course`
        );
    }


    function closeCourseDetails(
        useHistory = false
    ) {

        if (
            !courseDetails
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


        if (
            useHistory
        ) {

            window.history.back();

            return;
        }


        applyActiveView(
            previousView
        );
    }


    if (
        courseBackButton
    ) {

        courseBackButton.addEventListener(
            "click",
            () => {

                /*
                 * Go back through browser history
                 * when possible. The popstate handler
                 * will restore the previous view.
                 */

                if (
                    window.history.length > 1
                ) {

                    window.history.back();

                } else {

                    closeCourseDetails(
                        false
                    );
                }
            }
        );
    }


    if (
    courseStartButton
) {

    courseStartButton.addEventListener(
        "click",
        () => {

            if (
                !activeCourse
            ) {

                return;
            }


            /*
             * Every course displayed in the student
             * dashboard comes from the Supabase
             * courses table.
             *
             * The Supabase course ID is therefore
             * the permanent identifier used to tell
             * the shared course platform which course
             * the student selected.
             */

            if (
                activeCourse.id === undefined ||
                activeCourse.id === null
            ) {

                console.error(
                    "EduCore: Selected course has no Supabase course ID.",
                    activeCourse
                );

                return;
            }


            const courseId =
                String(
                    activeCourse.id
                );


            /*
             * Save the selected course locally as a
             * convenience for the course platform and
             * future student-dashboard functionality.
             */

            try {

                localStorage.setItem(
                    "educore_course_id",
                    courseId
                );

            } catch (error) {

                console.warn(
                    "EduCore: Unable to save selected course ID.",
                    error
                );
            }


            /*
             * All courses use the SAME course platform.
             *
             * Example:
             *
             * course-platform/course-platform.html?course_id=12
             *
             * The course platform will use this ID to
             * load the correct course, modules, lessons,
             * sections and activities from Supabase.
             */

            window.location.href =
                `course-platform/course-platform.html?course_id=${encodeURIComponent(
                    courseId
                )}`;

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
             * If the course details page is currently
             * visible, close it and restore the view
             * that opened it.
             */

            if (
                courseDetails &&
                courseDetails.classList.contains(
                    "visible"
                )
            ) {

                courseDetails.classList.remove(
                    "visible"
                );

                courseDetails.setAttribute(
                    "aria-hidden",
                    "true"
                );

                activeCourse =
                    null;

                const restoredView =
                    previousView ||
                    "courses";

                applyActiveView(
                    restoredView
                );

                return;
            }


            let viewName =
                null;


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


            if (
                viewName === "course"
            ) {

                return;
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
             * Course details has its own history state.
             * Do not treat #course as a normal view.
             */

            if (
                window.location.hash ===
                "#course"
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

        if (
            !coursesGrid
        ) {

            return;
        }


        if (
            coursesLoading
        ) {

            coursesLoading.classList.remove(
                "hidden"
            );
        }


        coursesGrid.innerHTML =
            "";


        if (
            coursesEmpty
        ) {

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
                        ascending:
                            false
                    }
                );


        if (
            coursesLoading
        ) {

            coursesLoading.classList.add(
                "hidden"
            );
        }


        if (error) {

            console.error(
                "Unable to load courses:",
                error
            );


            if (
                coursesEmpty
            ) {

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
            publishedCourses.length ===
            0 &&
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


        /*
         * Store the course ID directly on the card.
         * This is useful for event delegation.
         */

        if (
            course.id !== undefined &&
            course.id !== null
        ) {

            card.dataset.courseId =
                String(
                    course.id
                );
        }


        const cover =
            document.createElement(
                "div"
            );


        cover.className =
            "student-course-cover";


        if (
            course.cover_image
        ) {

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


        return card;
    }


    function renderCourses(
        courses,
        container
    ) {

        if (
            !container
        ) {

            return;
        }


        container.innerHTML =
            "";


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
       COURSE CARD CLICK HANDLER
       
       IMPORTANT:
       This uses event delegation instead of attaching
       individual click handlers to every card.
    ===================================================== */

    function handleCourseGridClick(
        event
    ) {

        const card =
            event.target.closest(
                ".student-course-card"
            );


        if (
            !card
        ) {

            return;
        }


        /*
         * Make sure this card actually belongs
         * to the current grid.
         */

        if (
            !event.currentTarget.contains(
                card
            )
        ) {

            return;
        }


        const courseId =
            card.dataset.courseId;


        if (
            !courseId
        ) {

            console.error(
                "Course card has no course ID."
            );

            return;
        }


        const course =
            publishedCourses.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        courseId
                    )
            );


        if (
            !course
        ) {

            console.error(
                "Unable to find selected course:",
                courseId
            );

            return;
        }


        showCourseDetails(
            course
        );
    }


    if (
        coursesGrid
    ) {

        coursesGrid.addEventListener(
            "click",
            handleCourseGridClick
        );
    }


    if (
        searchResults
    ) {

        searchResults.addEventListener(
            "click",
            handleCourseGridClick
        );
    }


    if (
        myCoursesGrid
    ) {

        myCoursesGrid.addEventListener(
            "click",
            handleCourseGridClick
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


        if (
            !cleanQuery
        ) {

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

                    const searchableText =
                        [
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
            results.length ===
            0
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


    if (
        searchInput
    ) {

        searchInput.addEventListener(
            "input",
            async event => {

                if (
                    publishedCourses.length ===
                    0
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

    if (
        logoutButton
    ) {

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


    /*
     * Course details is not a permanent navigation view.
     * If the page opens with #course, start with Courses.
     */

    if (
        initialView === "course"
    ) {

        initialView =
            "courses";
    }


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
