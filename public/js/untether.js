var TETHERED = [ "BitFinex", "Poloniex", "Bittrex", "C-Cex" ]
var USD = [ "Bitstamp", "cex.io", "Kraken", "Exmo", "Livecoin", "WEX.nz" ]

// has usdt/usd pairs: exmo, kraken

function update() {
  $.ajax({
    url: "https://api.cryptonator.com/api/full/btc-usd"
  }).success(function(data) {
    for(m in data["ticker"]["markets"]) {
      market = data["ticker"]["markets"][m]
      name = market["market"]
      var index = -1;
      TETHERED.some(function(element, i) {
          if (name.toLowerCase() === element.toLowerCase()) {
              index = i;
              return true;
          }
      });
      console.log(market["market"], market["price"], index > -1 ? "TETHER" : "USD");
      $("." + market["market"]).text(market["price"]);
    }
  }).fail(function(data) {
    console.log("Error", data);
  });
}

$( document ).ready(function() {
    console.log( "ready!" );
    update();
});
