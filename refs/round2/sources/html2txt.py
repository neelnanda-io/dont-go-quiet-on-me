"""Convert a transformer-circuits HTML paper into readable text, keeping figure captions and headings.
Strips scripts/styles and huge inline data blobs."""
import sys, re
from bs4 import BeautifulSoup

src, dst = sys.argv[1], sys.argv[2]
html = open(src, encoding="utf-8", errors="replace").read()
# Drop massive inline data (base64 images, JSON blobs inside scripts) before parsing to save memory
html = re.sub(r'data:[a-z]+/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+', 'DATAURI', html)
soup = BeautifulSoup(html, "html.parser")
for t in soup(["script", "style", "noscript", "svg"]):
    t.decompose()
# Mark headings and figure captions
for level in range(1, 6):
    for h in soup.find_all(f"h{level}"):
        h.insert_before("\n\n" + "#" * level + " ")
        h.insert_after("\n")
for fc in soup.find_all(["figcaption"]):
    fc.insert_before("\n[FIGCAPTION] ")
    fc.insert_after("\n")
for li in soup.find_all("li"):
    li.insert_before("\n- ")
for p in soup.find_all(["p", "div", "br", "tr", "blockquote", "pre"]):
    p.insert_after("\n")
text = soup.get_text()
text = re.sub(r'[ \t]+', ' ', text)
text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
open(dst, "w").write(text)
print(dst, len(text), "chars", len(text.split()), "words")
