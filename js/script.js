/* ==========================================================
   ACADEMIA POLIGLOTA
   TEACHING MATERIALS PLATFORM
========================================================== */


/* ==========================================================
   BOOK DATABASE
==========================================================

   ADD YOUR BOOKS HERE.

   programme:
   kids / teens / adults

   language:
   english / french / portuguese /
   mandarin / arabic / spanish

   The URL is the URL of the individual
   presentation website.

========================================================== */


const books = [

    /* ======================================================
       ENGLISH — ADULTS
    ====================================================== */

    {
        title: "English A1",
        level: "A1",
        language: "English",
        languageKey: "english",
        programme: "Adults",
        programmeKey: "adults",
        cover: "images/books/english-a1.jpg",
        url: "https://hwa1.vercel.app"
    },


    {
        title: "English A2",
        level: "Elementary",
        language: "English",
        languageKey: "english",
        programme: "Adults",
        programmeKey: "adults",
        cover: "images/books/english-a2.jpg",
        url: "https://hwa2.vercel.app"
    },


    {
        title: "English B1",
        level: "Pre-Intermediate",
        language: "English",
        languageKey: "english",
        programme: "Adults",
        programmeKey: "adults",
        cover: "images/books/english-b1.jpg",
        url: "https://YOUR-ENGLISH-B1-SITE.vercel.app"
    },


    {
        title: "English B1+",
        level: "Intermediate",
        language: "English",
        languageKey: "english",
        programme: "Adults",
        programmeKey: "adults",
        cover: "images/books/english-b1plus.jpg",
        url: "https://test1965.vercel.app"
    },


    {
        title: "English C1",
        level: "Upper Intermediate",
        language: "English",
        languageKey: "english",
        programme: "Adults",
        programmeKey: "adults",
        cover: "images/books/english-c1.jpg",
        url: "https://YOUR-ENGLISH-C1-SITE.vercel.app"
    },


    {
        title: "English C2",
        level: "Advanced",
        language: "English",
        languageKey: "english",
        programme: "Adults",
        programmeKey: "adults",
        cover: "images/books/english-c2.jpg",
        url: "https://YOUR-ENGLISH-C2-SITE.vercel.app"
    },


    /* ======================================================
       ENGLISH — KIDS
    ====================================================== */

    {
        title: "English Kids Starters 1",
        level: "Starter",
        language: "English",
        languageKey: "english",
        programme: "Kids",
        programmeKey: "kids",
        cover: "images/books/kids-starters1.jpg",
        url: "https://kbx1.vercel.app"
    },


    {
        title: "English Kids Level 1",
        level: "Level 1",
        language: "English",
        languageKey: "english",
        programme: "Kids",
        programmeKey: "kids",
        cover: "images/books/kids-starters2.jpg",
        url: "https://kbx2.vercel.app"
    },


    /* ======================================================
       ENGLISH — TEENS
    ====================================================== */

    {
        title: "English Teens Starter",
        level: "Starter",
        language: "English",
        languageKey: "english",
        programme: "Teens",
        programmeKey: "teens",
        cover: "images/books/teens-starter.jpg",
        url: "https://tha1.vercel.app"
    },


    {
        title: "English Teens Level 1",
        level: "Level 1",
        language: "English",
        languageKey: "english",
        programme: "Teens",
        programmeKey: "teens",
        cover: "images/books/teens-level-1.jpg",
        url: "https://YOUR-TEENS-LEVEL1-SITE.vercel.app"
    },


    /* ======================================================
       FRENCH
    ====================================================== */

    {
        title: "French A1",
        level: "Beginner",
        language: "French",
        languageKey: "french",
        programme: "Adults",
        programmeKey: "adults",
        cover: "images/books/french-a1.jpg",
        url: "https://YOUR-FRENCH-A1-SITE.vercel.app"
    },


    {
        title: "French A2",
        level: "Elementary",
        language: "French",
        languageKey: "french",
        programme: "Adults",
        programmeKey: "adults",
        cover: "images/books/french-a2.jpg",
        url: "https://YOUR-FRENCH-A2-SITE.vercel.app"
    },


    {
        title: "French B1",
        level: "Pre-Intermediate",
        language: "French",
        languageKey: "french",
        programme: "Adults",
        programmeKey: "adults",
        cover: "images/books/french-b1.jpg",
        url: "https://YOUR-FRENCH-B1-SITE.vercel.app"
    },


    /* ======================================================
       PORTUGUESE
    ====================================================== */

    {
        title: "Portuguese A1",
        level: "Beginner",
        language: "Portuguese",
        languageKey: "portuguese",
        programme: "Adults",
        programmeKey: "adults",
        cover: "images/books/portuguese-a1.jpg",
        url: "https://YOUR-PORTUGUESE-A1-SITE.vercel.app"
    },


    {
        title: "Portuguese A2",
        level: "Elementary",
        language: "Portuguese",
        languageKey: "portuguese",
        programme: "Adults",
        programmeKey: "adults",
        cover: "images/books/portuguese-a2.jpg",
        url: "https://YOUR-PORTUGUESE-A2-SITE.vercel.app"
    },


    /* ======================================================
       MANDARIN
    ====================================================== */

    {
        title: "Mandarin A1",
        level: "Beginner",
        language: "Mandarin",
        languageKey: "mandarin",
        programme: "Adults",
        programmeKey: "adults",
        cover: "images/books/mandarin-a1.jpg",
        url: "https://YOUR-MANDARIN-A1-SITE.vercel.app"
    },


    {
        title: "Mandarin A2",
        level: "Elementary",
        language: "Mandarin",
        languageKey: "mandarin",
        programme: "Adults",
        programmeKey: "adults",
        cover: "images/books/mandarin-a2.jpg",
        url: "https://YOUR-MANDARIN-A2-SITE.vercel.app"
    },


    /* ======================================================
       ARABIC
    ====================================================== */

    {
        title: "Arabic A1",
        level: "Beginner",
        language: "Arabic",
        languageKey: "arabic",
        programme: "Adults",
        programmeKey: "adults",
        cover: "images/books/arabic-a1.jpg",
        url: "https://YOUR-ARABIC-A1-SITE.vercel.app"
    },


    {
        title: "Arabic A2",
        level: "Elementary",
        language: "Arabic",
        languageKey: "arabic",
        programme: "Adults",
        programmeKey: "adults",
        cover: "images/books/arabic-a2.jpg",
        url: "https://YOUR-ARABIC-A2-SITE.vercel.app"
    },


    /* ======================================================
       SPANISH
    ====================================================== */

    {
        title: "Spanish A1",
        level: "Beginner",
        language: "Spanish",
        languageKey: "spanish",
        programme: "Adults",
        programmeKey: "adults",
        cover: "images/books/spanish-a1.jpg",
        url: "https://YOUR-SPANISH-A1-SITE.vercel.app"
    },


    {
        title: "Spanish A2",
        level: "Elementary",
        language: "Spanish",
        languageKey: "spanish",
        programme: "Adults",
        programmeKey: "adults",
        cover: "images/books/spanish-a2.jpg",
        url: "https://YOUR-SPANISH-A2-SITE.vercel.app"
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

year.textContent =
    new Date().getFullYear();



/* ==========================================================
   CREATE BOOK CARDS
========================================================== */

function createBookCards() {

    bookGrid.innerHTML = "";


    books.forEach(
        (book, index) => {

            const article =
                document.createElement("article");


            article.className =
                "book-card";


            article.dataset.language =
                book.languageKey;


            article.dataset.programme =
                book.programmeKey;


            article.dataset.search =
                (
                    book.title +
                    " " +
                    book.level +
                    " " +
                    book.language +
                    " " +
                    book.programme
                ).toLowerCase();


            article.innerHTML = `

                <a
                    href="${book.url}"
                    class="book-card-link"
                    target="_self"
                    aria-label="Open ${book.title}"
                >

                    <div class="book-cover-wrapper">

                        <img
                            src="${book.cover}"
                            alt="${book.title}"
                            class="book-cover"
                            loading="lazy"
                        >


                        <div class="book-hover">

                            <div class="open-button">

                                <span>
                                    OPEN PLATFORM
                                </span>

                                <span class="open-arrow">
                                    →
                                </span>

                            </div>

                        </div>

                    </div>


                    <div class="book-information">

                        <div class="book-language">
                            ${book.language.toUpperCase()}
                            ·
                            ${book.programme.toUpperCase()}
                        </div>


                        <div class="book-title">
                            ${book.title}
                        </div>


                        <div class="book-level">
                            ${book.level}
                        </div>

                    </div>

                </a>

            `;


            bookGrid.appendChild(article);

        }
    );



    /*
        Start observing the cards
        after creating them.
    */

    observeCards();

}



/* ==========================================================
   FILTER BOOKS
========================================================== */

function filterBooks() {

    const cards =
        document.querySelectorAll(
            ".book-card"
        );


    let visibleCount = 0;


    cards.forEach(
        card => {

            const language =
                card.dataset.language;


            const programme =
                card.dataset.programme;


            const searchableText =
                card.dataset.search;


            let matchesFilter = false;


            /*
                ALL
            */

            if (
                activeFilter === "all"
            ) {

                matchesFilter = true;

            }


            /*
                PROGRAMME
            */

            else if (
                activeFilter === "kids" ||
                activeFilter === "teens" ||
                activeFilter === "adults"
            ) {

                matchesFilter =
                    programme === activeFilter;

            }


            /*
                LANGUAGE
            */

            else {

                matchesFilter =
                    language === activeFilter;

            }


            /*
                SEARCH
            */

            const matchesSearch =
                searchTerm === "" ||
                searchableText.includes(
                    searchTerm
                );


            /*
                FINAL RESULT
            */

            const visible =
                matchesFilter &&
                matchesSearch;


            if (visible) {

                card.classList.remove(
                    "hide"
                );

                visibleCount++;

            } else {

                card.classList.add(
                    "hide"
                );

                card.classList.remove(
                    "show"
                );

            }

        }
    );


    /*
        No results
    */

    if (visibleCount === 0) {

        noResults.classList.add(
            "visible"
        );

    } else {

        noResults.classList.remove(
            "visible"
        );

    }


    /*
        Animate visible cards
    */

    requestAnimationFrame(
        () => {

            document
                .querySelectorAll(
                    ".book-card:not(.hide)"
                )
                .forEach(
                    (card, index) => {

                        card.style.transitionDelay =
                            `${index * 0.045}s`;

                        requestAnimationFrame(
                            () => {

                                card.classList.add(
                                    "show"
                                );

                            }
                        );

                    }
                );

        }
    );

}



/* ==========================================================
   CHANGE TITLE
========================================================== */

const titles = {

    all:
        "All Materials",

    kids:
        "Kids",

    teens:
        "Teens",

    adults:
        "Adults",

    english:
        "English",

    french:
        "French",

    portuguese:
        "Portuguese",

    mandarin:
        "Mandarin",

    arabic:
        "Arabic",

    spanish:
        "Spanish"

};


function changeTitle(
    filter
) {

    libraryTitle.textContent =
        titles[filter] ||
        "All Materials";

}



/* ==========================================================
   SET ACTIVE FILTER
========================================================== */

function setFilter(
    filter
) {

    activeFilter =
        filter;


    /*
        Navigation
    */

    navigationButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.filter === filter
            );

        }
    );


    /*
        Filter pills
    */

    filterButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.filter === filter
            );

        }
    );


    changeTitle(filter);

    filterBooks();

}



/* ==========================================================
   NAVIGATION BUTTONS
========================================================== */

navigationButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                setFilter(
                    button.dataset.filter
                );


                /*
                    Close mobile
                    navigation.
                */

                if (
                    window.innerWidth <= 768
                ) {

                    closeMobileSidebar();

                }

            }
        );

    }
);



/* ==========================================================
   FILTER BUTTONS
========================================================== */

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                setFilter(
                    button.dataset.filter
                );

            }
        );

    }
);



/* ==========================================================
   SEARCH
========================================================== */

searchInput.addEventListener(
    "input",
    event => {

        searchTerm =
            event.target.value
                .toLowerCase()
                .trim();


        filterBooks();

    }
);



/* ==========================================================
   SIDEBAR TOGGLE
========================================================== */

menuButton.addEventListener(
    "click",
    () => {

        /*
            Desktop
        */

        if (
            window.innerWidth > 768
        ) {

            sidebar.classList.toggle(
                "collapsed"
            );

        }


        /*
            Mobile
        */

        else {

            sidebar.classList.toggle(
                "mobile-open"
            );

            backdrop.classList.toggle(
                "active"
            );

        }

    }
);



/* ==========================================================
   CLOSE MOBILE SIDEBAR
========================================================== */

function closeMobileSidebar() {

    sidebar.classList.remove(
        "mobile-open"
    );

    backdrop.classList.remove(
        "active"
    );

}


backdrop.addEventListener(
    "click",
    closeMobileSidebar
);



/* ==========================================================
   ESCAPE KEY
========================================================== */

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



/* ==========================================================
   SCROLL ANIMATION
========================================================== */

let cardObserver;


function observeCards() {

    /*
        Disconnect previous observer.
    */

    if (cardObserver) {

        cardObserver.disconnect();

    }


    cardObserver =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "show"
                            );


                            /*
                                Once animated,
                                stop observing it.
                            */

                            cardObserver.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.12,

                rootMargin:
                    "0px 0px -50px 0px"
            }
        );


   
