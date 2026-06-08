/**
 * Upcoming tournaments showcase for coach/admin dashboards.
 */
import { FaTrophy, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa'

const tournaments = [
  {
    name: 'State Athletics Championship',
    sport: 'Track & Field',
    date: '15 Jul 2026',
    venue: 'Jawaharlal Nehru Stadium',
    status: 'Registration Open',
  },
  {
    name: 'Inter-College Football Cup',
    sport: 'Football',
    date: '28 Jul 2026',
    venue: 'City Sports Complex',
    status: 'Upcoming',
  },
  {
    name: 'National Swimming Meet',
    sport: 'Swimming',
    date: '10 Aug 2026',
    venue: 'Aquatic Centre',
    status: 'Upcoming',
  },
  {
    name: 'District Basketball League',
    sport: 'Basketball',
    date: '22 Aug 2026',
    venue: 'Indoor Arena',
    status: 'Planning',
  },
]

export default function UpcomingTournaments() {
  return (
    <div className="card-panel dashboard-feature-panel animate-in">
      <div className="dashboard-feature-header">
        <h5 className="card-panel-title mb-0"><FaTrophy /> Upcoming Tournaments</h5>
        <span className="feature-badge">4 Events</span>
      </div>
      <div className="tournament-grid">
        {tournaments.map((t) => (
          <div className="tournament-card" key={t.name}>
            <div className="tournament-card-top">
              <span className="tournament-sport">{t.sport}</span>
              <span className="tournament-status">{t.status}</span>
            </div>
            <h6>{t.name}</h6>
            <p><FaCalendarAlt /> {t.date}</p>
            <p><FaMapMarkerAlt /> {t.venue}</p>
          </div>
        ))}
      </div>
    </div>
  )
}