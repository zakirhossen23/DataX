import {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {ArrowRightIcon, UserIcon, CurrencyDollarIcon, GlobeAltIcon, ChevronRightIcon, PlusSmIcon, TrashIcon, PencilIcon} from "@heroicons/react/solid";
import {formatDistance} from "date-fns";
import Form from "react-bootstrap/Form";
import useContract from "../services/useContract";
import "./TrialDetails.css";
import CreateSurveyModal from "../components/modal/CrateSurvey";

import UpdateTrialModal from "../components/modal/UpdateTrial";
import ViewControbutiors from "../components/modal/ViewControbutiors";

function TrialDetails() {
	const params = useParams();
	const navigate = useNavigate();
	const [tabIndex, setTabIndex] = useState(0);
	const [UpdatemodalShow, setModalShow] = useState(false);
	const [CreateSurveymodalShow, setSurveyModalShow] = useState(false);
	const [ContributorsmodalShow, setContributorsmodalShow] = useState(false);
	const [LoadingSurvey, setLoadingSurvey] = useState(false);
	const [SelectedContributorId, setSelectedContributorId] = useState(0);
	const [Selected_ongoing_id, setSelected_ongoing_id] = useState(0);
	const [LoadingContributors, setLoadingContributorsy] = useState(false);
	const {api, contract, signerAddress, sendTransaction,  ReadContract,  } = useContract();
	const [screenSize, getDimension] = useState({
		dynamicWidth: window.innerWidth,
		dynamicHeight: window.innerHeight
	});

	const [audiences, setAudiences] = useState([
		{
			id: "a",
			AgeMin: "35",
			AgeMax: "40",
			Race: "asian",
			Gender: "male"
		}
	]);

	const [data, setData] = useState([]);
	const [contributors, setContributors] = useState([]);

	const [TRIAL_DATA, setTRIAL_DATA] = useState({});

	const TABS = [
		{
			id: "surveys",
			title: "Surveys"
		},
		{
			id: "contributors",
			title: "Contributors"
		},
		{
			id: "settings",
			title: "Settings"
		}
	];

	const TABLE_COLS = [
		{
			id: "name",
			title: "Name"
		},
		{
			id: "question",
			title: "Question"
		},
		{
			id: "reward",
			title: "Reward"
		},
		{
			id: "submission",
			title: "Submission"
		},
		{
			id: "last submission",
			title: "Last submission"
		}
	];

	const CONTRIBUTORs_COLS = [
		{
			id: "name",
			title: "Name"
		},
		{
			id: "identifier",
			title: "Identifier"
		},
		{
			id: "patient_id",
			title: "Patient Id"
		},
		{
			id: "joined",
			title: "Joined"
		},
		{
			id: "details",
			title: "Details"
		}
	];

	const AUDIENCES_COLS = [
		{
			id: "age_minimum",
			title: "Age minimum"
		},
		{
			id: "age_maximum",
			title: "Age maximum"
		},
		{
			id: "race",
			title: "Race"
		},
		{
			id: "gender",
			title: "Gender"
		}
	];
	function sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
	const addSurvey = () => {
		setSurveyModalShow(true);
	};
	const ShowContributors = (user_id, ongoing_id) => {
		setSelectedContributorId(user_id);
		setSelected_ongoing_id(ongoing_id);
		setContributorsmodalShow(true);
	};
	const addAudiance = async () => {
		setAudiences((prevState) => [
			...prevState,
			{
				id: 0,
				ageMin: "",
				ageMax: "",
				race: "",
				gender: ""
			}
		]);
	};
	async function UpdateAudiences(event) {
		var audienceSave = document.getElementById("audienceSave");
		audienceSave.classList.remove("hover:bg-gray-600");
		audienceSave.classList.remove("bg-black");
		audienceSave.classList.add("bg-gray-400");
		audienceSave.classList.add("cursor-default");

		event.target.disabled = true;
		const createdObject = [];
		await audiences.forEach(async (element) => {
			createdObject.push({
				id: parseInt(element.id),
				AgeMin: Number(element.AgeMin),
				AgeMax: Number(element.AgeMax),
				Race: element.Race,
				Gender: element.Gender
			});
		});

		await sendTransaction(api, signerAddress, "UpdateAudience", [parseInt(params.id), JSON.stringify(createdObject)]);
		event.target.disabled = false;
		audienceSave.classList.add("hover:bg-gray-600");
		audienceSave.classList.add("bg-black");
		audienceSave.classList.remove("bg-gray-400");
		audienceSave.classList.remove("cursor-default");
	}
	async function UpdateRewarads(event) {
		event.preventDefault();
		const {rewardselect, rewardprice, totalspendlimit} = event.target;

		var rewardsSave = document.getElementById("rewardsSave");
		rewardsSave.classList.remove("hover:bg-gray-600");
		rewardsSave.classList.remove("bg-black");
		rewardsSave.classList.add("bg-gray-400");
		rewardsSave.classList.add("cursor-default");

		rewardsSave.disabled = true;
		try {
			await sendTransaction(api, signerAddress, "UpdateReward", [Number(parseInt(params.id)), rewardselect.value, Number(rewardprice.value), parseInt(totalspendlimit.value)]);
		} catch (error) {}

		rewardsSave.disabled = false;
		rewardsSave.classList.add("hover:bg-gray-600");
		rewardsSave.classList.add("bg-black");
		rewardsSave.classList.remove("bg-gray-400");
		rewardsSave.classList.remove("cursor-default");
	}

	async function removeElementFromArray(all, specific, seting) {
		seting([]);
		var done = new Promise(async (resolve, reject) => {
			const textDelete = `DeleteAudience?idTXT=${parseInt(all[specific].id)}`;
			await fetch(`https://cors-anyhere.herokuapp.com/https://wavedata.i.tgcloud.io:14240/restpp/query/WaveData/${textDelete}`, {
				"headers": {
					"accept-language": "en-US,en;q=0.9",
					"Authorization": "Bearer h6t28nnpr3e58pdm1c1miiei4kdcejuv"
				},
				"body": null,
				"method": "GET"
			}).then((e) => {
				resolve(e.json);
			});
		});
		await done;
		var storing = [];
		for (let index = 0; index < all.length; index++) {
			const element = all[index];
			if (index === specific) {
				continue;
			}
			storing.push(element);
		}

		seting(storing);

		console.log("done");
	}
	async function LoadData() {
		if (contract !== null) {
			setTRIAL_DATA({});
			let trial_element = await ReadContract(api, signerAddress, "_trialMap", [Number(params.id)]);

			let allAudiences = [];
			try {
				allAudiences = JSON.parse((await ReadContract(api, signerAddress,"_trialAudienceMap", [Number(params.id)])).audienceInfo);
			} catch (e) {
				allAudiences = [];
			}
			var newTrial = {
				id: Number(trial_element.trialId),
				title: trial_element.title,
				image: trial_element.image,
				description: trial_element.description,
				contributors: Number(trial_element.contributors),
				audience: Number(allAudiences.length),
				budget: Number(trial_element.budget),
				reward_type: trial_element.rewardType,
				reward_price: Number(trial_element.rewardPrice),
				total_spending_limit: Number(trial_element.totalSpendingLimit)
			};
			setTRIAL_DATA(newTrial);
		}
	}
	async function LoadDataSurvey() {
		if (contract !== null) {
			if (!LoadingSurvey) {
				setLoadingSurvey(true);
				setData([]);

				const totalSurveys = await ReadContract(api, signerAddress, "_SurveyIds");

				try {
					for (let i = 0; i < Number(totalSurveys); i++) {
						let survey_element = await ReadContract(api, signerAddress, "_surveyMap", [i]);

						var new_survey = {
							id: Number(survey_element.surveyId),
							trial_id: Number(survey_element.trialId),
							user_id: Number(survey_element.userId),
							name: survey_element.name,
							description: survey_element.description,
							date: survey_element.date,
							image: survey_element.image,
							reward: Number(survey_element.reward),
							submission: Number(survey_element?.submission)
						};
						if (parseInt(params.id) === new_survey.trial_id) setData((prevState) => [...prevState, new_survey]);
					}
				} catch (ex) {}

				setLoadingSurvey(false);
			}
		}
	}

	async function LoadAudiences() {
		if (contract !== null) {
			setAudiences([]);
			let allAudiences = JSON.parse((await ReadContract(api, signerAddress,"_trialAudienceMap", [parseInt(params.id)])).audienceInfo);
			setAudiences(allAudiences);
		}
	}
	async function LoadDataContributors() {
		setLoadingContributorsy(true);
		setContributors([]);

		const totalOngoing = await ReadContract(api, signerAddress,"_OngoingIds");

		for (let i = 0; i < Number(totalOngoing); i++) {
			let element = await ReadContract(api, signerAddress, "_ongoingMap", [parseInt(i)]);
			let user_element = await ReadContract(api, signerAddress, "getUserDetails", [Number(element.userId)]);
			let fhir_element = JSON.parse( await ReadContract(api, signerAddress,"_fhirMap", [Number(element.userId)]));

			if (Number(element.trialId) === parseInt(params.id)) {
				setContributors((prevState) => [
					...prevState,
					{
						id: i,
						user_id: Number(element.userId),
						name: user_element.name,
						family_name: fhir_element.familyName,
						givenname: fhir_element.givenName,
						identifier: fhir_element.identifier,
						phone: fhir_element.phone,
						gender: fhir_element.gender,
						about: fhir_element.about,
						patient_id: fhir_element.patientId,
						joined: element.date
					}
				]);
			}
		}
		setLoadingContributorsy(false);
	}

	async function deleteTrial() {
		await sendTransaction(contract.delete_a_trial(Number(parseInt(params.id))));

		navigate("/trials", {replace: true});
	}

	useEffect(async () => {
		const setDimension = () => {
			getDimension({
				dynamicWidth: window.innerWidth,
				dynamicHeight: window.innerHeight
			});
		};

		window.addEventListener("resize", setDimension);
		LoadData();
		LoadDataSurvey();
	}, [contract]);

	useEffect(async () => {
		if (tabIndex === 0) {
			LoadDataSurvey();
		} else if (tabIndex === 2) {
			LoadData();

			LoadAudiences();
		} else {
			LoadDataContributors();
		}
	}, [tabIndex]);
	return (
		<>
			<div style={{zoom: screenSize.dynamicWidth < 760 ? 0.8 : 1}} className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex mb-2 items-center">
				<div onClick={() => navigate(-1)} className="flex items-center hover:cursor-pointer hover:underline decoration-gray-400">
					<p className="text-gray-400">Trials</p>
					<ChevronRightIcon className="mx-1 w-5 h-5 text-gray-400" />
				</div>
				<div className="flex items-center">
					<p className="text-gray-400">{TRIAL_DATA?.title}</p>
				</div>
			</div>
			<div className={`bg-white border border-gray-400 rounded-lg overflow-hidden mb-2`}>
				{screenSize.dynamicWidth < 760 ? (
					<>
						<div className="container-Trial-Template">
							<div className="Title-Template">
								{" "}
								<p className="font-semibold">{TRIAL_DATA?.title}</p>
							</div>
							<div className="description-Template">
								{" "}
								<p className="mt-6">{TRIAL_DATA?.description}</p>
							</div>
							<div className="Image-Box">
								<img src={TRIAL_DATA?.image} alt="Trial" style={{width: "8rem"}} className="object-cover" />
							</div>
							<div className="Next-Button">
								<button
									onClick={() => {
										setModalShow(true);
									}}
									className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center"
								>
									<PencilIcon className="w-5 h-5 text-gray-400" />
								</button>
							</div>
						</div>
					</>
				) : (
					<>
						<div className="flex p-6">
							<img src={TRIAL_DATA?.image} alt="Trial" className="object-cover max-w-xs" />
							<div className="mx-8 flex-1">
								<p className="text-3xl font-semibold">{TRIAL_DATA?.title}</p>
								<p className="mt-6">{TRIAL_DATA?.description}</p>
							</div>
							<button
								onClick={() => {
									setModalShow(true);
								}}
								className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center"
							>
								<PencilIcon className="w-5 h-5 text-gray-400" />
							</button>
						</div>
					</>
				)}

				<div className="flex p-6 border-t border-t-gray-400 bg-gray-200">
					<div className="flex items-center">
						<UserIcon className="w-5 h-5 text-gray-500" />
						{screenSize.dynamicWidth > 760 ? (
							<>
								<p className="text-gray-500 font-semibold ml-1">{`${TRIAL_DATA?.contributors} contributor(s)`}</p>
							</>
						) : (
							<>
								<p className="text-gray-500 font-semibold ml-1">{`${TRIAL_DATA?.contributors}`}</p>
							</>
						)}
					</div>
					<div className="flex items-center ml-6">
						<GlobeAltIcon className="w-5 h-5 text-gray-500" />
						{screenSize.dynamicWidth > 760 ? (
							<>
								<p className="text-gray-500 font-semibold ml-1">{`${TRIAL_DATA?.audience} audience(s)`}</p>
							</>
						) : (
							<>
								<p className="text-gray-500 font-semibold ml-1">{`${TRIAL_DATA?.audience}`}</p>
							</>
						)}
					</div>
					<div className="flex items-center ml-6">
						<CurrencyDollarIcon className="w-5 h-5 text-gray-500" />
						{screenSize.dynamicWidth > 760 ? (
							<>
								<p className="text-gray-500 font-semibold ml-1">{`Budget of ${TRIAL_DATA?.budget} ${TRIAL_DATA?.reward_type}`}</p>
							</>
						) : (
							<>
								<p className="text-gray-500 font-semibold ml-1">{`${TRIAL_DATA?.budget} ${TRIAL_DATA?.reward_type}`}</p>
							</>
						)}
					</div>
				</div>
			</div>
			<div className="bg-white border border-gray-400 rounded-lg flex mt-4">
				{TABS.map(({id, title}, index) => {
					const IS_LAST = index === TABS.length - 1;
					const ACTIVE = index === tabIndex;

					return (
						<div key={index}>
							<div className="self-stretch w-[1px] bg-gray-400" />
							<button key={id} onClick={() => setTabIndex(index)} className={`flex items-center h-14 p-4 ${ACTIVE ? "bg-gray-100" : "bg-white"}`}>
								<p className={`${ACTIVE ? "text-orange-500" : "text-black"} font-medium`}>{title}</p>
							</button>
							{IS_LAST && <div className="self-stretch w-[1px] bg-gray-400" />}
						</div>
					);
				})}
			</div>
			{tabIndex === 0 && (
				<div className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
					<div className="flex items-center">
						<h2 className="text-2xl font-semibold flex-1">Surveys</h2>
						<button onClick={addSurvey} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center">
							<PlusSmIcon className="w-5 h-5 text-white" />
							<p className="text-white ml-2">Survey</p>
						</button>
					</div>
					<table className="table-responsive-xl">
						<thead className="border-b border-b-gray-400">
							<tr>
								{TABLE_COLS.map(({id, title}) => {
									return (
										<th key={id} className="text-left font-normal py-3 px-3">
											{title}
										</th>
									);
								})}
								<th className="py-3 px-3" />
							</tr>
						</thead>
						<tbody>
							{data.length !== 0 ? (
								<>
									{data.map(({id, name, description, reward, submission, date, image}, index) => {
										const IS_LAST = index === data.length - 1;
										return (
											<tr key={id} className={`border-b-gray-400 ${!IS_LAST ? "border-b" : "border-0"}`}>
												<td className="py-3 px-3">
													<div style={{display: "flex", alignItems: "center", flexDirection: "column", zoom: "0.8", minWidth: "9rem"}}>
														<img src={image} style={{width: 50, height: 50, borderRadius: 5}} />
														<span style={{paddingLeft: 15}}>{name.slice(0, 15)}</span>
													</div>
												</td>
												<td className="py-3 px-3" style={{minWidth: "20rem"}}>
													{description.slice(0, 100)}...
												</td>
												<td className="py-3 px-3" style={{minWidth: "8rem"}}>{`${reward} ${TRIAL_DATA?.reward_type}`}</td>
												<td className="py-3 px-3">{`${Number(submission)}/24`}</td>
												<td className="py-3 px-3">{date && !isNaN(new Date(date).getTime()) ? formatDistance(new Date(date), new Date(), {addSuffix: true}) : "-"}</td>
												<td className="flex justify-end py-3">
													<button
														onClick={() => navigate(`/trials/${TRIAL_DATA.id}/survey/${id}`, {state: {trialID: TRIAL_DATA.id}})}
														className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center hover:bg-white"
													>
														<ArrowRightIcon className="w-5 h-5 text-gray-400 " />
													</button>
												</td>
											</tr>
										);
									})}
								</>
							) : screenSize.dynamicWidth > 760 ? (
								LoadingSurvey === true ? (
									<tr>
										<td colSpan={6}>
											<p className="alert alert-info font-semibold text-3xl text-center">Loading...</p>
										</td>
									</tr>
								) : (
									<tr>
										{" "}
										<td colSpan={6}>
											<p className="alert alert-info font-semibold text-3xl text-center">No Surveys</p>
										</td>
									</tr>
								)
							) : (
								<></>
							)}
						</tbody>
					</table>
					{screenSize.dynamicWidth < 760 && data.length === 0 ? LoadingSurvey === true ? <p className="alert-info font-semibold text-center">Loading...</p> : <p className="alert-info font-semibold text-center">No Surveys</p> : <></>}
				</div>
			)}
			{tabIndex === 1 && (
				<>
					{" "}
					<div className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
						<div className="flex items-center">
							<h2 className="text-2xl font-semibold flex-1">Contributors</h2>
						</div>
						<table className="table-responsive-xl">
							<thead className="border-b border-b-gray-400">
								<tr>
									{CONTRIBUTORs_COLS.map(({id, title}) => {
										return (
											<th key={id} className="text-left font-normal py-3 px-3">
												{title}
											</th>
										);
									})}
								</tr>
							</thead>
							<tbody>
								{contributors.length !== 0 ? (
									<>
										{contributors.map(({id, user_id, name, identifier, patient_id, joined}, index) => {
											const IS_LAST = index === data.length - 1;
											return (
												<tr key={id} className={`border-b-gray-400 ${!IS_LAST ? "border-b" : "border-0"}`}>
													<td key={id} className="py-3 px-3">
														<div style={{display: "flex", alignItems: "center"}}>
															<div style={{padding: "13px", background: "#f3f4f6", borderRadius: "4px"}}>
																<UserIcon className="w-5 h-5 text-gray-700" />
															</div>
															<span style={{paddingLeft: 15}}>{name}</span>
														</div>
													</td>
													<td className="py-3 px-3">{`${identifier}`}</td>
													<td className="py-3 px-3">{`${patient_id}`}</td>
													<td className="py-3 px-3">{joined ? formatDistance(new Date(joined), new Date(), {addSuffix: true}) : "-"}</td>
													<td className="py-3 px-3">
														<button
															onClick={() => {
																ShowContributors(user_id, id);
															}}
															type="button"
															className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-600"
														>
															<p className="text-white ml-1">View</p>
														</button>
													</td>
												</tr>
											);
										})}
									</>
								) : screenSize.dynamicWidth > 760 ? (
									LoadingContributors === true ? (
										<tr>
											<td colSpan={6}>
												<p className="alert alert-info font-semibold text-3xl text-center">Loading...</p>
											</td>
										</tr>
									) : (
										<tr>
											<td colSpan={6}>
												<p className="alert alert-info font-semibold text-3xl text-center">No Contributors</p>
											</td>
										</tr>
									)
								) : (
									<></>
								)}
							</tbody>
						</table>
					</div>
				</>
			)}
			{tabIndex === 2 && (
				<>
					<Form onSubmit={UpdateRewarads} className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
						<div className="flex flex-col">
							<h2 className="text-2xl font-semibold flex-1">Reward</h2>
							<div>
								<h4>Reward per survey</h4>
								<div className="flex gap-8 items-center ">
									<select name="rewardselect" defaultValue={TRIAL_DATA?.reward_type ? TRIAL_DATA?.reward_type : ""} id="rewardselect" className="mt-1 h-10 px-2 rounded-md border border-gray-200 outline-none w-6/12">
										<option value="">Select a reward</option>
										<option value="SOL">SOL</option>
									</select>
									<label className="flex flex-col font-semibold mt-1 w-6/12">
										<input
											type="text"
											defaultValue={TRIAL_DATA?.reward_price ? `${TRIAL_DATA?.reward_price}` : "0"}
											id="rewardprice"
											name="rewardprice"
											className="mt-1 h-10 border border-gray-200 rounded-md outline-none px-2 focus:border-gray-400 "
											placeholder="0"
										/>
									</label>
								</div>
							</div>
							<div>
								<h4>Total spending limit</h4>
								<div className="flex gap-8 justify-between items-center ">
									<label style={{width: "47%"}} className="flex flex-col font-semibold mt-1">
										<input
											type="text"
											defaultValue={TRIAL_DATA?.total_spending_limit ? `${TRIAL_DATA?.total_spending_limit}` : "0"}
											id="totalspendlimit"
											name="totalspendlimit"
											className="mt-1 h-10 border border-gray-200 rounded-md outline-none px-2 focus:border-gray-400 "
											placeholder="0"
										/>
									</label>
									<button type="submit" id="rewardsSave" className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-600">
										<p className="text-white ml-1">Save</p>
									</button>
								</div>
							</div>
						</div>
					</Form>
					<div className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
						<div className="flex items-center">
							<h2 className="text-2xl font-semibold flex-1">Audiences</h2>
							<button onClick={() => addAudiance()} className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-600">
								<PlusSmIcon className="w-5 h-5 text-white" />
								<p className="text-white ml-2">Audience</p>
							</button>
						</div>
						<table className="table-responsive-xl">
							<thead className="border-b border-b-gray-400">
								<tr>
									<th className="py-3 px-3">#</th>
									{AUDIENCES_COLS.map(({id, title}) => {
										return (
											<th key={id} className="text-left font-normal py-3 px-3">
												{title}
											</th>
										);
									})}
									<th className="py-3 px-3" />
								</tr>
							</thead>
							<tbody>
								{audiences.map((item, index) => {
									const IS_LAST = index === audiences.length - 1;
									return (
										<tr key={index} className={`border-b-gray-400 ${!IS_LAST ? "border-b" : "border-0"}`}>
											<td className="flex py-3 px-3 items-center h-[72.5px]">{index + 1}</td>
											<td className="py-3 px-3">
												<input
													type="text"
													style={{width: screenSize.dynamicWidth < 760 ? "7rem" : "100%"}}
													id="age-min"
													onChange={(e) => {
														audiences[index].AgeMin = e.target.value;
													}}
													name="age-min"
													defaultValue={item.AgeMin}
													className="mt-2 h-10 border border-gray-200 rounded-md outline-none px-2 focus:border-gray-400"
												/>
											</td>
											<td className="py-3 px-3">
												<input
													type="text"
													style={{width: screenSize.dynamicWidth < 760 ? "7rem" : "100%"}}
													id="age-max"
													name="age-max"
													onChange={(e) => {
														audiences[index].AgeMax = e.target.value;
													}}
													defaultValue={item.AgeMax}
													className="mt-2 h-10 border border-gray-200 rounded-md outline-none px-2 focus:border-gray-400"
												/>
											</td>
											<td className="py-3 px-3" style={{minWidth: "10rem"}}>
												<select
													name={`race${index}`}
													id={`race-select${index}`}
													onChange={(e) => {
														audiences[index].Race = e.target.value;
													}}
													className="h-10 px-1 rounded-md border border-gray-200 outline-none w-full"
													defaultValue={item.Race}
												>
													<option value="">Select a race</option>
													<option value="asian">Asian</option>
													<option value="asian">African America</option>
													<option value="american-indian">American Indian</option>
													<option value="black">Black</option>
													<option value="hispanic">Hispanic</option>
													<option value="native-hawaiian">Native Hawaiian</option>
													<option value="white">White</option>
												</select>
											</td>
											<td className="py-3 px-3" style={{minWidth: "10rem"}}>
												<select
													name={`gender${index}`}
													id={`gender-select${index}`}
													onChange={(e) => {
														audiences[index].Gender = e.target.value;
													}}
													className="h-10 px-1 rounded-md border border-gray-200 outline-none w-full"
													defaultValue={item.Gender}
												>
													<option value="">Select a gender</option>
													<option value="male">Male</option>
													<option value="female">Female</option>
													<option value="everyone">Everyone</option>
												</select>
											</td>
											<td className="flex justify-end items-center h-[72.5px] py-3">
												<button
													onClick={(e) => {
														removeElementFromArray(audiences, index, setAudiences);
													}}
													className="flex w-[52px] h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center hover:bg-white"
												>
													<TrashIcon className="w-5 h-5 text-gray-400" />
												</button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
						<div className="flex mt-1 items-center">
							<h2 className="text-2xl font-semibold flex-1"></h2>
							<button id="audienceSave" className="h-10 rounded-md shadow-md bg-black text-white flex py-2 px-4 items-center hover:bg-gray-600" onClick={UpdateAudiences}>
								<p className="text-white ml-1">Save</p>
							</button>
						</div>
					</div>
					<div className="bg-white border border-gray-400 rounded-lg py-4 px-6 flex flex-col mt-4">
						<h2 className="text-2xl font-semibold mb-4">Delete</h2>
						<p>Deleting the trial will delete all surveys and the collected data. Contributors will no longer be able to take any of the surveys.</p>
						<button className="mt-4 flex self-start px-2 h-10 border border-gray-400 bg-gray-200 rounded-md justify-center items-center text-gray-400 hover:bg-white hover:text-red-700" onClick={deleteTrial}>
							<TrashIcon className="w-5 h-5 mr-2" />
							Delete
						</button>
					</div>
				</>
			)}
			<UpdateTrialModal
				show={UpdatemodalShow}
				onHide={() => {
					setModalShow(false);
					LoadData();
				}}
				id={params.id}
			/>
			<CreateSurveyModal
				show={CreateSurveymodalShow}
				onHide={() => {
					setSurveyModalShow(false);
					LoadDataSurvey();
				}}
				Tiralid={params.id}
			/>
			<ViewControbutiors
				show={ContributorsmodalShow}
				onHide={() => {
					setContributorsmodalShow(false);
				}}
				setShow={setContributorsmodalShow}
				id={Selected_ongoing_id}
			/>
		</>
	);
}

export default TrialDetails;

