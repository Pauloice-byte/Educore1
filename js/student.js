javascript
// ============================================================
// EduCore — Student Dashboard
// ============================================================


document.addEventListener(
    "DOMContentLoaded",
    async () => {


        // ====================================================
        // ELEMENTS
        // ====================================================

        const studentName =
            document.getElementById(
                "studentName"
            );

        const coursesCount =
            document.getElementById(
                "coursesCount"
            );

        const lessonsCompleted =
            document.getElementById(
                "lessonsCompleted"
            );

        const overallProgress =
            document.getElementById(
                "overallProgress"
            );

        const learningStreak =
            document.getElementById(
                "learningStreak"
            );

        const year =
            document.getElementById(
                "year"
            );

        const menuButton =
            document.getElementById(
                "menuButton"
            );

        const sidebar =
            document.getElementById(
                "sidebar"
            );

        const backdrop =
            document.getElementById(
                "sidebarBackdrop"
            );

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        // ====================================================
        // YEAR
        // ====================================================

        if (year) {

            year.textContent =
                new Date().getFullYear();

        }


        // ====================================================
        // AUTHENTICATION
        // ====================================================

        const user =
            await getCurrentUser();


        if (!user) {

            window.location.href =
                "login.html";

            return;

        }


        // ====================================================
        // LOAD PROFILE
        // ====================================================

        const profile =
            await getCurrentProfile();


        if (!profile) {

            console.error(
                "EduCore: Student profile could not be loaded."
            );

            return;

        }


        // ====================================================
        // VERIFY STUDENT
        // ====================================================

        if (
            profile.role !== "student" ||
            profile.active !== true
        ) {

            if (
                profile.role === "admin"
            ) {

                window.location.href =
                    "admin.html";

            } else {

                await logoutUser();

            }

            return;

        }


        // ====================================================
        // STUDENT NAME
        // ====================================================

        if (studentName) {

            const name =
                profile.full_name ||
                user.email ||
                "Student";


            /*
             * Display the first name only.
             * Example:
             *
             * Paulo de Sousa
             *       ↓
             * Paulo
             */

            const firstName =
                name
                    .trim()
                    .split(/\s+/)[0];


            studentName.textContent =
                firstName ||
                "Student";

        }


        // ====================================================
        // INITIAL DASHBOARD VALUES
        // ====================================================
        //
        // These remain zero until we connect the dashboard
        // to the enrollment/progress tables.
        //
        // We deliberately do not invent student progress.
        // ====================================================

        if (coursesCount) {

            coursesCount.textContent =
                "0";

        }


        if (lessonsCompleted) {

            lessonsCompleted.textContent =
                "0";

        }


        if (overallProgress) {

            overallProgress.textContent =
                "0%";

        }


        if (learningStreak) {

            learningStreak.textContent =
                "0 days";

        }


        // ====================================================
        // SIDEBAR
        // ====================================================

        function openMobileSidebar() {

            if (sidebar) {

                sidebar.classList.add(
                    "mobile-open"
                );

            }


            if (backdrop) {

                backdrop.classList.add(
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


        if (
            menuButton &&
            sidebar
        ) {

            menuButton.addEventListener(
                "click",
                () => {

                    if (
                        window.innerWidth <=
                        768
                    ) {

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


                    /*
                     * Desktop:
                     * temporarily collapse the sidebar.
                     */

                    sidebar.classList.toggle(
                        "collapsed"
                    );

                }
            );

        }


        if (backdrop) {

            backdrop.addEventListener(
                "click",
                closeMobileSidebar
            );

        }


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeMobileSidebar();

                }

            }
        );


        window.addEventListener(
            "resize",
            () => {

                if (
                    window.innerWidth >
                    768
                ) {

                    closeMobileSidebar();

                }

            }
        );


        // ====================================================
        // PLACEHOLDER NAVIGATION
        // ====================================================

        document
            .querySelectorAll(
                '[data-placeholder="true"]'
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


        // ====================================================
        // LOGOUT
        // ====================================================

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                async () => {

                    logoutButton.disabled =
                        true;

                    logoutButton.style.opacity =
                        "0.6";


                    try {

                        await logoutUser();

                    } catch (error) {

                        console.error(
                            "EduCore: Logout failed:",
                            error
                        );


                        logoutButton.disabled =
                            false;

                        logoutButton.style.opacity =
                            "1";

                    }

                }
            );

        }


    }
);

