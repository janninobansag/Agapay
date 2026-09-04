export function isWithinPhilippines(latitude: number, longitude: number) {
  return latitude >= 4.2 && latitude <= 21.3 && longitude >= 116 && longitude <= 127;
}
