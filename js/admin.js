/* =========================================================
   EDUCORE ADMIN DASHBOARD
   STANDALONE INTERFACE JAVASCRIPT

   NO SUPABASE
   NO AUTHENTICATION
   NO BACKEND
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const app =
        document.getElementById("admin-app");

    if (!app) {
        console.error(
            "EduCore Admin: #admin-app not found."
        );
        return;
    }


    const sidebar =
        app.querySelector(".admin-sidebar");

    const sidebarToggle =
        app.querySelector(".sidebar-toggle");

    const sidebarClose =
        app.querySelector(".mobile-sidebar-close");

    const sidebarOverlay =
        app.querySelector(".sidebar-overlay");

    const navItems =
        app.querySelectorAll(".nav-item");

    const sections =
        app.querySelectorAll(".admin-section");

    const headerTitle =
        app.querySelector(".header-title h1");

    const modalOverlay =
        document.getElementById(
            "course-modal-overlay"
        );

    const modalClose =
        app.querySelector(".modal-close");

    const courseForm =
        document.getElementById("course-form");

    const cancelButton =
        courseForm
            ? courseForm.querySelector(
                ".modal-footer .secondary-button"
            )
            : null;

    const createCourseButton =
        document.getElementById(
            "create-course-btn"
        );

    const logoutButton =
        app.querySelector(".logout-button");

    const coursesList =
        document.getElementById(
            "courses-list"
        );

    const courseSearch =
        document.getElementById(
            "course-search"
        );

    const courseFilter =
        document.getElementById(
            "course-filter"
        );

    const courseCount =
        document.getElementById(
            "course-count"
        );


    /* =====================================================
       MOBILE
    ===================================================== */

    function isMobile() {

        return window.innerWidth <= 768;

    }


    /* =====================================================
       SIDEBAR
    ===================================================== */

    function openSidebar() {

        if (isMobile()) {

            app.classList.add(
                "sidebar-open"
            );

        }

    }


    function closeSidebar() {

        app.classList.remove(
            "sidebar-open"
        );

    }


    function toggleSidebar() {

        if (isMobile()) {

            app.classList.toggle(
                "sidebar-open"
            );

            return;
        }


        app.classList.toggle(
            "sidebar-collapsed"
        );

    }


    if (sidebarToggle) {

        sidebarToggle.addEventListener(
            "click",
            event => {

                event.preventDefault();

                toggleSidebar();

            }
        );

    }


    if (sidebarClose) {

        sidebarClose.addEventListener(
            "click",
            event => {

                event.preventDefault();

                closeSidebar();

            }
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            () => {

                closeSidebar();

            }
        );

    }


    /* =====================================================
       PAGE TITLES
    ===================================================== */

    const pageTitles = {

        overview: "Overview",
        courses: "Courses",
        students: "Students",
        progress: "Progress",
        media: "Media",
        settings: "Settings"

    };


    /* =====================================================
       NAVIGATION KEY
    ===================================================== */

    function getNavigationKey(item) {

        if (item.dataset.section) {

            return item.dataset.section
                .trim()
                .toLowerCase();

        }


        if (item.dataset.page) {

            return item.dataset.page
                .trim()
                .toLowerCase();

        }


        const href =
            item.getAttribute("href");

        if (
            href &&
            href.startsWith("#")
        ) {

            return href
                .substring(1)
                .replace("-section", "")
                .toLowerCase();

        }


        return "";

    }


    /* =====================================================
       SHOW SECTION
    ===================================================== */

    function showSection(sectionKey) {

        if (!sectionKey) {
            return;
        }


        sectionKey =
            sectionKey
                .trim()
                .toLowerCase();


        /*
           Hide ALL sections
        */

        sections.forEach(section => {

            section.classList.remove(
                "active"
            );

        });


        /*
           Find requested section
        */

        let targetSection =
            document.getElementById(
                `${sectionKey}-section`
            );


        /*
           Fallback: data-section
        */

        if (!targetSection) {

            targetSection =
                app.querySelector(
                    `.admin-section[data-section="${sectionKey}"]`
                );

        }


        /*
           Fallback: data-page
        */

        if (!targetSection) {

            targetSection =
                app.querySelector(
                    `.admin-section[data-page="${sectionKey}"]`
                );

        }


        /*
           If section doesn't exist,
           stop here.
        */

        if (!targetSection) {

            console.error(
                "EduCore Admin: section not found:",
                sectionKey
            );

            return;

        }


        /*
           Show section
        */

        targetSection.classList.add(
            "active"
        );


        /*
           Update sidebar active state
        */

        navItems.forEach(item => {

            const itemKey =
                getNavigationKey(item);

            item.classList.toggle(
                "active",
                itemKey === sectionKey
            );

        });


        /*
           Update title
        */

        if (headerTitle) {

            headerTitle.textContent =
                pageTitles[sectionKey] ||
                "EduCore Admin";

        }


        /*
           Close mobile sidebar
        */

        if (isMobile()) {

            closeSidebar();

        }


        /*
           Scroll content to top
        */

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    /* =====================================================
       SIDEBAR NAVIGATION
    ===================================================== */

    navItems.forEach(item => {

        item.addEventListener(
            "click",
            event => {

                event.preventDefault();

                const sectionKey =
                    getNavigationKey(item);

                showSection(
                    sectionKey
                );

            }
        );

    });


    /* =====================================================
       INITIAL SECTION
    ===================================================== */

    const activeNav =
        app.querySelector(
            ".nav-item.active"
        );


    let initialSection =
        "overview";


    if (activeNav) {

        const detected =
            getNavigationKey(
                activeNav
            );

        if (detected) {

            initialSection =
                detected;

        }

    }


    showSection(
        initialSection
    );


    /* =====================================================
       COURSE DATA
    ===================================================== */

    let courses = [

        {
            id: 1,
            title: "English Beginner",
            description:
                "English language course for beginners.",
            category: "Language",
            level: "Beginner",
            status: "published",
            updated: "Today"
        },

        {
            id: 2,
            title: "English Intermediate",
            description:
                "Develop your English communication skills.",
            category: "Language",
            level: "Intermediate",
            status: "published",
            updated: "Yesterday"
        },

        {
            id: 3,
            title: "Business English",
            description:
                "Professional English for the workplace.",
            category: "Business",
            level: "Upper-Intermediate",
            status: "draft",
            updated: "3 days ago"
        }

    ];


    /* =====================================================
       RENDER COURSES
    ===================================================== */

    function renderCourses() {

        if (!coursesList) {
            return;
        }


        const searchValue =
            courseSearch
                ? courseSearch.value
                    .trim()
                    .toLowerCase()
                : "";


        const filterValue =
            courseFilter
                ? courseFilter.value
                : "all";


        let filteredCourses =
            courses.filter(course => {


                const matchesSearch =
                    !searchValue ||
                    course.title
                        .toLowerCase()
                        .includes(searchValue) ||
                    course.description
                        .toLowerCase()
                        .includes(searchValue);


                const matchesFilter =
                    filterValue === "all" ||
                    course.status === filterValue;


                return (
                    matchesSearch &&
                    matchesFilter
                );

            });


        /*
           Empty state
        */

        if (
            filteredCourses.length === 0
        ) {

            coursesList.innerHTML = `

                <div class="courses-empty">

                    <div class="courses-empty-icon">
                        ▣
                    </div>

                    <h3>
                        No courses found
                    </h3>

                    <p>
                        There are no courses matching your search.
                    </p>

                    <button
                        type="button"
                        class="primary-button"
                        data-action="create-course"
                    >
                        Create Course
                    </button>

                </div>

            `;

            updateCourseCount(0);

            return;

        }


        coursesList.innerHTML =
            filteredCourses
                .map(course =>
                    createCourseRow(course)
                )
                .join("");


        updateCourseCount(
            filteredCourses.length
        );

    }


    /* =====================================================
       COURSE ROW
    ===================================================== */

    function createCourseRow(course) {

        const safeTitle =
            escapeHTML(course.title);

        const safeDescription =
            escapeHTML(
                course.description
            );

        const safeCategory =
            escapeHTML(
                course.category
            );

        const safeLevel =
            escapeHTML(
                course.level
            );


        return `

            <div
                class="course-row"
                data-course-id="${course.id}"
            >

                <div class="course-main">

                    <div class="course-cover">

                        <div
                            class="course-cover-placeholder"
                        >
                            ▣
                        </div>

                    </div>


                    <div class="course-info">

                        <div class="course-title">
                            ${safeTitle}
                        </div>

                        <div class="course-description">
                            ${safeDescription}
                        </div>

                    </div>

                </div>


                <div class="course-category">
                    ${safeCategory}
                </div>


                <div class="course-level">
                    ${safeLevel}
                </div>


                <div>

                    <span
                        class="course-status ${course.status}"
                    >
                        ${course.status}
                    </span>

                </div>


                <div class="course-updated">
                    ${escapeHTML(course.updated)}
                </div>


                <div class="course-actions">

                    <button
                        type="button"
                        class="course-action"
                        data-action="edit-course"
                        data-course-id="${course.id}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="course-action danger"
                        data-action="delete-course"
                        data-course-id="${course.id}"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `;

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    /* =====================================================
       COURSE COUNT
    ===================================================== */

    function updateCourseCount(count) {

        if (!courseCount) {
            return;
        }


        courseCount.textContent =
            `${count} ${
                count === 1
                    ? "course"
                    : "courses"
            }`;

    }


    /* =====================================================
       COURSE SEARCH
    ===================================================== */

    if (courseSearch) {

        courseSearch.addEventListener(
            "input",
            renderCourses
        );

    }


    if (courseFilter) {

        courseFilter.addEventListener(
            "change",
            renderCourses
        );

    }


    /* =====================================================
       INITIAL COURSES
    ===================================================== */

    renderCourses();


    /* =====================================================
       CREATE COURSE MODAL
    ===================================================== */

    function openCourseModal() {

        if (!modalOverlay) {
            return;
        }


        modalOverlay.classList.add(
            "open"
        );


        document.body.classList.add(
            "modal-open"
        );


        const firstField =
            courseForm
                ? courseForm.querySelector(
                    "input:not([type='hidden']), textarea, select"
                )
                : null;


        if (firstField) {

            setTimeout(() => {

                firstField.focus();

            }, 100);

        }

    }


    function closeCourseModal() {

        if (!modalOverlay) {
            return;
        }


        modalOverlay.classList.remove(
            "open"
        );


        document.body.classList.remove(
            "modal-open"
        );

    }


    /* =====================================================
       CREATE COURSE BUTTONS
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "#create-course-btn, " +
                    "[data-action='create-course']"
                );


            if (!button) {
                return;
            }


            event.preventDefault();

            openCourseModal();

        }
    );


    /* =====================================================
       CLOSE COURSE MODAL
    ===================================================== */

    if (modalClose) {

        modalClose.addEventListener(
            "click",
            event => {

                event.preventDefault();

                closeCourseModal();

            }
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                closeCourseModal();

            }
        );

    }


    /* =====================================================
       CLICK OUTSIDE COURSE MODAL
    ===================================================== */

    if (modalOverlay) {

        modalOverlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modalOverlay
                ) {

                    closeCourseModal();

                }

            }
        );

    }


    /* =====================================================
       COURSE FORM
    ===================================================== */

    if (courseForm) {

        courseForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const formData =
                    new FormData(
                        courseForm
                    );


                const title =
                    formData
                        .get("title")
                        .trim();


                const description =
                    formData
                        .get("description")
                        .trim();


                const category =
                    formData.get(
                        "category"
                    );


                const level =
                    formData.get(
                        "level"
                    );


                const status =
                    formData.get(
                        "status"
                    );


                const error =
                    document.getElementById(
                        "course-form-error"
                    );


                if (
                    !title ||
                    !description ||
                    !category ||
                    !level
                ) {

                    if (error) {

                        error.textContent =
                            "Please complete all required fields.";

                        error.classList.add(
                            "visible"
                        );

                    }

                    return;

                }


                if (error) {

                    error.classList.remove(
                        "visible"
                    );

                }


                const newCourse = {

                    id:
                        Date.now(),

                    title:
                        title,

                    description:
                        description,

                    category:
                        category,

                    level:
                        level,

                    status:
                        status,

                    updated:
                        "Just now"

                };


                courses.unshift(
                    newCourse
                );


                renderCourses();

                updateDashboardStats();


                courseForm.reset();

                closeCourseModal();


                showNotification(
                    "Course created successfully."
                );

            }
        );

    }


    /* =====================================================
       COURSE ACTIONS
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".course-action"
                );


            if (!button) {
                return;
            }


            const courseId =
                Number(
                    button.dataset.courseId
                );


            if (
                button.dataset.action ===
                "delete-course"
            ) {

                const course =
                    courses.find(
                        item =>
                            item.id === courseId
                    );


                if (!course) {
                    return;
                }


                showConfirmation(
                    `Are you sure you want to delete "${course.title}"?`,
                    () => {

                        courses =
                            courses.filter(
                                item =>
                                    item.id !== courseId
                            );


                        renderCourses();

                        updateDashboardStats();


                        showNotification(
                            "Course deleted."
                        );

                    }
                );

            }


            if (
                button.dataset.action ===
                "edit-course"
            ) {

                showNotification(
                    "Course editing is not connected yet."
                );

            }

        }
    );


    /* =====================================================
       CONFIRMATION MODAL
    ===================================================== */

    let confirmationCallback =
        null;


    function createConfirmationModal() {

        let modal =
            document.getElementById(
                "admin-confirmation-modal"
            );


        if (modal) {
            return modal;
        }


        modal =
            document.createElement(
                "div"
            );


        modal.id =
            "admin-confirmation-modal";


        modal.className =
            "modal-overlay";


        modal.innerHTML = `

            <div
                class="course-modal"
                role="dialog"
                aria-modal="true"
                style="max-width:430px;"
            >

                <div class="modal-header">

                    <div>

                        <div class="modal-kicker">
                            CONFIRMATION
                        </div>

                        <h2>
                            Are you sure?
                        </h2>

                    </div>


                    <button
                        type="button"
                        class="modal-close confirmation-close"
                    >
                        ×
                    </button>

                </div>


                <div
                    style="
                        padding:24px;
                        color:#7d8089;
                        font-size:12px;
                        line-height:1.6;
                    "
                >

                    <p id="confirmation-message">
                        Are you sure?
                    </p>


                    <div
                        class="modal-footer"
                        style="margin-top:20px;"
                    >

                        <button
                            type="button"
                            class="secondary-button confirmation-cancel"
                        >
                            Cancel
                        </button>


                        <button
                            type="button"
                            class="primary-button confirmation-confirm"
                        >
                            Confirm
                        </button>

                    </div>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        return modal;

    }


    function showConfirmation(
        message,
        callback
    ) {

        const modal =
            createConfirmationModal();


        const messageElement =
            modal.querySelector(
                "#confirmation-message"
            );


        if (messageElement) {

            messageElement.textContent =
                message;

        }


        confirmationCallback =
            callback;


        modal.classList.add(
            "open"
        );


        document.body.classList.add(
            "modal-open"
        );

    }


    function closeConfirmation() {

        const modal =
            document.getElementById(
                "admin-confirmation-modal"
            );


        if (!modal) {
            return;
        }


        modal.classList.remove(
            "open"
        );


        confirmationCallback =
            null;


        if (
            !modalOverlay ||
            !modalOverlay.classList.contains(
                "open"
            )
        ) {

            document.body.classList.remove(
                "modal-open"
            );

        }

    }


    document.addEventListener(
        "click",
        event => {

            const target =
                event.target;


            if (
                target.classList.contains(
                    "confirmation-cancel"
                ) ||
                target.classList.contains(
                    "confirmation-close"
                )
            ) {

                closeConfirmation();

                return;

            }


            if (
                target.classList.contains(
                    "confirmation-confirm"
                )
            ) {

                const callback =
                    confirmationCallback;


                closeConfirmation();


                if (
                    typeof callback ===
                    "function"
                ) {

                    callback();

                }

            }

        }
    );


    /* =====================================================
       LOGOUT
    ===================================================== */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            event => {

                event.preventDefault();


                showConfirmation(
                    "Are you sure you want to log out?",
                    () => {

                        closeSidebar();

                        closeCourseModal();

                        showNotification(
                            "Logged out."
                        );

                    }
                );

            }
        );

    }


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {

                return;

            }


            /*
               Confirmation first
            */

            const confirmation =
                document.getElementById(
                    "admin-confirmation-modal"
                );


            if (
                confirmation &&
                confirmation.classList.contains(
                    "open"
                )
            ) {

                closeConfirmation();

                return;

            }


            /*
               Course modal
            */

            if (
                modalOverlay &&
                modalOverlay.classList.contains(
                    "open"
                )
            ) {

                closeCourseModal();

                return;

            }


            /*
               Mobile sidebar
            */

            if (
                app.classList.contains(
                    "sidebar-open"
                )
            ) {

                closeSidebar();

            }

        }
    );


    /* =====================================================
       DASHBOARD STATISTICS
    ===================================================== */

    function updateDashboardStats() {

        const totalCourses =
            document.getElementById(
                "total-courses"
            );


        const publishedCourses =
            document.getElementById(
                "published-courses"
            );


        const draftCourses =
            document.getElementById(
                "draft-courses"
            );


        if (totalCourses) {

            totalCourses.textContent =
                courses.length;

        }


        if (publishedCourses) {

            publishedCourses.textContent =
                courses.filter(
                    course =>
                        course.status ===
                        "published"
                ).length;

        }


        if (draftCourses) {

            draftCourses.textContent =
                courses.filter(
                    course =>
                        course.status ===
                        "draft"
                ).length;

        }

    }


    updateDashboardStats();


    /* =====================================================
       NOTIFICATION
    ===================================================== */

    function showNotification(
        message
    ) {

        let notification =
            document.getElementById(
                "admin-notification"
            );


        if (!notification) {

            notification =
                document.createElement(
                    "div"
                );


            notification.id =
                "admin-notification";


            notification.style.cssText = `

                position:fixed;

                right:24px;
                bottom:24px;

                z-index:5000;

                max-width:320px;

                padding:13px 17px;

                border-radius:10px;

                background:#20242c;

                color:white;

                font-size:11px;

                font-weight:600;

                box-shadow:
                    0 12px 30px rgba(0,0,0,.18);

                opacity:0;

                transform:translateY(10px);

                transition:
                    opacity .2s ease,
                    transform .2s ease;

            `;


            document.body.appendChild(
                notification
            );

        }


        notification.textContent =
            message;


        requestAnimationFrame(
            () => {

                notification.style.opacity =
                    "1";

                notification.style.transform =
                    "translateY(0)";

            }
        );


        clearTimeout(
            notification._timeout
        );


        notification._timeout =
            setTimeout(
                () => {

                    notification.style.opacity =
                        "0";

                    notification.style.transform =
                        "translateY(10px)";

                },
                3000
            );

    }


    /* =====================================================
       RESIZE
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (!isMobile()) {

                closeSidebar();

            }

        }
    );


    /* =====================================================
       INITIAL STATE
    ===================================================== */

    closeSidebar();

    updateDashboardStats();

    renderCourses();


    console.log(
        "EduCore Admin initialized successfully."
    );

});
                        
