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

// const MATCHING_SCORE_THRESHOLD = 0.0;

const MATCHING_SCORE_THRESHOLDS = {
		"best": 0.99,
		"superior": 0.8,
		"very good": 0.7,
		"good":  0.6
}


// Decide if a Patient record is a match or not
// params:
//    patient: FHIR Patient Resource from database record
//    params: FHIR Patient Resource from http parameters, already validated
//    level: constant that can be used for more fine-tuned control over threshold
// returns:
//    bool
function isMatch(patient, params, level) {
	/* NOTE:
		The $match operation can decide to return matches based on any score
		threshold. We compute the matching score against all records and try
		to return them all to the client. Later the results are sorted and
		sliced to client-requested limit.
     */
	let matchLevel = MATCHING_SCORE_THRESHOLDS[level];
	console.log("matchLevel: ", matchLevel);
	// if (!!matchLevel) {
	// 	return false;
	// }
	let score = calculateScore(patient, params);
	if( score >= matchLevel ) {
		return true;
	}
	return false;
}

// Actual $match logic
// params:
//    patient: FHIR Patient Resource from database record
//    params: FHIR Patient Resource from http parameters, already validated
// returns:
//    float: true if match, false if not
function calculateScore(patient, params) {
	// TODO
	let score = 0;
	console.log("first score: ", score);
	// console.log("params: ", params);
	// console.log("patient: ", patient);
	if (fieldExists(patient, params, 'name[0].family')  &&
	 		(fieldExists(patient, params, 'name[0].given[0]'))) {
			let paramName = get(params, 'name[0].family') + get(params, 'name[0].given[0]');
			let patientName = get(patient, 'name[0].family') + get(patient, 'name[0].given[0]');
			console.log("paramName: ", paramName);
			console.log("patientName: ", patientName);
			if (paramName == patientName) {
				score += 0.4;
			}
		}
	if (!!get(params, 'identifier') && !!get(patient, 'identifier')) {
			console.log("score so far: ", score);
			get(params, 'identifier').map(function(identifier){
				get(patient, 'identifier').map(function(ident, index){
					if (ident["type"]["coding"][0]["code"] == identifier["type"]["coding"][0]["code"]){
						if (ident["value"] == identifier["value"]){
							score +=0.4;
						}
					}
				});
		});
	}
	if (fieldExists(patient, params, 'gender') && (get(params, 'gender') == get(patient, 'gender'))) {
		score += 0.05;
	}
	if ((fieldExists(patient, params, 'birthDate')) && ((get(params, 'birthDate').startsWith(get(patient, 'birthDate')) ||
																											(get(patient, 'birthDate').startsWith(get(params, 'birthDate')))
																											)))
	{
		score += 0.2-(0.05*Math.abs(get(params, 'birthDate').length-get(patient, 'birthDate').length)/3);
	}
	console.log("score", score);
	return score;
}


// Determine if Parameters are valid according to respective IDI Patient Profile requirements
// params:
//	  matchParams: FHIR Patient Resource from http parameters
// returns
//    bool: true if valid
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

function fieldExists(param1, param2, queryString) {
	return ((!!get(param1, queryString)) && !!(get(param2, queryString)));
}
// calculateWeight
// params:
//	 patientResource: IDIPatient profile FHIR resource
// returns:
//	 int: weight
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

function matchName(name1, name2) {
	name1
}

// assign a value from MatchGrade code system based on score
// https://terminology.hl7.org/ValueSet-match-grade.html
function matchGrade(score) {
    if( score >= MATCHING_SCORE_THRESHOLDS.best ) {
        return new String("certain");
    }
    else if( score >= MATCHING_SCORE_THRESHOLDS.superior ) {
        return new String("probable");
    }
    else if( score >= MATCHING_SCORE_THRESHOLDS.good ) {
        return new String("possible");
    }
    else return new String("certainly-not");
}

module.exports = {
  validateMinimumRequirement,
  calculateWeight,
  calculateScore,
  isMatch,
  MATCHING_SCORE_THRESHOLDS,
  matchGrade
}
