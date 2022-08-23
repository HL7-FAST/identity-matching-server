# syntax=docker/dockerfile:1
FROM node:18

# Sudo
RUN apt-get update && apt-get upgrade
RUN apt-get install -y ruby

# Setup user
RUN useradd meteor
USER meteor
WORKDIR /home/meteor

# Install Meteor
#RUN npm install meteor

# Install Bundler
RUN mkdir /home/meteor/.bundle
ENV GEM_HOME="/home/meteor/.bundle"
ENV PATH $GEM_HOME/bin:$GEM_HOME/gems/bin:$PATH
RUN gem install bundler

# Install source code
COPY . .
RUN echo "proxy=http://ip.zscaler.net" >> /home/meteor/.npmrc
RUN npm ci
RUN bundle install

# Let container be executable
ENTRYPOINT entrypoint.sh

# Start server
CMD meteor run --settings configs/settings.nodeonfhir.localhost.json
