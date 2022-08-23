# syntax=docker/dockerfile:1

# usage: DOCKER_BUILDKIT=1 docker build . --secret id=cert,src=/path/to/cert

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
RUN gem install bundler rake

# Install source code
COPY . .

# Install dependencies
#RUN --mount=type=secret,id=cert export NODE_EXTRA_CA_CERTS=/run/secrets/cert
RUN npm config set strict-ssl false
RUN npm ci

# Let container be executable
ENTRYPOINT entrypoint.sh

# Start server
CMD meteor run --settings configs/settings.nodeonfhir.localhost.json
