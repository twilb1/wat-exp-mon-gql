const Express = require("express");
const Mongoose = require("mongoose");
const {
    GraphQLID,
    GraphQLString,
    GraphQLList,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLNonNull
} = require("graphql");
const ExpressGraphQL = require("express-graphql");

var app = Express();

Mongoose.connect('mongodb+srv://Len:1234@twicluster1-sui8h.mongodb.net/acme?retryWrites=true&w=majority',
{ useUnifiedTopology: true, useNewUrlParser: true });

// Create a Database Model
const CustomerModel = Mongoose.model("customers", {
    cust_id: String, 
    name: String, 
    address: String, 
    phone: String
});

// GraphQL Model 
const CustomerType = new GraphQLObjectType({
    name: 'Customer',
    fields: {
        id: { type: GraphQLID},
        cust_id: { type: GraphQLString},
        name: { type: GraphQLString},
        address: { type: GraphQLString},
        phone: { type: GraphQLString}
    }
});

// GraphQL Queries (Read) and Mutations (Write/Update)
const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "Query",
        fields: {
            customers: {
                type: GraphQLList(CustomerType),
                resolve: (root, args, context, info) => {
                    return CustomerModel.find().exec();
                }
            },
            customer: {
                type: CustomerType,
                args: {
                    cust_id: { type: GraphQLString }
                },
                resolve: (root, args, context, info) => {
                    var cust = CustomerModel.findOne({cust_id: args.cust_id}).exec();
                    cust.then(function(doc){/*console.log(doc)*/});
                    return cust;
                }
            }
        }
    }),
    mutation: new GraphQLObjectType({
        name: "Mutation",
        fields: {
            customer: {
                type: CustomerType,
                args: {
                    cust_id: {type: GraphQLString},
                    name: {type: GraphQLString},
                    address: {type: GraphQLString},
                    phone: {type: GraphQLString}
                },
                resolve: (root, args, context, info) => {
                    var customer = new CustomerModel(args);
                    return customer.save();
                }
            }
        }
    })
});

app.use("/graphql", ExpressGraphQL({
    schema: schema,
    graphiql: true         // Enables the GraphQL Playground
}));

app.listen(3000, () => {
    console.log("Listening on port 3000...")
}); 
