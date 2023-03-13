import {ethers} from "ethers";
import wearableinfo from '../../../../contract/wearableinfo.json'

export default async function handler(req, res) {
	try {
		let FixCors = await import("../../../../contract/fixCors.js");
		await FixCors.default(res);
	} catch (error) {}

	let useContract = await import("../../../../contract/useContract.js");
	const {api,  signerAddress, sendTransaction, ReadContract} = await useContract.default();
    let details_element = await ReadContract(api, signerAddress, ("getUserDetails"), [Number(req.query.userid)]);
	
	if (details_element.accesstoken === "") {
		let registerpage = await import("../../POST/Register");
		details_element.accesstoken = await registerpage.GenerateAccessToken(details_element.name);


		await sendTransaction(api,signerAddress, "UpdateAccessToken",[Number(req.query.userid), details_element.accesstoken]);
           
	}
	var myHeaders = new Headers();
	myHeaders.append("AppAuthorization", wearableinfo.AppAuthorization);
	myHeaders.append("Content-Type", wearableinfo["Content-Type"]);
	myHeaders.append("Authorization", wearableinfo.Authorization);

	var urlencoded = new URLSearchParams();
	urlencoded.append("authenticationToken", details_element.accesstoken);

	var requestOptions = {
		method: "POST",
		headers: myHeaders,
		body: urlencoded,
		redirect: "follow"
	};

	let sourceLink = await (await fetch("https://api.und-gesund.de/v5/dataSourceURL", requestOptions)).text();

	res.status(200).json({value: sourceLink, tokenAddress:details_element.accesstoken});
}
