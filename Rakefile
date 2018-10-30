task :default => :run

task :run do
	ruby "app.rb"
end

task :deploy do
	sh "git push heroku master"
end

namespace :docker do
	task :build do
		sh "sudo docker build -t untether ."
	end

	task :run do
		sh "sudo docker run -p 80:80 untether"
	end

	task :stop do
		sh "sudo docker stop $(sudo docker ps -a -q)"
	end

	task :rm do
		sh "sudo docker rm $(sudo docker ps -a -q)"
	end
end

