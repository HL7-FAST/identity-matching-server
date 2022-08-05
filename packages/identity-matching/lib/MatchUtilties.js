import RestHelpers from '../FhirServer/RestHelpers';
import fhirPathToMongo from '../FhirServer/FhirPath';

import { get, has, set, find, unset, cloneDeep, capitalize, findIndex, countBy } from 'lodash';
import moment from 'moment';
import { Meteor } from 'meteor/meteor';

const BASE_PROFILE = "http://hl7.org/fhir/us/identity-matching/StructureDefinition/IDI-Patient";
const LEVEL0_PROFILE = "http://hl7.org/fhir/us/identity-matching/StructureDefinition/IDI-Patient-L0";
const LEVEL1_PROFILE = "http://hl7.org/fhir/us/identity-matching/StructureDefinition/IDI-Patient-L1";

const ERROR_CODES = {
  "invalid profile": 1,
  "profile not met": 2
};

function validateMinimumRequirement(matchParams) {
  let profileAssertion = get(matchParams, 'meta.profile[0]');
  switch (profileAssertion) {
    case BASE_PROFILE:
      let nameExists = (!!get(matchParams, 'name[0].family') && !!get(matchParams, 'name[0].given[0]'));
      let addressExists = (!!get(matchParams, 'address[0].line') && !!get(matchParams, 'address[0].city'));
      console.log("address exists?", addressExists.toString());
      if (nameExists || !!get(matchParams, 'birthDate') || !!get(matchParams, 'telecom') || addressExists || !!get(matchParams, 'identifier')){
        return 0;
      }
      break;
    case LEVEL0_PROFILE:
      if (calculateWeight(matchParams) >= 10) {
        return 0;
      }
      break;
    case LEVEL1_PROFILE:
      if (calculateWeight(matchParams) >= 20) {
        return 0;
      }
      break;
    default:
      return ERROR_CODES['invalid profile'];
  }
  return ERROR_CODES['profile not met'];
}

function calculateWeight(matchParams) {
  return 20;
}

// param patientResource: IDIPatient profile FHIR resource
// returns bool
function hasAddress(patientResource) {
	return has(patientResource, "address[0].line") &&
		   ( has(patientResource, "address[0].zipcode") ||
		     (has(patientResource, "address[0].state") && has(patientResource, "address[0].city"))
		   );
}

// param patientResource: IDIPatient profile FHIR resource
// returns bool
function hasPhone(patientResource) {
	return get(patientResource, "telecom.system") == "phone";
}

// param patientResource: IDIPatient profile FHIR resource
// returns bool
function hasEmail(patientResource) {
	return get(patientResource, "telecom.system") == "email";
}

// param patientResource: IDIPatient profile FHIR resource
// returns bool
function hasName(patientResource) {
	return has(patientResource, "name[0].family") && has(patientResource, "name[0].given[0]");
}

// calculateWeight
// param patientResource: IDIPatient profile FHIR resource
// returns weight: int
function calculateWeight(patientResource) {
	let total = 0;
	let addedMinorIdentifier = false;

	// add 10 for passport number, 10 for drivers license or state id, and 4 for all other identifiers
	if( has(patientResource, "identifier") ) {
		let hasPassport = false;
		let hasDriversLicense = false;
		let hasStateId = false;

		patientResource.identifier.forEach(function(x) {
			hasPassport ||= (get(x, "type.coding[0].code") == "PPN");
			hasDriversLicense ||= (get(x, "type.coding[0].code") == "DL");
			hasStateId ||= (get(x, "type.coding[0].code") == "STID" );
		});

		//console.log( "DEBUG:", get(identifiers, "[0]") );
		//console.log( "DEBUG:", get(identifiers, "[0].type") );
		//console.log( "DEBUG:", get(identifiers, "[0].type.coding") );
		//console.log( "DEBUG:", get(identifiers, "[0].type.coding[0]") );
		//console.log( "DEBUG:", get(patientResource, "identifier[0].type.coding[0].code") );
		//console.log( "DEBUG:", get(patientResource, "identifier[0].type.coding[0].code") == "DL" );
		//console.log( "DEBUG:", hasDriversLicense );

		if(hasPassport) {
			// assume passport belongs to US
			total += 10;
		}

		if(hasStateId || hasDriversLicense) {
			total += 10;
			//console.log("weighing: found state id/drivers license");
		}

		// add 4 for each minor identifier
		patientResource.identifier.forEach(function(x) {
			if( !addedMinorIdentifier && !(get(x, "type.coding[0].code") in ["PPN","DL","STID"]) ) {
				addedMinorIdentifier=true;
				total += 4;
				//console.log("weighing: found minor identifier");
			}
		});
	}

	// add 4 for address, phone, email, or photo if minor identifiers did not do so already
	if( !addedMinorIdentifier && (
		hasAddress(patientResource) ||
		hasPhone(patientResource) ||
		hasEmail(patientResource) ||
		has(patientResource, "photo")
	) ) {
		total += 4;
		//console.log("weighing: found address/phone/email/photo");
	}

	// add 4 for name
	if( hasName(patientResource) ) {
		total += 4;
		//console.log("weighing: found full name");
	}

	// add 2 for dob
	if( has(patientResource, "birthDate") ) {
		total += 2;
		//console.log("weighing: found birthDate");
	}

	return total;
}


module.exports = {
  validateMinimumRequirement,
  calculateWeight
}
