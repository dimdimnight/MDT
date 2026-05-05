import codecs
import re

with codecs.open('index.html', 'r', 'utf-8') as f:
    content = f.read()

search_html = '''
                        <div class="calc-categories-container glass widget">
                            <div class="calc-search" style="margin-bottom: 15px;">
                                <input type="text" id="calc-search-input" placeholder="Rechercher une infraction... (ex: vitesse, braquage)" style="width: 100%; padding: 12px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px; font-size: 1rem;">
                            </div>
                            <div class="calc-categories" style="max-height: 550px; overflow-y: auto; padding-right: 10px;">
'''

new_content = re.sub(
    r'<div class="calc-categories glass widget" style="max-height: 600px; overflow-y: auto;">',
    search_html,
    content
)

new_content = re.sub(
    r'(    </div>\n</div>)\n                        <!-- Total & Action -->',
    r'\1\n                        </div>\n                        <!-- Total & Action -->',
    new_content
)

with codecs.open('index.html', 'w', 'utf-8') as f:
    f.write(new_content)

print('HTML updated.')
