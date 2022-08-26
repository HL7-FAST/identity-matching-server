# UDAP Security and Identity Matching Server

This application is a FHIR reference implementation server for the [security](http://build.fhir.org/ig/HL7/fhir-udap-security-ig/) and [identity matching](http://build.fhir.org/ig/HL7/fhir-identity-matching-ig/) implementation guides.

## Dependencies
 - [npm](https://www.npmjs.com/)
 - [bundler](https://bundler.io/)

## Quickstart
```bash
# make sure you have meteor 2.x installed
npm install -g meteor

# clone repository
git clone https://github.com/HL7-FAST/identity-matching-server.git

# move into repository and install libraries
cd identity-matching-server
npm ci

# launch server
meteor run --settings configs/settings.nodeonfhir.localhost.json

# now open http://localhost:3000/ to make sure its runnning

# seed database with fixtures/patient
bundle install
bundle exec rake seed

# query match endpoint
# this uses the very handy http command from https://httpie.io/
http POST "localhost:3000/baseR4/Patient/\$match" "accept:application/fhir+json" @fixtures/parameters/example1.json
```

## How it works:

This application is MeteorJS app with builtin FHIR support and Rake for tooling. The `rake seed` command creates all FHIR patients in fixtures/patients/ in database. The file fixtures/parameters/example1.json is the POST body for an example `/baseR4/Patient/$match` call. File packages/identity-matching/FhirServer/Core.js actually implements the server in NodeJS, with full Patient RESTful CRUD support. All the functionality for `$match` is modularized into packages/identity_matching/lib/MatchUtilties.js file, and the file configs/settings.nodeonfhir.localhost.json controls security features such as enabling OAuth2. OAuth2 is disabled by default.

## Important Links
- [License](https://github.com/symptomatic/node-on-fhir/blob/master/LICENSE.md)
- [Change Log / Release History](https://github.com/symptomatic/node-on-fhir/releases)  
- [Installation](https://github.com/symptomatic/node-on-fhir/blob/master/INSTALLATION.md)  
- [Configuration Settings](https://github.com/symptomatic/node-on-fhir/blob/master/API.md)  
- [Meteor Guide](https://guide.meteor.com/)
- [Getting Started with FHIR](https://www.hl7.org/fhir/modules.html).
- [Software Development Kit](https://github.com/symptomatic/software-development-kit)
- [Contributing](https://github.com/symptomatic/node-on-fhir/blob/master/CONTRIBUTING.md)  
- [Code of Conduct](https://github.com/symptomatic/node-on-fhir/blob/master/CODE_OF_CONDUCT.md)  
- [Community Bridge Funding](https://funding.communitybridge.org/projects/node-on-fhir)  
- [Quality Control](https://circleci.com/gh/symptomatic/node-on-fhir)  
- [Material UI](https://material-ui.com/store/) 
- [The 12-Factor App Methodology Explained](https://www.bmc.com/blogs/twelve-factor-app/)  


## Technology Stack

![StackShare](https://user-images.githubusercontent.com/675910/143241422-a9d13558-0665-4e87-8f25-8257b4fcd393.png)

