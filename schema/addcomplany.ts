import { isContainSpace } from "@/utils/methods";
import {
  check,
  InferInput,
  minLength,
  object,
  string,
  pipe,
  nullish,
} from "valibot";

const AddCompanySchema = object({
  name: pipe(string("Enter Company Name")),
  contact1: pipe(
    string(),
    minLength(10, "Mobile number should be 10 digits."),
    check(isContainSpace, "Mobile number cannot contain space.")
  ),
  contact2: nullish(
    pipe(
      string(),
      minLength(10, "Mobile number should be 10 digits."),
      check(isContainSpace, "Mobile number cannot contain space.")
    )
  ),
  address: pipe(string("Enter Address")),
  website: pipe(string("Enter Website")),
  email: pipe(string("Enter Email")),
  zone: pipe(string("Select Zone")),
  gst: pipe(string("Enter GST Number")),
  pan: pipe(string("Enter PAN Number")),
  contact_person: pipe(string("Enter Contact Person Name")),
  contact_person_number: pipe(
    string(),
    minLength(10, "Mobile number should be 10 digits."),
    check(isContainSpace, "Mobile number cannot contain space.")
  ),
  designation: pipe(string("Enter Designation")),
});

type AddCompanyForm = InferInput<typeof AddCompanySchema>;
export { AddCompanySchema, type AddCompanyForm };
