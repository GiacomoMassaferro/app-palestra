/**
 * Dati mock per testare l'app palestra senza API Mistral
 * 
 * Questo file contiene dati realistici per:
 * - Utente (per il login)
 * - Configurazione base (form Settings)
 * - Suggerimenti AI (formato Mistral)
 * - Dettagli completi per calendari e pagine
 */

// Dati mock per l'utente (compatibile con localStorage 'palestra_user')
export const mockUser = {
    nome: 'Mario',
    cognome: 'Rossi',
    email: 'mario.rossi@example.com',
    annoNascita: 1990,
    eta: 34,
    altezza: 175,
    peso: 70,
    sesso: 'Uomo',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
};

// Dati mock per utenti pre-registrati (per login con credenziali)
// Password per tutti: 'password123'
export const mockUsers = [
    {
        email: 'mario.rossi@example.com',
        password: 'password123',
        nome: 'Mario',
        cognome: 'Rossi',
        annoNascita: 1990,
        eta: new Date().getFullYear() - 1990,
        altezza: 175,
        peso: 70,
        sesso: 'Uomo'
    },
    {
        email: 'laura.bianchi@example.com',
        password: 'password123',
        nome: 'Laura',
        cognome: 'Bianchi',
        annoNascita: 1985,
        eta: new Date().getFullYear() - 1985,
        altezza: 165,
        peso: 58,
        sesso: 'Donna'
    },
    {
        email: 'luca.verdi@example.com',
        password: 'password123',
        nome: 'Luca',
        cognome: 'Verdi',
        annoNascita: 1995,
        eta: new Date().getFullYear() - 1995,
        altezza: 180,
        peso: 80,
        sesso: 'Uomo'
    }
];

// Dati mock per il form Settings (compatibile con localStorage 'palestra_data')
export const mockPalestraData = {
    obiettivo: 'Massa Muscolare',
    livello: 'Intermedio',
    preferenzeAlimentari: 'Onnivoro',
    workoutDays: ['Lunedi', 'Martedi', 'Giovedi', 'Venerdi'],
    durataAllenamento: '75',
    orariPasti: {
        'Colazione': { ora: '07:30', cibo: 'Uova, avena, frutta' },
        'Spuntino Mattina': { ora: '10:00', cibo: 'Yogurt e noci' },
        'Pranzo': { ora: '13:00', cibo: 'Riso, pollo, verdure' },
        'Spuntino Pomeriggio': { ora: '16:00', cibo: 'Proteine e banana' },
        'Cena': { ora: '19:30', cibo: 'Salmone, patate, broccoli' },
        'Spuntino Sera': { ora: '22:00', cibo: 'Cottage cheese' }
    }
};

// Dati mock nel formato restituito da Mistral API (compatibile con localStorage 'palestra_suggestions')
export const mockSuggestions = {
    dieta: {
        'Lunedi': {
            pasti: {
                'Colazione': { ora: '07:30', cibo: '3 uova intere + 50g avena + 1 banana', calorie: '550', grammi: '400g' },
                'Spuntino Mattina': { ora: '10:00', cibo: '1 yogurt greco 150g + 20g mandorle', calorie: '280', grammi: '170g' },
                'Pranzo': { ora: '13:00', cibo: '150g riso basmati + 150g petto di pollo + 100g verdure miste', calorie: '700', grammi: '400g' },
                'Spuntino Pomeriggio': { ora: '16:00', cibo: '1 scoop proteine 30g + 1 banana 120g', calorie: '250', grammi: '150g' },
                'Cena': { ora: '19:30', cibo: '200g salmone + 150g patate dolci + 100g broccoli al vapore', calorie: '650', grammi: '450g' },
                'Spuntino Sera': { ora: '22:00', cibo: '200g cottage cheese + 1 cucchiaino di miele', calorie: '200', grammi: '210g' }
            }
        },
        'Martedi': {
            pasti: {
                'Colazione': { ora: '07:30', cibo: '2 pancake proteici 100g + 15g burro di arachidi + 50g mirtilli', calorie: '580', grammi: '165g' },
                'Spuntino Mattina': { ora: '10:00', cibo: 'Barretta proteica 50g + caffè nero', calorie: '250', grammi: '50g' },
                'Pranzo': { ora: '13:00', cibo: '200g pasta integrale + 150g manzo magro + 50g insalata', calorie: '750', grammi: '400g' },
                'Spuntino Pomeriggio': { ora: '16:00', cibo: '30g noci + 1 mela 150g', calorie: '300', grammi: '180g' },
                'Cena': { ora: '19:30', cibo: 'Omelette con 4 uova 200g + 50g spinaci + 30g formaggio feta', calorie: '500', grammi: '280g' },
                'Spuntino Sera': { ora: '22:00', cibo: '250ml latte + 30g fiocchi di avena', calorie: '220', grammi: '280g' }
            }
        },
        'Mercoledi': {
            pasti: {
                'Colazione': { ora: '07:30', cibo: 'Frittata con 3 uova 150g + 100g avocado + 1 fetta pane integrale 50g', calorie: '520', grammi: '300g' },
                'Spuntino Mattina': { ora: '10:00', cibo: '1 barattolo di tonno 80g + 5 crackers integrali 30g', calorie: '280', grammi: '110g' },
                'Pranzo': { ora: '13:00', cibo: '150g quinoa + 150g tacchino + 100g zucchine grigliate', calorie: '600', grammi: '400g' },
                'Spuntino Pomeriggio': { ora: '16:00', cibo: '1 shake proteico 250ml con latte di mandorle', calorie: '200', grammi: '250g' },
                'Cena': { ora: '19:30', cibo: '150g gamberi alla griglia + 100g riso venere + 100g asparagi', calorie: '480', grammi: '350g' },
                'Spuntino Sera': { ora: '22:00', cibo: '1 porzione di ricotta 100g + 10g semi di chia', calorie: '180', grammi: '110g' }
            }
        },
        'Giovedi': {
            pasti: {
                'Colazione': { ora: '07:30', cibo: 'Porridge: 50g avena + 200ml latte scremato + 20g noci + 15g miele', calorie: '600', grammi: '300g' },
                'Spuntino Mattina': { ora: '10:00', cibo: '2 uova sode 100g + 1 arancia 150g', calorie: '240', grammi: '250g' },
                'Pranzo': { ora: '13:00', cibo: '200g patate + 180g merluzzo + 80g piselli', calorie: '650', grammi: '460g' },
                'Spuntino Pomeriggio': { ora: '16:00', cibo: '1 barretta energetica 50g + 1 caffè', calorie: '250', grammi: '50g' },
                'Cena': { ora: '19:30', cibo: 'Bistecca di manzo 200g + 150g purè di patate + 100g carote', calorie: '800', grammi: '450g' },
                'Spuntino Sera': { ora: '22:00', cibo: '200ml kefir', calorie: '120', grammi: '200g' }
            }
        },
        'Venerdi': {
            pasti: {
                'Colazione': { ora: '07:30', cibo: 'Smoothie: 1 banana 120g, 50g spinaci, 30g proteine, 200ml latte di soia', calorie: '450', grammi: '400g' },
                'Spuntino Mattina': { ora: '10:00', cibo: '30g formaggio + 5 fette biscotti integrali 40g', calorie: '280', grammi: '70g' },
                'Pranzo': { ora: '13:00', cibo: '180g petto di pollo + 120g pasta + 100g pomodori freschi', calorie: '720', grammi: '400g' },
                'Spuntino Pomeriggio': { ora: '16:00', cibo: '30g anacardi + 1 pera 150g', calorie: '300', grammi: '180g' },
                'Cena': { ora: '19:30', cibo: 'Minestrone di legumi 300g + 100g pane integrale + 10g olio evo', calorie: '550', grammi: '410g' },
                'Spuntino Sera': { ora: '22:00', cibo: '1 porzione di formaggio cottage 100g + 50g fragole', calorie: '200', grammi: '150g' }
            }
        },
        'Sabato': {
            pasti: {
                'Colazione': { ora: '08:00', cibo: '2 french toast proteici 120g + 20g sciroppo d\'acero + 50g fragole', calorie: '500', grammi: '190g' },
                'Spuntino Mattina': { ora: '11:00', cibo: '1 pancake proteico 80g + 15g burro di arachidi', calorie: '300', grammi: '95g' },
                'Pranzo': { ora: '13:30', cibo: 'Hamburger di manzo 200g + 1 pane integrale 60g + 30g insalata', calorie: '850', grammi: '290g' },
                'Spuntino Pomeriggio': { ora: '16:30', cibo: '1 gelato proteico 100g', calorie: '180', grammi: '100g' },
                'Cena': { ora: '20:00', cibo: 'Pizza margherita integrale 250g + 20g rucola + 10g grana', calorie: '750', grammi: '280g' },
                'Spuntino Sera': { ora: '23:00', cibo: '200ml latte caldo', calorie: '100', grammi: '200g' }
            }
        },
        'Domenica': {
            pasti: {
                'Colazione': { ora: '08:30', cibo: '50g muesli + 200ml latte + 30g frutta secca', calorie: '450', grammi: '280g' },
                'Spuntino Mattina': { ora: '11:00', cibo: '1 toast integrale 50g + 20g marmellata senza zucchero', calorie: '200', grammi: '70g' },
                'Pranzo': { ora: '13:30', cibo: '250g lasagne al forno con carne e verdure', calorie: '800', grammi: '250g' },
                'Spuntino Pomeriggio': { ora: '16:30', cibo: '200ml frullato di frutta fresca', calorie: '250', grammi: '200g' },
                'Cena': { ora: '20:00', cibo: '250g zuppa di verdure + 2 uova 100g + 1 fetta pane 50g', calorie: '500', grammi: '400g' },
                'Spuntino Sera': { ora: '23:00', cibo: '10g cioccolato fondente 85%', calorie: '50', grammi: '10g' }
            }
        }
    },
    routine: {
        'Lunedi': {
            scheda: 'Petto e Tricipiti',
            durata: '75',
            esercizi: [
                'Panca piana con bilanciere - 4x8-12',
                'Panca inclinata con manubri - 3x10-12',
                'Cavi incrociati - 3x12-15',
                'Dips su panche - 3x10-12',
                'Estensioni sopra la testa con manubrio - 3x12',
                'Pushdown ai cavi - 3x12-15'
            ]
        },
        'Martedi': {
            scheda: 'Dorsali e Bicipiti',
            durata: '75',
            esercizi: [
                'Trazioni alla sbarra - 4x8-10',
                'Rematore con bilanciere - 4x8-12',
                'Pulley basso - 3x10-12',
                'Curl con bilanciere - 3x10-12',
                'Curl con manubri - 3x10-12',
                'Curl a martello - 3x12'
            ]
        },
        'Mercoledi': {
            scheda: 'Riposo',
            durata: '0',
            esercizi: []
        },
        'Giovedi': {
            scheda: 'Gambe',
            durata: '75',
            esercizi: [
                'Squat con bilanciere - 4x8-12',
                'Stacco da terra - 4x6-8',
                'Affondi con manubri - 3x10 per gamba',
                'Leg press - 3x12-15',
                'Leg curl - 3x12-15',
                'Estensioni delle gambe - 3x12-15',
                'Polpacci in piedi - 4x15-20'
            ]
        },
        'Venerdi': {
            scheda: 'Spalle e Addominali',
            durata: '75',
            esercizi: [
                'Military press con bilanciere - 4x8-12',
                'Alzate laterali con manubri - 3x12-15',
                'Tirate al mento - 3x10-12',
                'Face pull ai cavi - 3x12-15',
                'Crunch alla panca - 3x15-20',
                'Plank - 3x 45 secondi',
                'Russian twist - 3x20'
            ]
        },
        'Sabato': {
            scheda: 'Full Body',
            durata: '60',
            esercizi: [
                'Squat - 3x12',
                'Panca piana - 3x10',
                'Rematore - 3x10',
                'Military press - 3x10',
                'Burpees - 3x15',
                'Mountain climbers - 3x30 secondi'
            ]
        },
        'Domenica': {
            scheda: 'Riposo Attivo',
            durata: '45',
            esercizi: [
                'Camminata veloce - 30 minuti',
                'Stretching completo - 15 minuti'
            ]
        }
    },
    calendario: {
        'Lunedi': {
            suggerimenti: [
                'Beye idratato: bevi almeno 3 litri di acqua oggi',
                'Dormi almeno 7-8 ore per favorire il recupero muscolare',
                'Assumi proteine entro 30 minuti dopo l\'allenamento',
                'Concentrati sulla tecnica durante gli esercizi per petto'
            ]
        },
        'Martedi': {
            suggerimenti: [
                'Mangia un pasto ricco di carboidrati complessi prima dell\'allenamento',
                'Fai stretching per i bicipiti dopo la sessione',
                'Integra con creatina per migliorare la performance',
                'Varia le impugnature durante le trazioni'
            ]
        },
        'Mercoledi': {
            suggerimenti: [
                'Giorno di riposo: dedicati al recupero attivo con camminata leggera',
                'Idrata bene il tuo corpo',
                'Mangia pasti bilanciati per sostenere la crescita muscolare'
            ]
        },
        'Giovedi': {
            suggerimenti: [
                'Riscaldati bene prima di fare squat e stacco',
                'Usa pesi progressivamente più alti',
                'Fai attenzione alla posizione della schiena durante lo stacco',
                'Stira bene le gambe dopo l\'allenamento'
            ]
        },
        'Venerdi': {
            suggerimenti: [
                'Concentrati sulla respirazione durante il military press',
                'Mantieni il core attivo durante tutti gli esercizi',
                'Fai pause brevi tra le serie per mantenere l\'intensità',
                'Includi varianti di crunch per colpire tutti gli addominali'
            ]
        },
        'Sabato': {
            suggerimenti: [
                'Full body: mantieni un ritmo costante',
                'Idratati costantemente durante l\'allenamento',
                'Ascolta il tuo corpo e regola l\'intensità se necessario'
            ]
        },
        'Domenica': {
            suggerimenti: [
                'Riposo attivo: camminata o nuoto leggero',
                'Allunga tutti i gruppi muscolari',
                'Pianifica la settimana prossima e valuta i progressi'
            ]
        }
    }
};

// Dati completi per testare DayDetails.jsx (include workoutDetails e mealDetails)
export const mockFullData = {
    ...mockPalestraData,
    workoutDetails: {
        'Lunedi': {
            scheda: 'Petto e Tricipiti',
            durata: '75 minuti',
            esercizi: [
                'Panca piana con bilanciere - 4x8-12',
                'Panca inclinata con manubri - 3x10-12',
                'Cavi incrociati - 3x12-15',
                'Dips su panche - 3x10-12',
                'Estensioni sopra la testa con manubrio - 3x12',
                'Pushdown ai cavi - 3x12-15'
            ]
        },
        'Martedi': {
            scheda: 'Dorsali e Bicipiti',
            durata: '75 minuti',
            esercizi: [
                'Trazioni alla sbarra - 4x8-10',
                'Rematore con bilanciere - 4x8-12',
                'Pulley basso - 3x10-12',
                'Curl con bilanciere - 3x10-12',
                'Curl con manubri - 3x10-12',
                'Curl a martello - 3x12'
            ]
        },
        'Giovedi': {
            scheda: 'Gambe',
            durata: '75 minuti',
            esercizi: [
                'Squat con bilanciere - 4x8-12',
                'Stacco da terra - 4x6-8',
                'Affondi con manubri - 3x10 per gamba',
                'Leg press - 3x12-15',
                'Leg curl - 3x12-15',
                'Estensioni delle gambe - 3x12-15',
                'Polpacci in piedi - 4x15-20'
            ]
        },
        'Venerdi': {
            scheda: 'Spalle e Addominali',
            durata: '75 minuti',
            esercizi: [
                'Military press con bilanciere - 4x8-12',
                'Alzate laterali con manubri - 3x12-15',
                'Tirate al mento - 3x10-12',
                'Face pull ai cavi - 3x12-15',
                'Crunch alla panca - 3x15-20',
                'Plank - 3x 45 secondi',
                'Russian twist - 3x20'
            ]
        },
        'Mercoledi': null,
        'Sabato': {
            scheda: 'Full Body',
            durata: '60 minuti',
            esercizi: [
                'Squat - 3x12',
                'Panca piana - 3x10',
                'Rematore - 3x10',
                'Military press - 3x10',
                'Burpees - 3x15',
                'Mountain climbers - 3x30 secondi'
            ]
        },
        'Domenica': {
            scheda: 'Riposo Attivo',
            durata: '45 minuti',
            esercizi: [
                'Camminata veloce - 30 minuti',
                'Stretching completo - 15 minuti'
            ]
        }
    },
    mealDetails: {
        'Lunedi': {
            'Colazione': { ora: '07:30', cibo: '3 uova intere + 50g avena + 1 banana', calorie: '550', grammi: '400g' },
            'Spuntino Mattina': { ora: '10:00', cibo: '1 yogurt greco + 20g mandorle', calorie: '280', grammi: '170g' },
            'Pranzo': { ora: '13:00', cibo: '150g riso basmati + 150g petto di pollo + verdure miste', calorie: '700', grammi: '400g' },
            'Spuntino Pomeriggio': { ora: '16:00', cibo: '1 scoop proteine + 1 banana', calorie: '250', grammi: '150g' },
            'Cena': { ora: '19:30', cibo: '200g salmone + 150g patate dolci + broccoli al vapore', calorie: '650', grammi: '450g' },
            'Spuntino Sera': { ora: '22:00', cibo: '200g cottage cheese + 1 cucchiaino di miele', calorie: '200', grammi: '210g' }
        },
        'Martedi': {
            'Colazione': { ora: '07:30', cibo: 'Pancake proteici + burro di arachidi + mirtilli', calorie: '580', grammi: '165g' },
            'Spuntino Mattina': { ora: '10:00', cibo: 'Barretta proteica + caffè nero', calorie: '250', grammi: '50g' },
            'Pranzo': { ora: '13:00', cibo: '200g pasta integrale + 150g manzo magro + insalata', calorie: '750', grammi: '400g' },
            'Spuntino Pomeriggio': { ora: '16:00', cibo: '1 pugno di noci + 1 mela', calorie: '300', grammi: '180g' },
            'Cena': { ora: '19:30', cibo: 'Omelette con 4 uova + spinaci + formaggio feta', calorie: '500', grammi: '280g' },
            'Spuntino Sera': { ora: '22:00', cibo: '1 bicchiere di latte + 30g fiocchi di avena', calorie: '220', grammi: '280g' }
        },
        'Giovedi': {
            'Colazione': { ora: '07:30', cibo: 'Porridge avena + latte scremato + noci + miele', calorie: '600', grammi: '300g' },
            'Spuntino Mattina': { ora: '10:00', cibo: '2 uova sode + 1 arancia', calorie: '240', grammi: '250g' },
            'Pranzo': { ora: '13:00', cibo: '200g patate + 180g merluzzo + piselli', calorie: '650', grammi: '460g' },
            'Spuntino Pomeriggio': { ora: '16:00', cibo: '1 barretta energetica + 1 caffè', calorie: '250', grammi: '50g' },
            'Cena': { ora: '19:30', cibo: 'Bistecca di manzo 200g + purè di patate + carote', calorie: '800', grammi: '450g' },
            'Spuntino Sera': { ora: '22:00', cibo: '1 bicchiere di kefir', calorie: '120', grammi: '200g' }
        },
        'Venerdi': {
            'Colazione': { ora: '07:30', cibo: 'Smoothie: banana, spinaci, proteine, latte di soia', calorie: '450', grammi: '400g' },
            'Spuntino Mattina': { ora: '10:00', cibo: '30g formaggio + 5 fette biscotti integrali', calorie: '280', grammi: '70g' },
            'Pranzo': { ora: '13:00', cibo: '180g petto di pollo + 120g pasta + pomodori freschi', calorie: '720', grammi: '400g' },
            'Spuntino Pomeriggio': { ora: '16:00', cibo: '1 manciata di anacardi + 1 pera', calorie: '300', grammi: '180g' },
            'Cena': { ora: '19:30', cibo: 'Minestrone di legumi + 100g pane integrale + olio evo', calorie: '550', grammi: '410g' },
            'Spuntino Sera': { ora: '22:00', cibo: '1 porzione di formaggio cottage + fragole', calorie: '200', grammi: '150g' }
        },
        'Mercoledi': null,
        'Sabato': {
            'Colazione': { ora: '08:00', cibo: 'French toast proteico + sciroppo d\'acero + fragole', calorie: '500', grammi: '190g' },
            'Spuntino Mattina': { ora: '11:00', cibo: '1 pancake proteico + burro di arachidi', calorie: '300', grammi: '95g' },
            'Pranzo': { ora: '13:30', cibo: 'Hamburger di manzo 200g + pane integrale + insalata', calorie: '850', grammi: '290g' },
            'Spuntino Pomeriggio': { ora: '16:30', cibo: '1 gelato proteico', calorie: '180', grammi: '100g' },
            'Cena': { ora: '20:00', cibo: 'Pizza margherita integrale + rucola + grana', calorie: '750', grammi: '280g' },
            'Spuntino Sera': { ora: '23:00', cibo: '1 bicchiere di latte caldo', calorie: '100', grammi: '200g' }
        },
        'Domenica': {
            'Colazione': { ora: '08:30', cibo: 'Muesli + latte + frutta secca', calorie: '450', grammi: '280g' },
            'Spuntino Mattina': { ora: '11:00', cibo: '1 toast con marmellata senza zucchero', calorie: '200', grammi: '70g' },
            'Pranzo': { ora: '13:30', cibo: 'Lasagne al forno con carne e verdure', calorie: '800', grammi: '250g' },
            'Spuntino Pomeriggio': { ora: '16:30', cibo: '1 frullato di frutta fresca', calorie: '250', grammi: '200g' },
            'Cena': { ora: '20:00', cibo: 'Zuppa di verdure + 2 uova + pane', calorie: '500', grammi: '400g' },
            'Spuntino Sera': { ora: '23:00', cibo: '1 quadratino di cioccolato fondente 85%', calorie: '50', grammi: '10g' }
        }
    }
};

/**
 * Funzione per caricare tutti i dati mock in localStorage per testing
 * Carica: utente, configurazione e suggerimenti completi
 * NOTA: Non carica dati ferie - l'utente deve inserirli manualmente
 */
export function loadFullTestProfile() {
    localStorage.setItem('palestra_user', JSON.stringify(mockUser))
    localStorage.setItem('palestra_data', JSON.stringify(mockFullData))
    localStorage.setItem('palestra_suggestions', JSON.stringify(mockSuggestions))
    // Rimuovi eventuali dati ferie e activities per avere un profilo pulito
    localStorage.removeItem('palestra_vacation')
    localStorage.removeItem('palestra_vacation_activities')
    localStorage.removeItem('palestra_dieta_file')
    localStorage.removeItem('palestra_scheda_file')
    console.log('[TEST] Profilo test completo caricato in localStorage!')
    return {
        palestra_user: mockUser,
        palestra_data: mockFullData,
        palestra_suggestions: mockSuggestions
    }
}

/**
 * Funzione per svuotare tutti i dati per testing senza dati
 * Crea un profilo vuoto per testare senza dati preesistenti
 */
export function clearTestProfile() {
    localStorage.removeItem('palestra_user')
    localStorage.removeItem('palestra_data')
    localStorage.removeItem('palestra_suggestions')
    localStorage.removeItem('palestra_vacation')
    localStorage.removeItem('palestra_vacation_activities')
    localStorage.removeItem('palestra_dieta_file')
    localStorage.removeItem('palestra_scheda_file')
    localStorage.removeItem('palestra_return_plan')
    console.log('[TEST] Dati svuotati - profilo test vuoto creato!')
}
