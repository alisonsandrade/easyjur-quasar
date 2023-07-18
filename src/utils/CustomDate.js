import { date } from "quasar";

const { addToDate, formatDate, extractDate } = date;

export class CustomDate {
  constructor(mask) {
    this.mask = mask || "DD/MM/YYYY HH:mm";
  }

  setFormatDateToBR(dateValue, customMask) {
    try {
      if (!dateValue) throw new Error("O parâmetro data é obrigatório");

      let newDateExtract = null;

      if (typeof dateValue === "string") {
        newDateExtract = extractDate(dateValue, customMask || this.mask);
        return formatDate(newDateExtract, customMask || this.mask);
      }

      return formatDate(dateValue, customMask || this.mask);
    } catch (err) {
      console.error(err);
    }
  }

  setFormatDateToBRAndAddMinutes(dateValue, minutes = 15, customMask) {
    try {
      if (!dateValue) throw new Error("O parâmetro data é obrigatório");

      const dateFormated = this.setFormatDateToBR(dateValue, customMask);

      const dateAdded = addToDate(
        extractDate(dateFormated, customMask || this.mask),
        {
          minutes,
        }
      );

      return formatDate(dateAdded, customMask || this.mask);
    } catch (err) {
      console.error(err);
    }
  }

  extractDateToBR(dateValue, mask) {
    return extractDate(dateValue, mask || "DD/MM/YYYY HH:mm");
  }

  formatDateStringToUsa(dateValue, mask) {
    return formatDate(
      extractDate(dateValue, mask || "DD/MM/YYYY HH:mm"),
      "YYYY-MM-DDTHH:mm:ss"
    );
  }
}
