require 'haml'
require 'sinatra'

get '/' do
  haml :index
end

