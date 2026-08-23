// ============================================================
// EduCore — Admin Dashboard
// Phase 3 — Admin Dashboard
// ============================================================


// ============================================================
// INITIALIZE ADMIN APPLICATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
         * The existing authentication system
         * remains responsible for authorization.
         *
         * We do not recreate authentication here.
         */

        const authorized =
            await requireAdmin();


        if (!authorized) {
            return;
        }


        /*
         * Authentication and admin role
         * verification have passed.
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
            ".nav-item"
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
                 * Remove active state
                 */

                navigationItems.forEach(
                    navItem => {

                        navItem.classList.remove(
                            "active"
                        );

                    }
                );


                /*
                 * Activate selected item
                 */

                item.classList.add(
                    "active"
                );


                /*
                 * Hide all sections
                 */

                sections.forEach(
                    section => {

                        section.classList.remove(
                            "active"
                        );

                    }
                );


                /*
                 * Find target section
                 */

                const target =
                    document.getElementById(
                        `section-${targetSection}`
                    );


                /*
                 * Display target section
                 */

                if (target) {

                    target.classList.add(
                        "active"
                    );

                }


                /*
                 * Update page title
                 */

                const label =
                    item.querySelector(
                        ".nav-label"
                    );


                if (
                    label &&
                    pageTitle
                ) {

                    pageTitle.textContent =
                        label.textContent.trim();

                }


                /*
                 * Close mobile sidebar
                 */

                const app =
                    document.getElementById(
                        "admin-app"
                    );


                if (app) {

                    app.classList.remove(
                        "sidebar-open"
                    );

                }


                const toggle =
                    document.getElementById(
                        "sidebar-toggle"
                    );


                if (toggle) {

                    toggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }
        );

    });

}


// ============================================================
// SIDEBAR
// ============================================================

function initializeSidebar() {

    const toggle =
        document.getElementById(
            "sidebar-toggle"
        );


    const app =
        document.getElementById(
            "admin-app"
        );


    if (
        !toggle ||
        !app
    ) {
        return;
    }


    toggle.addEventListener(
        "click",
        () => {

            const opened =
                app.classList.toggle(
                    "sidebar-open"
                );


            toggle.setAttribute(
                "aria-expanded",
                opened
            );

        }
    );


    /*
     * Close sidebar when clicking outside
     * on mobile.
     */

    document.addEventListener(
        "click",
        event => {

            if (
                window.innerWidth > 760
            ) {
                return;
            }


            const sidebar =
                document.querySelector(
                    ".admin-sidebar"
                );


            if (
                !sidebar ||
                !app.classList.contains(
                    "sidebar-open"
                )
            ) {
                return;
            }


            const clickedInsideSidebar =
                sidebar.contains(
                    event.target
                );


            const clickedToggle =
                toggle.contains(
                    event.target
                );


            if (
                !clickedInsideSidebar &&
                !clickedToggle
            ) {

                app.classList.remove(
                    "sidebar-open"
                );


                toggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );


    /*
     * Escape closes mobile sidebar.
     */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }


            app.classList.remove(
                "sidebar-open"
            );


            toggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }
    );

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


    try {

        /*
         * Use the existing authentication
         * / profile system.
         */

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

        }
        else {

            nameElement.textContent =
                profile.email ||
                "Admin";


            avatarElement.textContent =
                (
                    profile.email ||
                    "A"
                )
                    .charAt(0)
                    .toUpperCase();

        }

    }
    catch (error) {

        console.error(
            "Unable to load admin profile:",
            error
        );

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
         * ACTIVE STUDENTS
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
         * DISPLAY RESULTS
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

    }
    catch (error) {

        console.error(
            "Unable to load dashboard statistics:",
            error
        );


        /*
         * Error state
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

        /*
         * Phase 3 does not create a separate
         * activity table.
         *
         * Activity is derived from existing
         * records created in the platform.
         */

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
         * Check errors.
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


        /*
         * Build activity list.
         */

        const activities = [];


        /*
         * COURSES
         */

        (
            coursesResult.data || []
        ).forEach(course => {

            activities.push({

                type: "course",

                title:
                    `Course created: ${course.title}`,

                date:
                    course.created_at,

                icon: "▣"

            });

        });


        /*
         * UNITS
         */

        (
            unitsResult.data || []
        ).forEach(unit => {

            activities.push({

                type: "unit",

                title:
                    `Unit created: ${unit.title}`,

                date:
                    unit.created_at,

                icon: "◫"

            });

        });


        /*
         * LESSONS
         */

        (
            lessonsResult.data || []
        ).forEach(lesson => {

            activities.push({

                type: "lesson",

                title:
                    `Lesson created: ${lesson.title}`,

                date:
                    lesson.created_at,

                icon: "▤"

            });

        });


        /*
         * STUDENTS
         */

        (
            studentsResult.data || []
        ).forEach(student => {

            activities.push({

                type: "student",

                title:
                    `Student registered: ${
                        student.full_name ||
                        "New student"
                    }`,

                date:
                    student.created_at,

                icon: "♙"

            });

        });


        /*
         * Sort newest first.
         */

        activities.sort(
            (a, b) => {

                return (
                    new Date(b.date) -
                    new Date(a.date)
                );

            }
        );


        /*
         * Only display five.
         */

        const recentActivities =
            activities.slice(0, 5);


        /*
         * No activity.
         */

        if (
            recentActivities.length === 0
        ) {

            activityContainer.innerHTML = `

                <div class="activity-empty">
                    No recent activity yet.
                </div>

            `;

            return;

        }


        /*
         * Render activity.
         */

        activityContainer.innerHTML =
            recentActivities
                .map(
                    activity => {

                        return `

                            <div class="activity-item">

                                <div class="activity-icon">

                                    ${escapeHtml(
                                        activity.icon
                                    )}

                                </div>


                                <div class="activity-content">

                                    <div class="activity-title">

                                        ${escapeHtml(
                                            activity.title
                                        )}

                                    </div>


                                    <div class="activity-meta">

                                        ${formatActivityDate(
                                            activity.date
                                        )}

                                    </div>

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");

    }
    catch (error) {

        console.error(
            "Unable to load recent activity:",
            error
        );


        activityContainer.innerHTML = `

            <div class="activity-empty">
                Unable to load recent activity.
            </div>

        `;

    }

}


// ============================================================
// FORMAT ACTIVITY DATE
// ============================================================

function formatActivityDate(dateValue) {

    if (!dateValue) {
        return "";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    )
