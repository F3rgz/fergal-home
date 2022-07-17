class HeatingService {
    constructor() {}

    /**
     * Determines inference and initiates corresponding
     * action.
     *
     * @param {*} inference
     * @memberof HeatingService
     */
    public processInference(inference: any) {
        console.log(JSON.stringify(inference, null, 4));
    }
}

module.exports = HeatingService;
