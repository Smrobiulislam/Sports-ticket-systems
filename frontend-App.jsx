import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) throw new Error((await res.json()).message || 'Request failed')
  return res.json()
}

function Layout({ children }) {
  return <div className="app">
    <header className="topbar">
      <Link to="/" className="brand"><span>SP</span> SportPass</Link>
      <nav><Link to="/">Events</Link><Link to="/organizer">Organizer</Link></nav>
    </header>
    {children}
    <footer>SportPass • Mobile-first sports ticketing starter</footer>
  </div>
}

function Home() {
  const [events, setEvents] = useState([])
  useEffect(() => { api('/events').then(setEvents).catch(console.error) }, [])
  return <Layout>
    <main className="container">
      <section className="hero">
        <p className="eyebrow">LIVE SPORTS • MOBILE TICKETING</p>
        <h1>Your phone is your ticket.</h1>
        <p>Buy securely, receive a unique QR ticket, and enter the stadium without paper.</p>
      </section>
      <h2>Upcoming matches</h2>
      <div className="grid">
        {events.map(e => <article className="card" key={e.id}>
          <div className="sport">{e.sport}</div>
          <h3>{e.name}</h3>
          <p>{new Date(e.date).toLocaleString()}<br/>{e.venue}</p>
          <p className="muted">From ${Math.min(...e.tiers.map(t => t.price))}</p>
          <Link className="btn" to={`/events/${e.id}`}>View tickets</Link>
        </article>)}
      </div>
    </main>
  </Layout>
}

function EventPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [tier, setTier] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => { api(`/events/${id}`).then(e => { setEvent(e); setTier(e.tiers[0]?.id) }) }, [id])
  if (!event) return <Layout><main className="container"><p>Loading...</p></main></Layout>
  async function buy() {
    setLoading(true)
    try {
      const data = await api('/orders', { method:'POST', body: JSON.stringify({ eventId:id, tierId:tier, email }) })
      navigate(`/ticket/${data.ticket.id}`)
    } catch(e) { alert(e.message) } finally { setLoading(false) }
  }
  return <Layout><main className="container narrow">
    <Link to="/">← All events</Link>
    <section className="panel">
      <div className="sport">{event.sport}</div>
      <h1>{event.name}</h1>
      <p>{new Date(event.date).toLocaleString()} • {event.venue}</p>
      <h3>Choose ticket</h3>
      <div className="tiers">{event.tiers.map(t => <button className={tier===t.id?'tier active':'tier'} onClick={()=>setTier(t.id)} key={t.id}>
        <b>{t.name}</b><span>${t.price}</span><small>{t.quantity} available</small>
      </button>)}</div>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email for your ticket" type="email"/>
      <button className="btn full" disabled={!email || loading} onClick={buy}>{loading?'Processing…':'Continue to secure checkout'}</button>
      <small className="muted">Demo checkout. Connect your payment provider in the backend payment service for production.</small>
    </section>
  </main></Layout>
}

function Ticket() {
  const { id } = useParams()
  const [ticket,setTicket] = useState(null)
  useEffect(()=>{ api(`/tickets/${id}`).then(setTicket).catch(console.error) },[id])
  if (!ticket) return <Layout><main className="container"><p>Loading ticket…</p></main></Layout>
  return <Layout><main className="container narrow">
    <section className="ticket">
      <div><span className="badge">MOBILE TICKET</span><h1>{ticket.eventName}</h1>
      <p>{ticket.venue} • {new Date(ticket.date).toLocaleString()}</p></div>
      <div className="qr"><QRCodeSVG value={ticket.validationToken} size={210}/></div>
      <div className="ticket-info"><span>Ticket</span><b>{ticket.ticketCode}</b><span>Type</span><b>{ticket.tierName}</b></div>
      <p className="muted">Show this QR code at the stadium entrance.</p>
    </section>
  </main></Layout>
}

function Organizer() {
  const [data,setData] = useState(null)
  const [name,setName] = useState('')
  const [venue,setVenue] = useState('')
  const [date,setDate] = useState('')
  async function load(){ setData(await api('/organizer/dashboard')) }
  useEffect(()=>{load()},[])
  async function create(e){
    e.preventDefault()
    await api('/events',{method:'POST',body:JSON.stringify({name,venue,date,sport:'Football',tiers:[{name:'General',price:25,quantity:500},{name:'VIP',price:60,quantity:100}]})})
    setName(''); setVenue(''); setDate(''); load()
  }
  return <Layout><main className="container">
    <div className="section-head"><div><p className="eyebrow">ORGANIZER</p><h1>Dashboard</h1></div><button className="btn" onClick={load}>Refresh</button></div>
    {data && <div className="stats"><div><span>Tickets sold</span><b>{data.summary.ticketsSold}</b></div><div><span>Revenue</span><b>${data.summary.revenue}</b></div><div><span>Attendees</span><b>{data.attendees.length}</b></div></div>}
    <section className="panel"><h2>Create match</h2><form className="form" onSubmit={create}><input required value={name} onChange={e=>setName(e.target.value)} placeholder="Match name"/><input required value={venue} onChange={e=>setVenue(e.target.value)} placeholder="Venue"/><input required type="datetime-local" value={date} onChange={e=>setDate(e.target.value)}/><button className="btn">Create event</button></form></section>
    <section className="panel"><div className="section-head"><h2>Attendees</h2><a className="btn secondary" href={`${API}/organizer/attendees.csv`}>Export CSV</a></div>
    <div className="table-wrap"><table><thead><tr><th>Ticket</th><th>Event</th><th>Tier</th><th>Email</th></tr></thead><tbody>{data?.attendees.map(a=><tr key={a.ticketCode}><td>{a.ticketCode}</td><td>{a.eventName}</td><td>{a.tierName}</td><td>{a.email}</td></tr>)}</tbody></table></div></section>
  </main></Layout>
}

export default function App(){
  return <Routes><Route path="/" element={<Home/>}/><Route path="/events/:id" element={<EventPage/>}/><Route path="/ticket/:id" element={<Ticket/>}/><Route path="/organizer" element={<Organizer/>}/></Routes>
}
