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

    initializeCourseManagement();

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


            if (
                targetSection === "courses"
            ) {
                loadCourses();
            }


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
                })
                .is("archived_at", null),

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
                .is("archived_at", null)

        ]);


        if (coursesResult.error)
            throw coursesResult.error;

        if (unitsResult.error)
            throw unitsResult.error;

        if (lessonsResult.error)
            throw lessonsResult.error;

        if (studentsResult.error)
            throw studentsResult.error;

        if (publishedResult.error)
            throw publishedResult.error;


        if (coursesElement)
            coursesElement.textContent =
                coursesResult.count ?? 0;

        if (unitsElement)
            unitsElement.textContent =
                unitsResult.count ?? 0;

        if (lessonsElement)
            lessonsElement.textContent =
                lessonsResult.count ?? 0;

        if (studentsElement)
            studentsElement.textContent =
                studentsResult.count ?? 0;

        if (publishedElement)
            publishedElement.textContent =
                publishedResult.count ?? 0;


    } catch (error) {

        console.error(
            "Unable to load dashboard statistics:",
            error
        );

    }

}


// ============================================================
// COURSE MANAGEMENT
// ============================================================

let adminCourses = [];

let adminCategories = [];


// ============================================================
// INITIALIZE COURSE MANAGEMENT
// ============================================================

function initializeCourseManagement() {

    const createButton =
        document.getElementById(
            "create-course-button"
        );

    const search =
        document.getElementById(
            "course-search"
        );

    const categoryFilter =
        document.getElementById(
            "course-category-filter"
        );

    const statusFilter =
        document.getElementById(
            "course-status-filter"
        );


    if (createButton) {

        createButton.addEventListener(
            "click",
            () => openCourseModal()
        );

    }


    if (search) {

        search.addEventListener(
            "input",
            renderCourses
        );

    }


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            renderCourses
        );

    }


    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            renderCourses
        );

    }


    initializeCourseModal();

}


// ============================================================
// LOAD COURSES
// ============================================================

async function loadCourses() {

    const container =
        document.getElementById(
            "course-list"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="course-loading">
            Loading courses...
        </div>
    `;


    try {

        const [
            coursesResult,
            categoriesResult
        ] = await Promise.all([

            supabaseClient
                .from("courses")
                .select(`
                    id,
                    title,
                    description,
                    category,
                    level,
                    cover_image,
                    status,
                    sort_order,
                    created_at,
                    updated_at,
                    slug
                `)
                .is("archived_at", null)
                .order("sort_order", {
                    ascending: true
                })
                .order("created_at", {
                    ascending: false
                }),

            supabaseClient
                .from("categories")
                .select(`
                    id,
                    name,
                    slug,
                    active,
                    sort_order
                `)
                .eq("active", true)
                .order("sort_order", {
                    ascending: true
                })

        ]);


        if (coursesResult.error)
            throw coursesResult.error;

        if (categoriesResult.error)
            throw categoriesResult.error;


        adminCourses =
            coursesResult.data || [];

        adminCategories =
            categoriesResult.data || [];


        populateCategoryControls();

        renderCourses();


    } catch (error) {

        console.error(
            "Unable to load courses:",
            error
        );

        container.innerHTML = `
            <div class="course-empty">
                Unable to load courses.
            </div>
        `;

    }

}


// ============================================================
// CATEGORY CONTROLS
// ============================================================

function populateCategoryControls() {

    const filter =
        document.getElementById(
            "course-category-filter"
        );

    const select =
        document.getElementById(
            "course-category"
        );


    if (filter) {

        filter.innerHTML = `
            <option value="all">
                All categories
            </option>
        `;


        adminCategories.forEach(category => {

            filter.insertAdjacentHTML(
                "beforeend",
                `
                    <option value="${escapeHtml(category.name)}">
                        ${escapeHtml(category.name)}
                    </option>
                `
            );

        });

    }


    if (select) {

        select.innerHTML = `
            <option value="">
                Select category
            </option>
        `;


        adminCategories.forEach(category => {

            select.insertAdjacentHTML(
                "beforeend",
                `
                    <option value="${escapeHtml(category.name)}">
                        ${escapeHtml(category.name)}
                    </option>
                `
            );

        });

    }

}


// ============================================================
// RENDER COURSES
// ============================================================

function renderCourses() {

    const container =
        document.getElementById(
            "course-list"
        );

    const countElement =
        document.getElementById(
            "course-count"
        );


    if (!container) {
        return;
    }


    const search =
        document.getElementById(
            "course-search"
        )?.value
            .trim()
            .toLowerCase() || "";


    const category =
        document.getElementById(
            "course-category-filter"
        )?.value || "all";


    const status =
        document.getElementById(
            "course-status-filter"
        )?.value || "all";


    const filtered =
        adminCourses.filter(course => {

            const matchesSearch =
                !search ||
                course.title
                    ?.toLowerCase()
                    .includes(search) ||
                course.description
                    ?.toLowerCase()
                    .includes(search);


            const matchesCategory =
                category === "all" ||
                course.category === category;


            const matchesStatus =
                status === "all" ||
                course.status === status;


            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );

        });


    if (countElement) {

        countElement.textContent =
            `${filtered.length} ${
                filtered.length === 1
                    ? "course"
                    : "courses"
            }`;

    }


    if (!filtered.length) {

        container.innerHTML = `
            <div class="course-empty">
                No courses found.
            </div>
        `;

        return;
    }


    container.innerHTML =
        filtered.map(course => {

            const image =
                course.cover_image
                    ? `
                        <img
                            src="${escapeHtml(course.cover_image)}"
                            alt=""
                            loading="lazy"
                        >
                    `
                    : `
                        <div class="course-cover-placeholder">
                            ▣
                        </div>
                    `;


            const publishButton =
                course.status === "published"
                    ? `
                        <button
                            class="course-action"
                            data-action="unpublish"
                            data-id="${course.id}"
                        >
                            Unpublish
                        </button>
                    `
                    : `
                        <button
                            class="course-action"
                            data-action="publish"
                            data-id="${course.id}"
                        >
                            Publish
                        </button>
                    `;


            return `
                <div class="course-row">

                    <div class="course-cover">
                        ${image}
                    </div>


                    <div class="course-info">

                        <div class="course-title">
                            ${escapeHtml(course.title)}
                        </div>

                        <div class="course-description">
                            ${escapeHtml(
                                course.description ||
                                "No description"
                            )}
                        </div>

                    </div>


                    <div class="course-category">
                        ${escapeHtml(
                            course.category ||
                            "Uncategorized"
                        )}
                    </div>


                    <div>

                        <div class="course-level">
                            ${escapeHtml(
                                course.level ||
                                "No level"
                            )}
                        </div>

                        <div
                            class="course-status ${
                                course.status === "published"
                                    ? "published"
                                    : "draft"
                            }"
                        >
                            ${escapeHtml(
                                course.status ||
                                "draft"
                            )}
                        </div>

                    </div>


                    <div class="course-actions">

                        <button
                            class="course-action"
                            data-action="edit"
                            data-id="${course.id}"
                        >
                            Edit
                        </button>

                        ${publishButton}

                        <button
                            class="course-action"
                            data-action="duplicate"
                            data-id="${course.id}"
                        >
                            Duplicate
                        </button>

                        <button
                            class="course-action danger"
                            data-action="archive"
                            data-id="${course.id}"
                        >
                            Archive
                        </button>

                    </div>

                </div>
            `;

        }).join("");


    container
        .querySelectorAll(".course-action")
        .forEach(button => {

            button.addEventListener(
                "click",
                handleCourseAction
            );

        });

}


// ============================================================
// COURSE ACTIONS
// ============================================================

async function handleCourseAction(event) {

    const button =
        event.currentTarget;

    const action =
        button.dataset.action;

    const id =
        button.dataset.id;


    const course =
        adminCourses.find(
            item => item.id === id
        );


    if (!course) {
        return;
    }


    if (action === "edit") {

        openCourseModal(course);

        return;
    }


    if (action === "publish") {

        await updateCourseStatus(
            course,
            "published"
        );

        return;
    }


    if (action === "unpublish") {

        await updateCourseStatus(
            course,
            "draft"
        );

        return;
    }


    if (action === "duplicate") {

        await duplicateCourse(course);

        return;
    }


    if (action === "archive") {

        await archiveCourse(course);

    }

}


// ============================================================
// UPDATE STATUS
// ============================================================

async function updateCourseStatus(
    course,
    status
) {

    const action =
        status === "published
