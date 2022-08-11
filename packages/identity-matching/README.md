## Identity-Matching Package

This is the MeteorJS package implementing `Patient/$match` for the Node On Fhir framework in accordance to the [identity matching implementation guide](http://build.fhir.org/ig/HL7/fhir-identity-matching-ig/).



#### API

**Default base url is http://localhost:3000/baseR4, check configs/settings.nodeonfhir.localhost.json file to see of OAuth2 is enabled.**

```http
GET /Patient HTTP/1.1
Accept: application/json+fhir;

# => returns FHIR Bundle of all Patients in DB


GET /Patient/1 HTTP/1.1
Accept: application/json+fhir;

# => returns FHIR Resource of Patient with id 1


POST /Patient HTTP/1.1
Accept: application/json+fhir;
Content-Type: application/json+fhir

{"resourceType":"Patient","id":"1","name":{...}}

# => create FHIR Patient from resource in body


DELETE /Patient/1 HTTP/1.1

# => destroys FHIR Patient record with id 1 from DB


POST /Patient/$match HTTP/1.1
Accept: application/json+fhir;
Content-Type: applicaton/json+fhir

{resourceType:"Parameters","id":"42","parameters":[...]}

# => preform $match operation with paramaters against database, returns FHIR bundle of search results sorted by score
```

#### HIPAA Compliance & Warantees

This library is for evaluation purposes only, and comes with no guarantees.  We continue to endeavored to make this library as robust as possible, but at the current time it is only HIPAA compliant if it is used entirely behind a VPN firewall.  Please note that this library does not encrypt data over the wire nor at rest, and it does not enforce user authentication or audit logs.  It does provide FHIR APIs suitable for connectathons.


#### License
All Rights Reserved.  The contents of this repository are available via the Clarified Artistic License.
https://spdx.org/licenses/ClArtistic.html



