/* =========================================================
   EDUCORE ADMIN DASHBOARD
   PHASE 3 — ADMIN.JS
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    "use strict";


    /* =====================================================
       ADMIN ACCESS PROTECTION
       
       Phase 2 authentication verifies that the current
       user is authenticated and has administrator access.

       The dashboard does not initialize unless the user
       passes this check.
    ====================================================== */

    if (typeof requireAdmin !== "function") {

        console.error(
            "EduCore: requireAdmin() is not available. Make sure auth.js is loaded before admin.js."
        );

        window.location.href = "index.html";

        return;
    }


    const authorised =
        await requireAdmin();


    if (!authorised) {

        return;

    }


    /* =====================================================
       APPLICATION
    ====================================================== */

    const app =
        document.getElementById("admin-app");


    /* =====================================================
       SIDEBAR
    ====================================================== */

    const sidebar =
        document.getElementById("admin-sidebar");

    const sidebarToggle =
        document.getElementById("sidebar-toggle");

    const sidebarOverlay =
        document.getElementById("sidebar-overlay");

    const mobileSidebarClose =
        document.getElementById("mobile-sidebar-close");


    /* =====================================================
       NAVIGATION
    ====================================================== */

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


    /* =====================================================
       DASHBOARD ELEMENTS
    ====================================================== */

    const totalCourses =
        document.getElementById(
            "total-courses"
        );

    const totalUnits =
        document.getElementById(
            "total-units"
        );

    const totalLessons =
        document.getElementById(
            "total-lessons"
        );

    const totalStudents =
        document.getElementById(
            "total-students"
        );

    const publishedContent =
        document.getElementById(
            "published-content"
        );

    const draftContent =
        document.getElementById(
            "draft-content"
        );

    const activityList =
        document.getElementById(
            "activity-list"
        );

    const dashboardError =
        document.getElementById(
            "dashboard-error"
        );

    const dashboardRetry =
        document.getElementById(
            "dashboard-retry"
        );


    /* =====================================================
       COURSES
    ====================================================== */

    const coursesList =
        document.getElementById(
            "courses-list"
        );

    const courseSearch =
        document.getElementById(
            "course-search"
        );

    const courseFilter =
        document.getElementById(
            "course-filter"
        );

    const courseCount =
        document.getElementById(
            "course-count"
        );


    /* =====================================================
       ADMIN USER
    ====================================================== */

    const adminName =
        document.getElementById(
            "admin-name"
        );

    const adminRole =
        document.getElementById(
            "admin-role"
        );

    const adminAvatar =
        document.getElementById(
            "admin-avatar"
        );


    /* =====================================================
       LOGOUT
    ====================================================== */

    const logoutButton =
        document.getElementById(
            "logout-button"
        );


    /* =====================================================
       STATE
    ====================================================== */

    const state = {

        currentSection: "overview",

        courses: [],

        filteredCourses: [],

        searchTerm: "",

        statusFilter: "all",

        dashboardLoaded: false,

        dashboardErrors: []

    };


    /* =====================================================
       SECTION TITLES
    ====================================================== */

    const sectionTitles = {

        overview: "Overview",

        courses: "Courses",

        students: "Students",

        progress: "Progress",

        media: "Media",

        settings: "Settings"

    };


    /* =====================================================
       SUPABASE CLIENT
       
       Phase 2 should expose the existing client globally.
       We deliberately do not create another Supabase client
       here because credentials belong to the Phase 2 setup.
    ====================================================== */

    function getSupabaseClient() {

        if (
            window.supabaseClient &&
            typeof window.supabaseClient.from === "function"
        ) {

            return window.supabaseClient;

        }


        if (
            window.supabase &&
            typeof window.supabase.from === "function"
        ) {

            return window.supabase;

        }


        return null;

    }


    /* =====================================================
       SAFE TEXT
    ====================================================== */

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        return String(value)

            .replaceAll("&", "&amp;")

            .replaceAll("<", "&lt;")

            .replaceAll(">", "&gt;")

            .replaceAll('"', "&quot;")

            .replaceAll("'", "&#039;");

    }


    /* =====================================================
       FORMAT NUMBER
    ====================================================== */

    function formatNumber(value) {

        const number =
            Number(value);


        if (
            !Number.isFinite(number)
        ) {

            return "0";

        }


        return number.toLocaleString();

    }


    /* =====================================================
       FORMAT DATE
    ====================================================== */

    function formatDate(value) {

        if (!value) {

            return "—";

        }


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
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

    }


    /* =====================================================
       FORMAT RELATIVE TIME
    ====================================================== */

    function formatRelativeTime(value) {

        if (!value) {

            return "Unknown time";

        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "Unknown time";

        }


        const now =
            new Date();


        const difference =
            now.getTime() -
            date.getTime();


        const seconds =
            Math.floor(
                difference / 1000
            );


        if (seconds < 60) {

            return "Just now";

        }


        const minutes =
            Math.floor(
                seconds / 60
            );


        if (minutes < 60) {

            return `${minutes} min ago`;

        }


        const hours =
            Math.floor(
                minutes / 60
            );


        if (hours < 24) {

            return `${hours} hr ago`;

        }


        const days =
            Math.floor(
                hours / 24
            );


        if (days < 7) {

            return `${days} day${days === 1 ? "" : "s"} ago`;

        }


        return formatDate(value);

    }


    /* =====================================================
       GET RECORD STATUS
    ====================================================== */

    function getStatus(record) {

        if (!record) {

            return "draft";

        }


        if (
            typeof record.status === "string"
        ) {

            return record.status
                .toLowerCase();

        }


        if (
            record.published === true ||
            record.is_published === true
        ) {

            return "published";

        }


        if (
            record.archived === true ||
            record.is_archived === true
        ) {

            return "archived";

        }


        return "draft";

    }


    /* =====================================================
       STATUS LABEL
    ====================================================== */

    function getStatusLabel(status) {

        if (status === "published") {

            return "Published";

        }


        if (status === "archived") {

            return "Archived";

        }


        return "Draft";

    }


    /* =====================================================
       STATUS CLASS
    ====================================================== */

    function getStatusClass(status) {

        if (
            status === "published" ||
            status === "archived" ||
            status === "draft"
        ) {

            return status;

        }


        return "draft";

    }


    /* =====================================================
       SHOW ERROR
    ====================================================== */

    function showDashboardError(message) {

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


    /* =====================================================
       HIDE ERROR
    ====================================================== */

    function hideDashboardError() {

        if (!dashboardError) {

            return;

        }


        dashboardError.classList.add(
            "admin-hidden"
        );

    }


    /* =====================================================
       GET TABLE COUNT
       
       Uses exact database counts rather than downloading
       entire tables.
    ====================================================== */

    async function getTableCount(
        client,
        table,
        filter = null
    ) {

        let query =
            client
                .from(table)
                .select("*", {
                    count: "exact",
                    head: true
                });


        if (
            filter &&
            filter.column &&
            filter.value !== undefined
        ) {

            query =
                query.eq(
                    filter.column,
                    filter.value
                );

        }


        const result =
            await query;


        if (result.error) {

            throw result.error;

        }


        return result.count || 0;

    }


    /* =====================================================
       COUNT PUBLISHED CONTENT
       
       Published content =
       published courses +
       published units +
       published lessons.
    ====================================================== */

    async function getPublishedContentCount(
        client
    ) {

        const counts =
            await Promise.all([

                getTableCount(
                    client,
                    "courses",
                    {
                        column: "status",
                        value: "published"
                    }
                ),

                getTableCount(
                    client,
                    "units",
                    {
                        column: "status",
                        value: "published"
                    }
                ),

                getTableCount(
                    client,
                    "lessons",
                    {
                        column: "status",
                        value: "published"
                    }
                )

            ]);


        return counts.reduce(
            (total, count) =>
                total + count,
            0
        );

    }


    /* =====================================================
       COUNT DRAFT CONTENT
    ====================================================== */

    async function getDraftContentCount(
        client
    ) {

        const counts =
            await Promise.all([

                getTableCount(
                    client,
                    "courses",
                    {
                        column: "status",
                        value: "draft"
                    }
                ),

                getTableCount(
                    client,
                    "units",
                    {
                        column: "status",
                        value: "draft"
                    }
                ),

                getTableCount(
                    client,
                    "lessons",
                    {
                        column: "status",
                        value: "draft"
                    }
                )

            ]);


        return counts.reduce(
            (total, count) =>
                total + count,
            0
        );

    }


    /* =====================================================
       STUDENT COUNT
       
       Profiles table contains the user role according to
       the Phase 1/2 database structure.
    ====================================================== */

    async function getStudentCount(
        client
    ) {

        return getTableCount(
            client,
            "profiles",
            {
                column: "role",
                value: "student"
            }
        );

    }


    /* =====================================================
       LOAD DASHBOARD STATISTICS
    ====================================================== */

    async function loadDashboardStatistics() {

        const client =
            getSupabaseClient();


        if (!client) {

            showDashboardError(
                "Supabase is not available. Make sure the Phase 2 Supabase client is loaded before admin.js."
            );

            return;

        }


        state.dashboardErrors = [];


        setStatisticLoading();


        const requests = {

            courses:
                getTableCount(
                    client,
                    "courses"
                ),

            units:
                getTableCount(
                    client,
                    "units"
                ),

            lessons:
                getTableCount(
                    client,
                    "lessons"
                ),

            students:
                getStudentCount(
                    client
                ),

            published:
                getPublishedContentCount(
                    client
                ),

            drafts:
                getDraftContentCount(
                    client
                )

        };


        const results =
            await Promise.allSettled([

                requests.courses,

                requests.units,

                requests.lessons,

                requests.students,

                requests.published,

                requests.drafts

            ]);


        const values = [

            totalCourses,

            totalUnits,

            totalLessons,

            totalStudents,

            publishedContent,

            draftContent

        ];


        results.forEach(
            (result, index) => {

                const element =
                    values[index];


                if (!element) {

                    return;

                }


                if (
                    result.status ===
                    "fulfilled"
                ) {

                    element.textContent =
                        formatNumber(
                            result.value
                        );

                }

                else {

                    element.textContent =
                        "—";


                    state.dashboardErrors.push(
                        result.reason
                    );

                }

            }
        );


        if (
            state.dashboardErrors.length
        ) {

            showDashboardError(
                "Some dashboard statistics could not be loaded. Check that the Phase 1 database tables and columns are available."
            );

        }

        else {

            hideDashboardError();

        }


        state.dashboardLoaded = true;

    }


    /* =====================================================
       STATISTIC LOADING STATE
    ====================================================== */

    function setStatisticLoading() {

        const elements = [

            totalCourses,

            totalUnits,

            totalLessons,

            totalStudents,

            publishedContent,

            draftContent

        ];


        elements.forEach(
            element => {

                if (!element) {

                    return;

                }


                element.textContent =
                    "—";


                element.classList.add(
                    "dashboard-loading"
                );

            }
        );


        setTimeout(() => {

            elements.forEach(
                element => {

                    if (!element) {

                        return;

                    }


                    element.classList.remove(
                        "dashboard-loading"
                    );

                }
            );

        }, 150);

    }


    /* =====================================================
       LOAD COURSES
    ====================================================== */

    async function loadCourses() {

        if (!coursesList) {

            return;

        }


        const client =
            getSupabaseClient();


        if (!client) {

            renderCoursesError(
                "Supabase is not available."
            );

            return;

        }


        coursesList.innerHTML = `
            <div class="courses-loading">
                <div class="courses-loading-icon">
                    ◌
                </div>
                Loading courses...
            </div>
        `;


        try {

            const result =
                await client
                    .from("courses")
                    .select("*")
                    .order(
                        "updated_at",
                        {
                            ascending: false
                        }
                    );


            if (result.error) {

                throw result.error;

            }


            state.courses =
                Array.isArray(
                    result.data
                )
                    ? result.data
                    : [];


            applyCourseFilters();

        }

        catch (error) {

            console.error(
                "EduCore: failed to load courses",
                error
            );


            state.courses = [];


            renderCoursesError(
                "Courses could not be loaded from the database."
            );

        }

    }


    /* =====================================================
       RENDER COURSES ERROR
    ====================================================== */

    function renderCoursesError(
        message
    ) {

        if (!coursesList) {

            return;

        }


        if (courseCount) {

            courseCount.textContent =
                "Unavailable";

        }


        coursesList.innerHTML = `
            <div class="courses-empty">

                <div class="courses-empty-icon">
                    !
                </div>

                <h3>
                    Unable to load courses
                </h3>

                <p>
                    ${escapeHTML(message)}
                </p>

            </div>
        `;

    }


    /* =====================================================
       FILTER COURSES
    ====================================================== */

    function applyCourseFilters() {

        const search =
            state.searchTerm;


        const status =
            state.statusFilter;


        state.filteredCourses =
            state.courses.filter(
                course => {

                    const courseStatus =
                        getStatus(
                            course
                        );


                    const searchableText =
                        [

                            course.title,

                            course.name,

                            course.description,

                            course.category,

                            course.level

                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


                    const matchesSearch =
                        !search ||
                        searchableText.includes(
                            search
                        );


                    const matchesStatus =
                        status === "all" ||
                        courseStatus === status;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );

                }
            );


        renderCourses();

    }


    /* =====================================================
       RENDER COURSES
    ====================================================== */

    function renderCourses() {

        if (!coursesList) {

            return;

        }


        const courses =
            state.filteredCourses;


        if (courseCount) {

            const count =
                courses.length;


            courseCount.textContent =
                `${count} course${count === 1 ? "" : "s"}`;

        }


        if (!courses.length) {

            coursesList.innerHTML = `
                <div class="courses-empty">

                    <div class="courses-empty-icon">
                        ▣
                    </div>

                    <h3>
                        No courses found
                    </h3>

                    <p>
                        No courses match the current search or filter.
                    </p>

                </div>
            `;

            return;

        }


        coursesList.innerHTML =
            courses
                .map(
                    course =>
                        createCourseRow(
                            course
                        )
                )
                .join("");

    }


    /* =====================================================
       CREATE COURSE ROW
    ====================================================== */

    function createCourseRow(
        course
    ) {

        const title =
            course.title ||
            course.name ||
            "Untitled course";


        const category =
            course.category ||
            course.type ||
            "—";


        const level =
            course.level ||
            "—";


        const description =
            course.description ||
            "";


        const status =
            getStatus(
                course
            );


        const statusClass =
            getStatusClass(
                status
            );


        const statusLabel =
            getStatusLabel(
                status
            );


        const updated =
            course.updated_at ||
            course.updatedAt ||
            course.created_at;


        const cover =
            course.cover_url ||
            course.cover ||
            course.image_url ||
            course.image ||
            "";


        const coverHTML =
            cover
                ? `
                    <img
                        src="${escapeHTML(cover)}"
                        alt="${escapeHTML(title)}"
                        loading="lazy"
                    >
                `
                : `
                    <div class="course-cover-placeholder">
                        ▣
                    </div>
                `;


        return `
            <article class="course-row">

                <div class="course-main">

                    <div class="course-cover">
                        ${coverHTML}
                    </div>

                    <div class="course-info">

                        <div class="course-title">
                            ${escapeHTML(title)}
                        </div>

                        ${
                            description
                                ? `
                                    <div class="course-description">
                                        ${escapeHTML(description)}
                                    </div>
                                `
                                : ""
                        }

                    </div>

                </div>


                <div class="course-category">
                    ${escapeHTML(category)}
                </div>


                <div class="course-level">
                    ${escapeHTML(level)}
                </div>


                <div>

                    <span
                        class="course-status ${statusClass}"
                    >
                        ${escapeHTML(statusLabel)}
                    </span>

                </div>


                <div class="course-updated">
                    ${escapeHTML(
                        formatDate(updated)
                    )}
                </div>

            </article>
        `;

    }


    /* =====================================================
       COURSE SEARCH
    ====================================================== */

    if (courseSearch) {

        courseSearch.addEventListener(
            "input",
            event => {

                state.searchTerm =
                    event.target.value
                        .toLowerCase()
                        .trim();


                applyCourseFilters();

            }
        );

    }


    /* =====================================================
       COURSE STATUS FILTER
    ====================================================== */

    if (courseFilter) {

        courseFilter.addEventListener(
            "change",
            event => {

                state.statusFilter =
                    event.target.value;


                applyCourseFilters();

            }
        );

    }


    /* =====================================================
       RECENT ACTIVITY
       
       We use the existing database structure where possible.
       If an audit/activity table exists, it is used first.
       Otherwise the dashboard builds useful recent activity
       from recently updated courses, units and lessons.
    ====================================================== */

    async function loadRecentActivity() {

        if (!activityList) {

            return;

        }


        const client =
            getSupabaseClient();


        if (!client) {

            renderActivityEmpty(
                "Recent activity is unavailable because Supabase is not connected."
            );

            return;

        }


        activityList.innerHTML = `
            <div class="activity-loading">
                Loading recent activity...
            </div>
        `;


        try {

            const activityResult =
                await client
                    .from("activities")
                    .select("*")
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    )
                    .limit(8);


            if (
                !activityResult.error &&
                Array.isArray(
                    activityResult.data
                ) &&
                activityResult.data.length
            ) {

                renderDatabaseActivities(
                    activityResult.data
                );

                return;

            }


            await loadContentActivity(
                client
            );

        }

        catch (error) {

            console.warn(
                "EduCore: activities table unavailable, using content activity fallback.",
                error
            );


            try {

                await loadContentActivity(
                    client
                );

            }

            catch (fallbackError) {

                console.error(
                    "EduCore: recent activity failed",
                    fallbackError
                );


                renderActivityEmpty(
                    "No recent activity is available."
                );

            }

        }

    }


    /* =====================================================
       RENDER DATABASE ACTIVITIES
    ====================================================== */

    function renderDatabaseActivities(
        activities
    ) {

        if (!activityList) {

            return;

        }


        if (!activities.length) {

            renderActivityEmpty(
                "No recent activity."
            );

            return;

        }


        activityList.innerHTML =
            activities
                .slice(0, 8)
                .map(
                    activity =>
                        createActivityItem(
                            getActivityTitle(
                                activity
                            ),
                            getActivityMeta(
                                activity
                            ),
                            getActivityIcon(
                                activity
                            )
                        )
                )
                .join("");

    }


    /* =====================================================
       DATABASE ACTIVITY TITLE
    ====================================================== */

    function getActivityTitle(
        activity
    ) {

        if (
            activity.title &&
            String(activity.title).trim()
        ) {

            return String(
                activity.title
            );

        }


        if (
            activity.activity_type
        ) {

            return formatActivityType(
                activity.activity_type
            );

        }


        return "Activity recorded";

    }


    /* =====================================================
       DATABASE ACTIVITY META
    ====================================================== */

    function getActivityMeta(
        activity
    ) {

        const date =
            activity.created_at ||
            activity.updated_at;


        if (!date) {

            return "Recent activity";

        }


        return formatRelativeTime(
            date
        );

    }


    /* =====================================================
       DATABASE ACTIVITY ICON
    ====================================================== */

    function getActivityIcon(
        activity
    ) {

        const type =
            String(
                activity.activity_type ||
                ""
            ).toLowerCase();


        if (
            type.includes("publish")
        ) {

            return "✓";

        }


        if (
            type.includes("create") ||
            type.includes("add")
        ) {

            return "+";

        }


        if (
            type.includes("delete") ||
            type.includes("archive")
        ) {

            return "−";

        }


        if (
            type.includes("update") ||
            type.includes("edit")
        ) {

            return "↗";

        }


        return "•";

    }


    /* =====================================================
       FORMAT ACTIVITY TYPE
    ====================================================== */

    function formatActivityType(
        value
    ) {

        return String(value)
            .replaceAll("_", " ")
            .replaceAll("-", " ")
            .replace(
                /\b\w/g,
                character =>
                    character.toUpperCase()
            );

    }


    /* =====================================================
       CONTENT ACTIVITY FALLBACK
    ====================================================== */

    async function loadContentActivity(
        client
    ) {

        const activitySources = [];


        const tables = [

            {
                table: "courses",
                label: "Course"
            },

            {
                table: "units",
                label: "Unit"
            },

            {
                table: "lessons",
                label: "Lesson"
            }

        ];


        for (
            const source of tables
        ) {

            try {

                const result =
                    await client
                        .from(
                            source.table
                        )
                        .select(
                            "id, title, name, updated_at, created_at, status"
                        )
                        .order(
                            "updated_at",
                            {
                                ascending: false
                            }
                        )
                        .limit(5);


                if (
                    result.error
                ) {

                    continue;

                }


                const records =
                    Array.isArray(
                        result.data
                    )
                        ? result.data
                        : [];


                records.forEach(
                    record => {

                        activitySources.push({

                            title:
                                `${source.label} "${record.title || record.name || "Untitled"}" updated`,

                            date:
                                record.updated_at ||
                                record.created_at,

                            icon:
                                getStatus(record) ===
                                "published"
                                    ? "✓"
                                    : "↗"

                        });

                    }
                );

            }

            catch (error) {

                console.warn(
                    `EduCore: could not load ${source.table} activity`,
                    error
                );

            }

        }


        activitySources.sort(
            (a, b) => {

                const aDate =
                    new Date(
                        a.date || 0
                    ).getTime();


                const bDate =
                    new Date(
                        b.date || 0
                    ).getTime();


                return bDate - aDate;

            }
        );


        if (!activitySources.length) {

            renderActivityEmpty(
                "No recent activity."
            );

            return;

        }


        activityList.innerHTML =
            activitySources
                .slice(0, 8)
                .map(
                    item =>
                        createActivityItem(
                            item.title,
                            formatRelativeTime(
                                item.date
                            ),
                            item.icon
                        )
                )
                .join("");

    }


    /* =====================================================
       CREATE ACTIVITY ITEM
    ====================================================== */

    function createActivityItem(
        title,
        meta,
        icon
    ) {

        return `
            <div class="activity-item">

                <div class="activity-icon">
                    ${escapeHTML(icon || "•")}
                </div>

                <div class="activity-content">

                    <div class="activity-title">
                        ${escapeHTML(title)}
                    </div>

                    <div class="activity-meta">
                        ${escapeHTML(meta)}
                    </div>

                </div>

            </div>
        `;

    }


    /* =====================================================
       EMPTY ACTIVITY
    ====================================================== */

    function renderActivityEmpty(
        message
    ) {

        if (!activityList) {

            return;

        }


        activityList.innerHTML = `
            <div class="activity-empty">
                ${escapeHTML(message)}
            </div>
        `;

    }


    /* =====================================================
       NAVIGATION
    ====================================================== */

    function openSection(
        sectionName
    ) {

        if (
            !sectionTitles[
                sectionName
            ]
        ) {

            return;

        }


        state.currentSection =
            sectionName;


        navigationItems.forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.section ===
                    sectionName
                );

            }
        );


        sections.forEach(
            section => {

                section.classList.toggle(
                    "active",
                    section.id ===
                    `${sectionName}-section`
                );

            }
        );


        if (pageTitle) {

            pageTitle.textContent =
                sectionTitles[
                    sectionName
                ];

        }


        closeMobileSidebar();


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });


        if (
            sectionName === "courses" &&
            !state.courses.length
        ) {

            loadCourses();

        }

    }


    /* =====================================================
       NAVIGATION EVENTS
    ====================================================== */

    navigationItems.forEach(
        item => {

            item.addEventListener(
                "click",
                () => {

                    openSection(
                        item.dataset.section
                    );

                }
            );

        }
    );


    /* =====================================================
       DESKTOP SIDEBAR TOGGLE
    ====================================================== */

    if (sidebarToggle) {

        sidebarToggle.addEventListener(
            "click",
            () => {

                if (
                    window.innerWidth <= 768
                ) {

                    toggleMobileSidebar();

                }

                else {

                    toggleDesktopSidebar();

                }

            }
        );

    }


    /* =====================================================
       DESKTOP SIDEBAR
    ====================================================== */

    function toggleDesktopSidebar() {

        if (!app) {

            return;

        }


        const collapsed =
            app.classList.toggle(
                "sidebar-collapsed"
            );


        if (sidebarToggle) {

            sidebarToggle.setAttribute(
                "aria-expanded",
                String(!collapsed)
            );

        }


        localStorage.setItem(
            "educoreAdminSidebarCollapsed",
            collapsed
                ? "true"
                : "false"
        );

    }


    /* =====================================================
       RESTORE DESKTOP SIDEBAR
    ====================================================== */

    function restoreDesktopSidebar() {

        if (
            !app ||
            window.innerWidth <= 768
        ) {

            return;

        }


        const saved =
            localStorage.getItem(
                "educoreAdminSidebarCollapsed"
            );


        if (saved === "true") {

            app.classList.add(
                "sidebar-collapsed"
            );

        }

    }


    /* =====================================================
       MOBILE SIDEBAR
    ====================================================== */

    function toggleMobileSidebar() {

        if (!app) {

            return;

        }


        const opened =
            app.classList.toggle(
                "sidebar-open"
            );


        if (sidebarToggle) {

            sidebarToggle.setAttribute(
                "aria-expanded",
                String(opened)
            );

        }

    }


    /* =====================================================
       CLOSE MOBILE SIDEBAR
    ====================================================== */

    function closeMobileSidebar() {

        if (!app) {

            return;

        }


        app.classList.remove(
            "sidebar-open"
        );


        if (sidebarToggle) {

            sidebarToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }


    /* =====================================================
       MOBILE CLOSE BUTTON
    ====================================================== */

    if (mobileSidebarClose) {

        mobileSidebarClose.addEventListener(
            "click",
            closeMobileSidebar
        );

    }


    /* =====================================================
       MOBILE OVERLAY
    ====================================================== */

    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeMobileSidebar
        );

    }


    /* =====================================================
       ESCAPE KEY
    ====================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeMobileSidebar();

            }

        }
    );


    /* =====================================================
       RESIZE
    ====================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 768
            ) {

                closeMobileSidebar();

                restoreDesktopSidebar();

            }

        }
    );


    /* =====================================================
       ADMIN PROFILE
       
       Uses the currently authenticated Supabase user
       without changing the Phase 2 authentication system.
    ====================================================== */

    async function loadAdminProfile() {

        const client =
            getSupabaseClient();


        if (!client) {

            return;

        }


        try {

            const authResult =
                await client.auth.getUser();


            const user =
                authResult?.data?.user;


            if (!user) {

                return;

            }


            let name =
                user.user_metadata?.name ||
                user.user_metadata?.full_name ||
                user.email ||
                "Administrator";


            let role =
                user.user_metadata?.role ||
                "Admin";


            try {

                const profileResult =
                    await client
                        .from("profiles")
                        .select(
                            "name, email, role"
                        )
                        .eq(
                            "id",
                            user.id
                        )
                        .maybeSingle();


                if (
                    !profileResult.error &&
                    profileResult.data
                ) {

                    if (
                        profileResult.data.name
                    ) {

                        name =
                            profileResult.data.name;

                    }


                    if (
                        profileResult.data.role
                    ) {

                        role =
                            profileResult.data.role;

                    }

                }

            }

            catch (profileError) {

                console.warn(
                    "EduCore: profile lookup unavailable.",
                    profileError
                );

            }


            if (adminName) {

                adminName.textContent =
                    name;

            }


            if (adminRole) {

                adminRole.textContent =
                    String(role)
                        .replace(
                            /^\w/,
                            character =>
                                character.toUpperCase()
                        );

            }


            if (adminAvatar) {

                const avatarSource =
                    user.user_metadata?.avatar_url ||
                    user.user_metadata?.picture;


                if (avatarSource) {

                    adminAvatar.innerHTML = `
                        <img
                            src="${escapeHTML(avatarSource)}"
                            alt=""
                        >
                    `;

                }

                else {

                    adminAvatar.textContent =
                        getInitials(
                            name
                        );

                }

            }

        }

        catch (error) {

            console.warn(
                "EduCore: could not load admin profile.",
                error
            );

        }

    }


    /* =====================================================
       INITIALS
    ====================================================== */

    function getInitials(
        value
    ) {

        const words =
            String(value || "A")
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (!words.length) {

            return "A";

        }


        if (words.length === 1) {

            return words[0]
                .charAt(0)
                .toUpperCase();

        }


        return (
            words[0].charAt(0) +
            words[words.length - 1]
                .charAt(0)
        ).toUpperCase();

    }


    /* =====================================================
       LOGOUT
       
       Uses the existing Supabase authentication session.
       Phase 2 remains responsible for authentication.
    ====================================================== */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async () => {

                const client =
                    getSupabaseClient();


                logoutButton.disabled =
                    true;


                logoutButton.classList.add(
                    "is-loading"
                );


                try {

                    if (
                        client &&
                        client.auth
                    ) {

                        await client.auth.signOut();

                    }

                }

                catch (error) {

                    console.error(
                        "EduCore: logout failed",
                        error
                    );

                }

                finally {

                    window.location.href =
                        "index.html";

                }

            }
        );

    }


    /* =====================================================
       RETRY
    ====================================================== */

    if (dashboardRetry) {

        dashboardRetry.addEventListener(
            "click",
            async () => {

                hideDashboardError();


                await Promise.all([

                    loadDashboardStatistics(),

                    loadRecentActivity(),

                    loadCourses()

                ]);

            }
        );

    }


    /* =====================================================
       INITIALIZATION
    ====================================================== */

    async function initializeAdminDashboard() {

        restoreDesktopSidebar();


        openSection(
            "overview"
        );


        await Promise.all([

            loadDashboardStatistics(),

            loadRecentActivity(),

            loadCourses(),

            loadAdminProfile()

        ]);

    }


    /* =====================================================
       START ADMIN DASHBOARD
       
       This is reached only after requireAdmin()
       successfully authorizes the current user.
    ====================================================== */

    initializeAdminDashboard();

});
