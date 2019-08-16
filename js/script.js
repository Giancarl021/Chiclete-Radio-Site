let isPlaying = false;

function init() {
    const request = new XMLHttpRequest();

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

            for(const item of itemNodes) {
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
                    desc: getTag('description').replace(/<!\[CDATA\[/, '').replace(/]]>/,'')
                });
            }
            return data;
        }
    }
}

function showDetails(e) {
    const $d = document.getElementById('details-card');
    const getTag = str => $d.getElementsByTagName(str)[0];
    getTag('img').src = e.img;
    getTag('h1').innerText = e.title;
    $d.style.opacity = '1';
    $d.style.pointerEvents = 'all';
    // getTag('h2').onclick = playPodcast(e.src);
    getTag('h2').setAttribute('data-src', e.src); // <<< Gambiarra
    // getTag('h2').innerHTML = e.desc;
}

function playPodcast(src) {
    const $audio = document.getElementsByTagName('audio')[0];
    if(!isPlaying) {
        $audio.src = src;
        document.getElementById('details-card').getElementsByTagName('h2')[0].innerText = 'Pausar';

        $audio.play().then(() => {
            console.log('Podcast iniciado');
        });
    } else {
        if($audio.src !== src) {
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

document.addEventListener('DOMContentLoaded', init);
