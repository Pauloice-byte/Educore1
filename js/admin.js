/* =========================================================
   EDUCORE ADMIN
   PHASE 4 — COURSE MANAGEMENT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    /* =====================================================
       SUPABASE CHECK
    ===================================================== */

    if (
        typeof window.supabaseClient === "undefined" ||
        !window.supabaseClient
    ) {
        console.error(
            "Supabase is not available. Make sure the Phase 2 Supabase client is loaded before admin.js."
        );
        return;
    }

    const supabase = window.supabaseClient;

    /* =====================================================
       DOM
    ===================================================== */

    const app = document.getElementById("admin-app");

    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".admin-section");

    const pageTitle = document.getElementById("page-title");

    const sidebarToggle = document.getElementById("sidebar-toggle");
    const mobileSidebarClose =
        document.getElementById("mobile-sidebar-close");
    const sidebarOverlay =
        document.getElementById("sidebar-overlay");

    const logoutButton =
        document.getElementById("logout-button");

    const adminName =
        document.getElementById("admin-name");

    const adminRole =
        document.getElementById("admin-role");

    const adminAvatar =
        document.getElementById("admin-avatar");

    const dashboardError =
        document.getElementById("dashboard-error");

    const dashboardRetry =
        document.getElementById("dashboard-retry");

    const totalCourses =
        document.getElementById("total-courses");

    const totalUnits =
        document.getElementById("total-units");

    const totalLessons =
        document.getElementById("total-lessons");

    const totalStudents =
        document.getElementById("total-students");

    const publishedContent =
        document.getElementById("published-content");

    const draftContent =
        document.getElementById("draft-content");

    const activityList =
        document.getElementById("activity-list");

    const courseSearch =
        document.getElementById("course-search");

    const courseFilter =
        document.getElementById("course-filter");

    const courseCount =
        document.getElementById("course-count");

    const coursesList =
        document.getElementById("courses-list");


    /* =====================================================
       STATE
    ===================================================== */

    let allCourses = [];

    let currentUser = null;

    let currentProfile = null;

    let editingCourseId = null;


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    init();


    async function init() {

        try {

            await loadCurrentUser();

            setupNavigation();

            setupSidebar();

            setupLogout();

            setupCourseManagement();

            await loadDashboard();

            await loadCourses();

        } catch (error) {

            console.error(
                "EduCore Admin initialization error:",
                error
            );

            showDashboardError(
                "The admin dashboard could not be initialized."
            );
        }
    }


    /* =====================================================
       AUTH
    ===================================================== */

    async function loadCurrentUser() {

        const {
            data,
            error
        } = await supabase.auth.getUser();

        if (error) {

            console.error(
                "Unable to retrieve current user:",
                error
            );

            return;
        }

        currentUser = data?.user || null;

        if (!currentUser) {
            return;
        }

        await loadProfile(currentUser.id);
    }


    async function loadProfile(userId) {

        try {

            const {
                data,
                error
            } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .maybeSingle();

            if (error) {

                console.warn(
                    "Could not load admin profile:",
                    error
                );

                return;
            }

            currentProfile = data;

            const name =
                data?.name ||
                currentUser?.email ||
                "Administrator";

            const role =
                data?.role ||
                "Admin";

            if (adminName) {
                adminName.textContent = name;
            }

            if (adminRole) {
                adminRole.textContent = role;
            }

            if (adminAvatar) {

                const initials =
                    getInitials(name);

                adminAvatar.textContent =
                    initials;
            }

        } catch (error) {

            console.error(
                "Profile loading error:",
                error
            );
        }
    }


    function getInitials(name) {

        if (!name) {
            return "A";
        }

        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(
                part =>
                    part.charAt(0).toUpperCase()
            )
            .join("");
    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    function setupNavigation() {

        navItems.forEach(item => {

            item.addEventListener("click", () => {

                const sectionName =
                    item.dataset.section;

                if (!sectionName) {
                    return;
                }

                navItems.forEach(nav => {
                    nav.classList.remove("active");
                });

                item.classList.add("active");

                sections.forEach(section => {
                    section.classList.remove("active");
                });

                const target =
                    document.getElementById(
                        `${sectionName}-section`
                    );

                if (target) {
                    target.classList.add("active");
                }

                const label =
                    item.querySelector(
                        ".nav-label"
                    );

                if (pageTitle && label) {
                    pageTitle.textContent =
                        label.textContent.trim();
                }

                closeMobileSidebar();

                if (sectionName === "courses") {
                    loadCourses();
                }
            });
        });
    }


    /* =====================================================
       SIDEBAR
    ===================================================== */

    function setupSidebar() {

        if (sidebarToggle) {

            sidebarToggle.addEventListener(
                "click",
                () => {

                    if (
                        window.innerWidth <= 768
                    ) {

                        app.classList.toggle(
                            "sidebar-open"
                        );

                    } else {

                        app.classList.toggle(
                            "sidebar-collapsed"
                        );
                    }
                }
            );
        }

        if (mobileSidebarClose) {

            mobileSidebarClose.addEventListener(
                "click",
                closeMobileSidebar
            );
        }

        if (sidebarOverlay) {

            sidebarOverlay.addEventListener(
                "click",
                closeMobileSidebar
            );
        }

        window.addEventListener(
            "resize",
            () => {

                if (
                    window.innerWidth > 768
                ) {
                    app.classList.remove(
                        "sidebar-open"
                    );
                }
            }
        );
    }


    function closeMobileSidebar() {

        app.classList.remove(
            "sidebar-open"
        );
    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    function setupLogout() {

        if (!logoutButton) {
            return;
        }

        logoutButton.addEventListener(
            "click",
            async () => {

                try {

                    logoutButton.disabled = true;

                    const {
                        error
                    } = await supabase.auth.signOut();

                    if (error) {
                        throw error;
                    }

                    window.location.href =
                        "index.html";

                } catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                    logoutButton.disabled = false;

                    alert(
                        "Unable to log out. Please try again."
                    );
                }
            }
        );
    }


    /* =====================================================
       DASHBOARD
    ===================================================== */

    async function loadDashboard() {

        hideDashboardError();

        try {

            await Promise.all([
                loadCourseStatistics(),
                loadUnitStatistics(),
                loadLessonStatistics(),
                loadStudentStatistics(),
                loadContentStatistics(),
                loadRecentActivity()
            ]);

        } catch (error) {

            console.error(
                "Dashboard loading error:",
                error
            );

            showDashboardError(
                "Some dashboard information could not be loaded."
            );
        }
    }


    async function loadCourseStatistics() {

        const {
            count,
            error
        } = await supabase
            .from("courses")
            .select("*", {
                count: "exact",
                head: true
            })
            .neq("status", "archived");

        if (error) {
            throw error;
        }

        if (totalCourses) {
            totalCourses.textContent =
                count ?? 0;
        }
    }


    async function loadUnitStatistics() {

        const {
            count,
            error
        } = await supabase
            .from("units")
            .select("*", {
                count: "exact",
                head: true
            });

        if (error) {
            throw error;
        }

        if (totalUnits) {
            totalUnits.textContent =
                count ?? 0;
        }
    }


    async function loadLessonStatistics() {

        const {
            count,
            error
        } = await supabase
            .from("lessons")
            .select("*", {
                count: "exact",
                head: true
            });

        if (error) {
            throw error;
        }

        if (totalLessons) {
            totalLessons.textContent =
                count ?? 0;
        }
    }


    async function loadStudentStatistics() {

        const {
            count,
            error
        } = await supabase
            .from("profiles")
            .select("*", {
                count: "exact",
                head: true
            })
            .eq("role", "student");

        if (error) {
            throw error;
        }

        if (totalStudents) {
            totalStudents.textContent =
                count ?? 0;
        }
    }


    async function loadContentStatistics() {

        const [
            publishedCourses,
            publishedUnits,
            publishedLessons,
            draftCourses,
            draftUnits,
            draftLessons
        ] = await Promise.all([

            supabase
                .from("courses")
                .select("*", {
                    count: "exact",
                    head: true
                })
                .eq("status", "published"),

            supabase
                .from("units")
                .select("*", {
                    count: "exact",
                    head: true
                })
                .eq("status", "published"),

            supabase
                .from("lessons")
                .select("*", {
                    count: "exact",
                    head: true
                })
                .eq("status", "published"),

            supabase
                .from("courses")
                .select("*", {
                    count: "exact",
                    head: true
                })
                .eq("status", "draft"),

            supabase
                .from("units")
                .select("*", {
                    count: "exact",
                    head: true
                })
                .eq("status", "draft"),

            supabase
                .from("lessons")
                .select("*", {
                    count: "exact",
                    head: true
                })
                .eq("status", "draft")
        ]);


        const errors = [
            publishedCourses.error,
            publishedUnits.error,
            publishedLessons.error,
            draftCourses.error,
            draftUnits.error,
            draftLessons.error
        ].filter(Boolean);

        if (errors.length) {
            throw errors[0];
        }


        const published =
            (publishedCourses.count || 0) +
            (publishedUnits.count || 0) +
            (publishedLessons.count || 0);

        const drafts =
            (draftCourses.count || 0) +
            (draftUnits.count || 0) +
            (draftLessons.count || 0);


        if (publishedContent) {
            publishedContent.textContent =
                published;
        }

        if (draftContent) {
            draftContent.textContent =
                drafts;
        }
    }


    async function loadRecentActivity() {

        if (!activityList) {
            return;
        }

        activityList.innerHTML =
            `<div class="activity-loading">
                Loading recent activity...
            </div>`;


        const {
            data,
            error
        } = await supabase
            .from("activities")
            .select("*")
            .order("created_at", {
                ascending: false
            })
            .limit(8);


        if (error) {

            console.warn(
                "Activity loading error:",
                error
            );

            activityList.innerHTML =
                `<div class="activity-empty">
                    No recent activity available.
                </div>`;

            return;
        }


        if (!data || !data.length) {

            activityList.innerHTML =
                `<div class="activity-empty">
                    No recent activity yet.
                </div>`;

            return;
        }


        activityList.innerHTML =
            data.map(activity => {

                const title =
                    activity.title ||
                    activity.activity_type ||
                    "Activity";

                const date =
                    formatDate(
                        activity.created_at
                    );

                return `
                    <div class="activity-item">

                        <div class="activity-icon">
                            •
                        </div>

                        <div class="activity-content">

                            <div class="activity-title">
                                ${escapeHTML(title)}
                            </div>

                            <div class="activity-meta">
                                ${escapeHTML(date)}
                            </div>

                        </div>

                    </div>
                `;

            }).join("");
    }


    /* =====================================================
       COURSE MANAGEMENT
    ===================================================== */

    function setupCourseManagement() {

        if (courseSearch) {

            courseSearch.addEventListener(
                "input",
                renderFilteredCourses
            );
        }

        if (courseFilter) {

            courseFilter.addEventListener(
                "change",
                renderFilteredCourses
            );
        }


        /*
         * Create button is injected into the existing
         * Courses header.
         */

        addCreateCourseButton();
    }


    function addCreateCourseButton() {

        const coursesHeader =
            document.querySelector(
                ".courses-header"
            );

        if (!coursesHeader) {
            return;
        }

        if (
            document.getElementById(
                "create-course-button"
            )
        ) {
            return;
        }


        const button =
            document.createElement("button");

        button.type = "button";

        button.id =
            "create-course-button";

        button.className =
            "primary-button";

        button.innerHTML =
            `<span>+</span> Create Course`;


        button.addEventListener(
            "click",
            () => openCourseModal()
        );


        coursesHeader.appendChild(button);
    }


    /* =====================================================
       LOAD COURSES
    ===================================================== */

    async function loadCourses() {

        if (!coursesList) {
            return;
        }

        coursesList.innerHTML =
            `<div class="courses-loading">

                <div class="courses-loading-icon">
                    ◌
                </div>

                Loading courses...

            </div>`;


        const {
            data,
            error
        } = await supabase
            .from("courses")
            .select("*")
            .order("sort_order", {
                ascending: true,
                nullsFirst: false
            })
            .order("created_at", {
                ascending: false
            });


        if (error) {

            console.error(
                "Course loading error:",
                error
            );

            coursesList.innerHTML =
                `<div class="courses-empty">

                    <div class="courses-empty-icon">
                        !
                    </div>

                    <h3>
                        Unable to load courses
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message ||
                            "An unexpected error occurred."
                        )}
                    </p>

                </div>`;

            if (courseCount) {
                courseCount.textContent =
                    "Error";
            }

            return;
        }


        allCourses = data || [];

        renderFilteredCourses();
    }


    /* =====================================================
       FILTER
    ===================================================== */

    function renderFilteredCourses() {

        const search =
            (
                courseSearch?.value ||
                ""
            )
            .trim()
            .toLowerCase();


        const filter =
            courseFilter?.value ||
            "all";


        let filtered =
            allCourses.filter(course => {

                const matchesSearch =
                    !search ||
                    String(
                        course.title || ""
                    )
                    .toLowerCase()
                    .includes(search) ||

                    String(
                        course.description || ""
                    )
                    .toLowerCase()
                    .includes(search) ||

                    String(
                        course.level || ""
                    )
                    .toLowerCase()
                    .includes(search) ||

                    String(
                        course.language || ""
                    )
                    .toLowerCase()
                    .includes(search);


                const status =
                    normalizeStatus(
                        course.status
                    );


                const matchesFilter =
                    filter === "all" ||
                    status === filter;


                return (
                    matchesSearch &&
                    matchesFilter
                );
            });


        if (courseCount) {

            courseCount.textContent =
                `${filtered.length} ${
                    filtered.length === 1
                        ? "course"
                        : "courses"
                }`;
        }


        renderCourses(filtered);
    }


    /* =====================================================
       RENDER COURSES
    ===================================================== */

    function renderCourses(courses) {

        if (!coursesList) {
            return;
        }


        if (!courses.length) {

            coursesList.innerHTML =
                `<div class="courses-empty">

                    <div class="courses-empty-icon">
                        ▣
                    </div>

                    <h3>
                        No courses found
                    </h3>

                    <p>
                        Try changing your search or filter,
                        or create a new course.
                    </p>

                </div>`;

            return;
        }


        coursesList.innerHTML =
            courses.map(course => {

                const status =
                    normalizeStatus(
                        course.status
                    );


                const cover =
                    course.cover_image ||
                    course.cover_url ||
                    course.image_url ||
                    "";


                return `
                    <div
                        class="course-row"
                        data-course-id="${escapeAttribute(
                            course.id
                        )}"
                    >

                        <div class="course-main">

                            <div class="course-cover">

                                ${
                                    cover
                                        ? `
                                            <img
                                                src="${escapeAttribute(
                                                    cover
                                                )}"
                                                alt="${escapeAttribute(
                                                    course.title ||
                                                    "Course"
                                                )}"
                                            >
                                          `
                                        : `
                                            <div class="course-cover-placeholder">
                                                ▣
                                            </div>
                                          `
                                }

                            </div>


                            <div class="course-info">

                                <div class="course-title">
                                    ${escapeHTML(
                                        course.title ||
                                        "Untitled Course"
                                    )}
                                </div>

                                <div class="course-description">
                                    ${escapeHTML(
                                        course.description ||
                                        "No description"
                                    )}
                                </div>

                            </div>

                        </div>


                        <div class="course-category">

                            ${escapeHTML(
                                course.language ||
                                course.category ||
                                "—"
                            )}

                        </div>


                        <div class="course-level">

                            ${escapeHTML(
                                course.level ||
                                "—"
                            )}

                        </div>


                        <div>

                            <span
                                class="course-status ${status}"
                            >
                                ${capitalize(
                                    status
                                )}
                            </span>

                        </div>


                        <div class="course-updated">

                            ${formatDate(
                                course.updated_at ||
                                course.created_at
                            )}

                        </div>


                        <div class="course-actions">

                            ${getCourseActions(course)}

                        </div>

                    </div>
                `;

            }).join("");


        attachCourseActions();
    }


    /* =====================================================
       COURSE ACTIONS
    ===================================================== */

    function getCourseActions(course) {

        const status =
            normalizeStatus(
                course.status
            );


        let buttons = `
            <button
                type="button"
                class="course-action edit"
                data-action="edit"
                data-id="${escapeAttribute(course.id)}"
            >
                Edit
            </button>
        `;


        if (status === "published") {

            buttons += `
                <button
                    type="button"
                    class="course-action"
                    data-action="unpublish"
                    data-id="${escapeAttribute(course.id)}"
                >
                    Unpublish
                </button>
            `;

        } else if (status === "draft") {

            buttons += `
                <button
                    type="button"
                    class="course-action publish"
                    data-action="publish"
                    data-id="${escapeAttribute(course.id)}"
                >
                    Publish
                </button>
            `;
        }


        if (status !== "archived") {

            buttons += `
                <button
                    type="button"
                    class="course-action"
                    data-action="duplicate"
                    data-id="${escapeAttribute(course.id)}"
                >
                    Duplicate
                </button>

                <button
                    type="button"
                    class="course-action danger"
                    data-action="archive"
                    data-id="${escapeAttribute(course.id)}"
                >
                    Archive
                </button>
            `;

        } else {

            buttons += `
                <button
                    type="button"
                    class="course-action restore"
                    data-action="restore"
                    data-id="${escapeAttribute(course.id)}"
                >
                    Restore
                </button>
            `;
        }


        return buttons;
    }


    function attachCourseActions() {

        document
            .querySelectorAll(
                ".course-action"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async event => {

                        const action =
                            event.currentTarget
                                .dataset.action;

                        const id =
                            event.currentTarget
                                .dataset.id;


                        if (!id) {
                            return;
                        }


                        if (action === "edit") {
                            openCourseModal(id);
                        }

                        if (action === "publish") {
                            await updateCourseStatus(
                                id,
                                "published"
                            );
                        }

                        if (action === "unpublish") {
                            await updateCourseStatus(
                                id,
                                "draft"
                            );
                        }

                        if (action === "archive") {
                            await archiveCourse(id);
                        }

                        if (action === "restore") {
                            await updateCourseStatus(
                                id,
                                "draft"
                            );
                        }

                        if (action === "duplicate") {
                            await duplicateCourse(id);
                        }

                    }
                );
            });
    }


    /* =====================================================
       CREATE / EDIT MODAL
    ===================================================== */

    function openCourseModal(courseId = null) {

        editingCourseId =
            courseId || null;


        let course = null;


        if (courseId) {

            course =
                allCourses.find(
                    item =>
                        String(item.id) ===
                        String(courseId)
                );

            if (!course) {
                alert(
                    "The selected course could not be found."
                );
                return;
            }
        }


        removeCourseModal();


        const modal =
            document.createElement("div");

        modal.id =
            "course-management-modal";

        modal.className =
            "course-modal";


        modal.innerHTML = `
            <div
                class="course-modal-backdrop"
                data-modal-close="true"
            ></div>


            <div
                class="course-modal-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="course-modal-title"
            >

                <div class="course-modal-header">

                    <div>

                        <div class="course-modal-kicker">
                            COURSE MANAGEMENT
                        </div>

                        <h2 id="course-modal-title">
                            ${
                                course
                                    ? "Edit Course"
                                    : "Create Course"
                            }
                        </h2>

                    </div>

                    <button
                        type="button"
                        class="course-modal-close"
                        id="course-modal-close"
                        aria-label="Close"
                    >
                        ×
                    </button>

                </div>


                <form
                    id="course-form"
                    class="course-form"
                >

                    <div class="course-form-grid">

                        <div class="course-field full">

                            <label for="course-title-input">
                                Course Title
                            </label>

                            <input
                                id="course-title-input"
                                name="title"
                                type="text"
                                required
                                maxlength="200"
                                placeholder="e.g. English A1"
                                value="${escapeAttribute(
                                    course?.title || ""
                                )}"
                            >

                        </div>


                        <div class="course-field full">

                            <label for="course-description-input">
                                Description
                            </label>

                            <textarea
                                id="course-description-input"
                                name="description"
                                rows="4"
                                maxlength="2000"
                                placeholder="Describe this course..."
                            >${escapeHTML(
                                course?.description || ""
                            )}</textarea>

                        </div>


                        <div class="course-field">

                            <label for="course-language-input">
                                Language
                            </label>

                            <input
                                id="course-language-input"
                                name="language"
                                type="text"
                                maxlength="100"
                                placeholder="English"
                                value="${escapeAttribute(
                                    course?.language ||
                                    course?.category ||
                                    ""
                                )}"
                            >

                        </div>


                        <div class="course-field">

                            <label for="course-level-input">
                                Level
                            </label>

                            <input
                                id="course-level-input"
                                name="level"
                                type="text"
                                maxlength="100"
                                placeholder="A1"
                                value="${escapeAttribute(
                                    course?.level || ""
                                )}"
                            >

                        </div>


                        <div class="course-field full">

                            <label for="course-cover-input">
                                Cover Image URL
                            </label>

                            <input
                                id="course-cover-input"
                                name="cover_image"
                                type="url"
                                maxlength="1000"
                                placeholder="https://..."
                                value="${escapeAttribute(
                                    course?.cover_image ||
                                    course?.cover_url ||
                                    course?.image_url ||
                                    ""
                                )}"
                            >

                        </div>


                        <div class="course-field">

                            <label for="course-status-input">
                                Status
                            </label>

                            <select
                                id="course-status-input"
                                name="status"
                            >

                                <option
                                    value="draft"
                                    ${
                                        !course ||
                                        normalizeStatus(
                                            course.status
                                        ) === "draft"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Draft
                                </option>

                                <option
                                    value="published"
                                    ${
                                        course &&
                                        normalizeStatus(
                                            course.status
                                        ) === "published"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Published
                                </option>

                            </select>

                        </div>


                        <div class="course-field">

                            <label for="course-order-input">
                                Display Order
                            </label>

                            <input
                                id="course-order-input"
                                name="sort_order"
                                type="number"
                                min="0"
                                step="1"
                                value="${escapeAttribute(
                                    course?.sort_order ?? 0
                                )}"
                            >

                        </div>

                    </div>


                    <div
                        id="course-form-error"
                        class="course-form-error"
                        hidden
                    ></div>


                    <div class="course-modal-footer">

                        <button
                            type="button"
                            class="secondary-button"
                            id="course-cancel-button"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            class="primary-button"
                            id="course-save-button"
                        >
                            ${
                                course
                                    ? "Save Changes"
                                    : "Create Course"
                            }
                        </button>

                    </div>

                </form>

            </div>
        `;


        document.body.appendChild(modal);

        document.body.classList.add(
            "modal-open"
        );


        const closeButton =
            document.getElementById(
                "course-modal-close"
            );

        const cancelButton =
            document.getElementById(
                "course-cancel-button"
            );

        const form =
            document.getElementById(
                "course-form"
            );


        closeButton?.addEventListener(
            "click",
            removeCourseModal
        );

        cancelButton?.addEventListener(
            "click",
            removeCourseModal
        );


        modal
            .querySelector(
                ".course-modal-backdrop"
            )
            ?.addEventListener(
                "click",
                removeCourseModal
            );


        form?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                await saveCourse(
                    new FormData(form)
                );
            }
        );


        setTimeout(() => {

            document
                .getElementById(
                    "course-title-input"
                )
                ?.focus();

        }, 50);
    }


    function removeCourseModal() {

        const modal =
            document.getElementById(
                "course-management-modal"
            );

        if (modal) {
            modal.remove();
        }

        document.body.classList.remove(
            "modal-open"
        );

        editingCourseId = null;
    }


    /* =====================================================
       SAVE COURSE
    ===================================================== */

    async function saveCourse(formData) {

        const title =
            String(
                formData.get("title") || ""
            ).trim();

        const description =
            String(
                formData.get("description") || ""
            ).trim();

        const language =
            String(
                formData.get("language") || ""
            ).trim();

        const level =
            String(
                formData.get("level") || ""
            ).trim();

        const coverImage =
            String(
                formData.get("cover_image") || ""
            ).trim();

        const status =
            String(
                formData.get("status") ||
                "draft"
            ).trim();

        const sortOrder =
            Number(
                formData.get("sort_order") || 0
            );


        if (!title) {

            showFormError(
                "Course title is required."
            );

            return;
        }


        const saveButton =
            document.getElementById(
                "course-save-button"
            );


        if (saveButton) {

            saveButton.disabled = true;

            saveButton.textContent =
                editingCourseId
                    ? "Saving..."
                    : "Creating...";
        }


        try {

            const payload = {
                title,
                description:
                    description || null,
                language:
                    language || null,
                level:
                    level || null,
                cover_image:
                    coverImage || null,
                status:
                    status === "published"
                        ? "published"
                        : "draft",
                sort_order:
                    Number.isFinite(sortOrder)
                        ? sortOrder
                        : 0
            };


            if (editingCourseId) {

                const {
                    error
                } = await supabase
                    .from("courses")
                    .update(payload)
                    .eq(
                        "id",
                        editingCourseId
                    );


                if (error) {
                    throw error;
                }


                removeCourseModal();

                await loadCourses();

                await loadDashboard();

                await createActivity(
                    "course_updated",
                    `Updated course: ${title}`
                );


                showToast(
                    "Course updated successfully."
                );


            } else {

                const slug =
                    await generateUniqueSlug(
                        title
                    );


                payload.slug =
                    slug;


                const {
                    data,
                    error
                } = await supabase
                    .from("courses")
                    .insert(payload)
                    .select()
                    .single();


                if (error) {
                    throw error;
                }


                removeCourseModal();

                await loadCourses();

                await loadDashboard();

                await createActivity(
                    "course_created",
                    `Created course: ${
                        data?.title || title
                    }`
                );


                showToast(
                    "Course created successfully."
                );
            }


        } catch (error) {

            console.error(
                "Course save error:",
                error
            );

            showFormError(
                error.message ||
                "Unable to save the course."
            );


            if (saveButton) {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    editingCourseId
                        ? "Save Changes"
                        : "Create Course";
            }
        }
    }


    /* =====================================================
       SLUG
    ===================================================== */

    async function generateUniqueSlug(title) {

        let baseSlug =
            title
                .toLowerCase()
                .trim()
                .replace(
                    /[^a-z0-9]+/g,
                    "-"
                )
                .replace(
                    /^-+|-+$/g,
                    ""
                );


        if (!baseSlug) {
            baseSlug = "course";
        }


        let slug = baseSlug;

        let counter = 2;


        while (true) {

            const {
                data,
                error
            } = await supabase
                .from("courses")
                .select("id")
                .eq("slug", slug)
                .limit(1);


            if (error) {
                throw error;
            }


            if (!data || !data.length) {
                return slug;
            }


            slug =
                `${baseSlug}-${counter}`;

            counter++;
        }
    }


    /* =====================================================
       PUBLISH / UNPUBLISH
    ===================================================== */

    async function updateCourseStatus(
        courseId,
        status
    ) {

        const course =
            allCourses.find(
                item =>
                    String(item.id) ===
                    String(courseId)
            );


        if (!course) {
            return;
        }


        const actionText =
            status === "published"
                ? "publish"
                : "move back to draft";


        const confirmed =
            window.confirm(
                `Are you sure you want to ${actionText} "${course.title}"?`
            );


        if (!confirmed) {
            return;
        }


        try {

            const {
                error
            } = await supabase
                .from("courses")
                .update({
                    status
                })
                .eq(
                    "id",
                    courseId
                );


            if (error) {
                throw error;
            }


            await createActivity(
                status === "published"
                    ? "course_published"
                    : "course_unpublished",
                `${
                    status === "published"
                        ? "Published"
                        : "Unpublished"
                } course: ${course.title}`
            );


            await loadCourses();

            await loadDashboard();


            showToast(
                status === "published"
                    ? "Course published."
                    : "Course moved back to draft."
            );


        } catch (error) {

            console.error(
                "Course status update error:",
                error
            );

            alert(
                error.message ||
                "Unable to update course status."
            );
        }
    }


    /* =====================================================
       ARCHIVE
    ===================================================== */

    async function archiveCourse(courseId) {

        const course =
            allCourses.find(
                item =>
                    String(item.id) ===
                    String(courseId)
            );


        if (!course) {
            return;
        }


        const confirmed =
            window.confirm(
                `Archive "${course.title}"?\n\nThe course will not be permanently deleted. It will be moved to Archived.`
            );


        if (!confirmed) {
            return;
        }


        try {

            const {
                error
            } = await supabase
                .from("courses")
                .update({
                    status: "archived"
                })
                .eq(
                    "id",
                    courseId
                );


            if (error) {
                throw error;
            }


            await createActivity(
                "course_archived",
                `Archived course: ${course.title}`
            );


            await loadCourses();

            await loadDashboard();


            showToast(
                "Course archived."
            );


        } catch (error) {

            console.error(
                "Course archive error:",
                error
            );

            alert(
                error.message ||
                "Unable to archive course."
            );
        }
    }


    /* =====================================================
       DUPLICATE
    ===================================================== */

    async function duplicateCourse(courseId) {

        const course =
            allCourses.find(
                item =>
                    String(item.id) ===
                    String(courseId)
            );


        if (!course) {
            return;
        }


        const confirmed =
            window.confirm(
                `Duplicate "${course.title}"?\n\nA new draft course will be created.`
            );


        if (!confirmed) {
            return;
        }


        try {

            const duplicateTitle =
                `${course.title} Copy`;


            const duplicateSlug =
                await generateUniqueSlug(
                    duplicateTitle
                );


            const newCourse = {

                title:
                    duplicateTitle,

                slug:
                    duplicateSlug,

                description:
                    course.description ||
                    null,

                language:
                    course.language ||
                    course.category ||
                    null,

                level:
                    course.level ||
                    null,

                cover_image:
                    course.cover_image ||
                    course.cover_url ||
                    course.image_url ||
                    null,

                status:
                    "draft",

                sort_order:
                    course.sort_order ??
                    0
            };


            const {
                data,
                error
            } = await supabase
                .from("courses")
                .insert(newCourse)
                .select()
                .single();


            if (error) {
                throw error;
            }


            /*
             * Important:
             * Course duplication creates the course itself.
             *
             * Units and lessons are intentionally NOT
             * duplicated in Phase 4.
             *
             * That belongs to Unit/Lesson Management.
             */


            await createActivity(
                "course_duplicated",
                `Duplicated course: ${course.title}`
            );


            await loadCourses();

            await loadDashboard();


            showToast(
                `Course duplicated as "${data?.title || duplicateTitle}".`
            );


        } catch (error) {

            console.error(
                "Course duplication error:",
                error
            );

            alert(
                error.message ||
                "Unable to duplicate course."
            );
        }
    }


    /* =====================================================
       ACTIVITY
    ===================================================== */

    async function createActivity(
        activityType,
        title
    ) {

        try {

            /*
             * Activity logging is optional.
             * If your existing activities table has
             * different required fields, course management
             * itself is not blocked by this function.
             */

            const payload = {

                activity_type:
                    activityType,

                title,

                created_at:
                    new Date().toISOString()
            };


            if (
                currentUser?.id
            ) {
                payload.user_id =
                    currentUser.id;
            }


            const {
                error
            } = await supabase
                .from("activities")
                .insert(payload);


            if (error) {

                console.warn(
                    "Activity was not recorded:",
                    error
                );
            }

        } catch (error) {

            console.warn(
                "Activity logging failed:",
                error
            );
        }
    }


    /* =====================================================
       FORM ERROR
    ===================================================== */

    function showFormError(message) {

        const errorBox =
            document.getElementById(
                "course-form-error"
            );

        if (!errorBox) {
            alert(message);
            return;
        }

        errorBox.textContent =
            message;

        errorBox.hidden = false;
    }


    /* =====================================================
       DASHBOARD ERROR
    ===================================================== */

    function showDashboardError(
        message
    ) {

        if (!dashboardError) {
            return;
        }

        const span =
            dashboardError.querySelector(
                "span"
            );

        if (span) {
            span.textContent =
                message;
        }

        dashboardError.classList.remove(
            "admin-hidden"
        );
    }


    function hideDashboardError() {

        if (!dashboardError) {
            return;
        }

        dashboardError.classList.add(
            "admin-hidden"
        );
    }


    if (dashboardRetry) {

        dashboardRetry.addEventListener(
            "click",
            loadDashboard
        );
    }


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(message) {

        const existing =
            document.getElementById(
                "admin-toast"
            );

        if (existing) {
            existing.remove();
        }


        const toast =
            document.createElement(
                "div"
            );

        toast.id =
            "admin-toast";

        toast.textContent =
            message;


        document.body.appendChild(
            toast
        );


        requestAnimationFrame(() => {

            toast.classList.add(
                "show"
            );
        });


        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

            setTimeout(
                () => toast.remove(),
                250
            );

        }, 3000);
    }


    /* =====================================================
       UTILITIES
    ===================================================== */

    function normalizeStatus(status) {

        const value =
            String(
                status || "draft"
            )
            .toLowerCase()
            .trim();


        if (
            value === "published" ||
            value === "archived"
        ) {
            return value;
        }

        return "draft";
    }


    function capitalize(value) {

        if (!value) {
            return "";
        }

        return (
            value.charAt(0).toUpperCase() +
            value.slice(1)
        );
    }


    function formatDate(dateValue) {

        if (!dateValue) {
            return "—";
        }


        const date =
            new Date(dateValue);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }


        return date.toLocaleDateString(
            undefined,
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    function escapeHTML(value) {

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


    function escapeAttribute(value) {
        return escapeHTML(value);
    }

});
