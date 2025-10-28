import Map from '../utils/map';

export async function reportMapper(report) {
  // Ambil nama lokasi dari koordinat
  console.log('Mapping report:', report);
  return {
    id: report.id,
    name: report.name,
    description: report.description,
    reporter: { name: report.name },
    createdAt: report.createdAt,
    evidenceImages: [report.photoUrl],
    photoUrl: [report.photoUrl],
    lat: report.lat,
    lon: report.lon,
    placeName: report.placeName,
    location: {
      placeName: await Map.getPlaceNameByCoordinate(report.lat, report.lon),
    },
  };
}
