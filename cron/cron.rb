require "json"
require "mysql2"
require "open-uri"

@db_host, @db_user, @db_pass = ARGV
@db_name = "untether"

data = {}
cryptonator = JSON.parse(open("https://api.cryptonator.com/api/full/btc-usd", &:read))
cryptonator["ticker"]["markets"].each do |m|
  data[m["market"]] = m["price"]
end
gdax = JSON.parse(open("https://api.gdax.com/products/BTC-USD/ticker", &:read))
data["GDAX"] = gdax["price"]

@db = Mysql2::Client.new(:host => @db_host, :username => @db_user, :password => @db_pass, :database => @db_name)
statement = @db.prepare(
  "INSERT INTO data (timestamp, binance, bitfinex, poloniex, hitbtc, bittrex, bitstamp, kraken, gdax)" +
  "VALUES(NOW(), ?, ?, ?, ?, ?, ?, ?, ?)")
statement.execute(
  data['Binance'], data['BitFinex'], data['Poloniex'], data['Hitbtc'],
  data['Bittrex'], data['Bitstamp'], data['Kraken'], data['GDAX'])
