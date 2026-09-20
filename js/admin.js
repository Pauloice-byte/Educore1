/* =========================================================
   EDUCORE ADMIN
   COURSE MANAGEMENT + COURSE BUILDER + CAROUSEL
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const client =
        window.supabaseClient ||
        window.supabase ||
        null;

    if (!client || typeof client.from !== "function") {
        console.error("Supabase client is not available.");
        return;
    }

    /* =====================================================
       GLOBAL STATE
    ===================================================== */

    let allCourses = [];
    let editingCourseId = null;
    let courseModal = null;

    let allCarouselItems = [];
    let editingCarouselItemId = null;
    let carouselModal = null;
    let removeCarouselImage = false;

    /* =====================================================
       COURSE BUILDER STATE
    ===================================================== */

    let builderCourseId = null;

    let builderModules = [];
    let builderLessons = [];
    let builderSections = [];
    let builderActivities = [];
    let builderQuestions = [];
    let builderMedia = [];

    let builderSelectedModuleId = null;
    let builderSelectedLessonId = null;
    let builderSelectedSectionId = null;
    let builderSelectedActivityId = null;

    let builderModal = null;

    const $ = selector => document.querySelector(selector);
    const $$ = selector => document.querySelectorAll(selector);

    init();

    /* =====================================================
       INIT
    ===================================================== */

    async function init() {
        setupNavigation();
        setupSidebar();
        setupLogout();
        setupCourseControls();
        setupCarouselControls();
        setupBuilderControls();
        setupDashboardRetry();

        await loadAdminUser();
        await loadDashboard();
        await loadCourses();
        await loadCarouselItems();
    }

    /* =====================================================
       NAVIGATION
    ===================================================== */

    function setupNavigation() {
        $$(".nav-item").forEach(button => {
            button.addEventListener("click", () => {
                const section = button.dataset.section;

                if (!section) return;

                showSection(section);
                closeMobileSidebar();
            });
        });
    }

    function showSection(section) {
        $$(".nav-item").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.section === section
            );
        });

        $$(".admin-section").forEach(element => {
            element.classList.toggle(
                "active",
                element.id === `${section}-section`
            );
        });

        const pageTitle = $("#page-title");

        if (pageTitle) {
            const titles = {
                overview: "Overview",
                courses: "Courses",
                builder: "Course Builder",
                carousel: "Carousel",
                students: "Students",
                progress: "Progress",
                media: "Media",
                settings: "Settings"
            };

            pageTitle.textContent =
                titles[section] || section;
        }

        if (section === "courses") {
            loadCourses();
        }

        if (section === "carousel") {
            loadCarouselItems();
        }

        if (section === "builder") {
            populateBuilderCourses();

            if (builderCourseId) {
                loadBuilderCourse(builderCourseId);
            }
        }
    }

    /* =====================================================
       SIDEBAR
    ===================================================== */

    function setupSidebar() {
        const app = $("#admin-app");
        const toggle = $("#sidebar-toggle");
        const close = $("#mobile-sidebar-close");
        const overlay = $("#sidebar-overlay");

        if (toggle) {
            toggle.addEventListener("click", () => {
                if (window.innerWidth <= 768) {
                    app?.classList.toggle("sidebar-open");
                } else {
                    app?.classList.toggle("sidebar-collapsed");
                }
            });
        }

        close?.addEventListener(
            "click",
            closeMobileSidebar
        );

        overlay?.addEventListener(
            "click",
            closeMobileSidebar
        );

        window.addEventListener("resize", () => {
            if (window.innerWidth > 768) {
                app?.classList.remove("sidebar-open");
            }
        });
    }

    function closeMobileSidebar() {
        $("#admin-app")?.classList.remove(
            "sidebar-open"
        );
    }

    /* =====================================================
       LOGOUT
    ===================================================== */

    function setupLogout() {
        const button = $("#logout-button");

        if (!button) return;

        button.addEventListener(
            "click",
            async () => {
                try {
                    if (
                        typeof window.logout ===
                        "function"
                    ) {
                        await window.logout();
                        return;
                    }

                    await client.auth.signOut();

                    window.location.href =
                        "index.html";
                } catch (error) {
                    console.error(
                        "Logout error:",
                        error
                    );
                }
            }
        );
    }

    /* =====================================================
       ADMIN USER
    ===================================================== */

    async function loadAdminUser() {
        try {
            const { data, error } =
                await client.auth.getUser();

            if (error || !data?.user) return;

            const user = data.user;
            const metadata =
                user.user_metadata || {};

            const name =
                metadata.name ||
                metadata.full_name ||
                metadata.display_name ||
                user.email?.split("@")[0] ||
                "Administrator";

            const nameElement =
                $("#admin-name");

            if (nameElement) {
                nameElement.textContent = name;
            }

            const roleElement =
                $("#admin-role");

            if (roleElement) {
                roleElement.textContent = "Admin";
            }

            const avatar =
                $("#admin-avatar");

            if (avatar) {
                avatar.textContent =
                    name.charAt(0).toUpperCase();
            }
        } catch (error) {
            console.error(
                "Could not load admin user:",
                error
            );
        }
    }

    /* =====================================================
       DASHBOARD
    ===================================================== */

    async function loadDashboard() {
        try {
            await Promise.all([
                loadCourseCount(),
                loadModuleCount(),
                loadLessonCount(),
                loadStudentCount(),
                loadContentCounts(),
                loadRecentActivity()
            ]);

            hideDashboardError();
        } catch (error) {
            console.error(
                "Dashboard error:",
                error
            );

            showDashboardError();
        }
    }

    async function loadCourseCount() {
        const { count, error } =
            await client
                .from("courses")
                .select("id", {
                    count: "exact",
                    head: true
                })
                .neq("status", "archived");

        if (error) throw error;

        const element =
            $("#total-courses");

        if (element) {
            element.textContent =
                count ?? 0;
        }
    }

    /*
       The existing dashboard HTML uses
       #total-units. We keep that ID so the
       existing UI does not break, but count
       modules from the real database table.
    */

    async function loadModuleCount() {
        const element =
            $("#total-units");

        if (!element) return;

        try {
            const { count, error } =
                await client
                    .from("modules")
                    .select("id", {
                        count: "exact",
                        head: true
                    });

            if (error) throw error;

            element.textContent =
                count ?? 0;
        } catch (error) {
            console.warn(
                "Could not load modules:",
                error
            );

            element.textContent = "—";
        }
    }

    async function loadLessonCount() {
        const element =
            $("#total-lessons");

        if (!element) return;

        try {
            const { count, error } =
                await client
                    .from("lessons")
                    .select("id", {
                        count: "exact",
                        head: true
                    });

            if (error) throw error;

            element.textContent =
                count ?? 0;
        } catch (error) {
            console.warn(
                "Could not load lessons:",
                error
            );

            element.textContent = "—";
        }
    }

    async function loadStudentCount() {
        const element =
            $("#total-students");

        if (!element) return;

        try {
            const { count, error } =
                await client
                    .from("profiles")
                    .select("id", {
                        count: "exact",
                        head: true
                    })
                    .eq("role", "student");

            if (error) throw error;

            element.textContent =
                count ?? 0;
        } catch (error) {
            console.warn(
                "Could not load students:",
                error
            );

            element.textContent = "—";
        }
    }

    async function loadContentCounts() {
        const published =
            $("#published-content");

        const draft =
            $("#draft-content");

        try {
            const [
                publishedResult,
                draftResult
            ] = await Promise.all([
                client
                    .from("courses")
                    .select("id", {
                        count: "exact",
                        head: true
                    })
                    .eq(
                        "status",
                        "published"
                    ),

                client
                    .from("courses")
                    .select("id", {
                        count: "exact",
                        head: true
                    })
                    .eq(
                        "status",
                        "draft"
                    )
            ]);

            if (publishedResult.error) {
                throw publishedResult.error;
            }

            if (draftResult.error) {
                throw draftResult.error;
            }

            if (published) {
                published.textContent =
                    publishedResult.count ?? 0;
            }

            if (draft) {
                draft.textContent =
                    draftResult.count ?? 0;
            }
        } catch (error) {
            console.warn(
                "Could not load content counts:",
                error
            );

            if (published) {
                published.textContent = "—";
            }

            if (draft) {
                draft.textContent = "—";
            }
        }
    }

    async function loadRecentActivity() {
        const list =
            $("#activity-list");

        if (!list) return;

        try {
            const { data, error } =
                await client
                    .from("courses")
                    .select(
                        "id,title,status,created_at"
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    )
                    .limit(6);

            if (error) throw error;

            if (!data?.length) {
                list.innerHTML =
                    `<div class="activity-empty">
                        No recent course activity.
                    </div>`;

                return;
            }

            list.innerHTML =
                data
                    .map(course => {
                        let action =
                            "Course created";

                        if (
                            course.status ===
                            "published"
                        ) {
                            action =
                                "Course published";
                        } else if (
                            course.status ===
                            "archived"
                        ) {
                            action =
                                "Course archived";
                        }

                        return `
                            <div class="activity-item">
                                <div class="activity-icon">▣</div>

                                <div class="activity-content">
                                    <div class="activity-title">
                                        ${escapeHTML(action)}
                                    </div>

                                    <div class="activity-meta">
                                        ${escapeHTML(
                                            course.title
                                        )}
                                        ·
                                        ${formatDate(
                                            course.created_at
                                        )}
                                    </div>
                                </div>
                            </div>
                        `;
                    })
                    .join("");
        } catch (error) {
            console.warn(
                "Could not load activity:",
                error
            );

            list.innerHTML =
                `<div class="activity-error">
                    Could not load recent activity.
                </div>`;
        }
    }

    function setupDashboardRetry() {
        $("#dashboard-retry")
            ?.addEventListener(
                "click",
                loadDashboard
            );
    }

    function showDashboardError() {
        $("#dashboard-error")
            ?.classList.remove(
                "admin-hidden"
            );
    }

    function hideDashboardError() {
        $("#dashboard-error")
            ?.classList.add(
                "admin-hidden"
            );
    }

    /* =====================================================
       COURSES
    ===================================================== */

    function setupCourseControls() {
        $("#course-search")
            ?.addEventListener(
                "input",
                renderCourses
            );

        $("#course-filter")
            ?.addEventListener(
                "change",
                renderCourses
            );

        $("#create-course-button")
            ?.addEventListener(
                "click",
                () => openCourseModal()
            );
    }

    async function loadCourses() {
        const list =
            $("#courses-list");

        if (!list) return;

        list.innerHTML =
            `<div class="courses-loading">
                Loading courses...
            </div>`;

        try {
            const { data, error } =
                await client
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
                        slug,
                        archived_at
                    `)
                    .order(
                        "sort_order",
                        {
                            ascending: true,
                            nullsFirst: false
                        }
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );

            if (error) throw error;

            allCourses = data || [];

            renderCourses();
            populateBuilderCourses();
        } catch (error) {
            console.error(
                "Could not load courses:",
                error
            );

            list.innerHTML = `
                <div class="courses-empty">
                    <h3>Could not load courses</h3>
                    <p>
                        ${escapeHTML(
                            error.message ||
                            "Please try again."
                        )}
                    </p>
                </div>
            `;
        }
    }

    function renderCourses() {
        const list =
            $("#courses-list");

        const count =
            $("#course-count");

        if (!list) return;

        const searchTerm =
            (
                $("#course-search")
                    ?.value || ""
            )
                .trim()
                .toLowerCase();

        const filter =
            $("#course-filter")
                ?.value || "all";

        let courses =
            [...allCourses];

        if (filter !== "all") {
            courses =
                courses.filter(
                    course =>
                        normalizeStatus(
                            course.status
                        ) === filter
                );
        }

        if (searchTerm) {
            courses =
                courses.filter(course => {
                    const text =
                        `${course.title || ""}
                         ${course.description || ""}
                         ${course.category || ""}
                         ${course.level || ""}`
                            .toLowerCase();

                    return text.includes(
                        searchTerm
                    );
                });
        }

        if (count) {
            count.textContent =
                `${courses.length} ${
                    courses.length === 1
                        ? "course"
                        : "courses"
                }`;
        }

        if (!courses.length) {
            list.innerHTML =
                `<div class="courses-empty">
                    <h3>No courses found</h3>
                    <p>
                        Create a course or change
                        your search/filter.
                    </p>
                </div>`;

            return;
        }

        list.innerHTML =
            courses
                .map(renderCourseRow)
                .join("");

        attachCourseActions();
    }

    function renderCourseRow(course) {
        const status =
            normalizeStatus(
                course.status
            );

        const image =
            course.cover_image
                ? `
                    <img
                        src="${escapeAttribute(
                            course.cover_image
                        )}"
                        alt="${escapeAttribute(
                            course.title
                        )}"
                        onerror="
                            this.style.display='none';
                        "
                    >
                `
                : `
                    <div class="course-cover-placeholder">
                        ▤
                    </div>
                `;

        return `
            <div class="course-row">

                <div class="course-main">

                    <div class="course-cover">
                        ${image}
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
                                "No description."
                            )}
                        </div>

                    </div>

                </div>

                <div class="course-category">
                    ${escapeHTML(
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

                <div class="course-level">
                    <span class="course-status ${status}">
                        ${escapeHTML(status)}
                    </span>
                </div>

                <div class="course-updated">
                    ${formatDate(
                        course.created_at
                    )}
                </div>

                <div class="course-actions">

                    <button
                        type="button"
                        class="course-action-button"
                        data-course-action="edit"
                        data-course-id="${escapeAttribute(
                            course.id
                        )}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="course-action-button"
                        data-course-action="${
                            status === "published"
                                ? "unpublish"
                                : "publish"
                        }"
                        data-course-id="${escapeAttribute(
                            course.id
                        )}"
                    >
                        ${
                            status === "published"
                                ? "Unpublish"
                                : "Publish"
                        }
                    </button>

                    <button
                        type="button"
                        class="course-action-button"
                        data-course-action="build"
                        data-course-id="${escapeAttribute(
                            course.id
                        )}"
                    >
                        Build
                    </button>

                    <button
                        type="button"
                        class="course-action-button"
                        data-course-action="duplicate"
                        data-course-id="${escapeAttribute(
                            course.id
                        )}"
                    >
                        Duplicate
                    </button>

                    <button
                        type="button"
                        class="course-action-button danger"
                        data-course-action="${
                            status === "archived"
                                ? "restore"
                                : "archive"
                        }"
                        data-course-id="${escapeAttribute(
                            course.id
                        )}"
                    >
                        ${
                            status === "archived"
                                ? "Restore"
                                : "Archive"
                        }
                    </button>

                </div>

            </div>
        `;
    }

    function attachCourseActions() {
        $$(
            "[data-course-action]"
        ).forEach(button => {
            button.addEventListener(
                "click",
                async () => {
                    const course =
                        allCourses.find(
                            item =>
                                String(
                                    item.id
                                ) ===
                                String(
                                    button.dataset
                                        .courseId
                                )
                        );

                    if (!course) return;

                    const action =
                        button.dataset
                            .courseAction;

                    if (action === "edit") {
                        openCourseModal(course);
                    }

                    if (action === "build") {
                        openBuilderForCourse(
                            course.id
                        );
                    }

                    if (action === "publish") {
                        await publishCourse(
                            course
                        );
                    }

                    if (action === "unpublish") {
                        await unpublishCourse(
                            course
                        );
                    }

                    if (action === "duplicate") {
                        await duplicateCourse(
                            course
                        );
                    }

                    if (action === "archive") {
                        await archiveCourse(
                            course
                        );
                    }

                    if (action === "restore") {
                        await restoreCourse(
                            course
                        );
                    }
                }
            );
        });
    }

    /* =====================================================
       COURSE MODAL
    ===================================================== */

    function openCourseModal(
        course = null
    ) {
        editingCourseId =
            course?.id || null;

        courseModal?.remove();

        courseModal =
            document.createElement("div");

        courseModal.className =
            "course-modal";

        courseModal.innerHTML = `
            <div class="course-modal-backdrop"></div>

            <div
                class="course-modal-dialog"
                role="dialog"
                aria-modal="true"
            >

                <div class="course-modal-header">

                    <div>
                        <div class="course-modal-kicker">
                            COURSE
                        </div>

                        <h2>
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
                        id="close-course-modal"
                    >
                        ×
                    </button>

                </div>

                <form
                    id="course-form"
                    class="course-form"
                >

                    <div class="course-form-field">
                        <label for="course-title">
                            Course Title *
                        </label>

                        <input
                            id="course-title"
                            required
                            maxlength="200"
                            value="${escapeAttribute(
                                course?.title ||
                                ""
                            )}"
                        >
                    </div>

                    <div class="course-form-field">
                        <label for="course-description">
                            Description
                        </label>

                        <textarea
                            id="course-description"
                            rows="5"
                        >${escapeHTML(
                            course?.description ||
                            ""
                        )}</textarea>
                    </div>

                    <div class="course-form-grid">

                        <div class="course-form-field">
                            <label for="course-category">
                                Category
                            </label>

                            <input
                                id="course-category"
                                value="${escapeAttribute(
                                    course?.category ||
                                    ""
                                )}"
                            >
                        </div>

                        <div class="course-form-field">
                            <label for="course-level">
                                Level
                            </label>

                            <input
                                id="course-level"
                                value="${escapeAttribute(
                                    course?.level ||
                                    ""
                                )}"
                            >
                        </div>

                    </div>

                    <div class="course-form-field">

                        <label>
                            Course Cover
                        </label>

                        <label
                            for="course-cover-file"
                            class="course-upload-area"
                        >
                            <div class="upload-icon">
                                ↑
                            </div>

                            <strong>
                                Choose an image
                            </strong>

                            <span>
                                JPG, PNG or WebP · Max 5 MB
                            </span>
                        </label>

                        <input
                            id="course-cover-file"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            hidden
                        >

                        <input
                            id="course-cover-url"
                            type="url"
                            placeholder="Or enter image URL"
                            value="${escapeAttribute(
                                course?.cover_image ||
                                ""
                            )}"
                        >

                        <div
                            id="course-cover-preview"
                            class="course-cover-preview"
                            ${
                                course?.cover_image
                                    ? ""
                                    : "hidden"
                            }
                        >
                            <img
                                id="course-cover-preview-image"
                                src="${escapeAttribute(
                                    course?.cover_image ||
                                    ""
                                )}"
                                alt=""
                            >
                        </div>

                    </div>

                    <div class="course-form-field">
                        <label for="course-sort-order">
                            Sort Order
                        </label>

                        <input
                            type="number"
                            id="course-sort-order"
                            min="0"
                            step="1"
                            value="${course?.sort_order ?? 0}"
                        >
                    </div>

                    <div
                        id="course-form-error"
                        class="course-form-error"
                        hidden
                    ></div>

                    <div class="course-form-actions">

                        <button
                            type="button"
                            class="secondary-button"
                            id="cancel-course-modal"
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

        document.body.appendChild(
            courseModal
        );

        requestAnimationFrame(() => {
            courseModal?.classList.add(
                "open"
            );
        });

        document.body.classList.add(
            "modal-open"
        );

        $("#close-course-modal")
            ?.addEventListener(
                "click",
                closeCourseModal
            );

        $("#cancel-course-modal")
            ?.addEventListener(
                "click",
                closeCourseModal
            );

        courseModal
            .querySelector(
                ".course-modal-backdrop"
            )
            ?.addEventListener(
                "click",
                closeCourseModal
            );

        $("#course-form")
            ?.addEventListener(
                "submit",
                saveCourse
            );

        $("#course-cover-file")
            ?.addEventListener(
                "change",
                handleCourseCoverFile
            );
    }

    function handleCourseCoverFile(
        event
    ) {
        const file =
            event.target.files?.[0];

        if (!file) return;

        if (
            ![
                "image/jpeg",
                "image/png",
                "image/webp"
            ].includes(file.type)
        ) {
            showFormError(
                "Please select a JPG, PNG or WebP image."
            );

            event.target.value = "";

            return;
        }

        if (
            file.size >
            5 * 1024 * 1024
        ) {
            showFormError(
                "The course cover must be smaller than 5 MB."
            );

            event.target.value = "";

            return;
        }

        clearFormError();

        const reader =
            new FileReader();

        reader.onload = () => {
            const image =
                $("#course-cover-preview-image");

            const preview =
                $("#course-cover-preview");

            if (image) {
                image.src =
                    reader.result;
            }

            if (preview) {
                preview.hidden = false;
            }
        };

        reader.readAsDataURL(file);
    }

    async function saveCourse(event) {
        event.preventDefault();

        const title =
            $("#course-title")
                ?.value
                .trim();

        if (!title) {
            showFormError(
                "Course title is required."
            );

            return;
        }

        const description =
            $("#course-description")
                ?.value
                .trim();

        const category =
            $("#course-category")
                ?.value
                .trim();

        const level =
            $("#course-level")
                ?.value
                .trim();

        const coverUrl =
            $("#course-cover-url")
                ?.value
                .trim();

        const coverFile =
            $("#course-cover-file")
                ?.files?.[0];

        const sortOrder =
            Number(
                $("#course-sort-order")
                    ?.value || 0
            );

        const saveButton =
            $("#course-save-button");

        if (saveButton) {
            saveButton.disabled = true;

            saveButton.textContent =
                editingCourseId
                    ? "Saving..."
                    : "Creating...";
        }

        try {
            let finalCoverUrl =
                coverUrl || null;

            if (
                coverFile instanceof File &&
                coverFile.size > 0
            ) {
                finalCoverUrl =
                    await uploadCourseCover(
                        coverFile
                    );
            }

            const courseData = {
                title,
                description:
                    description || null,
                category:
                    category || null,
                level:
                    level || null,
                cover_image:
                    finalCoverUrl,
                sort_order:
                    sortOrder
            };

            if (editingCourseId) {
                const { error } =
                    await client
                        .from("courses")
                        .update(
                            courseData
                        )
                        .eq(
                            "id",
                            editingCourseId
                        );

                if (error) throw error;
            } else {
                courseData.status =
                    "draft";

                courseData.slug =
                    await createUniqueSlug(
                        title
                    );

                const { error } =
                    await client
                        .from("courses")
                        .insert(
                            courseData
                        );

                if (error) throw error;
            }

            closeCourseModal();

            await refreshCoursesAndDashboard();
        } catch (error) {
            console.error(
                "Could not save course:",
                error
            );

            showFormError(
                error.message ||
                "Could not save the course."
            );
        } finally {
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

    async function uploadCourseCover(
        file
    ) {
        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();

        const randomName =
            `${crypto.randomUUID()}.${extension}`;

        const filePath =
            `course-covers/${randomName}`;

        const {
            error: uploadError
        } =
            await client.storage
                .from("course-covers")
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl: "3600",
                        upsert: false,
                        contentType:
                            file.type
                    }
                );

        if (uploadError) {
            throw new Error(
                `Cover upload failed: ${uploadError.message}`
            );
        }

        const { data } =
            client.storage
                .from("course-covers")
                .getPublicUrl(
                    filePath
                );

        if (!data?.publicUrl) {
            throw new Error(
                "The cover was uploaded but its public URL could not be generated."
            );
        }

        return data.publicUrl;
    }

    function closeCourseModal() {
        courseModal?.remove();

        courseModal = null;
        editingCourseId = null;

        document.body.classList.remove(
            "modal-open"
        );
    }

    /* =====================================================
       COURSE STATUS
    ===================================================== */

    async function publishCourse(
        course
    ) {
        if (
            !confirm(
                `Publish "${course.title}"?`
            )
        ) {
            return;
        }

        await updateCourseStatus(
            course,
            "published"
        );
    }

    async function unpublishCourse(
        course
    ) {
        if (
            !confirm(
                `Unpublish "${course.title}" and return it to Draft?`
            )
        ) {
            return;
        }

        await updateCourseStatus(
            course,
            "draft"
        );
    }

    async function archiveCourse(
        course
    ) {
        if (
            !confirm(
                `Archive "${course.title}"?\n\nThe course will not be permanently deleted.`
            )
        ) {
            return;
        }

        try {
            const { error } =
                await client
                    .from("courses")
                    .update({
                        status:
                            "archived",
                        archived_at:
                            new Date()
                                .toISOString()
                    })
                    .eq(
                        "id",
                        course.id
                    );

            if (error) throw error;

            await refreshCoursesAndDashboard();
        } catch (error) {
            console.error(error);

            alert(
                error.message ||
                "Could not archive the course."
            );
        }
    }

    async function restoreCourse(
        course
    ) {
        if (
            !confirm(
                `Restore "${course.title}" to Draft?`
            )
        ) {
            return;
        }

        try {
            const { error } =
                await client
                    .from("courses")
                    .update({
                        status: "draft",
                        archived_at: null
                    })
                    .eq(
                        "id",
                        course.id
                    );

            if (error) throw error;

            await refreshCoursesAndDashboard();
        } catch (error) {
            console.error(error);

            alert(
                error.message ||
                "Could not restore the course."
            );
        }
    }

    async function updateCourseStatus(
        course,
        status
    ) {
        try {
            const { error } =
                await client
                    .from("courses")
                    .update({
                        status,
                        archived_at:
                            status ===
                            "archived"
                                ? new Date()
                                    .toISOString()
                                : null
                    })
                    .eq(
                        "id",
                        course.id
                    );

            if (error) throw error;

            await refreshCoursesAndDashboard();
        } catch (error) {
            console.error(error);

            alert(
                error.message ||
                "Could not update the course."
            );
        }
    }

    async function duplicateCourse(
        course
    ) {
        if (
            !confirm(
                `Duplicate "${course.title}"?\n\nThe duplicate will be created as a Draft.`
            )
        ) {
            return;
        }

        try {
            const duplicateTitle =
                `${course.title} Copy`;

            const duplicate = {
                title:
                    duplicateTitle,

                description:
                    course.description ||
                    null,

                category:
                    course.category ||
                    null,

                level:
                    course.level ||
                    null,

                cover_image:
                    course.cover_image ||
                    null,

                status:
                    "draft",

                sort_order:
                    course.sort_order ??
                    0,

                slug:
                    await createUniqueSlug(
                        duplicateTitle
                    ),

                archived_at: null
            };

            const { error } =
                await client
                    .from("courses")
                    .insert(
                        duplicate
                    );

            if (error) throw error;

            await refreshCoursesAndDashboard();
        } catch (error) {
            console.error(error);

            alert(
                error.message ||
                "Could not duplicate the course."
            );
        }
    }

    async function createUniqueSlug(
        title
    ) {
        const base =
            slugify(title) ||
            "course";

        let slug = base;
        let counter = 1;

        while (true) {
            const { data, error } =
                await client
                    .from("courses")
                    .select("id")
                    .eq(
                        "slug",
                        slug
                    )
                    .limit(1);

            if (error) throw error;

            if (
                !data ||
                data.length === 0
            ) {
                return slug;
            }

            counter++;

            slug =
                `${base}-${counter}`;
        }
    }

    function slugify(value) {
        return String(value)
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .toLowerCase()
            .trim()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-+|-+$/g,
                "");
    }

    async function refreshCoursesAndDashboard() {
        await Promise.all([
            loadCourses(),
            loadDashboard()
        ]);
    }

    function showFormError(
        message
    ) {
        const element =
            $("#course-form-error");

        if (!element) return;

        element.textContent =
            message;

        element.hidden = false;
    }

    function clearFormError() {
        const element =
            $("#course-form-error");

        if (!element) return;

        element.textContent = "";
        element.hidden = true;
    }

    /* =====================================================
       COURSE BUILDER
    ===================================================== */

    function setupBuilderControls() {
        const select =
            $("#builder-course-select");

        if (!select) return;

        select.addEventListener(
            "change",
            async event => {
                const courseId =
                    event.target.value;

                builderCourseId =
                    courseId || null;

                if (!courseId) {
                    resetBuilderState();
                    renderBuilderEmpty();
                    return;
                }

                await loadBuilderCourse(
                    courseId
                );
            }
        );
    }

    function resetBuilderState() {
        builderModules = [];
        builderLessons = [];
        builderSections = [];
        builderActivities = [];
        builderQuestions = [];
        builderMedia = [];

        builderSelectedModuleId = null;
        builderSelectedLessonId = null;
        builderSelectedSectionId = null;
        builderSelectedActivityId = null;
    }

    function populateBuilderCourses() {
        const select =
            $("#builder-course-select");

        if (!select) return;

        const currentValue =
            builderCourseId ||
            select.value ||
            "";

        select.innerHTML =
            `<option value="">
                Select a course...
            </option>`;

        allCourses
            .filter(
                course =>
                    normalizeStatus(
                        course.status
                    ) !== "archived"
            )
            .forEach(course => {
                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    course.id;

                option.textContent =
                    course.title ||
                    "Untitled Course";

                select.appendChild(
                    option
                );
            });

        if (
            currentValue &&
            allCourses.some(
                course =>
                    String(course.id) ===
                    String(currentValue)
            )
        ) {
            select.value =
                currentValue;
        }
    }

    function openBuilderForCourse(
        courseId
    ) {
        builderCourseId =
            courseId;

        showSection("builder");

        const select =
            $("#builder-course-select");

        if (select) {
            select.value =
                String(courseId);
        }

        loadBuilderCourse(
            courseId
        );
    }

    /* =====================================================
       LOAD REAL COURSE STRUCTURE
    ===================================================== */

    async function loadBuilderCourse(
        courseId
    ) {
        if (!courseId) return;

        const workspace =
            $("#builder-workspace");

        if (!workspace) return;

        workspace.className =
            "builder-workspace";

        workspace.innerHTML =
            `<div class="builder-loading">
                Loading course structure...
            </div>`;

        const course =
            allCourses.find(
                item =>
                    String(item.id) ===
                    String(courseId)
            );

        const summary =
            $("#builder-course-summary");

        if (summary) {
            summary.innerHTML = `
                <strong>
                    ${escapeHTML(
                        course?.title ||
                        "Course"
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        course?.category ||
                        "Course"
                    )}
                    ·
                    ${escapeHTML(
                        course?.level ||
                        "All levels"
                    )}
                </span>
            `;
        }

        try {
            resetBuilderState();

            /*
               1. MODULES
            */

            const modulesResult =
                await client
                    .from("modules")
                    .select("*")
                    .eq(
                        "course_id",
                        courseId
                    )
                    .order(
                        "sort_order",
                        {
                            ascending: true
                        }
                    );

            if (modulesResult.error) {
                throw modulesResult.error;
            }

            builderModules =
                modulesResult.data ||
                [];

            /*
               2. LESSONS
            */

            if (builderModules.length) {
                const moduleIds =
                    builderModules.map(
                        module =>
                            module.id
                    );

                const lessonsResult =
                    await client
                        .from("lessons")
                        .select("*")
                        .in(
                            "module_id",
                            moduleIds
                        )
                        .order(
                            "sort_order",
                            {
                                ascending: true
                            }
                        );

                if (
                    lessonsResult.error
                ) {
                    throw lessonsResult.error;
                }

                builderLessons =
                    lessonsResult.data ||
                    [];
            }

            /*
               3. LESSON SECTIONS
            */

            if (builderLessons.length) {
                const lessonIds =
                    builderLessons.map(
                        lesson =>
                            lesson.id
                    );

                const sectionsResult =
                    await client
                        .from(
                            "lesson_sections"
                        )
                        .select("*")
                        .in(
                            "lesson_id",
                            lessonIds
                        )
                        .order(
                            "sort_order",
                            {
                                ascending: true
                            }
                        );

                if (
                    sectionsResult.error
                ) {
                    throw sectionsResult.error;
                }

                builderSections =
                    sectionsResult.data ||
                    [];
            }

            /*
               4. ACTIVITIES
            */

            if (builderSections.length) {
                const sectionIds =
                    builderSections.map(
                        section =>
                            section.id
                    );

                const activitiesResult =
                    await client
                        .from(
                            "activities"
                        )
                        .select("*")
                        .in(
                            "section_id",
                            sectionIds
                        )
                        .order(
                            "sort_order",
                            {
                                ascending: true
                            }
                        );

                if (
                    activitiesResult.error
                ) {
                    throw activitiesResult.error;
                }

                builderActivities =
                    activitiesResult.data ||
                    [];
            }

            /*
               5. QUESTIONS
            */

            if (builderActivities.length) {
                const activityIds =
                    builderActivities.map(
                        activity =>
                            activity.id
                    );

                const questionsResult =
                    await client
                        .from("questions")
                        .select("*")
                        .in(
                            "activity_id",
                            activityIds
                        )
                        .order(
                            "sort_order",
                            {
                                ascending: true
                            }
                        );

                if (
                    questionsResult.error
                ) {
                    /*
                       Questions are useful but
                       should not make the entire
                       builder unusable if the
                       table has a permissions issue.
                    */

                    console.warn(
                        "Could not load questions:",
                        questionsResult.error
                    );

                    builderQuestions = [];
                } else {
                    builderQuestions =
                        questionsResult.data ||
                        [];
                }
            }

            /*
               6. MEDIA
            */

            if (builderActivities.length) {
                const activityIds =
                    builderActivities.map(
                        activity =>
                            activity.id
                    );

                const mediaResult =
                    await client
                        .from("media")
                        .select("*")
                        .in(
                            "activity_id",
                            activityIds
                        );

                if (
                    mediaResult.error
                ) {
                    console.warn(
                        "Could not load activity media:",
                        mediaResult.error
                    );

                    builderMedia = [];
                } else {
                    builderMedia =
                        mediaResult.data ||
                        [];
                }
            }

            /*
               Default selections
            */

            builderSelectedModuleId =
                builderModules[0]?.id ||
                null;

            builderSelectedLessonId =
                builderLessons.find(
                    lesson =>
                        String(
                            lesson.module_id
                        ) ===
                        String(
                            builderSelectedModuleId
                        )
                )?.id || null;

            builderSelectedSectionId =
                builderSections.find(
                    section =>
                        String(
                            section.lesson_id
                        ) ===
                        String(
                            builderSelectedLessonId
                        )
                )?.id || null;

            builderSelectedActivityId =
                builderActivities.find(
                    activity =>
                        String(
                            activity.section_id
                        ) ===
                        String(
                            builderSelectedSectionId
                        )
                )?.id || null;

            renderBuilder();
        } catch (error) {
            console.error(
                "Could not load course builder:",
                error
            );

            workspace.innerHTML = `
                <div class="courses-empty">

                    <h3>
                        Course structure could not be loaded
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message ||
                            "Check the authoring tables and permissions in Supabase."
                        )}
                    </p>

                </div>
            `;
        }
    }

    function renderBuilderEmpty() {
        const workspace =
            $("#builder-workspace");

        if (!workspace) return;

        workspace.className =
            "builder-workspace builder-empty";

        workspace.innerHTML = `
            <div class="builder-empty-icon">
                ✦
            </div>

            <h3>
                Select a course
            </h3>

            <p>
                Choose a course above and
                start building its modules,
                lessons, sections and activities.
            </p>
        `;

        const summary =
            $("#builder-course-summary");

        if (summary) {
            summary.innerHTML = `
                <strong>
                    No course selected
                </strong>

                <span>
                    Select a course to begin authoring.
                </span>
            `;
        }
    }

    /* =====================================================
       BUILDER MAIN UI
    ===================================================== */

    function renderBuilder() {
        const workspace =
            $("#builder-workspace");

        if (!workspace) return;

        workspace.className =
            "builder-workspace";

        workspace.innerHTML = `
            <div class="builder-layout">

                <aside class="builder-tree">

                    <div class="builder-panel-heading">

                        <div>
                            <div class="panel-kicker">
                                STRUCTURE
                            </div>

                            <h3>
                                Modules
                            </h3>
                        </div>

                        <button
                            type="button"
                            class="builder-add-small"
                            id="add-module-button"
                            title="Add module"
                        >
                            +
                        </button>

                    </div>

                    <div
                        class="builder-tree-list"
                        id="builder-module-list"
                    >
                        ${
                            builderModules.length
                                ? builderModules
                                    .map(
                                        renderBuilderModule
                                    )
                                    .join("")
                                : `
                                    <div class="builder-tree-empty">
                                        No modules yet.
                                    </div>
                                `
                        }
                    </div>

                </aside>

                <section class="builder-editor">

                    ${renderBuilderEditor()}

                </section>

            </div>
        `;

        attachBuilderEvents();
    }

    function renderBuilderModule(
        module
    ) {
        const active =
            String(module.id) ===
            String(
                builderSelectedModuleId
            );

        const lessons =
            builderLessons.filter(
                lesson =>
                    String(
                        lesson.module_id
                    ) ===
                    String(module.id)
            );

        return `
            <div
                class="builder-unit ${
                    active
                        ? "selected"
                        : ""
                }"
            >

                <button
                    type="button"
                    class="builder-unit-main"
                    data-builder-action="select-module"
                    data-id="${escapeAttribute(
                        module.id
                    )}"
                >

                    <span class="builder-tree-icon">
                        ▤
                    </span>

                    <span>
                        ${escapeHTML(
                            module.title ||
                            "Untitled module"
                        )}
                    </span>

                </button>

                <button
                    type="button"
                    class="builder-tree-more"
                    data-builder-action="edit-module"
                    data-id="${escapeAttribute(
                        module.id
                    )}"
                >
                    •••
                </button>

                ${
                    active
                        ? `
                            <div class="builder-lessons">

                                ${lessons
                                    .map(
                                        renderBuilderLesson
                                    )
                                    .join("")}

                                <button
                                    type="button"
                                    class="builder-add-lesson"
                                    data-builder-action="add-lesson"
                                    data-module-id="${escapeAttribute(
                                        module.id
                                    )}"
                                >
                                    + Add lesson
                                </button>

                            </div>
                        `
                        : ""
                }

            </div>
        `;
    }

    function renderBuilderLesson(
        lesson
    ) {
        const active =
            String(lesson.id) ===
            String(
                builderSelectedLessonId
            );

        return `
            <button
                type="button"
                class="builder-lesson ${
                    active
                        ? "selected"
                        : ""
                }"
                data-builder-action="select-lesson"
                data-id="${escapeAttribute(
                    lesson.id
                )}"
            >

                <span>
                    ◫
                </span>

                <span>
                    ${escapeHTML(
                        lesson.title ||
                        "Untitled lesson"
                    )}
                </span>

            </button>
        `;
    }

    /* =====================================================
       BUILDER EDITOR
    ===================================================== */

    function renderBuilderEditor() {
        if (!builderSelectedModuleId) {
            return `
                <div class="builder-editor-empty">

                    <div class="builder-empty-icon">
                        ▤
                    </div>

                    <h3>
                        Build your first module
                    </h3>

                    <p>
                        Create a module, then
                        add lessons and learning
                        content.
                    </p>

                    <button
                        type="button"
                        class="primary-button"
                        id="editor-add-module"
                    >
                        + Add Module
                    </button>

                </div>
            `;
        }

        const module =
            builderModules.find(
                item =>
                    String(item.id) ===
                    String(
                        builderSelectedModuleId
                    )
            );

        const lessons =
            builderLessons.filter(
                lesson =>
                    String(
                        lesson.module_id
                    ) ===
                    String(
                        builderSelectedModuleId
                    )
            );

        if (!builderSelectedLessonId) {
            return `
                <div class="builder-editor-header">

                    <div>

                        <div class="section-kicker">
                            MODULE
                        </div>

                        <h2>
                            ${escapeHTML(
                                module?.title ||
                                "Module"
                            )}
                        </h2>

                        <p>
                            ${escapeHTML(
                                module?.description ||
                                "Add lessons to this module."
                            )}
                        </p>

                    </div>

                    <div class="builder-editor-actions">

                        <button
                            type="button"
                            class="secondary-button"
                            data-builder-action="edit-module"
                            data-id="${escapeAttribute(
                                module.id
                            )}"
                        >
                            Edit Module
                        </button>

                        <button
                            type="button"
                            class="primary-button"
                            data-builder-action="add-lesson"
                            data-module-id="${escapeAttribute(
                                module.id
                            )}"
                        >
                            + Add Lesson
                        </button>

                    </div>

                </div>

                <div class="builder-lesson-grid">

                    ${
                        lessons.length
                            ? lessons
                                .map(
                                    lesson => {
                                        const sectionCount =
                                            builderSections.filter(
                                                section =>
                                                    String(
                                                        section.lesson_id
                                                    ) ===
                                                    String(
                                                        lesson.id
                                                    )
                                            ).length;

                                        const activityCount =
                                            builderActivities.filter(
                                                activity => {
                                                    const section =
                                                        builderSections.find(
                                                            item =>
                                                                String(
                                                                    item.id
                                                                ) ===
                                                                String(
                                                                    activity.section_id
                                                                )
                                                        );

                                                    return (
                                                        section &&
                                                        String(
                                                            section.lesson_id
                                                        ) ===
                                                        String(
                                                            lesson.id
                                                        )
                                                    );
                                                }
                                            ).length;

                                        return `
                                            <button
                                                type="button"
                                                class="builder-lesson-card"
                                                data-builder-action="select-lesson"
                                                data-id="${escapeAttribute(
                                                    lesson.id
                                                )}"
                                            >

                                                <span class="lesson-card-icon">
                                                    ◫
                                                </span>

                                                <strong>
                                                    ${escapeHTML(
                                                        lesson.title ||
                                                        "Untitled lesson"
                                                    )}
                                                </strong>

                                                <span>
                                                    ${sectionCount}
                                                    section${
                                                        sectionCount === 1
                                                            ? ""
                                                            : "s"
                                                    }
                                                    ·
                                                    ${activityCount}
                                                    activit${
                                                        activityCount === 1
                                                            ? "y"
                                                            : "ies"
                                                    }
                                                </span>

                                            </button>
                                        `;
                                    }
                                )
                                .join("")
                            : `
                                <div class="builder-content-empty">

                                    <h3>
                                        No lessons yet
                                    </h3>

                                    <p>
                                        Create the first
                                        lesson in this module.
                                    </p>

                                </div>
                            `
                    }

                </div>
            `;
        }

        const lesson =
            builderLessons.find(
                item =>
                    String(item.id) ===
                    String(
                        builderSelectedLessonId
                    )
            );

        const sections =
            builderSections.filter(
                section =>
                    String(
                        section.lesson_id
                    ) ===
                    String(
                        builderSelectedLessonId
                    )
            );

        return `
            <div class="builder-editor-header">

                <div>

                    <div class="section-kicker">
                        LESSON
                    </div>

                    <h2>
                        ${escapeHTML(
                            lesson?.title ||
                            "Lesson"
                        )}
                    </h2>

                    <p>
                        ${escapeHTML(
                            lesson?.description ||
                            "Build this lesson with sections and activities."
                        )}
                    </p>

                </div>

                <div class="builder-editor-actions">

                    <button
                        type="button"
                        class="secondary-button"
                        data-builder-action="edit-lesson"
                        data-id="${escapeAttribute(
                            lesson.id
                        )}"
                    >
                        Edit Lesson
                    </button>

                    <button
                        type="button"
                        class="secondary-button"
                        data-builder-action="delete-lesson"
                        data-id="${escapeAttribute(
                            lesson.id
                        )}"
                    >
                        Delete Lesson
                    </button>

                    <button
                        type="button"
                        class="primary-button"
                        data-builder-action="add-section"
                    >
                        + Add Section
                    </button>

                </div>

            </div>

            <div class="builder-learning-loop">
                <span>Understand</span>
                <i>→</i>
                <span>See</span>
                <i>→</i>
                <span>Hear</span>
                <i>→</i>
                <span>Practice</span>
                <i>→</i>
                <span>Speak</span>
                <i>→</i>
                <span>Test</span>
            </div>

            <div class="builder-sections">

                ${
                    sections.length
                        ? sections
                            .map(
                                renderBuilderSection
                            )
                            .join("")
                        : `
                            <div class="builder-content-empty">

                                <div class="builder-empty-icon">
                                    +
                                </div>

                                <h3>
                                    This lesson has no sections
                                </h3>

                                <p>
                                    Create a section first.
                                    Activities are placed
                                    inside sections.
                                </p>

                                <button
                                    type="button"
                                    class="primary-button"
                                    data-builder-action="add-section"
                                >
                                    Add Section
                                </button>

                            </div>
                        `
                }

            </div>
        `;
    }

    function renderBuilderSection(
        section
    ) {
        const active =
            String(section.id) ===
            String(
                builderSelectedSectionId
            );

        const activities =
            builderActivities.filter(
                activity =>
                    String(
                        activity.section_id
                    ) ===
                    String(section.id)
            );

        return `
            <article
                class="builder-section-card ${
                    active
                        ? "selected"
                        : ""
                }"
            >

                <div class="builder-section-header">

                    <div>

                        <div class="section-kicker">
                            SECTION
                        </div>

                        <h3>
                            ${escapeHTML(
                                section.title ||
                                "Untitled Section"
                            )}
                        </h3>

                        ${
                            section.description
                                ? `
                                    <p>
                                        ${escapeHTML(
                                            section.description
                                        )}
                                    </p>
                                `
                                : ""
                        }

                    </div>

                    <div class="builder-editor-actions">

                        <button
                            type="button"
                            class="course-action-button"
                            data-builder-action="edit-section"
                            data-id="${escapeAttribute(
                                section.id
                            )}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="course-action-button danger"
                            data-builder-action="delete-section"
                            data-id="${escapeAttribute(
                                section.id
                            )}"
                        >
                            Delete
                        </button>

                    </div>

                </div>

                <div class="builder-activity-list">

                    ${
                        activities.length
                            ? activities
                                .map(
                                    renderBuilderActivity
                                )
                                .join("")
                            : `
                                <div class="builder-activity-empty">
                                    No activities in this section yet.
                                </div>
                            `
                    }

                </div>

                <div class="builder-section-footer">

                    <button
                        type="button"
                        class="primary-button"
                        data-builder-action="select-section"
                        data-id="${escapeAttribute(
                            section.id
                        )}"
                    >
                        ${
                            active
                                ? "Section Selected"
                                : "Select Section"
                        }
                    </button>

                    ${
                        active
                            ? `
                                <button
                                    type="button"
                                    class="secondary-button"
                                    data-builder-action="add-activity"
                                >
                                    + Add Activity
                                </button>
                            `
                            : ""
                    }

                </div>

            </article>
        `;
    }

    function renderBuilderActivity(
        activity
    ) {
        const type =
            activity.activity_type ||
            "text";

        const questionCount =
            builderQuestions.filter(
                question =>
                    String(
                        question.activity_id
                    ) ===
                    String(activity.id)
            ).length;

        const mediaCount =
            builderMedia.filter(
                media =>
                    String(
                        media.activity_id
                    ) ===
                    String(activity.id)
            ).length;

        const labels = {
            text: "Text",
            image: "Image",
            audio: "Audio",
            video: "Video",
            exercise: "Exercise",
            quiz: "Quiz",
            ai: "AI Interaction",
            speaking: "Speaking"
        };

        const icons = {
            text: "T",
            image: "▧",
            audio: "♫",
            video: "▶",
            exercise: "✓",
            quiz: "?",
            ai: "✦",
            speaking: "◉"
        };

        const label =
            labels[type] ||
            type;

        const icon =
            icons[type] ||
            "•";

        let preview =
            activity.content ||
            activity.instructions ||
            "";

        preview =
            String(preview)
                .replace(
                    /<[^>]*>/g,
                    ""
                )
                .slice(0, 220);

        return `
            <article
                class="content-block"
                data-content-id="${escapeAttribute(
                    activity.id
                )}"
            >

                <div class="content-block-icon">
                    ${icon}
                </div>

                <div class="content-block-main">

                    <div class="content-block-type">
                        ${escapeHTML(label)}
                    </div>

                    <h3>
                        ${escapeHTML(
                            activity.title ||
                            label
                        )}
                    </h3>

                    <div class="content-block-preview">
                        ${escapeHTML(
                            preview ||
                            "No content yet."
                        )}
                    </div>

                    <div class="builder-activity-meta">
                        ${
                            questionCount
                                ? `${questionCount} question${
                                    questionCount === 1
                                        ? ""
                                        : "s"
                                }`
                                : ""
                        }

                        ${
                            mediaCount
                                ? ` · ${mediaCount} media`
                                : ""
                        }
                    </div>

                </div>

                <div class="content-block-actions">

                    <button
                        type="button"
                        class="course-action-button"
                        data-builder-action="edit-activity"
                        data-id="${escapeAttribute(
                            activity.id
                        )}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="course-action-button danger"
                        data-builder-action="delete-activity"
                        data-id="${escapeAttribute(
                            activity.id
                        )}"
                    >
                        Delete
                    </button>

                </div>

            </article>
        `;
    }

    /* =====================================================
       BUILDER EVENTS
    ===================================================== */

    function attachBuilderEvents() {
        $("#add-module-button")
            ?.addEventListener(
                "click",
                () =>
                    openBuilderModal(
                        "module"
                    )
            );

        $("#editor-add-module")
            ?.addEventListener(
                "click",
                () =>
                    openBuilderModal(
                        "module"
                    )
            );

        $$(
            "[data-builder-action]"
        ).forEach(button => {
            button.addEventListener(
                "click",
                async () => {
                    const action =
                        button.dataset
                            .builderAction;

                    const id =
                        button.dataset.id;

                    if (
                        action ===
                        "select-module"
                    ) {
                        builderSelectedModuleId =
                            id;

                        builderSelectedLessonId =
                            builderLessons.find(
                                lesson =>
                                    String(
                                        lesson.module_id
                                    ) ===
                                    String(id)
                            )?.id ||
                            null;

                        builderSelectedSectionId =
                            builderSections.find(
                                section =>
                                    String(
                                        section.lesson_id
                                    ) ===
                                    String(
                                        builderSelectedLessonId
                                    )
                            )?.id ||
                            null;

                        renderBuilder();

                        return;
                    }

                    if (
                        action ===
                        "select-lesson"
                    ) {
                        builderSelectedLessonId =
                            id;

                        const lesson =
                            builderLessons.find(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(id)
                            );

                        if (lesson) {
                            builderSelectedModuleId =
                                lesson.module_id;
                        }

                        builderSelectedSectionId =
                            builderSections.find(
                                section =>
                                    String(
                                        section.lesson_id
                                    ) ===
                                    String(id)
                            )?.id ||
                            null;

                        renderBuilder();

                        return;
                    }

                    if (
                        action ===
                        "select-section"
                    ) {
                        builderSelectedSectionId =
                            id;

                        builderSelectedActivityId =
                            builderActivities.find(
                                activity =>
                                    String(
                                        activity.section_id
                                    ) ===
                                    String(id)
                            )?.id ||
                            null;

                        renderBuilder();

                        return;
                    }

                    if (
                        action ===
                        "add-lesson"
                    ) {
                        openBuilderModal(
                            "lesson",
                            null,
                            button.dataset
                                .moduleId ||
                            builderSelectedModuleId
                        );

                        return;
                    }

                    if (
                        action ===
                        "edit-module"
                    ) {
                        const module =
                            builderModules.find(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(id)
                            );

                        if (module) {
                            openBuilderModal(
                                "module",
                                module
                            );
                        }

                        return;
                    }

                    if (
                        action ===
                        "edit-lesson"
                    ) {
                        const lesson =
                            builderLessons.find(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(id)
                            );

                        if (lesson) {
                            openBuilderModal(
                                "lesson",
                                lesson
                            );
                        }

                        return;
                    }

                    if (
                        action ===
                        "delete-lesson"
                    ) {
                        await deleteBuilderLesson(
                            id
                        );

                        return;
                    }

                    if (
                        action ===
                        "add-section"
                    ) {
                        openBuilderModal(
                            "section"
                        );

                        return;
                    }

                    if (
                        action ===
                        "edit-section"
                    ) {
                        const section =
                            builderSections.find(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(id)
                            );

                        if (section) {
                            openBuilderModal(
                                "section",
                                section
                            );
                        }

                        return;
                    }

                    if (
                        action ===
                        "delete-section"
                    ) {
                        await deleteBuilderSection(
                            id
                        );

                        return;
                    }

                    if (
                        action ===
                        "add-activity"
                    ) {
                        openBuilderModal(
                            "activity"
                        );

                        return;
                    }

                    if (
                        action ===
                        "edit-activity"
                    ) {
                        const activity =
                            builderActivities.find(
                                item =>
                                    String(
                                        item.id
                                    ) ===
                                    String(id)
                            );

                        if (activity) {
                            openBuilderModal(
                                "activity",
                                activity
                            );
                        }

                        return;
                    }

                    if (
                        action ===
                        "delete-activity"
                    ) {
                        await deleteBuilderActivity(
                            id
                        );

                        return;
                    }
                }
            );
        });
    }

    /* =====================================================
       BUILDER MODAL
    ===================================================== */

    function openBuilderModal(
        kind,
        record = null,
        forcedParentId = null
    ) {
        builderModal?.remove();

        builderModal =
            document.createElement(
                "div"
            );

        builderModal.className =
            "course-modal";

        let title = "";
        let fields = "";

        if (kind === "module") {
            title =
                record
                    ? "Edit Module"
                    : "Add Module";

            fields = `
                <div class="course-form-field">

                    <label for="builder-title">
                        Module Title *
                    </label>

                    <input
                        id="builder-title"
                        required
                        maxlength="200"
                        value="${escapeAttribute(
                            record?.title ||
                            ""
                        )}"
                    >

                </div>

                <div class="course-form-field">

                    <label for="builder-description">
                        Description
                    </label>

                    <textarea
                        id="builder-description"
                        rows="4"
                    >${escapeHTML(
                        record?.description ||
                        ""
                    )}</textarea>

                </div>

                <div class="course-form-field">

                    <label for="builder-sort-order">
                        Sort Order
                    </label>

                    <input
                        type="number"
                        id="builder-sort-order"
                        min="0"
                        step="1"
                        value="${record?.sort_order ?? 0}"
                    >

                </div>
            `;
        }

        if (kind === "lesson") {
            title =
                record
                    ? "Edit Lesson"
                    : "Add Lesson";

            const moduleId =
                record?.module_id ||
                forcedParentId ||
                builderSelectedModuleId;

            fields = `
                <input
                    type="hidden"
                    id="builder-parent-id"
                    value="${escapeAttribute(
                        moduleId || ""
                    )}"
                >

                <div class="course-form-field">

                    <label for="builder-title">
                        Lesson Title *
                    </label>

                    <input
                        id="builder-title"
                        required
                        maxlength="200"
                        value="${escapeAttribute(
                            record?.title ||
                            ""
                        )}"
                    >

                </div>

                <div class="course-form-field">

                    <label for="builder-description">
                        Description
                    </label>

                    <textarea
                        id="builder-description"
                        rows="4"
                    >${escapeHTML(
                        record?.description ||
                        ""
                    )}</textarea>

                </div>

                <div class="course-form-field">

                    <label for="builder-sort-order">
                        Sort Order
                    </label>

                    <input
                        type="number"
                        id="builder-sort-order"
                        min="0"
                        step="1"
                        value="${record?.sort_order ?? 0}"
                    >

                </div>
            `;
        }

        if (kind === "section") {
            title =
                record
                    ? "Edit Section"
                    : "Add Section";

            const lessonId =
                record?.lesson_id ||
                builderSelectedLessonId;

            fields = `
                <input
                    type="hidden"
                    id="builder-parent-id"
                    value="${escapeAttribute(
                        lessonId || ""
                    )}"
                >

                <div class="course-form-field">

                    <label for="builder-title">
                        Section Title *
                    </label>

                    <input
                        id="builder-title"
                        required
                        maxlength="200"
                        value="${escapeAttribute(
                            record?.title ||
                            ""
                        )}"
                    >

                </div>

                <div class="course-form-field">

                    <label for="builder-section-type">
                        Section Type
                    </label>

                    <select id="builder-section-type">

                        ${[
                            "content",
                            "introduction",
                            "vocabulary",
                            "dialogue",
                            "practice",
                            "speaking",
                            "review",
                            "test"
                        ]
                            .map(
                                value => `
                                    <option
                                        value="${value}"
                                        ${
                                            (
                                                record?.section_type ||
                                                "content"
                                            ) === value
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${escapeHTML(
                                            formatSectionType(
                                                value
                                            )
                                        )}
                                    </option>
                                `
                            )
                            .join("")}

                    </select>

                </div>

                <div class="course-form-field">

                    <label for="builder-description">
                        Description
                    </label>

                    <textarea
                        id="builder-description"
                        rows="4"
                    >${escapeHTML(
                        record?.description ||
                        ""
                    )}</textarea>

                </div>

                <div class="course-form-field">

                    <label for="builder-sort-order">
                        Sort Order
                    </label>

                    <input
                        type="number"
                        id="builder-sort-order"
                        min="0"
                        step="1"
                        value="${record?.sort_order ?? 0}"
                    >

                </div>
            `;
        }

        if (kind === "activity") {
            title =
                record
                    ? "Edit Activity"
                    : "Add Activity";

            const sectionId =
                record?.section_id ||
                builderSelectedSectionId;

            fields = `
                <input
                    type="hidden"
                    id="builder-parent-id"
                    value="${escapeAttribute(
                        sectionId || ""
                    )}"
                >

                <div class="course-form-field">

                    <label for="builder-activity-type">
                        Activity Type *
                    </label>

                    <select
                        id="builder-activity-type"
                    >

                        ${[
                            "text",
                            "image",
                            "audio",
                            "video",
                            "exercise",
                            "quiz",
                            "ai",
                            "speaking"
                        ]
                            .map(
                                value => `
                                    <option
                                        value="${value}"
                                        ${
                                            (
                                                record?.activity_type ||
                                                "text"
                                            ) === value
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${escapeHTML(
                                            formatActivityType(
                                                value
                                            )
                                        )}
                                    </option>
                                `
                            )
                            .join("")}

                    </select>

                </div>

                <div class="course-form-field">

                    <label for="builder-title">
                        Activity Title *
                    </label>

                    <input
                        id="builder-title"
                        required
                        maxlength="200"
                        value="${escapeAttribute(
                            record?.title ||
                            ""
                        )}"
                    >

                </div>

                <div class="course-form-field">

                    <label for="builder-instructions">
                        Instructions
                    </label>

                    <textarea
                        id="builder-instructions"
                        rows="4"
                        placeholder="What should the learner do?"
                    >${escapeHTML(
                        record?.instructions ||
                        ""
                    )}</textarea>

                </div>

                <div class="course-form-field">

                    <label for="builder-content">
                        Content
                    </label>

                    <textarea
                        id="builder-content"
                        rows="7"
                        placeholder="Enter the activity content..."
                    >${escapeHTML(
                        record?.content ||
                        ""
                    )}</textarea>

                </div>

                <div class="course-form-field">

                    <label for="builder-media-url">
                        Media URL
                    </label>

                    <input
                        id="builder-media-url"
                        type="url"
                        placeholder="Optional image/audio/video URL"
                        value="${escapeAttribute(
                            record?.settings
                                ?.media_url ||
                            ""
                        )}"
                    >

                </div>

                <div class="course-form-grid">

                    <div class="course-form-field">

                        <label for="builder-sort-order">
                            Sort Order
                        </label>

                        <input
                            type="number"
                            id="builder-sort-order"
                            min="0"
                            step="1"
                            value="${record?.sort_order ?? 0}"
                        >

                    </div>

                    <div class="course-form-field">

                        <label for="builder-required">
                            Required
                        </label>

                        <select
                            id="builder-required"
                        >

                            <option
                                value="true"
                                ${
                                    record?.required !== false
                                        ? "selected"
                                        : ""
                                }
                            >
                                Yes
                            </option>

                            <option
                                value="false"
                                ${
                                    record?.required === false
                                        ? "selected"
                                        : ""
                                }
                            >
                                No
                            </option>

                        </select>

                    </div>

                </div>
            `;
        }

        builderModal.innerHTML = `
            <div class="course-modal-backdrop"></div>

            <div
                class="course-modal-dialog"
                role="dialog"
                aria-modal="true"
            >

                <div class="course-modal-header">

                    <div>

                        <div class="course-modal-kicker">
                            COURSE BUILDER
                        </div>

                        <h2>
                            ${escapeHTML(title)}
                        </h2>

                    </div>

                    <button
                        type="button"
                        class="course-modal-close"
                        id="builder-modal-close"
                    >
                        ×
                    </button>

                </div>

                <form
                    id="builder-form"
                    class="course-form"
                >

                    ${fields}

                    <div
                        id="builder-form-error"
                        class="course-form-error"
                        hidden
                    ></div>

                    <div class="course-form-actions">

                        <button
                            type="button"
                            class="secondary-button"
                            id="builder-cancel"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            class="primary-button"
                            id="builder-save-button"
                        >
                            ${
                                record
                                    ? "Save Changes"
                                    : "Create"
                            }
                        </button>

                    </div>

                </form>

            </div>
        `;

        document.body.appendChild(
            builderModal
        );

        requestAnimationFrame(() => {
            builderModal?.classList.add(
                "open"
            );
        });

        document.body.classList.add(
            "modal-open"
        );

        $("#builder-modal-close")
            ?.addEventListener(
                "click",
                closeBuilderModal
            );

        $("#builder-cancel")
            ?.addEventListener(
                "click",
                closeBuilderModal
            );

        builderModal
            .querySelector(
                ".course-modal-backdrop"
            )
            ?.addEventListener(
                "click",
                closeBuilderModal
            );

        $("#builder-form")
            ?.addEventListener(
                "submit",
                event =>
                    saveBuilderRecord(
                        event,
                        kind,
                        record
                    )
            );
    }

    /* =====================================================
       SAVE BUILDER RECORD
    ===================================================== */

    async function saveBuilderRecord(
        event,
        kind,
        record
    ) {
        event.preventDefault();

        const saveButton =
            $("#builder-save-button");

        const errorElement =
            $("#builder-form-error");

        if (saveButton) {
            saveButton.disabled = true;
            saveButton.textContent =
                record
                    ? "Saving..."
                    : "Creating...";
        }

        if (errorElement) {
            errorElement.hidden = true;
        }

        try {
            const title =
                $("#builder-title")
                    ?.value
                    .trim();

            if (!title) {
                throw new Error(
                    "Title is required."
                );
            }

            const sortOrder =
                Number(
                    $("#builder-sort-order")
                        ?.value || 0
                );

            /*
               MODULE
            */

            if (kind === "module") {
                const data = {
                    course_id:
                        builderCourseId,

                    title,

                    description:
                        $("#builder-description")
                            ?.value
                            .trim() ||
                        null,

                    sort_order:
                        sortOrder
                };

                let result;

                if (record) {
                    result =
                        await client
                            .from("modules")
                            .update(data)
                            .eq(
                                "id",
                                record.id
                            );
                } else {
                    result =
                        await client
                            .from("modules")
                            .insert(data);
                }

                if (result.error) {
                    throw result.error;
                }
            }

            /*
               LESSON
            */

            if (kind === "lesson") {
                const moduleId =
                    record?.module_id ||
                    $("#builder-parent-id")
                        ?.value ||
                    builderSelectedModuleId;

                if (!moduleId) {
                    throw new Error(
                        "A module must be selected before creating a lesson."
                    );
                }

                const data = {
                    module_id:
                        moduleId,

                    title,

                    description:
                        $("#builder-description")
                            ?.value
                            .trim() ||
                        null,

                    sort_order:
                        sortOrder
                };

                let result;

                if (record) {
                    result =
                        await client
                            .from("lessons")
                            .update(data)
                            .eq(
                                "id",
                                record.id
                            );
                } else {
                    result =
                        await client
                            .from("lessons")
                            .insert(data);
                }

                if (result.error) {
                    throw result.error;
                }
            }

            /*
               SECTION
            */

            if (kind === "section") {
                const lessonId =
                    record?.lesson_id ||
                    $("#builder-parent-id")
                        ?.value ||
                    builderSelectedLessonId;

                if (!lessonId) {
                    throw new Error(
                        "A lesson must be selected before creating a section."
                    );
                }

                const data = {
                    lesson_id:
                        lessonId,

                    section_type:
                        $("#builder-section-type")
                            ?.value ||
                        "content",

                    title,

                    description:
                        $("#builder-description")
                            ?.value
                            .trim() ||
                        null,

                    sort_order:
                        sortOrder,

                    content: {}
                };

                let result;

                if (record) {
                    result =
                        await client
                            .from(
                                "lesson_sections"
                            )
                            .update(data)
                            .eq(
                                "id",
                                record.id
                            );
                } else {
                    result =
                        await client
                            .from(
                                "lesson_sections"
                            )
                            .insert(data);
                }

                if (result.error) {
                    throw result.error;
                }
            }

            /*
               ACTIVITY
            */

            if (kind === "activity") {
                const sectionId =
                    record?.section_id ||
                    $("#builder-parent-id")
                        ?.value ||
                    builderSelectedSectionId;

                if (!sectionId) {
                    throw new Error(
                        "Select a section before creating an activity."
                    );
                }

                const activityType =
                    $("#builder-activity-type")
                        ?.value ||
                    "text";

                const mediaUrl =
                    $("#builder-media-url")
                        ?.value
                        .trim() ||
                    null;

                const existingSettings =
                    record?.settings &&
                    typeof record.settings ===
                        "object"
                        ? record.settings
                        : {};

                const settings = {
                    ...existingSettings
                };

                if (mediaUrl) {
                    settings.media_url =
                        mediaUrl;
                } else {
                    delete settings.media_url;
                }

                const data = {
                    section_id:
                        sectionId,

                    activity_type:
                        activityType,

                    title,

                    instructions:
                        $("#builder-instructions")
                            ?.value
                            .trim() ||
                        null,

                    content:
                        $("#builder-content")
                            ?.value
                            .trim() ||
                        null,

                    sort_order:
                        sortOrder,

                    required:
                        $("#builder-required")
                            ?.value !==
                        "false",

                    settings
                };

                let result;

                if (record) {
                    result =
                        await client
                            .from(
                                "activities"
                            )
                            .update(data)
                            .eq(
                                "id",
                                record.id
                            );
                } else {
                    result =
                        await client
                            .from(
                                "activities"
                            )
                            .insert(data);
                }

                if (result.error) {
                    throw result.error;
                }
            }

            closeBuilderModal();

            await loadBuilderCourse(
                builderCourseId
            );

            await loadDashboard();
        } catch (error) {
            console.error(
                "Could not save builder record:",
                error
            );

            if (errorElement) {
                errorElement.textContent =
                    error.message ||
                    "Could not save this item.";

                errorElement.hidden =
                    false;
            }
        } finally {
            if (saveButton) {
                saveButton.disabled =
                    false;

                saveButton.textContent =
                    record
                        ? "Save Changes"
                        : "Create";
            }
        }
    }

    /* =====================================================
       DELETE ACTIVITY
    ===================================================== */

    async function deleteBuilderActivity(
        activityId
    ) {
        const activity =
            builderActivities.find(
                item =>
                    String(item.id) ===
                    String(activityId)
            );

        if (!activity) return;

        if (
            !confirm(
                `Delete "${activity.title || "this activity"}"?\n\nAny questions or media attached to it will also be removed.`
            )
        ) {
            return;
        }

        try {
            /*
               Delete questions first.
            */

            const {
                error: questionsError
            } =
                await client
                    .from("questions")
                    .delete()
                    .eq(
                        "activity_id",
                        activityId
                    );

            if (questionsError) {
                console.warn(
                    "Question deletion:",
                    questionsError
                );
            }

            /*
               Delete media records.
            */

            const {
                error: mediaError
            } =
                await client
                    .from("media")
                    .delete()
                    .eq(
                        "activity_id",
                        activityId
                    );

            if (mediaError) {
                console.warn(
                    "Media deletion:",
                    mediaError
                );
            }

            /*
               Delete activity.
            */

            const { error } =
                await client
                    .from("activities")
                    .delete()
                    .eq(
                        "id",
                        activityId
                    );

            if (error) throw error;

            builderSelectedActivityId =
                null;

            await loadBuilderCourse(
                builderCourseId
            );
        } catch (error) {
            console.error(error);

            alert(
                error.message ||
                "Could not delete the activity."
            );
        }
    }

    /* =====================================================
       DELETE SECTION
    ===================================================== */

    async function deleteBuilderSection(
        sectionId
    ) {
        const section =
            builderSections.find(
                item =>
                    String(item.id) ===
                    String(sectionId)
            );

        if (!section) return;

        const activities =
            builderActivities.filter(
                activity =>
                    String(
                        activity.section_id
                    ) ===
                    String(sectionId)
            );

        if (
            !confirm(
                `Delete "${section.title || "this section"}"?\n\n${activities.length} activit${
                    activities.length === 1
                        ? "y"
                        : "ies"
                } inside this section will also be removed.`
            )
        ) {
            return;
        }

        try {
            const activityIds =
                activities.map(
                    activity =>
                        activity.id
                );

            if (activityIds.length) {
                await client
                    .from("questions")
                    .delete()
                    .in(
                        "activity_id",
                        activityIds
                    );

                await client
                    .from("media")
                    .delete()
                    .in(
                        "activity_id",
                        activityIds
                    );

                const {
                    error: activityError
                } =
                    await client
                        .from(
                            "activities"
                        )
                        .delete()
                        .in(
                            "id",
                            activityIds
                        );

                if (activityError) {
                    throw activityError;
                }
            }

            const { error } =
                await client
                    .from(
                        "lesson_sections"
                    )
                    .delete()
                    .eq(
                        "id",
                        sectionId
                    );

            if (error) throw error;

            builderSelectedSectionId =
                null;

            await loadBuilderCourse(
                builderCourseId
            );
        } catch (error) {
            console.error(error);

            alert(
                error.message ||
                "Could not delete the section."
            );
        }
    }

    /* =====================================================
       DELETE LESSON
    ===================================================== */

    async function deleteBuilderLesson(
        lessonId
    ) {
        const lesson =
            builderLessons.find(
                item =>
                    String(item.id) ===
                    String(lessonId)
            );

        if (!lesson) return;

        const sections =
            builderSections.filter(
                section =>
                    String(
                        section.lesson_id
                    ) ===
                    String(lessonId)
            );

        const sectionIds =
            sections.map(
                section =>
                    section.id
            );

        const activities =
            builderActivities.filter(
                activity =>
                    sectionIds.some(
                        sectionId =>
                            String(
                                sectionId
                            ) ===
                            String(
                                activity.section_id
                            )
                    )
            );

        if (
            !confirm(
                `Delete "${lesson.title || "this lesson"}"?\n\nThis will remove its sections and activities.`
            )
        ) {
            return;
        }

        try {
            const activityIds =
                activities.map(
                    activity =>
                        activity.id
                );

            if (activityIds.length) {
                await client
                    .from("questions")
                    .delete()
                    .in(
                        "activity_id",
                        activityIds
                    );

                await client
                    .from("media")
                    .delete()
                    .in(
                        "activity_id",
                        activityIds
                    );

                const {
                    error: activityError
                } =
                    await client
                        .from(
                            "activities"
                        )
                        .delete()
                        .in(
                            "id",
                            activityIds
                        );

                if (activityError) {
                    throw activityError;
                }
            }

            if (sectionIds.length) {
                const {
                    error: sectionError
                } =
                    await client
                        .from(
                            "lesson_sections"
                        )
                        .delete()
                        .in(
                            "id",
                            sectionIds
                        );

                if (sectionError) {
                    throw sectionError;
                }
            }

            const { error } =
                await client
                    .from("lessons")
                    .delete()
                    .eq(
                        "id",
                        lessonId
                    );

            if (error) throw error;

            builderSelectedLessonId =
                null;

            builderSelectedSectionId =
                null;

            await loadBuilderCourse(
                builderCourseId
            );

            await loadDashboard();
        } catch (error) {
            console.error(error);

            alert(
                error.message ||
                "Could not delete the lesson."
            );
        }
    }

    function closeBuilderModal() {
        builderModal?.remove();

        builderModal = null;

        document.body.classList.remove(
            "modal-open"
        );
    }

    function formatSectionType(
        value
    ) {
        const labels = {
            content: "Content",
            introduction: "Introduction",
            vocabulary: "Vocabulary",
            dialogue: "Dialogue",
            practice: "Practice",
            speaking: "Speaking",
            review: "Review",
            test: "Test"
        };

        return (
            labels[value] ||
            value
        );
    }

    function formatActivityType(
        value
    ) {
        const labels = {
            text: "Text",
            image: "Image",
            audio: "Audio",
            video: "Video",
            exercise: "Exercise",
            quiz: "Quiz",
            ai: "AI Interaction",
            speaking: "Speaking Activity"
        };

        return (
            labels[value] ||
            value
        );
    }

    /* =====================================================
       CAROUSEL
    ===================================================== */

    function setupCarouselControls() {
        const createButton =
            $("#create-carousel-button");

        if (createButton) {
            createButton.addEventListener(
                "click",
                event => {
                    event.preventDefault();
                    event.stopPropagation();

                    openCarouselModal();
                }
            );
        }

        $("#carousel-search")
            ?.addEventListener(
                "input",
                renderCarouselItems
            );

        $("#carousel-filter")
            ?.addEventListener(
                "change",
                renderCarouselItems
            );
    }

    async function loadCarouselItems() {
        const list =
            $("#carousel-list");

        if (list) {
            list.innerHTML =
                `<div class="courses-loading">
                    Loading promotions...
                </div>`;
        }

        try {
            const { data, error } =
                await client
                    .from("carousel_items")
                    .select("*")
                    .order(
                        "sort_order",
                        {
                            ascending: true
                        }
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );

            if (error) throw error;

            allCarouselItems =
                data || [];

            renderCarouselItems();
        } catch (error) {
            console.error(
                "Error loading carousel items:",
                error
            );

            if (list) {
                list.innerHTML =
                    `<div class="courses-loading">
                        Unable to load promotions.
                    </div>`;
            }
        }
    }

    function renderCarouselItems() {
        const list =
            $("#carousel-list");

        const count =
            $("#carousel-count");

        if (!list) return;

        const searchTerm =
            (
                $("#carousel-search")
                    ?.value || ""
            )
                .trim()
                .toLowerCase();

        const filter =
            $("#carousel-filter")
                ?.value || "all";

        let items =
            [...allCarouselItems];

        if (filter !== "all") {
            items =
                items.filter(
                    item =>
                        item.status ===
                        filter
                );
        }

        if (searchTerm) {
            items =
                items.filter(item => {
                    const text =
                        `${item.title || ""}
                         ${item.description || ""}
                         ${item.area || ""}`
                            .toLowerCase();

                    return text.includes(
                        searchTerm
                    );
                });
        }

        if (count) {
            count.textContent =
                `${items.length} ${
                    items.length === 1
                        ? "promotion"
                        : "promotions"
                }`;
        }

        if (!items.length) {
            list.innerHTML =
                `<div class="courses-loading">
                    No promotions found.
                </div>`;

            return;
        }

        list.innerHTML =
            items
                .map(
                    renderCarouselRow
                )
                .join("");

        attachCarouselActions();
    }

    function renderCarouselRow(
        item
    ) {
        const image =
            item.image_url
                ? `
                    <img
                        src="${escapeAttribute(
                            item.image_url
                        )}"
                        alt="${escapeAttribute(
                            item.title
                        )}"
                        onerror="
                            this.style.display='none';
                        "
                    >
                `
                : `
                    <div class="course-cover-placeholder">
                        ▤
                    </div>
                `;

        const status =
            normalizeCarouselStatus(
                item.status
            );

        return `
            <div class="course-row carousel-row">

                <div class="course-main">

                    <div class="course-cover">
                        ${image}
                    </div>

                    <div class="course-info">

                        <div class="course-title">
                            ${escapeHTML(
                                item.title ||
                                "Untitled Promotion"
                            )}
                        </div>

                        <div class="course-description">
                            ${escapeHTML(
                                item.description ||
                                "Promotional content."
                            )}
                        </div>

                    </div>

                </div>

                <div class="course-category">
                    ${escapeHTML(
                        formatCarouselArea(
                            item.area
                        )
                    )}
                </div>

                <div class="course-level">

                    <span
                        class="course-status ${status}"
                    >
                        ${escapeHTML(status)}
                    </span>

                </div>

                <div class="course-updated">
                    ${
                        item.start_date
                            ? formatDate(
                                item.start_date
                            )
                            : "—"
                    }
                </div>

                <div class="course-updated">
                    ${
                        item.end_date
                            ? formatDate(
                                item.end_date
                            )
                            : "—"
                    }
                </div>

                <div class="course-actions">

                    <button
                        type="button"
                        class="course-action-button"
                        data-carousel-action="edit"
                        data-carousel-id="${escapeAttribute(
                            item.id
                        )}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="course-action-button danger"
                        data-carousel-action="delete"
                        data-carousel-id="${escapeAttribute(
                            item.id
                        )}"
                    >
                        Delete
                    </button>

                </div>

            </div>
        `;
    }

    function attachCarouselActions() {
        $(
            ".course-action-button[data-carousel-action]"
        );

        $$(
            ".course-action-button[data-carousel-action]"
        ).forEach(button => {
            button.addEventListener(
                "click",
                async () => {
                    const item =
                        allCarouselItems.find(
                            carouselItem =>
                                String(
                                    carouselItem.id
                                ) ===
                                String(
                                    button.dataset
                                        .carouselId
                                )
                        );

                    if (!item) return;

                    if (
                        button.dataset
                            .carouselAction ===
                        "edit"
                    ) {
                        openCarouselModal(
                            item
                        );
                    } else {
                        await deleteCarouselItem(
                            item
                        );
                    }
                }
            );
        });
    }

    async function deleteCarouselItem(
        item
    ) {
        if (
            !confirm(
                `Delete "${item.title}"?`
            )
        ) {
            return;
        }

        try {
            const { error } =
                await client
                    .from(
                        "carousel_items"
                    )
                    .delete()
                    .eq(
                        "id",
                        item.id
                    );

            if (error) throw error;

            await loadCarouselItems();
        } catch (error) {
            alert(
                error.message ||
                "Unable to delete this promotion."
            );
        }
    }

    function openCarouselModal(
        item = null
    ) {
        editingCarouselItemId =
            item?.id || null;

        removeCarouselImage = false;

        carouselModal?.remove();

        carouselModal =
            document.createElement(
                "div"
            );

        carouselModal.className =
            "course-modal";

        carouselModal.innerHTML = `
            <div class="course-modal-backdrop"></div>

            <div
                class="course-modal-dialog"
                role="dialog"
                aria-modal="true"
            >

                <div class="course-modal-header">

                    <div>

                        <div class="course-modal-kicker">
                            FEATURED CONTENT
                        </div>

                        <h2>
                            ${
                                item
                                    ? "Edit Promotion"
                                    : "Create Promotion"
                            }
                        </h2>

                    </div>

                    <button
                        type="button"
                        class="course-modal-close"
                        id="close-carousel-modal"
                    >
                        ×
                    </button>

                </div>

                <form
                    id="carousel-form"
                    class="course-form"
                >

                    <div class="course-form-field">

                        <label for="carousel-title">
                            Title *
                        </label>

                        <input
                            id="carousel-title"
                            required
                            maxlength="200"
                            value="${escapeAttribute(
                                item?.title ||
                                ""
                            )}"
                        >

                    </div>

                    <div class="course-form-field">

                        <label for="carousel-description">
                            Description
                        </label>

                        <textarea
                            id="carousel-description"
                            rows="4"
                        >${escapeHTML(
                            item?.description ||
                            ""
                        )}</textarea>

                    </div>

                    <div class="course-form-field">

                        <label>
                            Promotion Image
                        </label>

                        <label
                            for="carousel-image-file"
                            class="course-upload-area"
                        >

                            <div class="upload-icon">
                                ↑
                            </div>

                            <strong>
                                Choose an image
                            </strong>

                            <span>
                                JPG, JPEG, PNG or WebP · Max 5 MB
                            </span>

                        </label>

                        <input
                            id="carousel-image-file"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            hidden
                        >

                        <div
                            id="carousel-image-preview"
                            class="course-cover-preview"
                            ${
                                item?.image_url
                                    ? ""
                                    : "hidden"
                            }
                        >

                            <img
                                id="carousel-image-preview-image"
                                src="${escapeAttribute(
                                    item?.image_url ||
                                    ""
                                )}"
                                alt=""
                            >

                            <button
                                type="button"
                                id="carousel-remove-image"
                                class="course-remove-cover"
                            >
                                Remove image
                            </button>

                        </div>

                    </div>

                    <div class="course-form-grid">

                        <div class="course-form-field">

                            <label for="carousel-area">
                                Area
                            </label>

                            <select
                                id="carousel-area"
                            >

                                ${[
                                    "all",
                                    "language",
                                    "ms-office",
                                    "trading",
                                    "business",
                                    "technology",
                                    "finance",
                                    "personal-development"
                                ]
                                    .map(
                                        value => `
                                            <option
                                                value="${value}"
                                                ${
                                                    item?.area ===
                                                        value ||
                                                    (
                                                        !item?.area &&
                                                        value ===
                                                        "all"
                                                    )
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                ${escapeHTML(
                                                    formatCarouselArea(
                                                        value
                                                    )
                                                )}
                                            </option>
                                        `
                                    )
                                    .join("")}

                            </select>

                        </div>

                        <div class="course-form-field">

                            <label for="carousel-status">
                                Status
                            </label>

                            <select
                                id="carousel-status"
                            >

                                <option
                                    value="draft"
                                    ${
                                        item?.status !==
                                        "published"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Draft
                                </option>

                                <option
                                    value="published"
                                    ${
                                        item?.status ===
                                        "published"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Published
                                </option>

                            </select>

                        </div>

                    </div>

                    <div class="course-form-grid">

                        <div class="course-form-field">

                            <label for="carousel-start-date">
                                Start Date
                            </label>

                            <input
                                type="datetime-local"
                                id="carousel-start-date"
                                value="${formatDateTimeLocal(
                                    item?.start_date
                                )}"
                            >

                        </div>

                        <div class="course-form-field">

                            <label for="carousel-end-date">
                                End Date
                            </label>

                            <input
                                type="datetime-local"
                                id="carousel-end-date"
                                value="${formatDateTimeLocal(
                                    item?.end_date
                                )}"
                            >

                        </div>

                    </div>

                    <div class="course-form-grid">

                        <div class="course-form-field">

                            <label for="carousel-button-text">
                                Button Text
                            </label>

                            <input
                                id="carousel-button-text"
                                value="${escapeAttribute(
                                    item?.button_text ||
                                    "Learn More"
                                )}"
                            >

                        </div>

                        <div class="course-form-field">

                            <label for="carousel-sort-order">
                                Sort Order
                            </label>

                            <input
                                type="number"
                                id="carousel-sort-order"
                                min="0"
                                step="1"
                                value="${item?.sort_order ?? 0}"
                            >

                        </div>

                    </div>

                    <div class="course-form-field">

                        <label for="carousel-button-url">
                            Button URL
                        </label>

                        <input
                            type="url"
                            id="carousel-button-url"
                            value="${escapeAttribute(
                                item?.button_url ||
                                ""
                            )}"
                        >

                    </div>

                    <div
                        id="carousel-form-error"
                        class="course-form-error"
                        hidden
                    ></div>

                    <div class="course-form-actions">

                        <button
                            type="button"
                            class="secondary-button"
                            id="cancel-carousel-modal"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            class="primary-button"
                            id="carousel-save-button"
                        >
                            ${
                                item
                                    ? "Save Changes"
                                    : "Create Promotion"
                            }
                        </button>

                    </div>

                </form>

            </div>
        `;

        document.body.appendChild(
            carouselModal
        );

        requestAnimationFrame(
            () =>
                carouselModal
                    ?.classList.add(
                        "open"
                    )
        );

        document.body.classList.add(
            "modal-open"
        );

        $("#close-carousel-modal")
            ?.addEventListener(
                "click",
                closeCarouselModal
            );

        $("#cancel-carousel-modal")
            ?.addEventListener(
                "click",
                closeCarouselModal
            );

        carouselModal
            .querySelector(
                ".course-modal-backdrop"
            )
            ?.addEventListener(
                "click",
                closeCarouselModal
            );

        $("#carousel-form")
            ?.addEventListener(
                "submit",
                saveCarouselItem
            );

        $("#carousel-image-file")
            ?.addEventListener(
                "change",
                handleCarouselImageFile
            );

        $("#carousel-remove-image")
            ?.addEventListener(
                "click",
                removeCarouselImageFile
            );
    }

    function handleCarouselImageFile(
        event
    ) {
        const file =
            event.target.files?.[0];

        if (!file) return;

        if (
            ![
                "image/jpeg",
                "image/png",
                "image/webp"
            ].includes(file.type)
        ) {
            showCarouselFormError(
                "Please select a JPG, PNG or WebP image."
            );

            event.target.value = "";

            return;
        }

        if (
            file.size >
            5 * 1024 * 1024
        ) {
            showCarouselFormError(
                "The promotion image must be smaller than 5 MB."
            );

            event.target.value = "";

            return;
        }

        removeCarouselImage = false;

        clearCarouselFormError();

        const reader =
            new FileReader();

        reader.onload = () => {
            const image =
                $("#carousel-image-preview-image");

            const preview =
                $("#carousel-image-preview");

            if (image) {
                image.src =
                    reader.result;
            }

            if (preview) {
                preview.hidden = false;
            }
        };

        reader.readAsDataURL(file);
    }

    function removeCarouselImageFile() {
        const file =
            $("#carousel-image-file");

        if (file) {
            file.value = "";
        }

        removeCarouselImage = true;

        const preview =
            $("#carousel-image-preview");

        const image =
            $("#carousel-image-preview-image");

        if (preview) {
            preview.hidden = true;
        }

        if (image) {
            image.removeAttribute(
                "src"
            );
        }
    }

    async function uploadCarouselImage(
        file
    ) {
        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();

        const path =
            `carousel-images/${crypto.randomUUID()}.${extension}`;

        const { error } =
            await client.storage
                .from("carousel-images")
                .upload(
                    path,
                    file,
                    {
                        cacheControl: "3600",
                        upsert: false,
                        contentType:
                            file.type
                    }
                );

        if (error) {
            throw new Error(
                `Promotion image upload failed: ${error.message}`
            );
        }

        const { data } =
            client.storage
                .from("carousel-images")
                .getPublicUrl(
                    path
                );

        if (!data?.publicUrl) {
            throw new Error(
                "The promotion image was uploaded but its public URL could not be generated."
            );
        }

        return data.publicUrl;
    }

    async function saveCarouselItem(
        event
    ) {
        event.preventDefault();

        const title =
            $("#carousel-title")
                .value
                .trim();

        if (!title) {
            showCarouselFormError(
                "Promotion title is required."
            );

            return;
        }

        const startDate =
            $("#carousel-start-date")
                .value;

        const endDate =
            $("#carousel-end-date")
                .value;

        if (
            startDate &&
            endDate &&
            new Date(startDate) >
            new Date(endDate)
        ) {
            showCarouselFormError(
                "The end date cannot be earlier than the start date."
            );

            return;
        }

        const button =
            $("#carousel-save-button");

        button.disabled = true;

        button.textContent =
            editingCarouselItemId
                ? "Saving..."
                : "Creating...";

        try {
            let finalImageUrl = null;

            if (
                editingCarouselItemId
            ) {
                const existing =
                    allCarouselItems.find(
                        item =>
                            String(
                                item.id
                            ) ===
                            String(
                                editingCarouselItemId
                            )
                    );

                finalImageUrl =
                    existing?.image_url ||
                    null;
            }

            if (removeCarouselImage) {
                finalImageUrl = null;
            }

            const file =
                $("#carousel-image-file")
                    .files?.[0];

            if (file?.size) {
                finalImageUrl =
                    await uploadCarouselImage(
                        file
                    );
            }

            const data = {
                title,

                description:
                    $("#carousel-description")
                        .value
                        .trim() ||
                    null,

                image_url:
                    finalImageUrl,

                area:
                    $("#carousel-area")
                        .value,

                button_text:
                    $("#carousel-button-text")
                        .value
                        .trim() ||
                    "Learn More",

                button_url:
                    $("#carousel-button-url")
                        .value
                        .trim() ||
                    null,

                status:
                    $("#carousel-status")
                        .value,

                start_date:
                    startDate
                        ? new Date(
                            startDate
                        ).toISOString()
                        : null,

                end_date:
                    endDate
                        ? new Date(
                            endDate
                        ).toISOString()
                        : null,

                sort_order:
                    Number(
                        $("#carousel-sort-order")
                            .value ||
                        0
                    )
            };

            const result =
                editingCarouselItemId
                    ? await client
                        .from(
                            "carousel_items"
                        )
                        .update(data)
                        .eq(
                            "id",
                            editingCarouselItemId
                        )
                    : await client
                        .from(
                            "carousel_items"
                        )
                        .insert(data);

            if (result.error) {
                throw result.error;
            }

            closeCarouselModal();

            await loadCarouselItems();
        } catch (error) {
            showCarouselFormError(
                error.message ||
                "Could not save the promotion."
            );
        } finally {
            button.disabled = false;

            button.textContent =
                editingCarouselItemId
                    ? "Save Changes"
                    : "Create Promotion";
        }
    }

    function closeCarouselModal() {
        carouselModal?.remove();

        carouselModal = null;
        editingCarouselItemId = null;
        removeCarouselImage = false;

        document.body.classList.remove(
            "modal-open"
        );
    }

    function showCarouselFormError(
        message
    ) {
        const element =
            $("#carousel-form-error");

        if (!element) return;

        element.textContent =
            message;

        element.hidden = false;
    }

    function clearCarouselFormError() {
        const element =
            $("#carousel-form-error");

        if (!element) return;

        element.textContent = "";
        element.hidden = true;
    }

    function normalizeCarouselStatus(
        status
    ) {
        return status ===
            "published"
            ? "published"
            : "draft";
    }

    function formatCarouselArea(
        area
    ) {
        const areas = {
            all: "All Areas",
            language: "Language",
            "ms-office": "MS Office",
            trading: "Trading",
            business: "Business",
            technology: "Technology",
            finance: "Finance",
            "personal-development":
                "Personal Development"
        };

        return (
            areas[area] ||
            "All Areas"
        );
    }

    /* =====================================================
       GENERAL HELPERS
    ===================================================== */

    function normalizeStatus(
        status
    ) {
        if (
            status === "published" ||
            status === "archived"
        ) {
            return status;
        }

        return "draft";
    }

    function formatDate(
        value
    ) {
        if (!value) return "—";

        const date =
            new Date(value);

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
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );
    }

    function formatDateTimeLocal(
        value
    ) {
        if (!value) return "";

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "";
        }

        const pad =
            number =>
                String(number)
                    .padStart(
                        2,
                        "0"
                    );

        return `${date.getFullYear()}-${pad(
            date.getMonth() + 1
        )}-${pad(
            date.getDate()
        )}T${pad(
            date.getHours()
        )}:${pad(
            date.getMinutes()
        )}`;
    }

    function escapeHTML(
        value
    ) {
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

    function escapeAttribute(
        value
    ) {
        return escapeHTML(value);
    }

    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {
            if (
                event.key !==
                "Escape"
            ) {
                return;
            }

            if (builderModal) {
                closeBuilderModal();
                return;
            }

            if (carouselModal) {
                closeCarouselModal();
                return;
            }

            if (
                courseModal &&
                courseModal.classList.contains(
                    "open"
                )
            ) {
                closeCourseModal();
            }
        }
    );
});
