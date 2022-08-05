import {get, has, find} from 'lodash';


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
export function calculateWeight(patientResource) {
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
