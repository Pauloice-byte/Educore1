// ============================================================
// EduCore — Admin Dashboard
// ============================================================


document.addEventListener("DOMContentLoaded", async () => {

    const authorized = await requireAdmin();

    if (!authorized) {
        return;
    }

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

    const app =
        document.getElementById("admin-app");


    navigationItems.forEach(item => {

        item.addEventListener("click", () => {

            const targetSection =
                item.dataset.section;

            if (!targetSection) {
                return;
            }


            navigationItems.forEach(navItem => {
                navItem.classList.remove("active");
            });


            item.classList.add("active");


            sections.forEach(section => {
                section.classList.remove("active");
            });


            const target =
                document.getElementById(
                    `section-${targetSection}`
                );


            if (target) {
                target.classList.add("active");
            }


            const label =
                item.querySelector(".nav-label");


            if (label && pageTitle) {
                pageTitle.textContent =
                    label.textContent.trim();
            }


            /*
             * Close sidebar after selecting
             * an item on mobile.
             */

            if (
                window.innerWidth <= 768 &&
                app
            ) {
                app.classList.remove("sidebar-open");
            }

        });

    });

}


// ============================================================
// SIDEBAR
// ============================================================

function initializeSidebar() {

    const toggle =
        document.getElementById("sidebar-toggle");

    const app =
        document.getElementById("admin-app");


    if (!toggle || !app) {

        console.error(
            "Admin sidebar could not initialize."
        );

        return;
    }


    toggle.addEventListener("click", () => {

        /*
         * MOBILE
         */

        if (window.innerWidth <= 768) {

            app.classList.toggle("sidebar-open");

            const isOpen =
                app.classList.contains("sidebar-open");

            toggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            return;
        }


        /*
         * DESKTOP
         */

        app.classList.toggle("sidebar-collapsed");

        const isCollapsed =
            app.classList.contains(
                "sidebar-collapsed"
            );

        toggle.setAttribute(
            "aria-expanded",
            String(!isCollapsed)
        );

    });


    /*
     * Reset mobile state when the
     * browser is resized.
     */

    window.addEventListener("resize", () => {

        if (window.innerWidth > 768) {

            app.classList.remove("sidebar-open");

        }

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
// STATISTICS
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

        const [
            coursesResult,
            unitsResult,
            lessonsResult,
            studentsResult,
            publishedResult
        ] = await Promise.all([

            supabaseClient
                .from("courses")
                .select("id", {
                    count: "exact",
                    head: true
                }),

            supabaseClient
                .from("units")
                .select("id", {
                    count: "exact",
                    head: true
                }),

            supabaseClient
                .from("lessons")
                .select("id", {
                    count: "exact",
                    head: true
                }),

            supabaseClient
                .from("profiles")
                .select("id", {
                    count: "exact",
                    head: true
                })
                .eq("role", "student")
                .eq("active", true),

            supabaseClient
                .from("courses")
                .select("id", {
                    count: "exact",
                    head: true
                })
                .eq("status", "published")

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
                element.textContent = "!";
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
                    { ascending: false }
                )
                .limit(5),

            supabaseClient
                .from("units")
                .select(
                    "id, title, created_at"
                )
                .order(
                    "created_at",
                    { ascending: false }
                )
                .limit(5),

            supabaseClient
                .from("lessons")
                .select(
                    "id, title, created_at"
                )
                .order(
                    "created_at",
                    { ascending: false }
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
                    { ascending: false }
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


        (coursesResult.data || []).forEach(course => {

            activities.push({
                title:
                    `Course created: ${course.title}`,
                date:
                    course.created_at,
                icon: "▣"
            });

        });


        (unitsResult.data || []).forEach(unit => {

            activities.push({
                title:
                    `Unit created: ${unit.title}`,
                date:
                    unit.created_at,
                icon: "◫"
            });

        });


        (lessonsResult.data || []).forEach(lesson => {

            activities.push({
                title:
                    `Lesson created: ${lesson.title}`,
                date:
                    lesson.created_at,
                icon: "▤"
            });

        });


        (studentsResult.data || []).forEach(student => {

            activities.push({
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


        activities.sort((a, b) => {

            return (
                new Date(b.date) -
                new Date(a.date)
            );

        });


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
// DATE
// ============================================================

function formatActivityDate(value) {

    if (!value) {
        return "";
    }


    const date =
        new Date(value);


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

    const button =
        document.getElementById(
            "admin-logout"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async () => {

            button.disabled = true;

            try {

                await logoutUser();

            } catch (error) {

                console.error(
                    "Admin logout failed:",
                    error
                );

                button.disabled = false;

            }

        }
    );

                        }
