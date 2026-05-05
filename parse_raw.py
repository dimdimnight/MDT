import codecs

data = {}

with codecs.open('raw_data.txt', 'r', 'utf-8') as f:
    lines = f.readlines()

for line in lines:
    parts = line.split('\t')
    if len(parts) >= 7:
        cat = parts[2].strip()
        if cat in ['CATEGORIE', '']: continue
        
        name = parts[3].strip()
        if not name: continue
        
        amende_str = parts[4].replace('$', '').replace(' ', '').replace(' ', '').strip()
        amende = int(amende_str) if amende_str.isdigit() else 0
        
        peine_str = parts[6].strip()
        peine_minutes = 0
        if ':' in peine_str:
            h, m = peine_str.split(':')
            if h.isdigit() and m.isdigit():
                peine_minutes = int(h) * 60 + int(m)
        
        if cat not in data:
            data[cat] = []
        
        data[cat].append({
            'name': name,
            'amende': amende,
            'peine': peine_minutes
        })

html = '<div class="calc-categories" style="max-height: 600px; overflow-y: auto;">\n'

for cat, items in data.items():
    if not items: continue
    
    html += f'    <div class="calc-group">\n'
    html += f'        <h4 class="calc-group-title">{cat}</h4>\n'
    
    seen = set()
    for item in items:
        name = item['name'].replace('"', '&quot;')
        if name in seen: continue
        seen.add(name)
        
        amende = item['amende']
        peine = item['peine']
        
        label_text = name
        
        peine_text = ""
        if peine > 0:
            peine_text = f"{peine} mois"
            
        if amende > 0 and peine_text:
            label_text += f' (${amende}, {peine_text})'
        elif amende > 0:
            label_text += f' (${amende})'
        elif peine_text:
            label_text += f' ({peine_text})'
            
        html += f'        <label class="calc-item"><input type="checkbox" value="{name}" data-amende="{amende}" data-prison="{peine}"> {label_text}</label>\n'
        
    html += f'    </div>\n'

html += '</div>'

with codecs.open('calc_html.txt', 'w', 'utf-8') as f:
    f.write(html)

print("Parsed successfully!")
