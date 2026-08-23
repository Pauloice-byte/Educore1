/* =========================================================
   EDUCORE ADMIN DASHBOARD
   STANDALONE INTERFACE JAVASCRIPT
   No Supabase
   No authentication
   No backend dependency
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const app = document.getElementById("admin-app");

    if (!app) {
        console.error("EduCore Admin: #admin-app was not found.");
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
    const courseModal = app.querySelector(".course-modal");

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
       MOBILE CHECK
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


    /* =====================================================
       CLICK OUTSIDE SIDEBAR
    ===================================================== */

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

        /*
           Supports:

           data-section="overview"

           data-page="overview"

           href="#overview"

           id="overview-btn"
        */

        let key = item.dataset.section ||
                  item.dataset.page;

        if (key) {
            return key.toLowerCase();
        }


        const href = item.getAttribute("href");

        if (href && href.startsWith("#")) {

            return href
                .substring(1)
                .replace("-section", "")
                .toLowerCase();
        }


        const id = item.id || "";

        return id
            .replace("-btn", "")
            .replace("-button", "")
            .toLowerCase();
    }


    function showSection(sectionKey) {

        if (!sectionKey) {
            return;
        }


        let targetSection = null;


        sections.forEach(section => {

            const sectionId = (
                section.dataset.section ||
                section.dataset.page ||
                section.id
            )
                .replace("-section", "")
                .toLowerCase();


            if (sectionId === sectionKey) {

                targetSection = section;
            }
        });


        /*
           If no matching section exists,
           don't break the navigation.
        */

        if (targetSection) {

            sections.forEach(section => {

                section.classList.remove("active");
            });

            targetSection.classList.add("active");
        }


        /*
           Active navigation item
        */

        navItems.forEach(item => {

            const itemKey = getNavigationKey(item);

            item.classList.toggle(
                "active",
                itemKey === sectionKey
            );
        });


        /*
           Header title
        */

        if (headerTitle) {

            headerTitle.textContent =
                pageTitles[sectionKey] ||
                sectionKey.charAt(0).toUpperCase() +
                sectionKey.slice(1);
        }


        /*
           Close mobile sidebar after navigation
        */

        if (isMobile()) {

            closeSidebar();
        }


        /*
           Scroll page back to top
        */

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    navItems.forEach(item => {

        item.addEventListener("click", (event) => {

            event.preventDefault();

            const sectionKey = getNavigationKey(item);

            showSection(sectionKey);
        });
    });


    /* =====================================================
       INITIAL SECTION
    ===================================================== */

    let initialSection = "overview";

    const activeNav = app.querySelector(".nav-item.active");

    if (activeNav) {

        initialSection = getNavigationKey(activeNav);
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

        document.body.classList.add("modal-open");

        /*
           Put focus on first form field
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

        document.body.classList.remove("modal-open");
    }


    createCourseButtons.forEach(button => {

        button.addEventListener("click", (event) => {

            event.preventDefault();

            openCourseModal();
        });
    });


    if (modalClose) {

        modalClose.addEventListener("click", (event) => {

            event.preventDefault();

            closeCourseModal();
        });
    }


    if (cancelButton) {

        cancelButton.addEventListener("click", (event) => {

            event.preventDefault();

            closeCourseModal();
        });
    }


    /* =====================================================
       CLICK MODAL BACKGROUND TO CLOSE
    ===================================================== */

    if (modalOverlay) {

        modalOverlay.addEventListener("click", (event) => {

            /*
               Only close when clicking the dark overlay,
               not the actual modal.
            */

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
           Close course modal first
        */

        if (
            modalOverlay &&
            modalOverlay.classList.contains("open")
        ) {

            closeCourseModal();

            return;
        }


        /*
           Otherwise close mobile sidebar
        */

        if (app.classList.contains("sidebar-open")) {

            closeSidebar();
        }
    });


    /* =====================================================
       COURSE FORM
    ===================================================== */

    if (courseForm) {

        courseForm.addEventListener("submit", (event) => {

            event.preventDefault();

            /*
               Interface only.

               No Supabase.
               No API.
               No authentication.

               The form simply demonstrates successful
               frontend submission.
            */

            const formError =
                courseForm.querySelector(".form-error");

            if (formError) {

                formError.classList.remove("visible");
            }


            /*
               Collect form values
            */

            const formData =
                new FormData(courseForm);

            const course = {};

            formData.forEach((value, key) => {

                course[key] = value;
            });


            console.log(
                "Course created locally:",
                course
            );


            /*
               Close modal
            */

            closeCourseModal();


            /*
               Reset form
            */

            courseForm.reset();


            /*
               Optional visual feedback
            */

            showNotification(
                "Course created successfully."
            );
        });
    }


    /* =====================================================
       CONFIRMATION MODAL
    ===================================================== */

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
                style="max-width: 430px;"
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
                    padding: 24px;
                    color: #7d8089;
                    font-size: 12px;
                    line-height: 1.6;
                ">

                    <p id="confirmation-message">
                        Are you sure you want to continue?
                    </p>


                    <div
                        class="modal-footer"
                        style="margin-top: 20px;"
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


        document.body.appendChild(confirmation);

        return confirmation;
    }


    let confirmationCallback = null;


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

        document.body.classList.add("modal-open");
    }


    function closeConfirmation() {

        const confirmation =
            document.getElementById(
                "admin-confirmation-modal"
            );


        if (!confirmation) {
            return;
        }


        confirmation.classList.remove("open");

        /*
           Only remove modal-open if the
           course modal isn't also open.
        */

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
       Confirmation buttons
    */

    document.addEventListener("click", (event) => {

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

            if (typeof callback === "function") {

                callback();
            }
        }
    });


    /* =====================================================
       DELETE / DANGER ACTIONS
    ===================================================== */

    document.addEventListener("click", (event) => {

        const button =
            event.target.closest(
                ".course-action.danger"
            );


        if (!button) {
            return;
        }


        event.preventDefault();


        const row =
            button.closest(".course-row");


        let courseName =
            "this course";


        if (row) {

            const title =
                row.querySelector(
                    ".course-title"
                );


            if (title && title.textContent.trim()) {

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
    });


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

                        /*
                           Interface-only logout.

                           No authentication system is
                           involved.

                           We simply return the interface
                           to its initial state.
                        */

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
                document.createElement("div");

            notification.id =
                "admin-notification";

            notification.style.cssText = `
                position: fixed;
                right: 24px;
                bottom: 24px;
                z-index: 5000;
                max-width: 320px;
                padding: 13px 17px;
                border-radius: 10px;
                background: #20242c;
                color: white;
                font-size: 11px;
                font-weight: 600;
                box-shadow: 0 12px 30px rgba(0,0,0,.18);
                opacity: 0;
                transform: translateY(10px);
                transition: opacity .2s ease,
                            transform .2s ease;
            `;

            document.body.appendChild(
                notification
            );
        }


        notification.textContent =
            message;


        requestAnimationFrame(() => {

            notification.style.opacity = "1";

            notification.style.transform =
                "translateY(0)";
        });


        clearTimeout(
            notification._timeout
        );


        notification._timeout =
            setTimeout(() => {

                notification.style.opacity = "0";

                notification.style.transform =
                    "translateY(10px)";

            }, 3000);
    }


    /* =====================================================
       RESIZE SAFETY
    ===================================================== */

    window.addEventListener("resize", () => {

        /*
           If we leave mobile while the sidebar
           is open, clean up the mobile state.
        */

        if (!isMobile()) {

            app.classList.remove(
                "sidebar-open"
            );
        }
    });


    /* =====================================================
       INITIAL STATE
    ===================================================== */

    closeSidebar();


    console.log(
        "EduCore Admin interface initialized."
    );

});
