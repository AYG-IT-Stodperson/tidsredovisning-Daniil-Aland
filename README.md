Tidapp – Tidsredovisning

En webbaserad tidsredovisningsapplikation byggd med HTML, CSS, JavaScript och PHP. Projektet skapades som en skoluppgift inom AYG-IT24 via GitHub Classroom.

## Om projektet

Tidappen låter användaren logga och hantera sin arbetstid genom ett enkelt webbgränssnitt. Applikationen har stöd för både desktop och mobil layout.

**Funktioner:**
- **Hem** (`index.html`) – Startsida med översikt och navigation
- **Aktiviteter** (`aktiviteter.html`) – Skapa och hantera aktiviteter/projekt
- **Uppgifter** (`uppgifter.html`) – Hantera uppgifter kopplade till aktiviteter
- **Totalt** (`sammanstallning.html`) – Sammanställning av loggad tid
- **Redigera** – Sidor för att redigera aktiviteter och uppgifter (`editAktivitet.html`, `editUppgift.html`)

**Teknikstack:**
- Frontend: HTML, CSS, JavaScript
- Backend: PHP (API-anrop via mappen `api/`)
- Databas: MySQL 9.x (`tidapp_db`)
- Licens: MIT

---

## Driftsättning (Deploy)

Eftersom applikationen använder PHP och MySQL behöver du en webbserver med stöd för båda.

### Alternativ 1 – Lokal server (enklast för test)

1. Installera [XAMPP](https://www.apachefriends.org/) eller [Laragon](https://laragon.org/)
2. Klona repot till webbserverns rotmapp:
   ```bash
   git clone https://github.com/AYG-IT-Stodperson/tidsredovisning-Daniil-Aland.git
   ```
   - XAMPP: klistra in i `C:/xampp/htdocs/`
   - Laragon: klistra in i `C:/laragon/www/`
3. Starta Apache och MySQL via kontrollpanelen
4. Sätt upp databasen (se [Databasinställning](#databasinst%C3%A4llning) nedan)
5. Öppna `http://localhost/tidsredovisning-Daniil-Aland/` i webbläsaren

### Alternativ 2 – Webbhotell / VPS

1. Ladda upp alla filer via FTP (t.ex. med [FileZilla](https://filezilla-project.org/)) till din servers `public_html/`-mapp
2. Se till att servern stödjer PHP 8.x och MySQL 8+
3. Skapa databasen på servern och importera SQL-schemat (se [Databasinställning](#databasinst%C3%A4llning))

### Alternativ 3 – GitHub Pages (fungerar ej)

> ⚠️ GitHub Pages stödjer inte PHP eller MySQL. Välj ett av alternativen ovan.

---

## Databasinställning

Applikationen använder MySQL med databasen `tidapp_db`.

### 1. Skapa databasen

Öppna MySQL-klienten (HeidiSQL, phpMyAdmin, eller terminalen) och kör:

```sql
CREATE DATABASE tidapp_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_swedish_ci;
```

### 2. Skapa tabellerna

```sql
CREATE TABLE IF NOT EXISTS `aktiviteter` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aktivitet` varchar(50) COLLATE utf8mb4_swedish_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `aktivitet` (`aktivitet`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_swedish_ci;

CREATE TABLE IF NOT EXISTS `uppgifter` (
  `id` int NOT NULL AUTO_INCREMENT,
  `aktivitet_id` int DEFAULT NULL,
  `datum` date NOT NULL,
  `varaktighet` time NOT NULL,
  `beskrivning` text COLLATE utf8mb4_swedish_ci,
  PRIMARY KEY (`id`),
  KEY `FK_uppgifter_aktiviteter` (`aktivitet_id`),
  CONSTRAINT `FK_uppgifter_aktiviteter`
    FOREIGN KEY (`aktivitet_id`) REFERENCES `aktiviteter` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_swedish_ci;
```

### 3. Konfigurera databasanslutningen

Hitta konfig-filen i `api/`-mappen och uppdatera med dina inställningar:

```php
$host     = '127.0.0.1';
$dbname   = 'tidapp_db';
$user     = 'root';   // Byt ut mot din MySQL-användare
$password = '';       // Byt ut mot ditt lösenord
```

> ⚠️ Lägg aldrig konfig-filen med riktiga lösenord i versionshantering. Lägg till den i `.gitignore` om du har känsliga uppgifter.

### Databasschema

```
aktiviteter
├── id          INT, AUTO_INCREMENT, PK
└── aktivitet   VARCHAR(50), UNIQUE

uppgifter
├── id            INT, AUTO_INCREMENT, PK
├── aktivitet_id  INT, FK → aktiviteter.id
├── datum         DATE
├── varaktighet   TIME
└── beskrivning   TEXT
```

---

## Fortsatt utveckling (Dev-miljö)

### Förutsättningar

- Git
- En editor, t.ex. [VS Code](https://code.visualstudio.com/)
- XAMPP eller Laragon (PHP + MySQL)

### Kom igång

1. **Klona repot:**
   ```bash
   git clone https://github.com/AYG-IT-Stodperson/tidsredovisning-Daniil-Aland.git
   cd tidsredovisning-Daniil-Aland
   ```

2. **Öppna i VS Code:**
   ```bash
   code .
   ```

3. **Starta lokal server och sätt upp databasen** (se sektionerna ovan)

4. **Öppna via servern** – inte direkt som fil, eftersom PHP-anropen annars inte fungerar:
   `http://localhost/tidsredovisning-Daniil-Aland/`

### Projektstruktur

```
tidsredovisning-Daniil-Aland/
├── api/                  # PHP-filer för backend/API-logik
├── css/                  # Stilmallar
├── js/                   # JavaScript-filer
├── images/               # Bilder
├── dummy/                # Testdata
├── dokumentation/        # Projektdokumentation
├── index.html            # Startsida
├── aktiviteter.html      # Aktivitetssida
├── uppgifter.html        # Uppgiftssida
├── sammanstallning.html  # Sammanställning
├── editAktivitet.html    # Redigera aktivitet
└── editUppgift.html      # Redigera uppgift
```

### Arbetsflöde

1. Skapa en ny branch för din feature:
   ```bash
   git checkout -b feature/min-funktion
   ```
2. Gör dina ändringar och committa:
   ```bash
   git add .
   git commit -m "Beskrivande meddelande"
   ```
3. Pusha och skapa en Pull Request mot `main`:
   ```bash
   git push origin feature/min-funktion
   ```

---

## Licens

MIT © 2026 ÅYG-IT-Stödperson
