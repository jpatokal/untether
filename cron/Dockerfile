FROM ruby:2.5

LABEL maintainer="jani@google.com"

ENV MAIN_APP_FILE cron.rb

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . /usr/src/app

CMD ["/bin/bash", "./install.sh"]
