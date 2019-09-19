const Customer = require(process.cwd() + '/business/customer');
const Ticket = require(process.cwd() + '/business/ticket');
const Common = require(process.cwd() + '/utility/commonfunctions'); // if an await statement errors it will return a rejected promise, we can write a helper function that wraps our express service to handle rejected promises.
const url = require('url');


module.exports = (app) => {
    app.post('/servicedesk/createcustomer', Common.asyncAwait(async (req, res, next) => {
        let response = await Customer.createCustomer(req, res, next);
        res.status(200).send(JSON.parse(response));
    }))
    app.post('/servicedesk/addcustomertoorganization', Common.asyncAwait(async (req, res, next) => {
        let response = await Customer.addCustomerToOrganization(req, res, next);
        res.status(200).send(response);
    }))
    app.post('/servicedesk/listcustomertypeticket', Common.asyncAwait(async (req, res, next) => {
        let response = await Ticket.listCustomerTypeTicket(req, res, next);
        res.status(200).send(JSON.parse(response));
    }))
    app.post('/servicedesk/createticket', Common.asyncAwait(async (req, res, next) => {
        let response = await Ticket.createTicket(req, res, next);
        res.status(200).send(JSON.parse(response));
    }))

    //customer
    app.post('/servicedesk/getcustomerdetails', Common.asyncAwait(async (req, res, next) => {
        let response = await Customer.getCustomerDetails(req, res, next);
        res.status(200).send(JSON.parse(response));
    }))

    app.post('/servicedesk/getissue', Common.asyncAwait(async (req, res, next) => {
        let response = await Ticket.getUserIssue(req, res, next);
        res.status(200).send(JSON.parse(response));
    }))

    app.post('/servicedesk/getissuecomments', Common.asyncAwait(async (req, res, next) => {
        let response = await Ticket.getIssueComments(req, res, next);
        res.status(200).send(JSON.parse(response));
    }))

    app.post('/servicedesk/addissuecomments', Common.asyncAwait(async (req, res, next) => {
        let response = await Ticket.addIssueComments(req, res, next);
        res.status(200).send(JSON.parse(response));
    }))

    app.post('/servicedesk/createissue', Common.asyncAwait(async (req, res, next) => {
        let response = await Ticket.createIssue(req, res, next);
        res.status(200).send(JSON.parse(response));
    }))

    app.post('/servicedesk/searchticket', Common.asyncAwait(async (req, res, next) => {
        let response = await Ticket.searchTicket(req, res, next);
        res.status(200).send(JSON.parse(response));
    }))

    app.post('/servicedesk/getalltransitionsofaticket', Common.asyncAwait(async (req, res, next) => {
        let response = await Ticket.getAllTransitionsOfATicket(req, res, next);
        res.status(200).send(JSON.parse(response));
    }))

    app.post('/servicedesk/gettypeticketsforpracticeandcustomers', Common.asyncAwait(async (req, res, next) => {
        let response = await Ticket.getTypeTicketsForPracticeAndCustomers(req, res, next);
        res.status(200).send(JSON.parse(response));
    }))

    //Organization
    app.post('/servicedesk/getorganizationinservicedesk', Common.asyncAwait(async (req, res, next) => {
        let response = await Customer.getOrganizationInServiceDesk(req, res, next);
        res.status(200).send(JSON.parse(response));
    }))

    app.post('/servicedesk/listofservicedesks', Common.asyncAwait(async (req, res, next) => {
        let response = await Customer.listOfServiceDesks(req, res, next);
        res.status(200).send(JSON.parse(response));
    }))


    app.post('/servicedesk/requesttypesassociatedwithspecificservicedesk', Common.asyncAwait(async (req, res, next) => {
        let response = await Customer.requestTypesAssociatedWithSpecificServiceDesk(req, res, next);
        res.status(200).send(JSON.parse(response));
    }))

    app.post('/servicedesk/specificrequesttypesassociatedwithspecificservicedesk', Common.asyncAwait(async (req, res, next) => {
        let response = await Customer.specificRequestTypesAssociatedWithSpecificServiceDesk(req, res, next);
        res.status(200).send(JSON.parse(response));
    }))

    app.post('/servicedesk/getpracticestatus', Common.asyncAwait(async (req, res, next) => {
        let response = await Ticket.getPracticeStatus(req, res, next);
        res.status(200).send(JSON.parse(response));
    }))

    app.post('/servicedesk/getmeasurestatus', Common.asyncAwait(async (req, res, next) => {
        let response = await Ticket.getMeasureStatus(req, res, next);
        res.status(200).send(JSON.parse(response));
    }))

    
    app.post('/servicedesk/getmeasurestatusbymeasureset', Common.asyncAwait(async (req, res, next) => {
        try{
            let response = await Ticket.getmeasurestatusbymeasureset(req, res, next);
            res.status(200).send(JSON.parse(response));
        }catch(err){
            let returnValue={
                data:null,
                error:err.message
            }
            res.status(200).send(returnValue);
        }
    }))

    //test method 
    app.get('/servicedesk/test', Common.asyncAwait(async (req, res, next) => {
        let response = {
            data: {
                test: "success"
            }
        }
        response=JSON.stringify(response);
        res.status(200).send(JSON.parse(response));
    }))

    app.post('/servicedesk/getpracticestatuscustomerworkflow', Common.asyncAwait(async (req, res, next) => {
        let response = await Ticket.getPracticeStatusCustomerWorkflow(req, res, next);
        res.status(200).send(JSON.parse(response));
    }))


};

