/* =========================================================
   EDUCORE ADMIN DASHBOARD
   COMPLETE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    /* =====================================================
       ELEMENTS
    ====================================================== */

    const adminApp = document.getElementById("admin-app");
    const sidebar = document.getElementById("admin-sidebar");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebarClose = document.getElementById("mobile-sidebar-close");
    const sidebarOverlay = document.getElementById("sidebar-overlay");

    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".admin-section");

    const pageTitle = document.getElementById("page-title");

    const adminName = document.getElementById("admin-name");
    const adminAvatar = document.getElementById("admin-avatar");

    const logoutButton = document.getElementById("admin-logout");


    /* =====================================================
       SAFETY CHECK
    ====================================================== */

    if (!adminApp) {
        console.error("EduCore Admin: #admin-app was not found.");
        return;
    }


    /* =====================================================
       SECTION TITLES
    ====================================================== */

    const sectionTitles = {
        overview: "Overview",
        courses: "Courses",
        students: "Students",
        progress: "Progress",
        media: "Media",
        settings: "Settings"
    };


    /* =====================================================
       SIDEBAR STATE
    ====================================================== */

    let sidebarCollapsed = false;


    /* =====================================================
       DESKTOP SIDEBAR TOGGLE
    ====================================================== */

    function toggleDesktopSidebar() {

        if (window.innerWidth <= 768) {
            toggleMobileSidebar();
            return;
        }

        sidebarCollapsed = !sidebarCollapsed;

        adminApp.classList.toggle(
            "sidebar-collapsed",
            sidebarCollapsed
        );

        if (sidebarToggle) {
            sidebarToggle.setAttribute(
                "aria-expanded",
                String(!sidebarCollapsed)
            );
        }
    }


    /* =====================================================
       MOBILE SIDEBAR OPEN
    ====================================================== */

    function openMobileSidebar() {

        if (window.innerWidth > 768) {
            return;
        }

        adminApp.classList.add("sidebar-open");

        if (sidebarToggle) {
            sidebarToggle.setAttribute(
                "aria-expanded",
                "true"
            );
        }

        document.body.style.overflow = "hidden";
    }


    /* =====================================================
       MOBILE SIDEBAR CLOSE
    ====================================================== */

    function closeMobileSidebar() {

        adminApp.classList.remove("sidebar-open");

        if (sidebarToggle) {
            sidebarToggle.setAttribute(
                "aria-expanded",
                "false"
            );
        }

        document.body.style.overflow = "";
    }


    /* =====================================================
       MOBILE SIDEBAR TOGGLE
    ====================================================== */

    function toggleMobileSidebar() {

        if (window.innerWidth > 768) {
            return;
        }

        const isOpen =
            adminApp.classList.contains("sidebar-open");

        if (isOpen) {
            closeMobileSidebar();
        } else {
            openMobileSidebar();
        }
    }


    /* =====================================================
       SIDEBAR BUTTON
    ====================================================== */

    if (sidebarToggle) {

        sidebarToggle.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                if (window.innerWidth <= 768) {
                    toggleMobileSidebar();
                } else {
                    toggleDesktopSidebar();
                }

            }
        );

    }


    /* =====================================================
       MOBILE CLOSE BUTTON
    ====================================================== */

    if (sidebarClose) {

        sidebarClose.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                closeMobileSidebar();

            }
        );

    }


    /* =====================================================
       MOBILE OVERLAY
    ====================================================== */

    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            function () {

                closeMobileSidebar();

            }
        );

    }


    /* =====================================================
       NAVIGATION
    ====================================================== */

    function showSection(sectionName) {

        if (!sectionName) {
            return;
        }

        const targetSection =
            document.getElementById(
                "section-" + sectionName
            );

        if (!targetSection) {
            console.warn(
                "EduCore Admin: section not found:",
                sectionName
            );
            return;
        }


        /* ---------------------------------------------
           HIDE ALL SECTIONS
        --------------------------------------------- */

        sections.forEach(function (section) {

            section.classList.remove("active");

        });


        /* ---------------------------------------------
           SHOW TARGET SECTION
        --------------------------------------------- */

        targetSection.classList.add("active");


        /* ---------------------------------------------
           UPDATE ACTIVE NAV ITEM
        --------------------------------------------- */

        navItems.forEach(function (item) {

            const itemSection =
                item.getAttribute("data-section");

            item.classList.toggle(
                "active",
                itemSection === sectionName
            );

        });


        /* ---------------------------------------------
           UPDATE PAGE TITLE
        --------------------------------------------- */

        if (pageTitle) {

            pageTitle.textContent =
                sectionTitles[sectionName] ||
                sectionName;

        }


        /* ---------------------------------------------
           CLOSE MOBILE SIDEBAR
        --------------------------------------------- */

        if (window.innerWidth <= 768) {
            closeMobileSidebar();
        }


        /* ---------------------------------------------
           RETURN PAGE TO TOP
        --------------------------------------------- */

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        /* ---------------------------------------------
           LOAD SECTION DATA
        --------------------------------------------- */

        if (sectionName === "overview") {
            loadOverview();
        }

        if (sectionName === "courses") {
            loadCourses();
        }

    }


    /* =====================================================
       NAVIGATION EVENTS
    ====================================================== */

    navItems.forEach(function (item) {

        item.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                const sectionName =
                    item.getAttribute("data-section");

                showSection(sectionName);

            }
        );

    });


    /* =====================================================
       INITIAL SECTION
    ====================================================== */

    showSection("overview");


    /* =====================================================
       RESPONSIVE SIDEBAR RESET
    ====================================================== */

    function handleResize() {

        if (window.innerWidth > 768) {

            adminApp.classList.remove(
                "sidebar-open"
            );

            document.body.style.overflow = "";

            if (sidebarToggle) {

                sidebarToggle.setAttribute(
                    "aria-expanded",
                    String(!sidebarCollapsed)
                );

            }

        } else {

            adminApp.classList.remove(
                "sidebar-collapsed"
            );

            if (!adminApp.classList.contains("sidebar-open")) {

                if (sidebarToggle) {

                    sidebarToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }

        }

    }


    window.addEventListener(
        "resize",
        handleResize
    );


    /* =====================================================
       ESCAPE KEY
    ====================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                if (
                    adminApp.classList.contains(
                        "sidebar-open"
                    )
                ) {
                    closeMobileSidebar();
                }

            }

        }
    );


    /* =====================================================
       ADMIN INFORMATION
    ====================================================== */

    function setAdminInformation(name) {

        const finalName =
            name && String(name).trim()
                ? String(name).trim()
                : "Admin";

        if (adminName) {
            adminName.textContent = finalName;
        }

        if (adminAvatar) {

            const firstLetter =
                finalName.charAt(0).toUpperCase();

            adminAvatar.textContent =
                firstLetter || "A";

        }

    }


    setAdminInformation("Admin");


    /* =====================================================
       OVERVIEW
    ====================================================== */

    function loadOverview() {

        /*
         * These are intentionally kept safe.
         * If no database information is available,
         * the dashboard remains functional.
         */

        const statCourses =
            document.getElementById("stat-courses");

        const statUnits =
            document.getElementById("stat-units");

        const statLessons =
            document.getElementById("stat-lessons");

        const statStudents =
            document.getElementById("stat-students");

        const statPublished =
            document.getElementById("stat-published");


        if (statCourses &&
            statCourses.textContent.trim() === "—") {

            statCourses.textContent = "0";

        }

        if (statUnits &&
            statUnits.textContent.trim() === "—") {

            statUnits.textContent = "0";

        }

        if (statLessons &&
            statLessons.textContent.trim() === "—") {

            statLessons.textContent = "0";

        }

        if (statStudents &&
            statStudents.textContent.trim() === "—") {

            statStudents.textContent = "0";

        }

        if (statPublished &&
            statPublished.textContent.trim() === "—") {

            statPublished.textContent = "0";

        }


        const activity =
            document.getElementById(
                "recent-activity"
            );

        if (
            activity &&
            activity.querySelector(
                ".activity-loading"
            )
        ) {

            activity.innerHTML = `
                <div class="activity-empty">
                    No recent activity.
                </div>
            `;

        }

    }
        /* =====================================================
       COURSE MANAGEMENT
    ====================================================== */

    let courses = [];

    let filteredCourses = [];

    let editingCourseId = null;


    /* =====================================================
       COURSE ELEMENTS
    ====================================================== */

    const coursesList =
        document.getElementById("courses-list");

    const coursesEmpty =
        document.getElementById("courses-empty");

    const courseCount =
        document.getElementById("course-count");

    const courseSearch =
        document.getElementById("course-search");

    const courseStatusFilter =
        document.getElementById("course-status-filter");

    const courseSort =
        document.getElementById("course-sort");

    const createCourseButton =
        document.getElementById("create-course-button");

    const createCourseEmptyButton =
        document.getElementById(
            "create-course-empty-button"
        );


    /* =====================================================
       LOAD COURSES
    ====================================================== */

    function loadCourses() {

        /*
         * No Supabase or authentication code is required
         * here. The navigation itself works independently.
         *
         * If courses are later connected to a database,
         * this function can be replaced with the database
         * loading function.
         */

        if (!Array.isArray(courses)) {
            courses = [];
        }

        applyCourseFilters();

    }


    /* =====================================================
       COURSE FILTERING
    ====================================================== */

    function applyCourseFilters() {

        const searchValue =
            courseSearch
                ? courseSearch.value
                    .trim()
                    .toLowerCase()
                : "";

        const statusValue =
            courseStatusFilter
                ? courseStatusFilter.value
                : "all";


        filteredCourses =
            courses.filter(function (course) {

                const title =
                    String(
                        course.title || ""
                    ).toLowerCase();

                const description =
                    String(
                        course.description || ""
                    ).toLowerCase();

                const category =
                    String(
                        course.category || ""
                    ).toLowerCase();

                const matchesSearch =
                    !searchValue ||
                    title.includes(searchValue) ||
                    description.includes(searchValue) ||
                    category.includes(searchValue);


                const courseStatus =
                    String(
                        course.status || "draft"
                    ).toLowerCase();

                const matchesStatus =
                    statusValue === "all" ||
                    courseStatus === statusValue;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            });


        sortCourses();

        renderCourses();

    }


    /* =====================================================
       COURSE SORTING
    ====================================================== */

    function sortCourses() {

        const sortValue =
            courseSort
                ? courseSort.value
                : "newest";


        filteredCourses.sort(
            function (a, b) {

                if (sortValue === "title") {

                    return String(
                        a.title || ""
                    ).localeCompare(
                        String(
                            b.title || ""
                        )
                    );

                }


                if (sortValue === "oldest") {

                    return (
                        getCourseDate(a) -
                        getCourseDate(b)
                    );

                }


                if (sortValue === "sort_order") {

                    return (
                        Number(
                            a.sort_order || 0
                        ) -
                        Number(
                            b.sort_order || 0
                        )
                    );

                }


                return (
                    getCourseDate(b) -
                    getCourseDate(a)
                );

            }
        );

    }


    /* =====================================================
       COURSE DATE
    ====================================================== */

    function getCourseDate(course) {

        const date =
            course.updated_at ||
            course.created_at;

        if (!date) {
            return 0;
        }

        const timestamp =
            new Date(date).getTime();

        return Number.isNaN(timestamp)
            ? 0
            : timestamp;

    }


    /* =====================================================
       RENDER COURSES
    ====================================================== */

    function renderCourses() {

        if (!coursesList) {
            return;
        }


        /* ---------------------------------------------
           COUNT
        --------------------------------------------- */

        if (courseCount) {

            const count =
                filteredCourses.length;

            courseCount.textContent =
                count === 1
                    ? "1 course"
                    : `${count} courses`;

        }


        /* ---------------------------------------------
           EMPTY STATE
        --------------------------------------------- */

        if (filteredCourses.length === 0) {

            coursesList.innerHTML = "";

            if (coursesEmpty) {
                coursesEmpty.hidden = false;
            }

            return;

        }


        if (coursesEmpty) {
            coursesEmpty.hidden = true;
        }


        /* ---------------------------------------------
           RENDER
        --------------------------------------------- */

        coursesList.innerHTML =
            filteredCourses
                .map(function (course) {

                    return createCourseRow(course);

                })
                .join("");

    }


    /* =====================================================
       CREATE COURSE ROW
    ====================================================== */

    function createCourseRow(course) {

        const id =
            course.id || "";

        const title =
            escapeHtml(
                course.title ||
                "Untitled Course"
            );

        const description =
            escapeHtml(
                course.description ||
                ""
            );

        const category =
            escapeHtml(
                course.category ||
                "General"
            );

        const level =
            escapeHtml(
                course.level ||
                "—"
            );

        const status =
            String(
                course.status ||
                "draft"
            ).toLowerCase();


        const statusClass =
            status === "published"
                ? "published"
                : "draft";


        const statusLabel =
            status.charAt(0).toUpperCase() +
            status.slice(1);


        const cover =
            course.cover_image ||
            course.image_url ||
            "";


        const coverHTML =
            cover
                ? `
                    <img
                        src="${escapeAttribute(cover)}"
                        alt=""
                    >
                `
                : `
                    <div class="course-cover-placeholder">
                        ▣
                    </div>
                `;


        return `
            <div
                class="course-row"
                data-course-id="${escapeAttribute(id)}"
            >

                <div class="course-cover">
                    ${coverHTML}
                </div>


                <div class="course-info">

                    <div class="course-title">
                        ${title}
                    </div>

                    <div class="course-description">
                        ${description}
                    </div>

                </div>


                <div class="course-category">
                    ${category}
                </div>


                <div class="course-level">
                    ${level}
                </div>


                <div>

                    <span
                        class="course-status ${statusClass}"
                    >
                        ${escapeHtml(statusLabel)}
                    </span>

                </div>


                <div class="course-actions">

                    <button
                        type="button"
                        class="course-action"
                        data-action="edit"
                        data-course-id="${escapeAttribute(id)}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="course-action danger"
                        data-action="delete"
                        data-course-id="${escapeAttribute(id)}"
                    >
                        Delete
                    </button>

                </div>

            </div>
        `;

    }


    /* =====================================================
       HTML ESCAPING
    ====================================================== */

    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function escapeAttribute(value) {

        return escapeHtml(value);

    }


    /* =====================================================
       COURSE SEARCH
    ====================================================== */

    if (courseSearch) {

        courseSearch.addEventListener(
            "input",
            function () {

                applyCourseFilters();

            }
        );

    }


    /* =====================================================
       STATUS FILTER
    ====================================================== */

    if (courseStatusFilter) {

        courseStatusFilter.addEventListener(
            "change",
            function () {

                applyCourseFilters();

            }
        );

    }


    /* =====================================================
       SORT FILTER
    ====================================================== */

    if (courseSort) {

        courseSort.addEventListener(
            "change",
            function () {

                applyCourseFilters();

            }
        );

    }


    /* =====================================================
       COURSE ACTIONS
    ====================================================== */

    if (coursesList) {

        coursesList.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );

                if (!button) {
                    return;
                }


                const action =
                    button.getAttribute(
                        "data-action"
                    );

                const courseId =
                    button.getAttribute(
                        "data-course-id"
                    );


                if (action === "edit") {

                    editCourse(courseId);

                }


                if (action === "delete") {

                    deleteCourse(courseId);

                }

            }
        );

    }


    /* =====================================================
       CREATE COURSE BUTTONS
    ====================================================== */

    if (createCourseButton) {

        createCourseButton.addEventListener(
            "click",
            function () {

                openCourseModal();

            }
        );

    }


    if (createCourseEmptyButton) {

        createCourseEmptyButton.addEventListener(
            "click",
            function () {

                openCourseModal();

            }
        );

    }


    /* =====================================================
       COURSE MODAL
    ====================================================== */

    function openCourseModal(course) {

        const modal =
            document.getElementById(
                "course-modal"
            );

        if (!modal) {

            console.warn(
                "EduCore Admin: course modal not found."
            );

            return;

        }


        editingCourseId =
            course && course.id
                ? course.id
                : null;


        fillCourseForm(course);


        modal.classList.add("open");

        document.body.style.overflow = "hidden";


        const firstInput =
            modal.querySelector(
                "input, textarea, select"
            );

        if (firstInput) {

            setTimeout(
                function () {
                    firstInput.focus();
                },
                100
            );

        }

    }


    /* =====================================================
       CLOSE COURSE MODAL
    ====================================================== */

    function closeCourseModal() {

        const modal =
            document.getElementById(
                "course-modal"
            );

        if (!modal) {
            return;
        }

        modal.classList.remove("open");

        document.body.style.overflow = "";

        editingCourseId = null;

    }


    /* =====================================================
       FILL COURSE FORM
    ====================================================== */

    function fillCourseForm(course) {

        const form =
            document.getElementById(
                "course-form"
            );

        if (!form) {
            return;
        }


        form.reset();


        if (!course) {
            return;
        }


        const fields = [
            "title",
            "description",
            "category",
            "level",
            "status",
            "cover_image",
            "image_url",
            "sort_order"
        ];


        fields.forEach(
            function (fieldName) {

                const field =
                    form.elements[fieldName];

                if (!field) {
                    return;
                }

                field.value =
                    course[fieldName] ??
                    "";

            }
        );

    }


    /* =====================================================
       EDIT COURSE
    ====================================================== */

    function editCourse(courseId) {

        const course =
            courses.find(
                function (item) {

                    return String(item.id) ===
                        String(courseId);

                }
            );


        if (!course) {

            console.warn(
                "Course not found:",
                courseId
            );

            return;

        }


        openCourseModal(course);

    }


    /* =====================================================
       DELETE COURSE
    ====================================================== */

    function deleteCourse(courseId) {

        const course =
            courses.find(
                function (item) {

                    return String(item.id) ===
                        String(courseId);

                }
            );


        if (!course) {
            return;
        }


        const confirmed =
            window.confirm(
                `Delete "${course.title || "this course"}"?`
            );


        if (!confirmed) {
            return;
        }


        courses =
            courses.filter(
                function (item) {

                    return String(item.id) !==
                        String(courseId);

                }
            );


        applyCourseFilters();

    }


    /* =====================================================
       MODAL CLOSE BUTTON
    ====================================================== */

    const modalClose =
        document.querySelector(
            ".modal-close"
        );

    if (modalClose) {

        modalClose.addEventListener(
            "click",
            function () {

                closeCourseModal();

            }
        );

    }


    /* =====================================================
       MODAL OVERLAY CLICK
    ====================================================== */

    const courseModal =
        document.getElementById(
            "course-modal"
        );

    if (courseModal) {

        courseModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    courseModal
                ) {

                    closeCourseModal();

                }

            }
        );

    }


    /* =====================================================
       MODAL ESCAPE KEY
    ====================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                courseModal &&
                courseModal.classList.contains("open")
            ) {

                closeCourseModal();

            }

        }
    );
    /* =========================================================
   EDUCORE ADMIN DASHBOARD
   PART 3
   COURSE MANAGEMENT
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* -----------------------------------------------------
       COURSE DATA
    ----------------------------------------------------- */

    let courses = [];

    let editingCourseId = null;


    /* -----------------------------------------------------
       ELEMENTS
    ----------------------------------------------------- */

    const courseSearch =
        document.getElementById("course-search");

    const courseStatusFilter =
        document.getElementById("course-status-filter");

    const courseSort =
        document.getElementById("course-sort");

    const coursesList =
        document.getElementById("courses-list");

    const coursesEmpty =
        document.getElementById("courses-empty");

    const courseCount =
        document.getElementById("course-count");

    const createCourseButton =
        document.getElementById("create-course-button");

    const createCourseEmptyButton =
        document.getElementById("create-course-empty-button");

    const courseModal =
        document.getElementById("course-modal");

    const courseForm =
        document.getElementById("course-form");

    const modalClose =
        document.getElementById("course-modal-close");

    const modalCancel =
        document.getElementById("course-modal-cancel");

    const modalTitle =
        document.getElementById("course-modal-title");

    const formError =
        document.getElementById("course-form-error");


    /* -----------------------------------------------------
       LOAD COURSES
    ----------------------------------------------------- */

    function loadCourses() {

        /*
         * The admin dashboard can work even when no
         * backend course data has been connected yet.
         *
         * If another part of the application supplies
         * courses later, this array can be replaced.
         */

        try {

            const savedCourses =
                localStorage.getItem("educore_admin_courses");

            if (savedCourses) {

                const parsed =
                    JSON.parse(savedCourses);

                if (Array.isArray(parsed)) {
                    courses = parsed;
                }

            }

        } catch (error) {

            console.error(
                "Unable to load saved courses:",
                error
            );

        }

        renderCourses();
    }


    /* -----------------------------------------------------
       SAVE COURSES
    ----------------------------------------------------- */

    function saveCourses() {

        try {

            localStorage.setItem(
                "educore_admin_courses",
                JSON.stringify(courses)
            );

        } catch (error) {

            console.error(
                "Unable to save courses:",
                error
            );

        }

    }


    /* -----------------------------------------------------
       FILTER + SORT
    ----------------------------------------------------- */

    function getFilteredCourses() {

        let result = [...courses];


        /* SEARCH */

        const search =
            courseSearch
                ? courseSearch.value
                    .trim()
                    .toLowerCase()
                : "";

        if (search) {

            result = result.filter(function (course) {

                const title =
                    String(course.title || "")
                        .toLowerCase();

                const description =
                    String(course.description || "")
                        .toLowerCase();

                const type =
                    String(course.type || "")
                        .toLowerCase();

                const level =
                    String(course.level || "")
                        .toLowerCase();

                return (
                    title.includes(search) ||
                    description.includes(search) ||
                    type.includes(search) ||
                    level.includes(search)
                );

            });

        }


        /* STATUS */

        const status =
            courseStatusFilter
                ? courseStatusFilter.value
                : "all";

        if (status !== "all") {

            result = result.filter(function (course) {

                return (
                    String(course.status || "")
                        .toLowerCase() === status
                );

            });

        }


        /* SORT */

        const sort =
            courseSort
                ? courseSort.value
                : "newest";


        if (sort === "title") {

            result.sort(function (a, b) {

                return String(a.title || "")
                    .localeCompare(
                        String(b.title || "")
                    );

            });

        } else if (sort === "oldest") {

            result.sort(function (a, b) {

                return (
                    new Date(a.created_at || 0) -
                    new Date(b.created_at || 0)
                );

            });

        } else if (sort === "sort_order") {

            result.sort(function (a, b) {

                return (
                    Number(a.sort_order || 0) -
                    Number(b.sort_order || 0)
                );

            });

        } else {

            result.sort(function (a, b) {

                return (
                    new Date(b.created_at || 0) -
                    new Date(a.created_at || 0)
                );

            });

        }

        return result;

    }


    /* -----------------------------------------------------
       RENDER COURSES
    ----------------------------------------------------- */

    function renderCourses() {

        if (!coursesList) {
            return;
        }

        const filtered =
            getFilteredCourses();


        /* COUNT */

        if (courseCount) {

            courseCount.textContent =
                filtered.length === 1
                    ? "1 course"
                    : filtered.length + " courses";

        }


        /* EMPTY */

        if (filtered.length === 0) {

            coursesList.innerHTML = "";

            if (coursesEmpty) {
                coursesEmpty.hidden = false;
            }

            return;

        }


        if (coursesEmpty) {
            coursesEmpty.hidden = true;
        }


        /* ROWS */

        coursesList.innerHTML =
            filtered
                .map(createCourseRow)
                .join("");


        attachCourseActions();

    }


    /* -----------------------------------------------------
       CREATE COURSE ROW
    ----------------------------------------------------- */

    function createCourseRow(course) {

        const status =
            String(course.status || "draft")
                .toLowerCase();

        const statusLabel =
            status.charAt(0).toUpperCase() +
            status.slice(1);

        const title =
            escapeHTML(
                course.title || "Untitled Course"
            );

        const description =
            escapeHTML(
                course.description || "No description"
            );

        const type =
            escapeHTML(
                course.type || "General"
            );

        const level =
            escapeHTML(
                course.level || "—"
            );

        const image =
            course.image
                ? `
                    <img
                        src="${escapeAttribute(course.image)}"
                        alt="${title}"
                    >
                `
                : `
                    <div class="course-cover-placeholder">
                        ▣
                    </div>
                `;


        return `
            <div
                class="course-row"
                data-course-id="${escapeAttribute(course.id)}"
            >

                <div class="course-cover">
                    ${image}
                </div>


                <div class="course-info">

                    <div class="course-title">
                        ${title}
                    </div>

                    <div class="course-description">
                        ${description}
                    </div>

                </div>


                <div class="course-category">
                    ${type}
                </div>


                <div class="course-level">
                    ${level}
                </div>


                <div>
                    <span class="course-status ${escapeAttribute(status)}">
                        ${escapeHTML(statusLabel)}
                    </span>
                </div>


                <div class="course-actions">

                    <button
                        type="button"
                        class="course-action edit-course"
                        data-id="${escapeAttribute(course.id)}"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="course-action toggle-course"
                        data-id="${escapeAttribute(course.id)}"
                    >
                        ${
                            status === "published"
                                ? "Unpublish"
                                : "Publish"
                        }
                    </button>


                    <button
                        type="button"
                        class="course-action danger delete-course"
                        data-id="${escapeAttribute(course.id)}"
                    >
                        Delete
                    </button>

                </div>

            </div>
        `;

    }


    /* -----------------------------------------------------
       COURSE ACTIONS
    ----------------------------------------------------- */

    function attachCourseActions() {

        const editButtons =
            document.querySelectorAll(
                ".edit-course"
            );

        const toggleButtons =
            document.querySelectorAll(
                ".toggle-course"
            );

        const deleteButtons =
            document.querySelectorAll(
                ".delete-course"
            );


        editButtons.forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        button.dataset.id;

                    editCourse(id);

                }
            );

        });


        toggleButtons.forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        button.dataset.id;

                    toggleCourseStatus(id);

                }
            );

        });


        deleteButtons.forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        button.dataset.id;

                    deleteCourse(id);

                }
            );

        });

    }


    /* -----------------------------------------------------
       OPEN CREATE MODAL
    ----------------------------------------------------- */

    function openCreateCourseModal() {

        editingCourseId = null;

        if (courseForm) {
            courseForm.reset();
        }

        if (formError) {

            formError.textContent = "";

            formError.classList.remove(
                "visible"
            );

        }

        if (modalTitle) {

            modalTitle.textContent =
                "Create Course";

        }

        if (courseModal) {

            courseModal.classList.add(
                "open"
            );

            courseModal.setAttribute(
                "aria-hidden",
                "false"
            );

        }

        document.body.style.overflow = "hidden";

    }


    /* -----------------------------------------------------
       OPEN EDIT MODAL
    ----------------------------------------------------- */

    function editCourse(id) {

        const course =
            courses.find(function (item) {

                return String(item.id) === String(id);

            });


        if (!course) {
            return;
        }


        editingCourseId =
            course.id;


        if (modalTitle) {

            modalTitle.textContent =
                "Edit Course";

        }


        setFormValue(
            "course-title",
            course.title
        );

        setFormValue(
            "course-description",
            course.description
        );

        setFormValue(
            "course-type",
            course.type
        );

        setFormValue(
            "course-level",
            course.level
        );

        setFormValue(
            "course-status",
            course.status
        );

        setFormValue(
            "course-image",
            course.image
        );

        setFormValue(
            "course-sort-order",
            course.sort_order
        );


        if (formError) {

            formError.textContent = "";

            formError.classList.remove(
                "visible"
            );

        }


        if (courseModal) {

            courseModal.classList.add(
                "open"
            );

            courseModal.setAttribute(
                "aria-hidden",
                "false"
            );

        }

        document.body.style.overflow = "hidden";

    }


    /* -----------------------------------------------------
       CLOSE MODAL
    ----------------------------------------------------- */

    function closeCourseModal() {

        if (!courseModal) {
            return;
        }

        courseModal.classList.remove(
            "open"
        );

        courseModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow = "";

        editingCourseId = null;

    }


    /* -----------------------------------------------------
       CREATE / UPDATE COURSE
    ----------------------------------------------------- */

    function saveCourseFromForm(event) {

        event.preventDefault();


        const title =
            getFormValue("course-title");

        const description =
            getFormValue("course-description");

        const type =
            getFormValue("course-type");

        const level =
            getFormValue("course-level");

        const status =
            getFormValue("course-status") ||
            "draft";

        const image =
            getFormValue("course-image");

        const sortOrder =
            getFormValue("course-sort-order");


        /* VALIDATION */

        if (!title) {

            showFormError(
                "Please enter a course title."
            );

            return;

        }


        /* UPDATE */

        if (editingCourseId !== null) {

            const index =
                courses.findIndex(function (course) {

                    return String(course.id) ===
                        String(editingCourseId);

                });


            if (index !== -1) {

                courses[index] = {

                    ...courses[index],

                    title,
                    description,
                    type,
                    level,
                    status,
                    image,
                    sort_order:
                        Number(sortOrder || 0),

                    updated_at:
                        new Date().toISOString()

                };

            }

        }


        /* CREATE */

        else {

            const newCourse = {

                id:
                    "course_" +
                    Date.now(),

                title,
                description,
                type,
                level,
                status,
                image,

                sort_order:
                    Number(sortOrder || 0),

                created_at:
                    new Date().toISOString(),

                updated_at:
                    new Date().toISOString()

            };


            courses.unshift(
                newCourse
            );

        }


        saveCourses();

        renderCourses();

        closeCourseModal();

    }


    /* -----------------------------------------------------
       TOGGLE COURSE STATUS
    ----------------------------------------------------- */

    function toggleCourseStatus(id) {

        const course =
            courses.find(function (item) {

                return String(item.id) ===
                    String(id);

            });


        if (!course) {
            return;
        }


        course.status =
            String(course.status)
                .toLowerCase() === "published"
                    ? "draft"
                    : "published";


        course.updated_at =
            new Date().toISOString();


        saveCourses();

        renderCourses();

    }


    /* -----------------------------------------------------
       DELETE COURSE
    ----------------------------------------------------- */

    function deleteCourse(id) {

        const course =
            courses.find(function (item) {

                return String(item.id) ===
                    String(id);

            });


        if (!course) {
            return;
        }


        const confirmed =
            window.confirm(
                'Delete "' +
                (course.title || "this course") +
                '"? This action cannot be undone.'
            );


        if (!confirmed) {
            return;
        }


        courses =
            courses.filter(function (item) {

                return String(item.id) !==
                    String(id);

            });


        saveCourses();

        renderCourses();

    }


    /* -----------------------------------------------------
       FORM HELPERS
    ----------------------------------------------------- */

    function getFormValue(id) {

        const element =
            document.getElementById(id);

        return element
            ? element.value.trim()
            : "";

    }


    function setFormValue(id, value) {

        const element =
            document.getElementById(id);

        if (element) {
            element.value =
                value === null ||
                value === undefined
                    ? ""
                    : value;
        }

    }


    function showFormError(message) {

        if (!formError) {
            return;
        }

        formError.textContent =
            message;

        formError.classList.add(
            "visible"
        );

    }


    /* -----------------------------------------------------
       SECURITY HELPERS
    ----------------------------------------------------- */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function escapeAttribute(value) {

        return escapeHTML(value);

    }


    /* -----------------------------------------------------
       EVENT LISTENERS
    ----------------------------------------------------- */

    if (createCourseButton) {

        createCourseButton.addEventListener(
            "click",
            openCreateCourseModal
        );

    }


    if (createCourseEmptyButton) {

        createCourseEmptyButton.addEventListener(
            "click",
            openCreateCourseModal
        );

    }


    if (modalClose) {

        modalClose.addEventListener(
            "click",
            closeCourseModal
        );

    }


    if (modalCancel) {

        modalCancel.addEventListener(
            "click",
            closeCourseModal
        );

    }


    if (courseForm) {

        courseForm.addEventListener(
            "submit",
            saveCourseFromForm
        );

    }


    if (courseSearch) {

        courseSearch.addEventListener(
            "input",
            renderCourses
        );

    }


    if (courseStatusFilter) {

        courseStatusFilter.addEventListener(
            "change",
            renderCourses
        );

    }


    if (courseSort) {

        courseSort.addEventListener(
            "change",
            renderCourses
        );

    }


    /* -----------------------------------------------------
       CLOSE MODAL BY CLICKING OUTSIDE
    ----------------------------------------------------- */

    if (courseModal) {

        courseModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    courseModal
                ) {

                    closeCourseModal();

                }

            }
        );

    }


    /* -----------------------------------------------------
       ESCAPE KEY
    ----------------------------------------------------- */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                courseModal &&
                courseModal.classList.contains("open")
            ) {

                closeCourseModal();

            }

        }
    );


    /* -----------------------------------------------------
       INITIALIZE
    ----------------------------------------------------- */

    loadCourses();

});
