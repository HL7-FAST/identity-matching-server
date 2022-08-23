# syntax=docker/dockerfile:1
FROM node:18

# Install Meteor
RUN npm -g install meteor

# Install Rake
RUN gpg --keyserver hkp://pool.sks-keyservers.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
RUN apt-get update
RUN apt-get install -y software-properties-common
RUN apt-add-repository -y ppa:rael-gc/rvm
RUN apt-get install -y rvm
RUN rvm install 2.7
RUN rvm use 2.7

# Install source code
RUN mkdir -p /var/dockerapp
WORKDIR /var/dockerapp
COPY . .
RUN npm ci
RUN bundle install

# Let container be executable
ENTRYPOINT npm run debug

# Start server
CMD meteor run --settings configs/settings.nodeonfhir.localhost.json
