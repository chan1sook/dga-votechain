import validator from "validator";

export function isBlockchainServerDataValid(serverData: {
  host: string;
  name: string;
}) {
  return (
    (validator.isIP(serverData.host) || validator.isURL(serverData.host)) &&
    serverData.name
  );
}
