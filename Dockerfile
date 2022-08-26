# syntax=docker/dockerfile:1

# usage: DOCKER_BUILDKIT=1 docker build . --secret id=cert,src=/path/to/cert

FROM node:14

# Sudo
RUN apt-get update -y
RUN apt-get install -y ruby

# Setup user
#RUN useradd meteor
#USER meteor
RUN npm config set strict-ssl false
RUN npm install -g meteor


#COPY --chown=meteor . .
COPY --chown=meteor . .
RUN npm ci

WORKDIR /home/meteor

# Install Meteor
#RUN curl https://install.meteor.com/ -k | sh

# Install Bundler
RUN mkdir -p /home/gem/.bundle
ENV GEM_HOME="/home/gem/.bundle"
ENV PATH $GEM_HOME/bin:$GEM_HOME/gems/bin:$PATH
RUN gem install bundler rake

# Install source code

# Install dependencies
#RUN --mount=type=secret,id=cert export NODE_EXTRA_CA_CERTS=/run/secrets/cert

# Let container be executable
#ENTRYPOINT entrypoint.sh

# Start server
#RUN chmod -R 700 .meteor/local
CMD meteor run --settings configs/settings.nodeonfhir.localhost.json
