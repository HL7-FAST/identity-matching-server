FROM meteor/meteor-base:20211013T200759Z_489f5fe

USER root
RUN npm install -g npm

USER mt
WORKDIR /home/mt
#USER root
#WORKDIR /srv/

COPY --chown=mt . app/
WORKDIR /home/mt/app
#WORKDIR /srv/app

#RUN node $(which npm) ci
#RUN mkdir /home/mt/.npm.cache
#RUN npm config set cache /home/mt/.npm.cache --global
RUN npm ci
EXPOSE 3000:3000
CMD	bash -lc "meteor run --settings configs/settings.nodeonfhir.localhost.json"
