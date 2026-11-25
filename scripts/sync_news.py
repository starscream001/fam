"""Update the static club feed using only the public FAM announcements channel."""
from datetime import date, datetime, timedelta, timezone
from hashlib import sha256
from html import escape
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
import json
import os
import re
import sys

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
CHANNEL = 'famcrsclub'
MSK = timezone(timedelta(hours=3))
MONTHS = 'января февраля марта апреля мая июня июля августа сентября октября ноября декабря'.split()
ARTICLE = re.compile(r'      <article\b[^>]*>.*?</article>', re.S)
SOURCE = re.compile(r'https://t\.me/famcrsclub/(\d+)\b')


def request(url, limit=4_000_000):
    with urlopen(Request(url, headers={'User-Agent': 'FAM-Club-News/1.0'}), timeout=25) as response:
        data = response.read(limit + 1)
        if len(data) > limit:
            raise ValueError('Response exceeds size limit')
        return data


def posts_since(last_id):
    url = f'https://t.me/s/{CHANNEL}'
    results = {}
    before = None
    while True:
        page = BeautifulSoup(request(url + (f'?before={before}' if before else '')), 'html.parser')
        batch = {int(node['data-post'].split('/')[1]): node for node in page.select('.tgme_widget_message[data-post]')
                 if re.fullmatch(CHANNEL + r'/\d+', node['data-post'])}
        if not batch or (before and min(batch) >= before):
            raise ValueError('Unexpected Telegram page; keeping published feed')
        results.update(batch)
        before = min(batch)
        if before <= last_id:
            return results


def post_data(node):
    text = node.select_one('.js-message_text')
    if text:
        for br in text.find_all('br'):
            br.replace_with('\n')
    body = text.get_text('', strip=False).strip() if text else ''
    photo = node.select_one('.tgme_widget_message_photo_wrap[style]')
    image = re.search(r"background-image:url\(['\"]?(https://[^)'\"]+)", photo['style']) if photo else None
    media = 'Видео' if node.select_one('video,.tgme_widget_message_video_player,.tgme_widget_message_roundvideo') else 'Фото' if photo else 'Новость'
    maps = [a['href'] for a in (text.select('a[href]') if text else []) if urlsplit(a['href']).scheme == 'https'
            and urlsplit(a['href']).hostname in {'yandex.ru','yandex.com','maps.app.goo.gl','2gis.ru'}
            and ('maps' in a['href'] or '2gis.ru' in a['href'])]
    stamp = datetime.fromisoformat(node.select_one('time[datetime]')['datetime']).astimezone(MSK)
    return body, stamp, media, image.group(1) if image else None, maps


def event_from(body, posted):
    if not re.search(r'FAMEET|собираемся|анонс встречи|приглашаем|FAMFEST', body, re.I):
        return None
    if re.search(r'отмен|перенос|перенес|прошл[аи]|состоял[а-я]+', body, re.I):
        return None
    match = re.search(r'\b(\d{1,2})\s+(' + '|'.join(MONTHS) + r')\b(?:\s+(20\d\d))?', body, re.I)
    if not match:
        return None
    month = MONTHS.index(match[2].lower()) + 1
    year = int(match[3] or posted.year + (posted.month == 12 and month == 1))
    try:
        day = date(year, month, int(match[1]))
    except ValueError:
        return None
    if not posted.date() <= day <= posted.date() + timedelta(days=370):
        return None
    return day


def headline(body, media):
    first = next((s.strip() for s in body.splitlines() if s.strip()), '')
    short = re.split(r'(?<=[.!?])\s+', first, maxsplit=1)[0]
    if not short:
        return media + ' из клуба FAM'
    if len(short) <= 85:
        return short
    return short[:82].rsplit(' ', 1)[0] + '…'


def cached_photo(post_id, url):
    if not url:
        return None
    host = urlsplit(url).hostname or ''
    if not (host.endswith('.telesco.pe') or host.endswith('.telegram-cdn.org') or host.endswith('.cdn-telegram.org')):
        return None
    path = Path('assets/club-news') / f'{post_id}.jpg'
    if not (ROOT / path).exists():
        data = request(url, 6_000_000)
        if not data.startswith(b'\xff\xd8\xff'):
            return None
        (ROOT / path).parent.mkdir(exist_ok=True)
        (ROOT / path).write_bytes(data)
    return path.as_posix()


def choose_title(body, default):
    # Optional extractive editor: only a literal phrase in the channel post is accepted.
    endpoint, model, key = (os.getenv(k) for k in ('FAM_AI_URL','FAM_AI_MODEL','FAM_AI_KEY'))
    if not (body and endpoint and model and key):
        return default
    messages = [{'role':'system','content':'Выбери короткую содержательную дословную фразу для заголовка из поста. Верни только её, до 85 символов.'},
                {'role':'user','content':body[:6000]}]
    try:
        req = Request(endpoint, data=json.dumps({'model':model,'messages':messages}).encode(),
                      headers={'Content-Type':'application/json','Authorization':'Bearer '+key})
        with urlopen(req, timeout=20) as response:
            title = json.load(response)['choices'][0]['message']['content'].strip()
        if 4 <= len(title) <= 85 and title in body:
            return title
    except Exception as error:
        print('AI title unavailable:', type(error).__name__, file=sys.stderr)
    return default


def date_label(day):
    return f'{day.day} {MONTHS[day.month - 1]} {day.year}'


def sync():
    news = ROOT / 'news.html'
    home = ROOT / 'index.html'
    source = news.read_text()
    articles = {int(SOURCE.findall(a)[-1]): a for a in ARTICLE.findall(source) if SOURCE.search(a)}
    latest = max(articles)
    posts = posts_since(latest)
    today = datetime.now(MSK).date()
    upcoming = []
    cancellations = []
    for post_id, node in sorted(posts.items()):
        if post_id <= latest and post_id not in articles:
            continue
        body, posted, media, photo, maps = post_data(node)
        digest = sha256((body + '\n' + media).encode()).hexdigest()[:20]
        old = articles.get(post_id, '')
        old_digest = re.search(r'data-revision="([a-f0-9]+)"', old)
        if old and not old_digest:
            articles[post_id] = old.replace('<article>', f'<article data-revision="{digest}">', 1)
        elif not old_digest or old_digest[1] != digest:
            original = f'https://t.me/{CHANNEL}/{post_id}'
            title = choose_title(body, headline(body, media))
            paras = ''.join(f'\n        <p>{escape(line)}</p>' for line in body.splitlines() if line.strip() and line.strip() != title)
            local_media = re.search(r'<video\b.*?</video>', old, re.S)
            image = cached_photo(post_id, photo)
            clip = node.select_one('video[src]')
            video_src = clip.get('src', '') if clip else ''
            host = urlsplit(video_src).hostname or ''
            if not local_media and video_src.startswith('https://') and host.endswith(('.telesco.pe', '.cdn-telegram.org', '.telegram-cdn.org')):
                clip_path = Path('assets/club-news') / f'{post_id}.mp4'
                if not (ROOT / clip_path).exists():
                    with urlopen(video_src, timeout=30) as response:
                        video_data = response.read(24_000_001)
                    if len(video_data) <= 24_000_000 and video_data[4:8] == b'ftyp':
                        (ROOT / clip_path).parent.mkdir(exist_ok=True)
                        (ROOT / clip_path).write_bytes(video_data)
                if (ROOT / clip_path).exists():
                    local_media = [f'<video class="story-video" controls playsinline preload="none" src="{clip_path.as_posix()}" aria-label="Видео клуба FAM"></video>']
            visual = local_media[0] if local_media else (f'<img class="post-photo" src="{image}" alt="Фото клуба FAM" loading="lazy">' if image else '')
            articles[post_id] = f'''      <article data-revision="{digest}">
        <time datetime="{posted.date()}">{date_label(posted.date())}</time>
        <h3>{escape(title)}</h3>{paras}
        {visual}
        <a class="source" href="{original}" target="_blank" rel="noopener noreferrer">Смотреть в Telegram</a>
      </article>'''
        if re.search(r'(встреч[ауи]|сходк[ауи]|fameet).{0,30}(отмен|перенос|перенес)|отменяем встречу|переносим встречу', body, re.I):
            cancellations.append(post_id)
        day = event_from(body, posted)
        if day and day >= today:
            upcoming.append((day, post_id, body, maps))
    # Upsert only individual known articles. Manually written articles and archive entries
    # outside Telegram's recent window remain exactly where they were.
    original_ids = set(map(int, SOURCE.findall(source)))
    def update(match):
        ids = SOURCE.findall(match[0])
        return articles[int(ids[-1])] if ids else match[0]
    updated = ARTICLE.sub(update, source)
    new = [articles[k] for k in sorted(set(articles) - original_ids, reverse=True)]
    if new:
        updated = updated.replace('<div class="stories">', '<div class="stories">\n' + '\n'.join(new), 1)
    upcoming = [event for event in upcoming if event[1] > max(cancellations, default=0)]
    front = home.read_text()
    photos = []
    for pid in sorted(articles, reverse=True):
        photo = re.search(r'<img class="post-photo" src="(assets/club-news/\d+\.jpg)"', articles[pid])
        if photo:
            photos.append(photo[1])
        if len(photos) == 2:
            break
    if photos:
        fallback = ['assets/fam-meet-1.jpg', 'assets/meet-people.jpg']
        slots = (photos + fallback)[:2]
        thumbs = ''.join(f'<a href="{path}"><img src="{path}" alt="Фото со встречи FAM" width="720" height="900" loading="lazy"></a>' for path in slots)
        front = re.sub(r'<!-- feed-photos:start -->.*?<!-- feed-photos:end -->', '<!-- feed-photos:start -->' + thumbs + '<!-- feed-photos:end -->', front, flags=re.S)
    tag = r'<!-- next-meeting:start -->.*?<!-- next-meeting:end -->'
    current = re.search(tag, front, re.S)
    if not current:
        raise ValueError('Missing meeting region')
    old_day = re.search(r'data-day="([\d-]+)" data-post="(\d+)"', current[0])
    preserve = old_day and old_day[1] >= today.isoformat() and int(old_day[2]) not in posts and int(old_day[2]) > max(cancellations, default=0)
    if not preserve or (upcoming and min(upcoming)[0].isoformat() < old_day[1]):
        if upcoming:
            day, post_id, body, maps = min(upcoming, key=lambda e:(e[0],-e[1]))
            time = re.search(r'\b(?:[01]?\d|2[0-3]):[0-5]\d\b', body)
            place = re.search(r'(?:📍|(?:место|адрес)\s*:)\s*([^\n]{2,120})', body, re.I)
            detail = ' · '.join(filter(None, [date_label(day), time[0] if time else '', place[1].strip() if place else '']))
            terms = re.search(r'(?:условия участия|регистрация|вход)\s*:\s*([^\n]{2,140})', body, re.I)
            if terms:
                detail += ' · ' + terms[0]
            map_link = f' <a href="{escape(maps[0], quote=True)}">Карта</a>' if maps else ''
            region = f'<div data-day="{day}" data-post="{post_id}"><p class="section-label">Ближайшая встреча</p><h2 id="meet-title">{escape(headline(body,"Встреча"))}</h2><p>{escape(detail)}{map_link}</p></div><a class="outline" href="https://t.me/{CHANNEL}/{post_id}">Открыть анонс</a>'
        else:
            region = '<div><p class="section-label">Ближайшая встреча</p><h2 id="meet-title">Готовим следующую встречу</h2><p>Дату и место опубликуем в канале «Анонсы FAM».</p></div><a class="outline" href="https://t.me/famcrsclub">Следить за анонсами</a>'
        front = front[:current.start()] + '<!-- next-meeting:start -->\n        ' + region + '\n        <!-- next-meeting:end -->' + front[current.end():]
    news.write_text(updated)
    home.write_text(front)
    print(f'Public channel checked. Added {len(new)}; retained {len(articles)} club posts.')


if __name__ == '__main__':
    sync()
