// ============================================================
// EduCore — Admin Dashboard
// ============================================================


// ============================================================
// INITIALIZE ADMIN APPLICATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
         * Admin protection.
         */

        const authorized =
            await requireAdmin();

        if (!authorized) {
            return;
        }


        /*
         * Initialize interface.
         */

        initializeAdminNavigation();

        initializeSidebar();

        initializeLogout();

        await initializeAdminUser();

        await initializeDashboard();

    }
);


// ============================================================
// NAVIGATION
// ============================================================

function initializeAdminNavigation() {

    const navigationItems =
        document.querySelectorAll(
            ".admin-nav-item"
        );


    const sections =
        document.querySelectorAll(
            ".admin-section"
        );


    const pageTitle =
        document.getElementById(
            "page-title"
        );


    navigationItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                const targetSection =
                    item.dataset.section;


                if (!targetSection) {
                    return;
                }


                /*
                 * Remove active state.
                 */

                navigationItems.forEach(
                    navItem => {

                        navItem.classList.remove(
                            "active"
                        );

                    }
                );


                /*
                 * Activate selected item.
                 */

                item.classList.add(
                    "active"
                );


                /*
                 * Hide every section.
                 */

                sections.forEach(
                    section => {

                        section.classList.remove(
                            "active"
                        );

                    }
                );


                /*
                 * Show selected section.
                 */

                const target =
                    document.getElementById(
                        `section-${targetSection}`
                    );


                if (target) {

                    target.classList.add(
                        "active"
                    );

                }


                /*
                 * Update header title.
                 */

                const label =
                    item.querySelector(
                        ".admin-nav-label"
                    );


                if (
                    label &&
                    pageTitle
                ) {

                    pageTitle.textContent =
                        label.textContent.trim();

                }


                /*
                 * Close mobile sidebar.
                 */

                closeMobileSidebar();

            }
        );

    });

}


// ============================================================
// SIDEBAR
// ============================================================

function initializeSidebar() {

    const menuButton =
        document.getElementById(
            "admin-menu-button"
        );


    const app =
        document.getElementById(
            "admin-app"
        );


    const backdrop =
        document.getElementById(
            "admin-sidebar-backdrop"
        );


    if (!menuButton || !app) {
        return;
    }


    menuButton.addEventListener(
        "click",
        () => {

            /*
             * MOBILE
             */

            if (
                window.innerWidth <= 760
            ) {

                app.classList.toggle(
                    "sidebar-mobile-open"
                );

                const isOpen =
                    app.classList.contains(
                        "sidebar-mobile-open"
                    );


                menuButton.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );


                return;
            }


            /*
             * DESKTOP
             */

            app.classList.toggle(
                "sidebar-collapsed"
            );


            const isCollapsed =
                app.classList.contains(
                    "sidebar-collapsed"
                );


            menuButton.setAttribute(
                "aria-expanded",
                String(!isCollapsed)
            );

        }
    );


    /*
     * Clicking the mobile backdrop
     * closes the sidebar.
     */

    if (backdrop) {

        backdrop.addEventListener(
            "click",
            () => {

                closeMobileSidebar();

            }
        );

    }


    /*
     * If the browser is resized from
     * mobile to desktop, reset mobile state.
     */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 760
            ) {

                app.classList.remove(
                    "sidebar-mobile-open"
                );

            }

        }
    );

}


// ============================================================
// CLOSE MOBILE SIDEBAR
// ============================================================

function closeMobileSidebar() {

    const app =
        document.getElementById(
            "admin-app"
        );


    const menuButton =
        document.getElementById(
            "admin-menu-button"
        );


    if (!app) {
        return;
    }


    app.classList.remove(
        "sidebar-mobile-open"
    );


    if (menuButton) {

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


// ============================================================
// ADMIN USER
// ============================================================

async function initializeAdminUser() {

    const nameElement =
        document.getElementById(
            "admin-name"
        );


    const avatarElement =
        document.getElementById(
            "admin-avatar"
        );


    if (
        !nameElement ||
        !avatarElement
    ) {
        return;
    }


    const profile =
        await getCurrentProfile();


    if (!profile) {
        return;
    }


    const fullName =
        profile.full_name?.trim();


    if (fullName) {

        nameElement.textContent =
            fullName;


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


// ============================================================
// DASHBOARD
// ============================================================

async function initializeDashboard() {

    const overview =
        document.getElementById(
            "section-overview"
        );


    if (!overview) {
        return;
    }


    await Promise.all([
        loadDashboardStatistics(),
        loadRecentActivity()
    ]);

}


// ============================================================
// DASHBOARD STATISTICS
// ============================================================

async function loadDashboardStatistics() {

    const coursesElement =
        document.getElementById(
            "stat-courses"
        );


    const unitsElement =
        document.getElementById(
            "stat-units"
        );


    const lessonsElement =
        document.getElementById(
            "stat-lessons"
        );


    const studentsElement =
        document.getElementById(
            "stat-students"
        );


    const publishedElement =
        document.getElementById(
            "stat-published"
        );


    try {

        /*
         * COURSES
         */

        const coursesResult =
            await supabaseClient
                .from("courses")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (coursesResult.error) {
            throw coursesResult.error;
        }


        /*
         * UNITS
         */

        const unitsResult =
            await supabaseClient
                .from("units")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (unitsResult.error) {
            throw unitsResult.error;
        }


        /*
         * LESSONS
         */

        const lessonsResult =
            await supabaseClient
                .from("lessons")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (lessonsResult.error) {
            throw lessonsResult.error;
        }


        /*
         * STUDENTS
         */

        const studentsResult =
            await supabaseClient
                .from("profiles")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .eq(
                    "role",
                    "student"
                )
                .eq(
                    "active",
                    true
                );


        if (studentsResult.error) {
            throw studentsResult.error;
        }


        /*
         * PUBLISHED COURSES
         */

        const publishedResult =
            await supabaseClient
                .from("courses")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .eq(
                    "status",
                    "published"
                );


        if (publishedResult.error) {
            throw publishedResult.error;
        }


        /*
         * DISPLAY
         */

        if (coursesElement) {

            coursesElement.textContent =
                coursesResult.count ?? 0;

        }


        if (unitsElement) {

            unitsElement.textContent =
                unitsResult.count ?? 0;

        }


        if (lessonsElement) {

            lessonsElement.textContent =
                lessonsResult.count ?? 0;

        }


        if (studentsElement) {

            studentsElement.textContent =
                studentsResult.count ?? 0;

        }


        if (publishedElement) {

            publishedElement.textContent =
                publishedResult.count ?? 0;

        }

    } catch (error) {

        console.error(
            "Unable to load dashboard statistics:",
            error
        );


        /*
         * Error state.
         */

        if (coursesElement) {
            coursesElement.textContent = "!";
        }

        if (unitsElement) {
            unitsElement.textContent = "!";
        }

        if (lessonsElement) {
            lessonsElement.textContent = "!";
        }

        if (studentsElement) {
            studentsElement.textContent = "!";
        }

        if (publishedElement) {
            publishedElement.textContent = "!";
        }

    }

}


// ============================================================
// RECENT ACTIVITY
// ============================================================

async function loadRecentActivity() {

    const activityContainer =
        document.getElementById(
            "recent-activity"
        );


    if (!activityContainer) {
        return;
    }


    try {

        const [
            coursesResult,
            unitsResult,
            lessonsResult,
            studentsResult
        ] = await Promise.all([


            /*
             * COURSES
             */

            supabaseClient
                .from("courses")
                .select(
                    "id, title, created_at"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(5),


            /*
             * UNITS
             */

            supabaseClient
                .from("units")
                .select(
                    "id, title, created_at"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(5),


            /*
             * LESSONS
             */

            supabaseClient
                .from("lessons")
                .select(
                    "id, title, created_at"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(5),


            /*
             * STUDENTS
             */

            supabaseClient
                .from("profiles")
                .select(
                    "id, full_name, created_at"
                )
                .eq(
                    "role",
                    "student"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(5)

        ]);


        /*
         * DATABASE ERRORS
         */

        if (coursesResult.error) {
            throw coursesResult.error;
        }

        if (unitsResult.error) {
            throw unitsResult.error;
        }

        if (lessonsResult.error) {
            throw lessonsResult.error;
        }

        if (studentsResult.error) {
            throw studentsResult.error;
        }


        const activities = [];


        /*
         * COURSES
         */

        (coursesResult.data || [])
            .forEach(course => {

                activities.push({

                    title:
                        `Course created: ${course.title}`,

                    date:
                        course.created_at,

                    icon:
                        "▣"

                });

            });


        /*
         * UNITS
         */

        (unitsResult.data || [])
            .forEach(unit => {

                activities.push({

                    title:
                        `Unit created: ${unit.title}`,

                    date:
                        unit.created_at,

                    icon:
                        "◫"

                });

            });


        /*
         * LESSONS
         */

        (lessonsResult.data || [])
            .forEach(lesson => {

                activities.push({

                    title:
                        `Lesson created: ${lesson.title}`,

                    date:
                        lesson.created_at,

                    icon:
                        "▤"

                });

            });


        /*
         * STUDENTS
         */

        (studentsResult.data || [])
            .forEach(student => {

                activities.push({

                    title:
                        `Student registered: ${
                            student.full_name ||
                            "New student"
                        }`,

                    date:
                        student.created_at,

                    icon:
                        "♙"

                });

            });


        /*
         * Sort by date.
         */

        activities.sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


        const recentActivities =
            activities.slice(0, 5);


        /*
         * Empty state.
         */

        if (
            recentActivities.length === 0
        ) {

            activityContainer.innerHTML = `

                <div class="admin-activity-empty">
                    No recent activity yet.
                </div>

            `;

            return;

        }


        /*
         * Render.
         */

        activityContainer.innerHTML =
            recentActivities
                .map(activity => {

                    return `

                        <div class="admin-activity-item">

                            <div class="admin-activity-icon">

                                ${escapeHtml(
                                    activity.icon
                                )}

                            </div>


                            <div class="admin-activity-content">

                                <div class="admin-activity-title">

                                    ${escapeHtml(
                                        activity.title
                                    )}

                                </div>


                                <div class="admin-activity-meta">

                                    ${formatActivityDate(
                                        activity.date
                                    )}

                                </div>

                            </div>

                        </div>

                    `;

                })
                .join("");


    } catch (error) {

        console.error(
            "Unable to load recent activity:",
            error
        );


        activityContainer.innerHTML = `

            <div class="admin-activity-empty">
                Unable to load recent activity.
            </div>

        `;

    }

}


// ============================================================
// DATE FORMAT
// ============================================================

function formatActivityDate(
    dateValue
) {

    if (!dateValue) {
        return "";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }


    return date.toLocaleString(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// LOGOUT
// ============================================================

function initializeLogout() {

    const logoutButton =
        document.getElementById(
            "admin-logout"
        );


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        async () => {

            logoutButton.disabled =
                true;


            try {

                await logoutUser();

            } catch (error) {

                console.error(
                    "Admin logout failed:",
                    error
 
