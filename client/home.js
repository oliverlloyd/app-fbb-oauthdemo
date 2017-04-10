import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor'

import './home.html';

Router.route('/', function () {
  this.render('home');
});
// Some global vars
hostname = 'https://tantaluminnovation-dev.apigee.net';
rootpath = 'oauth2';
// clientId = '9Cdah6DdfvtG9KxDJgs2mgyb5efucIrB'; // TEST
clientId = 'V5KmOCQ50c22XpEvmkWGGaTahA2R8ud9'; // DEV
// clientSecret = 'AtKUhnoNbxdSvITw';
privateEndpoint = 'https://tantaluminnovation-dev.apigee.net/api/swagger-ui.html';

Session.set('messages', []); // global

writeMsg = function(msg) { // global
  console.info('DEBUG: ', msg);
  let msgs = Session.get('messages');
  msgs.push(msg);
  Session.set('messages', msgs);
}

// Where we want Google to send our code
const redirect_uri = `${Meteor.absoluteUrl()}code`;

console.info('--------- OAuth Demo ----------');
console.info('A basic frontend app to demonstrate how to auth against the private Firestarter API');
console.info('The steps are:');
console.info(`1. Call /auth with the redirect_uri query param, in this case: ${redirect_uri}`);
console.info('2. This call will 302 to Google and then route back to the given redirect_uri with a code as a query param.');
console.info('3. Take this code and POST it to the tantalum site to get a token back.');
console.info('4. Store the token somewhere, cookie, localStorage, etc.');
console.info('5. Now you can use this token to call private endpoints on the firestarter API.');
console.info('-------------------------------');


Template.home.onCreated(function() {
  Session.set('messages', []);
});

Template.home.helpers({
  messages() {
    return Session.get('messages');
  },
});

Template.home.events({
  'click .js-privateapi': function() {
    const token = localStorage.getItem('token');
    console.info('Calling private endpoint using token: ', token);
    HTTP.get(privateEndpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, function(err, response) {
      if ( err ) writeMsg('An error occured trying to access that endpoint. You\'re probably unauthorised')
      if ( response && response.statusCode ) writeMsg(`Response: ${response.statusCode}`);
    })
  },
});

Template.signinButton.events({
  'click .js-signin': function() {
    window.location.replace(`${hostname}/${rootpath}/auth?redirect_uri=${redirect_uri}&client_id=${clientId}&prompt=consent&access_type=offline`);
  },
});
