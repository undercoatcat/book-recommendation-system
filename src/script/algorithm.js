// The genreKeywords object was generated with AI.
let genreKeywords = {
    // Main genres
    fantasy: [
        'fantasy', 'high fantasy', 'low fantasy', 'urban fantasy',
        'dark fantasy', 'epic fantasy', 'magic', 'wizards',
        'witches', 'dragons', 'mythology', 'fairy tales'
    ],

    'science fiction': [
        'science fiction', 'sci-fi', 'space opera', 'space exploration',
        'cyberpunk', 'biopunk', 'steampunk', 'artificial intelligence',
        'robots', 'androids', 'aliens', 'futuristic'
    ],

    mystery: [
        'mystery', 'detective', 'detectives', 'whodunit',
        'murder mystery', 'investigation', 'puzzles', 'conspiracy'
    ],

    thriller: [
        'thriller', 'suspense', 'psychological thriller',
        'political thriller', 'espionage', 'survival thriller'
    ],

    horror: [
        'horror', 'ghost stories', 'supernatural horror',
        'psychological horror', 'cosmic horror', 'gothic horror',
        'vampires', 'zombies', 'monsters', 'haunted houses'
    ],

    romance: [
        'romance', 'love stories', 'romantic fiction',
        'romantic comedy', 'slow burn', 'relationship fiction'
    ],

    adventure: [
        'adventure', 'quest', 'exploration', 'survival',
        'expedition', 'journey', 'treasure hunting'
    ],

    dystopian: [
        'dystopian', 'utopia', 'post-apocalyptic',
        'apocalyptic fiction', 'totalitarianism'
    ],

    // Crime and investigation
    crime: [
        'crime', 'criminals', 'organized crime', 'gangsters',
        'mafia', 'heists', 'serial killers', 'true crime',
        'police procedural', 'forensic science'
    ],

    // Time-related
    'time travel': [
        'time travel', 'time loop', 'time loops',
        'time manipulation', 'alternate timelines',
        'parallel universes', 'time paradox'
    ],

    // Psychological and philosophical
    psychological: [
        'psychological fiction', 'psychological drama',
        'mind games', 'mental illness', 'human psychology',
        'identity', 'obsession', 'manipulation'
    ],

    philosophy: [
        'philosophy', 'existentialism', 'ethics',
        'moral dilemmas', 'absurdism', 'metaphysics'
    ],

    // LGBTQ+ romance
    'girls love': [
        'girls love', 'girl love', 'girls romance',
        'lesbian romance', 'lesbian fiction', 'yuri',
        'female same-sex relationships'
    ],

    'boys love': [
        'boys love', 'boy love', 'boys romance',
        'gay romance', 'male same-sex relationships',
        'yaoi', 'shounen ai'
    ],

    // Other romance and relationships
    'LGBTQ+ fiction': [
        'lgbtq', 'lgbt', 'queer fiction',
        'gay fiction', 'lesbian fiction',
        'bisexual fiction', 'transgender fiction'
    ],

    // Historical and cultural
    'historical fiction': [
        'historical fiction', 'historical romance',
        'medieval', 'ancient history', 'world war',
        'historical drama', 'period fiction'
    ],

    mythology: [
        'mythology', 'greek mythology', 'norse mythology',
        'egyptian mythology', 'hindu mythology',
        'folklore', 'legends'
    ],

    // Coming of age and youth
    'coming of age': [
        'coming of age', 'bildungsroman', 'adolescence',
        'teenage fiction', 'growing up'
    ],

    'young adult': [
        'young adult', 'ya fiction', 'teen fiction',
        'juvenile literature'
    ],

    // Drama and comedy
    drama: [
        'drama', 'family drama', 'social drama',
        'tragedy', 'melodrama'
    ],

    comedy: [
        'comedy', 'humor', 'satire', 'parody',
        'dark comedy', 'comic fiction'
    ],

    // Other popular categories
    sports: [
        'sports fiction', 'sports', 'football',
        'basketball', 'martial arts', 'racing'
    ],

    military: [
        'military fiction', 'war fiction', 'military science',
        'soldiers', 'warfare'
    ],

    western: [
        'western fiction', 'wild west', 'cowboys',
        'frontier'
    ],

    supernatural: [
        'supernatural', 'paranormal', 'occult',
        'demons', 'angels', 'spirits'
    ]
};

function getSeriesName(book) {
    let title = (book.title || '').toLowerCase();

    title = title.replace(
        /\s*[-:,(]?\s*(?:book|volume|vol\.?)\s*\d+.*$/i,
        ''
    );

    return title.trim();
}

function getGenre(subject) {
    subject = subject.toLowerCase();

    let matchedGenres = [];

    for (let genre in genreKeywords) {
        if (genreKeywords[genre].some(keyword =>
            subject.includes(keyword.toLowerCase())
        )) {
            matchedGenres.push(genre);
        }
    }

    return matchedGenres;
}

async function generateRecommendations(likedBooks) {
    if (likedBooks.length === 0) {
        return [];
    }

    /*let genres = [
        'fantasy',
        'science fiction',
        'mystery',
        'thrillers',
        'horror',
        'romance',
        'historical fiction',
        'adventure',
        'crime',
        'comedy',
        'drama',
        'philosophy',
        'young adult fiction',
        'dystopian'
    ];*/
    
    let subjectCounts = {};

    likedBooks.forEach(book => {
        if (book.subject) {
            book.subject.forEach(subject => {
                let name = subject.toLowerCase();

                //ignoredSubjects to filter out generic subjects that don't help
                let ignoredSubjects = [
                    'fiction',
                    'juvenile fiction',
                    'accessible book',
                    'protected daisy'
                ];

                if (ignoredSubjects.includes(name)) return;

                subjectCounts[name] = (subjectCounts[name] || 0) + 1;
            });

        }
    });

    let topSubjects = Object.entries(subjectCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (topSubjects.length === 0) {
        return [];

    }

    let likedKeys = new Set(likedBooks.map(book => book.key));

    let likedAuthors = new Set(
        likedBooks.flatMap(book => book.author_name || [])
            .map(author => author.toLowerCase())
    );

    let recommendations = new Map();

    let genreCounts = {};

    likedBooks.forEach(book => {
        (book.subject || []).forEach(subject => {
            let matchedGenres = getGenre(subject);

            matchedGenres.forEach(genre => {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
        });
    });

    await Promise.all(topSubjects.map(async ([subject, count]) => {
        let subjectSlug = subject.replace(/\s+/g, '_');

        let response = await fetch(
            `https://openlibrary.org/subjects/${encodeURIComponent(subjectSlug)}.json?limit=30`
        );

        if (!response.ok) return;

        let data = await response.json();

        data.works.forEach(work => {


            if (likedKeys.has(work.key)) return;

            let authors = (work.authors || [])
                .map(author => author.name)
                .filter(Boolean);

            let book = recommendations.get(work.key);

            if (!book) {
                book = {
                    key: work.key,
                    title: work.title,
                    author_name: authors,
                    subject: work.subject || [],
                    cover_i: work.cover_id,
                    first_publish_year: work.first_publish_year,
                    score: 0,
                    matchedSubjects: []
                };

                recommendations.set(work.key, book);
            }


            //score system for recc
            let matchedGenres = getGenre(subject);

            let genreScore = matchedGenres.reduce((total, genre) => {
                return total + (genreCounts[genre] || 0);
            }, 0);

            book.score += count * 2;

            book.score += genreScore * 3;

            if (!book.matchedSubjects.includes(subject)) {
                book.matchedSubjects.push(subject);
            }

        });
    }));



    recommendations.forEach(book => {
        if (book.author_name.some(author =>
            likedAuthors.has(author.toLowerCase())
        )) {
            book.score += 4;
        }
    });


    let sortedBooks = Array.from(recommendations.values())
        .sort((a, b) => b.score - a.score);

    let selectedBooks = [];
    let authorCounts = {};
    let selectedSeries = new Set();

    for (let book of sortedBooks) {
        let authors = book.author_name || [];

        let alreadyRecommended = authors.some(author =>
            (authorCounts[author.toLowerCase()] || 0) >= 2
        );

        if (alreadyRecommended) continue;

        let series = getSeriesName(book);

        if (selectedSeries.has(series)) continue;

        selectedBooks.push(book);

        authors.forEach(author => {
            let name = author.toLowerCase();
            authorCounts[name] = (authorCounts[name] || 0) + 1;
        });

        selectedSeries.add(series);

        if (selectedBooks.length === 20) break;
    }

    return selectedBooks;
}
