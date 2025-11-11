# Chat Online - Aplikacja do czatu wewnętrznego firmy

Prosta aplikacja czatu w czasie rzeczywistym zbudowana z użyciem Node.js, TypeScript, Socket.IO i MySQL.

## Funkcjonalności

- **Logowanie użytkowników** - Proste uwierzytelnianie
- **Czaty w pokojach** - Dołączanie i opuszczanie pokojów czatu
- **Wiadomości tekstowe** - Wysyłanie wiadomości w czasie rzeczywistym
- **Wysyłanie plików** - Możliwość dołączania plików i zdjęć do wiadomości
- **Responsywny interfejs** - Prosty i intuicyjny frontend

## Technologie

- **Backend**: Node.js, TypeScript, Express.js
- **WebSocket**: Socket.IO dla komunikacji w czasie rzeczywistym
- **Baza danych**: MySQL
- **Upload plików**: Multer
- **Frontend**: HTML, CSS, JavaScript/TypeScript

## Instalacja

1. Zainstaluj zależności:
   ```bash
   npm install
   ```

2. Skonfiguruj bazę danych MySQL:
   - Uruchom skrypt `database_setup.sql` w MySQL
   - Upewnij się, że serwer MySQL jest uruchomiony
   - Zaktualizuj dane połączenia w `server/server.ts` jeśli potrzebne

3. Zbuduj projekt:
   ```bash
   npm run build
   ```

4. Uruchom aplikację:
   ```bash
   npm start
   ```

   Lub uruchom w trybie deweloperskim:
   ```bash
   npm run dev
   ```

5. Otwórz przeglądarkę i przejdź do `http://localhost:3000`

## Użycie

1. **Skonfiguruj bazę danych:**
   ```bash
   # Uruchom skrypt SQL na serwerze MySQL
   mysql -u root -p < database_setup.sql
   ```

2. **Utwórz użytkownika administratora:**
   ```bash
   npx ts-node server/create_admin.ts
   ```

3. **Uruchom aplikację:**
   ```bash
   npm run build
   npm start
   ```

4. **Otwórz stronę logowania:**
   - http://localhost:3000/login.html

5. **Zaloguj się używając konta administratora:**
   - admin / admin123

   Lub innych przykładowych kont (po uruchomieniu `create_admin.ts`):
   - user1 / pass1
   - user2 / pass2
   - user3 / pass3

2. Wybierz pokój czatu (General, Praca, Random)

3. Wysyłaj wiadomości tekstowe lub dołączaj pliki

4. Opuść pokój używając przycisku "Opuść pokój"

## Struktura projektu

```
chat_online/
├── server/
│   ├── server.ts          # Główny plik serwera
│   ├── create_admin.ts    # Skrypt tworzenia użytkownika admin
│   └── uploads/           # Katalog na przesłane pliki
├── client/
│   ├── public/
│   │   ├── index.html     # Oryginalna strona (deprecated)
│   │   ├── login.html     # Strona logowania
│   │   ├── chat.html      # Strona czatu
│   │   ├── style.css      # Style CSS
│   │   ├── login.js       # JavaScript strony logowania
│   │   ├── chat.js        # JavaScript strony czatu
│   │   └── app.js         # Oryginalny JavaScript (deprecated)
│   └── src/
│       ├── login.ts       # Kod TypeScript strony logowania
│       ├── chat.ts        # Kod TypeScript strony czatu
│       └── app.ts         # Oryginalny kod TypeScript (deprecated)
├── database_setup.sql     # Skrypt konfiguracji bazy danych
├── package.json
├── tsconfig.json
└── README.md
```

## Uwagi bezpieczeństwa

Ta aplikacja jest przeznaczona dla celów demonstracyjnych. W środowisku produkcyjnym:

- Hasła powinny być hashowane (np. bcrypt)
- Dodaj walidację danych wejściowych
- Zaimplementuj uwierzytelnianie JWT
- Dodaj obsługę błędów
- Skonfiguruj HTTPS
- Dodaj limity wielkości plików i typy MIME

## Licencja

ISC