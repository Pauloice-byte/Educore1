<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>EduCore | Admin Dashboard</title>

    <link
        rel="stylesheet"
        href="css/admin.css"
    >

</head>

<body>

<div id="admin-app">

    <!-- =====================================================
         SIDEBAR
    ====================================================== -->

    <aside
        class="admin-sidebar"
        id="admin-sidebar"
    >

        <div class="sidebar-brand">

            <img
                src="images/logo.jpg"
                alt="EduCore"
                class="brand-mark"
            >

            <div class="brand-information">

                <div class="brand-name">
                    EduCore Admin
                </div>

                <div class="brand-subtitle">
                    Administration
                </div>

            </div>

        </div>


        <nav class="admin-navigation">

            <button
                type="button"
                class="nav-item active"
                data-section="overview"
            >
                <span class="nav-icon">◈</span>
                <span class="nav-label">Overview</span>
            </button>


            <button
                type="button"
                class="nav-item"
                data-section="courses"
            >
                <span class="nav-icon">▣</span>
                <span class="nav-label">Courses</span>
            </button>


            <button
                type="button"
                class="nav-item"
                data-section="students"
            >
                <span class="nav-icon">♙</span>
                <span class="nav-label">Students</span>
            </button>


            <button
                type="button"
                class="nav-item"
                data-section="progress"
            >
                <span class="nav-icon">◫</span>
                <span class="nav-label">Progress</span>
            </button>


            <button
                type="button"
                class="nav-item"
                data-section="media"
            >
                <span class="nav-icon">▶</span>
                <span class="nav-label">Media</span>
            </button>


            <button
                type="button"
                class="nav-item"
                data-section="settings"
            >
                <span class="nav-icon">⚙</span>
                <span class="nav-label">Settings</span>
            </button>

        </nav>


        <div class="sidebar-footer">

            <button
                type="button"
                class="logout-button"
                id="admin-logout"
            >
                <span class="nav-icon">↪</span>
                <span>Log out</span>
            </button>

        </div>

    </aside>


    <!-- =====================================================
         MAIN
    ====================================================== -->

    <main class="admin-main">

        <header class="admin-header">

            <div class="header-left">

                <button
                    type="button"
                    class="sidebar-toggle"
                    id="sidebar-toggle"
                    aria-label="Toggle sidebar"
                    aria-controls="admin-sidebar"
                    aria-expanded="true"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>


                <div class="header-title">

                    <div class="header-eyebrow">
                        EDUCORE ADMIN
                    </div>

                    <h1 id="page-title">
                        Overview
                    </h1>

                </div>

            </div>


            <div class="admin-user">

                <div
                    class="admin-avatar"
                    id="admin-avatar"
                >
                    A
                </div>

                <div class="admin-user-details">

                    <div
                        class="admin-name"
                        id="admin-name"
                    >
                        Admin
                    </div>

                    <div class="admin-role">
                        Administrator
                    </div>

                </div>

            </div>

        </header>


        <!-- =================================================
             CONTENT
        ================================================== -->

        <div class="admin-content">

            <!-- =================================================
                 OVERVIEW
            ================================================== -->

            <section
                class="admin-section active"
                id="section-overview"
            >

                <div class="section-introduction">

                    <div class="section-kicker">
                        DASHBOARD
                    </div>

                    <h2>
                        Welcome again to EduCore Admin
                    </h2>

                    <p>
                        Manage your learning platform,
                        courses, students and content.
                    </p>

                </div>


                <div class="statistics-grid">

                    <div class="stat-card">

                        <div class="stat-card-top">

                            <span class="stat-label">
                                Courses
                            </span>

                            <span class="stat-icon">
                                ▣
                            </span>

                        </div>

                        <strong
                            class="stat-value"
                            id="stat-courses"
                        >
                            —
                        </strong>

                        <span class="stat-description">
                            Total courses
                        </span>

                    </div>


                    <div class="stat-card">

                        <div class="stat-card-top">

                            <span class="stat-label">
                                Units
                            </span>

                            <span class="stat-icon">
                                ◫
                            </span>

                        </div>

                        <strong
                            class="stat-value"
                            id="stat-units"
                        >
                            —
                        </strong>

                        <span class="stat-description">
                            Total learning units
                        </span>

                    </div>


                    <div class="stat-card">

                        <div class="stat-card-top">

                            <span class="stat-label">
                                Lessons
                            </span>

                            <span class="stat-icon">
                                ▤
                            </span>

                        </div>

                        <strong
                            class="stat-value"
                            id="stat-lessons"
                        >
                            —
                        </strong>

                        <span class="stat-description">
                            Total lessons
                        </span>

                    </div>


                    <div class="stat-card">

                        <div class="stat-card-top">

                            <span class="stat-label">
                                Students
                            </span>

                            <span class="stat-icon">
                                ♙
                            </span>

                        </div>

                        <strong
                            class="stat-value"
                            id="stat-students"
                        >
                            —
                        </strong>

                        <span class="stat-description">
                            Active students
                        </span>

                    </div>


                    <div class="stat-card stat-card-wide">

                        <div class="stat-card-top">

                            <span class="stat-label">
                                Published Content
                            </span>

                            <span class="stat-icon">
                                ✓
                            </span>

                        </div>

                        <strong
                            class="stat-value"
                            id="stat-published"
                        >
                            —
                        </strong>

                        <span class="stat-description">
                            Published courses
                        </span>

                    </div>

                </div>


                <div class="dashboard-panel">

                    <div class="panel-header">

                        <div class="panel-kicker">
                            ACTIVITY
                        </div>

                        <h3>
                            Recent Activity
                        </h3>

                    </div>

                    <div
                        class="activity-list"
                        id="recent-activity"
                    >
                        <div class="activity-loading">
                            Loading activity...
                        </div>
                    </div>

                </div>

            </section>
            <!-- =================================================
                 COURSES
            ================================================== -->

            <section
                class="admin-section"
                id="section-courses"
            >

                <div class="courses-header">

                    <div class="section-introduction">

                        <div class="section-kicker">
                            CONTENT MANAGEMENT
                        </div>

                        <h2>
                            Courses
                        </h2>

                        <p>
                            Create, organize and manage every
                            type of course available on EduCore.
                        </p>

                    </div>


                    <button
                        type="button"
                        class="primary-button"
                        id="create-course-button"
                    >
                        <span>+</span>
                        Create Course
                    </button>

                </div>


                <div class="course-toolbar">

                    <div class="course-search">

                        <span>⌕</span>

                        <input
                            type="search"
                            id="course-search"
                            placeholder="Search courses..."
                            autocomplete="off"
                        >

                    </div>


                    <select
                        id="course-status-filter"
                        class="course-filter"
                    >

                        <option value="all">
                            All Status
                        </option>

                        <option value="draft">
                            Draft
                        </option>

                        <option value="published">
                            Published
                        </option>

                        <option value="archived">
                            Archived
                        </option>

                    </select>


                    <select
                        id="course-sort"
                        class="course-filter"
                    >

                        <option value="newest">
                            Newest first
                        </option>

                        <option value="oldest">
                            Oldest first
                        </option>

                        <option value="title">
                            Title A–Z
                        </option>

                        <option value="sort_order">
                            Custom order
                        </option>

                    </select>

                </div>


                <div class="courses-panel">

                    <div class="courses-table-header">

                        <div>
                            Course
                        </div>

                        <div>
                            Type
                        </div>

                        <div>
                            Level
                        </div>

                        <div>
                            Status
                        </div>

                        <div>
                            Updated
                        </div>

                        <div>
                            Actions
                        </div>

                    </div>


                    <div
                        id="courses-list"
                        class="courses-list"
                    >

                        <div class="courses-loading">

                            <div class="courses-loading-icon">
                                ◌
                            </div>

                            <p>
                                Loading courses...
                            </p>

                        </div>

                    </div>


                    <div
                        id="courses-empty"
                        class="courses-empty"
                        hidden
                    >

                        <div class="courses-empty-icon">
                            ▣
                        </div>

                        <h3>
                            No courses found
                        </h3>

                        <p>
                            Create your first course or
                            change your search filters.
                        </p>

                        <button
                            type="button"
                            class="primary-button"
                            id="create-course-empty-button"
                        >
                            + Create Course
                        </button>

                    </div>

                </div>

            </section>


            <!-- =================================================
                 STUDENTS
            ================================================== -->

            <section
                class="admin-section"
                id="section-students"
            >

                <div class="section-introduction">

                    <div class="section-kicker">
                        USERS
                    </div>

                    <h2>
                        Students
                    </h2>

                    <p>
                        View and manage registered students.
                    </p>

                </div>


                <div class="empty-section">

                    <div class="empty-section-icon">
                        ♙
                    </div>

                    <h2>
                        Student Management
                    </h2>

                    <p>
                        Student management tools will appear here.
                    </p>

                </div>

            </section>
            <!-- =================================================
                 PROGRESS
            ================================================== -->

            <section
                class="admin-section"
                id="section-progress"
            >

                <div class="section-introduction">

                    <div class="section-kicker">
                        ANALYTICS
                    </div>

                    <h2>
                        Progress
                    </h2>

                    <p>
                        Monitor student learning progress.
                    </p>

                </div>


                <div class="empty-section">

                    <div class="empty-section-icon">
                        ◫
                    </div>

                    <h2>
                        Progress Analytics
                    </h2>

                    <p>
                        Student progress information will appear here.
                    </p>

                </div>

            </section>


            <!-- =================================================
                 MEDIA
            ================================================== -->

            <section
                class="admin-section"
                id="section-media"
            >

                <div class="section-introduction">

                    <div class="section-kicker">
                        LIBRARY
                    </div>

                    <h2>
                        Media
                    </h2>

                    <p>
                        Manage images, audio and other course media.
                    </p>

                </div>


                <div class="empty-section">

                    <div class="empty-section-icon">
                        ▶
                    </div>

                    <h2>
                        Media Library
                    </h2>

                    <p>
                        Media management tools will appear here.
                    </p>

                </div>

            </section>


            <!-- =================================================
                 SETTINGS
            ================================================== -->

            <section
                class="admin-section"
                id="section-settings"
            >

                <div class="section-introduction">

                    <div class="section-kicker">
                        SYSTEM
                    </div>

                    <h2>
                        Settings
                    </h2>

                    <p>
                        Configure EduCore platform settings.
                    </p>

                </div>


                <div class="empty-section">

                    <div class="empty-section-icon">
                        ⚙
                    </div>

                    <h2>
                        Platform Settings
                    </h2>

                    <p>
                        Configuration options will appear here.
                    </p>

                </div>

            </section>

        </div>

    </main>

</div>


<!-- =========================================================
     COURSE CREATE / EDIT MODAL
========================================================= -->

<div
    class="modal-overlay"
    id="course-modal-backdrop"
    aria-hidden="true"
>

    <div
        class="course-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-modal-title"
    >

        <div class="modal-header">

            <div>

                <div class="modal-kicker">
                    COURSE MANAGEMENT
                </div>

                <h2 id="course-modal-title">
                    Create Course
                </h2>

            </div>


            <button
                type="button"
                class="modal-close"
                id="course-modal-close"
                aria-label="Close"
            >
                ×
            </button>

        </div>


        <form id="course-form">

            <div class="form-grid">

                <div class="form-group form-full">

                    <label for="course-title">
                        Course Title
                    </label>

                    <input
                        type="text"
                        id="course-title"
                        name="title"
                        placeholder="Enter course title"
                        required
                    >

                </div>


                <div class="form-group form-full">

                    <label for="course-description">
                        Description
                    </label>

                    <textarea
                        id="course-description"
                        name="description"
                        rows="4"
                        placeholder="Describe the course..."
                    ></textarea>

                </div>


                <div class="form-group">

                    <label for="course-type">
                        Course Type
                    </label>

                    <select
                        id="course-type"
                        name="course_type"
                    >

                        <option value="language">
                            Language
                        </option>

                        <option value="academic">
                            Academic
                        </option>

                        <option value="professional">
                            Professional
                        </option>

                        <option value="other">
                            Other
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label for="course-category">
                        Category
                    </label>

                    <input
                        type="text"
                        id="course-category"
                        name="category"
                        placeholder="e.g. English"
                    >

                </div>


                <div class="form-group">

                    <label for="course-language">
                        Language
                    </label>

                    <input
                        type="text"
                        id="course-language"
                        name="language"
                        placeholder="e.g. English"
                    >

                </div>


                <div class="form-group">

                    <label for="course-level">
                        Level
                    </label>

                    <input
                        type="text"
                        id="course-level"
                        name="level"
                        placeholder="e.g. Beginner A1"
                    >

                </div>


                <div class="form-group">

                    <label for="course-slug">
                        Slug
                    </label>

                    <input
                        type="text"
                        id="course-slug"
                        name="slug"
                        placeholder="course-slug"
                    >

                </div>


                <div class="form-group">

                    <label for="course-status">
                        Status
                    </label>

                    <select
                        id="course-status"
                        name="status"
                    >

                        <option value="draft">
                            Draft
                        </option>

                        <option value="published">
                            Published
                        </option>

                        <option value="archived">
                            Archived
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label for="course-sort-order">
                        Sort Order
                    </label>

                    <input
                        type="number"
                        id="course-sort-order"
                        name="sort_order"
                        value="0"
                    >

                </div>


                <div class="form-group form-full">

                    <label for="course-cover-image">
                        Cover Image URL
                    </label>

                    <input
                        type="text"
                        id="course-cover-image"
                        name="cover_image"
                        placeholder="https://..."
                    >

                </div>

            </div>


            <div
                id="course-form-error"
                class="form-error"
            ></div>


            <div class="modal-footer">

                <button
                    type="button"
                    class="secondary-button"
                    id="course-form-cancel"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    class="primary-button"
                    id="course-form-submit"
                >
                    Create Course
                </button>

            </div>

        </form>
<!-- =========================================================
     CONFIRMATION MODAL
========================================================= -->

<div
    class="modal-overlay"
    id="confirm-modal-backdrop"
    aria-hidden="true"
>

    <div
        class="course-modal confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
    >

        <div class="modal-header">

            <div>

                <div class="modal-kicker">
                    CONFIRM ACTION
                </div>

                <h2 id="confirm-modal-title">
                    Archive Course
                </h2>

            </div>


            <button
                type="button"
                class="modal-close"
                id="confirm-close"
                aria-label="Close"
            >
                ×
            </button>

        </div>


        <div class="confirm-content">

            <p id="confirm-message">
                Are you sure you want to archive this course?
            </p>

        </div>


        <div class="modal-footer">

            <button
                type="button"
                class="secondary-button"
                id="confirm-cancel"
            >
                Cancel
            </button>

            <button
                type="button"
                class="primary-button danger-button"
                id="confirm-action"
            >
                Archive Course
            </button>

        </div>

    </div>

</div>


<!-- =========================================================
     MOBILE SIDEBAR OVERLAY
========================================================= -->

<div
    id="sidebar-overlay"
    class="sidebar-overlay"
    aria-hidden="true"
></div>


<!-- =========================================================
     TOAST / NOTIFICATION
========================================================= -->

<div
    id="admin-toast"
    class="admin-toast"
    aria-live="polite"
    aria-atomic="true"
></div>


<!-- =========================================================
     SCRIPTS
========================================================= -->

<script src="js/supabase.js"></script>

<script src="js/auth.js"></script>

<script src="js/admin.js"></script>


</body>

</html>
    </div>

</div>

                    
