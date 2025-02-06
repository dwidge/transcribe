export const parseDateString = (dateString: string): Date => {
  let year: number;
  let month: number;
  let day: number;
  let hours: number = 12;
  let minutes: number = 0;

  // Normalize the input by extracting numeric characters up to the first non-numeric character
  const matches = dateString.match(/^\d+/);
  if (matches) {
    dateString = matches[0];
  } else {
    throw new Error("Invalid date string format: " + dateString);
  }

  if (dateString.length === 6) {
    year = parseInt(dateString.substring(0, 2), 10);
    month = parseInt(dateString.substring(2, 4), 10) - 1; // Months are 0-based
    day = parseInt(dateString.substring(4, 6), 10);
  } else if (dateString.length === 8) {
    year = parseInt(dateString.substring(0, 4), 10);
    month = parseInt(dateString.substring(4, 6), 10) - 1;
    day = parseInt(dateString.substring(6, 8), 10);
  } else if (dateString.length === 10) {
    year = parseInt(dateString.substring(0, 4), 10);
    month = parseInt(dateString.substring(4, 6), 10) - 1;
    day = parseInt(dateString.substring(6, 8), 10);
    hours = parseInt(dateString.substring(8, 10), 10);
    minutes = 0; // Default minutes to 0 if not provided
  } else {
    throw new Error(
      "Invalid date string format: " + dateString + " " + dateString.length
    );
  }

  // Adjust year for 2-digit year input
  if (year < 100) {
    year += 2000; // Assuming 20xx for 2-digit years
  }

  // Ensure the date is valid
  const date = new Date(year, month, day, hours, minutes);
  if (isNaN(date.getTime()) || date.getFullYear() < 1970) {
    throw new Error("Invalid date");
  }

  // Log the parsed date for debugging
  // console.log(dateString, year, month, day, hours, minutes, date.toISOString());

  return date;
};

export const parseDateStringSafe = (dateString: string) => {
  try {
    return parseDateString(dateString);
  } catch (e) {
    return null;
  }
};
