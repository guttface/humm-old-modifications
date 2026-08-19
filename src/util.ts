import {HEATING_ON_BYTES} from './tcp/enums.ts'

export function parseControllerHandshake (payload: Uint8Array): Handshake {
    // Byte layout (verified against live example):
    // [0]     = 0x0b (message type)
    // [1..6]  = MAC address (6 bytes, little-endian)
    // [7..31] = zero padding (28 bytes)
    // [32..54]= firmware version (ASCII, null-padded)
    // [55..61]= zero padding (7 bytes)
    // [62..72]= device name (ASCII, null-padded)
    // [73..76]= zero padding (4 bytes)
    const macBytes = payload.slice(1, 7)
    const macAddress = Array.from(macBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(':')

    const firmwareBytes = payload.slice(32, 55)
    const firmware = Buffer.from(firmwareBytes).toString('utf-8').replace(/\0/g, '').trim()

    const nameBytes = payload.slice(62, 73)
    const deviceName = Buffer.from(nameBytes).toString('utf-8').replace(/\0/g, '').trim()

    return {
        macAddress,
        firmware,
        deviceName,
    }
}

export function parseHeaterControl (payload: Uint8Array): HeaterControl {
    // Byte layout (verified against live on/off examples):
    // [0]     = 0x07 (message type)
    // [1]     = temperature setpoint (°C, hex)
    // [2..5]  = zero padding
    // [6]     = 0x03 (constant)
    // [7..10] = start time (LE uint32 unix timestamp)
    // [11..14]= end time   (LE uint32 unix timestamp)
    // [15..18]= command sent time (LE uint32 unix timestamp)
    // [19..22]= 0xECC5EF10 = heating on / 0x7559FC10 = heating off
    // [23]    = 0x00 (constant)
    const temperatureSetpoint = payload[1]

    const statusBytes = Array.from(payload.slice(19, 23))
    const isHeating = statusBytes.every((b, i) => b === HEATING_ON_BYTES[i])

    const startTime       = hexLEToDate(payload.slice(7, 11))
    const endTime         = hexLEToDate(payload.slice(11, 15))
    const commandSentTime = hexLEToDate(payload.slice(15, 19))

    return {
        temperatureSetpoint,
        isHeating,
        startTime,
        endTime,
        commandSentTime,
    }
}

export function hexLEToDate (bytes: Uint8Array): Date {
    const view = new DataView(bytes.buffer, bytes.byteOffset, 4)
    const timestamp = view.getUint32(0, true) // little-endian
    return new Date(timestamp * 1000)
}

export function printArrayAsHex(bytes: Buffer | Uint8Array) {
    const hexBytes = Array.from(bytes, b => b.toString(16).padStart(2, '0'))
    console.log('Byte Array:', bytes)
    console.log('Hex LE:', hexBytes.join(' '))
}
