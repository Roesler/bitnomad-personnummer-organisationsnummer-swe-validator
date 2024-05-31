// 2022
/*
Check result in console
Examples of different supported formats in bottom.
*/
export interface NumberValid { 
  currentValue: string; // Original value
  normalizedValue: string; // No spaces, + or - in string
  isOrganisation: boolean; // If valid organistion
  isPerson: boolean; // If valid ssn
  isValid: boolean; // In the end, luhn algo checks if this is correct or not
  message: string; // Type of result
}

// check if number matches a swedish personal identity number or an organization number
export function isCompanyNrOrSsnValid(originalInput: string, checktype = 0): NumberValid {
  let isOrgNum = true;
  let isOldPerson = false;
  let ssnResult: NumberValid;
  const foreignCompanyRegex = new RegExp(/^[0]{6}(-|\s)?[0]{4}$/gm);
  const regex = new RegExp(/^(\d{6}|\d{8})(-|\+|\s)?(\d{4})$/gm);

  // Check if input is for foreign company, nothing to validate then
  if (foreignCompanyRegex.test(originalInput)) {
    const cleanForeignInput = originalInput
      .replace(/\D/g, '');
    return {
      currentValue: originalInput,
      normalizedValue: cleanForeignInput,
      isValid: true,
      isOrganisation: true,
      isPerson: false,
      message: 'Utländskt företag'
    };
  }

  const validNumber = regex.test(originalInput);

  if (!validNumber) {
    return {
      currentValue: originalInput,
      normalizedValue: '',
      isValid: false,
      isOrganisation: false,
      isPerson: false,
      message: 'Inte ett godkänt nummer'
    };
  }

  const cleanInput = originalInput
    .replace(/\D/g, '');

  const firstTwoNumbers = +cleanInput.substring(0, 2);

  /* If person has a '+' in it, it's a old person/company(100+)
  ref: page 7
  https://www.scb.se/contentassets/8d9d985ca9c84c6e8d879cc89a8ae479/ov9999_2016a01_br_be96br1601.pdf
  */
  isOldPerson = originalInput.match(/[+]/) ? true : false;

  if (cleanInput.length === 10 || cleanInput.length === 12) {
    if (cleanInput.length === 12 && firstTwoNumbers < 19) {
      return {
        currentValue: originalInput,
        normalizedValue: cleanInput,
        isValid: false,
        isOrganisation: false,
        isPerson: false,
        message: 'Årtal är lägre än 1900'
      };
    }

    // Adjusting the results
    ssnResult = { ...typeOfCheck(cleanInput, originalInput, checktype, isOldPerson) };

    // third number in an org number can not be less than 2
    if (isOrgNum && ssnResult.isOrganisation && +ssnResult.normalizedValue.substring(2, 3) < 2) {
      isOrgNum = false;
    }

    // not a orgnumber and not a valid Ssn
    if (!isOrgNum && !ssnResult.isValid && !ssnResult.isPerson) {
      return { ...ssnResult, currentValue: originalInput };
    }

    // calculate and validate checksum with Luhn algorithm
    ssnResult.message = ssnResult.isOrganisation && !ssnResult.isPerson ? 'Godkänd organisation' : ssnResult.message;
    let luhnAlgoResult = (ssnResult.isOrganisation || ssnResult.isPerson) ? validateWithLuhnAlgo(cleanInput, ssnResult) : ssnResult;

    // Trim org nr currentValue to closer look like the one we validated
    if (luhnAlgoResult.isOrganisation && (luhnAlgoResult.currentValue.length === 12 || luhnAlgoResult.currentValue.length === 13)) {
      luhnAlgoResult = { ...luhnAlgoResult,
        currentValue: luhnAlgoResult.currentValue.substring(2)
      };
    }
    // End result
    return { ...luhnAlgoResult };
  }
  else {
    // To long or to short number
    return {
      currentValue: originalInput,
      normalizedValue: cleanInput,
      isValid: false,
      isOrganisation: false,
      isPerson: false,
      message: 'Ej godkänt nummer'
    };
  }
}

function getCurrentShortYear(): string {
  const d = new Date();
  return d.getFullYear().toString()
    .substring(-2);
}

function isDate(year: number, month: number, day: number): boolean {
  // months have number 0-11 in JavaScript
  const m = month - 1;
  const tmpDate = new Date(year, m, day);
  if (
    (tmpDate.getFullYear() === year) &&
      (tmpDate.getMonth() === m) &&
      (tmpDate.getDate() === day)
  ) {
    return true;
  }
  return false;
}

function validSsn(cleanInput: string, isOldPerson: boolean): NumberValid {
  // adjust number to format YYYYMMDDNNNN
  if (cleanInput.length === 10) {
    if (isOldPerson) {
      // person is over 100 years old so we can assume was born in th 1900s
      cleanInput = `19${cleanInput}`;
    }
    else if (+cleanInput.toString().substring(0, 2) > +getCurrentShortYear().substring(2, 4)) {
      // person was born in the 1900s
      cleanInput = `19${cleanInput}`;
    }
    else {
      // person was born in the 2000s
      cleanInput = `20${cleanInput}`;
    }
  }
  // Should be YYYYMMDDNNNN-format by now even if orgnr
  // check if personal id number is a fake date
  const year = +(cleanInput.substring(0, 4));
  const month = +(cleanInput.substring(4, 6));
  const day = +(cleanInput.substring(6, 8));

  if (day > 60 && month <= 12) {
    return {
      currentValue: cleanInput,
      normalizedValue: cleanInput,
      isValid: true,
      isOrganisation: false,
      isPerson: true,
      message: 'Samordningsnummer'
    };
  }

  if (!isDate(year, month, day)) {
    const nomralizedOrgNr = cleanInput.substring(2);
    return {
      currentValue: nomralizedOrgNr,
      normalizedValue: nomralizedOrgNr,
      isValid: false,
      isOrganisation: true,
      isPerson: false,
      message: 'Fejk datum'
    };
  }

  // check if birth date is in the future
  if (new Date(year, month, day) > new Date()) {
    return {
      currentValue: cleanInput,
      normalizedValue: cleanInput,
      isValid: true,
      isOrganisation: true,
      isPerson: false,
      message: 'Datumet är i framtiden'
    };
  }
  // Valid ssn
  return {
    currentValue: cleanInput,
    normalizedValue: cleanInput,
    isValid: true,
    isOrganisation: false,
    isPerson: true,
    message: 'Godkänt personnummer'
  };
}

function typeOfCheck(cleanInput: string, originalInput: string, checkType: number, isOldPerson: boolean): NumberValid {

  switch (checkType) {
    case 1: { // SSN
      let ssnResult = { ...validSsn(cleanInput, isOldPerson), currentValue: originalInput };
      if (ssnResult.isValid && ssnResult.isPerson && !ssnResult.isOrganisation) {
        ssnResult = {
          ...ssnResult,
          isValid: true,
          isOrganisation: false,
          isPerson: true,
        };
      }
      return ssnResult;
    }
    case 2: { // Organizations/companies
      let ssnResult = { ...validSsn(cleanInput, isOldPerson), currentValue: originalInput };
      if (ssnResult.isValid && ssnResult.isPerson && !ssnResult.isOrganisation) {
        ssnResult = {
          ...ssnResult,
          isValid: true,
          isOrganisation: true,
          isPerson: false,
        };
      }
      return ssnResult;
    }
    default: { // no regulations
      return { ...validSsn(cleanInput, isOldPerson), currentValue: originalInput };
    }
  }
}

function validateWithLuhnAlgo(cleanInput: string, ssnResult: NumberValid): NumberValid {
  let luhnSerie = '';
  const numIndex = cleanInput.length === 12 ? 2 : 0;
  for (let n = numIndex; n < cleanInput.length; n += 1) {
    luhnSerie += ((((n + 1) % 2) + 1) * +cleanInput.substring(n, n + 1));
  }

  let checksum = 0;

  for (let n = 0; n < luhnSerie.length; n += 1) {
    checksum += +luhnSerie.substring(n, n + 1) * 1;
  }
  return {
    ...ssnResult,
    isValid: checksum % 10 === 0,
    message: (checksum % 10 === 0) ? ssnResult.message : 'Fel checksum'
  };
}

//------------------------

/*
Valid formats
YYYYMMDDNNNN
5592371115

YYYYMMDD-NNNN
559237-1115
212000-0142 - Sthlm stad

YYYYMMDD NNNN
559237 1115

YYYYMMDD+NNNN
559237+1115

Samordningsnummer:
200411643844

fejk.se fake ssn generator
200404020844
19730118-3898

000000-0000 marker for foreign organizations
*/
/* function init(){
//       the number you want to control ---vvv        vvv--- what kind of check, treat number like: 1 ssn or company, or 2 only company
  const result = isCompanyNrOrSsnValid('198009210314', 1); 
  console.log('result: ', result);
};

init(); */
