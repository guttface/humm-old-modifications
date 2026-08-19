type Handshake = {
    macAddress: string;
    firmware: string;
    deviceName: string;
}

type SensorUpdate = {
    temperature: number;
    frequencySeconds: number;
}

type HeaterControl = {
    temperatureSetpoint: number;
    isHeating: boolean;
    startTime: Date;
    endTime: Date;
    commandSentTime: Date;
}
