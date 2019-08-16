let isPlaying = false, isInit = false;
let $detailsCard, $backlock, $audio, $aBtn, $timestamp;
const scroll = {x: 0, y: 0};
let timestamp;

function init() {
    const request = new XMLHttpRequest();

    window.onresize = setScroll;

    $detailsCard = document.getElementById('details-card');
    $backlock = document.getElementById('backlock');
    $audio = document.getElementsByTagName('audio')[0];
    $aBtn = document.getElementById('audio-btn');
    $timestamp = document.getElementById('current-time');
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
    getTag('h2').setAttribute('data-src', e.src);
    getTag('h2').setAttribute('data-title', e.title);

    $backlock.style.height = '100vh';
    $backlock.style.display = 'inherit';
    setScroll();
    window.onscroll = () => {
        window.scrollTo(scroll.x, scroll.y)
    };
}

function blurCard() {
    $detailsCard.style.opacity = '0';
    $detailsCard.style.pointerEvents = 'none';
    $backlock.style.display = 'none';
    window.onscroll = undefined;
}

function playPodcast(src, title) {
    const $aPlayer = document.getElementById('audio-player');
    if (src === $audio.src) return;
    if (!isPlaying) {
        $audio.src = src;
        // document.getElementById('audio-player').getElementsByTagName('h1')[0].innerText = title;
        if (!isInit) {
            $aPlayer.style.opacity = '1';
            $timestamp.parentElement.style.backgroundColor = 'rgba(176, 205, 61, 0.4)';
            timestamp = setInterval(changeTime, 500);
            isInit = true;
        }
        audioCtrl();
    } else {
        $audio.src = src;
        audioCtrl();
    }
    isPlaying = !isPlaying;

}

function audioCtrl() {
    if (!$audio.src) return;
    if (isPlaying) {
        $audio.pause();
        $aBtn.src = 'img/play.svg';
    } else {
        $audio.play().then(() => {
            $aBtn.src = 'img/pause.svg';
        });
    }
    isPlaying = !isPlaying;
}

function setScroll() {
    scroll.x = window.scrollX;
    scroll.y = window.scrollY;
}

function changeTime() {
    $timestamp.style.width = ($audio.currentTime / $audio.duration) * 100 + '%';
}

document.addEventListener('DOMContentLoaded', init);
