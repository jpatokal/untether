require 'uri'
require 'net/http'
require 'rubygems'
require 'json'

sites = {
  "GDAX" => "https://api.gdax.com/products/BTC-USD/ticker",
  "Bitfinex" => "https://api.bitfinex.com/v1/pubticker/btcusd"
}
prices = {}

sites.each do |site, uri|
  url = URI(uri)
  http = Net::HTTP.new(url.host, url.port)
  http.use_ssl = true
  request = Net::HTTP::Get.new(url)
  response = http.request(request)
  json = JSON.parse(response.read_body)
  puts site
  case site
  when "Bitfinex"
    price = json["last_price"]
  when "GDAX"
    price = json["price"]
  end
  puts price
  prices[site] = price.to_f
end

delta = prices['Bitfinex'] - prices['GDAX']
puts "Delta $%.2f" % delta

percent = delta / prices['GDAX']
print "Delta %.2f%%" % (percent * 100)


