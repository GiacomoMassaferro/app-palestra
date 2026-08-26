export const mockPalestraData = {
  obiettivo: 'Massa Muscolare',
  livello: 'Intermedio',
  preferenzeAlimentari: 'Onnivoro',
  giorniAllenamento: ['Lunedì', 'Martedì', 'Giovedì', 'Venerdì'],
  durataAllenamento: 75,
  orariPasti: [
    { ora: '07:30', descrizione: 'Colazione' },
    { ora: '13:00', descrizione: 'Pranzo' },
    { ora: '16:00', descrizione: 'Spuntino' },
    { ora: '20:00', descrizione: 'Cena' }
  ]
}

export function loadMockData() {
  localStorage.setItem('palestra_data', JSON.stringify(mockPalestraData))
  window.location.reload()
}

export function clearMockData() {
  localStorage.removeItem('palestra_data')
  window.location.reload()
}
