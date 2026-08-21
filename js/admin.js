// ============================================================
// EduCore — Admin Dashboard
// ============================================================


// ============================================================
// INITIALIZE ADMIN APPLICATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    /*
     * The admin dashboard must only be accessible to:
     *
     * 1. Authenticated users
     * 2. Users with role = admin
     * 3. Active users
     */

    const authorized = await requireAdmin();

    if (!authorized) {
        return;
    }


    /*
     * Authentication has passed.
     */

    initializeAdminNavigation();

    initializeSidebar();

    initializeLogout();

    await initializeAdminUser();

    await initializeDashboard();

});


// ============================================================
// NAVIGATION
// ============================================================

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
             * from all navigation items.
             */

            navigationItems.forEach(navItem => {

                navItem.classList.remove("active");

            });


            /*
             * Activate selected navigation item.
             */

            item.classList.add("active");


            /*
             * Hide all sections.
             */

            sections.forEach(section => {

                section.classList.remove("active");

            });


            /*
             * Find selected section.
             */

            const target =
                document.getElementById(
                    `section-${targetSection}`
                );


            /*
             * Show selected section.
             */

            if (target) {

                target.classList.add("active");

            }


            /*
             * Update header title.
             */

            const label =
                item.querySelector(".nav-label");


            if (label && pageTitle) {

                pageTitle.textContent =
                    label.textContent.trim();

            }


            /*
             * Close mobile sidebar.
             */

            document
                .getElementById("admin-app")
                ?.classList.remove("sidebar-open");

        });

    });

}


// ============================================================
// MOBILE SIDEBAR
// ============================================================

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


// ============================================================
// ADMIN USER
// ============================================================

async function initializeAdminUser() {

    const nameElement =
        document.getElementById("admin-name");

    const avatarElement =
        document.getElementById("admin-avatar");


    if (!nameElement || !avatarElement) {
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

    /*
     * Only load dashboard data when
     * the Overview section exists.
     */

    const overview =
        document.getElementById("section-overview");


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
        document.getElementById("stat-courses");

    const unitsElement =
        document.getElementById("stat-units");

    const lessonsElement =
        document.getElementById("stat-lessons");

    const studentsElement =
        document.getElementById("stat-students");

    const publishedElement =
        document.getElementById("stat-published");


    try {

        /*
         * COURSES
         */

        const coursesResult =
            await supabaseClient
                .from("courses")
                .select("id", {
                    count: "exact",
                    head: true
                });


        if (coursesResult.error) {
            throw coursesResult.error;
        }


        /*
         * UNITS
         */

        const unitsResult =
            await supabaseClient
                .from("units")
                .select("id", {
                    count: "exact",
                    head: true
                });


        if (unitsResult.error) {
            throw unitsResult.error;
        }


        /*
         * LESSONS
         */

        const lessonsResult =
            await supabaseClient
                .from("lessons")
                .select("id", {
                    count: "exact",
                    head: true
                });


        if (lessonsResult.error) {
            throw lessonsResult.error;
        }


        /*
         * STUDENTS
         */

        const studentsResult =
            await supabaseClient
                .from("profiles")
                .select("id", {
                    count: "exact",
                    head: true
                })
                .eq("role", "student")
                .eq("active", true);


        if (studentsResult.error) {
            throw studentsResult.error;
        }


        /*
         * PUBLISHED COURSES
         */

        const publishedResult =
            await supabaseClient
                .from("courses")
                .select("id", {
                    count: "exact",
                    head: true
                })
                .eq("status", "published");


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


    } catch (error) {

        console.error(
            "Unable to load dashboard statistics:",
            error
        );


        /*
         * Show an error state instead of
         * leaving the dashboard looking broken.
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
        document.getElementById("recent-activity");


    if (!activityContainer) {
        return;
    }


    try {

        /*
         * We currently don't need a separate
         * activity table.
         *
         * Phase 3 can build the activity feed
         * from recently created platform records.
         */


        const [
            coursesResult,
            unitsResult,
            lessonsResult,
            studentsResult
        ] = await Promise.all([


            /*
             * Recent courses
             */

            supabaseClient
                .from("courses")
                .select("id, title, created_at")
                .order("created_at", {
                    ascending: false
                })
                .limit(5),


            /*
             * Recent units
             */

            supabaseClient
                .from("units")
                .select("id, title, created_at")
                .order("created_at", {
                    ascending: false
                })
                .limit(5),


            /*
             * Recent lessons
             */

            supabaseClient
                .from("lessons")
                .select("id, title, created_at")
                .order("created_at", {
                    ascending: false
                })
                .limit(5),


            /*
             * Recently registered students
             */

            supabaseClient
                .from("profiles")
                .select("id, full_name, created_at")
                .eq("role", "student")
                .order("created_at", {
                    ascending: false
                })
                .limit(5)

        ]);


        /*
         * Check for database errors.
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
         * Build a single activity array.
         */

        const activities = [];


        /*
         * COURSES
         */

        (coursesResult.data || []).forEach(course => {

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

        (unitsResult.data || []).forEach(unit => {

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

        (lessonsResult.data || []).forEach(lesson => {

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

        (studentsResult.data || []).forEach(student => {

            activities.push({

                type: "student",

                title:
                    `Student registered: ${student.full_name || "New student"}`,

                date:
                    student.created_at,

                icon: "♙"

            });

        });


        /*
         * Sort everything by date.
         */

        activities.sort((a, b) => {

            return new Date(b.date) -
                   new Date(a.date);

        });


        /*
         * Only show the five most recent.
         */

        const recentActivities =
            activities.slice(0, 5);


        /*
         * Nothing exists yet.
         */

        if (recentActivities.length === 0) {

            activityContainer.innerHTML = `

                <div class="activity-empty">

                    No recent activity yet.

                </div>

            `;

            return;

        }


        /*
         * Render activities.
         */

        activityContainer.innerHTML =
            recentActivities
                .map(activity => {

                    return `

                        <div class="activity-item">

                            <div class="activity-icon">

                                ${escapeHtml(activity.icon)}

                            </div>

                            <div class="activity-content">

                                <div class="activity-title">

                                    ${escapeHtml(activity.title)}

                                </div>

                                <div class="activity-meta">

                                    ${formatActivityDate(activity.date)}

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


    if (Number.isNaN(date.getTime())) {
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

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// LOGOUT
// ============================================================

function initializeLogout() {

    const logoutButton =
        document.getElementById("admin-logout");


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        async () => {

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
