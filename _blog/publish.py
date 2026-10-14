# Line: personal / joshdlange
"""Stdlib-only blog publisher. Runs locally (from build.py) and in GitHub Actions.
Reads _blog/posts/*.md and _blog/shell.html under the repo root; writes blog/index.html, blog/<slug>.html and the blog entries in sitemap.xml.
A post is published when its front-matter date (YYYY-MM-DD) is today (America/Chicago) or earlier. Idempotent."""
import re, sys, html, pathlib, datetime, json
from zoneinfo import ZoneInfo

ROOT = pathlib.Path(sys.argv[1]).resolve() if len(sys.argv) > 1 and not sys.argv[1].startswith("--") else pathlib.Path(__file__).resolve().parent.parent
TODAY = datetime.datetime.now(ZoneInfo("America/Chicago")).date()
if "--today" in sys.argv: TODAY = datetime.date.fromisoformat(sys.argv[sys.argv.index("--today") + 1])
BASE = "https://joshdlange.com"
E = html.escape
LINKS = {"/assessment": "/assessment.html", "/products": "/products.html", "/revenue": "/revenue.html"}

def inline(t):
    t = E(t, quote=False)
    t = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", lambda m: f'<a href="{LINKS.get(m.group(2), m.group(2))}"' + (' target="_blank" rel="noopener"' if m.group(2).startswith("http") else "") + f">{m.group(1)}</a>", t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    return t

def render(md):
    out, para, lst = [], [], None
    def flush():
        nonlocal para, lst
        if para: out.append("<p>" + inline(" ".join(para)) + "</p>"); para = []
        if lst: out.append(f"</{lst}>"); lst = None
    for ln in md.splitlines():
        s = ln.strip()
        if not s or s.startswith("Line: personal"): flush(); continue
        if s.startswith("## "): flush(); out.append(f"<h2>{inline(s[3:])}</h2>"); continue
        m = re.match(r"(-|\d+\.)\s+(.*)", s)
        if m:
            kind = "ul" if m.group(1) == "-" else "ol"
            if lst != kind: flush(); out.append(f"<{kind}>"); lst = kind
            out.append(f"<li>{inline(m.group(2))}</li>"); continue
        if lst: flush()
        para.append(s)
    flush()
    body = "\n".join(out)
    # the closing CTA paragraph (starts with Show me yours.) becomes a callout
    body = re.sub(r"<p>(<strong>Show me yours\.</strong>.*?)</p>", r'<p class="callout">\1</p>', body, count=1, flags=re.S)
    return body

def load(f):
    t = f.read_text()
    m = re.match(r"---\n(.*?)\n---\n(.*)", t, re.S)
    meta = {k.strip(): v.strip().strip('"') for k, v in (l.split(":", 1) for l in m.group(1).splitlines() if ":" in l)}
    return meta, m.group(2)

def fmt(d): return d.strftime("%B ") + str(d.day) + d.strftime(", %Y")

shell = (ROOT / "_blog/shell.html").read_text()
def page(path, title, desc, canon, body, ld=""):
    h = shell.replace("{{TITLE}}", E(title)).replace("{{DESC}}", E(desc)).replace("{{CANON}}", canon).replace("{{LD}}", ld).replace("{{BODY}}", body)
    path.write_text(h)

posts = []
for f in sorted((ROOT / "_blog/posts").glob("*.md")):
    meta, md = load(f)
    try: d = datetime.date.fromisoformat(meta["date"])
    except ValueError: print("skip (no real date):", f.name); continue
    if d > TODAY: print("not yet:", f.name, d); continue
    slug = re.sub(r"^\d+-", "", f.stem)
    posts.append((d, f.name, slug, meta, md))
posts.sort(key=lambda p: (-p[0].toordinal(), p[1]))

(ROOT / "blog").mkdir(exist_ok=True)
keep = {"index.html"}
for d, _, slug, meta, md in posts:
    keep.add(slug + ".html")
    ld = '<script type="application/ld+json">\n' + json.dumps({"@context": "https://schema.org", "@type": "BlogPosting", "headline": meta["title"], "description": meta["description"], "datePublished": d.isoformat(), "dateModified": d.isoformat(), "mainEntityOfPage": f"{BASE}/blog/{slug}.html", "author": {"@type": "Person", "name": "Josh Lange", "url": BASE + "/"}, "publisher": {"@type": "Person", "name": "Josh Lange"}}, indent=2) + "\n</script>\n"
    body = (f'<article class="post"><div class="wrap post-in"><a class="back" href="./">&larr; All posts</a>'
            f'<p class="eyebrow a-in">Blog</p><h1 class="a-in">{E(meta["title"], quote=False)}</h1>'
            f'<p class="byline a-in">By Josh Lange &middot; <time datetime="{d.isoformat()}">{fmt(d)}</time></p>'
            f'<div class="prose a-in">\n{render(md)}\n</div></div></article>')
    page(ROOT / "blog" / (slug + ".html"), meta["title"] + " | Josh Lange", meta["description"], f"{BASE}/blog/{slug}.html", body, ld)

cards = "".join(f'<li><a class="bcard" href="{slug}.html"><time datetime="{d.isoformat()}">{fmt(d)}</time><h2>{E(meta["title"], quote=False)}</h2><p>{E(meta["description"], quote=False)}</p><span class="tl">Read the post &rarr;</span></a></li>' for d, _, slug, meta, _ in posts)
idx = (f'<section class="hero blog-hero"><div class="wrap"><p class="eyebrow a-in">Blog</p><h1 class="a-in">Notes on finding the <em>bottleneck.</em></h1>'
       f'<p class="one a-in">Short, plain posts on the one place work gets stuck in a small business, and how to fix it for good.</p></div></section>'
       f'<section class="sec" style="padding-top:0"><div class="wrap"><ul class="blist stag">{cards}</ul></div></section>')
page(ROOT / "blog/index.html", "Blog | Josh Lange, AI and Custom Software for Small Business", "Plain-language posts on finding the one bottleneck in your business, automating it and fixing it for the long term.", f"{BASE}/blog/", idx)

for f in (ROOT / "blog").glob("*.html"):
    if f.name not in keep: f.unlink()

# sitemap: drop old blog entries, add current ones
sm = ROOT / "sitemap.xml"; t = sm.read_text()
t = re.sub(r"\s*<url><loc>https://joshdlange\.com/blog/[^<]*</loc>(<lastmod>[^<]*</lastmod>)?</url>", "", t)
add = "".join(f"\n  <url><loc>{BASE}/blog/{n}</loc><lastmod>{d.isoformat()}</lastmod></url>" for n, d in [("", max(p[0] for p in posts))] + [(s + ".html", d) for d, _, s, _, _ in posts]) if posts else ""
t = t.replace("</urlset>", add.lstrip("\n").join(["  ", ""]) if False else add + "\n</urlset>")
sm.write_text(t)
print("published", len(posts), "posts as of", TODAY)
