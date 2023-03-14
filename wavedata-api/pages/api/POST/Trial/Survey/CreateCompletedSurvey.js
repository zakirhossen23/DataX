
export default async function handler(req, res) {
  try {
    let FixCors = await import("../../../../../contract/fixCors.js");
    await FixCors.default(res);
  } catch (error) {}



  let useContract = await import("../../../../../contract/useContract.js");
  const {api,  signerAddress, sendTransaction, ReadContract} = await useContract.default();
    
  if (req.method !== 'POST') {
    res.status(405).json({ status: 405, error: "Method must have POST request" })
    return;
  }

  const { surveyid, userid, date, trialid } = req.body;

	let survey_element = await ReadContract(api, signerAddress, ("_surveyMap"), [Number(surveyid)]);
  
	let details_element = await ReadContract(api, signerAddress, ("getUserDetails"), [Number(userid)]);
  
  
  let credits = Number(details_element.credits) + Number(survey_element.reward)

  
  await sendTransaction(api,signerAddress, "UpdateUser",[Number(userid), details_element.image, Number(credits)]);
  
  await sendTransaction(api,signerAddress, "CreateCompletedSurveys",[Number(surveyid), Number(userid), date, Number(trialid)]);

  res.status(200).json({ status: 200, value: "Created" })

}
