/* eslint-disable no-underscore-dangle */
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { StateFrom } from "xstate";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/onboarding/RequiredCriteriaDTO";
import { SelfDeclarationBoolDTO } from "../../../../../definitions/idpay/onboarding/SelfDeclarationBoolDTO";
import { SelfDeclarationDTO } from "../../../../../definitions/idpay/onboarding/SelfDeclarationDTO";
import { SelfDeclarationMultiDTO } from "../../../../../definitions/idpay/onboarding/SelfDeclarationMultiDTO";
import { Context, IDPayOnboardingMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayOnboardingMachineType>;
const selectRequiredCriteria = (state: StateWithContext) =>
  state.context.requiredCriteria;
const discernCriteria = <T extends SelfDeclarationDTO>(
  criteria: O.Option<RequiredCriteriaDTO> | undefined,
  filterFunc: typeof SelfDeclarationMultiDTO | typeof SelfDeclarationBoolDTO
) =>
  pipe(
    criteria,
    O.fromNullable,
    O.flatten,
    O.fold(
      () => [],
      some => some.selfDeclarationList.filter(filterFunc.is)
    )
  ) as Array<T>;

const multiRequiredCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    discernCriteria<SelfDeclarationMultiDTO>(
      requiredCriteria,
      SelfDeclarationMultiDTO
    )
);

const pickedCriteriaSelector = createSelector(
  (state: StateWithContext) => state.context.multiConsents,
  val => val ?? []
);

const boolRequiredCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    discernCriteria<SelfDeclarationBoolDTO>(
      requiredCriteria,
      SelfDeclarationBoolDTO
    )
);
const getMultiRequiredCriteriaFromContext = (context: Context) =>
  discernCriteria<SelfDeclarationMultiDTO>(
    context.requiredCriteria,
    SelfDeclarationMultiDTO
  );

const getBoolRequiredCriteriaFromContext = (context: Context) =>
  discernCriteria<SelfDeclarationBoolDTO>(
    context.requiredCriteria,
    SelfDeclarationBoolDTO
  );

export {
  multiRequiredCriteriaSelector,
  boolRequiredCriteriaSelector,
  pickedCriteriaSelector,
  discernCriteria,
  getMultiRequiredCriteriaFromContext,
  getBoolRequiredCriteriaFromContext
};
