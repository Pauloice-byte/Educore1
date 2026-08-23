/* =========================================================
   EDUCORE ADMIN DASHBOARD
   STANDALONE INTERFACE JAVASCRIPT
   No Supabase
   No authentication
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const app = document.getElementById("admin-app");

    if (!app) {
        console.error("EduCore Admin: #admin-app not found.");
        return;
    }

    const sidebar = app.querySelector(".admin-sidebar");
    const sidebarToggle = app.querySelector(".sidebar-toggle");
    const sidebarClose = app.querySelector(".mobile-sidebar-close");
    const sidebarOverlay = app.querySelector(".sidebar-overlay");

    const navItems = app.querySelectorAll(".nav-item");

    const sections = app.querySelectorAll(".admin-section");

    const headerTitle = app.querySelector(".header-title h1");

    const modalOverlay = app.querySelector(".modal-overlay");
    const modalClose = app.querySelector(".modal-close");

    const courseForm = document.getElementById("course-form");

    const cancelButton = app.querySelector(
        ".modal-footer .secondary-button"
    );

    const createCourseButtons = app.querySelectorAll(
        "#create-course-btn, " +
        ".create-course-button, " +
        "[data-action='create-course']"
    );

    const logoutButton = app.querySelector(".logout-button");


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
        } else {
            app.classList.toggle("sidebar-collapsed");
        }
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


    /*
       IMPORTANT:
       This is the actual mapping between the sidebar
       buttons and the content sections.
    */

    const navigationMap = {

        overview: "overview-section",

        courses: "courses-section",

        students: "students-section",

        progress: "progress-section",

        media: "media-section",

        settings: "settings-section"

    };


    /*
       Convert any sidebar button into a navigation key.
    */

    function getNavigationKey(item) {

        if (!item) {
            return null;
        }


        /*
           Preferred:
           data-section="courses"
        */

        if (item.dataset.section) {

            return item.dataset.section
                .trim()
                .toLowerCase();
        }


        /*
           Alternative:
           data-page="courses"
        */

        if (item.dataset.page) {

            return item.dataset.page
                .trim()
                .toLowerCase();
        }


        /*
           Alternative:
           href="#courses"
        */

        const href = item.getAttribute("href");

        if (href && href.startsWith("#")) {

            return href
                .substring(1)
                .replace("-section", "")
                .trim()
                .toLowerCase();
        }


        /*
           Alternative:
           id="courses-btn"
        */

        if (item.id) {

            return item.id
                .replace("-btn", "")
                .replace("-button", "")
                .replace("-nav", "")
                .trim()
                .toLowerCase();
        }


        return null;
    }


    /*
       Find the actual content section.
    */

    function getSectionForKey(key) {

        if (!key) {
            return null;
        }


        const expectedId =
            navigationMap[key];


        if (expectedId) {

            const section =
                document.getElementById(expectedId);

            if (section) {
                return section;
            }
        }


        /*
           Fallback for sections using:
           data-section="courses"
        */

        const matchingSection =
            app.querySelector(
                `.admin-section[data-section="${key}"]`
            );

        if (matchingSection) {
            return matchingSection;
        }


        /*
           Fallback for:
           data-page="courses"
        */

        const matchingPage =
            app.querySelector(
                `.admin-section[data-page="${key}"]`
            );

        if (matchingPage) {
            return matchingPage;
        }


        return null;
    }


    /*
       SHOW SECTION
    */

    function showSection(sectionKey) {

        if (!sectionKey) {
            sectionKey = "overview";
        }


        sectionKey =
            sectionKey.toLowerCase();


        /*
           If an unknown navigation item was clicked,
           don't destroy the current page.
        */

        if (!pageTitles[sectionKey]) {

            console.warn(
                "EduCore Admin: Unknown section:",
                sectionKey
            );

            return;
        }


        const targetSection =
            getSectionForKey(sectionKey);


        /*
           Remove active from ALL sections first.
        */

        sections.forEach(section => {

            section.classList.remove("active");

            section.setAttribute(
                "aria-hidden",
                "true"
            );
        });


        /*
           Activate requested section.
        */

        if (targetSection) {

            targetSection.classList.add("active");

            targetSection.setAttribute(
                "aria-hidden",
                "false"
            );
        }


        /*
           Update sidebar active state.
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
           Update header title.
        */

        if (headerTitle) {

            headerTitle.textContent =
                pageTitles[sectionKey];
        }


        /*
           Update browser URL hash.
           This does NOT reload the page.
        */

        if (
            window.location.hash !==
            "#" + sectionKey
        ) {

            history.replaceState(
                null,
                "",
                "#" + sectionKey
            );
        }


        /*
           Close mobile sidebar.
        */

        if (isMobile()) {
            closeSidebar();
        }


        /*
           Scroll to top.
        */

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        console.log(
            "EduCore Admin section:",
            sectionKey
        );
    }


    /*
       SIDEBAR NAVIGATION CLICK
    */

    navItems.forEach(item => {

        item.addEventListener("click", (event) => {

            event.preventDefault();

            const sectionKey =
                getNavigationKey(item);

            showSection(sectionKey);
        });
    });


    /* =====================================================
       INITIAL SECTION
    ===================================================== */

    let initialSection = "overview";


    /*
       If URL is:
       admin.html#courses

       open Courses automatically.
    */

    const hash =
        window.location.hash
            .replace("#", "")
            .trim()
            .toLowerCase();


    if (hash && pageTitles[hash]) {

        initialSection = hash;

    } else {

        /*
           Otherwise use whichever sidebar item
           is marked active in the HTML.
        */

        const activeNav =
            app.querySelector(
                ".nav-item.active"
            );

        if (activeNav) {

            const activeKey =
                getNavigationKey(activeNav);

            if (activeKey && pageTitles[activeKey]) {

                initialSection = activeKey;
            }
        }
    }


    showSection(initialSection);


    /* =====================================================
       CREATE COURSE MODAL
    ===================================================== */

    function openCourseModal() {

        if (!modalOverlay) {
            return;
        }


        modalOverlay.classList.add("open");

        document.body.classList.add(
            "modal-open"
        );


        /*
           Focus first form field.
        */

        if (courseForm) {

            const firstField =
                courseForm.querySelector(
                    "input:not([type='hidden']), textarea, select"
                );

            if (firstField) {

                setTimeout(() => {

                    firstField.focus();

                }, 100);
            }
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


    /*
       CREATE COURSE BUTTONS
    */

    createCourseButtons.forEach(button => {

        button.addEventListener("click", (event) => {

            event.preventDefault();

            openCourseModal();
        });
    });


    /*
       MODAL CLOSE BUTTON
    */

    if (modalClose) {

        modalClose.addEventListener("click", (event) => {

            event.preventDefault();

            closeCourseModal();
        });
    }


    /*
       CANCEL
    */

    if (cancelButton) {

        cancelButton.addEventListener("click", (event) => {

            event.preventDefault();

            closeCourseModal();
        });
    }


    /*
       CLICK OUTSIDE MODAL
    */

    if (modalOverlay) {

        modalOverlay.addEventListener("click", (event) => {

            if (event.target === modalOverlay) {

                closeCourseModal();
            }
        });
    }


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener("keydown", (event) => {

        if (event.key !== "Escape") {
            return;
        }


        /*
           Close confirmation first.
        */

        const confirmation =
            document.getElementById(
                "admin-confirmation-modal"
            );


        if (
            confirmation &&
            confirmation.classList.contains("open")
        ) {

            closeConfirmation();

            return;
        }


        /*
           Then course modal.
        */

        if (
            modalOverlay &&
            modalOverlay.classList.contains("open")
        ) {

            closeCourseModal();

            return;
        }


        /*
           Finally mobile sidebar.
        */

        if (
            app.classList.contains(
                "sidebar-open"
            )
        ) {

            closeSidebar();
        }
    });


    /* =====================================================
       COURSE FORM
    ===================================================== */

    if (courseForm) {

        courseForm.addEventListener(
            "submit",
            (event) => {

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


                const course = {};


                formData.forEach(
                    (value, key) => {

                        course[key] = value;
                    }
                );


                console.log(
                    "Course created locally:",
                    course
                );


                closeCourseModal();

                courseForm.reset();


                showNotification(
                    "Course created successfully."
                );
            }
        );
    }


    /* =====================================================
       CONFIRMATION MODAL
    ===================================================== */

    let confirmationCallback = null;


    function createConfirmationModal() {

        let confirmation =
            document.getElementById(
                "admin-confirmation-modal"
            );


        if (confirmation) {
            return confirmation;
        }


        confirmation =
            document.createElement("div");

        confirmation.id =
            "admin-confirmation-modal";

        confirmation.className =
            "modal-overlay";


        confirmation.innerHTML = `

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
                        aria-label="Close"
                    >
                        ×
                    </button>

                </div>

                <div style="
                    padding:24px;
                    color:#7d8089;
                    font-size:12px;
                    line-height:1.6;
                ">

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
            confirmation
        );


        return confirmation;
    }


    function showConfirmation(
        message,
        callback
    ) {

        const confirmation =
            createConfirmationModal();


        const messageElement =
            confirmation.querySelector(
                "#confirmation-message"
            );


        if (messageElement) {

            messageElement.textContent =
                message;
        }


        confirmationCallback =
            callback || null;


        confirmation.classList.add("open");

        document.body.classList.add(
            "modal-open"
        );
    }


    function closeConfirmation() {

        const confirmation =
            document.getElementById(
                "admin-confirmation-modal"
            );


        if (!confirmation) {
            return;
        }


        confirmation.classList.remove(
            "open"
        );


        if (
            !modalOverlay ||
            !modalOverlay.classList.contains("open")
        ) {

            document.body.classList.remove(
                "modal-open"
            );
        }


        confirmationCallback = null;
    }


    /*
       Confirmation controls.
    */

    document.addEventListener(
        "click",
        (event) => {

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


    /*
       Close confirmation by clicking background.
    */

    document.addEventListener(
        "click",
        (event) => {

            const confirmation =
                document.getElementById(
                    "admin-confirmation-modal"
                );


            if (
                confirmation &&
                event.target === confirmation
            ) {

                closeConfirmation();
            }
        }
    );


    /* =====================================================
       DELETE COURSE
    ===================================================== */

    document.addEventListener(
        "click",
        (event) => {

            const button =
                event.target.closest(
                    ".course-action.danger"
                );


            if (!button) {
                return;
            }


            event.preventDefault();


            const row =
                button.closest(
                    ".course-row"
                );


            let courseName =
                "this course";


            if (row) {

                const title =
                    row.querySelector(
                        ".course-title"
                    );


                if (
                    title &&
                    title.textContent.trim()
                ) {

                    courseName =
                        `"${title.textContent.trim()}"`;
                }
            }


            showConfirmation(
                `Are you sure you want to delete ${courseName}?`,
                () => {

                    if (row) {

                        row.remove();

                        showNotification(
                            "Course deleted."
                        );
                    }
                }
            );
        }
    );


    /* =====================================================
       LOGOUT
    ===================================================== */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            (event) => {

                event.preventDefault();


                showConfirmation(
                    "Are you sure you want to log out?",
                    () => {

                        closeSidebar();

                        closeCourseModal();

                        showNotification(
                            "Logged out."
                        );


                        console.log(
                            "EduCore interface logout."
                        );
                    }
                );
            }
        );
    }


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
       INITIAL STATE
    ===================================================== */

    closeSidebar();


    console.log(
        "EduCore Admin interface initialized."
    );

});
