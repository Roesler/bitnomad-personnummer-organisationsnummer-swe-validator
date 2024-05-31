import { AbstractControl } from "@angular/forms";
import { NumberValid, isCompanyNrOrSsnValid } from "./orgnr-or-ssn-validator";

export class OrgSsnValidator {
  static ValidateInput(typeOfNumberCheck: number) {
    return (control: AbstractControl): { [key: string]: string } | null => {

      if (!control?.value) {
        return { orgNumberValid: 'Organisationsnummer måste anges' };

      }
      if (control?.value) {
        const companyValid: NumberValid = isCompanyNrOrSsnValid(control?.value, typeOfNumberCheck);
        console.log('companyValid',companyValid);
        if (!companyValid.isValid || (companyValid.isValid && !companyValid.isOrganisation)) {

          return {
            orgNumberValid: companyValid.message.toString(),
          };

        }
      }

      return null;
    };
  }
}