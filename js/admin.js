// ============================================================
// EduCore — Admin Dashboard
// Complete dashboard controller
// ============================================================


// ============================================================
// GLOBAL STATE
// ============================================================

let adminCourses = [];

let editingCourseId = null;

let courseActionId = null;

let courseActionType = null;


// ============================================================
// START APPLICATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    try {

        /*
         * Authentication is handled by auth.js.
         * If requireAdmin() is unavailable, stop safely.
         */

        if (typeof requireAdmin !== "function") {

            console.error(
                "requireAdmin() was not found. Check js/auth.js."
            );

            return;
        }


        const authorized = await requireAdmin();

        if (!authorized) {
            return;
        }


        initializeAdminNavigation();

        initializeSidebar();

        initializeLogout();

        initializeCourseManagement();

        await initializeAdminUser();

        await initializeDashboard();


    } catch (error) {

        console.error(
            "EduCore Admin failed to initialize:",
            error
        );

    }

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
             * Active navigation item
             */

            navigationItems.forEach(navItem => {

                navItem.classList.remove("active");

            });


            item.classList.add("active");


            /*
             * Hide all sections
             */

            sections.forEach(section => {

                section.classList.remove("active");

            });


            /*
             * Show requested section
             */

            const target =
                document.getElementById(
                    `section-${targetSection}`
                );


            if (target) {

                target.classList.add("active");

            }


            /*
             * Update page title
             */

            const label =
                item.querySelector(".nav-label");


            if (label && pageTitle) {

                pageTitle.textContent =
                    label.textContent.trim();

            }


            /*
             * Close mobile sidebar
             */

            if (window.innerWidth <= 768) {

                closeMobileSidebar();

            }


            /*
             * Load courses whenever Courses
             * section is opened.
             */

            if (targetSection === "courses") {

                loadCourses();

            }

        });

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

    const overlay =
        document.getElementById(
            "sidebar-overlay"
        );

    const mobileClose =
        document.getElementById(
            "mobile-sidebar-close"
        );


    if (!toggle || !app) {

        console.error(
            "Sidebar elements could not be found."
        );

        return;
    }


    /*
     * Main hamburger button
     */

    toggle.addEventListener("click", () => {

        if (window.innerWidth <= 768) {

            toggleMobileSidebar();

            return;

        }


        /*
         * Desktop:
         * collapse / expand
         */

        app.classList.toggle(
            "sidebar-collapsed"
        );


        const collapsed =
            app.classList.contains(
                "sidebar-collapsed"
            );


        toggle.setAttribute(
            "aria-expanded",
            String(!collapsed)
        );

    });


    /*
     * Mobile overlay
     */

    if (overlay) {

        overlay.addEventListener(
            "click",
            closeMobileSidebar
        );

    }


    /*
     * Mobile close button
     */

    if (mobileClose) {

        mobileClose.addEventListener(
            "click",
            closeMobileSidebar
        );

    }


    /*
     * Escape closes mobile sidebar
     */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                app.classList.contains("sidebar-open")
            ) {

                closeMobileSidebar();

            }

        }
    );


    /*
     * Responsive correction
     */

    window.addEventListener(
        "resize",
        () => {

            if (window.innerWidth > 768) {

                app.classList.remove(
                    "sidebar-open"
                );

            }

        }
    );

}


// ============================================================
// MOBILE SIDEBAR OPEN
// ============================================================

function openMobileSidebar() {

    const app =
        document.getElementById(
            "admin-app"
        );

    const toggle =
        document.getElementById(
            "sidebar-toggle"
        );


    if (!app) {
        return;
    }


    app.classList.add(
        "sidebar-open"
    );


    if (toggle) {

        toggle.setAttribute(
            "aria-expanded",
            "true"
        );

    }

}


// ============================================================
// MOBILE SIDEBAR CLOSE
// ============================================================

function closeMobileSidebar() {

    const app =
        document.getElementById(
            "admin-app"
        );

    const toggle =
        document.getElementById(
            "sidebar-toggle"
        );


    if (!app) {
        return;
    }


    app.classList.remove(
        "sidebar-open"
    );


    if (toggle) {

        toggle.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


// ============================================================
// MOBILE SIDEBAR TOGGLE
// ============================================================

function toggleMobileSidebar() {

    const app =
        document.getElementById(
            "admin-app"
        );


    if (!app) {
        return;
    }


    if (
        app.classList.contains(
            "sidebar-open"
        )
    ) {

        closeMobileSidebar();

    } else {

        openMobileSidebar();

    }

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

            try {

                if (
                    typeof supabaseClient !==
                    "undefined"
                ) {

                    await supabaseClient.auth.signOut();

                }


                /*
                 * Use auth.js logout if available.
                 */

                if (
                    typeof logout ===
                    "function"
                ) {

                    await logout();

                    return;

                }


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Logout failed:",
                    error
                );

            }

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


    if (!nameElement || !avatarElement) {
        return;
    }


    try {

        if (
            typeof getCurrentProfile !==
            "function"
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

        }

    } catch (error) {

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


    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        console.error(
            "supabaseClient is not available."
        );

        return;

    }


    try {

        const [
            coursesResult,
            unitsResult,
            lessonsResult,
            studentsResult,
            publishedResult
        ] = await Promise.all([

            supabaseClient
                .from("courses")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                ),

            supabaseClient
                .from("units")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                ),

            supabaseClient
                .from("lessons")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                ),

            supabaseClient
                .from("profiles")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .eq("role", "student")
                .eq("active", true),

            supabaseClient
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
                )

        ]);


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

        if (publishedResult.error) {
            throw publishedResult.error;
        }


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


        [
            coursesElement,
            unitsElement,
            lessonsElement,
            studentsElement,
            publishedElement
        ].forEach(element => {

            if (element) {

                element.textContent =
                    "!";

            }

        });

    }

}


// ============================================================
// RECENT ACTIVITY
// ============================================================

async function loadRecentActivity() {

    const container =
        document.getElementById(
            "recent-activity"
        );


    if (!container) {
        return;
    }


    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        container.innerHTML = `
            <div class="activity-empty">
                Supabase is not available.
            </div>
        `;

        return;

    }


    try {

        const [
            coursesResult,
            unitsResult,
            lessonsResult,
            studentsResult
        ] = await Promise.all([

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


        activities.sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


        const recent =
            activities.slice(0, 5);


        if (!recent.length) {

            container.innerHTML = `
                <div class="activity-empty">
                    No recent activity yet.
                </div>
            `;

            return;

        }


        container.innerHTML =
            recent.map(activity => {

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

            }).join("");


    } catch (error) {

        console.error(
            "Unable to load recent activity:",
            error
        );


        container.innerHTML = `
            <div class="activity-empty">
                Unable to load recent activity.
            </div>
        `;

    }

}


// ============================================================
// COURSE MANAGEMENT
// ============================================================

function initializeCourseManagement() {

    const createButton =
        document.getElementById(
            "create-course-button"
        );

    const createEmptyButt
