Router.route('/code', function () {
  this.render('code');
});

Session.setDefault('code', 'not available');
Session.setDefault('token', 'not available');

Template.code.onRendered(function() {
  const query = Router.current().params.query;
  const code = query && query.code;
  // Now that we've pulled the code from the query param, set it in the session var
  Session.set('code', code);
  // Now that we have the code we need to POST it to have it transformed into an access token that we can use
  HTTP.call('POST', `${hostname}/${rootpath}/token`, {
    data: {
      code: code,
      client_id: clientId
    }
  }, function(err, response) {
    if ( err ) console.error(err);
    // The response to the call to /token contains the access_token
    // This should be sotred and used for all future API calls
    const token = response && response.data && response.data.access_token;
    writeMsg(`We got a response from the call to /token.`);
    if ( token ) {
      writeMsg(`You can now try to call the API using header: <div class="ui label">Authorization: Bearer ${token}</div>`);
      writeMsg('Click the link below for an example request')
    } else {
      writeMsg('There was a problem getting the token. You can only use the code once so try signing in again.');
    }
    // Store the token locally, you could also use cookies here
    localStorage.setItem('token', token);
    Session.set('token', token);
  });
});

Template.code.helpers({
  messages() {
    return Session.get('messages');
  },
  code() {
    return Session.get('code');
  },
  token() {
    return Session.get('token');
  }
});

Template.code.events({
  'click .js-privateapi': function() {
    const token = localStorage.getItem('token');
    console.info('Calling private endpoint using token: ', token);
    HTTP.get(privateEndpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }, function(err, response) {
      if ( err ) writeMsg('An error occured trying to access that endpoint. You\'re probably unauthorised')
      if ( response && response.statusCode ) writeMsg(`The response code for that api call was: ${response.statusCode}`);
    })
  },
});
