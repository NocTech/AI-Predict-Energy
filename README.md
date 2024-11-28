# AI-Predict-Energy

1. Skapa ett api nyckel för openweathermap: https://home.openweathermap.org/api_keys
2. Open file index.js lägg till nyckeln mellan "": (Rad 11)

const WEATHER_API_KEY = ""

3. run: npm install
4. run npm start

Gui: http://localhost:3000

http://localhost:3000/optimizedEnergy kräver hour int i body.

http://localhost:3000/predictEnergy kräver location string in body.

Mer info nedan i API Dokumentation här under:

---

## **API Dokumentation**

### **Base URL**
```
http://localhost:3000
```

---

### **1. Prediktera energiförbrukning**
#### **Endpoint**
```
GET /predictEnergy
```

#### **Beskrivning**
Predikterar energiförbrukningen för en specifik timme på dagen baserat på tränad energiförbrukningsmodell.

#### **Query-parametrar**
| Parameter | Typ    | Obligatorisk | Beskrivning                               |
|-----------|--------|--------------|-------------------------------------------|
| `hour`    | Integer | Ja           | Timmen på dagen (0–23).                   |

#### **Exempel på förfrågan**
```
GET /predictEnergy?hour=14
```

#### **Exempel på svar**
```json
{
  "hour": "14",
  "predictedUsage": "3.56"
}
```

#### **Felmeddelanden**
- **400 Bad Request**: Om `hour` saknas eller inte är ett heltal mellan 0 och 23.
  ```json
  { "error": "Hour parameter must be an integer between 0 and 23." }
  ```

---

### **2. Optimera energiförbrukning baserat på väder**
#### **Endpoint**
```
GET /optimizedEnergy
```

#### **Beskrivning**
Optimerar energiförbrukningen baserat på aktuella väderförhållanden för en specifik plats. Använder justeringsfaktorer som temperatur, vindhastighet, luftfuktighet och väderförhållanden.

#### **Query-parametrar**
| Parameter  | Typ    | Obligatorisk | Beskrivning                     |
|------------|--------|--------------|---------------------------------|
| `location` | String | Ja           | Namnet på platsen (stad).       |

#### **Exempel på förfrågan**
```
GET /optimizedEnergy?location=Stockholm
```

#### **Exempel på svar**
```json
{
  "weather": "Clouds",
  "currentTemp": 15,
  "windSpeed": 5,
  "humidity": 60,
  "optimizedUsage": [
    { "hour": 0, "usage": "1.32" },
    { "hour": 1, "usage": "1.10" },
    { "hour": 2, "usage": "0.99" },
    { "hour": 3, "usage": "0.88" },
    ...
    { "hour": 23, "usage": "0.88" }
  ]
}
```

#### **Felmeddelanden**
- **400 Bad Request**: Om `location` saknas.
  ```json
  { "error": "Location parameter is required." }
  ```
- **500 Internal Server Error**: Om väderdata inte kan hämtas.
  ```json
  { "error": "Error fetching weather data." }
  ```

---

### **3. Startsida**
#### **Endpoint**
```
GET /
```

#### **Beskrivning**
Renderar en startsida som kan användas för att visa eller testa API:et. Kan byggas ut med frontend-logik i EJS.

#### **Exempel på förfrågan**
```
GET /
```

#### **Svar**
- Returnerar en GUI i webbläsaren. HTML-sida. Ingen JSON-data.

---

### **Felhantering**
Samtliga endpoints returnerar lämpliga HTTP-statuskoder och felmeddelanden vid problem, inklusive:
- **400 Bad Request**: När nödvändiga parametrar saknas eller är felaktiga.
- **500 Internal Server Error**: Vid oväntade fel, exempelvis om väderdata inte kan hämtas från API:et.

---
