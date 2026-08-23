/* =========================================================
   EDUCORE ADMIN DASHBOARD
   STANDALONE INTERFACE JAVASCRIPT

   No Supabase
   No authentication
   No backend
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       APP
    ===================================================== */

    const app = document.getElementById("admin-app");

    if (!app) {
        console.error("EduCore Admin: #admin-app not found.");
        return;
    }


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const sidebar = app.querySelector(".admin-sidebar");
    const sidebarToggle = app.querySelector(".sidebar-toggle");
    const sidebarClose = app.querySelector(".mobile-sidebar-close");
    const sidebarOverlay = app.querySelector(".sidebar-overlay");

    const navItems = app.querySelectorAll(".nav-item");
    const sections = app.querySelectorAll(".admin-section");

    const headerTitle = app.querySelector(".header-title h1");

    const modalOverlay = document.getElementById(
        "course-modal-overlay"
    );

    const modalClose = modalOverlay
        ? modalOverlay.querySelector(".modal-close")
        : null;

    const courseForm = document.getElementById(
        "course-form"
    );

    const cancelButton = courseForm
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
        document.getElementById("courses-list");

    const courseSearch =
        document.getElementById("course-search");

    const courseFilter =
        document.getElementById("course-filter");


    /* =====================================================
       STATE
    ===================================================== */

    let courses = [
        {
            id: 1,
            title: "English Beginner",
            description: "English language course for beginners.",
            category: "Language",
            level: "Beginner",
            status: "published",
            updated: "Today"
        },
        {
            id: 2,
            title: "English Intermediate",
            description: "Develop your English communication skills.",
            category: "Language",
            level: "Intermediate",
            status: "published",
            updated: "Yesterday"
        },
        {
            id: 3,
            title: "Business English",
            description: "Professional English for the workplace.",
            category: "Business",
            level: "Upper-Intermediate",
            status: "draft",
            updated: "2 days ago"
        }
    ];


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
            app.classList.add("sidebar-open");
        }
    }


    function closeSidebar() {

        app.classList.remove("sidebar-open");
    }


    function toggleSidebar() {

        if (isMobile()) {

            app.classList.toggle("sidebar-open");

            return;
        }

        app.classList.toggle("sidebar-collapsed");
    }


    if (sidebarToggle) {

        sidebarToggle.addEventListener("click", (event) => {

            event.preventDefault();

            toggleSidebar();
        });
    }


    if (sidebarClose) {

        sidebarClose.addEventListener("click", (event) => {

            event.preventDefault();

            closeSidebar();
        });
    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener("click", () => {

            closeSidebar();
        });
    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    const pageTitles = {
        overview: "Overview",
        courses: "Courses",
        students: "Students",
        progress: "Progress",
        media: "Media",
        settings: "Settings"
    };


    function getNavigationKey(item) {

        if (!item) {
            return "";
        }

        const dataSection =
            item.getAttribute("data-section");

        if (dataSection) {
            return dataSection.toLowerCase();
        }


        const dataPage =
            item.getAttribute("data-page");

        if (dataPage) {
            return dataPage.toLowerCase();
        }


        const href =
            item.getAttribute("href");

        if (href && href.startsWith("#")) {

            return href
                .substring(1)
                .replace("-section", "")
                .toLowerCase();
        }


        return "";
    }


    function getSectionKey(section) {

        if (!section) {
            return "";
        }

        const dataSection =
            section.getAttribute("data-section");

        if (dataSection) {
            return dataSection.toLowerCase();
        }


        const dataPage =
            section.getAttribute("data-page");

        if (dataPage) {
            return dataPage.toLowerCase();
        }


        const id =
            section.getAttribute("id") || "";

        return id
            .replace("-section", "")
            .toLowerCase();
    }


    function showSection(sectionKey) {

        if (!sectionKey) {
            return;
        }


        sectionKey =
            sectionKey.toLowerCase();


        let foundSection = false;


        /* ---------------------------------------------
           Show correct section
        --------------------------------------------- */

        sections.forEach(section => {

            const sectionKeyFromHTML =
                getSectionKey(section);

            const isTarget =
                sectionKeyFromHTML === sectionKey;

            section.classList.toggle(
                "active",
                isTarget
            );

            if (isTarget) {
                foundSection = true;
            }
        });


        /* ---------------------------------------------
           Active sidebar item
        --------------------------------------------- */

        navItems.forEach(item => {

            const itemKey =
                getNavigationKey(item);

            item.classList.toggle(
                "active",
                itemKey === sectionKey
            );
        });


        /* ---------------------------------------------
           Header title
        --------------------------------------------- */

        if (headerTitle) {

            headerTitle.textContent =
                pageTitles[sectionKey] ||
                sectionKey;
        }


        /* ---------------------------------------------
           Close mobile sidebar
        --------------------------------------------- */

        if (isMobile()) {
            closeSidebar();
        }


        /* ---------------------------------------------
           Scroll content to top
        --------------------------------------------- */

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        if (!foundSection) {

            console.warn(
                "EduCore Admin: No section found for:",
                sectionKey
            );
        }
    }


    navItems.forEach(item => {

        item.addEventListener("click", event => {

            event.preventDefault();

            const sectionKey =
                getNavigationKey(item);

            showSection(sectionKey);
        });
    });


    /* =====================================================
       INITIAL PAGE
    ===================================================== */

    const activeNav =
        app.querySelector(
            ".nav-item.active"
        );


    if (activeNav) {

        showSection(
            getNavigationKey(activeNav)
        );

    } else {

        showSection("overview");
    }


    /* =====================================================
       COURSE MODAL
    ===================================================== */

    function openCourseModal() {

        if (!modalOverlay) {
            return;
        }

        modalOverlay.classList.add("open");

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

        modalOverlay.classList.remove("open");

        document.body.classList.remove(
            "modal-open"
        );
    }


    if (createCourseButton) {

        createCourseButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openCourseModal();
            }
        );
    }


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
                    event.target === modalOverlay
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


                const formError =
                    courseForm.querySelector(
                        ".form-error"
                    );


                if (formError) {
                    formError.classList.remove(
                        "visible"
                    );
                }


                const formData =
                    new FormData(courseForm);


                const title =
                    String(
                        formData.get("title") || ""
                    ).trim();


                if (!title) {

                    if (formError) {

                        formError.textContent =
                            "Please enter a course title.";

                        formError.classList.add(
                            "visible"
                        );
                    }

                    return;
                }


                const newCourse = {

                    id:
                        Date.now(),

                    title:
                        title,

                    description:
                        String(
                            formData.get(
                                "description"
                            ) || ""
                        ),

                    category:
                        String(
                            formData.get(
                                "category"
                            ) || "Language"
                        ),

                    level:
                        String(
                            formData.get(
                                "level"
                            ) || "Beginner"
                        ),

                    status:
                        String(
                            formData.get(
                                "status"
                            ) || "draft"
                        ),

                    updated:
                        "Just now"
                };


                courses.unshift(
                    newCourse
                );


                renderCourses();


                updateStatistics();


                courseForm.reset();


                closeCourseModal();


                showNotification(
                    "Course created successfully."
                );
            }
        );
    }


    /* =====================================================
       COURSE RENDERING
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
                        .includes(searchValue) ||
                    course.category
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


        if (filteredCourses.length === 0) {

            coursesList.innerHTML = `

                <div class="courses-empty">

                    <div class="courses-empty-icon">
                        ▣
                    </div>

                    <h3>
                        No courses found
                    </h3>

                    <p>
                        There are no courses matching your current search or filter.
                    </p>

                    <button
                        type="button"
                        class="primary-button create-course-button"
                    >
                        <span class="button-plus">+</span>
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

        const safeUpdated =
            escapeHTML(
                course.updated
            );


        return `

            <div
                class="course-row"
                data-course-id="${course.id}"
            >

                <div class="course-main">

                    <div class="course-cover">

                        <div class="course-cover-placeholder">
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
                    <span class="course-status ${course.status}">
                        ${escapeHTML(course.status)}
                    </span>
                </div>


                <div class="course-updated">
                    ${safeUpdated}
                </div>


                <div class="course-actions">

                    <button
                        type="button"
                        class="course-action"
                        data-action="edit"
                        data-course-id="${course.id}"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="course-action danger"
                        data-action="delete"
                        data-course-id="${course.id}"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `;
    }


    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function updateCourseCount(count) {

        const element =
            document.getElementById(
                "course-count"
            );


        if (!element) {
            return;
        }


        element.textContent =
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
       CREATE COURSE BUTTONS
       Including dynamically-created empty-state button
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".create-course-button"
                );


            if (!button) {
                return;
            }


            event.preventDefault();

            openCourseModal();
        }
    );


    /* =====================================================
       DELETE COURSE
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    '[data-action="delete"]'
                );


            if (!button) {
                return;
            }


            const courseId =
                Number(
                    button.dataset.courseId
                );


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

                    updateStatistics();


                    showNotification(
                        "Course deleted."
                    );
                }
            );
        }
    );


    /* =====================================================
       EDIT COURSE
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    '[data-action="edit"]'
                );


            if (!button) {
                return;
            }


            showNotification(
                "Course editing will be available here."
            );
        }
    );


    /* =====================================================
       STATISTICS
    ===================================================== */

    function updateStatistics() {

        const total =
            courses.length;


        const published =
            courses.filter(
                course =>
                    course.status === "published"
            ).length;


        const totalElement =
            document.getElementById(
                "stat-courses"
            );


        const activeElement =
            document.getElementById(
                "stat-active"
            );


        if (totalElement) {

            totalElement.textContent =
                total;
        }


        if (activeElement) {

            activeElement.textContent =
                published;
        }
    }


    /* =====================================================
       CONFIRMATION MODAL
    ===================================================== */

    let confirmationCallback = null;


    function createConfirmationModal() {

        let modal =
            document.getElementById(
                "admin-confirmation-modal"
            );


        if (modal) {
            return modal;
        }


        modal =
            document.createElement("div");


        modal.id =
            "admin-confirmation-modal";


        modal.className =
            "modal-overlay";


        modal.innerHTML = `

            <div
                class="course-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirmation-title"
                style="max-width:430px;"
            >

                <div class="modal-header">

                    <div>

                        <div class="modal-kicker">
                            CONFIRMATION
                        </div>

                        <h2 id="confirmation-title">
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
                        Are you sure you want to continue?
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


        confirmationCallback =
            null;
    }


    document.addEventListener(
        "click",
        event => {

            if (
                event.target.closest(
                    ".confirmation-cancel"
                ) ||
                event.target.closest(
                    ".confirmation-close"
                )
            ) {

                closeConfirmation();

                return;
            }


            if (
                event.target.closest(
                    ".confirmation-confirm"
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


            if (
                modalOverlay &&
                modalOverlay.classList.contains(
                    "open"
                )
            ) {

                closeCourseModal();

                return;
            }


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
       NOTIFICATION
    ===================================================== */

    function showNotification(message) {

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
                box-shadow:0 12px 30px rgba(0,0,0,.18);
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


        requestAnimationFrame(() => {

            notification.style.opacity =
                "1";

            notification.style.transform =
                "translateY(0)";
        });


        clearTimeout(
            notification._timeout
        );


        notification._timeout =
            setTimeout(() => {

                notification.style.opacity =
                    "0";

                notification.style.transform =
                    "translateY(10px)";

            }, 3000);
    }


    /* =====================================================
       RESIZE
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (!isMobile()) {

                app.classList.remove(
                    "sidebar-open"
                );
            }
        }
    );


    /* =====================================================
       INITIAL RENDER
    ===================================================== */

    renderCourses();

    updateStatistics();

    closeSidebar();


    console.log(
        "EduCore Admin initialized successfully."
    );

});

                          
