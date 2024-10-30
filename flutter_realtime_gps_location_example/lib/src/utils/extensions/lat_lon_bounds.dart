import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../../types/types.dart';

extension LatLngBoundsExtension on LatLngBounds {
  static fromListOfPositions(List<UserPosition> latLngList) {
    if (latLngList.isEmpty) return null;

    double? x0, x1, y0, y1;
    for (UserPosition latLng in latLngList) {
      if (x0 == null || x1 == null || y0 == null || y1 == null) {
        x0 = x1 = latLng.lat;
        y0 = y1 = latLng.lon;
      } else {
        if (latLng.lat > x1) x1 = latLng.lat;
        if (latLng.lat < x0) x0 = latLng.lat;
        if (latLng.lon > y1) y1 = latLng.lon;
        if (latLng.lon < y0) y0 = latLng.lon;
      }
    }
    return LatLngBounds(
        northeast: LatLng(x1!, y1!), southwest: LatLng(x0!, y0!));
  }
}
