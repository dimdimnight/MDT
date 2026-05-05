import codecs
import re

with codecs.open('calc_html.txt', 'r', 'utf-8') as f:
    calc_html = f.read()

with codecs.open('index.html', 'r', 'utf-8') as f:
    content = f.read()

new_content = re.sub(
    r'<div class="calc-categories" style="max-height: 600px; overflow-y: auto;">.*?(?=    </div>\n</div>\n                        </div>\n                        <!-- Total & Action -->)',
    calc_html + '\n',
    content,
    flags=re.DOTALL
)

with codecs.open('index.html', 'w', 'utf-8') as f:
    f.write(new_content)

print('Injection via Regex successful')
