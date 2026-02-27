function formatNumberInput(inputElement) {
  if (!inputElement) {
    return;
  }

  inputElement.addEventListener('input', function () {
    const value = this.value.replace(/,/g, '');
    if (!isNaN(value) && value !== '') {
      this.value = Number(value).toLocaleString('en-US');
    }
  });
}

// When you need to use the principal value in calculations, strip the commas:
function getCleanValue(value) {
  return +value.toString().replace(/,/g, '');
}

function isNum(x) {
  x = getCleanValue(x);
  const filter = /(^\d+\.?$)|(^\d*\.\d+$)/;
  if (filter.test(x)) {
    return true;
  }
  return false;
}

function principalArr(p, pmt, N, r, additionalPMT) {
  if (isNaN(additionalPMT)) {
    additionalPMT = 0;
  }
  let principalEndingValue = [];
  let principalPortionArr = [];
  let interestPortionArr = [];
  let paymentsArr = [];
  for (let i = 0; i < N; i++) {
    let interestPortion = p * r;
    let princiapPortion = pmt - interestPortion;
    p = p - princiapPortion - additionalPMT;
    if (p >= -1) {
      principalEndingValue.push(Math.round(p * 100) / 100);
      principalPortionArr.push(Math.round(princiapPortion * 100) / 100);
      interestPortionArr.push(Math.round(interestPortion * 100) / 100);
      paymentsArr.push(pmt);
    }
  }
  return { principalEndingValue, principalPortionArr, interestPortionArr, paymentsArr };
}

function getAlertElement(fieldId) {
  return document.getElementById(`${fieldId}Alert`);
}

function setAlert(fieldId, message) {
  const alertElement = getAlertElement(fieldId);
  if (alertElement) {
    alertElement.innerHTML = message;
  }
}

function clearAlerts(fieldIds) {
  fieldIds.forEach((fieldId) => setAlert(fieldId, ''));
}

function validateNumberField(fieldId, value) {
  if (!isNum(value)) {
    setAlert(fieldId, 'Need to enter a number.');
    const input = document.getElementById(fieldId);
    if (input) {
      input.focus();
    }
    return false;
  }
  setAlert(fieldId, '');
  return true;
}

function cost() {
  const form = document.getElementById('mortgageForm');
  if (!form) {
    return;
  }

  let homeValue = getCleanValue(form.homeValue.value);
  let principal = getCleanValue(form.principal.value);
  let interest = form.interest.value;
  let insuranceCost = getCleanValue(form.insuranceCost.value);
  let taxRate = form.taxRate.value;
  let years = form.years.value;
  let assessedValue = getCleanValue(form.assessedValue.value);

  if (!isNum(assessedValue)) {
    assessedValue = homeValue;
  }

  if (!isNum(insuranceCost) || insuranceCost <= 0) {
    insuranceCost = homeValue * 0.005;
  }

  let taxes = (assessedValue * taxRate) / 1200;
  let cost = document.getElementById('cost');

  if (!validateNumberField('principal', principal)) {
    return false;
  }
  if (!validateNumberField('interest', interest)) {
    return false;
  }
  if (!validateNumberField('years', years)) {
    return false;
  }

  clearAlerts(['principal', 'interest', 'years']);

  let p = principal;
  let r = interest / 1200;
  let N = years * 12;
  let monthlyInsuranceCost = insuranceCost / 12;
  let pmt = (p * (r * Math.pow(1 + r, N))) / (Math.pow(1 + r, N) - 1);
  let currency = new Intl.NumberFormat('US', { style: 'currency', currency: 'USD' });
  let totalPMT = pmt + taxes + monthlyInsuranceCost;

  cost.innerHTML = `
  <div class="text-right text-purple-700">Monthly Cost</div>
  <div></div>
  <div class="text-right">Mortgage</div>
  <div class='text-right'>${currency.format(pmt)}</div>
  <div id="currentBal" class="text-right">Taxes: </div>
  <div class='text-right'>${currency.format(taxes)}</div>
  <div id="currentBal" class="text-right">Insurance: </div>
  <div class='text-right'>${currency.format(monthlyInsuranceCost)}</div>
  <div><hr /></div><div><hr /></div>
  <div id="totalPMT" class='text-right text-purple-700'>Total Payments:</div>
  <div class='text-right text-purple-700'>${currency.format(totalPMT)}</div>
  <div></div>
  `;
}

function calculate() {
  const form = document.getElementById('mortgageForm');
  if (!form) {
    return;
  }

  let principal = getCleanValue(form.principal.value);
  let interest = form.interest.value;
  let years = form.years.value;
  let additionalPMT = form.additionalPMT.value;
  let currentMonth = form.currentMonth.value;
  let currentHomeValue = getCleanValue(form.currentHomeValue.value);
  let result = document.getElementById('result');

  if (!validateNumberField('principal', principal)) {
    return false;
  }
  if (!validateNumberField('interest', interest)) {
    return false;
  }
  if (!validateNumberField('years', years)) {
    return false;
  }

  let endingValueSelector = 0;
  let principalCurrentBalance = principal;
  let principalOriginialCurrentBalance = principal;

  clearAlerts(['principal', 'interest', 'years']);

  let p = principal;
  let r = interest / 1200;
  let N = years * 12;
  let pmt = (p * (r * Math.pow(1 + r, N))) / (Math.pow(1 + r, N) - 1);
  let payment = pmt + +additionalPMT;
  let currency = new Intl.NumberFormat('US', { style: 'currency', currency: 'USD' });
  let valueArrays = principalArr(p, payment, N, r, additionalPMT);
  let originalValueArrays = principalArr(p, pmt, N, r, 0);
  let monthsLeftWithAdditionalPMT = valueArrays.principalEndingValue.length - currentMonth;
  let monthsLeftOriginal = N - currentMonth;
  let totalPMT = payment * valueArrays.principalEndingValue.length;
  let totalPMTOriginal = pmt * N;
  let totalAdditionalPMT = +additionalPMT * currentMonth;
  let savings = pmt * N - payment * valueArrays.principalEndingValue.length;
  if (currentMonth > 0) {
    endingValueSelector = currentMonth - 1;
    principalCurrentBalance = valueArrays.principalEndingValue[endingValueSelector];
    principalOriginialCurrentBalance = originalValueArrays.principalEndingValue[endingValueSelector];
  }
  let capitalWithAdditionalPMT = 0;
  let capitalOriginal = 0;
  if (currentHomeValue > 0) {
    capitalWithAdditionalPMT = currentHomeValue - principalCurrentBalance;
    capitalOriginal = currentHomeValue - principalOriginialCurrentBalance;
  }

  result.innerHTML = `
  <div></div>
  <div class="text-right text-purple-700">Original</div>
  <div class="text-right text-purple-700">Additional Payments</div>
  <div id="pmt">Monthly Payments</div>
  <div class='text-right'>${currency.format(pmt)}</div>
  <div class='text-right'>${currency.format(payment)}</div>
  <div id="currentBal">Current Balance: </div>
  <div class='text-right'>${currency.format(principalOriginialCurrentBalance)}</div>
  <div class='text-right'>${currency.format(principalCurrentBalance)}
  </div>
  <div id="monthsLeft">Months Left:</div>
  <div class='text-right'>${monthsLeftOriginal}</div>
  <div class='text-right'>${monthsLeftWithAdditionalPMT}</div>
  <div id="totalPMT">Total Payments:</div>
  <div class='text-right'>${currency.format(totalPMTOriginal)}</div>
  <div class='text-right'>${currency.format(totalPMT)}</div>
  <div><hr /></div>
  <div><hr /></div>
  <div><hr /></div>
  <div>Value:<hr /></div>
  <div class='text-right'>${currency.format(capitalOriginal)}
  <hr /></div>
  <div class='text-right'>${currency.format(capitalWithAdditionalPMT)}
  <hr /></div>
  <div id="addPMTMade" class='col-span-2'>Additional Payments: </div>
  <div class='text-right'>${currency.format(totalAdditionalPMT)}</div>
  <div id="savings">Total Savings: </div>
  <div></div>
  <div class='text-right'>${currency.format(savings)}</div>
  `;

  //   let PMToptions = {
  //     series: [
  //       {
  //         name: 'Payments',
  //         data: valueArrays.paymentsArr,
  //       },

  //       {
  //         name: 'Principal',
  //         data: valueArrays.principalPortionArr,
  //       },
  //       {
  //         name: 'Interest',
  //         data: valueArrays.interestPortionArr,
  //       },
  //     ],
  //     theme: {
  //       mode: 'light',
  //       palette: 'palette6',
  //       monochrome: {
  //         enabled: false,
  //         color: '#255aee',
  //         shadeTo: 'light',
  //         shadeIntensity: 0.65,
  //       },
  //     },
  //     chart: {
  //       fontFamily: 'Roboto, Arial, sans-serif',
  //       height: 350,
  //       width: 650,
  //       type: 'line',
  //       zoom: {
  //         enabled: false,
  //       },
  //     },
  //     colors: ['#0000FF', '#00FF00', '#FF0000'],
  //     fill: {
  //       type: 'solid',
  //       opacity: [1, 0.5, 1],
  //     },
  //     dataLabels: {
  //       enabled: false,
  //     },
  //     stroke: {
  //       curve: 'straight',
  //       width: 4,
  //     },
  //     title: {
  //       text: 'Amortization Schedule',
  //       align: 'center',
  //     },
  //     grid: {
  //       row: {
  //         colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
  //         opacity: 0.5,
  //       },
  //     },
  //     xaxis: {
  //       labels: {
  //         rotate: 0,
  //       },
  //       tickPlacement: 'on',
  //       max: monthsLeft,
  //       title: {
  //         text: 'Number of Weeks',
  //         offsetX: 250,
  //         style: {
  //           color: '#9C9C9C',
  //           fontSize: '10px',
  //           fontFamily: 'Roboto, sans-serif',
  //           fontWeight: 400,
  //         },
  //       },
  //       tickAmount: 20,
  //     },
  //     yaxis: {
  //       decimalsInFloat: 0,
  //       labels: {
  //         formatter: function (val, index) {
  //           return '$' + Math.floor(val * 100) / 100;
  //         },
  //       },
  //     },
  //   };
  //   let PMTChart = new ApexCharts(document.querySelector('#pmtChart'), PMToptions);
  //   PMTChart.render();
}

window.addEventListener('DOMContentLoaded', function () {
  const isMortgagePage = Boolean(document.getElementById('additionalPMT'));
  const isCostPage = Boolean(document.getElementById('homeValue'));

  if (isMortgagePage) {
    formatNumberInput(document.getElementById('principal'));
    formatNumberInput(document.getElementById('currentHomeValue'));
  }

  if (isCostPage) {
    formatNumberInput(document.getElementById('homeValue'));
    formatNumberInput(document.getElementById('principal'));
    formatNumberInput(document.getElementById('assessedValue'));
    formatNumberInput(document.getElementById('insuranceCost'));
  }
});
