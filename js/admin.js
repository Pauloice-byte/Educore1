/* =========================================================
   EDUCORE ADMIN
   PHASE 5 — COURSE MANAGEMENT + COURSE BUILDER + CAROUSEL
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";


    /* =====================================================
       SUPABASE
    ===================================================== */

    const client =
        window.supabaseClient ||
        window.supabase ||
        null;

    if (!client || typeof client.from !== "function") {
        console.error("Supabase client is not available.");
        return;
    }


    /* =====================================================
       STATE
    ===================================================== */

    let allCourses = [];

    let editingCourseId = null;
    let courseModal = null;

    let allCarouselItems = [];
    let editingCarouselItemId = null;
    let carouselModal = null;
    let removeCarouselImage = false;


    /* COURSE BUILDER */

    let builderCourseId = null;

    let builderUnits = [];
    let builderLessons = [];
    let builderContent = [];

    let builderSelectedUnitId = null;
    let builderSelectedLessonId = null;

    let builderModal = null;


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    const $ =
        selector =>
            document.querySelector(selector);

    const $$ =
        selector =>
            document.querySelectorAll(selector);


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


        const pageTitle =
            $("#page-title");


        if (pageTitle) {

            const titles = {

                overview:
                    "Overview",

                courses:
                    "Courses",

                builder:
                    "Course Builder",

                carousel:
                    "Carousel",

                students:
                    "Students",

                progress:
                    "Progress",

                media:
                    "Media",

                settings:
                    "Settings"

            };

            pageTitle.textContent =
                titles[section] ||
                section;

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

                loadBuilderCourse(
                    builderCourseId
                );

            }

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


        if (toggle) {

            toggle.addEventListener(
                "click",
                () => {

                    if (
                        window.innerWidth <= 768
                    ) {

                        app?.classList.toggle(
                            "sidebar-open"
                        );

                    } else {

                        app?.classList.toggle(
                            "sidebar-collapsed"
                        );

                    }

                }
            );

        }


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
                    window.innerWidth > 768
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

        const button =
            $("#logout-button");

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


            const nameElement =
                $("#admin-name");

            if (nameElement) {

                nameElement.textContent =
                    name;

            }


            const roleElement =
                $("#admin-role");

            if (roleElement) {

                roleElement.textContent =
                    "Admin";

            }


            const avatar =
                $("#admin-avatar");

            if (avatar) {

                avatar.textContent =
                    name
                        .charAt(0)
                        .toUpperCase();

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

                loadUnitCount(),

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


        const element =
            $("#total-courses");


        if (element) {

            element.textContent =
                count ?? 0;

        }

    }


    async function loadUnitCount() {

        const element =
            $("#total-units");

        if (!element) return;


        try {

            const {
                count,
                error
            } =
                await client
                    .from("units")
                    .select(
                        "id",
                        {
                            count: "exact",
                            head: true
                        }
                    );


            if (error) throw error;


            element.textContent =
                count ?? 0;

        } catch (error) {

            console.warn(
                "Could not load units:",
                error
            );

            element.textContent =
                "—";

        }

    }


    async function loadLessonCount() {

        const element =
            $("#total-lessons");

        if (!element) return;


        try {

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


            if (error) throw error;


            element.textContent =
                count ?? 0;

        } catch (error) {

            console.warn(
                "Could not load lessons:",
                error
            );

            element.textContent =
                "—";

        }

    }


    async function loadStudentCount() {

        const element =
            $("#total-students");

        if (!element) return;


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


            element.textContent =
                count ?? 0;

        } catch (error) {

            console.warn(
                "Could not load students:",
                error
            );

            element.textContent =
                "—";

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
                                count: "exact",
                                head: true
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
                                count: "exact",
                                head: true
                            }
                        )
                        .eq(
                            "status",
                            "draft"
                        )

                ]);


            if (
                publishedResult.error
            ) {

                throw publishedResult.error;

            }


            if (
                draftResult.error
            ) {

                throw draftResult.error;

            }


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
                "Could not load content counts:",
                error
            );


            if (published)
                published.textContent =
                    "—";


            if (draft)
                draft.textContent =
                    "—";

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
                            ascending: false
                        }
                    )
                    .limit(6);


            if (error) throw error;


            if (!data?.length) {

                list.innerHTML = `
                    <div class="activity-empty">
                        No recent course activity.
                    </div>
                `;

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

                                <div class="activity-content">

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

            console.warn(
                "Could not load activity:",
                error
            );


            list.innerHTML = `
                <div class="activity-error">
                    Could not load recent activity.
                </div>
            `;

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
                () => openCourseModal()
            );

    }


    /* =====================================================
       LOAD COURSES
    ===================================================== */

    async function loadCourses() {

        const list =
            $("#courses-list");

        if (!list) return;


        list.innerHTML = `
            <div class="courses-loading">
                Loading courses...
            </div>
        `;


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


            populateBuilderCourses();


        } catch (error) {

            console.error(
                "Could not load courses:",
                error
            );


            list.innerHTML = `
                <div class="courses-empty">

                    <h3>
                        Could not load courses
                    </h3>

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


    /* =====================================================
       COURSE BUILDER — COURSE SELECTOR
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
                    courseId ||
                    null;


                if (!courseId) {

                    builderSelectedUnitId =
                        null;

                    builderSelectedLessonId =
                        null;

                    renderBuilderEmpty();

                    return;

                }


                await loadBuilderCourse(
                    courseId
                );

            }
        );

    }


    function populateBuilderCourses() {

        const select =
            $("#builder-course-select");

        if (!select) return;


        const currentValue =
            builderCourseId ||
            select.value ||
            "";


        select.innerHTML = `
            <option value="">
                Select a course...
            </option>
        `;


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


        showSection(
            "builder"
        );


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
       LOAD COURSE STRUCTURE
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


        workspace.innerHTML = `
            <div class="builder-loading">
                Loading course structure...
            </div>
        `;


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

            /* =============================================
               MODULES
            ============================================== */

            const unitsResult =
                await client
                    .from("units")
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


            if (
                unitsResult.error
            ) {

                throw unitsResult.error;

            }


            builderUnits =
                unitsResult.data ||
                [];


            builderLessons =
                [];

            builderContent =
                [];


            /* =============================================
               LESSONS
            ============================================== */

            if (
                builderUnits.length
            ) {

                const unitIds =
                    builderUnits.map(
                        unit =>
                            unit.id
                    );


                const lessonsResult =
                    await client
                        .from("lessons")
                        .select("*")
                        .in(
                            "unit_id",
                            unitIds
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


                /* =========================================
                   CONTENT
                ========================================== */

                if (
                    builderLessons.length
                ) {

                    const lessonIds =
                        builderLessons.map(
                            lesson =>
                                lesson.id
                        );


                    const contentResult =
                        await client
                            .from("content")
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
                        contentResult.error
                    ) {

                        throw contentResult.error;

                    }


                    builderContent =
                        contentResult.data ||
                        [];

                }

            }


            builderSelectedUnitId =
                builderUnits[0]?.id ||
                null;


            builderSelectedLessonId =
                builderLessons.find(
                    lesson =>
                        String(
                            lesson.unit_id
                        ) ===
                        String(
                            builderSelectedUnitId
                        )
                )?.id ||
                null;


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
                Choose a course above and start building
                its modules, lessons and learning blocks.
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
       BUILDER UI
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
                            id="add-unit-button"
                            title="Add module"
                        >
                            +
                        </button>

                    </div>


                    <div
                        class="builder-tree-list"
                        id="builder-unit-list"
                    >

                        ${
                            builderUnits.length

                                ?

                            builderUnits
                                .map(
                                    renderBuilderUnit
                                )
                                .join("")

                                :

                            `
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


    function renderBuilderUnit(
        unit
    ) {

        const active =
            String(unit.id) ===
            String(builderSelectedUnitId);


        const lessons =
            builderLessons.filter(
                lesson =>
                    String(
                        lesson.unit_id
                    ) ===
                    String(unit.id)
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
                    data-builder-action="select-unit"
                    data-id="${escapeAttribute(
                        unit.id
                    )}"
                >

                    <span class="builder-tree-icon">
                        ▤
                    </span>

                    <span>
                        ${escapeHTML(
                            unit.title ||
                            "Untitled module"
                        )}
                    </span>

                </button>


                <button
                    type="button"
                    class="builder-tree-more"
                    data-builder-action="edit-unit"
                    data-id="${escapeAttribute(
                        unit.id
                    )}"
                >
                    •••
                </button>


                ${
                    active

                        ?

                    `
                        <div class="builder-lessons">

                            ${
                                lessons
                                    .map(
                                        renderBuilderLesson
                                    )
                                    .join("")
                            }


                            <button
                                type="button"
                                class="builder-add-lesson"
                                data-builder-action="add-lesson"
                                data-unit-id="${escapeAttribute(
                                    unit.id
                                )}"
                            >
                                + Add lesson
                            </button>

                        </div>
                    `

                        :

                    ""
                }

            </div>

        `;

    }


    function renderBuilderLesson(
        lesson
    ) {

        const active =
            String(lesson.id) ===
            String(builderSelectedLessonId);


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


    function renderBuilderEditor() {

        if (!builderSelectedUnitId) {

            return `

                <div class="builder-editor-empty">

                    <div class="builder-empty-icon">
                        ▤
                    </div>

                    <h3>
                        Build your first module
                    </h3>

                    <p>
                        Create a module, then add lessons
                        and learning content.
                    </p>

                    <button
                        type="button"
                        class="primary-button"
                        id="editor-add-unit"
                    >
                        + Add Module
                    </button>

                </div>

            `;

        }


        const unit =
            builderUnits.find(
                item =>
                    String(item.id) ===
                    String(builderSelectedUnitId)
            );


        const lessons =
            builderLessons.filter(
                lesson =>
                    String(
                        lesson.unit_id
                    ) ===
                    String(
                        builderSelectedUnitId
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
                                unit?.title ||
                                "Module"
                            )}
                        </h2>

                        <p>
                            ${escapeHTML(
                                unit?.description ||
                                "Add lessons to this module."
                            )}
                        </p>

                    </div>


                    <div class="builder-editor-actions">

                        <button
                            type="button"
                            class="secondary-button"
                            data-builder-action="edit-unit"
                            data-id="${escapeAttribute(
                                unit.id
                            )}"
                        >
                            Edit Module
                        </button>


                        <button
                            type="button"
                            class="primary-button"
                            data-builder-action="add-lesson"
                            data-unit-id="${escapeAttribute(
                                unit.id
                            )}"
                        >
                            + Add Lesson
                        </button>

                    </div>

                </div>


                <div class="builder-lesson-grid">

                    ${
                        lessons.length

                            ?

                        lessons
                            .map(
                                lesson => {

                                    const count =
                                        builderContent.filter(
                                            content =>
                                                String(
                                                    content.lesson_id
                                                ) ===
                                                String(
                                                    lesson.id
                                                )
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
                                                ${count}
                                                content block${
                                                    count === 1
                                                        ? ""
                                                        : "s"
                                                }
                                            </span>

                                        </button>

                                    `;

                                }
                            )
                            .join("")

                            :

                        `
                            <div class="builder-content-empty">

                                <h3>
                                    No lessons yet
                                </h3>

                                <p>
                                    Create the first lesson
                                    in this module.
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
                    String(builderSelectedLessonId)
            );


        const blocks =
            builderContent.filter(
                content =>
                    String(
                        content.lesson_id
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
                            "Build this lesson with text, audio, images, video and AI interaction."
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
                        class="primary-button"
                        data-builder-action="add-content"
                    >
                        + Add Content
                    </button>

                </div>

            </div>


            <div class="builder-learning-loop">

                <span>
                    Understand
                </span>

                <i>→</i>

                <span>
                    See
                </span>

                <i>→</i>

                <span>
                    Hear
                </span>

                <i>→</i>

                <span>
                    Practice
                </span>

                <i>→</i>

                <span>
                    Speak
                </span>

                <i>→</i>

                <span>
                    Test
                </span>

            </div>


            <div class="builder-content-list">

                ${
                    blocks.length

                        ?

                    blocks
                        .map(
                            renderContentBlock
                        )
                        .join("")

                        :

                    `
                        <div class="builder-content-empty">

                            <div class="builder-empty-icon">
                                +
                            </div>

                            <h3>
                                This lesson is empty
                            </h3>

                            <p>
                                Add a content block to start
                                designing the learning experience.
                            </p>

                            <button
                                type="button"
                                class="primary-button"
                                data-builder-action="add-content"
                            >
                                Add Content
                            </button>

                        </div>
                    `
                }

            </div>

        `;

    }


    /* =====================================================
       CONTENT BLOCK
    ===================================================== */

    function renderContentBlock(
        block
    ) {

        const type =
            block.type ||
            "text";


        const labels = {

            text:
                "Text",

            image:
                "Image",

            audio:
                "Audio",

            video:
                "Video",

            ai:
                "AI Interaction"

        };


        const icons = {

            text:
                "T",

            image:
                "▧",

            audio:
                "♫",

            video:
                "▶",

            ai:
                "✦"

        };


        let preview =
            block.body ||
            block.media_url ||
            "";


        if (
            type === "image" &&
            block.media_url
        ) {

            preview = `

                <img
                    src="${escapeAttribute(
                        block.media_url
                    )}"
                    alt=""
                >

            `;

        }


        if (
            type === "audio" &&
            block.media_url
        ) {

            preview = `

                <audio
                    controls
                    src="${escapeAttribute(
                        block.media_url
                    )}"
                ></audio>

            `;

        }


        if (
            type === "video" &&
            block.media_url
        ) {

            preview = `

                <video
                    controls
                    preload="metadata"
                    src="${escapeAttribute(
                        block.media_url
                    )}"
                ></video>

            `;

        }


        return `

            <article
                class="content-block"
                data-content-id="${escapeAttribute(
                    block.id
                )}"
            >

                <div class="content-block-icon">

                    ${
                        icons[type] ||
                        "•"
                    }

                </div>


                <div class="content-block-main">

                    <div class="content-block-type">

                        ${
                            labels[type] ||
                            type
                        }

                    </div>


                    <h3>

                        ${escapeHTML(
                            block.title ||
                            labels[type] ||
                            "Content"
                        )}

                    </h3>


                    <div class="content-block-preview">

                        ${
                            type === "image" ||
                            type === "audio" ||
                            type === "video"

                                ?

                            preview

                                :

                            escapeHTML(
                                String(
                                    preview
                                ).slice(
                                    0,
                                    260
                                )
                            )
                        }

                    </div>

                </div>


                <div class="content-block-actions">

                    <button
                        type="button"
                        class="course-action-button"
                        data-builder-action="edit-content"
                        data-id="${escapeAttribute(
                            block.id
                        )}"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="course-action-button danger"
                        data-builder-action="delete-content"
                        data-id="${escapeAttribute(
                            block.id
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

        $("#add-unit-button")
            ?.addEventListener(
                "click",
                () =>
                    openBuilderModal(
                        "unit"
                    )
            );


        $("#editor-add-unit")
            ?.addEventListener(
                "click",
                () =>
                    openBuilderModal(
                        "unit"
                    )
            );


        $$("[data-builder-action]")
            .forEach(button => {

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
                            "select-unit"
                        ) {

                            builderSelectedUnitId =
                                id;


                            builderSelectedLessonId =
                                builderLessons.find(
                                    lesson =>
                                        String(
                                            lesson.unit_id
                                        ) ===
                                        String(id)
                                )?.id ||
                                null;


                            renderBuilder();

                        }


                        else if (
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

                                builderSelectedUnitId =
                                    lesson.unit_id;

                            }


                            renderBuilder();

                        }


                        else if (
                            action ===
                            "add-lesson"
                        ) {

                            openBuilderModal(
                                "lesson",
                                null,
                                button.dataset
                                    .unitId ||
                                builderSelectedUnitId
                            );

                        }


                        else if (
                            action ===
                            "edit-unit"
                        ) {

                            const unit =
                                builderUnits.find(
                                    item =>
                                        String(
                                            item.id
                                        ) ===
                                        String(id)
                                );


                            if (unit) {

                                openBuilderModal(
                                    "unit",
                                    unit
                                );

                            }

                        }


                        else if (
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

                        }


                        else if (
                            action ===
                            "add-content"
                        ) {

                            openBuilderModal(
                                "content"
                            );

                        }


                        else if (
                            action ===
                            "edit-content"
                        ) {

                            const block =
                                builderContent.find(
                                    item =>
                                        String(
                                            item.id
                                        ) ===
                                        String(id)
                                );


                            if (block) {

                                openBuilderModal(
                                    "content",
                                    block
                                );

                            }

                        }


                        else if (
                            action ===
                            "delete-content"
                        ) {

                            await deleteBuilderContent(
                                id
                            );

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
        forcedUnitId = null
    ) {

        closeBuilderModal();


        builderModal =
            document.createElement(
                "div"
            );


        builderModal.className =
            "course-modal";


        const isEdit =
            Boolean(record);


        let modalTitle;


        if (kind === "unit") {

            modalTitle =
                isEdit
                    ? "Edit Module"
                    : "Add Module";

        }

        else if (kind === "lesson") {

            modalTitle =
                isEdit
                    ? "Edit Lesson"
                    : "Add Lesson";

        }

        else {

            modalTitle =
                isEdit
                    ? "Edit Content"
                    : "Add Content";

        }


        let fields =
            "";


        /* MODULE */

        if (kind === "unit") {

            fields = `

                <div class="course-form-field">

                    <label for="builder-title">
                        Module title *
                    </label>

                    <input
                        id="builder-title"
                        type="text"
                        maxlength="200"
                        value="${escapeAttribute(
                            record?.title ||
                            ""
                        )}"
                        required
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

            `;

        }


        /* LESSON */

        else if (kind === "lesson") {

            fields = `

                <div class="course-form-field">

                    <label for="builder-title">
                        Lesson title *
                    </label>

                    <input
                        id="builder-title"
                        type="text"
                        maxlength="200"
                        value="${escapeAttribute(
                            record?.title ||
                            ""
                        )}"
                        required
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

                    <label for="builder-sort">
                        Display order
                    </label>

                    <input
                        id="builder-sort"
                        type="number"
                        min="0"
                        step="1"
                        value="${record?.sort_order ?? 0}"
                    >

                </div>

            `;

        }


        /* CONTENT */

        else {

            fields = `

                <div class="course-form-grid">

                    <div class="course-form-field">

                        <label for="builder-content-type">
                            Content type
                        </label>

                        <select
                            id="builder-content-type"
                        >

                            <option value="text">
                                Text
                            </option>

                            <option value="image">
                                Image
                            </option>

                            <option value="audio">
                                Audio
                            </option>

                            <option value="video">
                                Video
                            </option>

                            <option value="ai">
                                AI Interaction
                            </option>

                        </select>

                    </div>


                    <div class="course-form-field">

                        <label for="builder-content-sort">
                            Display order
                        </label>

                        <input
                            id="builder-content-sort"
                            type="number"
                            min="0"
                            step="1"
                            value="${record?.sort_order ?? 0}"
                        >

                    </div>

                </div>


                <div class="course-form-field">

                    <label for="builder-content-title">
                        Title
                    </label>

                    <input
                        id="builder-content-title"
                        type="text"
                        maxlength="200"
                        value="${escapeAttribute(
                            record?.title ||
                            ""
                        )}"
                    >

                </div>


                <div class="course-form-field">

                    <label for="builder-content-body">
                        Text / Instructions / AI Prompt
                    </label>

                    <textarea
                        id="builder-content-body"
                        rows="7"
                        placeholder="Write the learning content or AI instruction..."
                    >${escapeHTML(
                        record?.body ||
                        ""
                    )}</textarea>

                </div>


                <div class="course-form-field">

                    <label for="builder-content-url">
                        Media URL
                    </label>

                    <input
                        id="builder-content-url"
                        type="url"
                        value="${escapeAttribute(
                            record?.media_url ||
                            ""
                        )}"
                        placeholder="https://..."
                    >

                </div>


                <div class="course-form-field">

                    <label for="builder-content-file">
                        Upload media
                    </label>

                    <input
                        id="builder-content-file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,audio/*,video/*"
                    >

                    <small class="builder-help">

                        Upload an image, audio or video file.
                        Text and AI interactions use the text field.

                    </small>

                </div>

            `;

        }


        builderModal.innerHTML = `

            <div
                class="course-modal-backdrop"
                data-builder-close="true"
            ></div>


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
                            ${modalTitle}
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
                        >
                            ${
                                isEdit
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


        requestAnimationFrame(
            () =>
                builderModal
                    ?.classList.add(
                        "open"
                    )
        );


        document.body.classList.add(
            "modal-open"
        );


        if (
            kind === "content" &&
            record
        ) {

            $("#builder-content-type")
                .value =
                    record.type ||
                    "text";

        }


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
                        record,
                        forcedUnitId
                    )
            );

    }


    /* =====================================================
       SAVE BUILDER RECORD
    ===================================================== */

    async function saveBuilderRecord(
        event,
        kind,
        record,
        forcedUnitId
    ) {

        event.preventDefault();


        const errorElement =
            $("#builder-form-error");


        if (errorElement) {

            errorElement.hidden =
                true;

            errorElement.textContent =
                "";

        }


        try {

            if (!builderCourseId) {

                throw new Error(
                    "Select a course first."
                );

            }


            /* =============================================
               MODULE
            ============================================== */

            if (
                kind === "unit"
            ) {

                const title =
                    $("#builder-title")
                        .value
                        .trim();


                if (!title) {

                    throw new Error(
                        "Module title is required."
                    );

                }


                const payload = {

                    title,

                    description:
                        $("#builder-description")
                            .value
                            .trim() ||
                        null,

                    course_id:
                        builderCourseId,

                    sort_order:
                        record?.sort_order ??
                        builderUnits.length

                };


                const result =
                    record

                        ?

                    await client
                        .from("units")
                        .update(
                            payload
                        )
                        .eq(
                            "id",
                            record.id
                        )

                        :

                    await client
                        .from("units")
                        .insert(
                            payload
                        );


                if (result.error)
                    throw result.error;

            }


            /* =============================================
               LESSON
            ============================================== */

            if (
                kind === "lesson"
            ) {

                const title =
                    $("#builder-title")
                        .value
                        .trim();


                if (!title) {

                    throw new Error(
                        "Lesson title is required."
                    );

                }


                const unitId =
                    record?.unit_id ||
                    forcedUnitId ||
                    builderSelectedUnitId;


                if (!unitId) {

                    throw new Error(
                        "Select a module first."
                    );

                }


                const payload = {

                    title,

                    description:
                        $("#builder-description")
                            .value
                            .trim() ||
                        null,

                    unit_id:
                        unitId,

                    sort_order:
                        Number(
                            $("#builder-sort")
                                .value ||
                            0
                        )

                };


                const result =
                    record

                        ?

                    await client
                        .from("lessons")
                        .update(
                            payload
                        )
                        .eq(
                            "id",
                            record.id
                        )

                        :

                    await client
                        .from("lessons")
                        .insert(
                            payload
                        );


                if (result.error)
                    throw result.error;


                builderSelectedUnitId =
                    unitId;

            }


            /* =============================================
               CONTENT
            ============================================== */

            if (
                kind === "content"
            ) {

                if (
                    !builderSelectedLessonId
                ) {

                    throw new Error(
                        "Select a lesson first."
                    );

                }


                const type =
                    $("#builder-content-type")
                        .value;


                const title =
                    $("#builder-content-title")
                        .value
                        .trim();


                const body =
                    $("#builder-content-body")
                        .value
                        .trim();


                const url =
                    $("#builder-content-url")
                        .value
                        .trim();


                const file =
                    $("#builder-content-file")
                        ?.files?.[0] ||
                    null;


                let mediaUrl =
                    url ||
                    null;


                if (
                    file &&
                    file.size
                ) {

                    mediaUrl =
                        await uploadBuilderMedia(
                            file
                        );

                }


                const payload = {

                    lesson_id:
                        builderSelectedLessonId,

                    type,

                    title:
                        title ||
                        null,

                    body:
                        body ||
                        null,

                    media_url:
                        mediaUrl,

                    sort_order:
                        Number(
                            $("#builder-content-sort")
                                .value ||
                            0
                        )

                };


                const result =
                    record

                        ?

                    await client
                        .from("content")
                        .update(
                            payload
                        )
                        .eq(
                            "id",
                            record.id
                        )

                        :

                    await client
                        .from("content")
                        .insert(
                            payload
                        );


                if (result.error)
                    throw result.error;

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

        }

    }


    /* =====================================================
       DELETE CONTENT
    ===================================================== */

    async function deleteBuilderContent(
        id
    ) {

        const block =
            builderContent.find(
                item =>
                    String(item.id) ===
                    String(id)
            );


        if (
            !block ||
            !confirm(
                `Delete "${
                    block.title ||
                    block.type ||
                    "content"
                }"?`
            )
        ) {

            return;

        }


        try {

            const {
                error
            } =
                await client
                    .from("content")
                    .delete()
                    .eq(
                        "id",
                        id
                    );


            if (error)
                throw error;


            await loadBuilderCourse(
                builderCourseId
            );


            await loadDashboard();


        } catch (error) {

            alert(
                error.message ||
                "Could not delete the content."
            );

        }

    }


    /* =====================================================
       UPLOAD COURSE MEDIA
    ===================================================== */

    async function uploadBuilderMedia(
        file
    ) {

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const path =
            `course-content/${crypto.randomUUID()}.${extension}`;


        const {
            error
        } =
            await client.storage
                .from(
                    "course-content"
                )
                .upload(
                    path,
                    file,
                    {
                        cacheControl:
                            "3600",

                        upsert:
                            false,

                        contentType:
                            file.type
                    }
                );


        if (error) {

            throw new Error(
                `Media upload failed: ${error.message}`
            );

        }


        const {
            data
        } =
            client.storage
                .from(
                    "course-content"
                )
                .getPublicUrl(
                    path
                );


        if (
            !data?.publicUrl
        ) {

            throw new Error(
                "Media uploaded but public URL could not be generated."
            );

        }


        return data.publicUrl;

    }


    function closeBuilderModal() {

        if (!builderModal)
            return;


        builderModal.remove();

        builderModal =
            null;


        document.body.classList.remove(
            "modal-open"
        );

    }


    /* =====================================================
       COURSES RENDERING
    ===================================================== */

    function renderCourses() {

        const list =
            $("#courses-list");

        const count =
            $("#course-count");


        if (!list)
            return;


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


        if (
            filter !==
            "all"
        ) {

            courses =
                courses.filter(
                    course =>
                        normalizeStatus(
                            course.status
                        ) ===
                        filter
                );

        }


        if (search) {

            courses =
                courses.filter(
                    course => {

                        const text =
                            [
                                course.title,
                                course.description,
                                course.category,
                                course.level
                            ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();


                        return text.includes(
                            search
                        );

                    }
                );

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

            list.innerHTML = `

                <div class="courses-empty">

                    <div class="courses-empty-icon">
                        ▣
                    </div>

                    <h3>
                        No courses found
                    </h3>

                    <p>
                        ${
                            search ||
                            filter !== "all"

                                ?

                            "Try changing your search or filter."

                                :

                            "Create your first course to get started."
                        }
                    </p>

                </div>

            `;

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


    function renderCourseRow(
        course
    ) {

        const status =
            normalizeStatus(
                course.status
            );


        const cover =
            course.cover_image

                ?

            `
                <img
                    src="${escapeAttribute(
                        course.cover_image
                    )}"
                    alt="${escapeAttribute(
                        course.title ||
                        "Course cover"
                    )}"
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='flex';
                    "
                >

                <div
                    class="course-cover-placeholder"
                    style="display:none;"
                >
                    ▣
                </div>
            `

                :

            `
                <div class="course-cover-placeholder">
                    ▣
                </div>
            `;


        return `

            <div
                class="course-row"
                data-course-id="${escapeAttribute(
                    course.id
                )}"
            >

                <div class="course-main">

                    <div class="course-cover">
                        ${cover}
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
                        "General"
                    )}
                </div>


                <div class="course-level">
                    ${escapeHTML(
                        course.level ||
                        "All levels"
                    )}
                </div>


                <div>

                    <span
                        class="course-status ${status}"
                    >
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
                        data-action="edit"
                        data-id="${escapeAttribute(
                            course.id
                        )}"
                    >
                        Edit
                    </button>


                    ${
                        status === "draft"

                            ?

                        `
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

                            :

                        ""
                    }


                    ${
                        status === "published"

                            ?

                        `
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

                            :

                        ""
                    }


                    <button
                        type="button"
                        class="course-action-button"
                        data-action="builder"
                        data-id="${escapeAttribute(
                            course.id
                        )}"
                    >
                        Build
                    </button>


                    <button
                        type="button"
                        class="course-action-button"
                        data-action="duplicate"
                        data-id="${escapeAttribute(
                            course.id
                        )}"
                    >
                        Duplicate
                    </button>


                    ${
                        status !== "archived"

                            ?

                        `
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

                            :

                        `
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

            </div>

        `;

    }


    function attachCourseActions() {

        $$("#courses-list .course-action-button")
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
                                    String(
                                        item.id
                                    ) ===
                                    String(
                                        id
                                    )
                            );


                        if (
                            !action ||
                            !course
                        ) {

                            return;

                        }


                        switch (action) {

                            case "edit":

                                openCourseModal(
                                    course
                                );

                                break;


                            case "publish":

                                await publishCourse(
                                    course
                                );

                                break;


                            case "unpublish":

                                await unpublishCourse(
                                    course
                                );

                                break;


                            case "archive":

                                await archiveCourse(
                                    course
                                );

                                break;


                            case "restore":

                                await restoreCourse(
                                    course
                                );

                                break;


                            case "duplicate":

                                await duplicateCourse(
                                    course
                                );

                                break;


                            case "builder":

                                openBuilderForCourse(
                                    course.id
                                );

                                break;

                        }

                    }
                );

            });

    }


    /* =====================================================
       COURSE MODAL
    ===================================================== */

    function getCourseModal() {

        if (courseModal)
            return courseModal;


        courseModal =
            document.createElement(
                "div"
            );


        courseModal.id =
            "course-modal";


        courseModal.className =
            "course-modal";


        courseModal.innerHTML = `

            <div
                class="course-modal-backdrop"
                data-close-modal="true"
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

                        <h2 id="course-modal-title">
                            Create Course
                        </h2>

                    </div>


                    <button
                        type="button"
                        class="course-modal-close"
                        id="course-modal-close"
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

                        <label for="course-title-input">
                            Course title *
                        </label>

                        <input
                            id="course-title-input"
                            name="title"
                            type="text"
                            required
                            maxlength="200"
                        >

                    </div>


                    <div class="course-form-field">

                        <label for="course-description-input">
                            Description
                        </label>

                        <textarea
                            id="course-description-input"
                            name="description"
                            rows="4"
                        ></textarea>

                    </div>


                    <div class="course-form-grid">

                        <div class="course-form-field">

                            <label for="course-category-input">
                                Category
                            </label>

                            <select
                                id="course-category-input"
                                name="category"
                            >

                                <option value="">
                                    Select a category
                                </option>

                                <option value="Language">
                                    Language
                                </option>

                                <option value="MS Office">
                                    MS Office
                                </option>

                                <option value="Trading">
                                    Trading
                                </option>

                                <option value="Business">
                                    Business
                                </option>

                                <option value="Technology">
                                    Technology
                                </option>

                                <option value="Finance">
                                    Finance
                                </option>

                                <option value="Personal Development">
                                    Personal Development
                                </option>

                            </select>

                        </div>


                        <div class="course-form-field">

                            <label for="course-level-input">
                                Level
                            </label>

                            <input
                                id="course-level-input"
                                name="level"
                                type="text"
                            >

                        </div>

                    </div>


                    <div class="course-form-field">

                        <label>
                            Course cover
                        </label>


                        <div class="course-cover-tabs">

                            <button
                                type="button"
                                class="cover-tab active"
                                data-cover-tab="upload"
                            >
                                Upload from computer
                            </button>


                            <button
                                type="button"
                                class="cover-tab"
                                data-cover-tab="url"
                            >
                                Use image URL
                            </button>

                        </div>


                        <div
                            class="cover-tab-panel active"
                            data-cover-panel="upload"
                        >

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
                                    JPG, JPEG, PNG or WebP · Max 5 MB
                                </span>

                            </label>


                            <input
                                id="course-cover-file"
                                name="cover_file"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                hidden
                            >

                        </div>


                        <div
                            class="cover-tab-panel"
                            data-cover-panel="url"
                        >

                            <input
                                id="course-cover-url"
                                name="cover_url"
                                type="url"
                                placeholder="https://..."
                            >

                        </div>


                        <div
                            id="course-cover-preview"
                            class="course-cover-preview"
                            hidden
                        >

                            <img
                                id="course-cover-preview-image"
                                alt="Course cover preview"
                            >

                            <button
                                type="button"
                                id="course-remove-cover"
                                class="course-remove-cover"
                            >
                                Remove image
                            </button>

                        </div>

                    </div>


                    <div class="course-form-field">

                        <label for="course-sort-input">
                            Display order
                        </label>

                        <input
                            id="course-sort-input"
                            name="sort_order"
                            type="number"
                            min="0"
                            step="1"
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
                            id="course-cancel-button"
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            class="primary-button"
                            id="course-save-button"
                        >
                            Save Course
                        </button>

                    </div>

                </form>

            </div>

        `;


        document.body.appendChild(
            courseModal
        );


        courseModal
            .querySelector(
                "#course-form"
            )
            .addEventListener(
                "submit",
                saveCourse
            );


        courseModal
            .querySelector(
                "#course-modal-close"
            )
            .addEventListener(
                "click",
                closeCourseModal
            );


        courseModal
            .querySelector(
                "#course-cancel-button"
            )
            .addEventListener(
                "click",
                closeCourseModal
            );


        courseModal.addEventListener(
            "click",
            event => {

                if (
                    event.target.dataset
                        .closeModal ===
                    "true"
                ) {

                    closeCourseModal();

                }

            }
        );


        courseModal
            .querySelectorAll(
                ".cover-tab"
            )
            .forEach(tab => {

                tab.addEventListener(
                    "click",
                    () => {

                        switchCoverTab(
                            tab.dataset.coverTab
                        );

                    }
                );

            });


        courseModal
            .querySelector(
                "#course-cover-file"
            )
            .addEventListener(
                "change",
                handleCoverFile
            );


        courseModal
            .querySelector(
                "#course-cover-url"
            )
            .addEventListener(
                "input",
                handleCoverUrl
            );


        courseModal
            .querySelector(
                "#course-remove-cover"
            )
            .addEventListener(
                "click",
                removeCover
            );


        return courseModal;

    }


    function openCourseModal(
        course = null
    ) {

        editingCourseId =
            course?.id ||
            null;


        const modal =
            getCourseModal();


        const form =
            modal.querySelector(
                "#course-form"
            );


        form.reset();


        clearFormError();


        clearCoverPreview();


        modal
            .querySelector(
                "#course-modal-title"
            )
            .textContent =
                course
                    ? "Edit Course"
                    : "Create Course";


        form.elements.title.value =
            course?.title ||
            "";


        form.elements.description.value =
            course?.description ||
            "";


        form.elements.category.value =
            course?.category ||
            "";


        form.elements.level.value =
            course?.level ||
            "";


        form.elements.sort_order.value =
            course?.sort_order ??
            "";


        if (
            course?.cover_image
        ) {

            switchCoverTab(
                "url"
            );


            form.elements.cover_url.value =
                course.cover_image;


            showCoverPreview(
                course.cover_image
            );

        } else {

            switchCoverTab(
                "upload"
            );

        }


        modal.classList.add(
            "open"
        );


        document.body.classList.add(
            "modal-open"
        );


        setTimeout(
            () =>
                form.elements.title.focus(),
            50
        );

    }


    function closeCourseModal() {

        if (!courseModal)
            return;


        courseModal.classList.remove(
            "open"
        );


        document.body.classList.remove(
            "modal-open"
        );


        editingCourseId =
            null;


        clearFormError();

    }


    function switchCoverTab(
        tabName
    ) {

        if (!courseModal)
            return;


        courseModal
            .querySelectorAll(
                ".cover-tab"
            )
            .forEach(tab => {

                tab.classList.toggle(
                    "active",
                    tab.dataset.coverTab ===
                    tabName
                );

            });


        courseModal
            .querySelectorAll(
                ".cover-tab-panel"
            )
            .forEach(panel => {

                panel.classList.toggle(
                    "active",
                    panel.dataset.coverPanel ===
                    tabName
                );

            });

    }


    function handleCoverFile(
        event
    ) {

        const file =
            event.target.files?.[0];


        if (!file)
            return;


        if (
            ![
                "image/jpeg",
                "image/png",
                "image/webp"
            ].includes(
                file.type
            )
        ) {

            showFormError(
                "Please select a JPG, PNG or WebP image."
            );


            event.target.value =
                "";


            return;

        }


        if (
            file.size >
            5 * 1024 * 1024
        ) {

            showFormError(
                "The cover image must be smaller than 5 MB."
            );


            event.target.value =
                "";


            return;

        }


        clearFormError();


        const reader =
            new FileReader();


        reader.onload =
            () =>
                showCoverPreview(
                    reader.result
                );


        reader.readAsDataURL(
            file
        );

    }


    function handleCoverUrl(
        event
    ) {

        const url =
            event.target.value.trim();


        if (!url) {

            clearCoverPreview();

            return;

        }


        showCoverPreview(
            url
        );

    }


    function showCoverPreview(
        src
    ) {

        if (!courseModal)
            return;


        const preview =
            courseModal.querySelector(
                "#course-cover-preview"
            );


        const image =
            courseModal.querySelector(
                "#course-cover-preview-image"
            );


        if (!src) {

            clearCoverPreview();

            return;

        }


        image.src =
            src;


        preview.hidden =
            false;

    }


    function clearCoverPreview() {

        if (!courseModal)
            return;


        const preview =
            courseModal.querySelector(
                "#course-cover-preview"
            );


        const image =
            courseModal.querySelector(
                "#course-cover-preview-image"
            );


        preview.hidden =
            true;


        image.removeAttribute(
            "src"
        );

    }


    function removeCover() {

        if (!courseModal)
            return;


        courseModal
            .querySelector(
                "#course-cover-file"
            )
            .value =
                "";


        courseModal
            .querySelector(
                "#course-cover-url"
            )
            .value =
                "";


        clearCoverPreview();

    }


    async function saveCourse(
        event
    ) {

        event.preventDefault();


        const form =
            event.currentTarget;


        const saveButton =
            $("#course-save-button");


        clearFormError();


        const formData =
            new FormData(
                form
            );


        const title =
            String(
                formData.get(
                    "title"
                ) ||
                ""
            ).trim();


        const description =
            String(
                formData.get(
                    "description"
                ) ||
                ""
            ).trim();


        const category =
            String(
                formData.get(
                    "category"
                ) ||
                ""
            ).trim();


        const level =
            String(
                formData.get(
                    "level"
                ) ||
                ""
            ).trim();


        const coverUrl =
            String(
                formData.get(
                    "cover_url"
                ) ||
                ""
            ).trim();


        const coverFile =
            formData.get(
                "cover_file"
            );


        const sortOrderRaw =
            String(
                formData.get(
                    "sort_order"
                ) ||
                ""
            ).trim();


        const sortOrder =
            sortOrderRaw === ""
                ? 0
                : Number(
                    sortOrderRaw
                );


        if (!title) {

            showFormError(
                "Course title is required."
            );

            return;

        }


        if (
            Number.isNaN(
                sortOrder
            ) ||
            sortOrder < 0
        ) {

            showFormError(
                "Display order must be a valid number."
            );

            return;

        }


        if (saveButton) {

            saveButton.disabled =
                true;

            saveButton.textContent =
                editingCourseId
                    ? "Saving..."
                    : "Creating...";

        }


        try {

            let finalCoverUrl =
                coverUrl ||
                null;


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
                    description ||
                    null,

                category:
                    category ||
                    null,

                level:
                    level ||
                    null,

                cover_image:
                    finalCoverUrl,

                sort_order:
                    sortOrder

            };


            if (
                editingCourseId
            ) {

                const {
                    error
                } =
                    await client
                        .from("courses")
                        .update(
                            courseData
                        )
                        .eq(
                            "id",
                            editingCourseId
                        );


                if (error)
                    throw error;

            } else {

                courseData.status =
                    "draft";


                courseData.slug =
                    await createUniqueSlug(
                        title
                    );


                const {
                    error
                } =
                    await client
                        .from("courses")
                        .insert(
                            courseData
                        );


                if (error)
                    throw error;

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
                    "Save Course";

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
                .from(
                    "course-covers"
                )
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl:
                            "3600",

                        upsert:
                            false,

                        contentType:
                            file.type
                    }
                );


        if (uploadError) {

            throw new Error(
                `Cover upload failed: ${uploadError.message}`
            );

        }


        const {
            data
        } =
            client.storage
                .from(
                    "course-covers"
                )
                .getPublicUrl(
                    filePath
                );


        if (
            !data?.publicUrl
        ) {

            throw new Error(
                "The cover was uploaded but its public URL could not be generated."
            );

        }


        return data.publicUrl;

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
        )
            return;


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
        )
            return;


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
        )
            return;


        try {

            const {
                error
            } =
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


            if (error)
                throw error;


            await refreshCoursesAndDashboard();


        } catch (error) {

            console.error(
                error
            );


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
        )
            return;


        try {

            const {
                error
            } =
                await client
                    .from("courses")
                    .update({

                        status:
                            "draft",

                        archived_at:
                            null

                    })
                    .eq(
                        "id",
                        course.id
                    );


            if (error)
                throw error;


            await refreshCoursesAndDashboard();


        } catch (error) {

            console.error(
                error
            );


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

            const {
                error
            } =
                await client
                    .from("courses")
                    .update({

                        status,

                        archived_at:
                            status ===
                            "archived"

                                ?

                            new Date()
                                .toISOString()

                                :

                            null

                    })
                    .eq(
                        "id",
                        course.id
                    );


            if (error)
                throw error;


            await refreshCoursesAndDashboard();


        } catch (error) {

            console.error(
                error
            );


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
        )
            return;


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

                archived_at:
                    null

            };


            const {
                error
            } =
                await client
                    .from("courses")
                    .insert(
                        duplicate
                    );


            if (error)
                throw error;


            await refreshCoursesAndDashboard();


        } catch (error) {

            console.error(
                error
            );


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
            slugify(
                title
            ) ||
            "course";


        let slug =
            base;


        let counter =
            1;


        while (true) {

            const {
                data,
                error
            } =
                await client
                    .from("courses")
                    .select("id")
                    .eq(
                        "slug",
                        slug
                    )
                    .limit(1);


            if (error)
                throw error;


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


    function slugify(
        value
    ) {

        return String(value)

            .normalize(
                "NFD"
            )

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
                ""
            );

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


        if (!element)
            return;


        element.textContent =
            message;


        element.hidden =
            false;

    }


    function clearFormError() {

        const element =
            $("#course-form-error");


        if (!element)
            return;


        element.textContent =
            "";


        element.hidden =
            true;

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

            list.innerHTML = `
                <div class="courses-loading">
                    Loading promotions...
                </div>
            `;

        }


        try {

            const {
                data,
                error
            } =
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


            if (error)
                throw error;


            allCarouselItems =
                data ||
                [];


            renderCarouselItems();


        } catch (error) {

            console.error(
                "Error loading carousel items:",
                error
            );


            if (list) {

                list.innerHTML = `
                    <div class="courses-loading">
                        Unable to load promotions.
                    </div>
                `;

            }

        }

    }


    function renderCarouselItems() {

        const list =
            $("#carousel-list");


        const count =
            $("#carousel-count");


        if (!list)
            return;


        const searchTerm =
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


        if (
            filter !==
            "all"
        ) {

            items =
                items.filter(
                    item =>
                        item.status ===
                        filter
                );

        }


        if (searchTerm) {

            items =
                items.filter(
                    item => {

                        const text =
                            `${item.title || ""}
                             ${item.description || ""}
                             ${item.area || ""}`
                                .toLowerCase();


                        return text.includes(
                            searchTerm
                        );

                    }
                );

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

            list.innerHTML = `
                <div class="courses-loading">
                    No promotions found.
                </div>
            `;

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

                ?

            `
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

                :

            `
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
                        ${escapeHTML(
                            status
                        )}
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

        $$(
            ".course-action-button[data-carousel-action]"
        )
            .forEach(button => {

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


                        if (!item)
                            return;


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
        )
            return;


        try {

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


            if (error)
                throw error;


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
            item?.id ||
            null;


        removeCarouselImage =
            false;


        carouselModal?.remove();


        carouselModal =
            document.createElement(
                "div"
            );


        carouselModal.className =
            "course-modal";


        carouselModal.innerHTML = `

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

                                ${
                                    [
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
                                        .join("")
                                }

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


        if (!file)
            return;


        if (
            ![
                "image/jpeg",
                "image/png",
                "image/webp"
            ].includes(
                file.type
            )
        ) {

            showCarouselFormError(
                "Please select a JPG, PNG or WebP image."
            );


            event.target.value =
                "";


            return;

        }


        if (
            file.size >
            5 * 1024 * 1024
        ) {

            showCarouselFormError(
                "The promotion image must be smaller than 5 MB."
            );


            event.target.value =
                "";


            return;

        }


        removeCarouselImage =
            false;


        clearCarouselFormError();


        const reader =
            new FileReader();


        reader.onload = () => {

            const image =
                $("#carousel-image-preview-image");

            const preview =
                $("#carousel-image-preview");


            if (image)
                image.src =
                    reader.result;


            if (preview)
                preview.hidden =
                    false;

        };


        reader.readAsDataURL(
            file
        );

    }


    function removeCarouselImageFile() {

        const file =
            $("#carousel-image-file");


        if (file)
            file.value =
                "";


        removeCarouselImage =
            true;


        const preview =
            $("#carousel-image-preview");


        const image =
            $("#carousel-image-preview-image");


        if (preview)
            preview.hidden =
                true;


        if (image)
            image.removeAttribute(
                "src"
            );

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


        const {
            error
        } =
            await client.storage
                .from(
                    "carousel-images"
                )
                .upload(
                    path,
                    file,
                    {
                        cacheControl:
                            "3600",

                        upsert:
                            false,

                        contentType:
                            file.type
                    }
                );


        if (error) {

            throw new Error(
                `Promotion image upload failed: ${error.message}`
            );

        }


        const {
            data
        } =
            client.storage
                .from(
                    "carousel-images"
                )
                .getPublicUrl(
                    path
                );


        if (
            !data?.publicUrl
        ) {

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


        button.disabled =
            true;


        button.textContent =
            editingCarouselItemId
                ? "Saving..."
                : "Creating...";


        try {

            let finalImageUrl =
                null;


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


            if (
                removeCarouselImage
            ) {

                finalImageUrl =
                    null;

            }


            const file =
                $("#carousel-image-file")
                    .files?.[0];


            if (
                file?.size
            ) {

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

                    ?

                await client
                    .from(
                        "carousel_items"
                    )
                    .update(
                        data
                    )
                    .eq(
                        "id",
                        editingCarouselItemId
                    )

                    :

                await client
                    .from(
                        "carousel_items"
                    )
                    .insert(
                        data
                    );


            if (result.error)
                throw result.error;


            closeCarouselModal();


            await loadCarouselItems();


        } catch (error) {

            showCarouselFormError(
                error.message ||
                "Could not save the promotion."
            );


        } finally {

            button.disabled =
                false;


            button.textContent =
                editingCarouselItemId
                    ? "Save Changes"
                    : "Create Promotion";

        }

    }


    function closeCarouselModal() {

        carouselModal?.remove();

        carouselModal =
            null;

        editingCarouselItemId =
            null;

        removeCarouselImage =
            false;

        document.body.classList.remove(
            "modal-open"
        );

    }


    function showCarouselFormError(
        message
    ) {

        const element =
            $("#carousel-form-error");


        if (!element)
            return;


        element.textContent =
            message;


        element.hidden =
            false;

    }


    function clearCarouselFormError() {

        const element =
            $("#carousel-form-error");


        if (!element)
            return;


        element.textContent =
            "";


        element.hidden =
            true;

    }


    function normalizeCarouselStatus(
        status
    ) {

        return status ===
            "published"

            ?

        "published"

            :

        "draft";

    }


    function formatCarouselArea(
        area
    ) {

        const areas = {

            all:
                "All Areas",

            language:
                "Language",

            "ms-office":
                "MS Office",

            trading:
                "Trading",

            business:
                "Business",

            technology:
                "Technology",

            finance:
                "Finance",

            "personal-development":
                "Personal Development"

        };


        return areas[area] ||
            "All Areas";

    }


    /* =====================================================
       ESCAPE / FORMATTING
    ===================================================== */

    function normalizeStatus(
        status
    ) {

        if (
            status ===
            "published" ||
            status ===
            "archived"
        ) {

            return status;

        }


        return "draft";

    }


    function formatDate(
        value
    ) {

        if (!value)
            return "—";


        const date =
            new Date(
                value
            );


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
                year:
                    "numeric",

                month:
                    "short",

                day:
                    "numeric"
            }
        );

    }


    function formatDateTimeLocal(
        value
    ) {

        if (!value)
            return "";


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";

        }


        const pad =
            number =>
                String(
                    number
                )
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
            value ??
            ""
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

        return escapeHTML(
            value
        );

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
            )
                return;


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
