
var startTime = new Date();
var checktime;
var processtime;
var twtext = require('twitter-text');
var twitCount = 0;
var showCount = 1;

var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);


var port = process.env.PORT || process.env.VMC_APP_PORT || 3000;
server.listen(port);
 
app.use(express.static(__dirname + '/public'));


var twitter = require('ntwitter');
var tw = new twitter(require('./config').getKeys());

function processcheck () {
  if(twitCount == showCount * 50) {
    console.log('ツイート件数が' + showCount * 5 + '0件に達しました');
    checktime = new Date();
    processtime = checktime - startTime;
    console.log('経過時間は' + processtime + 'msです');
    showCount++;
  }

}



tw.stream('statuses/filter', {'locations': '-180,-90,180,90'}, function(stream) {
  stream.on('data', function (data) {
    if (data.coordinates) {
      var formatted = twtext.autoLink(twtext.htmlEscape(data.text));
      data.text_formatted = formatted;
      io.sockets.emit('message', {
        'id': data.id_str,
        'text': data.text,
        'lnglat': data.coordinates.coordinates,
        'sname': data.user.screen_name,
        'img': data.user.profile_image_url
      });
      twitCount++;
      processcheck();
    }
    
  });
  stream.on('error', function (response) {
    console.log(response);
    process.exit();
  });
  stream.on('end', function (response) {
    console.log(response);
    process.exit();
  });
  stream.on('destroy', function (response) {
    console.log(response);
    process.exit();
  });
});
