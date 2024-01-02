import * as O from "fp-ts/lib/Option";
import { InitiativeDataDTO } from "../../../../../definitions/idpay/InitiativeDataDTO";
import { StatusEnum } from "../../../../../definitions/idpay/OnboardingStatusDTO";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/RequiredCriteriaDTO";
import { SelfConsentMultiDTO } from "../../../../../definitions/idpay/SelfConsentMultiDTO";
import { OnboardingFailure } from "../types/OnboardingFailure";

export type IdPayOnboardingMachineContext = {
  serviceId: string;
  initiative?: InitiativeDataDTO;
  initiativeStatus: O.Option<StatusEnum>;
  requiredCriteria: O.Option<RequiredCriteriaDTO>;
  multiConsentsPage: number;
  multiConsentsAnswers: Record<number, SelfConsentMultiDTO>;
  selfDeclarationBoolAnswers: Record<string, boolean>;
  failure: O.Option<OnboardingFailure>;
};
