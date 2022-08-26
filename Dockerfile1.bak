# syntax=docker/dockerfile:1

FROM ubuntu:20.04

# Sudo
RUN apt-get update && apt-get upgrade -y

# Install node
ENV NODE_VERSION=14.20.0
RUN apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
RUN ls -lR /root | echo
RUN exit

ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version

#RUN curl https://deb.nodesource.com/setup_14.x | bash -
#RUN apt-get -y install git
#RUN echo "12" | apt-get -y install nodejs
#RUN apt-get -y install npm
#RUN apt-get install -y ruby

#RUN npm config set strict-ssl false

# Install Meteor
#RUN curl https://install.meteor.com/ -k | sh
#RUN npm install -g meteor

# Install Bundler
#RUN mkdir -p /home/meteor/.bundle
#ENV GEM_HOME="/home/meteor/.bundle"
#ENV PATH $GEM_HOME/bin:$GEM_HOME/gems/bin:$PATH
#RUN gem install bundler rake

# Setup user
RUN useradd meteor
USER meteor
WORKDIR /home/meteor

#RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
#RUN bash -lc "source /home/meteor/.bashrc && nvm install 14"
#RUN bash -lc "source /home/meteor/.bashrc && nvm use 14"

# Install source code
COPY --chown=meteor . identity-matching-server/
WORKDIR /home/meteor/identity-matching-server
RUN npm ci

# Start server
CMD meteor run --settings configs/settings.nodeonfhir.localhost.json
