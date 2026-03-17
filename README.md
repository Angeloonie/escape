# Het Mysterie van Zweinstein

## Hoe te spelen
Deze escaperoom speelt zich volledig af in de browser en neemt spelers mee door een magisch kasteel vol puzzels.

1. Open `index.html` in een browser.
2. Kies een moeilijkheidsgraad en start de timer.
3. Ga vanuit de Grote Zaal naar de verschillende kamers.
4. Los in elke ruimte de puzzel op om een woord of spreukdeel te verdienen.
5. Gebruik de verzamelde oplossingen om de laatste sloten te openen en de escape room uit te spelen.

De flow van het spel:
- `index.html`: intro en start van de escape room
- `grotezaal.html`: centrale hub van waaruit spelers naar kamers navigeren
- `room1.html` t/m `room5.html`: de puzzelkamers
- `exit.html`: eindscherm met behaalde tijd

Voor spelers:
- Speel bij voorkeur op een laptop of desktopbrowser voor de beste ervaring.
- Laat geluid aan staan voor extra sfeer en feedback.
- De voortgang en timer worden lokaal in de browser opgeslagen.

## Technische details
- Gebouwd met: HTML, CSS, JavaScript + AI tools
- Structuur: losse HTML-pagina's met gedeelde scripts voor timer, progressie, audio en navigatie
- Styling: centrale styling via `style.css` en extra room/timer-styling via bestanden in `assets/style/`
- Media: afbeeldingen, audio en video in `assets/images/` en `assets/sounds/`
- State management: browseropslag via `localStorage`, `sessionStorage` en `window.name`

Belangrijke technische onderdelen:
- `assets/style/timer.js`: beheert moeilijkheidsgraden, countdown en eindtijd
- `assets/style/progress.js`: bewaart kamerprogressie lokaal in de browser
- `assets/style/room-nav.js`: houdt navigatie tussen kamers en Grote Zaal consistent
- `assets/style/audio-fade.js`: zorgt voor vloeiende audio-in- en uitfade-effecten

AI tools gebruikt:
- ChatGPT - ondersteuning bij concepting, tekst, puzzelideeën en contentuitwerking
- Codex - ondersteuning bij code, debugging, documentatie en projectstructuur
- Gemini - extra hulp bij ideeën, tekstvarianten en creatieve iteratie
- CapCut - montage en afwerking van video- of mediacontent voor de ervaring

## Team
- Vincent - concept, ontwikkeling en projectuitwerking
- Bart - concept, ontwikkeling en projectuitwerking
- Chofra - concept, ontwikkeling en projectuitwerking
- Marjan - concept, ontwikkeling en projectuitwerking

## Bekende issues (optioneel)
- De escaperoom is opgebouwd als statische HTML-pagina's; er is geen backend of centrale save-service.
- Vooruitgang en timer hangen af van lokale browseropslag. Wissen van browserdata kan progressie resetten.
- Audio en video kunnen zich per browser iets anders gedragen, vooral rond autoplay-beperkingen.
- De thematiek verwijst duidelijk naar een bekende fictieve tovenaarswereld; controleer zelf of dit past binnen het beoogde gebruik of publicatiekanaal.

Privacy & Ethics:
- Alle content is fictief
- AI-gegenereerde elementen zijn gelabeld of moeten nog expliciet gelabeld worden waar van toepassing
- Geen persoonlijke data van derden gebruikt
