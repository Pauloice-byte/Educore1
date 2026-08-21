/* ==========================================================
   EDUCORE
   AUTONOMOUS LEARNING PLATFORM
========================================================== */


/* ==========================================================
   COURSE DATABASE
==========================================================

   Add new courses here.

   categoryKey:
   language / ms-office / trading /
   technology / business / finance /
   personal-development

   programmeKey:
   autonomous / guided / blended

   url:
   URL of the individual course platform/page.
========================================================== */


const courses = [

    /* ======================================================
       LANGUAGE
    ====================================================== */

    {
        title: "English A1",
        level: "Beginner",
        category: "Language",
        categoryKey: "language",
        programme: "Autonomous",
        programmeKey: "autonomous",
        cover: "images/books/english-a1.jpg",
        url: "https://hwa1.vercel.app"
    },

    {
        title: "English A2",
        level: "Elementary",
        category: "Language",
        categoryKey: "language",
        programme: "Autonomous",
        programmeKey: "autonomous",
        cover: "images/books/english-a2.jpg",
        url: "https://hwa2.vercel.app"
    },

    {
        title: "French A1",
        level: "Beginner",
        category: "Language",
        categoryKey: "language",
        programme: "Blended",
        programmeKey: "blended",
        cover: "images/books/french-a1.jpg",
        url: "#"
    },

    {
        title: "Portuguese A1",
        level: "Beginner",
        category: "Language",
        categoryKey: "language",
        programme: "Guided",
        programmeKey: "guided",
        cover: "images/books/portuguese-a1.jpg",
        url: "#"
    },


    /* ======================================================
       MS OFFICE
    ====================================================== */

    {
        title: "Microsoft Word",
        level: "Complete Course",
        category: "MS Office",
        categoryKey: "ms-office",
        programme: "Autonomous",
        programmeKey: "autonomous",
        cover: "images/books/ms-word.jpg",
        url: "#"
    },

    {
        title: "Microsoft Excel",
        level: "Beginner to Advanced",
        category: "MS Office",
        categoryKey: "ms-office",
        programme: "Autonomous",
        programmeKey: "autonomous",
        cover: "images/books/ms-excel.jpg",
        url: "#"
    },

    {
        title: "Microsoft PowerPoint",
        level: "Complete Course",
        category: "MS Office",
        categoryKey: "ms-office",
        programme: "Autonomous",
        programmeKey: "autonomous",
        cover: "images/books/ms-powerpoint.jpg",
        url: "#"
    },


    /* ======================================================
       TRADING
    ====================================================== */

    {
        title: "Trading Fundamentals",
        level: "Beginner",
        category: "Trading",
        categoryKey: "trading",
        programme: "Blended",
        programmeKey: "blended",
        cover: "images/books/trading-fundamentals.jpg",
        url: "#"
    },

    {
        title: "Technical Analysis",
        level: "Intermediate",
        category: "Trading",
        categoryKey: "trading",
        programme: "Autonomous",
        programmeKey: "autonomous",
        cover: "images/books/technical-analysis.jpg",
        url: "#"
    },


    /* ======================================================
       TECHNOLOGY
    ====================================================== */

    {
        title: "Web Development",
        level: "Beginner",
        category: "Technology",
        categoryKey: "technology",
        programme: "Autonomous",
        programmeKey: "autonomous",
        cover: "images/books/web-development.jpg",
        url: "#"
    },

    {
        title: "Programming Fundamentals",
        level: "Beginner",
        category: "Technology",
        categoryKey: "technology",
        programme: "Blended",
        programmeKey: "blended",
        cover: "images/books/programming.jpg",
        url: "#"
    },


    /* ======================================================
       BUSINESS
    ====================================================== */

    {
        title: "Business Fundamentals",
        level: "Complete Course",
        category: "Business",
        categoryKey: "business",
        programme: "Blended",
        programmeKey: "blended",
        cover: "images/books/business.jpg",
        url: "#"
    },

    {
        title: "Business Communication",
        level: "Professional",
        category: "Business",
        categoryKey: "business",
        programme: "Guided",
        programmeKey: "guided",
        cover: "images/books/business-communication.jpg",
        url: "#"
    },


    /* ======================================================
       FINANCE
    ====================================================== */

    {
        title: "Personal Finance",
        level: "Beginner",
        category: "Finance",
        categoryKey: "finance",
        programme: "Autonomous",
        programmeKey: "autonomous",
        cover: "images/books/personal-finance.jpg",
        url: "#"
    },

    {
        title: "Financial Markets",
        level: "Intermediate",
        category: "Finance",
        categoryKey: "finance",
        programme: "Blended",
        programmeKey: "blended",
        cover: "images/books/financial-markets.jpg",
        url: "#"
    },


    /* ======================================================
       PERSONAL DEVELOPMENT
    ====================================================== */

    {
        title: "Productivity",
        level: "Complete Course",
        category: "Personal Development",
        categoryKey: "personal-development",
        programme: "Autonomous",
        programmeKey: "autonomous",
        cover: "images/books/productivity.jpg",
        url: "#"
    },

    {
        title: "Communication Skills",
        level: "Professional",
        category: "Personal Development",
        categoryKey: "personal-development",
        programme: "Guided",
        programmeKey: "guided",
        cover: "images/books/communication.jpg",
        url: "#"
    }

];



/* ==========================================================
   ELEMENTS
========================================================== */

const sidebar =
    document.getElementById("sidebar");

const main =
    document.getElementById("main");

const menuButton =
    document.getElementById("menuButton");

const backdrop =
    document.getElementById("sidebarBackdrop");

const bookGrid =
    document.getElementById("bookGrid");

const noResults =
    document.getElementById("noResults");

const searchInput =
    document.getElementById("searchInput");

const libraryTitle =
    document.getElementById("libraryTitle");

const navigationButtons =
    document.querySelectorAll(
        ".navigation-button"
    );

const filterButtons =
    document.querySelectorAll(
        ".filter-button"
    );

const year =
    document.getElementById("year");



/* ==========================================================
   STATE
========================================================== */

let activeFilter = "all";

let searchTerm = "";



/* ==========================================================
   YEAR
========================================================== */

if (year) {

    year.textContent =
        new Date().getFullYear();

}



/* ==========================================================
   CREATE COURSE CARDS
========================================================== */

function createCourseCards() {

    if (!bookGrid) {
        return;
    }


    bookGrid.innerHTML = "";


    courses.forEach(
        (course) => {

            const article =
                document.createElement("article");


            article.className =
                "book-card";


            article.dataset.category =
                course.categoryKey;


            /*
                Keep the old data attributes too.
                This makes the new system compatible
                with the existing CSS/HTML structure.
            */

            article.dataset.language =
                course.categoryKey;


            article.dataset.programme =
                course.programmeKey;


            article.dataset.search =
                (
                    course.title +
                    " " +
                    course.level +
                    " " +
                    course.category +
                    " " +
                    course.programme
                ).toLowerCase();


            /*
                A real URL opens normally.

                "#" courses are still displayed,
                but clicking them does not send the
                user to a broken page.
            */

            const courseURL =
                course.url && course.url !== "#"
                    ? course.url
                    : "#";


            article.innerHTML = `

                <a
                    href="${courseURL}"
                    class="book-card-link"
                    target="_self"
                    aria-label="Open ${course.title}"
                >

                    <div class="book-cover-wrapper">

                        <img
                            src="${course.cover}"
                            alt="${course.title}"
                            class="book-cover"
                            loading="lazy"
                        >


                        <div class="book-hover">

                            <div class="open-button">

                                <span>
                                    OPEN COURSE
                                </span>

                                <span class="open-arrow">
                                    →
                                </span>

                            </div>

                        </div>

                    </div>


                    <div class="book-information">

                        <div class="book-language">
                            ${course.category.toUpperCase()}
                            ·
                            ${course.programme.toUpperCase()}
                        </div>


                        <div class="book-title">
                            ${course.title}
                        </div>


                        <div class="book-level">
                            ${course.level}
                        </div>

                    </div>

                </a>

            `;


            /*
                Prevent "#" courses from jumping
                to the top of the page.
            */

            if (courseURL === "#") {

                const link =
                    article.querySelector(
                        ".book-card-link"
                    );


                link.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                    }
                );

            }


            bookGrid.appendChild(
                article
            );

        }
    );


    observeCards();

}



/* ==========================================================
   FILTER COURSES
========================================================== */

function filterCourses() {

    if (!bookGrid) {
        return;
    }


    const cards =
        document.querySelectorAll(
            ".book-card"
        );


    let visibleCount = 0;


    cards.forEach(
        card => {

            const category =
                card.dataset.category;


            const programme =
                card.dataset.programme;


            const searchableText =
                card.dataset.search;


            let matchesFilter = false;


            /*
                ALL COURSES
            */

            if (
                activeFilter === "all"
            ) {

                matchesFilter = true;

            }


            /*
                LEARNING MODE
            */

            else if (
                activeFilter === "autonomous" ||
                activeFilter === "blended" ||
                activeFilter === "guided"
            ) {

                matchesFilter =
                    programme === activeFilter;

            }


            /*
                COURSE CATEGORY
            */

            else {

                matchesFilter
