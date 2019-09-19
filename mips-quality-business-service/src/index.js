const { GraphQLServer } = require('graphql-yoga');
const { makeExecutableSchema } = require('graphql-tools');
const Data = require("./helpers/Data");
const logger = require("./helpers/logger");
const typeDefs = require("./types");
const resolvers = require("./resolvers");
const schema = makeExecutableSchema({ typeDefs, resolvers })
require("dotenv").config();
const Validate = require("./strategies/validate");

const options = {
    port: process.env.SERVICE_PORT,
    endpoint: process.env.SERVICE_ENDPOINT,
    subscriptions: '/subscriptions',
    playground: '/playground',
}

const logging = async (resolve, parent, args, ctx, info) => {
    var log = logger.model;
    var url = `${process.env.BASE_URL}:${process.env.SERVICE_PORT}${process.env.SERVICE_ENDPOINT}`;
    var message = `Request received at MIPS Quality Business Service: ${url}`;
    var result;
    try {
        var header = await Validate.validate("header", ctx.request.headers);
        if (header.valid === false) {
            log.content = {
                request: ctx.request,
                response: result,
                error: "Required request headers not found!",
                timestamp: (new Date()).toUTCString(),
            };
            logger.log('error', message, log);
            return Error(header.error);
        }
        result = await resolve(parent, args, ctx, info)
        log.content = {
            request: ctx.request,
            response: result,
            timestamp: (new Date()).toUTCString(),
        };
        logger.log('debug', message, log);
    } catch (err) {
        log.content = {
            request: ctx.request,
            response: result,
            error: err,
            timestamp: (new Date()).toUTCString(),
        };
        logger.log('error', message, log);
    }
    return result;
}

const server = new GraphQLServer({
    schema: schema, context: req => ({
        ...req,
        db: Data,
    }),
    middlewares: [logging]
});

server.start(options, ({ port }) =>
    console.log(`Server started, listening on port ${port}.`)
)