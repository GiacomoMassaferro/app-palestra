# ISTRUZIONI.md - Istruzioni per l'utilizzo dei comandi del chatbot

## Introduzione

Questo file contiene le istruzioni per il chatbot su come utilizzare i comandi disponibili in `comandi.js` per modificare il calendario, la dieta e la routine dell'utente.

**IMPORTANTE:** Il chatbot deve restituire UNICAMENTE risposte in formato JSON valido con la seguente struttura:

```json
{
  "risposta": "testo della risposta",
  "modifiche": {},
  "consigli": [],
  "comandi": [
    {
      "tipo": "nomeComando",
      "parametri": {}
    }
  ],
  "refresh": true/false
}
```

## Comandi Disponibili

### 1. Ferie
**Descrizione:** Aggiunge un periodo di ferie per l'utente.

**Formato comando:**
```json
{
  "tipo": "ferie",
  "parametri": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD"
  }
}
```

**Esempio:**
```json
{
  "tipo": "ferie",
  "parametri": {
    "startDate": "2026-09-12",
    "endDate": "2026-09-18"
  }
}
```

**Varianti accettate:**
- `ferie`
- `aggiungi_ferie` o `aggiungi-ferie` (vengono normalizzati automaticamente)
- `aggiuniferie` (già normalizzato)

---

### 2. Pasto
**Descrizione:** Registra un pasto mangiato (cheat meal).

**Formato comando:**
```json
{
  "tipo": "pasto",
  "parametri": {
    "description": "descrizione del pasto",
    "date": "YYYY-MM-DD" (opzionale, default: oggi),
    "calories": 123 (opzionale)
  }
}
```

**Esempio:**
```json
{
  "tipo": "pasto",
  "parametri": {
    "description": "pizza margherita",
    "calories": 800
  }
}
```

**Varianti accettate:**
- `pasto`
- `mangiato`
- `ho_mangiato` (viene normalizzato automaticamente)

---

### 3. Attività
**Descrizione:** Registra un'attività fisica eseguita.

**Formato comando:**
```json
{
  "tipo": "attivita",
  "parametri": {
    "description": "descrizione dell'attività",
    "date": "YYYY-MM-DD" (opzionale, default: oggi),
    "type": "workout" (opzionale, default: 'workout')
  }
}
```

**Esempio:**
```json
{
  "tipo": "attivita",
  "parametri": {
    "description": "yoga 30 minuti",
    "type": "workout"
  }
}
```

**Varianti accettate:**
- `attivita`
- `fatto`
- `ho_fatto` (viene normalizzato automaticamente)

---

### 4. Rientro / Aggiorna Piano
**Descrizione:** Genera un piano di rientro dopo le ferie.

**Formato comando:**
```json
{
  "tipo": "rientro",
  "parametri": {
    "context": {
      "data": {}
    }
  }
}
```

**Esempio:**
```json
{
  "tipo": "rientro",
  "parametri": {
    "context": {
      "data": {
        "obiettivo": "Massa Muscolare"
      }
    }
  }
}
```

**Varianti accettate:**
- `rientro`
- `piano_rientro` o `piano-rientro` (vengono normalizzati automaticamente)
- `aggiorna_piano` o `aggiorna-piano` (vengono normalizzati automaticamente)
- `aggiornapiano` (già normalizzato)

---

### 5. Modifica Dieta
**Descrizione:** Modifica la dieta per un giorno specifico.

**Formato comando:**
```json
{
  "tipo": "dieta",
  "parametri": {
    "giorno": "Lunedi",
    "pasti": {
      "Colazione": {
        "ora": "08:00",
        "cibo": "uova e pane integrale",
        "calorie": 350,
        "grammi": 200
      }
    }
  }
}
```

**Esempio:**
```json
{
  "tipo": "dieta",
  "parametri": {
    "giorno": "Lunedi",
    "pasti": {
      "Colazione": {
        "ora": "08:00",
        "cibo": "uova e pane integrale",
        "calorie": 350
      }
    }
  }
}
```

---

### 6. Modifica Routine
**Descrizione:** Modifica la routine per un giorno specifico.

**Formato comando:**
```json
{
  "tipo": "routine",
  "parametri": {
    "giorno": "Lunedi",
    "dati": {
      "scheda": "Full Body",
      "durata": 60,
      "esercizi": ["Squat", "Panca", "Rematore"]
    }
  }
}
```

**Esempio:**
```json
{
  "tipo": "routine",
  "parametri": {
    "giorno": "Lunedi",
    "dati": {
      "scheda": "Full Body",
      "durata": "60 min",
      "esercizi": ["Squat 4x10", "Panca 4x8", "Rematore 4x10"]
    }
  }
}
```

---

### 7. Applica Modifiche
**Descrizione:** Applica tutte le modifiche suggerite (dieta e routine).

**Formato comando:**
```json
{
  "tipo": "modifiche",
  "parametri": {
    "modifiche": {
      "dieta": {},
      "routine": {}
    }
  }
}
```

**Esempio:**
```json
{
  "tipo": "modifiche",
  "parametri": {
    "modifiche": {
      "dieta": {
        "Lunedi": {
          "pasti": {
            "Colazione": {"cibo": "avena", "calorie": 300}
          }
        }
      },
      "routine": {
        "Lunedi": {
          "scheda": "Cardio",
          "durata": 45
        }
      }
    }
  }
}
```

---

## Formato della Risposta Completa

Ogni risposta del chatbot DEVE contenere i seguenti campi:

| Campo | Tipo | Descrizione | Obbligatorio |
|-------|------|-------------|--------------|
| `risposta` | string | Testo della risposta per l'utente | Sì |
| `modifiche` | object | Modifiche da applicare a dieta e routine | Sì (può essere vuoto) |
| `consigli` | array | Lista di consigli per l'utente | Sì (può essere vuoto) |
| `comandi` | array | Lista di comandi da eseguire | Sì (può essere vuoto) |
| `refresh` | boolean | Indica se è necessario ricaricare la pagina | Sì |

---

## Esempi Completi

### Esempio 1: Aggiunta ferie
```json
{
  "risposta": "Ho aggiunto le ferie dal 12 al 18 settembre 2026. Ecco i miei suggerimenti per questo periodo.",
  "modifiche": {},
  "consigli": [
    "Mantieni un'attività fisica leggera durante le ferie",
    "Bevi molta acqua",
    "Cerca di non eccedere con i cheat meal"
  ],
  "comandi": [
    {
      "tipo": "ferie",
      "parametri": {
        "startDate": "2026-09-12",
        "endDate": "2026-09-18"
      }
    }
  ],
  "refresh": true
}
```

### Esempio 2: Modifica dieta e routine
```json
{
  "risposta": "Ho adattato la tua dieta e routine per il periodo di malattia. Ecco le modifiche consigliate.",
  "modifiche": {
    "dieta": {
      "Lunedi": {
        "pasti": {
          "Colazione": {"cibo": "frutta fresca", "calorie": 200}
        }
      }
    },
    "routine": {
      "Lunedi": {
        "scheda": "Recovery",
        "durata": 30,
        "esercizi": ["Camminata leggera"]
      }
    }
  },
  "consigli": [
    "Riposati bene",
    "Mantieni un'alimentazione leggera"
  ],
  "comandi": [
    {
      "tipo": "modifiche",
      "parametri": {
        "modifiche": {
          "dieta": {
            "Lunedi": {
              "pasti": {
                "Colazione": {"cibo": "frutta fresca", "calorie": 200}
              }
            }
          },
          "routine": {
            "Lunedi": {
              "scheda": "Recovery",
              "durata": 30,
              "esercizi": ["Camminata leggera"]
            }
          }
        }
      }
    }
  ],
  "refresh": true
}
```

### Esempio 3: Registrazione pasto
```json
{
  "risposta": "Ho registrato il pasto che hai mangiato. Verrà considerato nel piano di rientro.",
  "modifiche": {},
  "consigli": [
    "Ricordati di bere acqua dopo il pasto",
    "Cerca di compensare con attività fisica"
  ],
  "comandi": [
    {
      "tipo": "pasto",
      "parametri": {
        "description": "pizza margherita",
        "calories": 800
      }
    }
  ],
  "refresh": false
}
```

---

## Regole Importanti

1. **Sempre JSON valido**: Le risposte devono essere SEMPRE in formato JSON valido, senza formattazione markdown, commenti o testo aggiuntivo.

2. **Normalizzazione automatica**: I tipi di comando vengono normalizzati automaticamente (rimozione di underscore e trattini, conversione in minuscolo). Quindi puoi usare:
   - `ferie`, `aggiungi_ferie`, `aggiungi-ferie`, `aggiuniferie` → tutti diventano `aggiuniferie`
   - `aggiorna_piano`, `aggiorna-piano`, `aggiornapiano` → tutti diventano `aggiornapiano`

3. **Campi obbligatori**: Ogni risposta deve contenere TUTTI i campi: `risposta`, `modifiche`, `consigli`, `comandi`, `refresh`.

4. **Array vuoti**: Se non ci sono modifiche, consigli o comandi, usare array/oggetti vuoti, NON `null` o `undefined`.

5. **Nomi dei giorni**: Usare i nomi dei giorni in italiano con la prima lettera maiuscola: `Lunedi`, `Martedi`, `Mercoledi`, `Giovedi`, `Venerdi`, `Sabato`, `Domenica`.

6. **Date**: Usare sempre il formato `YYYY-MM-DD` per le date.

7. **Tipi di comando validi** (dopo normalizzazione):
   - `ferie` / `aggiuniferie`
   - `pasto` / `mangiato`
   - `attivita` / `fatto`
   - `rientro` / `aggiornapiano`
   - `dieta`
   - `routine`
   - `modifiche`

---

## Errori Comuni da Evitare

❌ **Risposta non JSON:**
```
Mi dispiace, non posso aiutarti.
```

✅ **Corretto:**
```json
{
  "risposta": "Mi dispiace, non posso aiutarti con questa richiesta.",
  "modifiche": {},
  "consigli": [],
  "comandi": [],
  "refresh": false
}
```

❌ **Campi mancanti:**
```json
{
  "risposta": "Ferie aggiunte"
}
```

✅ **Corretto:**
```json
{
  "risposta": "Ferie aggiunte",
  "modifiche": {},
  "consigli": [],
  "comandi": [],
  "refresh": false
}
```

❌ **Tipo di comando sbagliato:**
```json
{
  "comandi": [{"tipo": "aggiungi ferie", "parametri": {}}]
}
```

✅ **Corretto:**
```json
{
  "comandi": [{"tipo": "ferie", "parametri": {"startDate": "2026-01-01", "endDate": "2026-01-07"}}]
}
```

---

## Note Finali

- Il chatbot deve **SEMPRE** restituire risposte in formato JSON valido.
- Usa **SEMPRE** i nomi dei comandi elencati sopra.
- Includi **SEMPRE** tutti i campi obbligatori nella risposta.
- Se hai dubbi su quale comando usare, preferisci `modifiche` per cambiamenti a dieta e routine.
- Per periodi di ferie, usa il comando `ferie`.
- Per registrare pasti o attività, usa i comandi `pasto` o `attivita`.
- Per generare un piano di rientro, usa il comando `rientro` o `aggiorna_piano`.
