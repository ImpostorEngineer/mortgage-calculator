function isNum(x) {
  filter = /(^\d+\.?$)|(^\d*\.\d+$)/;
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

function calculate() {
  let principal = mortageForm.principal.value;
  let interest = mortageForm.interest.value;
  let years = mortageForm.years.value;
  let additionalPMT = mortageForm.additionalPMT.value;
  let currentMonth = mortageForm.currentMonth.value;
  let currentHomeValue = mortageForm.currentHomeValue.value;
  let result = document.getElementById('result');
  let principalAlert = document.getElementById('principalAlert');
  let interestAlert = document.getElementById('interestAlert');
  let yearsAlert = document.getElementById('yearsAlert');
  let additionalPMTAlert = document.getElementById('additionalPMTAlert');

  if (!isNum(principal)) {
    principalAlert.innerHTML = 'Need to enter a number.';
    document.getElementById('principal').focus();
    return false;
  }
  if (!isNum(interest)) {
    interestAlert.innerHTML = 'Need to enter a number.';
    document.getElementById('interest').focus();
    return false;
  }
  if (!isNum(years)) {
    yearsAlert.innerHTML = 'Need to enter a number.';
    document.getElementById('years').focus();
    return false;
  }

  let endingValueSelector = 0;
  let principalCurrentBalance = principal;
  let principalOriginialCurrentBalance = principal;

  principalAlert.innerHTML = '';
  interestAlert.innerHTML = '';
  yearsAlert.innerHTML = '';

  let p = principal;
  let r = interest / 1200;
  let N = years * 12;
  let pmt = (p * (r * Math.pow(1 + r, N))) / (Math.pow(1 + r, N) - 1);
  let payment = pmt + +additionalPMT;
  let currency = new Intl.NumberFormat('US', { style: 'currency', currency: 'USD' });
  let valueArrays = principalArr(p, payment, N, r, additionalPMT);
  let originalValueArrays = principalArr(p, payment, N, r, 0);
  let monthsLeft = valueArrays.principalEndingValue.length - currentMonth;
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
  let capital = 0;
  let capitalOriginal = 0;
  if (currentHomeValue > 0) {
    currentHomeValue - principalCurrentBalance;
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
  <div class='text-right'>${monthsLeft}</div>
  <div id="totalPMT">Total Payments:</div>
  <div class='text-right'>${currency.format(totalPMTOriginal)}</div>
  <div class='text-right'>${currency.format(totalPMT)}</div>
  <div><hr /></div>
  <div><hr /></div>
  <div><hr /></div>
  <div>Value:<hr /></div>
  <div class='text-right'>${currency.format(capitalOriginal)}
  <hr /></div>
  <div class='text-right'>${currency.format(capital)}
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
