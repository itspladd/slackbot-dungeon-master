var request = require('request');
var fs = require('fs');

module.exports = function (req, res, next) {
  // constants
  var command = "Derfin"; //default command lists Derfin's spells
  var output = "Character or spell not found.";
  var obj = JSON.parse(fs.readFileSync('spellbook.json', 'utf8'));
  var botPayload = {};

  if (req.body.text) {
    // regex match
    matches = req.body.text.match(/^([a-zA-Z]{1,})$/);

    //convert captures to variables
    if (matches && matches[1]) {
      command = matches[1];
    } else {
      // send error message back to user if input is bad
      return res.status(200).send('Enter a single character name or spell name, case-sensitive.');
    }
  }
  
  //define individual command behavior
  switch (command) {
    case "Derfin":
      output = "";
      output = obj.spellbook.Derfin.One + '\n';
      break;
    case "Jack":
      output = "";
      for (var i = 0, len = obj.spellbook.Jack.length; i < len; i++) {
        level = obj.spellbook.Jack[i];
        output += level + ":\n";
        for (var j = 0, len2 = obj.spellbook.Jack.level.length; j < len2; j++) {
          output += obj.spellbook.Jack.level[j] + "\n";
        }
      }
      break;
  }

  // write response message and add to payload
  botPayload.text = req.body.user_name + ' requested \"' + command + '\":\n' + output;

  botPayload.username = 'spellbot';
  botPayload.channel = req.body.channel_id;
  botPayload.icon_emoji = ':fireworks:';

  // send dice roll
  send(botPayload, function (error, status, body) {
    if (error) {
      return next(error);

    } else if (status !== 200) {
      // inform user that our Incoming WebHook failed
      return next(new Error('Incoming WebHook: ' + status + ' ' + body));

    } else {
      return res.status(200).end();
    }
  });
}

function send (payload, callback) {
  var path = process.env.INCOMING_WEBHOOK_PATH;
  var uri = 'https://hooks.slack.com/services' + path;

  request({
    uri: uri,
    method: 'POST',
    body: JSON.stringify(payload)
  }, function (error, response, body) {
    if (error) {
      return callback(error);
    }

    callback(null, response.statusCode, body);
  });
}