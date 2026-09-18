/* =========================================================
   EDUCORE ADMIN
   PHASE 4 — COURSE MANAGEMENT + CAROUSEL
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

        console.error(
            "Supabase client is not available."
        );

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


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    const $ = selector =>
        document.querySelector(selector);


    const $$ = selector =>
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

        setupDashboardRetry();

        await loadAdminUser();

        await loadDashboard();

        await loadCourses();

        await loadCarouselItems();
    }


    /* =====================================================
       CAROUSEL CONTROLS
    ===================================================== */

    function setupCarouselControls() {

        const createButton =
            $("create-carousel-button");

        const searchInput =
            $("carousel-search");

        const filterSelect =
            $("carousel-filter");


        if (createButton) {

            createButton.addEventListener(
                "click",
                () => openCarouselModal()
            );
        }


        if (searchInput) {

            searchInput.addEventListener(
                "input",
                renderCarouselItems
            );
        }


        if (filterSelect) {

            filterSelect.addEventListener(
                "change",
                renderCarouselItems
            );
        }
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

            pageTitle.textContent =
                section.charAt(0).toUpperCase() +
                section.slice(1);
        }


        if (section === "courses") {

            loadCourses();
        }


        if (section === "carousel") {

            loadCarouselItems();
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

                    if (window.innerWidth <= 768) {

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

                if (window.innerWidth > 768) {

                    app?.classList.remove(
                        "sidebar-open"
                    );
                }

            }
        );
    }


    function closeMobileSidebar() {

        $("#admin-app")
            ?.classList.remove("sidebar-open");
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


            if (error || !data?.user) return;


            const user =
                data.user;


            const metadata =
                user.user_metadata || {};


            const name =
                metadata.name ||
                metadata.full_name ||
                metadata.display_name ||
                user.email?.split("@")[0] ||
                "Administrator";


            $("#admin-name") &&
                ($("#admin-name").textContent = name);


            $("#admin-role") &&
                ($("#admin-role").textContent = "Admin");


            $("#admin-avatar") &&
                ($("#admin-avatar").textContent =
                    name.charAt(0).toUpperCase());

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
                    .select("id", {
                        count: "exact",
                        head: true
                    });


            if (error) throw error;


            element.textContent =
                count ?? 0;

        } catch (error) {

            console.warn(
                "Could not load units:",
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

            const {
                count,
                error
            } =
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

            const {
                count,
                error
            } =
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
            ] =
                await Promise.all([

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


            if (publishedResult.error)
                throw publishedResult.error;


            if (draftResult.error)
                throw draftResult.error;


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

            if (published)
                published.textContent = "—";

            if (draft)
                draft.textContent = "—";
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
                data.map(course => {

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

                }).join("");


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
            ?.classList.remove("admin-hidden");
    }


    function hideDashboardError() {

        $("#dashboard-error")
            ?.classList.add("admin-hidden");
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
       LOAD CAROUSEL ITEMS
    ===================================================== */

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

                list.innerHTML = `
                    <div class="courses-loading">
                        Unable to load promotions.
                    </div>
                `;
            }
        }
    }


    /* =====================================================
       RENDER CAROUSEL ITEMS
    ===================================================== */

    function renderCarouselItems() {

        const list =
            $("#carousel-list");

        const count =
            $("#carousel-count");


        if (!list) return;


        const searchInput =
            $("#carousel-search");

        const filterSelect =
            $("#carousel-filter");


        const searchTerm =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        const filter =
            filterSelect
                ? filterSelect.value
                : "all";


        let filteredItems =
            [...allCarouselItems];


        if (filter !== "all") {

            filteredItems =
                filteredItems.filter(
                    item =>
                        item.status === filter
                );
        }


        if (searchTerm) {

            filteredItems =
                filteredItems.filter(item => {

                    const title =
                        (item.title || "")
                            .toLowerCase();

                    const description =
                        (item.description || "")
                            .toLowerCase();

                    const area =
                        (item.area || "")
                            .toLowerCase();


                    return (
                        title.includes(searchTerm) ||
                        description.includes(searchTerm) ||
                        area.includes(searchTerm)
                    );
                });
        }


        if (count) {

            count.textContent =
                `${filteredItems.length} ${
                    filteredItems.length === 1
                        ? "promotion"
                        : "promotions"
                }`;
        }


        if (!filteredItems.length) {

            list.innerHTML = `
                <div class="courses-loading">
                    No promotions found.
                </div>
            `;

            return;
        }


        list.innerHTML =
            filteredItems
                .map(renderCarouselRow)
                .join("");


        attachCarouselActions();
    }


    /* =====================================================
       CAROUSEL ROW
    ===================================================== */

    function renderCarouselRow(item) {

        const startDate =
            item.start_date
                ? formatDate(item.start_date)
                : "—";


        const endDate =
            item.end_date
                ? formatDate(item.end_date)
                : "—";


        const status =
            normalizeCarouselStatus(
                item.status
            );


        const image =
            item.image_url
                ? `
                    <img
                        src="${escapeAttribute(item.image_url)}"
                        alt="${escapeAttribute(item.title)}"
                        onerror="this.style.display='none';"
                    >
                `
                : `
                    <div class="course-cover-placeholder">
                        ▤
                    </div>
                `;


        return `
            <div
                class="course-row carousel-row"
                data-carousel-id="${escapeAttribute(item.id)}"
            >

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
                    <span class="course-status ${status}">
                        ${escapeHTML(status)}
                    </span>
                </div>


                <div class="course-updated">
                    ${startDate}
                </div>


                <div class="course-updated">
                    ${endDate}
                </div>


                <div class="course-actions">

                    <button
                        type="button"
                        class="course-action-button"
                        data-carousel-action="edit"
                        data-carousel-id="${escapeAttribute(item.id)}"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="course-action-button danger"
                        data-carousel-action="delete"
                        data-carousel-id="${escapeAttribute(item.id)}"
                    >
                        Delete
                    </button>

                </div>

            </div>
        `;
    }


    /* =====================================================
       CAROUSEL ACTIONS
    ===================================================== */

    function attachCarouselActions() {

        $$(".course-action-button").forEach(button => {

            const action =
                button.dataset.carouselAction;


            if (!action) return;


            button.addEventListener(
                "click",
                async () => {

                    const id =
                        button.dataset.carouselId;


                    if (!id) return;


                    const item =
                        allCarouselItems.find(
                            carouselItem =>
                                String(carouselItem.id) ===
                                String(id)
                        );


                    if (!item) return;


                    if (action === "edit") {

                        openCarouselModal(item);

                        return;
                    }


                    if (action === "delete") {

                        await deleteCarouselItem(item);
                    }

                }
            );
        });
    }


    /* =====================================================
       DELETE CAROUSEL ITEM
    ===================================================== */

    async function deleteCarouselItem(item) {

        const confirmed =
            confirm(
                `Delete "${item.title}"?`
            );


        if (!confirmed) return;


        try {

            const {
                error
            } =
                await client
                    .from("carousel_items")
                    .delete()
                    .eq(
                        "id",
                        item.id
                    );


            if (error) throw error;


            await loadCarouselItems();

        } catch (error) {

            console.error(
                "Error deleting carousel item:",
                error
            );


            alert(
                error.message ||
                "Unable to delete this promotion."
            );
        }
    }


    /* =====================================================
       OPEN CAROUSEL MODAL
    ===================================================== */

    function openCarouselModal(item = null) {

        editingCarouselItemId =
            item?.id || null;


        if (carouselModal) {

            carouselModal.remove();

            carouselModal = null;
        }


        carouselModal =
            document.createElement("div");


        carouselModal.className =
            "admin-modal-overlay";


        carouselModal.innerHTML = `
            <div class="admin-modal">

                <div class="admin-modal-header">

                    <div>

                        <div class="section-kicker">
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
                        class="admin-modal-close"
                        id="close-carousel-modal"
                        aria-label="Close"
                    >
                        ×
                    </button>

                </div>


                <form id="carousel-form">

                    <div class="form-group">

                        <label for="carousel-title">
                            Title
                        </label>

                        <input
                            type="text"
                            id="carousel-title"
                            required
                            maxlength="200"
                            value="${escapeAttribute(
                                item?.title || ""
                            )}"
                            placeholder="Promotion title"
                        >

                    </div>


                    <div class="form-group">

                        <label for="carousel-description">
                            Description
                        </label>

                        <textarea
                            id="carousel-description"
                            rows="4"
                            maxlength="5000"
                            placeholder="Short promotional message"
                        >${escapeHTML(
                            item?.description || ""
                        )}</textarea>

                    </div>


                    <div class="form-group">

                        <label for="carousel-image">
                            Image URL
                        </label>

                        <input
                            type="url"
                            id="carousel-image"
                            value="${escapeAttribute(
                                item?.image_url || ""
                            )}"
                            placeholder="https://..."
                        >

                    </div>


                    <div class="form-row">

                        <div class="form-group">

                            <label for="carousel-area">
                                Area
                            </label>

                            <select id="carousel-area">

                                <option
                                    value="all"
                                    ${
                                        item?.area === "all"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    All Areas
                                </option>

                                <option
                                    value="language"
                                    ${
                                        item?.area === "language"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Language
                                </option>

                                <option
                                    value="ms-office"
                                    ${
                                        item?.area === "ms-office"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    MS Office
                                </option>

                                <option
                                    value="trading"
                                    ${
                                        item?.area === "trading"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Trading
                                </option>

                                <option
                                    value="business"
                                    ${
                                        item?.area === "business"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Business
                                </option>

                                <option
                                    value="technology"
                                    ${
                                        item?.area === "technology"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Technology
                                </option>

                                <option
                                    value="finance"
                                    ${
                                        item?.area === "finance"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Finance
                                </option>

                                <option
                                    value="personal-development"
                                    ${
                                        item?.area === "personal-development"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Personal Development
                                </option>

                            </select>

                        </div>


                        <div class="form-group">

                            <label for="carousel-status">
                                Status
                            </label>

                            <select id="carousel-status">

                                <option
                                    value="draft"
                                    ${
                                        item?.status !== "published"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Draft
                                </option>

                                <option
                                    value="published"
                                    ${
                                        item?.status === "published"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Published
                                </option>

                            </select>

                        </div>

                    </div>


                    <div class="form-row">

                        <div class="form-group">

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


                        <div class="form-group">

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


                    <div class="form-row">

                        <div class="form-group">

                            <label for="carousel-button-text">
                                Button Text
                            </label>

                            <input
                                type="text"
                                id="carousel-button-text"
                                maxlength="100"
                                value="${escapeAttribute(
                                    item?.button_text ||
                                    "Learn More"
                                )}"
                            >

                        </div>


                        <div class="form-group">

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


                    <div class="form-group">

                        <label for="carousel-button-url">
                            Button URL
                        </label>

                        <input
                            type="url"
                            id="carousel-button-url"
                            value="${escapeAttribute(
                                item?.button_url || ""
                            )}"
                            placeholder="https://..."
                        >

                    </div>


                    <div
                        id="carousel-form-error"
                        class="course-form-error"
                        hidden
                    ></div>


                    <div class="admin-modal-actions">

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
       carouselModal.classList.add("open");

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


        $("#carousel-form")
            ?.addEventListener(
                "submit",
                saveCarouselItem
            );


        setTimeout(() => {

            $("#carousel-title")?.focus();

        }, 50);
    }


    /* =====================================================
       CLOSE CAROUSEL MODAL
    ===================================================== */

    function closeCarouselModal() {

    if (!carouselModal) return;

    carouselModal.remove();

    carouselModal = null;

    editingCarouselItemId = null;

    document.body.classList.remove(
        "modal-open"
    );
}


    /* =====================================================
       SAVE CAROUSEL ITEM
    ===================================================== */

    async function saveCarouselItem(event) {

        event.preventDefault();


        const title =
            $("#carousel-title")
                ?.value
                .trim();


        const description =
            $("#carousel-description")
                ?.value
                .trim();


        const imageUrl =
            $("#carousel-image")
                ?.value
                .trim();


        const area =
            $("#carousel-area")
                ?.value ||
            "all";


        const status =
            $("#carousel-status")
                ?.value ||
            "draft";


        const startDate =
            $("#carousel-start-date")
                ?.value;


        const endDate =
            $("#carousel-end-date")
                ?.value;


        const buttonText =
            $("#carousel-button-text")
                ?.value
                .trim() ||
            "Learn More";


        const buttonUrl =
            $("#carousel-button-url")
                ?.value
                .trim();


        const sortOrderRaw =
            $("#carousel-sort-order")
                ?.value
                .trim();


        const sortOrder =
            sortOrderRaw === ""
                ? 0
                : Number(sortOrderRaw);


        const errorElement =
            $("#carousel-form-error");


        const saveButton =
            $("#carousel-save-button");


        if (errorElement) {

            errorElement.textContent = "";

            errorElement.hidden = true;
        }


        if (!title) {

            showCarouselFormError(
                "Promotion title is required."
            );

            return;
        }


        if (
            Number.isNaN(sortOrder) ||
            sortOrder < 0
        ) {

            showCarouselFormError(
                "Sort order must be a valid number."
            );

            return;
        }


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


        if (saveButton) {

            saveButton.disabled =
                true;

            saveButton.textContent =
                editingCarouselItemId
                    ? "Saving..."
                    : "Creating...";
        }


        try {

            const carouselData = {

                title,

                description:
                    description || null,

                image_url:
                    imageUrl || null,

                area,

                button_text:
                    buttonText,

                button_url:
                    buttonUrl || null,

                status,

                start_date:
                    startDate
                        ? new Date(startDate).toISOString()
                        : null,

                end_date:
                    endDate
                        ? new Date(endDate).toISOString()
                        : null,

                sort_order:
                    sortOrder
            };


            if (editingCarouselItemId) {

                const {
                    error
                } =
                    await client
                        .from("carousel_items")
                        .update(carouselData)
                        .eq(
                            "id",
                            editingCarouselItemId
                        );


                if (error) throw error;

            } else {

                const {
                    error
                } =
                    await client
                        .from("carousel_items")
                        .insert(
                            carouselData
                        );


                if (error) throw error;
            }


            closeCarouselModal();


            await loadCarouselItems();

        } catch (error) {

            console.error(
                "Could not save carousel item:",
                error
            );


            showCarouselFormError(
                error.message ||
                "Could not save the promotion."
            );

        } finally {

            if (saveButton) {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    editingCarouselItemId
                        ? "Save Changes"
                        : "Create Promotion";
            }
        }
    }


    function showCarouselFormError(message) {

        const element =
            $("#carousel-form-error");


        if (!element) return;


        element.textContent =
            message;


        element.hidden =
            false;
    }


    /* =====================================================
       CAROUSEL UTILITIES
    ===================================================== */

    function normalizeCarouselStatus(status) {

        return status === "published"
            ? "published"
            : "draft";
    }


    function formatCarouselArea(area) {

        const areas = {

            "all":
                "All Areas",

            "language":
                "Language",

            "ms-office":
                "MS Office",

            "trading":
                "Trading",

            "business":
                "Business",

            "technology":
                "Technology",

            "finance":
                "Finance",

            "personal-development":
                "Personal Development"
        };


        return areas[area] ||
            "All Areas";
    }


    function formatDateTimeLocal(dateValue) {

        if (!dateValue) return "";


        const date =
            new Date(dateValue);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";
        }


        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );


        const hours =
            String(
                date.getHours()
            ).padStart(
                2,
                "0"
            );


        const minutes =
            String(
                date.getMinutes()
            ).padStart(
                2,
                "0"
            );


        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }


    /* =====================================================
       RENDER COURSES
    ===================================================== */

    function renderCourses() {

        const list =
            $("#courses-list");

        const count =
            $("#course-count");


        if (!list) return;


        const search =
            ($("#course-search")?.value || "")
                .trim()
                .toLowerCase();


        const filter =
            $("#course-filter")?.value ||
            "all";


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


        if (search) {

            courses =
                courses.filter(course => {

                    const text = [

                        course.title,
                        course.description,
                        course.category,
                        course.level

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return text.includes(search);
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
                                ? "Try changing your search or filter."
                                : "Create your first course to get started."
                        }
                    </p>

                </div>
            `;

            return;
        }


        list.innerHTML =
            courses
                .map(renderCourseRow)
                .join("");


        attachCourseActions();
    }


    /* =====================================================
       COURSE ROW
    ===================================================== */

    function renderCourseRow(course) {

        const status =
            normalizeStatus(
                course.status
            );


        const cover =
            course.cover_image
                ? `
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
                : `
                    <div class="course-cover-placeholder">
                        ▣
                    </div>
                `;


        return `
            <div
                class="course-row"
                data-course-id="${escapeAttribute(course.id)}"
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
                        data-id="${escapeAttribute(course.id)}"
                    >
                        Edit
                    </button>


                    ${
                        status === "draft"
                            ? `
                                <button
                                    type="button"
                                    class="course-action-button"
                                    data-action="publish"
                                    data-id="${escapeAttribute(course.id)}"
                                >
                                    Publish
                                </button>
                            `
                            : ""
                    }


                    ${
                        status === "published"
                            ? `
                                <button
                                    type="button"
                                    class="course-action-button"
                                    data-action="unpublish"
                                    data-id="${escapeAttribute(course.id)}"
                                >
                                    Unpublish
                                </button>
                            `
                            : ""
                    }


                    <button
                        type="button"
                        class="course-action-button"
                        data-action="duplicate"
                        data-id="${escapeAttribute(course.id)}"
                    >
                        Duplicate
                    </button>


                    ${
                        status !== "archived"
                            ? `
                                <button
                                    type="button"
                                    class="course-action-button danger"
                                    data-action="archive"
                                    data-id="${escapeAttribute(course.id)}"
                                >
                                    Archive
                                </button>
                            `
                            : `
                                <button
                                    type="button"
                                    class="course-action-button"
                                    data-action="restore"
                                    data-id="${escapeAttribute(course.id)}"
                                >
                                    Restore
                                </button>
                            `
                    }

                </div>

            </div>
        `;
    }


    /* =====================================================
       COURSE ACTIONS
    ===================================================== */

    function attachCourseActions() {

        $$(".course-action-button")
            .forEach(button => {

                /*
                    Carousel buttons also use
                    .course-action-button.

                    If a carousel action exists,
                    this is not a course button.
                */

                if (button.dataset.carouselAction) {
                    return;
                }


                button.addEventListener(
                    "click",
                    async () => {

                        const action =
                            button.dataset.action;

                        const id =
                            button.dataset.id;


                        if (!action || !id)
                            return;


                        const course =
                            allCourses.find(
                                item =>
                                    String(item.id) ===
                                    String(id)
                            );


                        if (!course) return;


                        switch (action) {

                            case "edit":
                                openCourseModal(course);
                                break;

                            case "publish":
                                await publishCourse(course);
                                break;

                            case "unpublish":
                                await unpublishCourse(course);
                                break;

                            case "archive":
                                await archiveCourse(course);
                                break;

                            case "restore":
                                await restoreCourse(course);
                                break;

                            case "duplicate":
                                await duplicateCourse(course);
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

        if (courseModal) {

            return courseModal;
        }


        courseModal =
            document.createElement("div");


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
                aria-labelledby="course-modal-title"
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
                        aria-label="Close"
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
                            placeholder="Enter course title"
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
                            maxlength="5000"
                            placeholder="Describe this course..."
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
                                required
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
                                maxlength="100"
                                placeholder="e.g. Beginner, Intermediate"
                            >

                        </div>

                    </div>


                    <!-- COVER IMAGE -->
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
                                id="course-upload-area"
                            >

                                <div class="upload-icon">
                                    ↑
                                </div>

                                <strong>
                                    Choose an image
                                </strong>

                                <span>
                                    JPG, JPEG, PNG or WebP
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
                                placeholder="https://example.com/course-cover.jpg"
                            >

                            <small>
                                Enter a publicly accessible image URL.
                            </small>

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
                            placeholder="0"
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
            .querySelector("#course-form")
            .addEventListener(
                "submit",
                saveCourse
            );


        courseModal
            .querySelector("#course-modal-close")
            .addEventListener(
                "click",
                closeCourseModal
            );


        courseModal
            .querySelector("#course-cancel-button")
            .addEventListener(
                "click",
                closeCourseModal
            );


        courseModal.addEventListener(
            "click",
            event => {

                if (
                    event.target.dataset
                        .closeModal === "true"
                ) {

                    closeCourseModal();
                }
            }
        );


        courseModal
            .querySelectorAll(".cover-tab")
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
            .querySelector("#course-cover-file")
            .addEventListener(
                "change",
                handleCoverFile
            );


        courseModal
            .querySelector("#course-cover-url")
            .addEventListener(
                "input",
                handleCoverUrl
            );


        courseModal
            .querySelector("#course-remove-cover")
            .addEventListener(
                "click",
                removeCover
            );


        return courseModal;
    }


    /* =====================================================
       OPEN COURSE MODAL
    ===================================================== */

    function openCourseModal(course = null) {

        editingCourseId =
            course?.id || null;


        const modal =
            getCourseModal();


        const form =
            modal.querySelector("#course-form");


        const title =
            modal.querySelector(
                "#course-modal-title"
            );


        form.reset();

        clearFormError();

        clearCoverPreview();


        title.textContent =
            course
                ? "Edit Course"
                : "Create Course";


        form.elements.title.value =
            course?.title || "";


        form.elements.description.value =
            course?.description || "";


        form.elements.category.value =
            course?.category || "";


        form.elements.level.value =
            course?.level || "";


        form.elements.sort_order.value =
            course?.sort_order ?? "";


        if (course?.cover_image) {

            switchCoverTab("url");

            form.elements.cover_url.value =
                course.cover_image;

            showCoverPreview(
                course.cover_image
            );

        } else {

            switchCoverTab("upload");
        }


        modal.classList.add("open");

        document.body.classList.add(
            "modal-open"
        );


        setTimeout(() => {

            form.elements.title.focus();

        }, 50);
    }


    /* =====================================================
       CLOSE COURSE MODAL
    ===================================================== */

    function closeCourseModal() {

        if (!courseModal) return;


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


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                courseModal &&
                courseModal.classList.contains("open")
            ) {

                closeCourseModal();

                return;
            }


            if (
                event.key === "Escape" &&
                carouselModal
            ) {

                closeCarouselModal();
            }

        }
    );


    /* =====================================================
       COVER TABS
    ===================================================== */

    function switchCoverTab(tabName) {

        if (!courseModal) return;


        courseModal
            .querySelectorAll(".cover-tab")
            .forEach(tab => {

                tab.classList.toggle(
                    "active",
                    tab.dataset.coverTab ===
                    tabName
                );
            });


        courseModal
            .querySelectorAll(".cover-tab-panel")
            .forEach(panel => {

                panel.classList.toggle(
                    "active",
                    panel.dataset.coverPanel ===
                    tabName
                );
            });
    }


    /* =====================================================
       COVER FILE
    ===================================================== */

    function handleCoverFile(event) {

        const file =
            event.target.files?.[0];


        if (!file) return;


        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


        if (!allowedTypes.includes(file.type)) {

            showFormError(
                "Please select a JPG, PNG or WebP image."
            );

            event.target.value = "";

            return;
        }


        if (file.size > 5 * 1024 * 1024) {

            showFormError(
                "The cover image must be smaller than 5 MB."
            );

            event.target.value = "";

            return;
        }


        clearFormError();


        const reader =
            new FileReader();


        reader.onload = () => {

            showCoverPreview(
                reader.result
            );
        };


        reader.readAsDataURL(file);
    }


    /* =====================================================
       COVER URL
    ===================================================== */

    function handleCoverUrl(event) {

        const url =
            event.target.value.trim();


        if (!url) {

            clearCoverPreview();

            return;
        }


        showCoverPreview(url);
    }


    /* =====================================================
       COVER PREVIEW
    ===================================================== */

    function showCoverPreview(src) {

        if (!courseModal) return;


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

        if (!courseModal) return;


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


        image.removeAttribute("src");
    }


    function removeCover() {

        if (!courseModal) return;


        const fileInput =
            courseModal.querySelector(
                "#course-cover-file"
            );


        const urlInput =
            courseModal.querySelector(
                "#course-cover-url"
            );


        fileInput.value = "";

        urlInput.value = "";


        clearCoverPreview();
    }


    /* =====================================================
       SAVE COURSE
    ===================================================== */

    async function saveCourse(event) {

        event.preventDefault();


        const form =
            event.currentTarget;


        const saveButton =
            $("#course-save-button");


        clearFormError();


        const formData =
            new FormData(form);


        const title =
            String(
                formData.get("title") || ""
            ).trim();


        const description =
            String(
                formData.get("description") || ""
            ).trim();


        const category =
            String(
                formData.get("category") || ""
            ).trim();


        const level =
            String(
                formData.get("level") || ""
            ).trim();


        const coverUrl =
            String(
                formData.get("cover_url") || ""
            ).trim();


        const coverFile =
            formData.get("cover_file");


        const sortOrderRaw =
            String(
                formData.get("sort_order") || ""
            ).trim();


        const sortOrder =
            sortOrderRaw === ""
                ? 0
                : Number(sortOrderRaw);


        if (!title) {

            showFormError(
                "Course title is required."
            );

            return;
        }


        if (
            Number.isNaN(sortOrder) ||
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
                coverUrl || null;


            if (
                coverFile &&
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

                const {
                    error
                } =
                    await client
                        .from("courses")
                        .update(courseData)
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


                const {
                    error
                } =
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
                    "Save Course";
            }
        }
    }


    /* =====================================================
       UPLOAD COURSE COVER
    ===================================================== */

    async function uploadCourseCover(file) {

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
                        contentType: file.type
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


    /* =====================================================
       PUBLISH
    ===================================================== */

    async function publishCourse(course) {

        if (
            !confirm(
                `Publish "${course.title}"?`
            )
        ) return;


        await updateCourseStatus(
            course,
            "published"
        );
    }


    /* =====================================================
       UNPUBLISH
    ===================================================== */

    async function unpublishCourse(course) {

        if (
            !confirm(
                `Unpublish "${course.title}" and return it to Draft?`
            )
        ) return;


        await updateCourseStatus(
            course,
            "draft"
        );
    }


    /* =====================================================
       ARCHIVE
    ===================================================== */

    async function archiveCourse(course) {

        if (
            !confirm(
                `Archive "${course.title}"?\n\nThe course will not be permanently deleted.`
            )
        ) return;


        try {

            const {
                error
            } =
                await client
                    .from("courses")
                    .update({
                        status: "archived",
                        archived_at:
                            new Date().toISOString()
                    })
                    .eq(
                        "id",
                        course.id
                    );


            if (error) throw error;


            await refreshCoursesAndDashboard();


        } catch (error) {

            console.error(
                "Could not archive course:",
                error
            );


            alert(
                error.message ||
                "Could not archive the course."
            );
        }
    }


    /* =====================================================
       RESTORE
    ===================================================== */

    async function restoreCourse(course) {

        if (
            !confirm(
                `Restore "${course.title}" to Draft?`
            )
        ) return;


        try {

            const {
                error
            } =
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

            console.error(
                "Could not restore course:",
                error
            );


            alert(
                error.message ||
                "Could not restore the course."
            );
        }
    }


    /* =====================================================
       STATUS
    ===================================================== */

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
                            status === "archived"
                                ? new Date().toISOString()
                                : null
                    })
                    .eq(
                        "id",
                        course.id
                    );


            if (error) throw error;


            await refreshCoursesAndDashboard();


        } catch (error) {

            console.error(
                "Could not update course status:",
                error
            );


            alert(
                error.message ||
                "Could not update the course."
            );
        }
    }


    /* =====================================================
       DUPLICATE
    ===================================================== */

    async function duplicateCourse(course) {

        if (
            !confirm(
                `Duplicate "${course.title}"?\n\nThe duplicate will be created as a Draft.`
            )
        ) return;


        try {

            const duplicateTitle =
                `${course.title} Copy`;


            const duplicate = {

                title:
                    duplicateTitle,

                description:
                    course.description || null,

                category:
                    course.category || null,

                level:
                    course.level || null,

                cover_image:
                    course.cover_image || null,

                status:
                    "draft",

                sort_order:
                    course.sort_order ?? 0,

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


            if (error) throw error;


            await refreshCoursesAndDashboard();


        } catch (error) {

            console.error(
                "Could not duplicate course:",
                error
            );


            alert(
                error.message ||
                "Could not duplicate the course."
            );
        }
    }


    /* =====================================================
       SLUG
    ===================================================== */

    async function createUniqueSlug(title) {

        const base =
            slugify(title) ||
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
                ""
            );
    }


    /* =====================================================
       REFRESH
    ===================================================== */

    async function refreshCoursesAndDashboard() {

        await Promise.all([
            loadCourses(),
            loadDashboard()
        ]);
    }


    /* =====================================================
       FORM ERROR
    ===================================================== */

    function showFormError(message) {

        const element =
            $("#course-form-error");


        if (!element) return;


        element.textContent =
            message;


        element.hidden =
            false;
    }


    function clearFormError() {

        const element =
            $("#course-form-error");


        if (!element) return;


        element.textContent =
            "";


        element.hidden =
            true;
    }


    /* =====================================================
       UTILITIES
    ===================================================== */

    function normalizeStatus(status) {

        if (
            status === "published" ||
            status === "archived"
        ) {

            return status;
        }


        return "draft";
    }


    function formatDate(value) {

        if (!value)
            return "—";


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


    function escapeHTML(value) {

        return String(value ?? "")

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
