/* =========================================================
   EDUCORE ADMIN
   Course + Module + Lesson + Section Management
   ========================================================= */

"use strict";


/* =========================================================
   SUPABASE
   ========================================================= */

const client =
    window.supabaseClient ||
    window.supabase ||
    null;


if (!client) {
    console.error("EduCore: Supabase client was not found.");
}


/* =========================================================
   STATE
   ========================================================= */

const state = {

    allCourses: [],
    editingCourseId: null,

    allCarouselItems: [],
    editingCarouselItemId: null,
    removeCarouselImage: false,

    currentContentCourse: null,

    modules: [],
    lessons: [],
    sections: [],

    editingContentType: null,
    editingContentId: null,
    editingParentId: null,

    expandedModules: new Set(),
    expandedLessons: new Set()

};


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (selector, root = document) =>
    root.querySelector(selector);

const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    init();

});


async function init() {

    setupNavigation();
    setupSidebar();
    setupLogout();

    setupCourseControls();
    setupCarouselControls();

    setupCourseModal();
    setupCarouselModal();

    setupContentBuilder();
    setupContentEditor();

    setupDashboardRetry();

    await loadAdminUser();

    await Promise.all([
        loadDashboard(),
        loadCourses(),
        loadCarouselItems()
    ]);

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const navItems = $$(".nav-item");

    navItems.forEach(button => {

        button.addEventListener("click", () => {

            const target = button.dataset.section;

            if (!target) return;

            navItems.forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            $$(".admin-section").forEach(section => {
                section.classList.remove("active");
            });

            const targetSection =
                $(`#section-${target}`);

            if (targetSection) {
                targetSection.classList.add("active");
            }

        });

    });

}


/* =========================================================
   SIDEBAR
   ========================================================= */

function setupSidebar() {

    const toggle = $("#sidebar-toggle");
    const sidebar = $("#admin-sidebar");

    if (!toggle || !sidebar) return;

    toggle.addEventListener("click", () => {

        if (window.innerWidth <= 768) {

            sidebar.classList.toggle("sidebar-open");

        } else {

            document.body.classList.toggle(
                "sidebar-collapsed"
            );

        }

    });

}


/* =========================================================
   LOGOUT
   ========================================================= */

function setupLogout() {

    const button = $("#admin-logout");

    if (!button) return;

    button.addEventListener("click", async () => {

        try {

            if (client) {
                await client.auth.signOut();
            }

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

        window.location.href = "index.html";

    });

}


/* =========================================================
   ADMIN USER
   ========================================================= */

async function loadAdminUser() {

    if (!client) return;

    try {

        const {
            data,
            error
        } = await client.auth.getUser();

        if (error) throw error;

        const user = data?.user;

        if (!user) return;

        const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "Admin";

        const nameElement =
            $("#admin-user-name");

        const emailElement =
            $("#admin-user-email");

        const avatar =
            $(".admin-user-avatar");

        if (nameElement) {
            nameElement.textContent = name;
        }

        if (emailElement) {
            emailElement.textContent =
                user.email || "Administrator";
        }

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


/* =========================================================
   DASHBOARD
   ========================================================= */

async function loadDashboard() {

    if (!client) return;

    await Promise.all([
        loadCourseCount(),
        loadModuleCount(),
        loadLessonCount(),
        loadStudentCount(),
        loadContentCounts(),
        loadRecentActivity()
    ]);

}


async function loadCourseCount() {

    const element =
        $("#total-courses");

    if (!element || !client) return;

    const {
        count,
        error
    } = await client
        .from("courses")
        .select("id", {
            count: "exact",
            head: true
        });

    if (error) {

        console.error(
            "Course count error:",
            error
        );

        element.textContent = "—";
        return;

    }

    element.textContent =
        Number(count || 0).toLocaleString();

}


async function loadModuleCount() {

    const element =
        $("#total-modules");

    if (!element || !client) return;

    const {
        count,
        error
    } = await client
        .from("modules")
        .select("id", {
            count: "exact",
            head: true
        });

    if (error) {

        console.error(
            "Module count error:",
            error
        );

        element.textContent = "—";
        return;

    }

    element.textContent =
        Number(count || 0).toLocaleString();

}


async function loadLessonCount() {

    const element =
        $("#total-lessons");

    if (!element || !client) return;

    const {
        count,
        error
    } = await client
        .from("lessons")
        .select("id", {
            count: "exact",
            head: true
        });

    if (error) {

        console.error(
            "Lesson count error:",
            error
        );

        element.textContent = "—";
        return;

    }

    element.textContent =
        Number(count || 0).toLocaleString();

}


async function loadStudentCount() {

    const element =
        $("#total-students");

    if (!element || !client) return;

    /*
       This assumes your student profiles are stored
       in a profiles table.

       If your existing project uses another table,
       this can be changed later without affecting
       course content.
    */

    try {

        const {
            count,
            error
        } = await client
            .from("profiles")
            .select("id", {
                count: "exact",
                head: true
            });

        if (error) throw error;

        element.textContent =
            Number(count || 0).toLocaleString();

    } catch (error) {

        console.error(
            "Student count error:",
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

    if (!client) return;

    try {

        const {
            data,
            error
        } = await client
            .from("courses")
            .select("status");

        if (error) throw error;

        const courses = data || [];

        const publishedCount =
            courses.filter(
                course => course.status === "published"
            ).length;

        const draftCount =
            courses.filter(
                course => course.status === "draft"
            ).length;

        if (published) {
            published.textContent =
                publishedCount.toLocaleString();
        }

        if (draft) {
            draft.textContent =
                draftCount.toLocaleString();
        }

    } catch (error) {

        console.error(
            "Content count error:",
            error
        );

        if (published) published.textContent = "—";
        if (draft) draft.textContent = "—";

    }

}


async function loadRecentActivity() {

    const container =
        $("#recent-activity");

    if (!container || !client) return;

    try {

        const {
            data,
            error
        } = await client
            .from("courses")
            .select(
                "id,title,status,updated_at,created_at"
            )
            .order(
                "updated_at",
                { ascending: false }
            )
            .limit(8);

        if (error) throw error;

        if (!data?.length) {

            container.innerHTML = `
                <div class="empty-state">
                    No recent activity.
                </div>
            `;

            return;
        }

        container.innerHTML =
            data.map(course => {

                const date =
                    formatDate(
                        course.updated_at ||
                        course.created_at
                    );

                return `
                    <div class="activity-item">

                        <div class="activity-icon">
                            ${course.status === "published" ? "✓" : "•"}
                        </div>

                        <div class="activity-content">

                            <strong>
                                ${escapeHtml(course.title || "Untitled course")}
                            </strong>

                            <span>
                                Course updated · ${escapeHtml(date)}
                            </span>

                        </div>

                    </div>
                `;

            }).join("");

    } catch (error) {

        console.error(
            "Recent activity error:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                Unable to load activity.
            </div>
        `;

    }

}


function setupDashboardRetry() {
    /*
       Reserved for dashboard retry controls.
    */
}


/* =========================================================
   COURSES
   ========================================================= */

function setupCourseControls() {

    const createButton =
        $("#create-course-button");

    if (createButton) {

        createButton.addEventListener(
            "click",
            () => openCourseModal()
        );

    }

    const search =
        $("#course-search");

    const status =
        $("#course-status-filter");

    const level =
        $("#course-level-filter");

    if (search) {
        search.addEventListener(
            "input",
            renderCourses
        );
    }

    if (status) {
        status.addEventListener(
            "change",
            renderCourses
        );
    }

    if (level) {
        level.addEventListener(
            "change",
            renderCourses
        );
    }

}


async function loadCourses() {

    const container =
        $("#courses-list");

    if (!container || !client) return;

    container.innerHTML = `
        <div class="empty-state">
            Loading courses...
        </div>
    `;

    try {

        const {
            data,
            error
        } = await client
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
                slug,
                archived_at
            `)
            .order(
                "sort_order",
                { ascending: true }
            )
            .order(
                "created_at",
                { ascending: false }
            );

        if (error) throw error;

        state.allCourses = data || [];

        renderCourses();

    } catch (error) {

        console.error(
            "Load courses error:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                Unable to load courses.
            </div>
        `;

    }

}


function renderCourses() {

    const container =
        $("#courses-list");

    if (!container) return;

    const search =
        ($("#course-search")?.value || "")
            .trim()
            .toLowerCase();

    const status =
        $("#course-status-filter")?.value ||
        "all";

    const level =
        $("#course-level-filter")?.value ||
        "all";

    let courses =
        [...state.allCourses];

    if (search) {

        courses =
            courses.filter(course => {

                const haystack = [
                    course.title,
                    course.description,
                    course.category,
                    course.level
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return haystack.includes(search);

            });

    }

    if (status !== "all") {

        courses =
            courses.filter(
                course => course.status === status
            );

    }

    if (level !== "all") {

        courses =
            courses.filter(
                course => course.level === level
            );

    }

    if (!courses.length) {

        container.innerHTML = `
            <div class="empty-state">
                No courses found.
            </div>
        `;

        return;
    }

    container.innerHTML =
        courses.map(renderCourseCard).join("");

    bindCourseActions();

}


function renderCourseCard(course) {

    const statusClass =
        course.status === "published"
            ? "published"
            : course.status === "draft"
                ? "draft"
                : "archived";

    const image =
        course.cover_image
            ? `
                <img
                    src="${escapeAttribute(course.cover_image)}"
                    alt=""
                    class="course-list-image"
                >
              `
            : `
                <div class="course-list-image-placeholder">
                    E
                </div>
              `;

    return `
        <div
            class="course-list-item"
            data-course-id="${course.id}"
        >

            <div class="course-list-main">

                ${image}

                <div class="course-list-info">

                    <strong>
                        ${escapeHtml(course.title || "Untitled")}
                    </strong>

                    <span>
                        ${escapeHtml(course.category || "General")}
                        ·
                        ${escapeHtml(course.level || "—")}
                    </span>

                </div>

            </div>


            <div class="course-list-meta">

                <span class="content-status ${statusClass}">
                    ${escapeHtml(course.status || "draft")}
                </span>

                <span>
                    ${escapeHtml(
                        formatDate(
                            course.updated_at ||
                            course.created_at
                        )
                    )}
                </span>

            </div>


            <div class="course-actions">

                <button
                    type="button"
                    class="course-action-button primary-content-action"
                    data-action="content"
                    data-id="${course.id}"
                >
                    Content
                </button>

                <button
                    type="button"
                    class="course-action-button"
                    data-action="edit"
                    data-id="${course.id}"
                >
                    Edit
                </button>

                ${
                    course.status === "published"
                    ? `
                        <button
                            type="button"
                            class="course-action-button"
                            data-action="unpublish"
                            data-id="${course.id}"
                        >
                            Unpublish
                        </button>
                    `
                    : `
                        <button
                            type="button"
                            class="course-action-button"
                            data-action="publish"
                            data-id="${course.id}"
                        >
                            Publish
                        </button>
                    `
                }

                <button
                    type="button"
                    class="course-action-button"
                    data-action="duplicate"
                    data-id="${course.id}"
                >
                    Duplicate
                </button>

                ${
                    course.status === "archived"
                    ? `
                        <button
                            type="button"
                            class="course-action-button"
                            data-action="restore"
                            data-id="${course.id}"
                        >
                            Restore
                        </button>
                    `
                    : `
                        <button
                            type="button"
                            class="course-action-button"
                            data-action="archive"
                            data-id="${course.id}"
                        >
                            Archive
                        </button>
                    `
                }

            </div>

        </div>
    `;

}


function bindCourseActions() {

    $$(".course-action-button").forEach(button => {

        button.addEventListener(
            "click",
            async event => {

                event.stopPropagation();

                const action =
                    button.dataset.action;

                const id =
                    button.dataset.id;

                if (!id) return;

                if (action === "content") {
                    await openContentBuilder(id);
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
                    await updateCourseStatus(
                        id,
                        "archived"
                    );
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


/* =========================================================
   COURSE MODAL
   ========================================================= */

function setupCourseModal() {

    const modal =
        $("#course-modal");

    const close =
        $("#course-modal-close");

    const cancel =
        $("#course-cancel-button");

    const backdrop =
        $(".course-modal-backdrop", modal);

    const form =
        $("#course-form");

    if (close) {
        close.addEventListener(
            "click",
            closeCourseModal
        );
    }

    if (cancel) {
        cancel.addEventListener(
            "click",
            closeCourseModal
        );
    }

    if (backdrop) {
        backdrop.addEventListener(
            "click",
            closeCourseModal
        );
    }

    if (form) {
        form.addEventListener(
            "submit",
            saveCourse
        );
    }

}


function openCourseModal(courseId = null) {

    const modal =
        $("#course-modal");

    const title =
        $("#course-modal-title");

    const kicker =
        $("#course-modal-kicker");

    const error =
        $("#course-form-error");

    if (!modal) return;

    state.editingCourseId =
        courseId
            ? Number(courseId)
            : null;

    if (error) {
        error.textContent = "";
    }

    if (!courseId) {

        if (kicker) {
            kicker.textContent = "Course";
        }

        if (title) {
            title.textContent = "Create Course";
        }

        $("#course-title").value = "";
        $("#course-description").value = "";
        $("#course-category").value = "";
        $("#course-level").value = "A1";
        $("#course-cover").value = "";
        $("#course-cover-url").value = "";
        $("#course-sort-order").value = "0";

    } else {

        const course =
            state.allCourses.find(
                item =>
                    Number(item.id) ===
                    Number(courseId)
            );

        if (!course) return;

        if (kicker) {
            kicker.textContent = "Course";
        }

        if (title) {
            title.textContent = "Edit Course";
        }

        $("#course-title").value =
            course.title || "";

        $("#course-description").value =
            course.description || "";

        $("#course-category").value =
            course.category || "";

        $("#course-level").value =
            course.level || "A1";

        $("#course-cover").value = "";

        $("#course-cover-url").value =
            course.cover_image || "";

        $("#course-sort-order").value =
            course.sort_order ?? 0;

    }

    openModal(modal);

}


function closeCourseModal() {

    closeModal(
        $("#course-modal")
    );

    state.editingCourseId = null;

}


async function saveCourse(event) {

    event.preventDefault();

    if (!client) return;

    const errorElement =
        $("#course-form-error");

    if (errorElement) {
        errorElement.textContent = "";
    }

    try {

        const title =
            $("#course-title").value.trim();

        if (!title) {
            throw new Error(
                "Course title is required."
            );
        }

        const description =
            $("#course-description").value.trim();

        const category =
            $("#course-category").value.trim();

        const level =
            $("#course-level").value;

        const sortOrder =
            Number(
                $("#course-sort-order").value || 0
            );

        let coverImage =
            $("#course-cover-url").value.trim();

        const file =
            $("#course-cover").files?.[0];

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

            cover_image:
                coverImage || null,

            sort_order:
                sortOrder

        };

        if (state.editingCourseId) {

            const {
                error
            } = await client
                .from("courses")
                .update(payload)
                .eq(
                    "id",
                    state.editingCourseId
                );

            if (error) throw error;

            showToast(
                "Course updated successfully."
            );

        } else {

            payload.status = "draft";

            const {
                error
            } = await client
                .from("courses")
                .insert(payload);

            if (error) throw error;

            showToast(
                "Course created successfully."
            );

        }

        closeCourseModal();

        await loadCourses();
        await loadDashboard();

    } catch (error) {

        console.error(
            "Save course error:",
            error
        );

        if (errorElement) {
            errorElement.textContent =
                error.message ||
                "Unable to save course.";
        }

    }

}


async function updateCourseStatus(
    courseId,
    status
) {

    if (!client) return;

    try {

        const {
            error
        } = await client
            .from("courses")
            .update({
                status,
                archived_at:
                    status === "archived"
                        ? new Date().toISOString()
                        : null
            })
            .eq("id", courseId);

        if (error) throw error;

        showToast(
            `Course ${status}.`
        );

        await loadCourses();
        await loadDashboard();

    } catch (error) {

        console.error(
            "Course status error:",
            error
        );

        showToast(
            error.message ||
            "Unable to update course.",
            true
        );

    }

}


/* =========================================================
   DUPLICATE COURSE
   Includes modules, lessons and sections
   ========================================================= */

async function duplicateCourse(courseId) {

    if (!client) return;

    const source =
        state.allCourses.find(
            course =>
                Number(course.id) ===
                Number(courseId)
        );

    if (!source) return;

    const confirmed =
        window.confirm(
            `Duplicate "${source.title}" including its modules, lessons and content?`
        );

    if (!confirmed) return;

    try {

        const {
            data: newCourse,
            error: courseError
        } = await client
            .from("courses")
            .insert({
                title:
                    `${source.title} Copy`,
                description:
                    source.description,
                category:
                    source.category,
                level:
                    source.level,
                cover_image:
                    source.cover_image,
                status:
                    "draft",
                sort_order:
                    source.sort_order
            })
            .select()
            .single();

        if (courseError) {
            throw courseError;
        }

        const {
            data: modules,
            error: moduleError
        } = await client
            .from("modules")
            .select("*")
            .eq(
                "course_id",
                courseId
            )
            .order(
                "sort_order",
                { ascending: true }
            );

        if (moduleError) {
            throw moduleError;
        }

        for (const module of modules || []) {

            const {
                data: newModule,
                error: newModuleError
            } = await client
                .from("modules")
                .insert({
                    course_id:
                        newCourse.id,
                    title:
                        module.title,
                    description:
                        module.description,
                    sort_order:
                        module.sort_order,
                    status:
                        module.status || "draft"
                })
                .select()
                .single();

            if (newModuleError) {
                throw newModuleError;
            }

            const {
                data: lessons,
                error: lessonError
            } = await client
                .from("lessons")
                .select("*")
                .eq(
                    "module_id",
                    module.id
                )
                .order(
                    "sort_order",
                    { ascending: true }
                );

            if (lessonError) {
                throw lessonError;
            }

            for (const lesson of lessons || []) {

                const {
                    data: newLesson,
                    error: newLessonError
                } = await client
                    .from("lessons")
                    .insert({
                        module_id:
                            newModule.id,
                        title:
                            lesson.title,
                        description:
                            lesson.description,
                        duration_minutes:
                            lesson.duration_minutes,
                        status:
                            lesson.status || "draft",
                        sort_order:
                            lesson.sort_order
                    })
                    .select()
                    .single();

                if (newLessonError) {
                    throw newLessonError;
                }

                const {
                    data: sections,
                    error: sectionError
                } = await client
                    .from("lesson_sections")
                    .select("*")
                    .eq(
                        "lesson_id",
                        lesson.id
                    )
                    .order(
                        "sort_order",
                        { ascending: true }
                    );

                if (sectionError) {
                    throw sectionError;
                }

                if (sections?.length) {

                    const sectionRows =
                        sections.map(section => ({
                            lesson_id:
                                newLesson.id,
                            section_type:
                                section.section_type,
                            title:
                                section.title,
                            description:
                                section.description,
                            sort_order:
                                section.sort_order,
                            content:
                                section.content || {}
                        }));

                    const {
                        error:
                            insertSectionsError
                    } = await client
                        .from("lesson_sections")
                        .insert(
                            sectionRows
                        );

                    if (insertSectionsError) {
                        throw insertSectionsError;
                    }

                }

            }

        }

        showToast(
            "Course duplicated successfully."
        );

        await loadCourses();
        await loadDashboard();

    } catch (error) {

        console.error(
            "Duplicate course error:",
            error
        );

        showToast(
            error.message ||
            "Unable to duplicate course.",
            true
        );

    }

}


/* =========================================================
   CONTENT BUILDER
   ========================================================= */

function setupContentBuilder() {

    const close =
        $("#content-builder-close");

    if (close) {
        close.addEventListener(
            "click",
            closeContentBuilder
        );
    }

    const modal =
        $("#content-builder-modal");

    const backdrop =
        $(".course-modal-backdrop", modal);

    if (backdrop) {

        backdrop.addEventListener(
            "click",
            closeContentBuilder
        );

    }

    const addModule =
        $("#add-module-button");

    if (addModule) {

        addModule.addEventListener(
            "click",
            () => openContentEditor(
                "module",
                null,
                null
            )
        );

    }

}


async function openContentBuilder(
    courseId
) {

    if (!client) return;

    const course =
        state.allCourses.find(
            item =>
                Number(item.id) ===
                Number(courseId)
        );

    if (!course) return;

    state.currentContentCourse =
        course;

    const title =
        $("#content-builder-title");

    if (title) {
        title.textContent =
            course.title || "Course";
    }

    openModal(
        $("#content-builder-modal")
    );

    await loadCourseStructure();

}


function closeContentBuilder() {

    closeModal(
        $("#content-builder-modal")
    );

    state.currentContentCourse = null;

    state.modules = [];
    state.lessons = [];
    state.sections = [];

    state.expandedModules.clear();
    state.expandedLessons.clear();

}


async function loadCourseStructure() {

    if (!client) return;

    const course =
        state.currentContentCourse;

    if (!course) return;

    const container =
        $("#content-builder-body");

    if (!container) return;

    container.innerHTML = `
        <div class="empty-state">
            Loading course structure...
        </div>
    `;

    try {

        const {
            data: modules,
            error: moduleError
        } = await client
            .from("modules")
            .select("*")
            .eq(
                "course_id",
                course.id
            )
            .order(
                "sort_order",
                { ascending: true }
            );

        if (moduleError) {
            throw moduleError;
        }

        state.modules =
            modules || [];

        const moduleIds =
            state.modules.map(
                module => module.id
            );

        if (moduleIds.length) {

            const {
                data: lessons,
                error: lessonError
            } = await client
                .from("lessons")
                .select("*")
                .in(
                    "module_id",
                    moduleIds
                )
                .order(
                    "sort_order",
                    { ascending: true }
                );

            if (lessonError) {
                throw lessonError;
            }

            state.lessons =
                lessons || [];

        } else {

            state.lessons = [];

        }

        const lessonIds =
            state.lessons.map(
                lesson => lesson.id
            );

        if (lessonIds.length) {

            const {
                data: sections,
                error: sectionError
            } = await client
                .from("lesson_sections")
                .select("*")
                .in(
                    "lesson_id",
                    lessonIds
                )
                .order(
                    "sort_order",
                    { ascending: true }
                );

            if (sectionError) {
                throw sectionError;
            }

            state.sections =
                sections || [];

        } else {

            state.sections = [];

        }

        renderContentBuilder();

    } catch (error) {

        console.error(
            "Load course structure error:",
            error
        );

        container.innerHTML = `
            <div class="content-empty">
                <strong>
                    Unable to load course content
                </strong>

                <span>
                    ${escapeHtml(
                        error.message ||
                        "Unknown error"
                    )}
                </span>
            </div>
        `;

    }

}


function renderContentBuilder() {

    const container =
        $("#content-builder-body");

    if (!container) return;

    if (!state.modules.length) {

        container.innerHTML = `
            <div class="content-empty">

                <strong>
                    No modules yet
                </strong>

                <span>
                    Start building this course by adding its first module.
                </span>

            </div>
        `;

        return;

    }

    container.innerHTML =
        state.modules
            .map(
                (module, index) =>
                    renderModule(
                        module,
                        index
                    )
            )
            .join("");

    bindContentBuilderActions();

}


function renderModule(
    module,
    moduleIndex
) {

    const lessons =
        state.lessons.filter(
            lesson =>
                Number(lesson.module_id) ===
                Number(module.id)
        );

    const expanded =
        state.expandedModules.has(
            Number(module.id)
        );

    return `
        <div
            class="content-module ${expanded ? "expanded" : ""}"
            data-module-id="${module.id}"
        >

            <div
                class="content-module-header"
                data-toggle-module="${module.id}"
            >

                <div class="content-module-main">

                    <div class="content-expand-icon">
                        ›
                    </div>

                    <div class="content-number">
                        ${moduleIndex + 1}
                    </div>

                    <div class="content-module-title">

                        <strong>
                            ${escapeHtml(
                                module.title ||
                                "Untitled Module"
                            )}
                        </strong>

                        <span>
                            ${lessons.length}
                            ${lessons.length === 1 ? "lesson" : "lessons"}
                            ·
                            ${escapeHtml(
                                module.status ||
                                "draft"
                            )}
                        </span>

                    </div>

                </div>


                <div
                    class="content-module-actions"
                    onclick="event.stopPropagation()"
                >

                    <button
                        type="button"
                        class="content-small-button"
                        data-content-action="module-up"
                        data-id="${module.id}"
                    >
                        ↑
                    </button>

                    <button
                        type="button"
                        class="content-small-button"
                        data-content-action="module-down"
                        data-id="${module.id}"
                    >
                        ↓
                    </button>

                    <button
                        type="button"
                        class="content-small-button"
                        data-content-action="edit-module"
                        data-id="${module.id}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="content-small-button danger"
                        data-content-action="delete-module"
                        data-id="${module.id}"
                    >
                        Delete
                    </button>

                    <button
                        type="button"
                        class="content-small-button accent"
                        data-content-action="add-lesson"
                        data-id="${module.id}"
                    >
                        + Lesson
                    </button>

                </div>

            </div>


            <div class="content-module-body">

                <div class="content-lessons-heading">

                    <div>
                        <strong>
                            Lessons
                        </strong>

                        <span>
                            ${lessons.length} total
                        </span>
                    </div>

                    <button
                        type="button"
                        class="content-small-button accent"
                        data-content-action="add-lesson"
                        data-id="${module.id}"
                    >
                        + Add Lesson
                    </button>

                </div>

                ${
                    lessons.length
                        ? lessons
                            .map(
                                (lesson, index) =>
                                    renderLesson(
                                        lesson,
                                        index
                                    )
                            )
                            .join("")
                        : `
                            <div class="content-empty">

                                <strong>
                                    No lessons in this module
                                </strong>

                                <span>
                                    Add a lesson to begin creating learning content.
                                </span>

                            </div>
                        `
                }

            </div>

        </div>
    `;

}


function renderLesson(
    lesson,
    lessonIndex
) {

    const sections =
        state.sections.filter(
            section =>
                Number(section.lesson_id) ===
                Number(lesson.id)
        );

    const expanded =
        state.expandedLessons.has(
            Number(lesson.id)
        );

    return `
        <div
            class="content-lesson ${expanded ? "expanded" : ""}"
            data-lesson-id="${lesson.id}"
        >

            <div
                class="content-lesson-header"
                data-toggle-lesson="${lesson.id}"
            >

                <div class="content-lesson-main">

                    <div class="content-expand-icon">
                        ›
                    </div>

                    <div class="content-lesson-number">
                        ${lessonIndex + 1}
                    </div>

                    <div class="content-lesson-title">

                        <strong>
                            ${escapeHtml(
                                lesson.title ||
                                "Untitled Lesson"
                            )}
                        </strong>

                        <span>
                            ${sections.length}
                            ${sections.length === 1 ? "section" : "sections"}
                            ${
                                lesson.duration_minutes
                                    ? ` · ${lesson.duration_minutes} min`
                                    : ""
                            }
                        </span>

                    </div>

                </div>


                <div
                    class="content-lesson-actions"
                    onclick="event.stopPropagation()"
                >

                    <button
                        type="button"
                        class="content-small-button"
                        data-content-action="lesson-up"
                        data-id="${lesson.id}"
                    >
                        ↑
                    </button>

                    <button
                        type="button"
                        class="content-small-button"
                        data-content-action="lesson-down"
                        data-id="${lesson.id}"
                    >
                        ↓
                    </button>

                    <button
                        type="button"
                        class="content-small-button"
                        data-content-action="edit-lesson"
                        data-id="${lesson.id}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="content-small-button danger"
                        data-content-action="delete-lesson"
                        data-id="${lesson.id}"
                    >
                        Delete
                    </button>

                    <button
                        type="button"
                        class="content-small-button accent"
                        data-content-action="add-section"
                        data-id="${lesson.id}"
                    >
                        + Section
                    </button>

                </div>

            </div>


            <div class="content-lesson-body">

                <div class="content-sections-heading">

                    <strong>
                        Learning Sections
                    </strong>

                    <button
                        type="button"
                        class="content-small-button accent"
                        data-content-action="add-section"
                        data-id="${lesson.id}"
                    >
                        + Add Section
                    </button>

                </div>

                ${
                    sections.length
                        ? sections
                            .map(
                                (section, index) =>
                                    renderSection(
                                        section,
                                        index
                                    )
                            )
                            .join("")
                        : `
                            <div class="content-empty">

                                <strong>
                                    No sections yet
                                </strong>

                                <span>
                                    Add the first learning section to this lesson.
                                </span>

                            </div>
                        `
                }

            </div>

        </div>
    `;

}


function renderSection(
    section,
    sectionIndex
) {

    const icons = {

        introduction: "I",
        vocabulary: "V",
        dialogue: "D",
        grammar: "G",
        listen: "L",
        practice: "P",
        recall: "R",
        speaking: "S",
        ai: "AI",
        test: "T",
        review: "↻"

    };

    return `
        <div class="content-section">

            <div class="content-section-main">

                <div class="content-section-icon">
                    ${icons[section.section_type] || "•"}
                </div>

                <div class="content-section-info">

                    <strong>
                        ${escapeHtml(
                            section.title ||
                            `Section ${sectionIndex + 1}`
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            section.section_type ||
                            "section"
                        )}
                    </span>

                </div>

            </div>


            <div class="content-section-actions">

                <button
                    type="button"
                    class="content-small-button"
                    data-content-action="section-up"
                    data-id="${section.id}"
                >
                    ↑
                </button>

                <button
                    type="button"
                    class="content-small-button"
                    data-content-action="section-down"
                    data-id="${section.id}"
                >
                    ↓
                </button>

                <button
                    type="button"
                    class="content-small-button"
                    data-content-action="edit-section"
                    data-id="${section.id}"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="content-small-button danger"
                    data-content-action="delete-section"
                    data-id="${section.id}"
                >
                    Delete
                </button>

            </div>

        </div>
    `;

}


function bindContentBuilderActions() {

    $$("[data-toggle-module]").forEach(element => {

        element.addEventListener(
            "click",
            () => {

                const id =
                    Number(
                        element.dataset.toggleModule
                    );

                if (
                    state.expandedModules.has(id)
                ) {

                    state.expandedModules.delete(id);

                } else {

                    state.expandedModules.add(id);

                }

                renderContentBuilder();

            }
        );

    });


    $$("[data-toggle-lesson]").forEach(element => {

        element.addEventListener(
            "click",
            () => {

                const id =
                    Number(
                        element.dataset.toggleLesson
                    );

                if (
                    state.expandedLessons.has(id)
                ) {

                    state.expandedLessons.delete(id);

                } else {

                    state.expandedLessons.add(id);

                }

                renderContentBuilder();

            }
        );

    });


    $$("[data-content-action]").forEach(button => {

        button.addEventListener(
            "click",
            async event => {

                event.stopPropagation();

                const action =
                    button.dataset.contentAction;

                const id =
                    Number(button.dataset.id);

                switch (action) {

                    case "edit-module":
                        openContentEditor(
                            "module",
                            id
                        );
                        break;

                    case "delete-module":
                        await deleteModule(id);
                        break;

                    case "add-lesson":
                        openContentEditor(
                            "lesson",
                            null,
                            id
                        );
                        break;

                    case "edit-lesson":
                        openContentEditor(
                            "lesson",
                            id
                        );
                        break;

                    case "delete-lesson":
                        await deleteLesson(id);
                        break;

                    case "add-section":
                        openContentEditor(
                            "section",
                            null,
                            id
                        );
                        break;

                    case "edit-section":
                        openContentEditor(
                            "section",
                            id
                        );
                        break;

                    case "delete-section":
                        await deleteSection(id);
                        break;

                    case "module-up":
                        await moveModule(id, -1);
                        break;

                    case "module-down":
                        await moveModule(id, 1);
                        break;

                    case "lesson-up":
                        await moveLesson(id, -1);
                        break;

                    case "lesson-down":
                        await moveLesson(id, 1);
                        break;

                    case "section-up":
                        await moveSection(id, -1);
                        break;

                    case "section-down":
                        await moveSection(id, 1);
                        break;

                }

            }
        );

    });

}


/* =========================================================
   CONTENT EDITOR
   ========================================================= */

function setupContentEditor() {

    const close =
        $("#content-editor-close");

    const cancel =
        $("#content-editor-cancel");

    const modal =
        $("#content-editor-modal");

    const backdrop =
        $(".course-modal-backdrop", modal);

    const form =
        $("#content-editor-form");

    if (close) {
        close.addEventListener(
            "click",
            closeContentEditor
        );
    }

    if (cancel) {
        cancel.addEventListener(
            "click",
            closeContentEditor
        );
    }

    if (backdrop) {
        backdrop.addEventListener(
            "click",
            closeContentEditor
        );
    }

    if (form) {
        form.addEventListener(
            "submit",
            saveContentEditor
        );
    }

}


async function openContentEditor(
    type,
    id = null,
    parentId = null
) {

    state.editingContentType =
        type;

    state.editingContentId =
        id
            ? Number(id)
            : null;

    state.editingParentId =
        parentId
            ? Number(parentId)
            : null;

    const modal =
        $("#content-editor-modal");

    const kicker =
        $("#content-editor-kicker");

    const title =
        $("#content-editor-title");

    const fields =
        $("#content-editor-fields");

    const error =
        $("#content-editor-error");

    if (!modal || !fields) return;

    if (error) {
        error.textContent = "";
    }

    let record = null;

    if (id) {

        if (type === "module") {

            record =
                state.modules.find(
                    item =>
                        Number(item.id) ===
                        Number(id)
                );

        }

        if (type === "lesson") {

            record =
                state.lessons.find(
                    item =>
                        Number(item.id) ===
                        Number(id)
                );

        }

        if (type === "section") {

            record =
                state.sections.find(
                    item =>
                        Number(item.id) ===
                        Number(id)
                );

        }

    }

    if (type === "module") {

        kicker.textContent =
            "Module";

        title.textContent =
            record
                ? "Edit Module"
                : "Add Module";

        fields.innerHTML =
            renderModuleEditor(record);

    }


    if (type === "lesson") {

        kicker.textContent =
            "Lesson";

        title.textContent =
            record
                ? "Edit Lesson"
                : "Add Lesson";

        fields.innerHTML =
            renderLessonEditor(record);

    }


    if (type === "section") {

        kicker.textContent =
            "Learning Section";

        title.textContent =
            record
                ? "Edit Section"
                : "Add Section";

        fields.innerHTML =
            renderSectionEditor(record);

        setupSectionEditor();

    }

    openModal(modal);

}


function closeContentEditor() {

    closeModal(
        $("#content-editor-modal")
    );

    state.editingContentType = null;
    state.editingContentId = null;
    state.editingParentId = null;

}


/* =========================================================
   MODULE EDITOR
   ========================================================= */

function renderModuleEditor(
    module
) {

    return `

        <div class="dynamic-field">

            <label for="editor-module-title">
                Module Title
            </label>

            <input
                id="editor-module-title"
                type="text"
                value="${escapeAttribute(
                    module?.title || ""
                )}"
                required
                placeholder="Module 1"
            >

        </div>


        <div class="dynamic-field">

            <label for="editor-module-description">
                Description
            </label>

            <textarea
                id="editor-module-description"
                placeholder="What will the learner achieve in this module?"
            >${escapeHtml(
                module?.description || ""
            )}</textarea>

        </div>


        <div class="dynamic-grid">

            <div class="dynamic-field">

                <label for="editor-module-status">
                    Status
                </label>

                <select id="editor-module-status">

                    <option
                        value="draft"
                        ${module?.status === "draft" ? "selected" : ""}
                    >
                        Draft
                    </option>

                    <option
                        value="published"
                        ${module?.status === "published" ? "selected" : ""}
                    >
                        Published
                    </option>

                </select>

            </div>


            <div class="dynamic-field">

                <label for="editor-module-sort">
                    Sort Order
                </label>

                <input
                    id="editor-module-sort"
                    type="number"
                    value="${module?.sort_order ?? nextSortOrder(
                        state.modules
                    )}"
                >

            </div>

        </div>

    `;

}


/* =========================================================
   LESSON EDITOR
   ========================================================= */

function renderLessonEditor(
    lesson
) {

    const defaultModule =
        lesson?.module_id ||
        state.editingParentId;

    return `

        <div class="dynamic-field">

            <label for="editor-lesson-title">
                Lesson Title
            </label>

            <input
                id="editor-lesson-title"
                type="text"
                value="${escapeAttribute(
                    lesson?.title || ""
                )}"
                required
                placeholder="Lesson 1"
            >

        </div>


        <div class="dynamic-field">

            <label for="editor-lesson-description">
                Description
            </label>

            <textarea
                id="editor-lesson-description"
                placeholder="Briefly describe the lesson."
            >${escapeHtml(
                lesson?.description || ""
            )}</textarea>

        </div>


        <div class="dynamic-grid">

            <div class="dynamic-field">

                <label for="editor-lesson-module">
                    Module
                </label>

                <select id="editor-lesson-module">

                    ${
                        state.modules
                            .map(
                                module => `
                                    <option
                                        value="${module.id}"
                                        ${
                                            Number(defaultModule) ===
                                            Number(module.id)
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${escapeHtml(
                                            module.title ||
                                            "Untitled Module"
                                        )}
                                    </option>
                                `
                            )
                            .join("")
                    }

                </select>

            </div>


            <div class="dynamic-field">

                <label for="editor-lesson-duration">
                    Duration (minutes)
                </label>

                <input
                    id="editor-lesson-duration"
                    type="number"
                    min="0"
                    value="${lesson?.duration_minutes ?? 25}"
                >

            </div>

        </div>


        <div class="dynamic-grid">

            <div class="dynamic-field">

                <label for="editor-lesson-status">
                    Status
                </label>

                <select id="editor-lesson-status">

                    <option
                        value="draft"
                        ${lesson?.status === "draft" ? "selected" : ""}
                    >
                        Draft
                    </option>

                    <option
                        value="published"
                        ${lesson?.status === "published" ? "selected" : ""}
                    >
                        Published
                    </option>

                </select>

            </div>


            <div class="dynamic-field">

                <label for="editor-lesson-sort">
                    Sort Order
                </label>

                <input
                    id="editor-lesson-sort"
                    type="number"
                    value="${lesson?.sort_order ?? nextSortOrder(
                        state.lessons.filter(
                            item =>
                                Number(item.module_id) ===
                                Number(defaultModule)
                        )
                    )}"
                >

            </div>

        </div>

    `;

}


/* =========================================================
   SECTION EDITOR
   ========================================================= */

function renderSectionEditor(
    section
) {

    const type =
        section?.section_type ||
        "introduction";

    return `

        <div class="dynamic-grid">

            <div class="dynamic-field">

                <label for="editor-section-type">
                    Section Type
                </label>

                <select id="editor-section-type">

                    ${sectionTypeOption(
                        "introduction",
                        "Introduction",
                        type
                    )}

                    ${sectionTypeOption(
                        "vocabulary",
                        "Vocabulary",
                        type
                    )}

                    ${sectionTypeOption(
                        "dialogue",
                        "Dialogue",
                        type
                    )}

                    ${sectionTypeOption(
                        "grammar",
                        "Grammar",
                        type
                    )}

                    ${sectionTypeOption(
                        "listen",
                        "Listen",
                        type
                    )}

                    ${sectionTypeOption(
                        "practice",
                        "Practice",
                        type
                    )}

                    ${sectionTypeOption(
                        "recall",
                        "Recall",
                        type
                    )}

                    ${sectionTypeOption(
                        "speaking",
                        "Speaking",
                        type
                    )}

                    ${sectionTypeOption(
                        "ai",
                        "AI",
                        type
                    )}

                    ${sectionTypeOption(
                        "test",
                        "Test",
                        type
                    )}

                    ${sectionTypeOption(
                        "review",
                        "Review",
                        type
                    )}

                </select>

            </div>


            <div class="dynamic-field">

                <label for="editor-section-sort">
                    Sort Order
                </label>

                <input
                    id="editor-section-sort"
                    type="number"
                    value="${section?.sort_order ?? nextSortOrder(
                        state.sections.filter(
                            item =>
                                Number(item.lesson_id) ===
                                Number(
                                    section?.lesson_id ||
                                    state.editingParentId
                                )
                        )
                    )}"
                >

            </div>

        </div>


        <div class="dynamic-field">

            <label for="editor-section-title">
                Section Title
            </label>

            <input
                id="editor-section-title"
                type="text"
                value="${escapeAttribute(
                    section?.title || ""
                )}"
                required
                placeholder="Introduction"
            >

        </div>


        <div class="dynamic-field">

            <label for="editor-section-description">
                Description
            </label>

            <textarea
                id="editor-section-description"
                placeholder="Optional instructions or description."
            >${escapeHtml(
                section?.description || ""
            )}</textarea>

        </div>


        <div id="section-specific-content"></div>

    `;

}


function sectionTypeOption(
    value,
    label,
    current
) {

    return `
        <option
            value="${value}"
            ${current === value ? "selected" : ""}
        >
            ${label}
        </option>
    `;

}


function setupSectionEditor() {

    const select =
        $("#editor-section-type");

    if (!select) return;

    select.addEventListener(
        "change",
        () => renderSectionSpecificFields(
            select.value,
            getEditingSection()
        )
    );

    renderSectionSpecificFields(
        select.value,
        getEditingSection()
    );

}


function getEditingSection() {

    if (
        state.editingContentType !==
        "section"
    ) {
        return null;
    }

    if (!state.editingContentId) {
        return null;
    }

    return state.sections.find(
        section =>
            Number(section.id) ===
            Number(
                state.editingContentId
            )
    ) || null;

}


/* =========================================================
   SECTION CONTENT TYPES
   ========================================================= */

function renderSectionSpecificFields(
    type,
    section
) {

    const container =
        $("#section-specific-content");

    if (!container) return;

    const content =
        section?.content &&
        typeof section.content === "object"
            ? section.content
            : {};

    switch (type) {

        case "introduction":
            container.innerHTML =
                renderIntroductionFields(
                    content
                );
            break;

        case "vocabulary":
            container.innerHTML =
                renderVocabularyFields(
                    content
                );
            setupVocabularyFields(
                content
            );
            break;

        case "dialogue":
            container.innerHTML =
                renderDialogueFields(
                    content
                );
            setupDialogueFields(
                content
            );
            break;

        case "grammar":
            container.innerHTML =
                renderGrammarFields(
                    content
                );
            break;

        case "listen":
            container.innerHTML =
                renderListenFields(
                    content
                );
            break;

        case "practice":
            container.innerHTML =
                renderPracticeFields(
                    content
                );
            setupPracticeFields(
                content
            );
            break;

        case "recall":
            container.innerHTML =
                renderRecallFields(
                    content
                );
            setupRecallFields(
                content
            );
            break;

        case "speaking":
            container.innerHTML =
                renderSpeakingFields(
                    content
                );
            break;

        case "ai":
            container.innerHTML =
                renderAIFields(
                    content
                );
            break;

        case "test":
            container.innerHTML =
                renderTestFields(
                    content
                );
            setupTestFields(
                content
            );
            break;

        case "review":
            container.innerHTML =
                renderReviewFields(
                    content
                );
            setupReviewFields(
                content
            );
            break;

        default:
            container.innerHTML = "";

    }

}


/* =========================================================
   INTRODUCTION
   ========================================================= */

function renderIntroductionFields(
    content
) {

    return `

        <div class="dynamic-field">

            <label for="section-text">
                Learning Text
            </label>

            <textarea
                id="section-text"
                rows="8"
                placeholder="Write the introduction or discovery content..."
            >${escapeHtml(
                content.text || ""
            )}</textarea>

        </div>


        <div class="dynamic-field">

            <label for="section-image-url">
                Image URL
            </label>

            <input
                id="section-image-url"
                type="url"
                value="${escapeAttribute(
                    content.image_url || ""
                )}"
                placeholder="https://..."
            >

        </div>


        <div class="dynamic-field">

            <label for="section-video-url">
                Video URL
            </label>

            <input
                id="section-video-url"
                type="url"
                value="${escapeAttribute(
                    content.video_url || ""
                )}"
                placeholder="https://..."
            >

        </div>

    `;

}


/* =========================================================
   VOCABULARY
   ========================================================= */

function renderVocabularyFields(
    content
) {

    const items =
        Array.isArray(content.items)
            ? content.items
            : [];

    return `

        <div class="dynamic-field">

            <label>
                Vocabulary Items
            </label>

            <div
                id="vocabulary-items"
                class="dynamic-list"
            >

                ${
                    items.length
                        ? items
                            .map(
                                (
                                    item,
                                    index
                                ) =>
                                    vocabularyItemHtml(
                                        item,
                                        index
                                    )
                            )
                            .join("")
                        : ""
                }

            </div>


            <button
                type="button"
                id="add-vocabulary-item"
                class="add-list-item-button"
            >
                + Add Vocabulary
            </button>

        </div>

    `;

}


function vocabularyItemHtml(
    item = {},
    index = 0
) {

    return `

        <div
            class="dynamic-list-item vocabulary-item"
            data-index="${index}"
        >

            <div class="dynamic-list-item-header">

                <strong>
                    Vocabulary ${index + 1}
                </strong>

                <button
                    type="button"
                    class="dynamic-list-remove"
                    data-remove-vocabulary
                >
                    ×
                </button>

            </div>


            <div class="dynamic-grid">

                <div class="dynamic-field">

                    <label>
                        Word
                    </label>

                    <input
                        data-vocabulary-word
                        type="text"
                        value="${escapeAttribute(
                            item.word || ""
                        )}"
                    >

                </div>


                <div class="dynamic-field">

                    <label>
                        Meaning
                    </label>

                    <input
                        data-vocabulary-meaning
                        type="text"
                        value="${escapeAttribute(
                            item.meaning || ""
                        )}"
                    >

                </div>

            </div>


            <div class="dynamic-field">

                <label>
                    Example
                </label>

                <input
                    data-vocabulary-example
                    type="text"
                    value="${escapeAttribute(
                        item.example || ""
                    )}"
                >

            </div>


            <div class="dynamic-grid">

                <div class="dynamic-field">

                    <label>
                        Audio URL
                    </label>

                    <input
                        data-vocabulary-audio
                        type="url"
                        value="${escapeAttribute(
                            item.audio_url || ""
                        )}"
                        placeholder="https://..."
                    >

                </div>


                <div class="dynamic-field">

                    <label>
                        Image URL
                    </label>

                    <input
                        data-vocabulary-image
                        type="url"
                        value="${escapeAttribute(
                            item.image_url || ""
                        )}"
                        placeholder="https://..."
                    >

                </div>

            </div>

        </div>

    `;

}


function setupVocabularyFields(
    content
) {

    const container =
        $("#vocabulary-items");

    const add =
        $("#add-vocabulary-item");

    if (!container || !add) return;

    let counter =
        container.children.length;

    add.addEventListener(
        "click",
        () => {

            container.insertAdjacentHTML(
                "beforeend",
                vocabularyItemHtml(
                    {},
                    counter++
                )
            );

        }
    );

    container.addEventListener(
        "click",
        event => {

            if (
                event.target.hasAttribute(
                    "data-remove-vocabulary"
                )
            ) {

                event.target
                    .closest(
                        ".vocabulary-item"
                    )
                    ?.remove();

                renumberList(
                    container,
                    "Vocabulary"
                );

            }

        }
    );

}


/* =========================================================
   DIALOGUE
   ========================================================= */

function renderDialogueFields(
    content
) {

    const lines =
        Array.isArray(content.lines)
            ? content.lines
            : [];

    return `

        <div class="dynamic-grid">

            <div class="dynamic-field">

                <label>
                    Audio URL
                </label>

                <input
                    id="dialogue-audio"
                    type="url"
                    value="${escapeAttribute(
                        content.audio_url || ""
                    )}"
                    placeholder="https://..."
                >

            </div>


            <div class="dynamic-field">

                <label>
                    Video URL
                </label>

                <input
                    id="dialogue-video"
                    type="url"
                    value="${escapeAttribute(
                        content.video_url || ""
                    )}"
                    placeholder="https://..."
                >

            </div>

        </div>


        <div class="dynamic-field">

            <label>
                Dialogue Lines
            </label>

            <div
                id="dialogue-lines"
                class="dynamic-list"
            >

                ${
                    lines
                        .map(
                            (
                                line,
                                index
                            ) =>
                                dialogueLineHtml(
                                    line,
                                    index
                                )
                        )
                        .join("")
                }

            </div>


            <button
                type="button"
                id="add-dialogue-line"
                class="add-list-item-button"
            >
                + Add Line
            </button>

        </div>

    `;

}


function dialogueLineHtml(
    line = {},
    index = 0
) {

    return `

        <div
            class="dynamic-list-item dialogue-line"
        >

            <div class="dynamic-list-item-header">

                <strong>
                    Line ${index + 1}
                </strong>

                <button
                    type="button"
                    class="dynamic-list-remove"
                    data-remove-dialogue
                >
                    ×
                </button>

            </div>


            <div class="dynamic-grid three">

                <div class="dynamic-field">

                    <label>
                        Speaker
                    </label>

                    <input
                        data-dialogue-speaker
                        type="text"
                        value="${escapeAttribute(
                            line.speaker || ""
                        )}"
                    >

                </div>


                <div class="dynamic-field">

                    <label>
                        Text
                    </label>

                    <input
                        data-dialogue-text
                        type="text"
                        value="${escapeAttribute(
                            line.text || ""
                        )}"
                    >

                </div>


                <div class="dynamic-field">

                    <label>
                        Translation
                    </label>

                    <input
                        data-dialogue-translation
                        type="text"
                        value="${escapeAttribute(
                            line.translation || ""
                        )}"
                    >

                </div>

            </div>

        </div>

    `;

}


function setupDialogueFields() {

    const container =
        $("#dialogue-lines");

    const add =
        $("#add-dialogue-line");

    if (!container || !add) return;

    add.addEventListener(
        "click",
        () => {

            container.insertAdjacentHTML(
                "beforeend",
                dialogueLineHtml(
                    {},
                    container.children.length
                )
            );

        }
    );

    container.addEventListener(
        "click",
        event => {

            if (
                event.target.hasAttribute(
                    "data-remove-dialogue"
                )
            ) {

                event.target
                    .closest(
                        ".dialogue-line"
                    )
                    ?.remove();

                renumberList(
                    container,
                    "Line"
                );

            }

        }
    );

}


/* =========================================================
   GRAMMAR
   ========================================================= */

function renderGrammarFields(
    content
) {

    const rules =
        Array.isArray(content.rules)
            ? content.rules
            : [];

    const examples =
        Array.isArray(content.examples)
            ? content.examples
            : [];

    return `

        <div class="dynamic-field">

            <label>
                Explanation
            </label>

            <textarea
                id="grammar-explanation"
                rows="7"
                placeholder="Explain the grammar point..."
            >${escapeHtml(
                content.explanation || ""
            )}</textarea>

        </div>


        <div class="dynamic-field">

            <label>
                Rules
            </label>

            <textarea
                id="grammar-rules"
                rows="5"
                placeholder="Write one rule per line..."
            >${escapeHtml(
                rules.join("\n")
            )}</textarea>

        </div>


        <div class="dynamic-field">

            <label>
                Examples
            </label>

            <textarea
                id="grammar-examples"
                rows="5"
                placeholder="Write one example per line..."
            >${escapeHtml(
                examples.join("\n")
            )}</textarea>

        </div>

    `;

}


/* =========================================================
   LISTEN
   ========================================================= */

function renderListenFields(
    content
) {

    return `

        <div class="dynamic-field">

            <label>
                Instructions
            </label>

            <textarea
                id="listen-instructions"
                rows="4"
            >${escapeHtml(
                content.instructions || ""
            )}</textarea>

        </div>


        <div class="dynamic-grid">

            <div class="dynamic-field">

                <label>
                    Audio URL
                </label>

                <input
                    id="listen-audio"
                    type="url"
                    value="${escapeAttribute(
                        content.audio_url || ""
                    )}"
                    placeholder="https://..."
                >

            </div>


            <div class="dynamic-field">

                <label>
                    Video URL
                </label>

                <input
                    id="listen-video"
                    type="url"
                    value="${escapeAttribute(
                        content.video_url || ""
                    )}"
                    placeholder="https://..."
                >

            </div>

        </div>


        <div class="dynamic-field">

            <label>
                Transcript
            </label>

            <textarea
                id="listen-transcript"
                rows="8"
            >${escapeHtml(
                content.transcript || ""
            )}</textarea>

        </div>

    `;

}


/* =========================================================
   PRACTICE
   ========================================================= */

function renderPracticeFields(
    content
) {

    const questions =
        Array.isArray(content.questions)
            ? content.questions
            : [];

    return `

        <div class="dynamic-field">

            <label>
                Instructions
            </label>

            <textarea
                id="practice-instructions"
                rows="4"
            >${escapeHtml(
                content.instructions || ""
            )}</textarea>

        </div>


        <div class="dynamic-field">

            <label>
                Questions
            </label>

            <div
                id="practice-questions"
                class="dynamic-list"
            >

                ${
                    questions
                        .map(
                            (
                                question,
                                index
                            ) =>
                                practiceQuestionHtml(
                                    question,
                                    index
                                )
                        )
                        .join("")
                }

            </div>


            <button
                type="button"
                id="add-practice-question"
                class="add-list-item-button"
            >
                + Add Question
            </button>

        </div>

    `;

}


function practiceQuestionHtml(
    question = {},
    index = 0
) {

    const options =
        Array.isArray(question.options)
            ? question.options
            : [];

    return `

        <div
            class="dynamic-list-item practice-question"
        >

            <div class="dynamic-list-item-header">

                <strong>
                    Question ${index + 1}
                </strong>

                <button
                    type="button"
                    class="dynamic-list-remove"
                    data-remove-practice
                >
                    ×
                </button>

            </div>


            <div class="dynamic-field">

                <label>
                    Question
                </label>

                <textarea
                    data-practice-question
                    rows="3"
                >${escapeHtml(
                    question.question || ""
                )}</textarea>

            </div>


            <div class="dynamic-grid">

                <div class="dynamic-field">

                    <label>
                        Question Type
                    </label>

                    <select data-practice-type>

                        <option
                            value="multiple_choice"
                            ${question.type === "multiple_choice" ? "selected" : ""}
                        >
                            Multiple Choice
                        </option>

                        <option
                            value="text"
                            ${question.type === "text" ? "selected" : ""}
                        >
                            Text
                        </option>

                        <option
                            value="true_false"
                            ${question.type === "true_false" ? "selected" : ""}
                        >
                            True / False
                        </option>

                    </select>

                </div>


                <div class="dynamic-field">

                    <label>
                        Correct Answer
                    </label>

                    <input
                        data-practice-answer
                        type="text"
                        value="${escapeAttribute(
                            question.answer || ""
                        )}"
                    >

                </div>

            </div>


            <div class="dynamic-field">

                <label>
                    Options
                </label>

                <input
                    data-practice-options
                    type="text"
                    value="${escapeAttribute(
                        options.join(" | ")
                    )}"
                    placeholder="Option A | Option B | Option C"
                >

                <small>
                    Separate multiple-choice options with |
                </small>

            </div>


            <div class="dynamic-field">

                <label>
                    Explanation
                </label>

                <textarea
                    data-practice-explanation
                    rows="3"
                >${escapeHtml(
                    question.explanation || ""
                )}</textarea>

            </div>

        </div>

    `;

}


function setupPracticeFields() {

    const container =
        $("#practice-questions");

    const add =
        $("#add-practice-question");

    if (!container || !add) return;

    add.addEventListener(
        "click",
        () => {

            container.insertAdjacentHTML(
                "beforeend",
                practiceQuestionHtml(
                    {},
                    container.children.length
                )
            );

        }
    );

    container.addEventListener(
        "click",
        event => {

            if (
                event.target.hasAttribute(
                    "data-remove-practice"
                )
            ) {

                event.target
                    .closest(
                        ".practice-question"
                    )
                    ?.remove();

                renumberList(
                    container,
                    "Question"
                );

            }

        }
    );

}


/* =========================================================
   RECALL
   ========================================================= */

function renderRecallFields(
    content
) {

    const items =
        Array.isArray(content.items)
            ? content.items
            : [];

    return `

        <div class="dynamic-field">

            <label>
                Instructions
            </label>

            <textarea
                id="recall-instructions"
                rows="4"
            >${escapeHtml(
                content.instructions || ""
            )}</textarea>

        </div>


        <div class="dynamic-field">

            <label>
                Recall Items
            </label>

            <div
                id="recall-items"
                class="dynamic-list"
            >

                ${
                    items
                        .map(
                            (
                                item,
                                index
                            ) =>
                                recallItemHtml(
                                    item,
                                    index
                                )
                        )
                        .join("")
                }

            </div>


            <button
                type="button"
                id="add-recall-item"
                class="add-list-item-button"
            >
                + Add Recall Item
            </button>

        </div>

    `;

}


function recallItemHtml(
    item = {},
    index = 0
) {

    return `

        <div
            class="dynamic-list-item recall-item"
        >

            <div class="dynamic-list-item-header">

                <strong>
                    Recall ${index + 1}
                </strong>

                <button
                    type="button"
                    class="dynamic-list-remove"
                    data-remove-recall
                >
                    ×
                </button>

            </div>


            <div class="dynamic-grid">

                <div class="dynamic-field">

                    <label>
                        Prompt
                    </label>

                    <textarea
                        data-recall-prompt
                        rows="3"
                    >${escapeHtml(
                        item.prompt || ""
                    )}</textarea>

                </div>


                <div class="dynamic-field">

                    <label>
                        Answer
                    </label>

                    <textarea
                        data-recall-answer
                        rows="3"
                    >${escapeHtml(
                        item.answer || ""
                    )}</textarea>

                </div>

            </div>

        </div>

    `;

}


function setupRecallFields() {

    const container =
        $("#recall-items");

    const add =
        $("#add-recall-item");

    if (!container || !add) return;

    add.addEventListener(
        "click",
        () => {

            container.insertAdjacentHTML(
                "beforeend",
                recallItemHtml(
                    {},
                    container.children.length
                )
            );

        }
    );

    container.addEventListener(
        "click",
        event => {

            if (
                event.target.hasAttribute(
                    "data-remove-recall"
                )
            ) {

                event.target
                    .closest(
                        ".recall-item"
                    )
                    ?.remove();

                renumberList(
                    container,
                    "Recall"
                );

            }

        }
    );

}


/* =========================================================
   SPEAKING
   ========================================================= */

function renderSpeakingFields(
    content
) {

    return `

        <div class="dynamic-field">

            <label>
                Instructions
            </label>

            <textarea
                id="speaking-instructions"
                rows="4"
            >${escapeHtml(
                content.instructions || ""
            )}</textarea>

        </div>


        <div class="dynamic-field">

            <label>
                Speaking Prompt
            </label>

            <textarea
                id="speaking-prompt"
                rows="5"
                placeholder="Ask the learner to speak about..."
            >${escapeHtml(
                content.prompt || ""
            )}</textarea>

        </div>


        <div class="dynamic-field">

            <label>
                Sample Answer
            </label>

            <textarea
                id="speaking-sample"
                rows="5"
            >${escapeHtml(
                content.sample_answer || ""
            )}</textarea>

        </div>


        <div class="dynamic-field">

            <label>
                Reference Audio URL
            </label>

            <input
                id="speaking-audio"
                type="url"
                value="${escapeAttribute(
                    content.audio_url || ""
                )}"
                placeholder="https://..."
            >

        </div>

    `;

}


/* =========================================================
   AI
   ========================================================= */

function renderAIFields(
    content
) {

    const config =
        content.config &&
        typeof content.config === "object"
            ? content.config
            : {};

    return `

        <div class="dynamic-field">

            <label>
                AI Instructions
            </label>

            <textarea
                id="ai-instructions"
                rows="5"
                placeholder="Explain what the learner should do..."
            >${escapeHtml(
                content.instructions || ""
            )}</textarea>

        </div>


        <div class="dynamic-field">

            <label>
                AI Prompt
            </label>

            <textarea
                id="ai-prompt"
                rows="6"
                placeholder="Define the AI activity..."
            >${escapeHtml(
                content.prompt || ""
            )}</textarea>

        </div>


        <div class="dynamic-grid">

            <div class="dynamic-field">

                <label>
                    Learning Objective
                </label>

                <input
                    id="ai-objective"
                    type="text"
                    value="${escapeAttribute(
                        content.objective || ""
                    )}"
                    placeholder="What should the learner demonstrate?"
                >

            </div>


            <div class="dynamic-field">

                <label>
                    Minimum Score
                </label>

                <input
                    id="ai-min-score"
                    type="number"
                    min="0"
                    max="100"
                    value="${content.min_score ?? ""}"
                    placeholder="Optional"
                >

            </div>

        </div>


        <div class="dynamic-grid">

            <div class="dynamic-field">

                <label>
                    AI Activity Type
                </label>

                <select id="ai-activity-type">

                    <option
                        value="conversation"
                        ${config.activity_type === "conversation" ? "selected" : ""}
                    >
                        Conversation
                    </option>

                    <option
                        value="speaking"
                        ${config.activity_type === "speaking" ? "selected" : ""}
                    >
                        Speaking
                    </option>

                    <option
                        value="roleplay"
                        ${config.activity_type === "roleplay" ? "selected" : ""}
                    >
                        Role Play
                    </option>

                    <option
                        value="feedback"
                        ${config.activity_type === "feedback" ? "selected" : ""}
                    >
                        Feedback
                    </option>

                </select>

            </div>


            <div class="dynamic-field">

                <label>
                    Difficulty
                </label>

                <select id="ai-difficulty">

                    <option
                        value="standard"
                        ${config.difficulty === "standard" ? "selected" : ""}
                    >
                        Standard
                    </option>

                    <option
                        value="guided"
                        ${config.difficulty === "guided" ? "selected" : ""}
                    >
                        Guided
                    </option>

                    <option
                        value="advanced"
                        ${config.difficulty === "advanced" ? "selected" : ""}
                    >
                        Advanced
                    </option>

                </select>

            </div>

        </div>

    `;

}


/* =========================================================
   TEST
   ========================================================= */

function renderTestFields(
    content
) {

    const questions =
        Array.isArray(content.questions)
            ? content.questions
            : [];

    return `

        <div class="dynamic-field">

            <label>
                Instructions
            </label>

            <textarea
                id="test-instructions"
                rows="4"
            >${escapeHtml(
                content.instructions || ""
            )}</textarea>

        </div>


        <div class="dynamic-field">

            <label>
                Test Questions
            </label>

            <div
                id="test-questions"
                class="dynamic-list"
            >

                ${
                    questions
                        .map(
                            (
                                question,
                                index
                            ) =>
                                testQuestionHtml(
                                    question,
                                    index
                                )
                        )
                        .join("")
                }

            </div>


            <button
                type="button"
                id="add-test-question"
                class="add-list-item-button"
            >
                + Add Test Question
            </button>

        </div>

    `;

}


function testQuestionHtml(
    question = {},
    index = 0
) {

    const options =
        Array.isArray(question.options)
            ? question.options
            : [];

    return `

        <div
            class="dynamic-list-item test-question"
        >

            <div class="dynamic-list-item-header">

                <strong>
                    Question ${index + 1}
                </strong>

                <button
                    type="button"
                    class="dynamic-list-remove"
                    data-remove-test
                >
                    ×
                </button>

            </div>


            <div class="dynamic-field">

                <label>
                    Question
                </label>

                <textarea
                    data-test-question
                    rows="3"
                >${escapeHtml(
                    question.question || ""
                )}</textarea>

            </div>


            <div class="dynamic-grid three">

                <div class="dynamic-field">

                    <label>
                        Type
                    </label>

                    <select data-test-type>

                        <option
                            value="multiple_choice"
                            ${question.type === "multiple_choice" ? "selected" : ""}
                        >
                            Multiple Choice
                        </option>

                        <option
                            value="text"
                            ${question.type === "text" ? "selected" : ""}
                        >
                            Text
                        </option>

                        <option
                            value="true_false"
                            ${question.type === "true_false" ? "selected" : ""}
                        >
                            True / False
                        </option>

                    </select>

                </div>


                <div class="dynamic-field">

                    <label>
                        Answer
                    </label>

                    <input
                        data-test-answer
                        type="text"
                        value="${escapeAttribute(
                            question.answer || ""
                        )}"
                    >

                </div>


                <div class="dynamic-field">

                    <label>
                        Points
                    </label>

                    <input
                        data-test-points
                        type="number"
                        min="0"
                        value="${question.points ?? 1}"
                    >

                </div>

            </div>


            <div class="dynamic-field">

                <label>
                    Options
                </label>

                <input
                    data-test-options
                    type="text"
                    value="${escapeAttribute(
                        options.join(" | ")
                    )}"
                    placeholder="Option A | Option B | Option C"
                >

            </div>

        </div>

    `;

}


function setupTestFields() {

    const container =
        $("#test-questions");

    const add =
        $("#add-test-question");

    if (!container || !add) return;

    add.addEventListener(
        "click",
        () => {

            container.insertAdjacentHTML(
                "beforeend",
                testQuestionHtml(
                    {},
                    container.children.length
                )
            );

        }
    );

    container.addEventListener(
        "click",
        event => {

            if (
                event.target.hasAttribute(
                    "data-remove-test"
                )
            ) {

                event.target
                    .closest(
                        ".test-question"
                    )
                    ?.remove();

                renumberList(
                    container,
                    "Question"
                );

            }

        }
    );

}


/* =========================================================
   REVIEW
   ========================================================= */

function renderReviewFields(
    content
) {

    const items =
        Array.isArray(content.items)
            ? content.items
            : [];

    return `

        <div class="dynamic-field">

            <label>
                Review Instructions
            </label>

            <textarea
                id="review-instructions"
                rows="5"
            >${escapeHtml(
                content.instructions || ""
            )}</textarea>

        </div>


        <div class="dynamic-field">

            <label>
                Review Items
            </label>

            <textarea
                id="review-items"
                rows="8"
                placeholder="Write one review item per line..."
            >${escapeHtml(
                items.join("\n")
            )}</textarea>

        </div>

    `;

}


function setupReviewFields() {
    /*
       Review uses a simple multiline editor,
       so no dynamic setup is required.
    */


/* =========================================================
   SAVE CONTENT
   ========================================================= */

async function saveContentEditor(
    event
) {

    event.preventDefault();

    if (!client) return;

    const errorElement =
        $("#content-editor-error");

    if (errorElement) {
        errorElement.textContent = "";
    }

    try {

        const type =
            state.editingContentType;

        if (type === "module") {

            await saveModule();

        }

        if (type === "lesson") {

            await saveLesson();

        }

        if (type === "section") {

            await saveSection();

        }

        closeContentEditor();

        await loadCourseStructure();

        showToast(
            "Content saved successfully."
        );

    } catch (error) {

        console.error(
            "Save content error:",
            error
        );

        if (errorElement) {

            errorElement.textContent =
                error.message ||
                "Unable to save content.";

        }

    }

}


/* =========================================================
   SAVE MODULE
   ========================================================= */

async function saveModule() {

    const title =
        $("#editor-module-title")
            .value
            .trim();

    if (!title) {
        throw new Error(
            "Module title is required."
        );
    }

    const description =
        $("#editor-module-description")
            .value
            .trim();

    const status =
        $("#editor-module-status")
            .value;

    const sortOrder =
        Number(
            $("#editor-module-sort")
                .value || 0
        );

    const payload = {

        course_id:
            state.currentContentCourse.id,

        title,

        description,

        status,

        sort_order:
            sortOrder

    };

    if (state.editingContentId) {

        const {
            error
        } = await client
            .from("modules")
            .update(payload)
            .eq(
                "id",
                state.editingContentId
            );

        if (error) throw error;

    } else {

        const {
            error
        } = await client
            .from("modules")
            .insert(payload);

        if (error) throw error;

    }

}


/* =========================================================
   SAVE LESSON
   ========================================================= */

async function saveLesson() {

    const title =
        $("#editor-lesson-title")
            .value
            .trim();

    if (!title) {
        throw new Error(
            "Lesson title is required."
        );
    }

    const moduleId =
        Number(
            $("#editor-lesson-module")
                .value
        );

    if (!moduleId) {
        throw new Error(
            "A module is required."
        );
    }

    const payload = {

        module_id:
            moduleId,

        title,

        description:
            $("#editor-lesson-description")
                .value
                .trim(),

        duration_minutes:
            Number(
                $("#editor-lesson-duration")
                    .value || 0
            ),

        status:
            $("#editor-lesson-status")
                .value,

        sort_order:
            Number(
                $("#editor-lesson-sort")
                    .value || 0
            )

    };

    if (state.editingContentId) {

        const {
            error
        } = await client
            .from("lessons")
            .update(payload)
            .eq(
                "id",
                state.editingContentId
            );

        if (error) throw error;

    } else {

        const {
            error
        } = await client
            .from("lessons")
            .insert(payload);

        if (error) throw error;

    }

}


/* =========================================================
   SAVE SECTION
   ========================================================= */

async function saveSection() {

    const lessonId =
        state.editingContentId
            ? getEditingSection()?.lesson_id
            : state.editingParentId;

    if (!lessonId) {
        throw new Error(
            "A lesson is required."
        );
    }

    const type =
        $("#editor-section-type")
            .value;

    const title =
        $("#editor-section-title")
            .value
            .trim();

    if (!title) {
        throw new Error(
            "Section title is required."
        );
    }

    const content =
        collectSectionContent(type);

    const payload = {

        lesson_id:
            Number(lessonId),

        section_type:
            type,

        title,

        description:
            $("#editor-section-description")
                .value
                .trim(),

        sort_order:
            Number(
                $("#editor-section-sort")
                    .value || 0
            ),

        content

    };

    if (state.editingContentId) {

        const {
            error
        } = await client
            .from("lesson_sections")
            .update(payload)
            .eq(
                "id",
                state.editingContentId
            );

        if (error) throw error;

    } else {

        const {
            error
        } = await client
            .from("lesson_sections")
            .insert(payload);

        if (error) throw error;

    }

}


/* =========================================================
   COLLECT SECTION CONTENT
   ========================================================= */

function collectSectionContent(
    type
) {

    switch (type) {

        case "introduction":

            return {

                text:
                    $("#section-text")?.value ||
                    "",

                image_url:
                    $("#section-image-url")?.value ||
                    "",

                video_url:
                    $("#section-video-url")?.value ||
                    ""

            };


        case "vocabulary":

            return {

                items:
                    $$(".vocabulary-item")
                        .map(item => ({

                            word:
                                $(
                                    "[data-vocabulary-word]",
                                    item
                                )?.value || "",

                            meaning:
                                $(
                                    "[data-vocabulary-meaning]",
                                    item
                                )?.value || "",

                            example:
                                $(
                                    "[data-vocabulary-example]",
                                    item
                                )?.value || "",

                            audio_url:
                                $(
                                    "[data-vocabulary-audio]",
                                    item
                                )?.value || "",

                            image_url:
                                $(
                                    "[data-vocabulary-image]",
                                    item
                                )?.value || ""

                        }))

            };


        case "dialogue":

            return {

                audio_url:
                    $("#dialogue-audio")?.value ||
                    "",

                video_url:
                    $("#dialogue-video")?.value ||
                    "",

                lines:
                    $$(".dialogue-line")
                        .map(line => ({

                            speaker:
                                $(
                                    "[data-dialogue-speaker]",
                                    line
                                )?.value || "",

                            text:
                                $(
                                    "[data-dialogue-text]",
                                    line
                                )?.value || "",

                            translation:
                                $(
                                    "[data-dialogue-translation]",
                                    line
                                )?.value || ""

                        }))

            };


        case "grammar":

            return {

                explanation:
                    $("#grammar-explanation")?.value ||
                    "",

                rules:
                    splitLines(
                        $("#grammar-rules")?.value
                    ),

                examples:
                    splitLines(
                        $("#grammar-examples")?.value
                    )

            };


        case "listen":

            return {

                instructions:
                    $("#listen-instructions")?.value ||
                    "",

                audio_url:
                    $("#listen-audio")?.value ||
                    "",

                video_url:
                    $("#listen-video")?.value ||
                    "",

                transcript:
                    $("#listen-transcript")?.value ||
                    ""

            };


        case "practice":

            return {

                instructions:
                    $("#practice-instructions")?.value ||
                    "",

                questions:
                    $$(".practice-question")
                        .map(question => ({

                            question:
                                $(
                                    "[data-practice-question]",
                                    question
                                )?.value || "",

                            type:
                                $(
                                    "[data-practice-type]",
                                    question
                                )?.value ||
                                "multiple_choice",

                            options:
                                splitPipe(
                                    $(
                                        "[data-practice-options]",
                                        question
                                    )?.value
                                ),

                            answer:
                                $(
                                    "[data-practice-answer]",
                                    question
                                )?.value || "",

                            explanation:
                                $(
                                    "[data-practice-explanation]",
                                    question
                                )?.value || ""

                        }))

            };


        case "recall":

            return {

                instructions:
                    $("#recall-instructions")?.value ||
                    "",

                items:
                    $$(".recall-item")
                        .map(item => ({

                            prompt:
                                $(
                                    "[data-recall-prompt]",
                                    item
                                )?.value || "",

                            answer:
                                $(
                                    "[data-recall-answer]",
                                    item
                                )?.value || ""

                        }))

            };


        case "speaking":

            return {

                instructions:
                    $("#speaking-instructions")?.value ||
                    "",

                prompt:
                    $("#speaking-prompt")?.value ||
                    "",

                sample_answer:
                    $("#speaking-sample")?.value ||
                    "",

                audio_url:
                    $("#speaking-audio")?.value ||
                    ""

            };


        case "ai":

            return {

                instructions:
                    $("#ai-instructions")?.value ||
                    "",

                prompt:
                    $("#ai-prompt")?.value ||
                    "",

                objective:
                    $("#ai-objective")?.value ||
                    "",

                min_score:
                    $("#ai-min-score")?.value
                        ? Number(
                            $("#ai-min-score").value
                        )
                        : null,

                config: {

                    activity_type:
                        $("#ai-activity-type")?.value ||
                        "conversation",

                    difficulty:
                        $("#ai-difficulty")?.value ||
                        "standard"

                }

            };


        case "test":

            return {

                instructions:
                    $("#test-instructions")?.value ||
                    "",

                questions:
                    $$(".test-question")
                        .map(question => ({

                            question:
                                $(
                                    "[data-test-question]",
                                    question
                                )?.value || "",

                            type:
                                $(
                                    "[data-test-type]",
                                    question
                                )?.value ||
                                "multiple_choice",

                            options:
                                splitPipe(
                                    $(
                                        "[data-test-options]",
                                        question
                                    )?.value
                                ),

                            answer:
                                $(
                                    "[data-test-answer]",
                                    question
                                )?.value || "",

                            points:
                                Number(
                                    $(
                                        "[data-test-points]",
                                        question
                                    )?.value || 1
                                )

                        }))

            };


        case "review":

            return {

                instructions:
                    $("#review-instructions")?.value ||
                    "",

                items:
                    splitLines(
                        $("#review-items")?.value
                    )

            };


        default:

            return {};

    }

}


/* =========================================================
   DELETE MODULE
   ========================================================= */

async function deleteModule(
    moduleId
) {

    const module =
        state.modules.find(
            item =>
                Number(item.id) ===
                Number(moduleId)
        );

    if (!module) return;

    if (
        !window.confirm(
            `Delete "${module.title}" and all its lessons and sections?`
        )
    ) {
        return;
    }

    try {

        const lessons =
            state.lessons.filter(
                lesson =>
                    Number(lesson.module_id) ===
                    Number(moduleId)
            );

        for (const lesson of lessons) {

            await deleteLessonData(
                lesson.id
            );

        }

        const {
            error
        } = await client
            .from("modules")
            .delete()
            .eq(
                "id",
                moduleId
            );

        if (error) throw error;

        state.expandedModules.delete(
            Number(moduleId)
        );

        await loadCourseStructure();

        await loadDashboard();

        showToast(
            "Module deleted."
        );

    } catch (error) {

        console.error(
            "Delete module error:",
            error
        );

        showToast(
            error.message ||
            "Unable to delete module.",
            true
        );

    }

}


/* =========================================================
   DELETE LESSON
   ========================================================= */

async function deleteLesson(
    lessonId
) {

    const lesson =
        state.lessons.find(
            item =>
                Number(item.id) ===
                Number(lessonId)
        );

    if (!lesson) return;

    if (
        !window.confirm(
            `Delete "${lesson.title}" and all its sections?`
        )
    ) {
        return;
    }

    try {

        await deleteLessonData(
            lessonId
        );

        state.expandedLessons.delete(
            Number(lessonId)
        );

        await loadCourseStructure();

        await loadDashboard();

        showToast(
            "Lesson deleted."
        );

    } catch (error) {

        console.error(
            "Delete lesson error:",
            error
        );

        showToast(
            error.message ||
            "Unable to delete lesson.",
            true
        );

    }

}


async function deleteLessonData(
    lessonId
) {

    const {
        error: sectionError
    } = await client
        .from("lesson_sections")
        .delete()
        .eq(
            "lesson_id",
            lessonId
        );

    if (sectionError) {
        throw sectionError;
    }

    const {
        error: lessonError
    } = await client
        .from("lessons")
        .delete()
        .eq(
            "id",
            lessonId
        );

    if (lessonError) {
        throw lessonError;
    }

}


/* =========================================================
   DELETE SECTION
   ========================================================= */

async function deleteSection(
    sectionId
) {

    const section =
        state.sections.find(
            item =>
                Number(item.id) ===
                Number(sectionId)
        );

    if (!section) return;

    if (
        !window.confirm(
            `Delete "${section.title}"?`
        )
    ) {
        return;
    }

    try {

        const {
            error
        } = await client
            .from("lesson_sections")
            .delete()
            .eq(
                "id",
                sectionId
            );

        if (error) throw error;

        await loadCourseStructure();

        showToast(
            "Section deleted."
        );

    } catch (error) {

        console.error(
            "Delete section error:",
            error
        );

        showToast(
            error.message ||
            "Unable to delete section.",
            true
        );

    }

}


/* =========================================================
   REORDER
   ========================================================= */

async function moveModule(
    moduleId,
    direction
) {

    const modules =
        [...state.modules];

    const index =
        modules.findIndex(
            item =>
                Number(item.id) ===
                Number(moduleId)
        );

    const targetIndex =
        index + direction;

    if (
        index < 0 ||
        targetIndex < 0 ||
        targetIndex >= modules.length
    ) {
        return;
    }

    const current =
        modules[index];

    const target =
        modules[targetIndex];

    await swapSortOrder(
        "modules",
        current,
        target
    );

}


async function moveLesson(
    lessonId,
    direction
) {

    const lesson =
        state.lessons.find(
            item =>
                Number(item.id) ===
                Number(lessonId)
        );

    if (!lesson) return;

    const lessons =
        state.lessons
            .filter(
                item =>
                    Number(item.module_id) ===
                    Number(lesson.module_id)
            )
            .sort(
                sortByOrder
            );

    const index =
        lessons.findIndex(
            item =>
                Number(item.id) ===
                Number(lessonId)
        );

    const targetIndex =
        index + direction;

    if (
        index < 0 ||
        targetIndex < 0 ||
        targetIndex >= lessons.length
    ) {
        return;
    }

    await swapSortOrder(
        "lessons",
        lessons[index],
        lessons[targetIndex]
    );

}


async function moveSection(
    sectionId,
    direction
) {

    const section =
        state.sections.find(
            item =>
                Number(item.id) ===
                Number(sectionId)
        );

    if (!section) return;

    const sections =
        state.sections
            .filter(
                item =>
                    Number(item.lesson_id) ===
                    Number(section.lesson_id)
            )
            .sort(
                sortByOrder
            );

    const index =
        sections.findIndex(
            item =>
                Number(item.id) ===
                Number(sectionId)
        );

    const targetIndex =
        index + direction;

    if (
        index < 0 ||
        targetIndex < 0 ||
        targetIndex >= sections.length
    ) {
        return;
    }

    await swapSortOrder(
        "lesson_sections",
        sections[index],
        sections[targetIndex]
    );

}


async function swapSortOrder(
    table,
    first,
    second
) {

    try {

        const firstOrder =
            Number(first.sort_order || 0);

        const secondOrder =
            Number(second.sort_order || 0);

        const temporary =
            -999999;

        const {
            error: firstTempError
        } = await client
            .from(table)
            .update({
                sort_order:
                    temporary
            })
            .eq(
                "id",
                first.id
            );

        if (firstTempError) {
            throw firstTempError;
        }

        const {
            error: secondError
        } = await client
            .from(table)
            .update({
                sort_order:
                    firstOrder
            })
            .eq(
                "id",
                second.id
            );

        if (secondError) {
            throw secondError;
        }

        const {
            error: firstError
        } = await client
            .from(table)
            .update({
                sort_order:
                    secondOrder
            })
            .eq(
                "id",
                first.id
            );

        if (firstError) {
            throw firstError;
        }

        await loadCourseStructure();

    } catch (error) {

        console.error(
            "Reorder error:",
            error
        );

        showToast(
            error.message ||
            "Unable to reorder content.",
            true
        );

    }

}


/* =========================================================
   CAROUSEL
   ========================================================= */

function setupCarouselControls() {

    const create =
        $("#create-carousel-button");

    if (create) {

        create.addEventListener(
            "click",
            () => openCarouselModal()
        );

    }

    const search =
        $("#carousel-search");

    const status =
        $("#carousel-status-filter");

    if (search) {
        search.addEventListener(
            "input",
            renderCarouselItems
        );
    }

    if (status) {
        status.addEventListener(
            "change",
            renderCarouselItems
        );
    }

}


async function loadCarouselItems() {

    const container =
        $("#carousel-list");

    if (!container || !client) return;

    try {

        const {
            data,
            error
        } = await client
            .from("carousel_items")
            .select(`
                id,
                title,
                description,
                image_url,
                area,
                status,
                start_date,
                end_date,
                sort_order,
                created_at
            `)
            .order(
                "sort_order",
                { ascending: true }
            )
            .order(
                "created_at",
                { ascending: false }
            );

        if (error) throw error;

        state.allCarouselItems =
            data || [];

        renderCarouselItems();

    } catch (error) {

        console.error(
            "Load carousel error:",
            error
        );

        container.innerHTML = `
            <div class="empty-state">
                Unable to load promotions.
            </div>
        `;

    }

}


function renderCarouselItems() {

    const container =
        $("#carousel-list");

    if (!container) return;

    const search =
        ($("#carousel-search")?.value || "")
            .trim()
            .toLowerCase();

    const status =
        $("#carousel-status-filter")?.value ||
        "all";

    let items =
        [...state.allCarouselItems];

    if (search) {

        items =
            items.filter(item => {

                const text = [
                    item.title,
                    item.description,
                    item.area
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return text.includes(search);

            });

    }

    if (status !== "all") {

        items =
            items.filter(
                item =>
                    item.status === status
            );

    }

    if (!items.length) {

        container.innerHTML = `
            <div class="empty-state">
                No promotions found.
            </div>
        `;

        return;

    }

    container.innerHTML =
        items.map(
            renderCarouselCard
        ).join("");

    bindCarouselActions();

}


function renderCarouselCard(item) {

    return `
        <div
            class="course-list-item"
            data-carousel-id="${item.id}"
        >

            <div class="course-list-main">

                ${
                    item.image_url
                        ? `
                            <img
                                src="${escapeAttribute(item.image_url)}"
                                alt=""
                                class="course-list-image"
                            >
                          `
                        : `
                            <div class="course-list-image-placeholder">
                                E
                            </div>
                          `
                }

                <div class="course-list-info">

                    <strong>
                        ${escapeHtml(
                            item.title ||
                            "Untitled promotion"
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            item.area ||
                            "Homepage"
                        )}
                    </span>

                </div>

            </div>


            <div class="course-list-meta">

                <span
                    class="content-status ${
                        item.status === "published"
                            ? "published"
                            : "draft"
                    }"
                >
                    ${escapeHtml(
                        item.status ||
                        "draft"
                    )}
                </span>

            </div>


            <div class="course-actions">

                <button
                    type="button"
                    class="course-action-button"
                    data-carousel-action="edit"
                    data-id="${item.id}"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="course-action-button"
                    data-carousel-action="${
                        item.status === "published"
                            ? "unpublish"
                            : "publish"
                    }"
                    data-id="${item.id}"
                >
                    ${
                        item.status === "published"
                            ? "Unpublish"
                            : "Publish"
                    }
                </button>

                <button
                    type="button"
                    class="course-action-button"
                    data-carousel-action="delete"
                    data-id="${item.id}"
                >
                    Delete
                </button>

            </div>

        </div>
    `;

}


function bindCarouselActions() {

    $$("[data-carousel-action]").forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    const action =
                        button.dataset.carouselAction;

                    const id =
                        Number(
                            button.dataset.id
                        );

                    if (action === "edit") {

                        openCarouselModal(id);

                    }

                    if (
                        action === "publish"
                    ) {

                        await updateCarouselStatus(
                            id,
                            "published"
                        );

                    }

                    if (
                        action === "unpublish"
                    ) {

                        await updateCarouselStatus(
                            id,
                            "draft"
                        );

                    }

                    if (
                        action === "delete"
                    ) {

                        await deleteCarouselItem(
                            id
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   CAROUSEL MODAL
   ========================================================= */

function setupCarouselModal() {

    const modal =
        $("#carousel-modal");

    const close =
        $("#carousel-modal-close");

    const cancel =
        $("#carousel-cancel-button");

    const backdrop =
        $(".course-modal-backdrop", modal);

    const form =
        $("#carousel-form");

    if (close) {
        close.addEventListener(
            "click",
            closeCarouselModal
        );
    }

    if (cancel) {
        cancel.addEventListener(
            "click",
            closeCarouselModal
        );
    }

    if (backdrop) {
        backdrop.addEventListener(
            "click",
            closeCarouselModal
        );
    }

    if (form) {
        form.addEventListener(
            "submit",
            saveCarouselItem
        );
    }

}


function openCarouselModal(
    id = null
) {

    const modal =
        $("#carousel-modal");

    const title =
        $("#carousel-modal-title");

    const item =
        id
            ? state.allCarouselItems.find(
                record =>
                    Number(record.id) ===
                    Number(id)
            )
            : null;

    state.editingCarouselItemId =
        id
            ? Number(id)
            : null;

    if (!item) {

        title.textContent =
            "Create Promotion";

        $("#carousel-title").value = "";
        $("#carousel-description").value = "";
        $("#carousel-area").value = "Homepage";
        $("#carousel-image").value = "";
        $("#carousel-image-url").value = "";
        $("#carousel-status").value = "draft";
        $("#carousel-sort-order").value = "0";
        $("#carousel-start-date").value = "";
        $("#carousel-end-date").value = "";

    } else {

        title.textContent =
            "Edit Promotion";

        $("#carousel-title").value =
            item.title || "";

        $("#carousel-description").value =
            item.description || "";

        $("#carousel-area").value =
            item.area || "";

        $("#carousel-image").value = "";

        $("#carousel-image-url").value =
            item.image_url || "";

        $("#carousel-status").value =
            item.status || "draft";

        $("#carousel-sort-order").value =
            item.sort_order ?? 0;

        $("#carousel-start-date").value =
            toDateTimeLocal(
                item.start_date
            );

        $("#carousel-end-date").value =
            toDateTimeLocal(
                item.end_date
            );

    }

    $("#carousel-form-error").textContent =
        "";

    openModal(modal);

}


function closeCarouselModal() {

    closeModal(
        $("#carousel-modal")
    );

    state.editingCarouselItemId =
        null;

}


async function saveCarouselItem(
    event
) {

    event.preventDefault();

    if (!client) return;

    const errorElement =
        $("#carousel-form-error");

    try {

        const title =
            $("#carousel-title")
                .value
                .trim();

        if (!title) {
            throw new Error(
                "Promotion title is required."
            );
        }

        let imageUrl =
            $("#carousel-image-url")
                .value
                .trim();

        const file =
            $("#carousel-image")
                .files?.[0];

        if (file) {

            imageUrl =
                await uploadFile(
                    file,
                    "carousel-images"
                );

        }

        const payload = {

            title,

            description:
                $("#carousel-description")
                    .value
                    .trim(),

            image_url:
                imageUrl || null,

            area:
                $("#carousel-area")
                    .value
                    .trim(),

            status:
                $("#carousel-status")
                    .value,

            start_date:
                localDateToISO(
                    $("#carousel-start-date")
                        .value
                ),

            end_date:
                localDateToISO(
                    $("#carousel-end-date")
                        .value
                ),

            sort_order:
                Number(
                    $("#carousel-sort-order")
                        .value || 0
                )

        };

        if (
            state.editingCarouselItemId
        ) {

            const {
                error
            } = await client
                .from("carousel_items")
                .update(payload)
                .eq(
                    "id",
                    state.editingCarouselItemId
                );

            if (error) throw error;

            showToast(
                "Promotion updated."
            );

        } else {

            const {
                error
            } = await client
                .from("carousel_items")
                .insert(payload);

            if (error) throw error;

            showToast(
                "Promotion created."
            );

        }

        closeCarouselModal();

        await loadCarouselItems();

    } catch (error) {

        console.error(
            "Save carousel error:",
            error
        );

        if (errorElement) {

            errorElement.textContent =
                error.message ||
                "Unable to save promotion.";

        }

    }

}


async function updateCarouselStatus(
    id,
    status
) {

    try {

        const {
            error
        } = await client
            .from("carousel_items")
            .update({
                status
            })
            .eq(
                "id",
                id
            );

        if (error) throw error;

        await loadCarouselItems();

        showToast(
            "Promotion status updated."
        );

    } catch (error) {

        console.error(
            "Carousel status error:",
            error
        );

        showToast(
            error.message ||
            "Unable to update promotion.",
            true
        );

    }

}


async function deleteCarouselItem(
    id
) {

    const item =
        state.allCarouselItems.find(
            record =>
                Number(record.id) ===
                Number(id)
        );

    if (!item) return;

    if (
        !window.confirm(
            `Delete "${item.title}"?`
        )
    ) {
        return;
    }

    try {

        const {
            error
        } = await client
            .from("carousel_items")
            .delete()
            .eq(
                "id",
                id
            );

        if (error) throw error;

        await loadCarouselItems();

        showToast(
            "Promotion deleted."
        );

    } catch (error) {

        console.error(
            "Delete carousel error:",
            error
        );

        showToast(
            error.message ||
            "Unable to delete promotion.",
            true
        );

    }

}


/* =========================================================
   STORAGE
   ========================================================= */

async function uploadFile(
    file,
    bucket
) {

    if (!client) {
        throw new Error(
            "Supabase is not available."
        );
    }

    if (!file) {
        throw new Error(
            "No file selected."
        );
    }

    const extension =
        file.name.includes(".")
            ? file.name
                .split(".")
                .pop()
                .toLowerCase()
            : "bin";

    const filename =
        `${Date.now()}-${randomString(8)}.${extension}`;

    const path =
        filename;

    const {
        error
    } = await client
        .storage
        .from(bucket)
        .upload(
            path,
            file,
            {
                upsert: false,
                cacheControl: "3600"
            }
        );

    if (error) {

        if (
            bucket === "learning-media"
        ) {

            throw new Error(
                "Learning media storage is not available. Create a Supabase Storage bucket named learning-media and allow authenticated uploads."
            );

        }

        throw error;

    }

    const {
        data
    } = client
        .storage
        .from(bucket)
        .getPublicUrl(path);

    return data.publicUrl;

}


/* =========================================================
   GENERAL MEDIA UPLOAD HELPER
   ========================================================= */

async function uploadLearningMedia(
    file
) {

    return uploadFile(
        file,
        "learning-media"
    );

}


/* =========================================================
   MODAL HELPERS
   ========================================================= */

function openModal(
    modal
) {

    if (!modal) return;

    modal.classList.add("open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );

}


function closeModal(
    modal
) {

    if (!modal) return;

    modal.classList.remove("open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    if (
        !document.querySelector(
            ".course-modal.open"
        )
    ) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer = null;


function showToast(
    message,
    isError = false
) {

    const toast =
        $("#admin-toast");

    if (!toast) return;

    toast.textContent =
        message;

    toast.classList.toggle(
        "error",
        Boolean(isError)
    );

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toastTimer
    );

    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* =========================================================
   UTILITIES
   ========================================================= */

function nextSortOrder(
    items
) {

    if (!items?.length) {
        return 0;
    }

    return Math.max(
        ...items.map(
            item =>
                Number(
                    item.sort_order || 0
                )
        )
    ) + 1;

}


function sortByOrder(
    a,
    b
) {

    return (
        Number(a.sort_order || 0) -
        Number(b.sort_order || 0)
    );

}


function splitLines(
    value
) {

    return String(value || "")
        .split(/\r?\n/)
        .map(item => item.trim())
        .filter(Boolean);

}


function splitPipe(
    value
) {

    return String(value || "")
        .split("|")
        .map(item => item.trim())
        .filter(Boolean);

}


function renumberList(
    container,
    label
) {

    if (!container) return;

    Array.from(
        container.children
    ).forEach(
        (item, index) => {

            const heading =
                $(".dynamic-list-item-header strong", item);

            if (heading) {

                heading.textContent =
                    `${label} ${index + 1}`;

            }

        }
    );

}


function formatDate(
    value
) {

    if (!value) {
        return "Unknown date";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Unknown date";
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


function toDateTimeLocal(
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
                .padStart(2, "0");

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


function localDateToISO(
    value
) {

    if (!value) {
        return null;
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }

    return date.toISOString();

}


function randomString(
    length
) {

    const chars =
        "abcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";

    for (
        let index = 0;
        index < length;
        index++
    ) {

        result +=
            chars[
                Math.floor(
                    Math.random() *
                    chars.length
                )
            ];

    }

    return result;

}


function escapeHtml(
    value
) {

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


function escapeAttribute(
    value
) {

    return escapeHtml(
        value
    );

}


/* =========================================================
   GLOBAL KEYBOARD BEHAVIOUR
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Escape"
        ) {
            return;
        }

        const openModals =
            $$(".course-modal.open");

        if (!openModals.length) {
            return;
        }

        const topModal =
            openModals[
                openModals.length - 1
            ];

        if (
            topModal.id ===
            "content-editor-modal"
        ) {

            closeContentEditor();
            return;

        }

        if (
            topModal.id ===
            "content-builder-modal"
        ) {

            closeContentBuilder();
            return;

        }

        if (
            topModal.id ===
            "course-modal"
        ) {

            closeCourseModal();
            return;

        }

        if (
            topModal.id ===
            "carousel-modal"
        ) {

            closeCarouselModal();
            return;

        }

    }
);


/* =========================================================
   DEBUG
   ========================================================= */

window.EduCoreAdmin = {

    state,

    reloadCourses:
        loadCourses,

    reloadDashboard:
        loadDashboard,

    reloadCarousel:
        loadCarouselItems,

    reloadContent:
        loadCourseStructure

};
