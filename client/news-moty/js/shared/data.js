// Sample data and state
const articlesDict = {
    "All" : [],
    "sports": [],
    "business": []
};
//const sampleArticles = [
//    {
//        "source": {
//            "id": "wired",
//            "name": "Wired"
//        },
//        "author": "Joel Khalili",
//        "title": "A False Start on the Road to an All-American Bitcoin",
//        "description": "Donald Trump pledged to cement the US as the bitcoin mining capital of the planet. The president’s sweeping tariffs stand to simultaneously undermine and advance that ambition in one swoop.",
//        "url": "https://www.wired.com/story/a-false-start-on-the-road-to-an-all-american-bitcoin/",
//        "urlToImage": "https://media.wired.com/photos/68531ba03ca23a58119ac365/191:100/w_1280,c_limit/061825-amercian-bitcoin-false-start.jpg",
//        "publishedAt": "2025-06-20T09:30:00Z",
//        "content": "Mining firms are also facing heightened competition for limited energy resources in the US, mostly from AI companies flush with venture funding. New projections from the US Department of Energy indic… [+3401 chars]"
//    },
//    {
//        "source": {
//            "id": "the-verge",
//            "name": "The Verge"
//        },
//        "author": "Emma Roth",
//        "title": "Trump’s media company says it’s buying $2.5 billion in Bitcoin",
//        "description": "President Donald Trump’s media company could soon own $2.5 billion in Bitcoin. On Tuesday, Trump Media announced that it’s working with “approximately 50 institutional investors” to sell and issue $1.5 billion in stock and $1 billion in convertible notes. The…",
//        "url": "https://www.theverge.com/news/674684/trump-media-bitcoin-treasury-deal",
//        "urlToImage": "https://platform.theverge.com/wp-content/uploads/sites/2/2025/03/STK466_ELECTION_2024_CVirginia_F.webp?quality=90&strip=all&crop=0%2C10.732984293194%2C100%2C78.534031413613&w=1200",
//        "publishedAt": "2025-05-27T14:31:48Z",
//        "content": "The Truth Social operator will get the money from a deal with investors.\r\nThe Truth Social operator will get the money from a deal with investors.\r\nPresident Donald Trumps media company could soon ow… [+1795 chars]"
//    },
//    {
//        "source": {
//            "id": null,
//            "name": "Gizmodo.com"
//        },
//        "author": "Luc Olinga",
//        "title": "Bitcoin Who? Wall Street Has a New Crypto Obsession",
//        "description": "While Bitcoin hits new highs, a little-known company is capturing the imagination of investors with a simple, yet revolutionary, idea: the stablecoin.",
//        "url": "https://gizmodo.com/bitcoin-who-wall-street-has-a-new-crypto-obsession-2000618478",
//        "urlToImage": "https://gizmodo.com/app/uploads/2024/09/An-image-of-Bitcoin-cryptocurrency.jpg",
//        "publishedAt": "2025-06-21T14:28:22Z",
//        "content": "For over a decade, Bitcoin has been the undisputed face of digital finance. When you think “crypto,” you think Bitcoin. Its surges and crashes have been treated as bellwethers for the entire industry… [+3123 chars]"
//    }
//];
//const availableTags = ['Sports', 'Business'];

let currentUser = JSON.parse(localStorage.getItem('user'));
let savedArticles = [];
let sharedArticles = [];
let userTags = [];
let users = [/* ... */];
let articleComments = {};
let articleReports = [];
