/**
 * carga util para emitir a usuario
 */
export class Payload {
    /**
     *
     * @param {String} event nombre de evento
     * @param {Object} data datos a enviar
     */
    constructor(event, data) {
        this.event = event;
        this.data = data;
    }

    get_event() { return this.event; };
    get_data() { return this.data; };
}
