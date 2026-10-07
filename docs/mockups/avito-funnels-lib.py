import sys
S = '/tmp/claude-0/-home-user-city/b24292ea-8752-58b5-88d1-dfe08c967f1a/scratchpad/ads/'

sl = open(S + 'slides2-src.html').read()
st = open(S + 'set-src.html').read()
head = sl[:sl.index('/* ---------- v2 ---------- */')].replace('<title>Слайды Авито v2</title>', '<title>Слайды Авито 90</title>')
exp = sl[sl.index('body.export { padding: 0;'):sl.index('</style>') + 8]
css = open(S + 'v3/layouts.css').read()
w = st[st.index('<template id="s3">'):]
WALL = w[w.index('<div class="wall">'):w.index('<div class="band">')]
script = sl[sl.index('<script>'):]

LOGO = '<div class="logo">m<b>/</b>design</div>'
def WHO(sub='инфографика и фото с ИИ · WB · Ozon'):
    return f'<div class="who"><div class="face">фото</div><div><b>[Имя]</b><span>{sub}</span></div></div>'
def TOP(tag):
    return f'<div class="top">{LOGO}<div class="tag">{tag}</div></div>'

# ---------- раскладки ----------
def big(tag, h, sub, who=False):
    wh = '<div style="margin-top:32px">' + WHO() + '</div>' if who else ''
    right = f'<div><p class="sub">{sub}</p>{wh}</div>'
    return f'<div class="ad gB">{TOP(tag)}<div class="row"><div class="hl">{h}</div>{right}</div></div>'

def rows(tag, h, items):
    li = ''.join(f'<div class="it"><b>{i+1:02d}</b><strong>{t}</strong><span>{d}</span></div>' for i, (t, d) in enumerate(items))
    return f'<div class="ad gR">{TOP(tag)}<div class="hl">{h}</div><div class="list">{li}</div></div>'

def cards(tag, h, items, num=False):
    cs = ''.join(f'<div class="cd">{f"<i>{i+1:02d}</i>" if num else ""}<b>{t}</b><span>{d}</span></div>' for i, (t, d) in enumerate(items))
    return f'<div class="ad gC">{TOP(tag)}<div class="hl">{h}</div><div class="cs">{cs}</div></div>'

def dark(tag, h, sub, items, cross=False):
    ck = ''.join(f'<div>{t}</div>' for t in items)
    return f'<div class="ad gD"><div class="lp">{LOGO}<div class="hl">{h}</div><p class="sub">{sub}</p></div><div class="rp"><div class="tag">{tag}</div><div class="ck{" x" if cross else ""}">{ck}</div></div></div>'

def compare(tag, h, la, a, lb, b):
    ca = ''.join(f'<div>{t}</div>' for t in a); cb = ''.join(f'<div>{t}</div>' for t in b)
    return f'<div class="ad gV">{TOP(tag)}<div class="hl">{h}</div><div class="two"><div class="col a"><h4>{la}</h4>{ca}</div><div class="col b"><h4>{lb}</h4>{cb}</div></div></div>'

def bubbles(tag, h, msgs, who=True):
    ms = ''.join(f'<div class="m {s}"><small>{"клиент" if s == "in" else "[Имя]"}</small>{t}</div>' for s, t in msgs)
    return f'<div class="ad gU"><div class="l">{TOP(tag)}<div class="hl">{h}</div>{WHO() if who else ""}</div><div class="chat">{ms}</div></div>'

def portrait(tag, h, sub, chips=None, lst=None):
    ch = f'<div class="chips">{"".join(f"<span class=chip>{c}</span>" for c in chips)}</div>' if chips else ''
    ls = f'<div class="list">{"".join(f"<div><b>{i+1:02d}</b>{t}</div>" for i, t in enumerate(lst))}</div>' if lst else ''
    return f'<div class="ad gP"><div class="face">ваше фото · 3:4</div><div class="r">{TOP(tag)}<div class="hl">{h}</div><p class="sub">{sub}</p>{ch}{ls}</div></div>'

def phone(tag, h, sub, kind='feed', label='ваша карточка', msgs=None):
    if kind == 'feed':
        scr = '<div class="scr feed">' + ''.join(
            f'<div class="p {c}"><div class="im"></div><div class="ln pr"></div><div class="ln"></div><div class="ln s"></div></div>'
            for c in ['', label, '', '']) + '</div>'
    elif kind == 'page':
        scr = f'<div class="scr page"><div class="pimg">{label}</div><div class="pr">[цена] ₽</div><div class="ln"></div><div class="ln" style="width:70%"></div><div class="buy"></div></div>'
    else:
        scr = '<div class="scr chat">' + ''.join(f'<div class="m {s}">{"<div class=ph></div>" if p else ""}{t}</div>' for s, t, p in msgs) + '</div>'
    return f'<div class="ad gF"><div class="l">{TOP(tag)}<div class="hl">{h}</div><p class="sub">{sub}</p></div><div class="phone">{scr}</div></div>'

def slots(tag, h, items, arrow=False):
    parts = []
    for i, (t, d) in enumerate(items):
        if arrow and i: parts.append('<span class="ar">→</span>')
        parts.append(f'<div class="s"><div></div><span>{t} <em>{d}</em></span></div>')
    return f'<div class="ad gS">{TOP(tag)}<div class="hl">{h}</div><div class="sl">{"".join(parts)}</div></div>'

def words(tag, items):
    ws = ''.join(f'<div class="w2"><b>{t}</b><span>{d}</span></div>' for t, d in items)
    return f'<div class="ad gW">{TOP(tag)}<div class="ws">{ws}</div></div>'

def faq(tag, h, qa):
    q = ''.join(f'<div><b>{a}</b><span>{b}</span></div>' for a, b in qa)
    return f'<div class="ad gQ">{TOP(tag)}<div class="hl">{h}</div><div class="qa">{q}</div></div>'

def timeline(tag, h, steps):
    s = ''.join(f'<div><b>{i+1:02d}</b><strong>{t}</strong><span>{d}</span></div>' for i, (t, d) in enumerate(steps))
    return f'<div class="ad gT">{TOP(tag)}<div class="hl">{h}</div><div class="tl">{s}</div></div>'

def bento(h, tiles):
    pos = ['grid-column:4/6;grid-row:1/3', 'grid-column:6;grid-row:1/3', 'grid-column:1/3;grid-row:3/5', 'grid-column:3;grid-row:3/5', 'grid-column:4/6;grid-row:3/5', 'grid-column:6;grid-row:3/5']
    t = ''.join(f'<div class="tl2{" wh" if i % 2 == 0 else ""}" style="{pos[i]}"><span class="lb">{l}</span>{d}</div>' for i, (l, d) in enumerate(tiles))
    return f'<div class="ad gE"><div class="ttl">{LOGO}<div class="hl">{h}</div></div>{t}</div>'

def quote(tag, q, sub):
    return f'<div class="ad gO">{TOP(tag)}<div class="qm">“</div><div class="hl">{q}</div><p class="sub">{sub}</p>{WHO()}</div>'

def band(tag, h, chips):
    ch = ''.join(f'<span class="chip">{c}</span>' for c in chips)
    return f'<div class="ad WB gN">{WALL}<div class="band"><div class="hd"><div class="hl">{h}</div>{LOGO}</div><div class="chips">{ch}</div></div></div>'


# ---------- раскладки офферов ----------
def hero(tag, label, h, sub, code=None):
    c = f'<span class="code"><span>напишите</span>«{code}»</span>' if code else ''
    return f'<div class="ad gH">{TOP(tag)}<span class="lbl">{label}</span><div class="hl">{h}</div><div class="row"><p class="sub">{sub}</p>{c}</div></div>'

def ticket(tag, small, stub, h, conds, code=None):
    li = ''.join(f'<li>{c}</li>' for c in conds)
    c = f'<span class="code"><span>кодовое слово</span>«{code}»</span>' if code else ''
    return f'<div class="ad gK">{TOP(tag)}<div class="tk"><div class="stub"><small>{small}</small><b>{stub}</b></div><div class="body"><div class="hl">{h}</div><ul>{li}</ul>{c}</div></div></div>'

def ladder(tag, h, steps):
    hs = [240, 320, 400, 480]
    d = ''.join(f'<div style="height:{hs[i]}px"><span>{q}</span><b>{v}</b></div>' for i, (q, v) in enumerate(steps))
    return f'<div class="ad gL">{TOP(tag)}<div class="hl">{h}</div><div class="lad">{d}</div></div>'

def days(tag, h, sub, notes=None):
    notes = notes or [''] * 7
    d = ''.join(f'<div><small>день</small><b>{i+1}</b><span>{notes[i]}</span></div>' for i in range(7))
    return f'<div class="ad gY">{TOP(tag)}<div class="hl">{h}</div><p class="sub">{sub}</p><div class="dd">{d}</div></div>'

def gift(tag, h, a, b, r):
    bx = lambda cls, t: f'<div class="bx {cls}"><b>{t[0]}</b><span>{t[1]}</span></div>'
    return f'<div class="ad gG">{TOP(tag)}<div class="hl">{h}</div><div class="eqn">{bx("", a)}<div class="op">+</div>{bx("k", b)}<div class="op">=</div>{bx("r", r)}</div></div>'

def cta(tag, h, sub, code):
    return f'<div class="ad gZ">{TOP(tag)}<div class="hl">{h}</div><p class="sub">{sub}</p><div class="bar">{WHO()}<span class="code"><span>напишите в сообщения</span>«{code}»</span></div></div>'
