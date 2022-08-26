FROM meteor/meteor-base:20211013T200759Z_489f5fe

USER mt
WORKDIR /home/mt


COPY --chown=mt . app/
EXPOSE 3000:3000
CMD	cd app && meteor run --settings configs/settings.nodeonfhir.localhost.json