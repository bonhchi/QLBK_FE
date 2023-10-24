import { IConfig } from "ngx-mask";

export const maskConfig: Partial<IConfig> = {
  validation: true,
  // separatorLimit: "2",
  thousandSeparator: ',',
  decimalMarker: '.',
  allowNegativeNumbers: false,
};