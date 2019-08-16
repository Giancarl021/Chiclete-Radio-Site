let isPlaying = false;
let $detailsCard, $backlock;
const scroll = {x: 0, y: 0};

function init() {
    const request = new XMLHttpRequest();

    window.onresize = setScroll;

    $detailsCard = document.getElementById('details-card');
    $backlock = document.getElementById('backlock');

    request.addEventListener('load', e => {
        decodeXML(e.currentTarget);
    });
    request.onerror = () => {
        console.error('Não pode carregar XML')
    };
    request.open('GET', 'https://feed.podbean.com/chicleteradioativo/feed.xml');
    request.send();

    function decodeXML(src) {
        if (!src.response) {
            console.error('Não pode recuperar dados do XML');
            return;
        }

        const text = src.response;
        const xml = getXMLfromString(text);
        const data = RSStoJSON(xml);

        data.episodes.forEach(e => {
            const $el = document.createElement('img');
            $el.className = 'episode';
            $el.src = e.img;
            $el.onclick = () => showDetails(e);
            $el.title = e.title;
            document.getElementsByTagName('section')[0].appendChild($el);
        });

        function getXMLfromString(string) {
            const parser = new DOMParser();
            return parser.parseFromString(string, 'text/xml');
        }

        function RSStoJSON(xml) {
            const data = {
                episodes: []
            };

            const itemNodes = xml.getElementsByTagName('item');

            for (const item of itemNodes) {
                // console.log(item);
                // return;
                const getTag = str => item.getElementsByTagName(str)[0].innerHTML;
                const getUrl = str => item.getElementsByTagName(str)[0].getAttribute('url');
                data.episodes.push({
                    title: getTag('title'),
                    link: getTag('link'),
                    commentLinks: getTag('comments'),
                    releaseDate: getTag('pubDate'),
                    src: getUrl('enclosure'),
                    img: getUrl('media:content'),
                    desc: getTag('description').replace(/<!\[CDATA\[/, '').replace(/]]>/, '')
                });
            }
            return data;
        }
    }
}

function showDetails(e) {
    const getTag = str => $detailsCard.getElementsByTagName(str)[0];
    getTag('img').src = e.img;
    getTag('h1').innerText = e.title;
    $detailsCard.style.opacity = '1';
    $detailsCard.style.pointerEvents = 'all';
    // getTag('h2').onclick = playPodcast(e.src);
    getTag('h2').setAttribute('data-src', e.src); // <<< Gambiarra
    // getTag('h2').innerHTML = e.desc;

    $backlock.style.height = '100vh';
    $backlock.style.display = 'inherit';
    // document.body.style.overflow = 'hidden';
    setScroll();
    window.onscroll = () => {
        window.scrollTo(scroll.x, scroll.y)
    };
}

function blurCard() {
    $detailsCard.style.opacity = '0';
    $detailsCard.style.pointerEvents = 'none';
    $backlock.style.display = 'none';
    // document.body.style.overflow = 'auto';
    window.onscroll = undefined;
}

function playPodcast(src) {
    const $audio = document.getElementsByTagName('audio')[0];
    if (!isPlaying) {
        $audio.src = src;
        document.getElementById('details-card').getElementsByTagName('h2')[0].innerText = 'Pausar';

        $audio.play().then(() => {
            console.log('Podcast iniciado');
        });
    } else {
        if ($audio.src !== src) {
            $audio.src = src;
            $audio.play().then(() => {
                console.log('Podcast iniciado');
            });
        } else {
            $audio.pause();
            document.getElementById('details-card').getElementsByTagName('h2')[0].innerText = 'Tocar';
        }
    }
    isPlaying = !isPlaying;

}

function setScroll() {
    scroll.x = window.scrollX;
    scroll.y = window.scrollY;
}

document.addEventListener('DOMContentLoaded', init);
