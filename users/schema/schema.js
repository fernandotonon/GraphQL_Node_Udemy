const graphql = require('graphql');
const axios = require('axios');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users: {
            type: new GraphQLList(UserType),
            resolve: (company) => {
                return axios.get(`http://localhost:3000/companies/${company.id}/users`)
                            .then(response => response.data);
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: { type: CompanyType, 
            resolve: (parentValue) => {
                return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
                            .then(response => response.data);
            }
         }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve: (parentValue, args) => {
                return axios.get(`http://localhost:3000/users/${args.id}`)
                    .then(response => response.data);
            }
        },
        company: {
            type: CompanyType,
            args: { id: { type: GraphQLString } },
            resolve: (parentValue, args) => {
                return axios.get(`http://localhost:3000/companies/${args.id}`)
                    .then(response => response.data);
            }
        }
    }
});

const RootMutation = new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
        createUser: {
            type: UserType,
            args: { 
                firstName: { type: new GraphQLNonNull(GraphQLString) }, 
                age: { type: new GraphQLNonNull(GraphQLInt) }, 
                companyId: { type: GraphQLInt } 
            },
            resolve: (parentValue, {firstName, age}) => {
                return axios.post(`http://localhost:3000/users`, {firstName, age})
                    .then(response => response.data);
            }
        },
        updateUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLString },
                age: { type: GraphQLInt },
                companyId: { type: GraphQLInt }
            },
            resolve: (parentValue, args) => {
                return axios.patch(`http://localhost:3000/users/${id}`, args)
                    .then(response => response.data);
            }
        },
        deleteUser: {       
            type: UserType,
            args: { id: { type: new GraphQLNonNull(GraphQLString) } },
            resolve: (parentValue, {id}) => {
                return axios.delete(`http://localhost:3000/users/${id}`)
                    .then(response => response.data);
            }
        } 
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
});