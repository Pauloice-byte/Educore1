
/* =========================================================
   INITIALIZE ADMIN APPLICATION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /*
     * IMPORTANT:
     *
     * The admin dashboard must never load for:
     *
     * 1. Unauthenticated users
     * 2. Students
     * 3. Inactive users
     *
     * requireAdmin() already handles all of this.
     */

    const authorized = await requireAdmin();


    if (!authorized) {
        return;
    }


    /*
     * The user has successfully passed
     * the Phase 2 admin security check.
     */

    initializeAdminNavigation();

    initializeSidebar();

    initializeLogout();

    await initializeAdminUser();

});


/* =========================================================
   NAVIGATION
========================================================= */

function initializeAdminNavigation() {

    const navigationItems =
        document.querySelectorAll(".nav-item");

    const sections =
        document.querySelectorAll(".admin-section");

    const pageTitle =
        document.getElementById("page-title");


    navigationItems.forEach(item => {

        item.addEventListener("click", () => {

            const targetSection =
                item.dataset.section;


            if (!targetSection) {
                return;
            }


            /*
             * Remove active state
             * from every navigation item.
             */

            navigationItems.forEach(navItem => {

                navItem.classList.remove("active");

            });


            /*
             * Activate clicked navigation item.
             */

            item.classList.add("active");


            /*
             * Hide every section.
             */

            sections.forEach(section => {

                section.classList.remove("active");

            });


            /*
             * Find requested section.
             */

            const target =
                document.getElementById(
                    `section-${targetSection}`
                );


            /*
             * Show requested section.
             */

            if (target) {

                target.classList.add("active");

            }


            /*
             * Update page title.
             */

            const label =
                item.querySelector(".nav-label");


            if (label && pageTitle) {

                pageTitle.textContent =
                    label.textContent.trim();

            }


            /*
             * Close mobile sidebar
             * after selecting a page.
             */

            document
                .getElementById("admin-app")
                ?.classList.remove("sidebar-open");

        });

    });

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function initializeSidebar() {

    const toggle =
        document.getElementById("sidebar-toggle");

    const app =
        document.getElementById("admin-app");


    if (!toggle || !app) {
        return;
    }


    toggle.addEventListener("click", () => {

        app.classList.toggle("sidebar-open");

    });

}


/* =========================================================
   ADMIN USER
========================================================= */

async function initializeAdminUser() {

    const nameElement =
        document.getElementById("admin-name");

    const avatarElement =
        document.getElementById("admin-avatar");


    if (!nameElement || !avatarElement) {
        return;
    }


    /*
     * Get the authenticated user's profile.
     *
     * getCurrentProfile() comes from auth.js.
     */

    const profile =
        await getCurrentProfile();


    if (!profile) {
        return;
    }


    /*
     * Display the administrator's name.
     */

    const fullName =
        profile.full_name?.trim();


    if (fullName) {

        nameElement.textContent =
            fullName;


        /*
         * Use the first letter of the
         * administrator's name as the avatar.
         */

        avatarElement.textContent =
            fullName
                .charAt(0)
                .toUpperCase();

    } else {

        nameElement.textContent =
            "Admin";

        avatarElement.textContent =
            "A";

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function initializeLogout() {

    const logoutButton =
        document.getElementById("admin-logout");


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        async () => {

            /*
             * Prevent multiple clicks
             * while logout is processing.
             */

            logoutButton.disabled = true;


            try {

                await logoutUser();

            } catch (error) {

                console.error(
                    "Admin logout failed:",
                    error
                );


                logoutButton.disabled = false;

            }

        }
    );

}