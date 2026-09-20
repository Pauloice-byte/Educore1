/* =========================================================
   EDUCORE ADMIN
========================================================= */

:root {

    --purple: #7c3aed;
    --purple-dark: #6d28d9;
    --purple-soft: #f3e8ff;
    --purple-wash: #faf7ff;

    --background: #f6f7fb;
    --surface: #ffffff;
    --surface-soft: #f9fafc;

    --text: #171a21;
    --text-secondary: #667085;
    --text-muted: #98a2b3;

    --border: #e7e9ef;

    --danger: #dc2626;
    --danger-soft: #fef2f2;

    --success: #16a34a;
    --success-soft: #ecfdf3;

    --sidebar: #11121a;

    --shadow:
        0 12px 40px rgba(16, 24, 40, 0.07);

    --shadow-small:
        0 4px 18px rgba(16, 24, 40, 0.06);

    --radius: 18px;
    --radius-small: 12px;

}


* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}


html {
    scroll-behavior: smooth;
}


body {

    min-height: 100vh;

    background: var(--background);

    color: var(--text);

    font-family:
        Inter,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;

}


button,
input,
select,
textarea {

    font: inherit;

}


button {

    cursor: pointer;

}


button:disabled {

    cursor: not-allowed;

    opacity: .5;

}


.admin-hidden {
    display: none !important;
}


/* =========================================================
   APP
========================================================= */

.admin-app {

    min-height: 100vh;

}


/* =========================================================
   SIDEBAR
========================================================= */

.admin-sidebar {

    position: fixed;

    inset:
        0 auto 0 0;

    width: 270px;

    background:
        linear-gradient(
            180deg,
            #151522 0%,
            #0f1017 100%
        );

    color: white;

    display: flex;

    flex-direction: column;

    z-index: 100;

    transition:
        width .3s ease,
        transform .3s ease;

}


.sidebar-brand {

    min-height: 90px;

    padding:
        22px 22px;

    display: flex;

    align-items: center;

    gap: 12px;

    border-bottom:
        1px solid
        rgba(255,255,255,.07);

}


.brand-mark {

    width: 38px;
    height: 38px;

    border-radius: 11px;

    display: grid;

    place-items: center;

    background:
        linear-gradient(
            135deg,
            var(--purple),
            #9b5cf6
        );

    font-size: 18px;

    font-weight: 800;

    box-shadow:
        0 8px 20px
        rgba(124,58,237,.25);

}


.brand-copy {

    display: flex;

    flex-direction: column;

    min-width: 0;

}


.brand-copy strong {

    font-size: 17px;

}


.brand-copy span {

    margin-top: 2px;

    color:
        rgba(255,255,255,.5);

    font-size: 10px;

}


.mobile-sidebar-close {

    display: none;

    margin-left: auto;

    border: 0;

    background: transparent;

    color: white;

    font-size: 28px;

}


/* =========================================================
   NAVIGATION
========================================================= */

.admin-navigation {

    flex: 1;

    padding: 22px 14px;

    overflow-y: auto;

}


.navigation-label {

    padding:
        0 12px 10px;

    color:
        rgba(255,255,255,.35);

    font-size: 9px;

    font-weight: 700;

    letter-spacing: .12em;

}


.navigation-label-spaced {

    margin-top: 26px;

}


.nav-item {

    width: 100%;

    min-height: 48px;

    margin-bottom: 4px;

    border: 0;

    border-radius: 12px;

    background: transparent;

    color:
        rgba(255,255,255,.62);

    display: flex;

    align-items: center;

    gap: 12px;

    padding:
        0 13px;

    text-align: left;

    transition:
        background .2s ease,
        color .2s ease,
        transform .2s ease;

}


.nav-item:hover {

    background:
        rgba(255,255,255,.06);

    color: white;

}


.nav-item.active {

    background:
        linear-gradient(
            90deg,
            rgba(124,58,237,.28),
            rgba(124,58,237,.1)
        );

    color: white;

}


.nav-icon {

    width: 25px;

    display: grid;

    place-items: center;

    color:
        rgba(255,255,255,.55);

    font-size: 17px;

}


.nav-item.active .nav-icon {

    color:
        #b99aff;

}


/* =========================================================
   SIDEBAR FOOTER
========================================================= */

.sidebar-footer {

    padding: 16px;

    border-top:
        1px solid
        rgba(255,255,255,.07);

}


.admin-mini-profile {

    display: flex;

    align-items: center;

    gap: 10px;

    margin-bottom: 14px;

}


.admin-avatar {

    width: 36px;
    height: 36px;

    border-radius: 50%;

    background:
        var(--purple-soft);

    color:
        var(--purple);

    display: grid;

    place-items: center;

    font-weight: 700;

}


.admin-mini-copy {

    display: flex;

    flex-direction: column;

    min-width: 0;

}


.admin-mini-copy strong {

    max-width: 170px;

    overflow: hidden;

    text-overflow: ellipsis;

    white-space: nowrap;

    font-size: 12px;

}


.admin-mini-copy span {

    color:
        rgba(255,255,255,.4);

    font-size: 10px;

    margin-top: 2px;

}


.logout-button {

    width: 100%;

    height: 42px;

    border:
        1px solid
        rgba(255,255,255,.08);

    border-radius: 10px;

    background:
        rgba(255,255,255,.04);

    color:
        rgba(255,255,255,.65);

    display: flex;

    align-items: center;

    gap: 10px;

    padding: 0 13px;

}


.logout-button:hover {

    color: white;

    background:
        rgba(255,255,255,.08);

}


/* =========================================================
   SIDEBAR OVERLAY
========================================================= */

.sidebar-overlay {

    position: fixed;

    inset: 0;

    background:
        rgba(8,9,15,.55);

    backdrop-filter:
        blur(3px);

    z-index: 90;

    opacity: 0;

    pointer-events: none;

    transition: opacity .25s ease;

}


.sidebar-open .sidebar-overlay {

    opacity: 1;

    pointer-events: auto;

}


/* =========================================================
   MAIN
========================================================= */

.admin-main {

    min-height: 100vh;

    margin-left: 270px;

    transition:
        margin-left .3s ease;

}


.admin-topbar {

    position: sticky;

    top: 0;

    z-index: 50;

    min-height: 84px;

    padding:
        0 34px;

    background:
        rgba(255,255,255,.92);

    backdrop-filter:
        blur(18px);

    border-bottom:
        1px solid
        var(--border);

    display: flex;

    align-items: center;

    justify-content: space-between;

}


.topbar-left {

    display: flex;

    align-items: center;

    gap: 14px;

}


.sidebar-toggle {

    width: 40px;
    height: 40px;

    border: 1px solid var(--border);

    border-radius: 10px;

    background: white;

    color: var(--text);

}


.topbar-eyebrow {

    color:
        var(--purple);

    font-size: 9px;

    font-weight: 800;

    letter-spacing: .14em;

}


.topbar-left h1 {

    margin-top: 3px;

    font-size: 20px;

}


.topbar-right {

    display: flex;

    align-items: center;

    gap: 18px;

}


.topbar-brand {

    color:
        var(--purple);

    font-weight: 800;

}


.topbar-avatar {

    width: 38px;
    height: 38px;

    border-radius: 50%;

    background:
        var(--purple-soft);

    color:
        var(--purple);

    display: grid;

    place-items: center;

    font-weight: 700;

}


/* =========================================================
   CONTENT
========================================================= */

.admin-content {

    max-width: 1600px;

    margin: 0 auto;

    padding:
        38px 38px 70px;

}


.admin-section {

    display: none;

    animation:
        sectionIn .28s ease;

}


.admin-section.active {

    display: block;

}


@keyframes sectionIn {

    from {

        opacity: 0;

        transform:
            translateY(8px);

    }

    to {

        opacity: 1;

        transform:
            translateY(0);

    }

}


/* =========================================================
   HEADINGS
========================================================= */

.page-introduction {

    margin-bottom: 30px;

}


.page-introduction h2,
.page-heading-row h2 {

    margin-top: 5px;

    font-size: 28px;

    letter-spacing: -.03em;

}


.page-introduction p,
.page-heading-row p {

    margin-top: 7px;

    color:
        var(--text-secondary);

    max-width: 650px;

    line-height: 1.6;

}


.section-kicker {

    display: block;

    color:
        var(--purple);

    font-size: 9px;

    font-weight: 800;

    letter-spacing: .14em;

}


.page-heading-row {

    display: flex;

    align-items: flex-end;

    justify-content: space-between;

    gap: 24px;

    margin-bottom: 28px;

}


/* =========================================================
   BUTTONS
========================================================= */

.primary-button,
.small-primary-button,
.secondary-button,
.danger-button {

    border: 0;

    border-radius: 10px;

    transition:
        transform .18s ease,
        background .18s ease,
        box-shadow .18s ease;

}


.primary-button {

    min-height: 44px;

    padding:
        0 18px;

    background:
        var(--purple);

    color: white;

    font-weight: 700;

    box-shadow:
        0 7px 18px
        rgba(124,58,237,.18);

}


.primary-button:hover {

    background:
        var(--purple-dark);

    transform:
        translateY(-1px);

}


.small-primary-button {

    min-height: 36px;

    padding:
        0 13px;

    background:
        var(--purple);

    color: white;

    font-size: 11px;

    font-weight: 700;

}


.secondary-button {

    min-height: 38px;

    padding:
        0 13px;

    border:
        1px solid
        var(--border);

    background: white;

    color:
        var(--text-secondary);

    font-size: 11px;

    font-weight: 600;

}


.secondary-button:hover {

    background:
        var(--surface-soft);

}


.danger-button {

    min-height: 38px;

    padding:
        0 13px;

    background:
        var(--danger-soft);

    color:
        var(--danger);

    font-size: 11px;

    font-weight: 600;

}


/* =========================================================
   STATS
========================================================= */

.stats-grid {

    display: grid;

    grid-template-columns:
        repeat(4, 1fr);

    gap: 18px;

    margin-bottom: 24px;

}


.stat-card {

    min-height: 145px;

    padding: 22px;

    background: white;

    border:
        1px solid
        var(--border);

    border-radius:
        var(--radius);

    box-shadow:
        var(--shadow-small);

}


.stat-card-icon {

    width: 38px;
    height: 38px;

    border-radius: 11px;

    background:
        var(--purple-soft);

    color:
        var(--purple);

    display: grid;

    place-items: center;

    margin-bottom: 15px;

}


.stat-card span {

    display: block;

    color:
        var(--text-secondary);

    font-size: 12px;

}


.stat-card strong {

    display: block;

    margin-top: 5px;

    font-size: 27px;

}


/* =========================================================
   DASHBOARD
========================================================= */

.dashboard-grid {

    display: grid;

    grid-template-columns:
        1fr 1fr;

    gap: 20px;

}


.dashboard-panel {

    min-height: 230px;

    background: white;

    border:
        1px solid
        var(--border);

    border-radius:
        var(--radius);

    padding: 24px;

    box-shadow:
        var(--shadow-small);

}


.panel-heading {

    display: flex;

    justify-content: space-between;

}


.panel-heading h3 {

    margin-top: 5px;

    font-size: 17px;

}


.publishing-summary {

    display: grid;

    grid-template-columns:
        1fr 1fr;

    gap: 12px;

    margin-top: 25px;

}


.publishing-summary > div {

    padding: 18px;

    border-radius: 14px;

    background:
        var(--surface-soft);

}


.publishing-summary span {

    display: block;

    color:
        var(--text-secondary);

    font-size: 11px;

}


.publishing-summary strong {

    display: block;

    margin-top: 5px;

    font-size: 24px;

}


.activity-list {

    margin-top: 20px;

}


.activity-item {

    display: flex;

    gap: 12px;

    padding:
        11px 0;

    border-bottom:
        1px solid
        var(--border);

}


.activity-icon {

    width: 32px;
    height: 32px;

    flex: 0 0 32px;

    border-radius: 9px;

    background:
        var(--purple-soft);

    color:
        var(--purple);

    display: grid;

    place-items: center;

}


.activity-title {

    font-size: 12px;

    font-weight: 600;

}


.activity-meta {

    margin-top: 3px;

    color:
        var(--text-muted);

    font-size: 10px;

}


.activity-empty {

    color:
        var(--text-muted);

    font-size: 12px;

}


.dashboard-error {

    margin-top: 20px;

    padding: 15px 18px;

    background:
        var(--danger-soft);

    color:
        var(--danger);

    border-radius: 12px;

    display: flex;

    justify-content: space-between;

}


/* =========================================================
   TOOLBAR
========================================================= */

.toolbar {

    display: flex;

    align-items: center;

    gap: 12px;

    margin-bottom: 20px;

}


.search-box {

    flex: 1;

    height: 44px;

    max-width: 500px;

    display: flex;

    align-items: center;

    gap: 9px;

    padding:
        0 13px;

    background: white;

    border:
        1px solid
        var(--border);

    border-radius: 10px;

}


.search-box span {

    color:
        var(--text-muted);

}


.search-box input {

    width: 100%;

    border: 0;

    outline: 0;

    color: var(--text);

    background: transparent;

}


.toolbar select,
.builder-course-selector select {

    min-height: 44px;

    padding:
        0 12px;

    border:
        1px solid
        var(--border);

    border-radius: 10px;

    background: white;

    color:
        var(--text);

    outline: 0;

}


/* =========================================================
   COURSES
========================================================= */

.courses-list {

    display: grid;

    gap: 12px;

}


.course-row {

    display: grid;

    grid-template-columns:
        72px 1fr auto;

    align-items: center;

    gap: 16px;

    padding: 14px;

    background: white;

    border:
        1px solid
        var(--border);

    border-radius: 15px;

    box-shadow:
        var(--shadow-small);

    transition:
        transform .18s ease,
        box-shadow .18s ease;

}


.course-row:hover {

    transform:
        translateY(-1px);

    box-shadow:
        var(--shadow);

}


.course-cover {

    width: 72px;
    height: 54px;

    border-radius: 9px;

    overflow: hidden;

    background:
        var(--purple-soft);

}


.course-cover img {

    width: 100%;
    height: 100%;

    object-fit: cover;

}


.course-cover-placeholder {

    width: 100%;
    height: 100%;

    display: grid;

    place-items: center;

    color:
        var(--purple);

    font-weight: 800;

}


.course-row-title {

    font-size: 14px;

    font-weight: 700;

}


.course-row-description {

    margin-top: 4px;

    color:
        var(--text-secondary);

    font-size: 11px;

    display: -webkit-box;

    -webkit-line-clamp: 1;

    -webkit-box-orient: vertical;

    overflow: hidden;

}


.course-row-meta {

    display: flex;

    gap: 7px;

    margin-top: 7px;

    flex-wrap: wrap;

}


.course-badge {

    padding:
        4px 7px;

    border-radius: 20px;

    background:
        var(--surface-soft);

    color:
        var(--text-secondary);

    font-size: 9px;

}


.course-badge.published {

    background:
        var(--success-soft);

    color:
        var(--success);

}


.course-badge.draft {

    background:
        #f2f4f7;

    color:
        #667085;

}


.course-badge.archived {

    background:
        var(--danger-soft);

    color:
        var(--danger);

}


.course-actions {

    display: flex;

    gap: 7px;

    flex-wrap: wrap;

    justify-content: flex-end;

}


.course-action-button {

    min-height: 34px;

    padding:
        0 10px;

    border:
        1px solid
        var(--border);

    border-radius: 8px;

    background: white;

    color:
        var(--text-secondary);

    font-size: 9px;

    font-weight: 700;

}


.course-action-button:hover {

    border-color:
        #d6c7f8;

    color:
        var(--purple);

}


.course-action-button.primary {

    border-color:
        var(--purple);

    background:
        var(--purple);

    color: white;

}


.course-action-button.danger {

    color:
        var(--danger);

    background:
        var(--danger-soft);

    border-color:
        #fecaca;

}


.courses-loading,
.courses-empty {

    padding: 45px;

    background: white;

    border:
        1px solid
        var(--border);

    border-radius:
        var(--radius);

    color:
        var(--text-secondary);

    text-align: center;

}


/* =========================================================
   COURSE BUILDER
========================================================= */

.builder-course-selector {

    display: grid;

    grid-template-columns:
        minmax(260px, 380px) 1fr;

    gap: 18px;

    padding: 18px;

    background: white;

    border:
        1px solid
        var(--border);

    border-radius:
        var(--radius);

    margin-bottom: 20px;

    box-shadow:
        var(--shadow-small);

}


.builder-course-selector label {

    display: block;

    margin-bottom: 7px;

    color:
        var(--text-secondary);

    font-size: 10px;

    font-weight: 700;

}


.builder-course-selector select {

    width: 100%;

}


.builder-course-summary {

    min-height: 44px;

    display: flex;

    align-items: center;

    color:
        var(--text-secondary);

    font-size: 11px;

}


.course-builder {

    min-height: 650px;

    display: grid;

    grid-template-columns:
        320px 1fr;

    background: white;

    border:
        1px solid
        var(--border);

    border-radius:
        var(--radius);

    overflow: hidden;

    box-shadow:
        var(--shadow-small);

}


.course-builder.disabled {

    opacity: .65;

}


/* =========================================================
   BUILDER SIDEBAR
========================================================= */

.builder-sidebar {

    background:
        #fbfbfd;

    border-right:
        1px solid
        var(--border);

    display: flex;

    flex-direction: column;

}


.builder-sidebar-heading {

    padding: 19px;

    border-bottom:
        1px solid
        var(--border);

    display: flex;

    justify-content: space-between;

    gap: 10px;

}


.builder-sidebar-heading span {

    display: block;

    color:
        var(--text-muted);

    font-size: 8px;

    font-weight: 800;

    letter-spacing: .12em;

}


.builder-sidebar-heading strong {

    display: block;

    margin-top: 5px;

    font-size: 12px;

}


.builder-tree {

    padding: 12px;

    overflow-y: auto;

}


.builder-empty {

    padding: 25px 12px;

    color:
        var(--text-muted);

    font-size: 11px;

    line-height: 1.6;

    text-align: center;

}


.tree-module {

    margin-bottom: 8px;

}


.tree-module-header {

    min-height: 43px;

    padding:
        0 9px;

    display: flex;

    align-items: center;

    gap: 7px;

    border-radius: 9px;

    cursor: pointer;

    transition:
        background .18s ease;

}


.tree-module-header:hover {

    background:
        var(--purple-soft);

}


.tree-module-header.active {

    background:
        var(--purple-soft);

}


.tree-module-toggle {

    width: 20px;

    color:
        var(--text-muted);

    font-size: 10px;

}


.tree-module-title {

    flex: 1;

    font-size: 11px;

    font-weight: 700;

}


.tree-module-menu {

    width: 25px;

    height: 25px;

    border: 0;

    border-radius: 6px;

    background: transparent;

    color:
        var(--text-muted);

}


.tree-lessons {

    margin-left: 20px;

    padding:
        3px 0 5px 8px;

    border-left:
        1px solid
        #e5e7eb;

}


.tree-lesson {

    width: 100%;

    min-height: 37px;

    padding:
        0 8px;

    border: 0;

    border-radius: 8px;

    background: transparent;

    color:
        var(--text-secondary);

    text-align: left;

    font-size: 10px;

}


.tree-lesson:hover {

    background:
        #f0ecfa;

}


.tree-lesson.active {

    background:
        #eee7fc;

    color:
        var(--purple);

    font-weight: 700;

}


.tree-lesson-count {

    float: right;

    color:
        var(--text-muted);

    font-size: 8px;

}


/* =========================================================
   BUILDER WORKSPACE
========================================================= */

.builder-workspace {

    min-width: 0;

    padding: 28px;

    overflow-y: auto;

}


.builder-welcome {

    max-width: 600px;

    margin:
        80px auto;

    text-align: center;

}


.builder-welcome-icon {

    width: 62px;
    height: 62px;

    margin:
        0 auto 20px;

    border-radius: 18px;

    background:
        var(--purple-soft);

    color:
        var(--purple);

    display: grid;

    place-items: center;

    font-size: 26px;

}


.builder-welcome h3 {

    margin-top: 7px;

    font-size: 23px;

}


.builder-welcome p {

    margin-top: 10px;

    color:
        var(--text-secondary);

    line-height: 1.7;

    font-size: 12px;

}


/* =========================================================
   EDITORS
========================================================= */

.editor-header {

    display: flex;

    justify-content: space-between;

    align-items: flex-start;

    gap: 20px;

    padding-bottom: 20px;

    border-bottom:
        1px solid
        var(--border);

}


.editor-header h3 {

    margin-top: 5px;

    font-size: 22px;

}


.editor-subtitle {

    margin-top: 5px;

    color:
        var(--text-secondary);

    font-size: 11px;

}


.editor-actions {

    display: flex;

    gap: 7px;

    flex-wrap: wrap;

}


.lesson-heading,
.content-builder-toolbar {

    margin-top: 24px;

    display: flex;

    justify-content: space-between;

    align-items: center;

    gap: 15px;

}


.lesson-heading h4,
.content-builder-toolbar h4 {

    margin-top: 5px;

    font-size: 15px;

}


.lesson-list {

    display: grid;

    gap: 10px;

    margin-top: 13px;

}


.lesson-card {

    padding: 14px;

    border:
        1px solid
        var(--border);

    border-radius: 12px;

    display: flex;

    align-items: center;

    gap: 12px;

    cursor: pointer;

    transition:
        border-color .18s ease,
        background .18s ease;

}


.lesson-card:hover,
.lesson-card.active {

    border-color:
        #d7c7f7;

    background:
        var(--purple-wash);

}


.lesson-number {

    width: 34px;
    height: 34px;

    flex: 0 0 34px;

    border-radius: 10px;

    background:
        var(--purple-soft);

    color:
        var(--purple);

    display: grid;

    place-items: center;

    font-size: 10px;

    font-weight: 800;

}


.lesson-card-content {

    min-width: 0;

    flex: 1;

}


.lesson-card-title {

    font-size: 12px;

    font-weight: 700;

}


.lesson-card-description {

    margin-top: 3px;

    color:
        var(--text-muted);

    font-size: 10px;

}


.lesson-card-arrow {

    color:
        var(--text-muted);

}


/* =========================================================
   CONTENT BLOCKS
========================================================= */

.content-list {

    display: grid;

    gap: 12px;

    margin-top: 14px;

}


.content-card {

    border:
        1px solid
        var(--border);

    border-radius: 14px;

    overflow: hidden;

    background: white;

}


.content-card-header {

    min-height: 48px;

    padding:
        0 14px;

    background:
        #fafafa;

    border-bottom:
        1px solid
        var(--border);

    display: flex;

    align-items: center;

    gap: 10px;

}


.content-type-icon {

    width: 30px;
    height: 30px;

    border-radius: 8px;

    background:
        var(--purple-soft);

    color:
        var(--purple);

    display: grid;

    place-items: center;

    font-size: 11px;

}


.content-card-header strong {

    flex: 1;

    font-size: 11px;

}


.content-card-actions {

    display: flex;

    gap: 5px;

}


.content-mini-button {

    width: 28px;
    height: 28px;

    border:
        1px solid
        var(--border);

    border-radius: 7px;

    background: white;

    color:
        var(--text-secondary);

    font-size: 10px;

}


.content-mini-button.danger {

    color:
        var(--danger);

}


.content-card-body {

    padding: 15px;

}


.content-preview {

    color:
        var(--text-secondary);

    font-size: 11px;

    line-height: 1.65;

}


.content-media-preview {

    max-width: 100%;

    border-radius: 10px;

    background: #111;

}


.content-file {

    display: flex;

    align-items: center;

    gap: 10px;

    padding: 12px;

    background:
        var(--surface-soft);

    border-radius: 9px;

    font-size: 11px;

}


.content-empty {

    padding: 30px;

    border:
        1px dashed
        var(--border);

    border-radius: 12px;

    color:
        var(--text-muted);

    text-align: center;

    font-size: 11px;

}


/* =========================================================
   EMPTY SECTION
========================================================= */

.empty-section {

    min-height: 360px;

    background: white;

    border:
        1px solid
        var(--border);

    border-radius:
        var(--radius);

    box-shadow:
        var(--shadow-small);

    display: flex;

    align-items: center;

    justify-content: center;

    flex-direction: column;

    text-align: center;

    padding: 35px;

}


.empty-section-icon {

    width: 60px;
    height: 60px;

    margin-bottom: 18px;

    border-radius: 18px;

    background:
        var(--purple-soft);

    color:
        var(--purple);

    display: grid;

    place-items: center;

    font-size: 25px;

}


.empty-section h3 {

    font-size: 19px;

}


.empty-section p {

    max-width: 500px;

    margin-top: 8px;

    color:
        var(--text-secondary);

    font-size: 12px;

    line-height: 1.6;

}


.phase-badge {

    margin-top: 18px;

    padding:
        6px 9px;

    border-radius: 20px;

    background:
        var(--purple-soft);

    color:
        var(--purple);

    font-size: 8px;

    font-weight: 800;

}


/* =========================================================
   MODALS
========================================================= */

.course-modal {

    position: fixed;

    inset: 0;

    z-index: 500;

    display: flex;

    align-items: center;

    justify-content: center;

    padding: 20px;

    opacity: 0;

    pointer-events: none;

    transition:
        opacity .2s ease;

}


.course-modal.open {

    opacity: 1;

    pointer-events: auto;

}


.course-modal-backdrop {

    position: absolute;

    inset: 0;

    background:
        rgba(12,13,20,.58);

    backdrop-filter:
        blur(5px);

}


.course-modal-dialog {

    position: relative;

    z-index: 1;

    width: min(720px, 100%);

    max-height:
        calc(100vh - 40px);

    overflow-y: auto;

    background: white;

    border-radius: 18px;

    box-shadow:
        0 30px 80px
        rgba(0,0,0,.22);

}


.course-modal-header {

    padding:
        22px 24px;

    border-bottom:
        1px solid
        var(--border);

    display: flex;

    justify-content: space-between;

    gap: 15px;

}


.course-modal-kicker {

    color:
        var(--purple);

    font-size: 8px;

    font-weight: 800;

    letter-spacing: .13em;

}


.course-modal-header h2 {

    margin-top: 4px;

    font-size: 20px;

}


.course-modal-close {

    width: 34px;
    height: 34px;

    border: 0;

    border-radius: 9px;

    background:
        #f2f4f7;

    color:
        var(--text-secondary);

    font-size: 21px;

}


.course-form {

    padding: 24px;

}


.course-form-field {

    margin-bottom: 17px;

}


.course-form-field label {

    display: block;

    margin-bottom: 7px;

    color:
        var(--text-secondary);

    font-size: 10px;

    font-weight: 700;

}


.course-form-field input,
.course-form-field textarea,
.course-form-field select {

    width: 100%;

    border:
        1px solid
        var(--border);

    border-radius: 9px;

    background: white;

    color:
        var(--text);

    outline: none;

    padding:
        11px 12px;

    font-size: 12px;

}


.course-form-field textarea {

    min-height: 105px;

    resize: vertical;

}


.course-form-field input:focus,
.course-form-field textarea:focus,
.course-form-field select:focus {

    border-color:
        #c7aef4;

    box-shadow:
        0 0 0 3px
        rgba(124,58,237,.08);

}


.course-form-grid {

    display: grid;

    grid-template-columns:
        1fr 1fr;

    gap: 15px;

}


.course-form-error {

    padding: 11px 12px;

    margin-bottom: 15px;

    border-radius: 9px;

    background:
        var(--danger-soft);

    color:
        var(--danger);

    font-size: 10px;

}


.course-form-actions {

    padding-top: 5px;

    display: flex;

    justify-content: flex-end;

    gap: 8px;

}


/* =========================================================
   CONTENT TYPE SELECTOR
========================================================= */

.content-type-grid {

    display: grid;

    grid-template-columns:
        repeat(4, 1fr);

    gap: 9px;

}


.content-type-option {

    min-height: 82px;

    padding: 10px;

    border:
        1px solid
        var(--border);

    border-radius: 11px;

    background: white;

    text-align: left;

    transition:
        border-color .18s ease,
        background .18s ease,
        transform .18s ease;

}


.content-type-option:hover {

    border-color:
        #cbb7ef;

    transform:
        translateY(-1px);

}


.content-type-option strong {

    display: block;

    margin-top: 7px;

    font-size: 10px;

}


.content-type-option span {

    display: block;

    margin-top: 3px;

    color:
        var(--text-muted);

    font-size: 8px;

    line-height: 1.35;

}


.content-type-option-icon {

    width: 28px;
    height: 28px;

    border-radius: 8px;

    background:
        var(--purple-soft);

    color:
        var(--purple);

    display: grid;

    place-items: center;

}


/* =========================================================
   MEDIA UPLOAD
========================================================= */

.file-drop {

    position: relative;

    border:
        1px dashed
        #cfd3dc;

    border-radius: 11px;

    padding: 22px;

    text-align: center;

    background:
        #fbfbfd;

}


.file-drop input {

    position: absolute;

    inset: 0;

    opacity: 0;

    cursor: pointer;

}


.file-drop strong {

    display: block;

    font-size: 11px;

}


.file-drop span {

    display: block;

    margin-top: 5px;

    color:
        var(--text-muted);

    font-size: 9px;

}


.upload-progress {

    height: 5px;

    margin-top: 12px;

    overflow: hidden;

    border-radius: 10px;

    background:
        #e9e9ee;

}


.upload-progress-fill {

    width: 0;

    height: 100%;

    background:
        var(--purple);

    transition:
        width .2s ease;

}


/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 1100px) {

    .stats-grid {

        grid-template-columns:
            repeat(2, 1fr);

    }

    .course-builder {

        grid-template-columns:
            280px 1fr;

    }

}


@media (max-width: 900px) {

    .admin-sidebar {

        width: 270px;

        transform:
            translateX(-100%);

    }


    .sidebar-open .admin-sidebar {

        transform:
            translateX(0);

    }


    .mobile-sidebar-close {

        display: block;

    }


    .admin-main {

        margin-left: 0;

    }


    .sidebar-toggle {

        display: grid;

        place-items: center;

    }


    .dashboard-grid {

        grid-template-columns: 1fr;

    }


    .course-builder {

        grid-template-columns: 1fr;

    }


    .builder-sidebar {

        max-height: 350px;

        border-right: 0;

        border-bottom:
            1px solid
            var(--border);

    }

}


@media (min-width: 901px) {

    .sidebar-overlay {

        display: none;

    }

}


@media (max-width: 700px) {

    .admin-content {

        padding:
            25px 16px 50px;

    }


    .admin-topbar {

        padding:
            0 16px;

    }


    .topbar-brand {

        display: none;

    }


    .page-heading-row {

        align-items: flex-start;

        flex-direction: column;

    }


    .stats-grid {

        grid-template-columns: 1fr;

    }


    .toolbar {

        flex-direction: column;

        align-items: stretch;

    }


    .search-box {

        max-width: none;

    }


    .course-row {

        grid-template-columns:
            56px 1fr;

    }


    .course-cover {

        width: 56px;
        height: 48px;

    }


    .course-actions {

        grid-column: 1 / -1;

        justify-content: flex-start;

    }


    .builder-course-selector {

        grid-template-columns: 1fr;

    }


    .builder-workspace {

        padding: 18px;

    }


    .editor-header {

        flex-direction: column;

    }


    .content-type-grid {

        grid-template-columns:
            repeat(2, 1fr);

    }


    .course-form-grid {

        grid-template-columns: 1fr;

    }

}


@media (max-width: 500px) {

    .admin-topbar {

        min-height: 72px;

    }


    .topbar-left h1 {

        font-size: 17px;

    }


    .content-type-grid {

        grid-template-columns: 1fr 1fr;

    }


    .course-modal {

        padding: 10px;

    }


    .course-modal-dialog {

        max-height:
            calc(100vh - 20px);

        border-radius: 14px;

    }


    .course-form {

        padding: 18px;

    }


    .course-modal-header {

        padding:
            18px;

    }

}
