import { writable } from "svelte/store";
import { faker } from "@faker-js/faker";

export let storeFE = writable([]);
export let idIncrement = writable(0);

export let fieldTypes = [
  "First Name",
  "Last Name",
  "Full Name",
  "Number",
  "Sex",
  "Job Title",
  "Job Type",
  "Phone Number",
  "City",
  "Country",
  "Country Code",
  "Direction",
  "Street",
  "ZipCode",
  "Date",
  "Weekday",
  "Text",
  "Sentences",
  "Word",
];

export let dataFormats = ["JSON", "CSV", "JavaScript", "TSV"];

export function valueReturn(key) {
  switch (key) {
    case "First Name":
      return faker.name.firstName();

    case "Last Name":
      return faker.name.lastName();

    case "Full Name":
      return faker.name.fullName();

    case "Number":
      return faker.random.numeric(2);

    case "Sex":
      return faker.name.sex();

    case "Job Title":
      return faker.name.jobTitle();

    case "Job Type":
      return faker.name.jobType();

    case "Phone Number":
      return faker.phone.number();

    case "City":
      return faker.address.city();

    case "Country":
      return faker.address.country();

    case "Country Code":
      return faker.address.countryCode();

    case "Direction":
      return faker.address.direction();

    case "Street":
      return faker.address.street();

    case "ZipCode":
      return faker.address.zipCode();

    case "Date":
      return faker.date.birthdate();

    case "Weekday":
      return faker.date.weekday();

    case "Text":
      return faker.lorem.text();

    case "Sentences":
      return faker.lorem.sentences();

    case "Word":
      return faker.lorem.word();

    default:
      return "New Data";
  }
}
