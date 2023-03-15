export default async function handler(req, res) {
	try {
		let FixCors = await import("../../../contract/fixCors.js");
		await FixCors.default(res);
	} catch (error) {}

	let useContract = await import("../../../contract/useContract.js");
	const {api,  signerAddress, sendTransaction, ReadContract} = await useContract.default();
	
	let userdetails = await ReadContract(api, signerAddress, ("getUserDetails"), [Number(req.query.userid)]);
	let fhir_element = JSON.parse(await ReadContract(api, signerAddress, ("_fhirMap"), [Number(req.query.userid)]));
	var newFhir = {
		id: Number(fhir_element.userId),
		family_name: fhir_element.familyName,
		given_name: fhir_element.givenName,
		identifier: fhir_element.identifier,
		phone: fhir_element.phone,
		gender: fhir_element.gender,
		about: fhir_element.about,
		patient_id: fhir_element.patientId,
		privatekey: userdetails.privatekey,
		image: fhir_element.image,
		credits: fhir_element.credits
	};
	if (newFhir.patient_id === "") {
		newFhir = null;
	}

	res.status(200).json({value: newFhir});
}

