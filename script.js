'use strict';

const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2,
    pin: 1111,

    movementsDates: [
        '2019-11-18T21:31:17.178Z',
        '2019-12-23T07:42:02.383Z',
        '2020-01-28T09:15:04.904Z',
        '2020-04-01T10:17:24.185Z',
        '2020-05-08T14:11:59.604Z',
        '2023-01-14T17:01:17.194Z',
        '2023-01-16T22:36:17.929Z',
        '2023-01-17T12:02:00.000Z',
    ],
    currency: 'EUR',
    locale: 'pt-PT',
};

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        '2019-11-01T13:15:33.035Z',
        '2019-11-30T09:48:16.867Z',
        '2019-12-25T06:04:23.907Z',
        '2020-01-25T14:18:46.235Z',
        '2020-02-05T16:33:06.386Z',
        '2020-04-10T14:43:26.374Z',
        '2020-06-25T18:49:59.371Z',
        '2020-07-26T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
};

const accounts = [account1, account2];

const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');



// NICKNAMES
const nickName = function (accs) {
    accs.forEach(function (acc) {
        acc.userName = acc.owner.toLowerCase().split(" ").map(word => word.at(0)).join("");
    });
};
nickName(accounts);


// UPDATE_UI
const updateUI = function (acc) {
    displayMovements(acc);
    calcDisplayBalance(acc);
    calcDisplaySummary(acc);
};


// TIMER
let timer;
const startLogOutTimer = function () {
    let time = 300;
    const timer = setInterval(() => {
        time--;
        let hour = String(Math.trunc(time / 3600)).padStart(2, 0);
        let min = String(Math.trunc((time % 3600) / 60)).padStart(2, 0);
        let sec = String(time % 60).padStart(2, 0);
        labelTimer.textContent = `${hour}:${min}:${sec}`;
        if (time === 0) {
            clearInterval(timer);
            containerApp.style.opacity = 0;
            labelWelcome.textContent = `Log in to get started`;
        }
    }, 1000);
    return timer;
};


// FORMAT_CURRENCY
const formatCur = function (value, locale, currency) {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(value);
};


// FORMAT_MOVEMENTS_DATE
const formatMovementDate = function (date, locale) {
    const calcDaysPassed = (date1, date2) => Math.round(Math.abs((date1 - date2) / (1000 * 60 * 60 * 24)));
    const daysPassed = calcDaysPassed(new Date(), date);
    if (daysPassed === 0) return "Today";
    if (daysPassed === 1) return "Yesterday";
    if (daysPassed <= 7) return `${daysPassed} days ago`;
    return new Intl.DateTimeFormat(locale).format(date);
};


// DISPLAY_MOVEMENTS
const displayMovements = function (acc) {
    containerMovements.innerHTML = '';
    acc.movements.forEach(function (mov, i) {
        const date = new Date(currentAccount.movementsDates[i]);
        const displayDate = formatMovementDate(date, acc.locale);
        const type = mov >= 0 ? 'deposit' : 'withdrawal';
        const html = `
    <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${displayDate}</div>
    <div class="movements__value">${formatCur(mov, currentAccount.locale, currentAccount.currency)}</div>
    </div>
    `;
        containerMovements.insertAdjacentHTML('afterbegin', html);
    });
};


// CALC_DISPLAY_BALANCE
const calcDisplayBalance = function (acc) {
    acc.balance = acc.movements.reduce(function (acc, mov) {
        return acc + mov;
    }, 0);
    labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};


// CALC_DISPLAY_SUMMARY
const calcDisplaySummary = function (acc) {
    const incomes = acc.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
    const expenses = Math.abs(acc.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0));
    const interest = acc.movements.filter(mov => mov > 0).map(mov => (mov * acc.interestRate) / 100).filter(int => int > 1).reduce((acc, int) => acc + int, 0);
    const incomeWithInterest = incomes + interest;
    labelSumIn.textContent = formatCur(incomeWithInterest, acc.locale, acc.currency);
    labelSumOut.textContent = formatCur(expenses, acc.locale, acc.currency);
    labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};


// LOG_IN
let currentAccount;
btnLogin.addEventListener("click", function (e) {
    e.preventDefault();
    currentAccount = accounts.find(acc => acc.userName === inputLoginUsername.value);
    if (currentAccount?.pin === +inputLoginPin.value) {
        labelWelcome.textContent = `Hello, ${currentAccount.owner.split(" ").at(0)}. Nice to see you:)`;
        const options = {
            minute: "numeric",
            hour: "numeric",
            day: "numeric",
            month: "numeric",
            year: "numeric",
        };
        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(new Date());
        containerApp.style.opacity = 100;
        inputLoginUsername.value = inputLoginPin.value = "";
        inputCloseUsername.value = inputClosePin.value = "";
        labelTimer.textContent = "00:05:00";
        inputLoginPin.blur();
        if (timer) clearInterval(timer);
        timer = startLogOutTimer();
        updateUI(currentAccount);
    } else alert("Not valid data");
});


// TRANSFER
btnTransfer.addEventListener("click", function (e) {
    e.preventDefault();
    const amount = +inputTransferAmount.value;
    const receiverAcc = accounts.find(acc => acc.userName === inputTransferTo.value);
    inputTransferAmount.value = inputTransferTo.value = "";
    if (receiverAcc && amount > 0 && currentAccount.balance >= amount && receiverAcc?.userName !== currentAccount.userName) {
        currentAccount.movements.push(-amount);
        receiverAcc.movements.push(amount);
        currentAccount.movementsDates.push(new Date().toISOString());
        receiverAcc.movementsDates.push(new Date().toISOString());
        clearInterval(timer);
        timer = startLogOutTimer();
        updateUI(currentAccount);
    }
});


// CLOSE_ACCOUNT
btnClose.addEventListener("click", function (e) {
    e.preventDefault();
    if (currentAccount.userName === inputCloseUsername.value && currentAccount.pin === +inputClosePin.value) {
        const index = accounts.findIndex(acc => acc === currentAccount);
        accounts.splice(index, 1);
        containerApp.style.opacity = 0;
    }
    inputCloseUsername.value = inputClosePin.value = "";
    labelWelcome.textContent = `Log in to get started`;
});


// LOAN
btnLoan.addEventListener("click", function (e) {
    e.preventDefault();
    const amount = Math.floor(inputLoanAmount.value);
    if (amount > 0 && currentAccount.movements.some(mov => mov >= (amount * 10) / 100)) {
        setTimeout(() => {
            currentAccount.movements.push(amount);
            currentAccount.movementsDates.push(new Date().toISOString());
            clearInterval(timer);
            timer = startLogOutTimer();
            updateUI(currentAccount);
        }, 2500);
    }
    inputLoanAmount.value = "";
});


// SORT
let current = true;
btnSort.addEventListener("click", function () {
    const movsCopy = { movements: currentAccount.movements.slice() };
    if (current) {
        movsCopy.movements.sort((a, b) => a - b);
        displayMovements(movsCopy);
        current = false;
    } else {
        displayMovements(currentAccount);
        current = true;
    }
});