import {HuumEvents, UserEvents} from '../events/eventEnum.ts'
import eventBus from '../events/eventbus.ts'

const HTTP_PORT: string = process.env.HTTP_PORT || '8080'
const HTTP_HOSTNAME: string = process.env.HTTP_HOSTNAME || '0.0.0.0'

// How long without a sensor reading before the device is considered offline
const ONLINE_TIMEOUT_MS = 3 * 60 * 1000

// --- Device state ---
let currentTemperature: number = 0
let lastSensorReadingTime: Date | null = null
let lastHandshakeTime: Date | null = null
let temperatureSetpoint: number | null = null
let isHeating: boolean = false
let heatingEndTime: Date | null = null

Bun.serve({
    port: HTTP_PORT,
    hostname: HTTP_HOSTNAME,
    routes: {
        '/status': {
            GET: async () => {
                const now = Date.now()

                const sensorAge = lastSensorReadingTime
                    ? now - lastSensorReadingTime.getTime()
                    : Infinity

                const isOnline =
                    lastHandshakeTime !== null &&
                    sensorAge < ONLINE_TIMEOUT_MS

                const body = {
                    temperature: currentTemperature,
                    sensorReadingTimestamp: lastSensorReadingTime?.toISOString() ?? null,
                    temperatureSetpoint,
                    isOnline,
                    isHeating,
                    heatingEndTime: isHeating ? (heatingEndTime?.toISOString() ?? null) : null,
                }

                return Response.json(body, { status: 200 })
            },
        },

        '/start': {
            POST: async req => {
                const request = await req.json() as TurnOnRequest
                eventBus.emit(UserEvents.TURN_ON, request)
                return new Response('I guess')
            },
        },

        '/stop': {
            POST: async req => {
                const request = await req.json() as TurnOffRequest
                eventBus.emit(UserEvents.TURN_OFF, request)
                return new Response('shush')
            },
        },
    },
})

eventBus.on(HuumEvents.SENSOR_READING, (update: SensorUpdate) => {
    currentTemperature = update.temperature
    lastSensorReadingTime = new Date()
})

eventBus.on(HuumEvents.HANDSHAKE, () => {
    lastHandshakeTime = new Date()
})

eventBus.on(HuumEvents.LOCAL_HEATER_CONTROL, (control: HeaterControl) => {
    temperatureSetpoint = control.temperatureSetpoint
    isHeating = control.isHeating
    heatingEndTime = control.isHeating ? control.endTime : null
})

console.log(`🚀 HTTP server listening on ${HTTP_HOSTNAME}:${HTTP_PORT}`)
