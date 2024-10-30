import 'dart:async';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart' as http;
import 'package:superviz_realtime/superviz_realtime.dart';
import 'package:uuid/uuid.dart';

import '../../types/types.dart';
import '../../utils/utils.dart';

class GpsController extends ChangeNotifier {
  Realtime? _realtime;
  Channel? _channel;

  StreamController<Position>? _gpsPositionController;

  StreamSubscription? _gpsPositionSubscription;

  bool _shouldFitToAllPositions = true;

  bool _isConnected = false;
  bool get isConnected => _isConnected;

  final _positions = <UserPosition>[];
  List<UserPosition> get positions => _positions;

  final _userId = const Uuid().v4();

  late String _imageUrl;
  set imageUrl(String value) => _imageUrl = value;

  GoogleMapController? _mapController;
  set mapController(GoogleMapController? mapController) =>
      _mapController = mapController;

  final Set<PresenceEvent> _connectedUsers = {};
  Set<PresenceEvent> get connectedUsers => _connectedUsers;

  final _markers = <Marker>{};
  Set<Marker> get markers => _markers;

  Future<void> connectToRealtime({required String username}) async {
    try {
      if (!(await _validateGeolocator())) return;

      _realtime = Realtime(
        const RealtimeAuthenticationParams(
          clientId: String.fromEnvironment('CLIENT_ID'),
          secret: String.fromEnvironment('SECRET'),
        ),
        RealtimeEnvironmentParams(
          participant: Participant(id: _userId, name: username),
          environment: EnvironmentTypes.dev,
        ),
      );

      _channel = await _realtime!.connect('flutter-example-realtime-gps');

      _channel!.subscribe<RealtimeChannelState>(
        RealtimeChannelEvent.realtimeChannelStateChanged.description,
        (RealtimeChannelState state) {
          switch (state) {
            case RealtimeChannelState.connected:
              _channel!.participant.getAll().then((participants) {
                _connectedUsers.addAll(participants);
              });
              _listenToGpsPosition();
              break;
            case RealtimeChannelState.connecting:
              _isConnected = false;
              _pauseGpsListener();
              break;
            case RealtimeChannelState.disconnected:
              _isConnected = false;
              _removeGpsListeners();
              break;
          }
          notifyListeners();
        },
      );

      _subscribeToDefaultEvents();
    } catch (e) {
      print(e);
    } finally {
      notifyListeners();
    }
  }

  void _subscribeToDefaultEvents() {
    _subscribeToRecivePositions();
    _onNewUser();
    _onLeaveUser();
  }

  void _onNewUser() {
    return _channel!.participant.subscribe(
      PresenceEvents.joinedRoom,
      (connectedUser) {
        _connectedUsers.add(connectedUser);
      },
    );
  }

  void _onLeaveUser() {
    return _channel!.participant.subscribe(PresenceEvents.leave, (presence) {
      _connectedUsers.remove(presence);
      _positions.removeWhere((position) => position.userId == presence.id);
      notifyListeners();
    });
  }

  void _subscribeToRecivePositions() {
    _channel!.subscribe<RealtimeMessage>('new.position', (newPosition) async {
      final newUserPosition = UserPosition(
        userId: newPosition.data['userId'],
        username: newPosition.data['username'],
        imageUrl: newPosition.data['imageUrl'],
        lat: newPosition.data['lat'],
        lon: newPosition.data['lon'],
      );

      if (_positions.contains(newUserPosition)) {
        final position = _positions.firstWhere(
          (element) => element == newUserPosition,
        );

        position.lat = newUserPosition.lat;
        position.lon = newUserPosition.lon;
      } else {
        _positions.add(newUserPosition);
      }

      if (newPosition.data['userId'] != _userId) {
        if (_markers.any(
          (element) => element.markerId.value == newUserPosition.userId,
        )) {
          final marker = _markers.firstWhere(
            (element) => element.markerId.value == newUserPosition.userId,
          );

          _markers.remove(marker);
          _markers.add(
            marker.copyWith(
              positionParam: LatLng(newUserPosition.lat, newUserPosition.lon),
            ),
          );
        } else {
          _markers.add(
            Marker(
              markerId: MarkerId(newUserPosition.userId),
              icon: await _getBytesFromNetworkImage(newUserPosition.imageUrl),
              position: LatLng(newUserPosition.lat, newUserPosition.lon),
              alpha: 1.0,
              flat: false,
              infoWindow: InfoWindow(
                title: newUserPosition.username,
                snippet: newUserPosition.userId,
              ),
            ),
          );
        }
      }

      if (!_shouldFitToAllPositions) return;

      _mapController!.animateCamera(
        CameraUpdate.newLatLngBounds(
          LatLngBoundsExtension.fromListOfPositions(positions),
          100.0,
        ),
      );

      notifyListeners();
    });
  }

  void _listenToGpsPosition() {
    if (_gpsPositionSubscription != null) {
      return _gpsPositionSubscription!.resume();
    }

    final stream = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        distanceFilter: 10,
        accuracy: LocationAccuracy.high,
      ),
    );

    _gpsPositionSubscription = stream.listen((position) {
      _channel!.publish<Map<String, dynamic>>(
        'new.position',
        {
          'userId': _userId,
          'username': _channel!.user.name,
          'imageUrl': _imageUrl,
          'lat': position.latitude,
          'lon': position.longitude,
        },
      );
    });

    _gpsPositionController = StreamController<Position>()
      ..addStream(
        stream,
      );
  }

  void _pauseGpsListener() {
    _gpsPositionSubscription?.pause();
  }

  void _removeGpsListeners() async {
    await _gpsPositionSubscription?.cancel();
    _gpsPositionSubscription = null;
    await _gpsPositionController?.done;
    _gpsPositionController = null;
  }

  Future<bool> _validateGeolocator() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('Location services are disabled.');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return Future.error(
          'Location permissions are denied',
        );
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return Future.error(
        'Location permissions are permanently denied, we cannot request permissions.',
      );
    }

    return true;
  }

  void findUserLocation({required String userId}) {
    final position = _positions.firstWhere(
      (position) => position.userId == userId,
    );

    _shouldFitToAllPositions = false;

    Timer(const Duration(seconds: 5), () {
      _shouldFitToAllPositions = true;
    });

    _mapController!.animateCamera(CameraUpdate.newLatLngBounds(
      LatLngBoundsExtension.fromListOfPositions([position]),
      .0,
    ));
  }

  void leave() {
    _positions.clear();
    connectedUsers.clear();
    _realtime!.destroy();
    _realtime = null;
  }

  Future<BitmapDescriptor> _getBytesFromNetworkImage(String url) async {
    final response = await http.get(Uri.parse(url));

    final codec = await instantiateImageCodec(
      response.bodyBytes,
    );

    final frame = await codec.getNextFrame();
    final data = await frame.image.toByteData(format: ImageByteFormat.png);

    return BitmapDescriptor.bytes(
      data!.buffer.asUint8List(),
      width: 80,
      height: 80,
    );
  }
}
