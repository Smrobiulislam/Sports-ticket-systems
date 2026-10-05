import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { v4 as uuid } from 'uuid'

const app = express()
app.use(cors({origin: process.env.FRONTEND_URL || 'http://localhost:5173'}))
app.use(express.json())

const events = [{
  id:'evt_football_001', name:'City FC vs United FC', sport:'Football',
  date:'2026-11-15T18:30:00', venue:'National Stadium',
  tiers:[{id:'general',name:'General',price:25,quantity:500},{id:'vip',name:'VIP',price:60,quantity:100}]
}]
const orders=[]

app.get('/api/events',(req,res)=>res.json(events))
app.get('/api/events/:id',(req,res)=>{
  const e=events.find(x=>x.id===req.params.id)
  if(!e)return res.status(404).json({message:'Event not found'})
  res.json(e)
})
app.post('/api/events',(req,res)=>{
  const {name,venue,date,sport='Football',tiers=[]}=req.body
  const event={id:'evt_'+uuid().slice(0,8),name,venue,date,sport,tiers:tiers.map((t,i)=>({...t,id:t.id||`tier_${i+1}`}))}
  events.push(event); res.status(201).json(event)
})
app.post('/api/orders',(req,res)=>{
  const {eventId,tierId,email}=req.body
  const event=events.find(e=>e.id===eventId)
  const tier=event?.tiers.find(t=>t.id===tierId)
  if(!event||!tier||!email)return res.status(400).json({message:'Invalid order'})
  const order={id:'ord_'+uuid().slice(0,8),eventId,tierId,email,amount:Number(tier.price),createdAt:new Date().toISOString()}
  const ticket={id:'tkt_'+uuid().slice(0,8),ticketCode:'SP-'+uuid().slice(0,8).toUpperCase(),validationToken:uuid(),eventName:event.name,venue:event.venue,date:event.date,tierName:tier.name,email}
  orders.push({...order,ticket})
  res.status(201).json({order,ticket})
})
app.get('/api/tickets/:id',(req,res)=>{
  const found=orders.find(o=>o.ticket.id===req.params.id)
  if(!found)return res.status(404).json({message:'Ticket not found'})
  res.json(found.ticket)
})
app.get('/api/organizer/dashboard',(req,res)=>{
  const attendees=orders.map(o=>({ticketCode:o.ticket.ticketCode,eventName:o.ticket.eventName,tierName:o.ticket.tierName,email:o.email,amount:o.amount}))
  res.json({summary:{ticketsSold:orders.length,revenue:orders.reduce((s,o)=>s+o.amount,0)},attendees})
})
app.get('/api/organizer/attendees.csv',(req,res)=>{
  const rows=[['Ticket','Event','Tier','Email','Amount'],...orders.map(o=>[o.ticket.ticketCode,o.ticket.eventName,o.ticket.tierName,o.email,o.amount])]
  const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n')
  res.header('Content-Type','text/csv'); res.attachment('attendees.csv'); res.send(csv)
})

app.get('/api/health',(req,res)=>res.json({status:'ok'}))
app.listen(process.env.PORT||5000,()=>console.log(`API running on ${process.env.PORT||5000}`))
