import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';

import 'gps_controller.dart';

class GpsPage extends StatefulWidget {
  static const String routeName = "/gps_page";

  const GpsPage({super.key});

  @override
  State<GpsPage> createState() => _GpsPageState();
}

class GpsPageArguments {
  final String username;
  final String imageUrl;

  GpsPageArguments({
    required this.username,
    required this.imageUrl,
  });
}

class _GpsPageState extends State<GpsPage> {
  GpsController? _controller;
  final _mapControllerCompleter = Completer<GoogleMapController>();

  @override
  void initState() {
    super.initState();

    WidgetsFlutterBinding.ensureInitialized().addPostFrameCallback((_) async {
      final arguments =
          ModalRoute.of(context)!.settings.arguments as GpsPageArguments;

      _controller!.connectToRealtime(
        username: arguments.username,
      );

      _controller!.imageUrl = arguments.imageUrl;

      setState(() {});
    });
  }

  @override
  Widget build(BuildContext context) {
    _controller ??= context.watch<GpsController>();

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text(
          "Superviz Realtime GPS",
          style: TextStyle(
            color: Theme.of(context).colorScheme.onInverseSurface,
          ),
        ),
        elevation: 2.0,
        backgroundColor: Theme.of(context).colorScheme.inverseSurface,
        actions: [
          IconButton(
            onPressed: () {
              _controller!.leave();
              Navigator.of(context).pop();
            },
            icon: const Icon(Icons.logout_rounded),
          )
        ],
      ),
      body: Stack(
        fit: StackFit.expand,
        children: [
          LayoutBuilder(builder: (context, constraints) {
            return GoogleMap(
              padding: EdgeInsets.only(bottom: constraints.maxHeight * .3),
              myLocationEnabled: true,
              myLocationButtonEnabled: false,
              initialCameraPosition: const CameraPosition(
                target: LatLng(37.42796133580664, -122.085749655962),
                zoom: .0,
              ),
              markers: _controller!.markers,
              onMapCreated: (controller) {
                if (_mapControllerCompleter.isCompleted) return;

                _mapControllerCompleter.complete(controller);
                _controller!.mapController = controller;
              },
            );
          }),
          DraggableScrollableSheet(
            maxChildSize: .6,
            initialChildSize: .25,
            builder: (_, scrollController) {
              return Card(
                margin: EdgeInsets.zero,
                color: Colors.white,
                shape: const RoundedRectangleBorder(
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(12.0),
                    topRight: Radius.circular(12.0),
                  ),
                ),
                child: ListView.builder(
                  padding: const EdgeInsets.all(.0),
                  controller: scrollController,
                  itemCount: _controller!.connectedUsers.length,
                  itemBuilder: (context, index) {
                    final user = _controller!.connectedUsers.elementAt(index);

                    return ListTile(
                      leading: _controller!.positions.isNotEmpty
                          ? CircleAvatar(
                              maxRadius: 50,
                              backgroundImage: NetworkImage(
                                _controller!.positions[index].imageUrl,
                              ),
                              child: Center(
                                child: Container(
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: Colors.grey,
                                      width: 2.0,
                                    ),
                                  ),
                                  clipBehavior: Clip.hardEdge,
                                ),
                              ),
                            )
                          : null,
                      title: Text(user.name.isEmpty ? "Guest" : user.name),
                      subtitle: Text(user.id),
                      trailing: IconButton(
                        onPressed: () => _controller!.findUserLocation(
                          userId: user.id,
                        ),
                        icon: const Icon(
                          Icons.my_location_rounded,
                        ),
                      ),
                    );
                  },
                ),
              );
            },
          )
        ],
      ),
    );
  }
}
