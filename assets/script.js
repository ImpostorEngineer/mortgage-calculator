function isNum(x) {
  filter = /(^\d+\.?$)|(^\d*\.\d+$)/;
  if (filter.test(x)) {
    return true;
  }
  return false;
}

function paymentArr(pmt, N) {
  let paymentsArr = [];
  for (let i = 0; i < N; i++) {
    paymentsArr.push(pmt);
  }
  return paymentsArr;
}

function principalArr(p, pmt, N, r, additionalPMT) {
  if (isNaN(additionalPMT)) {
    additionalPMT = 0;
  }
  let principalEndingValue = [];
  for (let i = 0; i < N; i++) {
    let interestPortion = p * r;
    let princiapPortion = pmt - interestPortion;
    p = p - princiapPortion - additionalPMT;
    if (p >= 0) {
      principalEndingValue.push(Math.round(p * 100) / 100);
    }
  }
  return principalEndingValue;
}

function calculate() {
  let principal = mortageForm.principal.value;
  let interest = mortageForm.interest.value;
  let years = mortageForm.years.value;
  let additionalPMT = mortageForm.additionalPMT.value;
  let currentMonth = mortageForm.currentMonth.value;
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
  principalAlert.innerHTML = '';
  interestAlert.innerHTML = '';
  yearsAlert.innerHTML = '';

  let p = principal;
  let r = interest / 1200;
  let N = years * 12;
  let payment = (p * (r * Math.pow(1 + r, N))) / (Math.pow(1 + r, N) - 1) + additionalPMT;
  let currency = new Intl.NumberFormat('US', { style: 'currency', currency: 'USD' });
  let pmt = paymentArr(payment, N);
  let pEndingValue = principalArr(p, payment, N, r, additionalPMT);
  let monthsLeft = pEndingValue.length - currentMonth;
  let principalCurrentBalance = pEndingValue[currentMonth - 1];
  let additionalPMTMade = additionalPMT * currentMonth;

  result.innerHTML = `Monthly Payments: ${currency.format(payment)} 
  <br> ${additionalPMT}
  <br> Current Balance: ${currency.format(principalCurrentBalance)} 
  <br> Months Left: ${monthsLeft} 
  <br> Additional Payments Made: ${currency.format(additionalPMTMade)}
  `;
}
