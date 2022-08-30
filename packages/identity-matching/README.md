## Identity-Matching 

This is the MeteorJS Atmosphere package for `/Patient/$match` for Node-On-Fhir. For now it is build on top of the clinical:vault-server and thus also provides core FHIR functionality, including Patient CRUD.

#### API  

```http
GET /baseR4/Patient                       # => fhir bundle of all patients
GET /baseR4/Patient/1                     # => fhir patient with id 1
POST /baseR4/Patient [fhir patient]       # => create patient
DELETE /baseR4/Patient/1                  # => delete patient with id 1
POST /baseR4/Patient/$match [fhir params] # => preform match operation
```

#### HIPAA Compliance & Warantees

This library is for evaluation purposes only, and comes with no guarantees.  We continue to endeavored to make this library as robust as possible, but at the current time it is only HIPAA compliant if it is used entirely behind a VPN firewall.  Please note that this library does not encrypt data over the wire nor at rest, and it does not enforce user authentication or audit logs.  It does provide FHIR APIs suitable for connectathons.  

#### License  
All Rights Reserved.  The contents of this repository are available via the Clarified Artistic License.   
https://spdx.org/licenses/ClArtistic.html  



