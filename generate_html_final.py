import json
import codecs

data = {
    "Contraventions": [
        {"name": "Attentat à la pudeur", "amende": 3000, "peine": 0},
        {"name": "Circulation à contresens", "amende": 600, "peine": 0},
        {"name": "Conduite avec un véhicule non en état", "amende": 500, "peine": 0},
        {"name": "Conduite dangereuse (Drift, Wheeling...)", "amende": 1000, "peine": 0},
        {"name": "Conduite Hors route/hors piste", "amende": 1800, "peine": 0},
        {"name": "Demi-tour non autorisé", "amende": 500, "peine": 0},
        {"name": "Entrave à la circulation", "amende": 3000, "peine": 0},
        {"name": "Excès de vitesse 5 km/h à 25 km/h au dessus de la limite", "amende": 800, "peine": 0},
        {"name": "Excès de vitesse 26 km/h à 49 km/h au dessus de la limite", "amende": 1600, "peine": 0},
        {"name": "Excès de vitesse 50 km/h à 99 km/h au dessus de la limite", "amende": 3200, "peine": 15},
        {"name": "Franchissement d'une ligne continue", "amende": 200, "peine": 0},
        {"name": "Insulte envers un civil", "amende": 500, "peine": 0},
        {"name": "Ivresse ou consommation de stupéfiants sur la voie publique", "amende": 2000, "peine": 5},
        {"name": "Non respect des distances de sécurité (1.5 m)", "amende": 150, "peine": 0},
        {"name": "Non respect port du casque homologué", "amende": 300, "peine": 0},
        {"name": "Non respect d'un véhicule prioritaire", "amende": 900, "peine": 0},
        {"name": "Participation à une manifestation illégale", "amende": 1500, "peine": 15},
        {"name": "Stationnement gênant et/ou interdit (bande rouge)", "amende": 500, "peine": 0},
        {"name": "Usage abusif du Klaxon", "amende": 500, "peine": 0},
        {"name": "Violation de propriété privée", "amende": 1500, "peine": 15}
    ],
    "Délits Mineurs": [
        {"name": "Arme blanche sortie en publique sans motif légitime", "amende": 3000, "peine": 0},
        {"name": "Atteinte au droit à l'image", "amende": 850, "peine": 0},
        {"name": "Braquage de distributeur de billet", "amende": 3000, "peine": 20},
        {"name": "Cambriolage", "amende": 3000, "peine": 15},
        {"name": "Chantage", "amende": 3000, "peine": 0},
        {"name": "Conduite d'un véhicule volé", "amende": 1500, "peine": 10},
        {"name": "Conduite sans permis", "amende": 1500, "peine": 10},
        {"name": "Conduite sous l'emprise d'un état alcoolique", "amende": 1000, "peine": 0},
        {"name": "Conduite en ayant fait usage de stupéfiant", "amende": 1500, "peine": 0},
        {"name": "Dégradation de biens privés", "amende": 2500, "peine": 15},
        {"name": "Dégradation de biens publics", "amende": 2500, "peine": 10},
        {"name": "Délit de fuite", "amende": 4000, "peine": 20},
        {"name": "Diffamation", "amende": 2000, "peine": 10},
        {"name": "Discrimination", "amende": 1500, "peine": 10},
        {"name": "Dissimulation du visage sur la voie publique", "amende": 1500, "peine": 0},
        {"name": "Entrave à une opération des forces de l'ordre", "amende": 5000, "peine": 15},
        {"name": "Emploi d'une personne sans contrat de travail", "amende": 2500, "peine": 20},
        {"name": "Excès de vitesse supérieur à 101 km/h", "amende": 4000, "peine": 15},
        {"name": "Go fast", "amende": 5000, "peine": 10},
        {"name": "Harcèlement", "amende": 3000, "peine": 10},
        {"name": "Menace et/ou intimidation envers un civil", "amende": 3000, "peine": 15},
        {"name": "Menace et/ou intimidation envers un civil en ligne", "amende": 3000, "peine": 0},
        {"name": "Menace et/ou intimidation envers un représentant de l'Etat", "amende": 7000, "peine": 20},
        {"name": "Mise en danger de la vie d'autrui", "amende": 4000, "peine": 10},
        {"name": "Non présentation à une convocation des forces de l'ordre", "amende": 3000, "peine": 20},
        {"name": "Organisation d'une manifestation illégale", "amende": 3000, "peine": 15},
        {"name": "Outrage envers un représentant de l'Etat", "amende": 2000, "peine": 10},
        {"name": "Port/Détention d'un gilet par balle", "amende": 1500, "peine": 0},
        {"name": "Possession de produits stupéfiant mineur (de 5 à 9 pochons)", "amende": 5000, "peine": 10},
        {"name": "Possession produits illégaux", "amende": 200, "peine": 5},
        {"name": "Prise en flagrant délit de crochetage", "amende": 650, "peine": 0},
        {"name": "Refus d'obtempérer", "amende": 5000, "peine": 15},
        {"name": "Tentative de vol de véhicule", "amende": 1000, "peine": 5},
        {"name": "Trouble à l'ordre publique", "amende": 2000, "peine": 15},
        {"name": "Utilisation et/ou présentation de faux", "amende": 1500, "peine": 20},
        {"name": "Voie de fait/Outrage public", "amende": 1000, "peine": 0}
    ],
    "Délits Majeurs": [
        {"name": "Abus de confiance", "amende": 20000, "peine": 25},
        {"name": "Abus de pouvoir", "amende": 30000, "peine": 25},
        {"name": "Agression sur civil", "amende": 3000, "peine": 15},
        {"name": "Agression sur représentant de l'Etat", "amende": 10000, "peine": 30},
        {"name": "Arme à feu sortie en publique sans motif légitime", "amende": 6000, "peine": 10},
        {"name": "Association de malfaiteurs", "amende": 9000, "peine": 10},
        {"name": "Atteinte à la dignité humaine", "amende": 20000, "peine": 20},
        {"name": "Blanchiment d'argent", "amende": 10000, "peine": 15},
        {"name": "Braconnage", "amende": 2500, "peine": 15},
        {"name": "Vol à main armée sur civil", "amende": 6000, "peine": 20},
        {"name": "Braquage de supérette", "amende": 1500, "peine": 15},
        {"name": "Corruption / tentative de corruption", "amende": 70000, "peine": 30},
        {"name": "Destruction et/ou dissimulation de preuves", "amende": 8000, "peine": 25},
        {"name": "Dettes envers l'Etat", "amende": 0, "peine": 0},
        {"name": "Diffusion de contenu illégal en ligne", "amende": 8000, "peine": 25},
        {"name": "Divulgation d'informations confidentielles", "amende": 9000, "peine": 25},
        {"name": "Escroquerie à la personne", "amende": 5500, "peine": 20},
        {"name": "Escroquerie à l'entreprise", "amende": 6500, "peine": 45},
        {"name": "Entrave à une opération/enquête judiciaire", "amende": 8000, "peine": 15},
        {"name": "Exploitation du bien public sans autorisation", "amende": 10000, "peine": 10},
        {"name": "Fraude électorale", "amende": 75000, "peine": 0},
        {"name": "Incitation à la haine et à la violence", "amende": 10000, "peine": 10},
        {"name": "Mauvaise utilisation d'une arme à feu", "amende": 20000, "peine": 25},
        {"name": "Non assistance à personne en danger", "amende": 25000, "peine": 25},
        {"name": "Non-respect d'un contrôle judicaire", "amende": 15000, "peine": 0},
        {"name": "Non-respect d'un décret gouvernemental", "amende": 15000, "peine": 0},
        {"name": "Non-respect d'une décision de justice d'un citoyen", "amende": 10000, "peine": 30},
        {"name": "Non-respect d'une décision de justice (entreprise /FDO)", "amende": 25000, "peine": 0},
        {"name": "Non-respect d'une norme incendie", "amende": 10000, "peine": 0},
        {"name": "Organisation de jeux illégaux", "amende": 60000, "peine": 0},
        {"name": "Outrage à la cour", "amende": 7000, "peine": 15},
        {"name": "Parjure", "amende": 20000, "peine": 30},
        {"name": "Participation à une fusillade", "amende": 35000, "peine": 30},
        {"name": "Port illégal d'une arme blanche", "amende": 5000, "peine": 10},
        {"name": "Port illégal d'une arme de CAT D", "amende": 20000, "peine": 20},
        {"name": "Possession d'argents provenant d'un circuit illégale", "amende": 1000, "peine": 20},
        {"name": "Possession de produits stupéfiants majeur (10 à 99 pochons)", "amende": 6000, "peine": 15},
        {"name": "Pratique d'un emploi sans le diplôme/formation requis", "amende": 4000, "peine": 30},
        {"name": "Trafic d'animaux exotiques et/ou espèces protégées", "amende": 1500, "peine": 30},
        {"name": "Usurpation d'identité", "amende": 20000, "peine": 20},
        {"name": "Usurpation de fonction et/ou de poste", "amende": 25000, "peine": 25},
        {"name": "Vente/Achat illégal d'armes", "amende": 25000, "peine": 30},
        {"name": "Vente de produits illégaux", "amende": 8000, "peine": 10},
        {"name": "Violation du secret professionnel", "amende": 80000, "peine": 30},
        {"name": "Vol de véhicule", "amende": 9000, "peine": 25},
        {"name": "Vol de véhicule de l'Etat", "amende": 8000, "peine": 25}
    ],
    "Crimes": [
        {"name": "Braquage d'armurerie", "amende": 12000, "peine": 50},
        {"name": "Braquage de bijouterie", "amende": 80000, "peine": 55},
        {"name": "Braquage de banque", "amende": 25000, "peine": 60},
        {"name": "Braquage de la Banque Pacifique", "amende": 100000, "peine": 40},
        {"name": "Braquage de convoi d'arme", "amende": 50000, "peine": 35},
        {"name": "Braquage transporteur de fonds", "amende": 25000, "peine": 35},
        {"name": "Evasion d'un poste de police", "amende": 140000, "peine": 90},
        {"name": "Homicide involontaire", "amende": 200000, "peine": 60},
        {"name": "Incendie criminel", "amende": 8000, "peine": 75},
        {"name": "Obstruction à la justice", "amende": 20000, "peine": 20},
        {"name": "Organisation d'évasion", "amende": 150000, "peine": 60},
        {"name": "Port illégal d'une arme de CAT A", "amende": 300000, "peine": 60},
        {"name": "Port illégal d'une arme de CAT B", "amende": 100000, "peine": 45},
        {"name": "Prise d'otage sur un civil", "amende": 20000, "peine": 25},
        {"name": "Tentative d'évasion", "amende": 75000, "peine": 60},
        {"name": "Tentative d'enlèvement et/ou de séquestration", "amende": 80000, "peine": 30},
        {"name": "Tentative d'homicide sur civil", "amende": 200000, "peine": 90},
        {"name": "Trafic de produits stupéfiants majeur (100 pochons à 499)", "amende": 20000, "peine": 25}
    ],
    "Crimes Fédéraux": [
        {"name": "Acte lié au terrorisme", "amende": 800000, "peine": 9999},
        {"name": "Atteinte à la sécurité intérieur", "amende": 500000, "peine": 60},
        {"name": "Braquage de convoi fédéral", "amende": 50000, "peine": 60},
        {"name": "Chef d'une organisation criminelle", "amende": 700000, "peine": 9999},
        {"name": "Détournement de fonds (entreprise)", "amende": 60000, "peine": 40},
        {"name": "Enlèvement et/ou Séquestration", "amende": 60000, "peine": 60},
        {"name": "Évasion de la prison (Cavale)", "amende": 300000, "peine": 60},
        {"name": "Fraude fiscale", "amende": 50000, "peine": 60},
        {"name": "Membre d'une organisation criminelle", "amende": 80000, "peine": 90},
        {"name": "Meurtre/Homicide", "amende": 400000, "peine": 9999},
        {"name": "Haute trahison", "amende": 650000, "peine": 9999},
        {"name": "Non-présentation à une convocation de justice", "amende": 50000, "peine": 0},
        {"name": "Prise d'otage sur représentant de l'Etat", "amende": 40000, "peine": 60},
        {"name": "Tentative d'homicide sur représentant de l'Etat", "amende": 200000, "peine": 120},
        {"name": "Torture/acte de barbarie", "amende": 150000, "peine": 120},
        {"name": "Trafic d'arme", "amende": 250000, "peine": 60},
        {"name": "Trafic de produits stupéfiants majeur (500 pochons et +)", "amende": 55000, "peine": 60}
    ]
}

html = '<div class="calc-categories glass widget" style="max-height: 600px; overflow-y: auto;">\n'

for cat, items in data.items():
    if not items: continue
    
    html += f'    <div class="calc-group">\n'
    html += f'        <h4 class="calc-group-title">{cat}</h4>\n'
    
    for item in items:
        name = item['name'].replace('"', '&quot;')
        amende = item['amende']
        peine = item['peine']
        
        label_text = name
        
        if peine == 9999:
            peine_text = "Perpétuité"
        elif peine > 0:
            peine_text = f"{peine} mois"
        else:
            peine_text = ""
            
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
