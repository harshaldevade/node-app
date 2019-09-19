const resolvers = {
    Query: {
        ...require("./decile_quality").queries,
        ...require("./profile_quality").queries,
        ...require("./measureset").queries,
        ...require("./CHPLId_quality").queries,
        ...require("./quality_score").queries,
        ...require("./ep_quality").queries,
        ...require("./performance").queries,
        ...require("./getmeasures").queries
    },
    Mutation: {
        ...require("./profile_quality").mutations,
        ...require("./measureCollectionType_quality").mutations,
        ...require("./submission_type").mutations,
        ...require("./ep_quality").mutations,

    },
}
module.exports = resolvers;