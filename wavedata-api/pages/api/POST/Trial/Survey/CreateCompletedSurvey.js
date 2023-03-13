import {ethers} from 'ethers'
export default async function handler(req, res) {
  try {
    let FixCors = await import("../../../../../contract/fixCors.js");
    await FixCors.default(res);
  } catch (error) {}



  let useContract = await import("../../../../../contract/useContract.js");
  const {api, contract, signerAddress, sendTransaction, ReadContract} = await useContract.default();
    
  if (req.method !== 'POST') {
    res.status(405).json({ status: 405, error: "Method must have POST request" })
    return;
  }

  const { surveyid, userid, date, trialid } = req.body;

	let survey_element = await ReadContract(api, signerAddress, ("_surveyMap"), [Number(surveyid)]);
  
	let details_element = await ReadContract(api, signerAddress, ("getUserDetails"), [Number(surveyid)]);
  
  
  let credits = Number(details_element[1]) + Number(survey_element.reward)

  
  await sendTransaction(api,contract,signerAddress, "UpdateUser",[Number(userid), details_element[0], Number(credits)]);
  
  await sendTransaction(api,contract,signerAddress, "CreateCompletedSurveys",[Number(surveyid), Number(userid), date, Number(trialid)]);

  res.status(200).json({ status: 200, value: "Created" })

}
