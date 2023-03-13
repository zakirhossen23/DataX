import { useState, useEffect } from "react";
import {
	establishConnection,
	checkProgram,
	InitializeState,
	getOutput,
	UpdateOrInsertData,
	CreateNewPDA
} from './client/wavedata.mjs';
let called = false;
export default function useContract() {
	const [contractInstance, setContractInstance] = useState({
		api: null,
		contract: null,
		signerAddress: null,
		sendTransaction: sendTransaction,
		ReadContract: ReadContract,
		currentChain: null
	});


	useEffect(() => {
		const fetchData = async () => {
			if (window.localStorage.getItem("type") === "Solflare") {
				try {
					await window.solflare.connect();
					// Establish connection to the cluster
					await establishConnection();

					// Check if the program has been deployed
					await checkProgram();

					let output = await getOutput();
					if (!output.initialized) {
						await InitializeState();
					}
					console.log(output);
					window.contract = true;
					setContractInstance({
						signerAddress: window.solflare.publicKey.toBase58(),
						sendTransaction: sendTransaction,
						ReadContract: ReadContract,
						contract: true
					})

				} catch (error) {
					console.error(error);
				}
			}
		};
		setTimeout(() => {
			fetchData();
		}, 200)

	}, []);

	async function sendTransaction(api, signerAddress, method, args = []) {
		await CreateNewPDA();
		switch (method) {
			case "CreateAccount":
				await CreateAccount.apply(this, args)
				break;
			case "UpdatePrivatekey":
				await UpdatePrivatekey.apply(this, args);
				break;
			case "UpdateAccessToken":
				await UpdateAccessToken.apply(this, args);
				break;
			case "CreateTrial":
				await CreateTrial.apply(this, args);
				break;
			case "CreateSurvey":
				await CreateSurvey.apply(this, args);
				break;
			case "CreateOrSaveSections":
				await CreateOrSaveSections.apply(this, args);
				break;
			case "CreateSurveyCategory":
				await CreateSurveyCategory.apply(this, args);
				break;
			case "UpdateTrial":
				await UpdateTrial.apply(this, args);
				break;
			case "UpdateSurvey":
				await UpdateSurvey.apply(this, args);
				break;
			case "UpdateReward":
				await UpdateReward.apply(this, args);
				break;
			case "UpdateAudience":
				await UpdateAudience.apply(this, args);
				break;
			case "UpdateUser":
				await UpdateUser.apply(this, args);
				break;
			case "UpdateFhir":
				await UpdateFhir.apply(this, args);
				break;
			case "CreateOngoingTrail":
				await CreateOngoingTrail.apply(this, args);
				break;
			case "CreateCompletedSurveys":
				await CreateCompletedSurveys.apply(this, args);
				break;
		}

	}

	async function getMapsFromContract(mapName) {
		let db = await getOutput();
		return db.map.get(mapName) !== undefined ? JSON.parse(db.map.get(mapName)) : [];
	}
	//Not using in front
	async function ReadVariablesFromContract(variable) {
		switch (variable) {
			case "_UserIds":
				return (await getMapsFromContract("_userMap")).length;
			case "_TrialIds":
				return (await getMapsFromContract("_trialMap")).length;
			case "_SurveyIds":
				return (await getMapsFromContract("_surveyMap")).length;
			case "_SurveyCategoryIds":
				return (await getMapsFromContract("_categoryMap")).length;
			case "_OngoingIds":
				return (await getMapsFromContract("_ongoingMap")).length;
			case "_AnsweredIds":
				return (await getMapsFromContract("_questionanswerdMap")).length;

		}
	}

	//Not using in front
	async function ReadMapsByIdFromContract(variable, args = null) {
		switch (variable) {
			case "_userMap":
				return (await getMapsFromContract("_userMap"))[args[0]];
			case "_trialMap":
				return (await getMapsFromContract("_trialMap"))[args[0]];
			case "_trialAudienceMap":
				return (await getMapsFromContract("_trialAudienceMap"))[args[0]];
			case "_surveyMap":
				return (await getMapsFromContract("_surveyMap"))[args[0]];
			case "_categoryMap":
				return (await getMapsFromContract("_categoryMap"))[args[0]];
			case "_sectionsMap":

				let db = await getOutput();
				let oldMaps = getAllContainsMapKeys(db.map, `_sectionsMap[${args[0]}]`);
				let fullJSON = "";
				for (let i = 0; i < oldMaps.length; i++) {
					const mapName = oldMaps[i];
					let value =  db.map.get(mapName)
					if (value !== "-1"|| value !== null){
						fullJSON +=value;
					}
				}
				return fullJSON;
			case "_fhirMap":
				return (await getMapsFromContract("_fhirMap"))[args[0]];
			case "_ongoingMap":
				return (await getMapsFromContract("_ongoingMap"))[args[0]];
			case "_questionanswerdMap":
				return (await getMapsFromContract("_questionanswerdMap"))[args[0]];
			case "_completedsurveyMap":
				return (await getMapsFromContract("_completedsurveyMap"))[args[0]];

		}
	}

	//Using all here
	async function ReadContract(api, signerAddress, method, args = null) {

		if (args === null || args === []) {
			return await ReadVariablesFromContract(method);
		}

		switch (method) {
			case "CheckEmail":
				return await CheckEmail.apply(this, args)
				break;
			case "Login":
				return await Login.apply(this, args)
				break;
			case "getUserDetails":
				return await getUserDetails.apply(this, args)
				break;
			case "getAllSurveysIDByTrial":
				return await getAllSurveysIDByTrial.apply(this, args)
				break;
			case "GetOngoingTrial":
				return await GetOngoingTrial.apply(this, args)
				break;
			case "getAllCompletedSurveysIDByUser":
				return await getAllCompletedSurveysIDByUser.apply(this, args)
				break;
			default:
				return await ReadMapsByIdFromContract(method, args)
		}

	}

	return contractInstance;
}

//***************************************Get Functions***********************************//
export async function CheckEmail(email) {
	let db = await getOutput();
	let _userMap = db.map.get("_userMap") !== undefined ? JSON.parse(db.map.get("_userMap")) : [];
	for (let i = 0; i < _userMap.length; i++) {
		const element = _userMap[i];
		if (email === element.email) return element.userId;
	}
	return "False";
}

export async function Login(email, password) {
	let db = await getOutput();
	let _userMap = db.map.get("_userMap") !== undefined ? JSON.parse(db.map.get("_userMap")) : [];
	for (let i = 0; i < _userMap.length; i++) {
		const element = _userMap[i];
		if (email === element.email && password === element.password) return element.userId;
	}
	return "False";
}


export async function getUserDetails(userId) {
	let db = await getOutput();
	let _userMap = db.map.get("_userMap") !== undefined ? JSON.parse(db.map.get("_userMap")) : [];

	for (let i = 0; i < _userMap.length; i++) {
		const element = _userMap[i];
		if (userId === element.userId) return element;
	}
	return "False";
}


export async function getAllSurveysIDByTrial(trialId) {
	let db = await getOutput();
	let _surveyMap = db.map.get("_surveyMap") !== undefined ? JSON.parse(db.map.get("_surveyMap")) : [];
	let allSurveys = [];

	for (let i = 0; i < _surveyMap.length; i++) {
		const element = _surveyMap[i];
		if (trialId === element.trialId) allSurveys.push(element);
	}
	return allSurveys;
}


export async function GetOngoingTrial(userId) {
	let db = await getOutput();
	let _ongoingMap = db.map.get("_ongoingMap") !== undefined ? JSON.parse(db.map.get("_ongoingMap")) : [];

	for (let i = 0; i < _ongoingMap.length; i++) {
		const element = _ongoingMap[i];
		if (userId === element.userId) return element.trialId;
	}
	return "False";
}


export async function getAllCompletedSurveysIDByUser(userId) {
	let db = await getOutput();
	let _completedsurveyMap = db.map.get("_completedsurveyMap") !== undefined ? JSON.parse(db.map.get("_completedsurveyMap")) : [];
	let result = [];
	for (let i = 0; i < _completedsurveyMap.length; i++) {
		const element = _completedsurveyMap[i];
		if (userId === element.userId) {
			result.push(i);
		};
	}
	return result;
}


//*****************************Send Transaction Functions*********************************//
export async function CreateAccount(full_name, email, password) {
	let db = await getOutput();
	var obj = {
		userId: 0,
		name: full_name,
		email: email,
		password: password,
		privatekey: "",
		walletaddress: window.solflare.publicKey.toBase58(),
		image: "https://i.postimg.cc/SsxGw5cZ/person.jpg",
		credits: 0,
		accesstoken: "",
		fhirid: 0

	}
	let _userMap = db.map.get("_userMap") !== undefined ? JSON.parse(db.map.get("_userMap")) : [];
	obj['userId'] = _userMap.length;
	_userMap.push(obj);
	await UpdateOrInsertData('_userMap', JSON.stringify(_userMap));
}

export async function UpdatePrivatekey(userid, privatekey) {
	let db = await getOutput();
	let _userMap = db.map.get("_userMap") !== undefined ? JSON.parse(db.map.get("_userMap")) : [];
	for (let i = 0; i < _userMap.length; i++) {
		const element = _userMap[i];
		if (userid === element.userId) {
			_userMap[i].privatekey = privatekey;
		}
	}
	await UpdateOrInsertData('_userMap', JSON.stringify(_userMap));

}

export async function UpdateAccessToken(userid, accesstoken) {
	let db = await getOutput();
	let _userMap = db.map.get("_userMap") !== undefined ? JSON.parse(db.map.get("_userMap")) : [];
	for (let i = 0; i < _userMap.length; i++) {
		const element = _userMap[i];
		if (userid === element.userId) {
			_userMap[i].accesstoken = accesstoken;
		}
	}
	await UpdateOrInsertData('_userMap', JSON.stringify(_userMap));

}

export async function CreateTrial(userId, image, title, description, permission, contributors, audience, budget) {
	let db = await getOutput();
	var obj = {
		trialId: 0,
		userId: userId,
		image: image,
		title: title,
		description: description,
		permission: permission,
		contributors: contributors,
		audience: audience,
		budget: budget,
		rewardType: "SOL",
		rewardPrice: 0,
		totalSpendingLimit: budget,
	}
	let _trialMap = db.map.get("_trialMap") !== undefined ? JSON.parse(db.map.get("_trialMap")) : [];
	obj['trialId'] = _trialMap.length;
	_trialMap.push(obj);
	await UpdateOrInsertData('_trialMap', JSON.stringify(_trialMap));
}
export async function CreateSurvey(trialId, userId, name, description, date, image, reward) {
	let db = await getOutput();
	var obj = {
		surveyId: 0,
		trialId: trialId,
		userId: userId,
		name: name,
		description: description,
		date: date,
		image: image,
		reward: reward,
		submission: 0,
	};
	let _surveyMap = db.map.get("_surveyMap") !== undefined ? JSON.parse(db.map.get("_surveyMap")) : [];
	obj['surveyId'] = _surveyMap.length;
	_surveyMap.push(obj);
	await UpdateOrInsertData('_surveyMap', JSON.stringify(_surveyMap));
}
export async function getCurrentStringSize(key, value) {

	let instruction_data = {
		"method": "UpdateOrInsert",
		"args": [key, value]
	}
	let buffer_instruction = Buffer.from(JSON.stringify(instruction_data), "utf-8");
	return buffer_instruction.length;


}
export function getSlicedData(totalSize, metadata) {
	let limit = 800;
	let currentPos = 0;
	let newStrArr = [];
	if (totalSize > limit) {
		for (let i = 0; totalSize > limit; i++) {
			newStrArr.push(metadata.slice(currentPos, (currentPos + limit)));
			totalSize -= limit;
			currentPos += limit;
		}
	}

	newStrArr.push(metadata.slice(currentPos, (currentPos + limit)));
	return newStrArr
}
export function getAllContainsMapKeys(mapData, keyname) {
	let allFoundKeys = [];
	let allkeys = Array.from(mapData.keys());
	for (let i = 0; i < allkeys.length; i++) {
		if (allkeys[i].includes(keyname)) {
			allFoundKeys.push(allkeys[i]);
		}
	}
	return allFoundKeys;
}
export async function CreateOrSaveSections(surveyId, metadata) {
	let db = await getOutput();
	let totalSize = await getCurrentStringSize("_sectionsMap", metadata);
	let metadatas = getSlicedData(totalSize, metadata);
	let oldMaps = getAllContainsMapKeys(db.map, "_sectionsMap");

	if (oldMaps.length >= metadatas.length) {
		for (let i = 0; i < oldMaps.length; i++) {
			const data = metadatas.length > i ? metadatas[i] : "-1";
			let mapName = `_sectionsMap[${surveyId}][${i}]`;
			await UpdateOrInsertData(mapName, data);
		}
	} else {
		for (let i = 0; i < metadatas.length; i++) {
			const data = metadatas[i];
			let mapName = `_sectionsMap[${surveyId}][${i}]`;
			await UpdateOrInsertData(mapName, data);
		}
	}
}
export async function CreateSurveyCategory(name, image) {
	let db = await getOutput();
	var obj = { category_id: 0, name: name, image: image };
	let _categoryMap = db.map.get("_categoryMap") !== undefined ? JSON.parse(db.map.get("_categoryMap")) : [];
	obj['category_id'] = _categoryMap.length;
	_categoryMap.push(obj);
	await UpdateOrInsertData('_categoryMap', JSON.stringify(_categoryMap));
}
export async function UpdateTrial(trialId, image, title, description, budget) {
	let db = await getOutput();
	let _trialMap = db.map.get("_trialMap") !== undefined ? JSON.parse(db.map.get("_trialMap")) : [];
	for (let i = 0; i < _trialMap.length; i++) {
		const element = _trialMap[i];
		if (trialId === element.trialId) {
			_trialMap[i].image = image;
			_trialMap[i].title = title;
			_trialMap[i].description = description;
			_trialMap[i].budget = budget;
		}
	}
	await UpdateOrInsertData('_trialMap', JSON.stringify(_trialMap));

}

export async function UpdateSurvey(surveyId, name, description, image, reward) {
	let db = await getOutput();
	let _surveyMap = db.map.get("_surveyMap") !== undefined ? JSON.parse(db.map.get("_surveyMap")) : [];
	for (let i = 0; i < _surveyMap.length; i++) {
		const element = _surveyMap[i];
		if (surveyId === element.surveyId) {
			_surveyMap[i].name = name;
			_surveyMap[i].description = description;
			_surveyMap[i].image = image;
			_surveyMap[i].reward = reward;
		}
	}
	await UpdateOrInsertData('_surveyMap', JSON.stringify(_surveyMap));

}

export async function UpdateReward(trialId, rewardType, rewardPrice, totalSpendingLimit) {
	let db = await getOutput();
	let _trialMap = db.map.get("_trialMap") !== undefined ? JSON.parse(db.map.get("_trialMap")) : [];
	for (let i = 0; i < _trialMap.length; i++) {
		const element = _trialMap[i];
		if (trialId === element.trialId) {
			_trialMap[i].rewardType = rewardType;
			_trialMap[i].rewardPrice = rewardPrice;
			_trialMap[i].totalSpendingLimit = totalSpendingLimit;
		}
	}
	await UpdateOrInsertData('_trialMap', JSON.stringify(_trialMap));

}

export async function UpdateAudience(trialId, audienceInfo) {
	let db = await getOutput();
	let _trialAudienceMap = db.map.get("_trialAudienceMap") !== undefined ? JSON.parse(db.map.get("_trialAudienceMap")) : [];
	let found = false;
	for (let i = 0; i < _trialAudienceMap.length; i++) {
		const element = _trialAudienceMap[i];
		if (trialId === element.trialId) {
			_trialAudienceMap[i].audienceInfo = audienceInfo;
			found = true;
		}
	}
	if (!found) {
		var obj = {
			trialId: trialId,
			audienceInfo: audienceInfo
		};
		_trialAudienceMap.push(obj);

	}
	await UpdateOrInsertData('_trialAudienceMap', JSON.stringify(_trialAudienceMap));

}

export async function UpdateUser(userId, image, credits) {
	let db = await getOutput();
	let _userMap = db.map.get("_userMap") !== undefined ? JSON.parse(db.map.get("_userMap")) : [];
	for (let i = 0; i < _userMap.length; i++) {
		const element = _userMap[i];
		if (userId === element.userId) {
			_userMap[i].image = image;
			_userMap[i].credits = credits;
		}
	}
	await UpdateOrInsertData('_userMap', JSON.stringify(_userMap));

}

export async function UpdateFhir(userId, familyName, givenName, identifier, phone, gender, about, patient_id) {
	let db = await getOutput();
	var obj = {
		fhir_id: 0,
		userId: userId,
		familyName: familyName,
		givenName: givenName,
		identifier: identifier,
		phone: phone,
		gender: gender,
		about: about,
		patient_id: patient_id,
	};
	let _fhirMap = db.map.get("_fhirMap") !== undefined ? JSON.parse(db.map.get("_fhirMap")) : [];
	let fhirid = _fhirMap.length;
	obj['fhir_id'] = fhirid;
	_fhirMap.push(obj);
	await UpdateOrInsertData('_fhirMap', JSON.stringify(_fhirMap));


	let _userMap = db.map.get("_userMap") !== undefined ? JSON.parse(db.map.get("_userMap")) : [];
	for (let i = 0; i < _userMap.length; i++) {
		const element = _userMap[i];
		if (userId === element.userId) {
			_userMap[i].fhirid = fhirid;
		}
	}
	await UpdateOrInsertData('_userMap', JSON.stringify(_userMap));

}

export async function CreateOngoingTrail(trialId, userId, date, given_permission) {
	let db = await getOutput();
	var obj = {
		ongoingId: 0,
		trialId: trialId,
		userId: userId,
		date: date,
		given_permission: given_permission,
	};
	let _ongoingMap = db.map.get("_ongoingMap") !== undefined ? JSON.parse(db.map.get("_ongoingMap")) : [];
	let ongoingId = _ongoingMap.length;
	obj['ongoingId'] = ongoingId;
	_ongoingMap.push(obj);
	await UpdateOrInsertData('_ongoingMap', JSON.stringify(_ongoingMap));



	let _trialMap = db.map.get("_trialMap") !== undefined ? JSON.parse(db.map.get("_trialMap")) : [];
	for (let i = 0; i < _trialMap.length; i++) {
		const element = _trialMap[i];
		if (userId === element.userId) {
			_trialMap[i].contributors += 1;
		}
	}
	await UpdateOrInsertData('_trialMap', JSON.stringify(_trialMap));


}
export async function CreateQuestionAnswer(trialId, userId, surveyId, sectionId, questionId, answer) {
	let db = await getOutput();
	var obj = {
		answer_id: 0,
		trialId: trialId,
		userId: userId,
		surveyId: surveyId,
		sectionId: sectionId,
		questionId: questionId,
		answer: answer,
	};
	let _questionanswerdMap = db.map.get("_questionanswerdMap") !== undefined ? JSON.parse(db.map.get("_questionanswerdMap")) : [];
	let answer_id = _questionanswerdMap.length;
	obj['answer_id'] = answer_id;
	_questionanswerdMap.push(obj);
	await UpdateOrInsertData('_questionanswerdMap', JSON.stringify(_questionanswerdMap));

}


export async function CreateCompletedSurveys(surveyId, userId, date, trialId) {
	let db = await getOutput();
	var obj = {
		completedSurveyId: 0,
		trialId: trialId,
		userId: userId,
		surveyId: surveyId,
		date: date.clone(),
	};
	let _completedsurveyMap = db.map.get("_completedsurveyMap") !== undefined ? JSON.parse(db.map.get("_completedsurveyMap")) : [];
	let completedSurveyId = _completedsurveyMap.length;
	obj['completedSurveyId'] = completedSurveyId;
	_completedsurveyMap.push(obj);
	await UpdateOrInsertData('_completedsurveyMap', JSON.stringify(_completedsurveyMap));



	let _surveyMap = db.map.get("_surveyMap") !== undefined ? JSON.parse(db.map.get("_surveyMap")) : [];
	for (let i = 0; i < _surveyMap.length; i++) {
		const element = _surveyMap[i];
		if (surveyId === element.surveyId) {
			_surveyMap[i].submission += 1;
			_surveyMap[i].date += date;
		}
	}
	await UpdateOrInsertData('_surveyMap', JSON.stringify(_surveyMap));


}

export function getArgs(args) {
	let NewargsList = [];
	for (let i = 0; i < args.length; i++) {
		if (typeof args[i] === "string") {
			NewargsList.push(`"${args[i]}"`);
		} else if (typeof args[i] === "number") {
			NewargsList.push(args[i]);
		}
	}
	return NewargsList;
}