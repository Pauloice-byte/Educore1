/* =========================================================
   EDUCORE ADMIN
   COURSE MANAGEMENT + COURSE BUILDER
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        "use strict";


        /* =====================================================
           SUPABASE
        ===================================================== */

        const client =
            window.supabaseClient ||
            window.supabase ||
            null;


        if (
            !client ||
            typeof client.from !== "function"
        ) {

            console.error(
                "Supabase client is not available."
            );

            return;
        }


        /* =====================================================
           STATE
        ===================================================== */

        let allCourses = [];

        let allCarouselItems = [];

        let editingCourseId = null;

        let courseModal = null;

        let editingCarouselItemId = null;

        let carouselModal = null;


        let builderCourse = null;

        let builderModules = [];

        let selectedModule = null;

        let selectedLesson = null;

        let moduleModal = null;

        let lessonModal = null;

        let contentModal = null;


        /* =====================================================
           HELPERS
        ===================================================== */

        const $ =
            selector =>
                document.querySelector(selector);


        const $$ =
            selector =>
                document.querySelectorAll(selector);


        const escapeHTML =
            value =>
                String(value ?? "")
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");


        const escapeAttribute =
            value =>
                escapeHTML(value);


        function formatDate(value) {

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


        function showError(message) {

            console.error(message);

            alert(message);
        }


        function closeModalElement(
            modal
        ) {

            if (!modal) return;

            modal.classList.remove("open");

            setTimeout(
                () => modal.remove(),
                180
            );

            document.body.classList.remove(
                "modal-open"
            );
        }


        /* =====================================================
           INITIALISE
        ===================================================== */

        init();


        async function init() {

            setupNavigation();

            setupSidebar();

            setupLogout();

            setupCourseControls();

            setupCarouselControls();

            setupDashboardRetry();

            setupBuilderControls();

            await loadAdminUser();

            await loadDashboard();

            await loadCourses();

            await loadCarouselItems();

            await loadBuilderCourses();

        }


        /* =====================================================
           NAVIGATION
        ===================================================== */

        function setupNavigation() {

            $$(".nav-item")
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const section =
                                button.dataset.section;

                            if (!section) return;

                            showSection(section);

                            closeMobileSidebar();

                        }
                    );

                });

        }


        function showSection(section) {

            $$(".nav-item")
                .forEach(button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.section ===
                        section
                    );

                });


            $$(".admin-section")
                .forEach(element => {

                    element.classList.toggle(
                        "active",
                        element.id ===
                        `${section}-section`
                    );

                });


            const pageTitle =
                $("#page-title");


            const titles = {

                dashboard:
                    "Dashboard",

                courses:
                    "Courses",

                personalise:
                    "Personalise Course",

                carousel:
                    "Carousel",

                students:
                    "Students",

                settings:
                    "Settings"

            };


            if (pageTitle) {

                pageTitle.textContent =
                    titles[section] ||
                    "Dashboard";
            }


            if (section === "courses") {

                loadCourses();

            }


            if (section === "carousel") {

                loadCarouselItems();

            }


            if (section === "personalise") {

                loadBuilderCourses();

            }

        }


        /* =====================================================
           SIDEBAR
        ===================================================== */

        function setupSidebar() {

            const app =
                $("#admin-app");

            const toggle =
                $("#sidebar-toggle");

            const close =
                $("#mobile-sidebar-close");

            const overlay =
                $("#sidebar-overlay");


            toggle?.addEventListener(
                "click",
                () => {

                    if (
                        window.innerWidth <= 900
                    ) {

                        app?.classList.toggle(
                            "sidebar-open"
                        );

                    }

                }
            );


            close?.addEventListener(
                "click",
                closeMobileSidebar
            );


            overlay?.addEventListener(
                "click",
                closeMobileSidebar
            );


            window.addEventListener(
                "resize",
                () => {

                    if (
                        window.innerWidth > 900
                    ) {

                        app?.classList.remove(
                            "sidebar-open"
                        );

                    }

                }
            );

        }


        function closeMobileSidebar() {

            $("#admin-app")
                ?.classList.remove(
                    "sidebar-open"
                );

        }


        /* =====================================================
           LOGOUT
        ===================================================== */

        function setupLogout() {

            $("#logout-button")
                ?.addEventListener(
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

                const {
                    data,
                    error
                } =
                    await client.auth.getUser();


                if (
                    error ||
                    !data?.user
                ) {

                    return;
                }


                const user =
                    data.user;


                const metadata =
                    user.user_metadata ||
                    {};


                const name =
                    metadata.name ||
                    metadata.full_name ||
                    metadata.display_name ||
                    user.email?.split("@")[0] ||
                    "Administrator";


                const avatar =
                    name
                        .charAt(0)
                        .toUpperCase();


                if ($("#admin-name")) {

                    $("#admin-name")
                        .textContent =
                        name;

                }


                if ($("#admin-role")) {

                    $("#admin-role")
                        .textContent =
                        "Admin";

                }


                if ($("#admin-avatar")) {

                    $("#admin-avatar")
                        .textContent =
                        avatar;

                }


                if (
                    $("#topbar-admin-avatar")
                ) {

                    $("#topbar-admin-avatar")
                        .textContent =
                        avatar;

                }

            } catch (error) {

                console.error(
                    "Could not load admin:",
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

            const {
                count,
                error
            } =
                await client
                    .from("courses")
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    )
                    .neq(
                        "status",
                        "archived"
                    );


            if (error) throw error;


            if ($("#total-courses")) {

                $("#total-courses")
                    .textContent =
                    count ?? 0;

            }

        }


        async function loadModuleCount() {

            const {
                count,
                error
            } =
                await client
                    .from("modules")
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    );


            if (error) {

                console.warn(
                    "Modules count:",
                    error
                );

                if ($("#total-units")) {

                    $("#total-units")
                        .textContent =
                        "—";

                }

                return;
            }


            if ($("#total-units")) {

                $("#total-units")
                    .textContent =
                    count ?? 0;

            }

        }


        async function loadLessonCount() {

            const {
                count,
                error
            } =
                await client
                    .from("lessons")
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    );


            if (error) {

                console.warn(
                    "Lessons count:",
                    error
                );

                if ($("#total-lessons")) {

                    $("#total-lessons")
                        .textContent =
                        "—";

                }

                return;
            }


            if ($("#total-lessons")) {

                $("#total-lessons")
                    .textContent =
                    count ?? 0;

            }

        }


        async function loadStudentCount() {

            try {

                const {
                    count,
                    error
                } =
                    await client
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
                        );


                if (error) throw error;


                if ($("#total-students")) {

                    $("#total-students")
                        .textContent =
                        count ?? 0;

                }

            } catch (error) {

                console.warn(
                    "Students count:",
                    error
                );

                if ($("#total-students")) {

                    $("#total-students")
                        .textContent =
                        "—";

                }

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
                ] =
                    await Promise.all([

                        client
                            .from("courses")
                            .select(
                                "id",
                                {
                                    count:
                                        "exact",
                                    head:
                                        true
                                }
                            )
                            .eq(
                                "status",
                                "published"
                            ),

                        client
                            .from("courses")
                            .select(
                                "id",
                                {
                                    count:
                                        "exact",
                                    head:
                                        true
                                }
                            )
                            .eq(
                                "status",
                                "draft"
                            )

                    ]);


                if (published) {

                    published.textContent =
                        publishedResult.count ??
                        0;

                }


                if (draft) {

                    draft.textContent =
                        draftResult.count ??
                        0;

                }

            } catch (error) {

                console.warn(
                    "Content counts:",
                    error
                );

            }

        }


        async function loadRecentActivity() {

            const list =
                $("#activity-list");

            if (!list) return;


            try {

                const {
                    data,
                    error
                } =
                    await client
                        .from("courses")
                        .select(
                            "id,title,status,created_at"
                        )
                        .order(
                            "created_at",
                            {
                                ascending:
                                    false
                            }
                        )
                        .limit(6);


                if (error) throw error;


                if (!data?.length) {

                    list.innerHTML =
                        `<div class="activity-empty">
                            No recent activity.
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

                                    <div class="activity-icon">
                                        ▣
                                    </div>

                                    <div>

                                        <div class="activity-title">
                                            ${escapeHTML(action)}
                                        </div>

                                        <div class="activity-meta">
                                            ${escapeHTML(course.title)}
                                            ·
                                            ${formatDate(course.created_at)}
                                        </div>

                                    </div>

                                </div>
                            `;

                        })
                        .join("");

            } catch (error) {

                list.innerHTML =
                    `<div class="activity-empty">
                        Unable to load activity.
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
           COURSE CONTROLS
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
                    () =>
                        openCourseModal()
                );

        }


        /* =====================================================
           LOAD COURSES
        ===================================================== */

        async function loadCourses() {

            const list =
                $("#courses-list");

            if (!list) return;


            list.innerHTML =
                `<div class="courses-loading">
                    Loading courses...
                </div>`;


            try {

                const {
                    data,
                    error
                } =
                    await client
                        .from("courses")
                        .select(`
                            id,
                            title,
                            description,
                            category,
                            level,
                            language,
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


                allCourses =
                    data || [];


                renderCourses();

            } catch (error) {

                console.error(
                    "Could not load courses:",
                    error
                );


                list.innerHTML = `
                    <div class="courses-empty">

                        <strong>
                            Could not load courses
                        </strong>

                        <p style="margin-top:8px;">
                            ${escapeHTML(
                                error.message ||
                                "Please try again."
                            )}
                        </p>

                    </div>
                `;

            }

        }


        /* =====================================================
           RENDER COURSES
        ===================================================== */

        function renderCourses() {

            const list =
                $("#courses-list");

            if (!list) return;


            const search =
                (
                    $("#course-search")
                        ?.value ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const filter =
                $("#course-filter")
                    ?.value ||
                "all";


            let courses =
                [...allCourses];


            if (filter !== "all") {

                courses =
                    courses.filter(
                        course =>
                            course.status ===
                            filter
                    );

            }


            if (search) {

                courses =
                    courses.filter(
                        course =>
                            (
                                course.title ||
                                ""
                            )
                                .toLowerCase()
                                .includes(search) ||

                            (
                                course.description ||
                                ""
                            )
                                .toLowerCase()
                                .includes(search) ||

                            (
                                course.category ||
                                ""
                            )
                                .toLowerCase()
                                .includes(search)
                    );

            }


            if (!courses.length) {

                list.innerHTML =
                    `<div class="courses-empty">
                        No courses found.
                    </div>`;

                return;
            }


            list.innerHTML =
                courses
                    .map(
                        renderCourseRow
                    )
                    .join("");


            attachCourseActions();

        }


        function renderCourseRow(course) {

            const image =
                course.cover_image
                    ? `
                        <img
                            src="${escapeAttribute(
                                course.cover_image
                            )}"
                            alt=""
                        >
                    `
                    : `
                        <div class="course-cover-placeholder">
                            E
                        </div>
                    `;


            const status =
                course.status ||
                "draft";


            return `
                <article class="course-row">

                    <div class="course-cover">
                        ${image}
                    </div>


                    <div>

                        <div class="course-row-title">
                            ${escapeHTML(
                                course.title ||
                                "Untitled course"
                            )}
                        </div>

                        <div class="course-row-description">
                            ${escapeHTML(
                                course.description ||
                                "No description."
                            )}
                        </div>


                        <div class="course-row-meta">

                            ${
                                course.category
                                    ? `
                                        <span class="course-badge">
                                            ${escapeHTML(
                                                course.category
                                            )}
                                        </span>
                                    `
                                    : ""
                            }

                            ${
                                course.level
                                    ? `
                                        <span class="course-badge">
                                            ${escapeHTML(
                                                course.level
                                            )}
                                        </span>
                                    `
                                    : ""
                            }

                            <span
                                class="course-badge ${escapeHTML(
                                    status
                                )}"
                            >
                                ${escapeHTML(
                                    status
                                )}
                            </span>

                        </div>

                    </div>


                    <div class="course-actions">

                        <button
                            type="button"
                            class="course-action-button primary"
                            data-action="personalise"
                            data-id="${escapeAttribute(
                                course.id
                            )}"
                        >
                            Personalise
                        </button>


                        <button
                            type="button"
                            class="course-action-button"
                            data-action="edit"
                            data-id="${escapeAttribute(
                                course.id
                            )}"
                        >
                            Edit
                        </button>


                        ${
                            status === "published"
                                ? `
                                    <button
                                        type="button"
                                        class="course-action-button"
                                        data-action="unpublish"
                                        data-id="${escapeAttribute(
                                            course.id
                                        )}"
                                    >
                                        Unpublish
                                    </button>
                                `
                                : `
                                    <button
                                        type="button"
                                        class="course-action-button"
                                        data-action="publish"
                                        data-id="${escapeAttribute(
                                            course.id
                                        )}"
                                    >
                                        Publish
                                    </button>
                                `
                        }


                        ${
                            status !== "archived"
                                ? `
                                    <button
                                        type="button"
                                        class="course-action-button danger"
                                        data-action="archive"
                                        data-id="${escapeAttribute(
                                            course.id
                                        )}"
                                    >
                                        Archive
                                    </button>
                                `
                                : `
                                    <button
                                        type="button"
                                        class="course-action-button"
                                        data-action="restore"
                                        data-id="${escapeAttribute(
                                            course.id
                                        )}"
                                    >
                                        Restore
                                    </button>
                                `
                        }

                    </div>

                </article>
            `;

        }


        function attachCourseActions() {

            $$(".course-action-button")
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            const action =
                                button.dataset.action;

                            const id =
                                button.dataset.id;


                            const course =
                                allCourses.find(
                                    item =>
                                        String(item.id) ===
                                        String(id)
                                );


                            if (!course) return;


                            if (
                                action ===
                                "edit"
                            ) {

                                openCourseModal(
                                    course
                                );

                                return;
                            }


                            if (
                                action ===
                                "personalise"
                            ) {

                                openCourseBuilder(
                                    course.id
                                );

                                return;
                            }


                            if (
                                action ===
                                "publish"
                            ) {

                                await updateCourseStatus(
                                    course,
                                    "published"
                                );

                                return;
                            }


                            if (
                                action ===
                                "unpublish"
                            ) {

                                await updateCourseStatus(
                                    course,
                                    "draft"
                                );

                                return;
                            }


                            if (
                                action ===
                                "archive"
                            ) {

                                await updateCourseStatus(
                                    course,
                                    "archived"
                                );

                                return;
                            }


                            if (
                                action ===
                                "restore"
                            ) {

                                await updateCourseStatus(
                                    course,
                                    "draft"
                                );

                            }

                        }
                    );

                });

        }


        async function updateCourseStatus(
            course,
            status
        ) {

            try {

                const {
                    error
                } =
                    await client
                        .from("courses")
                        .update({
                            status,
                            updated_at:
                                new Date()
                                    .toISOString(),
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


                await loadCourses();

                await loadDashboard();

            } catch (error) {

                showError(
                    error.message ||
                    "Unable to update course."
                );

            }

        }


        /* =====================================================
           COURSE MODAL
        ===================================================== */

        function openCourseModal(
            course = null
        ) {

            editingCourseId =
                course?.id ||
                null;


            if (courseModal) {

                courseModal.remove();

            }


            courseModal =
                document.createElement(
                    "div"
                );


            courseModal.className =
                "course-modal";


            courseModal.innerHTML = `

                <div
                    class="course-modal-backdrop"
                ></div>


                <div
                    class="course-modal-dialog"
                    role="dialog"
                    aria-modal="true"
                >

                    <div class="course-modal-header">

                        <div>

                            <div class="course-modal-kicker">
                                COURSE MANAGEMENT
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
                        novalidate
                    >

                        <div class="course-form-field">

                            <label>
                                Course Title *
                            </label>

                            <input
                                id="course-title-input"
                                type="text"
                                maxlength="200"
                                required
                                value="${escapeAttribute(
                                    course?.title ||
                                    ""
                                )}"
                                placeholder="Example: English Beginner"
                            >

                        </div>


                        <div class="course-form-field">

                            <label>
                                Description
                            </label>

                            <textarea
                                id="course-description-input"
                                maxlength="5000"
                                placeholder="Describe this course."
                            >${escapeHTML(
                                course?.description ||
                                ""
                            )}</textarea>

                        </div>


                        <div class="course-form-grid">


                            <div class="course-form-field">

                                <label>
                                    Category
                                </label>

                                <input
                                    id="course-category-input"
                                    type="text"
                                    value="${escapeAttribute(
                                        course?.category ||
                                        ""
                                    )}"
                                    placeholder="Language"
                                >

                            </div>


                            <div class="course-form-field">

                                <label>
                                    Level
                                </label>

                                <input
                                    id="course-level-input"
                                    type="text"
                                    value="${escapeAttribute(
                                        course?.level ||
                                        ""
                                    )}"
                                    placeholder="A1"
                                >

                            </div>


                            <div class="course-form-field">

                                <label>
                                    Language
                                </label>

                                <input
                                    id="course-language-input"
                                    type="text"
                                    value="${escapeAttribute(
                                        course?.language ||
                                        ""
                                    )}"
                                    placeholder="English"
                                >

                            </div>


                            <div class="course-form-field">

                                <label>
                                    Status
                                </label>

                                <select id="course-status-input">

                                    <option
                                        value="draft"
                                        ${
                                            (
                                                course?.status ||
                                                "draft"
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
                                            course?.status ===
                                            "published"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Published
                                    </option>

                                    <option
                                        value="archived"
                                        ${
                                            course?.status ===
                                            "archived"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Archived
                                    </option>

                                </select>

                            </div>

                        </div>


                        <div class="course-form-field">

                            <label>
                                Course Cover
                            </label>

                            <div class="file-drop">

                                <input
                                    id="course-cover-input"
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                >

                                <strong>
                                    Choose a course image
                                </strong>

                                <span>
                                    PNG, JPG or WebP
                                </span>

                            </div>

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


            requestAnimationFrame(
                () =>
                    courseModal.classList.add(
                        "open"
                    )
            );


            document.body.classList.add(
                "modal-open"
            );


            $("#close-course-modal")
                ?.addEventListener(
                    "click",
                    () =>
                        closeModalElement(
                            courseModal
                        )
                );


            $("#cancel-course-modal")
                ?.addEventListener(
                    "click",
                    () =>
                        closeModalElement(
                            courseModal
                        )
                );


            $(".course-modal-backdrop")
                ?.addEventListener(
                    "click",
                    () =>
                        closeModalElement(
                            courseModal
                        )
                );


            $("#course-form")
                ?.addEventListener(
                    "submit",
                    saveCourse
                );

        }


        async function saveCourse(
            event
        ) {

            event.preventDefault();


            const title =
                $("#course-title-input")
                    ?.value
                    .trim();


            const description =
                $("#course-description-input")
                    ?.value
                    .trim();


            const category =
                $("#course-category-input")
                    ?.value
                    .trim();


            const level =
                $("#course-level-input")
                    ?.value
                    .trim();


            const language =
                $("#course-language-input")
                    ?.value
                    .trim();


            const status =
                $("#course-status-input")
                    ?.value ||
                "draft";


            const errorElement =
                $("#course-form-error");


            const saveButton =
                $("#course-save-button");


            if (!title) {

                if (errorElement) {

                    errorElement.textContent =
                        "Course title is required.";

                    errorElement.hidden =
                        false;

                }

                return;
            }


            try {

                saveButton.disabled =
                    true;


                let coverImage =
                    null;


                const file =
                    $("#course-cover-input")
                        ?.files?.[0];


                if (
                    editingCourseId
                ) {

                    const existing =
                        allCourses.find(
                            item =>
                                String(item.id) ===
                                String(
                                    editingCourseId
                                )
                        );

                    coverImage =
                        existing?.cover_image ||
                        null;

                }


                if (file) {

                    coverImage =
                        await uploadFile(
                            file,
                            "course-covers"
                        );

                }


                const payload = {

                    title,

                    description,

                    category,

                    level,

                    language,

                    status,

                    cover_image:
                        coverImage,

                    updated_at:
                        new Date()
                            .toISOString()

                };


                let result;


                if (
                    editingCourseId
                ) {

                    result =
                        await client
                            .from("courses")
                            .update(payload)
                            .eq(
                                "id",
                                editingCourseId
                            )
                            .select()
                            .single();

                } else {

                    const {
                        data: {
                            user
                        } =
                            await client.auth
                                .getUser();


                    if (!user) {

                        throw new Error(
                            "Your session has expired."
                        );

                    }


                    payload.teacher_id =
                        user.id;


                    result =
                        await client
                            .from("courses")
                            .insert(
                                payload
                            )
                            .select()
                            .single();

                }


                if (result.error) {

                    throw result.error;

                }


                closeModalElement(
                    courseModal
                );


                await loadCourses();

                await loadDashboard();

            } catch (error) {

                console.error(
                    "Course save error:",
                    error
                );


                if (errorElement) {

                    errorElement.textContent =
                        error.message ||
                        "Could not save course.";

                    errorElement.hidden =
                        false;

                }

            } finally {

                if (saveButton) {

                    saveButton.disabled =
                        false;

                }

            }

        }


        /* =====================================================
           FILE UPLOAD
        ===================================================== */

        async function uploadFile(
            file,
            bucket,
            folder = ""
        ) {

            const extension =
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            const safeName =
                file.name
                    .replace(
                        /[^a-zA-Z0-9._-]/g,
                        "-"
                    );


            const path =
                `${folder ? folder + "/" : ""}` +
                `${Date.now()}-${crypto.randomUUID()}` +
                `-${safeName}`;


            const {
                error
            } =
                await client.storage
                    .from(bucket)
                    .upload(
                        path,
                        file,
                        {
                            cacheControl:
                                "3600",
                            upsert:
                                false,
                            contentType:
                                file.type ||
                                `application/${extension}`
                        }
                    );


            if (error) throw error;


            const {
                data
            } =
                client.storage
                    .from(bucket)
                    .getPublicUrl(path);


            return data.publicUrl;

        }


        /* =====================================================
           BUILDER
        ===================================================== */

        function setupBuilderControls() {

            $("#builder-course-select")
                ?.addEventListener(
                    "change",
                    async event => {

                        const courseId =
                            event.target.value;

                        if (!courseId) {

                            resetBuilder();

                            return;
                        }

                        await openCourseBuilder(
                            courseId
                        );

                    }
                );


            $("#add-module-button")
                ?.addEventListener(
                    "click",
                    () =>
                        openModuleModal()
                );


            $("#edit-module-button")
                ?.addEventListener(
                    "click",
                    () =>
                        openModuleModal(
                            selectedModule
                        )
                );


            $("#delete-module-button")
                ?.addEventListener(
                    "click",
                    deleteSelectedModule
                );


            $("#add-lesson-button")
                ?.addEventListener(
                    "click",
                    () =>
                        openLessonModal()
                );


            $("#edit-lesson-button")
                ?.addEventListener(
                    "click",
                    () =>
                        openLessonModal(
                            selectedLesson
                        )
                );


            $("#delete-lesson-button")
                ?.addEventListener(
                    "click",
                    deleteSelectedLesson
                );


            $("#add-content-button")
                ?.addEventListener(
                    "click",
                    openContentTypeModal
                );

        }


        async function loadBuilderCourses() {

            const select =
                $("#builder-course-select");

            if (!select) return;


            try {

                const {
                    data,
                    error
                } =
                    await client
                        .from("courses")
                        .select(
                            "id,title,status"
                        )
                        .neq(
                            "status",
                            "archived"
                        )
                        .order(
                            "title",
                            {
                                ascending: true
                            }
                        );


                if (error) throw error;


                const current =
                    select.value;


                select.innerHTML =
                    `<option value="">
                        Select a course...
                    </option>` +
                    (data || [])
                        .map(
                            course =>
                                `
                                <option
                                    value="${escapeAttribute(
                                        course.id
                                    )}"
                                >
                                    ${escapeHTML(
                                        course.title
                                    )}
                                </option>
                                `
                        )
                        .join("");


                if (current) {

                    select.value =
                        current;

                }

            } catch (error) {

                console.error(
                    "Builder courses:",
                    error
                );

            }

        }


        async function openCourseBuilder(
            courseId
        ) {

            const course =
                allCourses.find(
                    item =>
                        String(item.id) ===
                        String(courseId)
                );


            if (!course) {

                await loadCourses();

                builderCourse =
                    allCourses.find(
                        item =>
                            String(item.id) ===
                            String(courseId)
                    );

            } else {

                builderCourse =
                    course;

            }


            if (!builderCourse) {

                showError(
                    "Course could not be loaded."
                );

                return;
            }


            const select =
                $("#builder-course-select");


            if (select) {

                select.value =
                    builderCourse.id;

            }


            await loadBuilderStructure();

            showSection("personalise");

        }


        async function loadBuilderStructure() {

            if (!builderCourse) return;


            $("#course-builder")
                ?.classList.remove(
                    "disabled"
                );


            $("#add-module-button")
                ?.removeAttribute(
                    "disabled"
                );


            $("#builder-course-title")
                &&
                (
                    $("#builder-course-title")
                        .textContent =
                        builderCourse.title
                );


            const summary =
                $("#builder-course-summary");


            if (summary) {

                summary.innerHTML = `
                    <span>
                        ${escapeHTML(
                            builderCourse.level ||
                            "Course"
                        )}
                        ·
                        ${escapeHTML(
                            builderCourse.status ||
                            "draft"
                        )}
                        ·
                        Build modules, lessons and content
                    </span>
                `;

            }


            const {
                data,
                error
            } =
                await client
                    .from("modules")
                    .select("*")
                    .eq(
                        "course_id",
                        builderCourse.id
                    )
                    .order(
                        "sort_order",
                        {
                            ascending: true
                        }
                    )
                    .order(
                        "created_at",
                        {
                            ascending: true
                        }
                    );


            if (error) {

                console.error(
                    "Could not load modules:",
                    error
                );


                $("#builder-tree").innerHTML =
                    `<div class="builder-empty">
                        ${escapeHTML(
                            error.message
                        )}
                    </div>`;

                return;

            }


            builderModules =
                data || [];


            for (
                const module
                of builderModules
            ) {

                await loadModuleLessons(
                    module
                );

            }


            selectedModule =
                null;

            selectedLesson =
                null;


            renderBuilderTree();

            showBuilderWelcome();

        }


        async function loadModuleLessons(
            module
        ) {

            const {
                data,
                error
            } =
                await client
                    .from("lessons")
                    .select("*")
                    .eq(
                        "module_id",
                        module.id
                    )
                    .order(
                        "sort_order",
                        {
                            ascending: true
                        }
                    )
                    .order(
                        "created_at",
                        {
                            ascending: true
                        }
                    );


            if (error) {

                console.error(
                    "Lessons:",
                    error
                );

                module.lessons = [];

                return;

            }


            module.lessons =
                data || [];


            for (
                const lesson
                of module.lessons
            ) {

                await loadLessonContent(
                    lesson
                );

            }

        }


        async function loadLessonContent(
            lesson
        ) {

            const {
                data,
                error
            } =
                await client
                    .from("content")
                    .select("*")
                    .eq(
                        "lesson_id",
                        lesson.id
                    )
                    .order(
                        "sort_order",
                        {
                            ascending: true
                        }
                    )
                    .order(
                        "created_at",
                        {
                            ascending: true
                        }
                    );


            if (error) {

                console.error(
                    "Content:",
                    error
                );

                lesson.content =
                    [];

                return;

            }


            lesson.content =
                data || [];

        }


        function renderBuilderTree() {

            const tree =
                $("#builder-tree");

            if (!tree) return;


            if (!builderModules.length) {

                tree.innerHTML =
                    `<div class="builder-empty">
                        No modules yet.<br>
                        Create your first module.
                    </div>`;

                return;
            }


            tree.innerHTML =
                builderModules
                    .map(
                        (module, moduleIndex) => {

                            const active =
                                selectedModule &&
                                String(
                                    selectedModule.id
                                ) ===
                                String(
                                    module.id
                                );


                            return `
                                <div class="tree-module">

                                    <div
                                        class="
                                            tree-module-header
                                            ${
                                                active
                                                    ? "active"
                                                    : ""
                                            }
                                        "
                                        data-module-id="${escapeAttribute(
                                            module.id
                                        )}"
                                    >

                                        <span class="tree-module-toggle">
                                            ▾
                                        </span>

                                        <span class="tree-module-title">
                                            ${escapeHTML(
                                                module.title
                                            )}
                                        </span>

                                        <button
                                            type="button"
                                            class="tree-module-menu"
                                            data-module-edit="${escapeAttribute(
                                                module.id
                                            )}"
                                            aria-label="Edit module"
                                        >
                                            ⋯
                                        </button>

                                    </div>


                                    <div class="tree-lessons">

                                        ${
                                            module.lessons?.length
                                                ? module.lessons
                                                    .map(
                                                        (
                                                            lesson,
                                                            lessonIndex
                                                        ) =>
                                                            `
                                                            <button
                                                                type="button"
                                                                class="
                                                                    tree-lesson
                                                                    ${
                                                                        selectedLesson &&
                                                                        String(
                                                                            selectedLesson.id
                                                                        ) ===
                                                                        String(
                                                                            lesson.id
                                                                        )
                                                                            ? "active"
                                                                            : ""
                                                                    }
                                                                "
                                                                data-lesson-id="${escapeAttribute(
                                                                    lesson.id
                                                                )}"
                                                                data-module-id="${escapeAttribute(
                                                                    module.id
                                                                )}"
                                                            >

                                                                ${escapeHTML(
                                                                    lesson.title
                                                                )}

                                                                <span class="tree-lesson-count">
                                                                    ${
                                                                        lesson.content?.length ||
                                                                        0
                                                                    }
                                                                </span>

                                                            </button>
                                                            `
                                                    )
                                                    .join("")
                                                : `
                                                    <div
                                                        style="
                                                            padding:8px;
                                                            color:#98a2b3;
                                                            font-size:9px;
                                                        "
                                                    >
                                                        No lessons
                                                    </div>
                                                `
                                        }

                                    </div>

                                </div>
                            `;

                        }
                    )
                    .join("");


            $$(".tree-module-header")
                .forEach(
                    element => {

                        element.addEventListener(
                            "click",
                            event => {

                                if (
                                    event.target.closest(
                                        "[data-module-edit]"
                                    )
                                ) {

                                    return;

                                }


                                const module =
                                    builderModules.find(
                                        item =>
                                            String(
                                                item.id
                                            ) ===
                                            String(
                                                element.dataset.moduleId
                                            )
                                    );


                                if (!module) return;


                                selectedModule =
                                    module;

                                selectedLesson =
                                    null;

                                renderBuilderTree();

                                renderModuleEditor();

                            }
                        );

                    }
                );


            $$("[data-module-edit]")
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            event => {

                                event.stopPropagation();

                                const module =
                                    builderModules.find(
                                        item =>
                                            String(
                                                item.id
                                            ) ===
                                            String(
                                                button.dataset.moduleEdit
                                            )
                                    );


                                if (module) {

                                    openModuleModal(
                                        module
                                    );

                                }

                            }
                        );

                    }
                );


            $$(".tree-lesson")
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                const module =
                                    builderModules.find(
                                        item =>
                                            String(
                                                item.id
                                            ) ===
                                            String(
                                                button.dataset.moduleId
                                            )
                                    );


                                const lesson =
                                    module?.lessons?.find(
                                        item =>
                                            String(
                                                item.id
                                            ) ===
                                            String(
                                                button.dataset.lessonId
                                            )
                                    );


                                if (
                                    !module ||
                                    !lesson
                                ) return;


                                selectedModule =
                                    module;

                                selectedLesson =
                                    lesson;

                                renderBuilderTree();

                                renderLessonEditor();

                            }
                        );

                    }
                );

        }


        function showBuilderWelcome() {

            $("#builder-welcome")
                ?.classList.remove(
                    "admin-hidden"
                );

            $("#module-editor")
                ?.classList.add(
                    "admin-hidden"
                );

            $("#lesson-editor")
                ?.classList.add(
                    "admin-hidden"
                );

        }


        function renderModuleEditor() {

            if (!selectedModule) return;


            $("#builder-welcome")
                ?.classList.add(
                    "admin-hidden"
                );


            $("#lesson-editor")
                ?.classList.add(
                    "admin-hidden"
                );


            $("#module-editor")
                ?.classList.remove(
                    "admin-hidden"
                );


            $("#module-editor-title")
                &&
                (
                    $("#module-editor-title")
                        .textContent =
                        selectedModule.title
                );


            const list =
                $("#lesson-list");


            if (!list) return;


            if (
                !selectedModule.lessons?.length
            ) {

                list.innerHTML =
                    `<div class="content-empty">
                        This module has no lessons yet.
                    </div>`;

                return;

            }


            list.innerHTML =
                selectedModule.lessons
                    .map(
                        (
                            lesson,
                            index
                        ) =>
                            `
                            <article
                                class="
                                    lesson-card
                                    ${
                                        selectedLesson &&
                                        String(
                                            selectedLesson.id
                                        ) ===
                                        String(
                                            lesson.id
                                        )
                                            ? "active"
                                            : ""
                                    }
                                "
                                data-editor-lesson="${escapeAttribute(
                                    lesson.id
                                )}"
                            >

                                <div class="lesson-number">
                                    ${index + 1}
                                </div>

                                <div class="lesson-card-content">

                                    <div class="lesson-card-title">
                                        ${escapeHTML(
                                            lesson.title
                                        )}
                                    </div>

                                    <div class="lesson-card-description">
                                        ${
                                            escapeHTML(
                                                lesson.description ||
                                                "No description."
                                            )
                                        }
                                        ·
                                        ${
                                            lesson.content?.length ||
                                            0
                                        }
                                        content blocks
                                    </div>

                                </div>

                                <div class="lesson-card-arrow">
                                    →
                                </div>

                            </article>
                            `
                    )
                    .join("");


            $$("[data-editor-lesson]")
                .forEach(
                    element => {

                        element.addEventListener(
                            "click",
                            () => {

                                const lesson =
                                    selectedModule
                                        .lessons
                                        .find(
                                            item =>
                                                String(
                                                    item.id
                                                ) ===
                                                String(
                                                    element.dataset
                                                        .editorLesson
                                                )
                                        );


                                if (!lesson) return;


                                selectedLesson =
                                    lesson;

                                renderBuilderTree();

                                renderLessonEditor();

                            }
                        );

                    }
                );

        }


        function renderLessonEditor() {

            if (!selectedLesson) return;


            $("#builder-welcome")
                ?.classList.add(
                    "admin-hidden"
                );


            $("#module-editor")
                ?.classList.add(
                    "admin-hidden"
                );


            $("#lesson-editor")
                ?.classList.remove(
                    "admin-hidden"
                );


            $("#lesson-editor-title")
                &&
                (
                    $("#lesson-editor-title")
                        .textContent =
                        selectedLesson.title
                );


            $("#lesson-editor-description")
                &&
                (
                    $("#lesson-editor-description")
                        .textContent =
                        selectedLesson.description ||
                        "Build this lesson using learning content blocks."
                );


            renderContentList();

        }


        /* =====================================================
           MODULE MODAL
        ===================================================== */

        function openModuleModal(
            module = null
        ) {

            if (!builderCourse) {

                showError(
                    "Select a course first."
                );

                return;
            }


            if (moduleModal) {

                moduleModal.remove();

            }


            moduleModal =
                document.createElement(
                    "div"
                );


            moduleModal.className =
                "course-modal";


            moduleModal.innerHTML = `

                <div class="course-modal-backdrop"></div>


                <div class="course-modal-dialog">

                    <div class="course-modal-header">

                        <div>

                            <div class="course-modal-kicker">
                                COURSE STRUCTURE
                            </div>

                            <h2>
                                ${
                                    module
                                        ? "Edit Module"
                                        : "Create Module"
                                }
                            </h2>

                        </div>


                        <button
                            type="button"
                            class="course-modal-close"
                            id="close-module-modal"
                        >
                            ×
                        </button>

                    </div>


                    <form
                        id="module-form"
                        class="course-form"
                    >

                        <div class="course-form-field">

                            <label>
                                Module Title *
                            </label>

                            <input
                                id="module-title-input"
                                type="text"
                                required
                                maxlength="200"
                                value="${escapeAttribute(
                                    module?.title ||
                                    ""
                                )}"
                                placeholder="Example: Getting Started"
                            >

                        </div>


                        <div class="course-form-field">

                            <label>
                                Module Description
                            </label>

                            <textarea
                                id="module-description-input"
                                maxlength="2000"
                                placeholder="Describe what students will learn in this module."
                            >${escapeHTML(
                                module?.description ||
                                ""
                            )}</textarea>

                        </div>


                        <div class="course-form-field">

                            <label>
                                Order
                            </label>

                            <input
                                id="module-order-input"
                                type="number"
                                min="0"
                                value="${escapeAttribute(
                                    module?.sort_order ??
                                    builderModules.length
                                )}"
                            >

                        </div>


                        <div
                            id="module-form-error"
                            class="course-form-error"
                            hidden
                        ></div>


                        <div class="course-form-actions">

                            <button
                                type="button"
                                class="secondary-button"
                                id="cancel-module-modal"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                class="primary-button"
                            >
                                ${
                                    module
                                        ? "Save Module"
                                        : "Create Module"
                                }
                            </button>

                        </div>

                    </form>

                </div>
            `;


            document.body.appendChild(
                moduleModal
            );


            requestAnimationFrame(
                () =>
                    moduleModal.classList.add(
                        "open"
                    )
            );


            $("#close-module-modal")
                ?.addEventListener(
                    "click",
                    () =>
                        closeModalElement(
                            moduleModal
                        )
                );


            $("#cancel-module-modal")
                ?.addEventListener(
                    "click",
                    () =>
                        closeModalElement(
                            moduleModal
                        )
                );


            moduleModal
                .querySelector(
                    ".course-modal-backdrop"
                )
                ?.addEventListener(
                    "click",
                    () =>
                        closeModalElement(
                            moduleModal
                        )
                );


            $("#module-form")
                ?.addEventListener(
                    "submit",
                    event =>
                        saveModule(
                            event,
                            module
                        )
                );

        }


        async function saveModule(
            event,
            module
        ) {

            event.preventDefault();


            const title =
                $("#module-title-input")
                    ?.value
                    .trim();


            const description =
                $("#module-description-input")
                    ?.value
                    .trim();


            const sortOrder =
                Number(
                    $("#module-order-input")
                        ?.value ||
                    0
                );


            const errorElement =
                $("#module-form-error");


            if (!title) {

                errorElement.textContent =
                    "Module title is required.";

                errorElement.hidden =
                    false;

                return;

            }


            try {

                const payload = {

                    title,

                    description,

                    sort_order:
                        Number.isFinite(
                            sortOrder
                        )
                            ? sortOrder
                            : 0,

                    updated_at:
                        new Date()
                            .toISOString()

                };


                let result;


                if (module) {

                    result =
                        await client
                            .from("modules")
                            .update(
                                payload
                            )
                            .eq(
                                "id",
                                module.id
                            )
                            .select()
                            .single();

                } else {

                    result =
                        await client
                            .from("modules")
                            .insert({

                                ...payload,

                                course_id:
                                    builderCourse.id

                            })
                            .select()
                            .single();

                }


                if (result.error) {

                    throw result.error;

                }


                closeModalElement(
                    moduleModal
                );


                await loadBuilderStructure();

            } catch (error) {

                console.error(
                    "Module save:",
                    error
                );


                errorElement.textContent =
                    error.message ||
                    "Could not save module.";

                errorElement.hidden =
                    false;

            }

        }


        async function deleteSelectedModule() {

            if (!selectedModule) return;


            const confirmed =
                confirm(
                    `Delete "${selectedModule.title}" and all its lessons and content?`
                );


            if (!confirmed) return;


            try {

                const {
                    error
                } =
                    await client
                        .from("modules")
                        .delete()
                        .eq(
                            "id",
                            selectedModule.id
                        );


                if (error) throw error;


                selectedModule =
                    null;

                selectedLesson =
                    null;


                await loadBuilderStructure();


            } catch (error) {

                showError(
                    error.message ||
                    "Could not delete module."
                );

            }

        }


        /* =====================================================
           LESSON MODAL
        ===================================================== */

        function openLessonModal(
            lesson = null
        ) {

            if (!selectedModule) {

                showError(
                    "Select a module first."
                );

                return;
            }


            if (lessonModal) {

                lessonModal.remove();

            }


            lessonModal =
                document.createElement(
                    "div"
                );


            lessonModal.className =
                "course-modal";


            lessonModal.innerHTML = `

                <div class="course-modal-backdrop"></div>


                <div class="course-modal-dialog">

                    <div class="course-modal-header">

                        <div>

                            <div class="course-modal-kicker">
                                LESSON
                            </div>

                            <h2>
                                ${
                                    lesson
                                        ? "Edit Lesson"
                                        : "Create Lesson"
                                }
                            </h2>

                        </div>


                        <button
                            type="button"
                            class="course-modal-close"
                            id="close-lesson-modal"
                        >
                            ×
                        </button>

                    </div>


                    <form
                        id="lesson-form"
                        class="course-form"
                    >

                        <div class="course-form-field">

                            <label>
                                Lesson Title *
                            </label>

                            <input
                                id="lesson-title-input"
                                type="text"
                                maxlength="200"
                                required
                                value="${escapeAttribute(
                                    lesson?.title ||
                                    ""
                                )}"
                                placeholder="Example: Introducing Yourself"
                            >

                        </div>


                        <div class="course-form-field">

                            <label>
                                Lesson Description
                            </label>

                            <textarea
                                id="lesson-description-input"
                                maxlength="3000"
                                placeholder="Explain what this lesson covers."
                            >${escapeHTML(
                                lesson?.description ||
                                ""
                            )}</textarea>

                        </div>


                        <div class="course-form-grid">

                            <div class="course-form-field">

                                <label>
                                    Order
                                </label>

                                <input
                                    id="lesson-order-input"
                                    type="number"
                                    min="0"
                                    value="${escapeAttribute(
                                        lesson?.sort_order ??
                                        (
                                            selectedModule
                                                .lessons
                                                ?.length ||
                                            0
                                        )
                                    )}"
                                >

                            </div>


                            <div class="course-form-field">

                                <label>
                                    Status
                                </label>

                                <select id="lesson-status-input">

                                    <option
                                        value="draft"
                                        ${
                                            (
                                                lesson?.status ||
                                                "draft"
                                            ) ===
                                            "draft"
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        Draft
                                    </option>

                                    <option
                                        value="published"
                                        ${
                                            lesson?.status ===
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


                        <div
                            id="lesson-form-error"
                            class="course-form-error"
                            hidden
                        ></div>


                        <div class="course-form-actions">

                            <button
                                type="button"
                                class="secondary-button"
                                id="cancel-lesson-modal"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                class="primary-button"
                            >
                                ${
                                    lesson
                                        ? "Save Lesson"
                                        : "Create Lesson"
                                }
                            </button>

                        </div>

                    </form>

                </div>
            `;


            document.body.appendChild(
                lessonModal
            );


            requestAnimationFrame(
                () =>
                    lessonModal.classList.add(
                        "open"
                    )
            );


            $("#close-lesson-modal")
                ?.addEventListener(
                    "click",
                    () =>
                        closeModalElement(
                            lessonModal
                        )
                );


            $("#cancel-lesson-modal")
                ?.addEventListener(
                    "click",
                    () =>
                        closeModalElement(
                            lessonModal
                        )
                );


            lessonModal
                .querySelector(
                    ".course-modal-backdrop"
                )
                ?.addEventListener(
                    "click",
                    () =>
                        closeModalElement(
                            lessonModal
                        )
                );


            $("#lesson-form")
                ?.addEventListener(
                    "submit",
                    event =>
                        saveLesson(
                            event,
                            lesson
                        )
                );

        }


        async function saveLesson(
            event,
            lesson
        ) {

            event.preventDefault();


            const title =
                $("#lesson-title-input")
                    ?.value
                    .trim();


            const description =
                $("#lesson-description-input")
                    ?.value
                    .trim();


            const sortOrder =
                Number(
                    $("#lesson-order-input")
                        ?.value ||
                    0
                );


            const status =
                $("#lesson-status-input")
                    ?.value ||
                "draft";


            const errorElement =
                $("#lesson-form-error");


            if (!title) {

                errorElement.textContent =
                    "Lesson title is required.";

                errorElement.hidden =
                    false;

                return;

            }


            try {

                const payload = {

                    title,

                    description,

                    sort_order:
                        Number.isFinite(
                            sortOrder
                        )
                            ? sortOrder
                            : 0,

                    status,

                    updated_at:
                        new Date()
                            .toISOString()

                };


                let result;


                if (lesson) {

                    result =
                        await client
                            .from("lessons")
                            .update(
                                payload
                            )
                            .eq(
                                "id",
                                lesson.id
                            )
                            .select()
                            .single();

                } else {

                    result =
                        await client
                            .from("lessons")
                            .insert({

                                ...payload,

                                module_id:
                                    selectedModule.id

                            })
                            .select()
                            .single();

                }


                if (result.error) {

                    throw result.error;

                }


                closeModalElement(
                    lessonModal
                );


                await loadBuilderStructure();


                selectedModule =
                    builderModules.find(
                        item =>
                            String(item.id) ===
                            String(
                                selectedModule?.id
                            )
                    ) ||
                    builderModules[0] ||
                    null;


            } catch (error) {

                console.error(
                    "Lesson save:",
                    error
                );


                errorElement.textContent =
                    error.message ||
                    "Could not save lesson.";

                errorElement.hidden =
                    false;

            }

        }


        async function deleteSelectedLesson() {

            if (!selectedLesson) return;


            const confirmed =
                confirm(
                    `Delete "${selectedLesson.title}" and all its content?`
                );


            if (!confirmed) return;


            try {

                const {
                    error
                } =
                    await client
                        .from("lessons")
                        .delete()
                        .eq(
                            "id",
                            selectedLesson.id
                        );


                if (error) throw error;


                selectedLesson =
                    null;


                await loadBuilderStructure();

            } catch (error) {

                showError(
                    error.message ||
                    "Could not delete lesson."
                );

            }

        }


        /* =====================================================
           CONTENT TYPE MODAL
        ===================================================== */

        function openContentTypeModal() {

            if (!selectedLesson) {

                showError(
                    "Select a lesson first."
                );

                return;
            }


            if (contentModal) {

                contentModal.remove();

            }


            contentModal =
                document.createElement(
                    "div"
                );


            contentModal.className =
                "course-modal";


            const types = [

                [
                    "text",
                    "T",
                    "Text",
                    "Reading, explanations and instructions."
                ],

                [
                    "image",
                    "▧",
                    "Image",
                    "Visual learning material."
                ],

                [
                    "audio",
                    "♫",
                    "Audio",
                    "Listening and pronunciation."
                ],

                [
                    "video",
                    "▶",
                    "Video",
                    "Video lessons and demonstrations."
                ],

                [
                    "pdf",
                    "▤",
                    "PDF",
                    "Documents and downloadable resources."
                ],

                [
                    "exercise",
                    "✓",
                    "Exercise",
                    "Practice activities."
                ],

                [
                    "quiz",
                    "?",
                    "Quiz",
                    "Questions and assessment."
                ],

                [
                    "ai",
                    "✦",
                    "AI Interaction",
                    "AI-powered learning activity."
                ]

            ];


            contentModal.innerHTML = `

                <div class="course-modal-backdrop"></div>


                <div class="course-modal-dialog">

                    <div class="course-modal-header">

                        <div>

                            <div class="course-modal-kicker">
                                LESSON BUILDER
                            </div>

                            <h2>
                                Add Content
                            </h2>

                        </div>


                        <button
                            type="button"
                            class="course-modal-close"
                            id="close-content-type-modal"
                        >
                            ×
                        </button>

                    </div>


                    <div class="course-form">

                        <p
                            style="
                                color:#667085;
                                font-size:11px;
                                line-height:1.6;
                                margin-bottom:18px;
                            "
                        >
                            Choose the type of learning block
                            you want to add to this lesson.
                        </p>


                        <div class="content-type-grid">

                            ${
                                types
                                    .map(
                                        type =>
                                            `
                                            <button
                                                type="button"
                                                class="content-type-option"
                                                data-content-type="${type[0]}"
                                            >

                                                <div
                                                    class="content-type-option-icon"
                                                >
                                                    ${type[1]}
                                                </div>

                                                <strong>
                                                    ${type[2]}
                                                </strong>

                                                <span>
                                                    ${type[3]}
                                                </span>

                                            </button>
                                            `
                                    )
                                    .join("")
                            }

                        </div>

                    </div>

                </div>
            `;


            document.body.appendChild(
                contentModal
            );


            requestAnimationFrame(
                () =>
                    contentModal.classList.add(
                        "open"
                    )
            );


            $("#close-content-type-modal")
                ?.addEventListener(
                    "click",
                    () =>
                        closeModalElement(
                            contentModal
                        )
                );


            contentModal
                .querySelector(
                    ".course-modal-backdrop"
                )
                ?.addEventListener(
                    "click",
                    () =>
                        closeModalElement(
                            contentModal
                        )
                );


            $$("[data-content-type]")
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                const type =
                                    button.dataset
                                        .contentType;

                                closeModalElement(
                                    contentModal
                                );

                                openContentEditor(
                                    type
                                );

                            }
                        );

                    }
                );

        }


        /* =====================================================
           CONTENT EDITOR
        ===================================================== */

        function openContentEditor(
            type,
            content = null
        ) {

            const labels = {

                text:
                    [
                        "Text",
                        "Create written learning material."
                    ],

                image:
                    [
                        "Image",
                        "Upload an image for the lesson."
                    ],

                audio:
                    [
                        "Audio",
                        "Upload an audio recording."
                    ],

                video:
                    [
                        "Video",
                        "Upload a video lesson."
                    ],

                pdf:
                    [
                        "PDF",
                        "Upload a PDF resource."
                    ],

                exercise:
                    [
                        "Exercise",
                        "Create a practice activity."
                    ],

                quiz:
                    [
                        "Quiz",
                        "Create a structured quiz."
                    ],

                ai:
                    [
                        "AI Interaction",
                        "Configure an AI-powered learning activity."
                    ]

            };


            const label =
                labels[type] ||
                ["Content", "Learning content."];


            const body =
                content?.body ||
                "";


            const metadata =
                content?.metadata ||
                {};


            if (contentModal) {

                contentModal.remove();

            }


            contentModal =
                document.createElement(
                    "div"
                );


            contentModal.className =
                "course-modal";


            contentModal.innerHTML = `

                <div class="course-modal-backdrop"></div>


                <div class="course-modal-dialog">

                    <div class="course-modal-header">

                        <div>

                            <div class="course-modal-kicker">
                                ${escapeHTML(
                                    label[0]
                                )}
                            </div>

                            <h2>
                                ${
                                    content
                                        ? "Edit Content"
                                        : "Add Content"
                                }
                            </h2>

                        </div>


                        <button
                            type="button"
                            class="course-modal-close"
                            id="close-content-editor"
                        >
                            ×
                        </button>

                    </div>


                    <form
                        id="content-editor-form"
                        class="course-form"
                    >

                        <div class="course-form-field">

                            <label>
                                Title
                            </label>

                            <input
                                id="content-title-input"
                                type="text"
                                maxlength="200"
                                value="${escapeAttribute(
                                    content?.title ||
                                    ""
                                )}"
                                placeholder="${escapeAttribute(
                                    label[0]
                                )}"
                            >

                        </div>


                        ${
                            type === "text"
                                ? `
                                    <div class="course-form-field">

                                        <label>
                                            Content *
                                        </label>

                                        <textarea
                                            id="content-body-input"
                                            required
                                            style="min-height:220px;"
                                            placeholder="Write the learning content here..."
                                        >${escapeHTML(
                                            body
                                        )}</textarea>

                                    </div>
                                `
                                : ""
                        }


                        ${
                            type === "exercise"
                                ? `
                                    <div class="course-form-field">

                                        <label>
                                            Instructions *
                                        </label>

                                        <textarea
                                            id="content-body-input"
                                            required
                                            style="min-height:150px;"
                                            placeholder="Describe the activity..."
                                        >${escapeHTML(
                                            body
                                        )}</textarea>

                                    </div>

                                    <div class="course-form-grid">

                                        <div class="course-form-field">

                                            <label>
                                                Expected Answer
                                            </label>

                                            <input
                                                id="exercise-answer-input"
                                                value="${escapeAttribute(
                                                    metadata.answer ||
                                                    ""
                                                )}"
                                                placeholder="Optional"
                                            >

                                        </div>

                                        <div class="course-form-field">

                                            <label>
                                                Hint
                                            </label>

                                            <input
                                                id="exercise-hint-input"
                                                value="${escapeAttribute(
                                                    metadata.hint ||
                                                    ""
                                                )}"
                                                placeholder="Optional"
                                            >

                                        </div>

                                    </div>
                                `
                                : ""
                        }


                        ${
                            type === "quiz"
                                ? `
                                    <div class="course-form-field">

                                        <label>
                                            Question *
                                        </label>

                                        <textarea
                                            id="content-body-input"
                                            required
                                            style="min-height:130px;"
                                            placeholder="Write the quiz question..."
                                        >${escapeHTML(
                                            body
                                        )}</textarea>

                                    </div>

                                    <div class="course-form-field">

                                        <label>
                                            Options
                                        </label>

                                        <textarea
                                            id="quiz-options-input"
                                            style="min-height:100px;"
                                            placeholder="One option per line"
                                        >${escapeHTML(
                                            Array.isArray(
                                                metadata.options
                                            )
                                                ? metadata.options.join(
                                                    "\n"
                                                )
                                                : ""
                                        )}</textarea>

                                    </div>

                                    <div class="course-form-field">

                                        <label>
                                            Correct Answer
                                        </label>

                                        <input
                                            id="quiz-answer-input"
                                            value="${escapeAttribute(
                                                metadata.answer ||
                                                ""
                                            )}"
                                            placeholder="Enter the correct option"
                                        >

                                    </div>
                                `
                                : ""
                        }


                        ${
                            type === "ai"
                                ? `
                                    <div class="course-form-field">

                                        <label>
                                            AI Instructions *
                                        </label>

                                        <textarea
                                            id="content-body-input"
                                            required
                                            style="min-height:170px;"
                                            placeholder="Tell the AI what the student should practise..."
                                        >${escapeHTML(
                                            body
                                        )}</textarea>

                                    </div>

                                    <div class="course-form-grid">

                                        <div class="course-form-field">

                                            <label>
                                                AI Mode
                                            </label>

                                            <select id="ai-mode-input">

                                                <option
                                                    value="conversation"
                                                    ${
                                                        (
                                                            metadata.mode ||
                                                            "conversation"
                                                        ) ===
                                                        "conversation"
                                                            ? "selected"
                                                            : ""
                                                    }
                                                >
                                                    Conversation
                                                </option>

                                                <option
                                                    value="speaking"
                                                    ${
                                                        metadata.mode ===
                                                        "speaking"
                                                            ? "selected"
                                                            : ""
                                                    }
                                                >
                                                    Speaking
                                                </option>

                                                <option
                                                    value="roleplay"
                                                    ${
                                                        metadata.mode ===
                                                        "roleplay"
                                                            ? "selected"
                                                            : ""
                                                    }
                                                >
                                                    Role Play
                                                </option>

                                            </select>

                                        </div>

                                        <div class="course-form-field">

                                            <label>
                                                Objective
                                            </label>

                                            <input
                                                id="ai-objective-input"
                                                value="${escapeAttribute(
                                                    metadata.objective ||
                                                    ""
                                                )}"
                                                placeholder="What should the student achieve?"
                                            >

                                        </div>

                                    </div>
                                `
                                : ""
                        }


                        ${
                            (
                                type === "image" ||
                                type === "audio" ||
                                type === "video" ||
                                type === "pdf"
                            )
                                ? `
                                    <div class="course-form-field">

                                        <label>
                                            File *
                                        </label>

                                        <div class="file-drop">

                                            <input
                                                id="content-file-input"
                                                type="file"
                                                accept="${
                                                    type ===
                                                    "image"
                                                        ? "image/*"
                                                        :
                                                    type ===
                                                    "audio"
                                                        ? "audio/*"
                                                        :
                                                    type ===
                                                    "video"
                                                        ? "video/*"
                                                        :
                                                        "application/pdf"
                                                }"
                                            >

                                            <strong>
                                                ${
                                                    content
                                                        ? "Choose a replacement file"
                                                        : "Choose file"
                                                }
                                            </strong>

                                            <span>
                                                ${escapeHTML(
                                                    label[1]
                                                )}
                                            </span>

                                        </div>

                                        ${
                                            content?.media_url
                                                ? `
                                                    <div
                                                        style="
                                                            margin-top:9px;
                                                            color:#667085;
                                                            font-size:9px;
                                                            word-break:break-all;
                                                        "
                                                    >
                                                        Existing:
                                                        ${escapeHTML(
                                                            content.media_url
                                                        )}
                                                    </div>
                                                `
                                                : ""
                                        }

                                    </div>
                                `
                                : ""
                        }


                        ${
                            (
                                type === "image" ||
                                type === "audio" ||
                                type === "video" ||
                                type === "pdf"
                            )
                                ? `
                                    <div class="course-form-field">

                                        <label>
                                            Description
                                        </label>

                                        <textarea
                                            id="content-body-input"
                                            placeholder="Optional description..."
                                        >${escapeHTML(
                                            body
                                        )}</textarea>

                                    </div>
                                `
                                : ""
                        }


                        ${
                            type === "text" ||
                            type === "exercise" ||
                            type === "quiz" ||
                            type === "ai"
                                ? ""
                                : ""
                        }


                        <div
                            id="content-form-error"
                            class="course-form-error"
                            hidden
                        ></div>


                        <div class="course-form-actions">

                            <button
                                type="button"
                                class="secondary-button"
                                id="cancel-content-editor"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                class="primary-button"
                                id="content-save-button"
                            >
                                ${
                                    content
                                        ? "Save Changes"
                                        : "Add Content"
                                }
                            </button>

                        </div>

                    </form>

                </div>
            `;


            document.body.appendChild(
                contentModal
            );


            requestAnimationFrame(
                () =>
                    contentModal.classList.add(
                        "open"
                    )
            );


            $("#close-content-editor")
                ?.addEventListener(
                    "click",
                    () =>
                        closeModalElement(
                            contentModal
                        )
                );


            $("#cancel-content-editor")
                ?.addEventListener(
                    "click",
                    () =>
                        closeModalElement(
                            contentModal
                        )
                );


            contentModal
                .querySelector(
                    ".course-modal-backdrop"
                )
                ?.addEventListener(
                    "click",
                    () =>
                        closeModalElement(
                            contentModal
                        )
                );


            $("#content-editor-form")
                ?.addEventListener(
                    "submit",
                    event =>
                        saveContent(
                            event,
                            type,
                            content
                        )
                );

        }


        /* =====================================================
           SAVE CONTENT
        ===================================================== */

        async function saveContent(
            event,
            type,
            existingContent
        ) {

            event.preventDefault();


            const errorElement =
                $("#content-form-error");


            const saveButton =
                $("#content-save-button");


            try {

                saveButton.disabled =
                    true;


                const title =
                    $("#content-title-input")
                        ?.value
                        .trim() ||
                    "";


                const body =
                    $("#content-body-input")
                        ?.value ||
                    "";


                let mediaUrl =
                    existingContent?.media_url ||
                    null;


                let metadata =
                    {
                        ...(existingContent?.metadata ||
                            {})
                    };


                if (
                    type === "exercise"
                ) {

                    metadata.answer =
                        $("#exercise-answer-input")
                            ?.value
                            .trim() ||
                        "";

                    metadata.hint =
                        $("#exercise-hint-input")
                            ?.value
                            .trim() ||
                        "";

                }


                if (
                    type === "quiz"
                ) {

                    metadata.options =
                        (
                            $("#quiz-options-input")
                                ?.value ||
                            ""
                        )
                            .split("\n")
                            .map(
                                value =>
                                    value.trim()
                            )
                            .filter(Boolean);


                    metadata.answer =
                        $("#quiz-answer-input")
                            ?.value
                            .trim() ||
                        "";

                }


                if (
                    type === "ai"
                ) {

                    metadata.mode =
                        $("#ai-mode-input")
                            ?.value ||
                        "conversation";


                    metadata.objective =
                        $("#ai-objective-input")
                            ?.value
                            .trim() ||
                        "";

                }


                const file =
                    $("#content-file-input")
                        ?.files?.[0];


                if (
                    (
                        type === "image" ||
                        type === "audio" ||
                        type === "video" ||
                        type === "pdf"
                    ) &&
                    !file &&
                    !mediaUrl
                ) {

                    throw new Error(
                        "Please select a file."
                    );

                }


                if (file) {

                    mediaUrl =
                        await uploadFile(
                            file,
                            "course-content",
                            builderCourse.id
                        );

                }


                if (
                    type === "text" &&
                    !body.trim()
                ) {

                    throw new Error(
                        "Please enter the text content."
                    );

                }


                if (
                    type === "exercise" &&
                    !body.trim()
                ) {

                    throw new Error(
                        "Please enter the exercise instructions."
                    );

                }


                if (
                    type === "quiz" &&
                    !body.trim()
                ) {

                    throw new Error(
                        "Please enter the quiz question."
                    );

                }


                if (
                    type === "ai" &&
                    !body.trim()
                ) {

                    throw new Error(
                        "Please enter the AI instructions."
                    );

                }


                const payload = {

                    title:
                        title ||
                        typeLabel(type),

                    type,

                    body,

                    media_url:
                        mediaUrl,

                    metadata,

                    updated_at:
                        new Date()
                            .toISOString()

                };


                let result;


                if (existingContent) {

                    result =
                        await client
                            .from("content")
                            .update(
                                payload
                            )
                            .eq(
                                "id",
                                existingContent.id
                            )
                            .select()
                            .single();

                } else {

                    const nextOrder =
                        selectedLesson
                            .content
                            ?.length ||
                        0;


                    result =
                        await client
                            .from("content")
                            .insert({

                                ...payload,

                                lesson_id:
                                    selectedLesson.id,

                                sort_order:
                                    nextOrder

                            })
                            .select()
                            .single();

                }


                if (result.error) {

                    throw result.error;

                }


                closeModalElement(
                    contentModal
                );


                await loadBuilderStructure();


                const refreshedModule =
                    builderModules.find(
                        module =>
                            String(
                                module.id
                            ) ===
                            String(
                                selectedModule?.id
                            )
                    );


                selectedModule =
                    refreshedModule ||
                    builderModules[0] ||
                    null;


                if (selectedModule) {

                    selectedLesson =
                        selectedModule.lessons.find(
                            lesson =>
                                String(
                                    lesson.id
                                ) ===
                                String(
                                    selectedLesson?.id
                                )
                        ) ||
                        selectedModule.lessons[0] ||
                        null;

                }


                renderBuilderTree();


                if (selectedLesson) {

                    renderLessonEditor();

                }

            } catch (error) {

                console.error(
                    "Content save:",
                    error
                );


                if (errorElement) {

                    errorElement.textContent =
                        error.message ||
                        "Could not save content.";

                    errorElement.hidden =
                        false;

                }

            } finally {

                if (saveButton) {

                    saveButton.disabled =
                        false;

                }

            }

        }


        function typeLabel(type) {

            const labels = {

                text: "Text",

                image: "Image",

                audio: "Audio",

                video: "Video",

                pdf: "PDF",

                exercise: "Exercise",

                quiz: "Quiz",

                ai: "AI Interaction"

            };


            return (
                labels[type] ||
                "Content"
            );

        }


        /* =====================================================
           CONTENT LIST
        ===================================================== */

        function renderContentList() {

            const list =
                $("#content-list");

            if (!list) return;


            const content =
                selectedLesson?.content ||
                [];


            if (!content.length) {

                list.innerHTML =
                    `<div class="content-empty">
                        This lesson has no content yet.
                        Click <strong>+ Add Content</strong>
                        to start building it.
                    </div>`;

                return;

            }


            list.innerHTML =
                content
                    .map(
                        item =>
                            renderContentCard(
                                item
                            )
                    )
                    .join("");


            $$("[data-edit-content]")
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                const item =
                                    content.find(
                                        contentItem =>
                                            String(
                                                contentItem.id
                                            ) ===
                                            String(
                                                button.dataset
                                                    .editContent
                                            )
                                    );


                                if (item) {

                                    openContentEditor(
                                        item.type,
                                        item
                                    );

                                }

                            }
                        );

                    }
                );


            $$("[data-delete-content]")
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            async () => {

                                const item =
                                    content.find(
                                        contentItem =>
                                            String(
                                                contentItem.id
                                            ) ===
                                            String(
                                                button.dataset
                                                    .deleteContent
                                            )
                                    );


                                if (item) {

                                    await deleteContent(
                                        item
                                    );

                                }

                            }
                        );

                    }
                );

        }


        function renderContentCard(
            item
        ) {

            const icon = {

                text: "T",

                image: "▧",

                audio: "♫",

                video: "▶",

                pdf: "▤",

                exercise: "✓",

                quiz: "?",

                ai: "✦"

            }[item.type] || "•";


            let preview = "";


            if (
                item.type ===
                "image" &&
                item.media_url
            ) {

                preview =
                    `
                    <img
                        class="content-media-preview"
                        src="${escapeAttribute(
                            item.media_url
                        )}"
                        alt=""
                    >
                    `;

            } else if (
                item.type ===
                "audio" &&
                item.media_url
            ) {

                preview =
                    `
                    <audio
                        controls
                        style="width:100%;"
                    >
                        <source
                            src="${escapeAttribute(
                                item.media_url
                            )}"
                        >
                    </audio>
                    `;

            } else if (
                item.type ===
                "video" &&
                item.media_url
            ) {

                preview =
                    `
                    <video
                        class="content-media-preview"
                        controls
                        style="width:100%;"
                    >
                        <source
                            src="${escapeAttribute(
                                item.media_url
                            )}"
                        >
                    </video>
                    `;

            } else if (
                item.type ===
                "pdf" &&
                item.media_url
            ) {

                preview =
                    `
                    <div class="content-file">
                        ▤
                        <span>
                            PDF resource attached
                        </span>
                    </div>
                    `;

            } else {

                preview =
                    `
                    <div class="content-preview">
                        ${escapeHTML(
                            item.body ||
                            "No preview available."
                        )}
                    </div>
                    `;

            }


            return `
                <article class="content-card">

                    <div class="content-card-header">

                        <div class="content-type-icon">
                            ${icon}
                        </div>

                        <strong>
                            ${escapeHTML(
                                item.title ||
                                typeLabel(
                                    item.type
                                )
                            )}
                        </strong>

                        <div class="content-card-actions">

                            <button
                                type="button"
                                class="content-mini-button"
                                data-edit-content="${escapeAttribute(
                                    item.id
                                )}"
                            >
                                ✎
                            </button>

                            <button
                                type="button"
                                class="content-mini-button danger"
                                data-delete-content="${escapeAttribute(
                                    item.id
                                )}"
                            >
                                ×
                            </button>

                        </div>

                    </div>


                    <div class="content-card-body">

                        <div
                            style="
                                margin-bottom:8px;
                                color:#7c3aed;
                                font-size:8px;
                                font-weight:800;
                                text-transform:uppercase;
                                letter-spacing:.1em;
                            "
                        >
                            ${escapeHTML(
                                typeLabel(
                                    item.type
                                )
                            )}
                        </div>

                        ${preview}

                    </div>

                </article>
            `;

        }


        async function deleteContent(
            item
        ) {

            const confirmed =
                confirm(
                    `Delete "${item.title || typeLabel(item.type)}"?`
                );


            if (!confirmed) return;


            try {

                const {
                    error
                } =
                    await client
                        .from("content")
                        .delete()
                        .eq(
                            "id",
                            item.id
                        );


                if (error) throw error;


                await loadBuilderStructure();


                const module =
                    builderModules.find(
                        itemModule =>
                            String(
                                itemModule.id
                            ) ===
                            String(
                                selectedModule?.id
                            )
                    );


                selectedModule =
                    module ||
                    builderModules[0] ||
                    null;


                if (selectedModule) {

                    selectedLesson =
                        selectedModule.lessons.find(
                            lesson =>
                                String(
                                    lesson.id
                                ) ===
                                String(
                                    selectedLesson?.id
                                )
                        ) ||
                        selectedModule.lessons[0] ||
                        null;

                }


                renderBuilderTree();


                if (selectedLesson) {

                    renderLessonEditor();

                }

            } catch (error) {

                showError(
                    error.message ||
                    "Could not delete content."
                );

            }

        }


        /* =====================================================
           RESET BUILDER
        ===================================================== */

        function resetBuilder() {

            builderCourse =
                null;

            builderModules =
                [];

            selectedModule =
                null;

            selectedLesson =
                null;


            $("#course-builder")
                ?.classList.add(
                    "disabled"
                );


            $("#add-module-button")
                ?.setAttribute(
                    "disabled",
                    "disabled"
                );


            $("#builder-course-title")
                &&
                (
                    $("#builder-course-title")
                        .textContent =
                        "Select a course"
                );


            $("#builder-course-summary")
                &&
                (
                    $("#builder-course-summary")
                        .innerHTML =
                        "<span>Select a course to begin.</span>"
                );


            $("#builder-tree")
                &&
                (
                    $("#builder-tree")
                        .innerHTML =
                        `
                        <div class="builder-empty">
                            Select a course to view its structure.
                        </div>
                        `
                );


            showBuilderWelcome();

        }


        /* =====================================================
           OPEN BUILDER FROM COURSE LIST
        ===================================================== */

        function openCourseBuilderFromCourse(
            courseId
        ) {

            showSection(
                "personalise"
            );

            setTimeout(
                async () => {

                    await loadBuilderCourses();

                    await openCourseBuilder(
                        courseId
                    );

                },
                50
            );

        }


        /* =====================================================
           CAROUSEL
        ===================================================== */

        function setupCarouselControls() {

            $("#create-carousel-button")
                ?.addEventListener(
                    "click",
                    () =>
                        openCarouselModal()
                );


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

            if (!list) return;


            try {

                const {
                    data,
                    error
                } =
                    await client
                        .from(
                            "carousel_items"
                        )
                        .select("*")
                        .order(
                            "sort_order",
                            {
                                ascending:
                                    true
                            }
                        )
                        .order(
                            "created_at",
                            {
                                ascending:
                                    false
                            }
                        );


                if (error) throw error;


                allCarouselItems =
                    data || [];


                renderCarouselItems();

            } catch (error) {

                console.error(
                    "Carousel:",
                    error
                );


                list.innerHTML =
                    `
                    <div class="courses-empty">
                        Unable to load promotions.
                    </div>
                    `;

            }

        }


        function renderCarouselItems() {

            const list =
                $("#carousel-list");

            if (!list) return;


            const search =
                (
                    $("#carousel-search")
                        ?.value ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const filter =
                $("#carousel-filter")
                    ?.value ||
                "all";


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


            if (search) {

                items =
                    items.filter(
                        item =>
                            (
                                item.title ||
                                ""
                            )
                                .toLowerCase()
                                .includes(search) ||

                            (
                                item.description ||
                                ""
                            )
                                .toLowerCase()
                                .includes(search)
                    );

            }


            if (!items.length) {

                list.innerHTML =
                    `
                    <div class="courses-empty">
                        No promotions found.
                    </div>
                    `;

                return;

            }


            list.innerHTML =
                items
                    .map(
                        item =>
                            `
                            <article class="course-row">

                                <div class="course-cover">

                                    ${
                                        item.image_url
                                            ? `
                                                <img
                                                    src="${escapeAttribute(
                                                        item.image_url
                                                    )}"
                                                    alt=""
                                                >
                                            `
                                            :
                                            `
                                                <div class="course-cover-placeholder">
                                                    E
                                                </div>
                                            `
                                    }

                                </div>


                                <div>

                                    <div class="course-row-title">
                                        ${escapeHTML(
                                            item.title
                                        )}
                                    </div>

                                    <div class="course-row-description">
                                        ${escapeHTML(
                                            item.description ||
                                            ""
                                        )}
                                    </div>

                                    <div class="course-row-meta">

                                        <span class="course-badge">
                                            ${escapeHTML(
                                                item.area ||
                                                "all"
                                            )}
                                        </span>

                                        <span
                                            class="
                                                course-badge
                                                ${
                                                    item.status ===
                                                    "published"
                                                        ? "published"
                                                        : "draft"
                                                }
                                            "
                                        >
                                            ${escapeHTML(
                                                item.status ||
                                                "draft"
                                            )}
                                        </span>

                                    </div>

                                </div>


                                <div class="course-actions">

                                    <button
                                        type="button"
                                        class="course-action-button"
                                        data-carousel-edit="${escapeAttribute(
                                            item.id
                                        )}"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        class="course-action-button danger"
                                        data-carousel-delete="${escapeAttribute(
                                            item.id
                                        )}"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </article>
                            `
                    )
                    .join("");


            $$("[data-carousel-edit]")
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                const item =
                                    allCarouselItems.find(
                                        carouselItem =>
                                            String(
                                                carouselItem.id
                                            ) ===
                                            String(
                                                button.dataset
                                                    .carouselEdit
                                            )
                                    );


                                if (item) {

                                    openCarouselModal(
                                        item
                                    );

                                }

                            }
                        );

                    }
                );


            $$("[data-carousel-delete]")
                .forEach(
                    button => {

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
                                                    .carouselDelete
                                            )
                                    );


                                if (!item) return;


                                if (
                                    !confirm(
                                        `Delete "${item.title}"?`
                                    )
                                ) {

                                    return;

                                }


                                const {
                                    error
                                } =
                                    await client
                                        .from(
                                            "carousel_items"
                                        )
                                        .delete()
                                        .eq(
                                            "id",
                                            item.id
                                        );


                                if (error) {

                                    showError(
                                        error.message
                                    );

                                    return;

                                }


                                await loadCarouselItems();

                            }
                        );

                    }
                );

        }


        function openCarouselModal(
            item = null
        ) {

            editingCarouselItemId =
                item?.id ||
                null;


            if (carouselModal) {

                carouselModal.remove();

            }


            carouselModal =
                document.createElement(
                    "div"
                );


            carouselModal.className =
                "course-modal";


            carouselModal.innerHTML = `

                <div class="course-modal-backdrop"></div>


                <div class="course-modal-dialog">

                    <div class="course-modal-header">

                        <div>

                            <div class="course-modal-kicker">
                                HOMEPAGE
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

                            <label>
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

                            <label>
                                Description
                            </label>

                            <textarea
                                id="carousel-description"
                            >${escapeHTML(
                                item?.description ||
                                ""
                            )}</textarea>

                        </div>


                        <div class="course-form-field">

                            <label>
                                Image URL
                            </label>

                            <input
                                id="carousel-image"
                                type="url"
                                value="${escapeAttribute(
                                    item?.image_url ||
                                    ""
                                )}"
                            >

                        </div>


                        <div class="course-form-grid">

                            <div class="course-form-field">

                                <label>
                                    Area
                                </label>

                                <select id="carousel-area">

                                    <option value="all">
                                        All Areas
                                    </option>

                                    <option value="language">
                                        Language
                                    </option>

                                    <option value="business">
                                        Business
                                    </option>

                                    <option value="technology">
                                        Technology
                                    </option>

                                    <option value="finance">
                                        Finance
                                    </option>

                                    <option value="personal-development">
                                        Personal Development
                                    </option>

                                </select>

                            </div>


                            <div class="course-form-field">

                                <label>
                                    Status
                                </label>

                                <select id="carousel-status">

                                    <option value="draft">
                                        Draft
                                    </option>

                                    <option value="published">
                                        Published
                                    </option>

                                </select>

                            </div>

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
                    carouselModal.classList.add(
                        "open"
                    )
            );


            if (item?.area) {

                $("#carousel-area")
                    .value =
                    item.area;

            }


            if (item?.status) {

                $("#carousel-status")
                    .value =
                    item.status;

            }


            $("#close-carousel-modal")
                ?.addEventListener(
                    "click",
                    () =>
                        closeModalElement(
                            carouselModal
                        )
                );


            $("#cancel-carousel-modal")
                ?.addEventListener(
                    "click",
                    () =>
                        closeModalElement(
                            carouselModal
                        )
                );


            carouselModal
                .querySelector(
                    ".course-modal-backdrop"
                )
                ?.addEventListener(
                    "click",
                    () =>
                        closeModalElement(
                            carouselModal
                        )
                );


            $("#carousel-form")
                ?.addEventListener(
                    "submit",
                    saveCarouselItem
                );

        }


        async function saveCarouselItem(
            event
        ) {

            event.preventDefault();


            const title =
                $("#carousel-title")
                    ?.value
                    .trim();


            if (!title) {

                $("#carousel-form-error")
                    .textContent =
                    "Promotion title is required.";

                $("#carousel-form-error")
                    .hidden =
                    false;

                return;

            }


            try {

                const payload = {

                    title,

                    description:
                        $("#carousel-description")
                            ?.value
                            .trim() ||
                        "",

                    image_url:
                        $("#carousel-image")
                            ?.value
                            .trim() ||
                        null,

                    area:
                        $("#carousel-area")
                            ?.value ||
                        "all",

                    status:
                        $("#carousel-status")
                            ?.value ||
                        "draft"

                };


                let result;


                if (
                    editingCarouselItemId
                ) {

                    result =
                        await client
                            .from(
                                "carousel_items"
                            )
                            .update(
                                payload
                            )
                            .eq(
                                "id",
                                editingCarouselItemId
                            );

                } else {

                    result =
                        await client
                            .from(
                                "carousel_items"
                            )
                            .insert(
                                payload
                            );

                }


                if (result.error) {

                    throw result.error;

                }


                closeModalElement(
                    carouselModal
                );


                await loadCarouselItems();

            } catch (error) {

                $("#carousel-form-error")
                    .textContent =
                    error.message ||
                    "Could not save promotion.";

                $("#carousel-form-error")
                    .hidden =
                    false;

            }

        }

    }
);
