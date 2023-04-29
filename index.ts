import fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'


const app = fastify()
const prisma = new PrismaClient()

app.register(cors, {
  origin: "http://localhost:5173",
  methods: ["POST", "GET"]
})

app.get('/ping', async (request, reply) => {
  return 'pong\n'
})

app.get('/classrooms', async (req, res) => {
  const classrooms = await prisma.classroom.findMany();
  return classrooms;
})

app.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})