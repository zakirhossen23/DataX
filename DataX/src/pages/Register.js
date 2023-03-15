import Cookies from 'js-cookie'
import logoicon from '../assets/datax-logo.svg'
import { useState, useEffect } from 'react'
import useContract from '../services/useContract'
import { useNavigate } from "react-router-dom";
import './Register.css'
function Register() {
    let navigate = useNavigate();
    const { api, contract, signerAddress, sendTransaction,  ReadContract   } = useContract();

    const [isBraveSolanaConnected, setisBraveSolanaConnected] = useState(false)

    function loginLink() {
        navigate("/login", { replace: true });
    }
    async function RegisterAcc(event) {

        event.preventDefault();
        var registerbutton = document.getElementById("registerBTN");
        var buttonTextBox = document.getElementById("buttonText");
        var LoadingICON = document.getElementById("LoadingICON");
        var SuccessNotification = document.getElementById("notification-success")
        var FailedNotification = document.getElementById("notification-error")
        buttonTextBox.style.display = "none";
        LoadingICON.style.display = "block";
        SuccessNotification.style.display = "none";
        FailedNotification.style.display = "none";
        registerbutton.disabled = true;
        var FullNameTXT = document.getElementById("name")
        var emailTXT = document.getElementById("email")
        var passwordTXT = document.getElementById("password")
        if (FullNameTXT.value === "" || emailTXT.value === "" || passwordTXT.value === "") {
            FailedNotification.style.display = "block";
            buttonTextBox.style.display = "block";
            LoadingICON.style.display = "none";
            return;
        }
        
        const result = await ReadContract(api, signerAddress, "CheckEmail", [emailTXT.value])
        
        try {
            if (result === "False") {
                await sendTransaction(api, signerAddress, "CreateAccount", [FullNameTXT.value, emailTXT.value, passwordTXT.value]);
                SuccessNotification.style.display = "block";
                window.location.href = "/login"

            } else {
                //Error
                LoadingICON.style.display = "none";
                buttonTextBox.style.display = "block";
                FailedNotification.innerText = "Email already registered!"
                FailedNotification.style.display = "block";
                registerbutton.disabled = false;
                return;
            } 

        } catch (error) {
            LoadingICON.style.display = "none";
            buttonTextBox.style.display = "block";
            FailedNotification.style.display = "none";
            FailedNotification.innerText = "Error! Please try again!"
        }

        registerbutton.disabled = false;
    }

    async function onClickConnect(type) {
        if (type === 1) {

            if (typeof window.braveSolana !== "undefined") {
                await window.braveSolana.connect();
                if (window.braveSolana.isConnected) {
                    window.localStorage.setItem("type", "BraveSolana");
                    setisBraveSolanaConnected(true);
                } else {
                    setisBraveSolanaConnected(false);
                }
            } else {
                window.open("https://chrome.google.com/webstore/detail/BraveSolana-wallet/bhhhlbepdkbapadjdnnojkbgioiodbic", "_about");
            }
        } else {
            window.localStorage.setItem("type", "non-BraveSolana")
            setisBraveSolanaConnected(true);
        }
    }
    useEffect(() => {
        async function check() {
            if (window.localStorage.getItem("type") === "BraveSolana") {
                try {
                    await window.braveSolana.connect();
                    setisBraveSolanaConnected(true);

                } catch (e) {
                    setisBraveSolanaConnected(false);
                }
                setisBraveSolanaConnected(true);
            } else {
                setisBraveSolanaConnected(false);
            }

        }

        check();
    }, [contract])
    return (
        <div className="min-h-screen grid-cols-2 flex">
            <div className="bg-blue-200 flex-1 img-panel">
                <img src={require('../assets/login-picture.png')} className="h-full  w-full" alt="DataX Logo" />
            </div>
            <div className="bg-white flex-1 flex flex-col justify-center items-center">
                <div className="pl-20 pr-20 container-panel">
                    <img src={logoicon} className="w-3/4 mx-auto" alt="DataX Logo" />
                    <h1 className="text-4xl font-semibold mt-10 text-center">Register your account</h1>
                    <div id='notification-success' style={{ display: 'none' }} className="mt-4 text-center bg-gray-200 relative text-gray-500 py-3 px-3 rounded-lg">
                        Success!
                    </div>
                    <div id='notification-error' style={{ display: 'none' }} className="mt-4 text-center bg-red-200 relative text-red-600 py-3 px-3 rounded-lg">
                        Error! Please try again!
                    </div>
                    <div className="mt-10">
                        <label className="flex flex-col font-semibold">
                            Full name
                            <input type="name" required id="name" name="name" className="mt-2 h-10 border border-gray-200 rounded-md outline-none px-2 focus:border-gray-400" />
                        </label>
                        <label className="flex flex-col font-semibold">
                            Email
                            <input type="email" required id="email" name="email" className="mt-2 h-10 border border-gray-200 rounded-md outline-none px-2 focus:border-gray-400" />
                        </label>
                        <label className="flex flex-col font-semibold mt-3">
                            Password
                            <input type="password" required id="password" name="password" className="mt-2 h-10 border border-gray-200 rounded-md outline-none px-2 focus:border-gray-400" />
                        </label>
                        <label className="flex flex-col font-semibold mt-3">
                            Repeat password
                            <input type='password' name="confirm-password" required className="mt-2 h-10 border border-gray-200 rounded-md outline-none px-2 focus:border-gray-400" />
                        </label>
                        {(isBraveSolanaConnected) ? (<>
                            <button id='registerBTN' onClick={RegisterAcc} className="bg-orange-500 text-white rounded-md shadow-md h-10 w-full mt-3 hover:bg-orange-600 transition-colors overflow:hidden flex content-center items-center justify-center cursor-pointer">
                                <i id='LoadingICON' style={{ display: "none" }} className="select-none block w-12 m-0 fa fa-circle-o-notch fa-spin"></i>
                                <span id='buttonText'>Register</span>
                            </button>

                        </>) : (<>
                            <button onClick={e => { onClickConnect(1) }} className="bg-orange-500 text-white rounded-md shadow-md h-10 w-full mt-3 hover:bg-orange-600 transition-colors overflow:hidden flex content-center items-center justify-center cursor-pointer">
                                <span id='buttonText'>Connect BraveSolana</span>
                            </button>

                        </>)}


                        <button onClick={loginLink} className="bg-gray-200 text-gray-500 rounded-md shadow-md h-10 w-full mt-3 hover:bg-black hover:text-white transition-colors">
                            Login
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Register;
