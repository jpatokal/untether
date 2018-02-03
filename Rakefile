task :default => :run

task :run do
	ruby "app.rb"
end

task :deploy do
  sh "git push heroku master"
end

