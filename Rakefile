# frozen_string_literal: true

require 'json'
require 'rest-client'

task default: %w[help]


## ========= Server endpoints (UPDATE THESE) ====================================================
CREATE_PATIENT_URL = "http://127.0.0.1:3000/baseR4/Patient" # assumes POST
DELETE_PATIENT_URL = "http://127.0.0.1:3000/baseR4/Patient/:id" # assumes DELETE


## ========= Helper functions ===================================================================

# iterate through fixtures/*.json
def for_each_json_fixture(&block)
	Dir.each_child( File.join(__dir__, "fixtures", "patient") ) do |filename|
		path = File.join(__dir__, "fixtures", filename)
		if filename.end_with? '.json'
			json = File.read(path)
			yield(filename, json)
		end
	end
end


## ========= Tasks ==============================================================================

desc "Print help information for Rake (Ruby Make)"
task :help do
	puts <<~EOS
		Rake (Ruby Make) tasks for Identity Matching Server.
		Go to #{__FILE__} and set your server endpoints.
		First launch server as listed in README, then run the commands below as needed:

		$ rake --tasks
		# => print available tasks and descriptions

		$ rake seed
		# => send POST requests to seed database with FHIR patients from fixtures/

		$ rake drop
		# => delete all FHIR patients from fixtures/ in database

		Note the operations depend on the top level "id" field in each json file in fixtures/.
	EOS
end

desc "create FHIR patients from fixtures/ into server database"
task :seed do
	for_each_json_fixture do |filename, json|
		print "Creating #{filename} ... "
		response = RestClient.post(CREATE_PATIENT_URL, json, {'Content-Type' => 'application/fhir+json', 'Content-Length' => json.length})
		if response.code >= 200 && response.code < 300 or (response.code == 303)
			print "success (code = #{response.code})\n"
		else
			print "failed (code = #{response.code})\n"
		end
	end
end

desc "delete all FHIR patients from fixtures/ in database"
task :drop do
	for_each_json_fixture do |filename, json|
		id = JSON.parse(json).fetch("id")
		raise "Error - FHIR artifact #{filename} must have id" if !id
		delete_url = DELETE_PATIENT_URL.gsub(':id', id)
		response = RestClient.delete(delete_url)
		if response.code >= 200 && response.code < 300 or (response.code == 303)
			puts "Success DELETE #{delete_url}"
		else
			puts "Error DELETE #{delete_url} for #{filename}"
		end
	end
end
