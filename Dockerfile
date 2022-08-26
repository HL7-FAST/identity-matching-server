FROM meteor/meteor-base:20211013T200759Z_489f5fe

RUN apt-get install -y git

USER mt
WORKDIR /home/mt


COPY --chown=mt . app/
WORKDIR /home/mt/app
RUN npm ci
EXPOSE 3000:3000
CMD	bash -lc "meteor run --settings configs/settings.nodeonfhir.localhost.json"
