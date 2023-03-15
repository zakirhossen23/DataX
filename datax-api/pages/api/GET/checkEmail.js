

export default async function handler(req, res) {
  try {
    let FixCors = await import("../../../contract/fixCors.js");
    await FixCors.default(res);
  } catch (error) {}

  let useContract = await import("../../../contract/useContract.js");
  const {api,  signerAddress, sendTransaction, ReadContract} = await useContract.default();
	let output = await ReadContract(api, signerAddress, ("CheckEmail"), [req.query.email]);
			
  res.status(200).json({ value: output })
}
