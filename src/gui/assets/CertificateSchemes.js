export class ID {
  constructor(
    name,
    surname,
    dayOfBirth,
    placeOfBirth,
    sex,
    personalNumber,
    nationality,
    identityCardNumber,
    dateOfIssue,
    expiryDate,
  ) {
    this.name = name
    this.surname = surname
    this.dayOfBirth = dayOfBirth
    this.placeOfBirth = placeOfBirth
    this.sex = sex
    this.personalNumber = personalNumber
    this.nationality = nationality
    this.identityCardNumber = identityCardNumber
    this.dateOfIssue = dateOfIssue
    this.expiryDate = expiryDate
  }
}

export class StudentCard {
  constructor(
    name,
    surname,
    university,
    personalNumber,
    idNumber
  ) {
    this.name = name
    this.surname = surname
    this.university = university
    this.personalNumber = personalNumber
    this.idNumber = idNumber
  }
}

export class DrivingLicence {
  constructor(
    name,
    surname,
    dayOfBirth,
    placeOfBirth,
    personalNumber,
    dateOfIssue,
    expiryDate,
    category
  ) {
    this.name = name
    this.surname = surname
    this.dayOfBirth = dayOfBirth
    this.placeOfBirth = placeOfBirth
    this.personalNumber = personalNumber
    this.dateOfIssue = dateOfIssue
    this.expiryDate = expiryDate
    this.category = category
  }
}

export class Passport {
  constructor(
    name,
    surname,
    dayOfBirth,
    placeOfBirth,
    nationality,
    dateOfIssue,
    expiryDate,
  ) {
    this.name = name
    this.surname = surname
    this.dayOfBirth = dayOfBirth
    this.placeOfBirth = placeOfBirth
    this.nationality = nationality
    this.dateOfIssue = dateOfIssue
    this.expiryDate = expiryDate
  }
}