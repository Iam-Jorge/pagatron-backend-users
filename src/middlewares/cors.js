import cors from 'cors'

export const corsMiddleware = () => cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            'http://localhost:8080',
            'http://localhost:3000',
            // Agrega dominios...
        ]

        if (!origin) {
            // Permite solicitudes sin origen (como solicitudes del mismo servidor)
            return callback(null, true)
        }

        if (ACCEPTED_ORIGINS.includes(origin)) {
            return callback(null, true)
        }

        console.warn(`Blocked CORS request from origin: ${origin}`)

        return callback(new Error('Not allowed by CORS'), false)
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
})