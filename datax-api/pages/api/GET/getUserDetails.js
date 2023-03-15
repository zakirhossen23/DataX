

export default async function handler(req, res) {
  try {
    let FixCors = await import("../../../contract/fixCors.js");
    await FixCors.default(res);
  } catch (error) {}



  let useContract = await import("../../../contract/useContract.js");
	const {api,  signerAddress, sendTransaction, ReadContract} = await useContract.default();
	let details_element = await ReadContract(api, signerAddress, ("getUserDetails"), [Number(req.query.userid)]);
  var newUser = {
    id: Number(req.query.userid),
    image: details_element.image,
    credits: Number(details_element.credits),
    accessToken:details_element.accesstoken
  };

  res.status(200).json({ value: newUser })
}
