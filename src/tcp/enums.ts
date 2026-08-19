export enum SaunaStatus {
    Offline = 0x23,
    OnlineHeating = 0x24,
    OnlineNotHeating = 0x25
}

export enum MessageType {
    CONFIGURATION = 0x02,
    SENSOR_READING = 0x03,
    LOCAL_HEATER_CONTROL = 0x07,
    CLOUD_UPDATE = 0x08,
    HANDSHAKE = 0x05,
}

// Magic bytes at buffer[19..22] that identify heater on/off state
export const HEATING_ON_BYTES  = [0xEC, 0xC5, 0xEF, 0x10]
export const HEATING_OFF_BYTES = [0x75, 0x59, 0xFC, 0x10]
