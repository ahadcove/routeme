var config = require('./config');
var mail = require('./mail');

// Format The Message and then sends over the to and from location to google maps
exports.getDirections = (info) => {
    console.log('message.body ----', info.body, '\n-----------');
    let body = info.body.split(/(.*)Routeme(.*)(?:\s*YOUR)/gi);
    
    if(body.length < 3){
        body = info.body.split(/(.*)Routeme(.*)/gi);
    }

    // Groups up two addresses in between key word
    let tempAddrGroups = [];

    if(body[1] && body[2]){
        console.log('Were in business');
        tempAddrGroups.push(body[1]);
        tempAddrGroups.push(body[2]);
        info.body = null;
        info.html = null;
        info.address=tempAddrGroups;
        mapMe(info);
    } else{
        console.log('Formatted incorrectly', info);
        mail.sendErrorMsg({info, message: 'Need to send a from location and a to destination with Routeme in between'});
    }
}

// Connect to Google maps api
var googleMapsClient = require('@google/maps').createClient({
    key: config.apiKey
});

// Get's the driving directions from google maps
const mapMe = (info) =>{
    console.log('Map Me', info);
    
    googleMapsClient.directions({
        origin: info.address[0],
        destination: info.address[1],
        mode: 'driving', // driving walking bicycling transit
    }, function(err, res) {
        if (err) {
            console.log('Couldn\'t find an address');
            sendErrorMsg({info, message: 'Could not find the address for either the from location or the to location'});
        };

        console.log('Url', res.requestUrl);
        console.log('Query', res.query.mode, res.query.origin, res.query.destination);
        console.log('Routes', res.json.routes);

        let fullLegs = res.json.routes[0].legs;
        let legs = fullLegs[0];

        let builder={
            fuel: null,
            realTime: legs.duration.text,
            formatTime: legs.duration.text,
            time: legs.duration.text,
            distance: legs.distance.text,
            legs: legs.steps, //Array
            directions: legs.steps, // Maneuvers
            narratives:[]
        };

        console.log('Builder', builder);

        for(let i = 0; i < builder.directions.length; i++){
            builder.narratives.push(builder.directions[i].html_instructions);
            if(i == builder.directions.length-1){
                console.log('Narratives', builder.narratives);
                info.builder = builder;
                mail.sendMail(info);
            }
        }
    });
}
