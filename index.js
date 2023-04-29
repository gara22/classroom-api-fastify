"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const client_1 = require("@prisma/client");
const app = (0, fastify_1.default)();
const prisma = new client_1.PrismaClient();
app.register(cors_1.default, {
    origin: "http://localhost:5173",
    methods: ["POST", "GET"]
});
app.get('/ping', async (request, reply) => {
    return 'pong\n';
});
app.get('/classrooms', async (req, res) => {
    const classrooms = await prisma.classroom.findMany();
    return classrooms;
});
app.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
