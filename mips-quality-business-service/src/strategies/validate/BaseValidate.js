class BaseValidate {
    constructor() {
    }
    async validate(input) {
        return await `base calculator, ${input}`;
    }
}
module.exports = BaseValidate;