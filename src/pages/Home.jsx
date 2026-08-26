import { useState, useMemo, useContext } from 'react'
import { SettingsContext } from '../contexts/SettingsContext'
import { mockPalestraData } from '../data/mockData'

export default function Home() {
  const { settings } = useContext(SettingsContext)
  const [meseCorrente, setMeseCorrente] = useState(new Date())

  const calendario = useMemo(() => {
    const config = settings || mockPalestraData
    const giorniAllenamento = config.giorniAllenamento || []
    
    const anno = meseCorrente.getFullYear()
    const mese = meseCorrente.getMonth()
    const primoGiorno = new Date(anno, mese, 1).getDay()
    const giorniTotali = new Date(anno, mese + 1, 0).getDate()
    
    const giorniMese = []
    for (let i = 0; i < primoGiorno; i++) {
      giorniMese.push(null)
    }
    for (let giorno = 1; giorno <= giorniTotali; giorno++) {
      const dataGiorno = new Date(anno, mese, giorno)
      const nomeGiorno = dataGiorno.toLocaleDateString('it-IT', { weekday: 'long' })
      const haAllenamento = giorniAllenamento.includes(nomeGiorno)
      giorniMese.push({
        giorno,
        nomeGiorno,
        haAllenamento,
        haPasti: true,
        data: dataGiorno
      })
    }
    return giorniMese
  }, [meseCorrente, settings])

  const goNextMonth = () => {
    setMeseCorrente(new Date(meseCorrente.getFullYear(), meseCorrente.getMonth() + 1, 1))
  }

  const goPrevMonth = () => {
    setMeseCorrente(new Date(meseCorrente.getFullYear(), meseCorrente.getMonth() - 1, 1))
  }

  const isToday = (day) => {
    if (!day) return false
    const today = new Date()
    return day.giorno === today.getDate() && 
           meseCorrente.getMonth() === today.getMonth() && 
           meseCorrente.getFullYear() === today.getFullYear()
  }

  return (
    <>
      <h1 className="mb-4">Calendario Allenamenti</h1>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-outline-primary" onClick={goPrevMonth}>
          &lt;
        </button>
        <h3>
          {meseCorrente.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
        </h3>
        <button className="btn btn-outline-primary" onClick={goNextMonth}>
          &gt;
        </button>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map(day => (
                <th key={day} className="text-center">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.ceil(calendario.length / 7) }).map((_, weekIndex) => (
              <tr key={weekIndex}>
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const index = weekIndex * 7 + dayIndex
                  const giorno = calendario[index]
                  return (
                    <td key={dayIndex} className="text-center p-2">
                      {giorno ? (
                        <div 
                          className={`
                            ${isToday(giorno) ? 'bg-primary text-white rounded' : ''}
                            ${giorno.haAllenamento ? 'fw-bold' : ''}
                          `}
                          style={{ minHeight: '60px', padding: '5px' }}
                        >
                          {giorno.giorno}
                          {giorno.haAllenamento && <div className="small">🏋️</div>}
                          {giorno.haPasti && <div className="small">🍽️</div>}
                        </div>
                      ) : null}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
