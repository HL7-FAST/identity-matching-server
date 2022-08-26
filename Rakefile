# frozen_string_literal: true

require 'json'
require 'rest-client'
require 'fhir_models'

task default: %w[help]


## ========= Server endpoints (UPDATE THESE) ====================================================
INDEX_PATIENT_URL = "http://127.0.0.1:3000/baseR4/Patient"      # assumes GET
CREATE_PATIENT_URL = "http://127.0.0.1:3000/baseR4/Patient"     # assumes POST
DELETE_PATIENT_URL = "http://127.0.0.1:3000/baseR4/Patient/:id" # assumes DELETE


## ========= Helper functions ===================================================================

# iterate through fixtures/*.json
def for_each_json_fixture(&block)
	Dir.each_child( File.join(__dir__, "fixtures", "patient") ) do |filename|
		path = File.join(__dir__, "fixtures", "patient", filename)
		if filename.end_with? '.json'
			json = File.read(path)
			yield(filename, json)
		end
	end
end

# report rest api call status
def put_status(response, success_msg = "success", error_msg = "error")
	if response.code >= 200 && response.code < 300 or (response.code == 303)
		puts success_msg
	else
        puts error_msg
	end
end

## ========= Tasks ==============================================================================

desc "Print help information for Rake (Ruby Make)"
task :help do
	puts <<~EOS
		Rake (Ruby Make) tasks for Identity Matching Server.
		Go to #{__FILE__} line 10 and set your server endpoints.
		First launch server as listed in README, then run the commands below as needed:

		$ rake --tasks
		# => print available tasks and descriptions

		$ rake seed
		# => send POST requests to seed server with all FHIR patients from fixtures/patients/

        $ rake "seed:bundle[/path/to/bundle/file]"
        # => sends POST request for each patient entry in FHIR bundle to create entire bundle

		$ rake drop
		# => delete all FHIR patients from server

    	$ rake help
		# => print this message
	EOS
end

desc "create FHIR patients from fixtures/ into server database"
task :seed do
	for_each_json_fixture do |filename, json|
		print "Creating #{filename} ... "
		response = RestClient.post(CREATE_PATIENT_URL, json, {'Content-Type' => 'application/fhir+json', 'Content-Length' => json.length})
        put_status(response, "success (code = #{response.code})", "error (code = #{response.code})")
	end
end

namespace :seed do
    desc "create FHIR patients from a bundle"
    task :bundle, [:filename] do |t, args|
        json = File.read(args.filename)
        bundle = FHIR.from_contents(json)
        bundle.entry.map(&:resource).each_with_index do |resource, i|
            if resource.resourceType == 'Patient'
                response = RestClient.post(CREATE_PATIENT_URL, resource.to_json, {'Content-Type' => 'application/fhir+json', 'Content-Length' => resource.to_json.length})
                put_status(response, "created entry #{i}/#{bundle.entry.length} (code = #{response.code})", "error on entry #{i}/#{bundle.entry.length} (code = #{response.code})")
            end
        end
    end
end

desc "delete all FHIR patients from fixtures/ in database"
task :drop do
    response = RestClient.get(INDEX_PATIENT_URL, headers: {'Accept' => 'application/fhir+json'})
    bundle = FHIR.from_contents( response.body )
    bundle.entry.map(&:resource).each do |resource|
        print "Deleting patient #{resource.id} ... "
		delete_url = DELETE_PATIENT_URL.gsub(':id', resource.id)
		response = RestClient.delete(delete_url)
        put_status(response)
	end
end
