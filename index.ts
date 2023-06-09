import fastify from 'fastify'
import cors from '@fastify/cors'
import { prisma } from './helpers/utils'
import classroomRouter from './routes/classroom.router'
import bookingRouter from './routes/booking.router'



const app = fastify({ logger: true })

app.register(cors, {
  origin: "http://localhost:5173",
  methods: ["POST", "GET"]
})
app.register(classroomRouter, { prefix: '/classrooms' })
app.register(bookingRouter, { prefix: '/bookings' })


app.get('/ping', async (request, reply) => {
  return 'helyyoqqq\n'
})



app.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})