import 'package:flutter/material.dart';
import 'package:flutter_realtime_gps_location_example/src/pages/gps/gps_controller.dart';
import 'package:flutter_realtime_gps_location_example/src/pages/gps/gps_page.dart';
import 'package:provider/provider.dart';
import 'pages/home/home_page.dart';

class RealtimeGps extends StatelessWidget {
  const RealtimeGps({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Superviz - Realtime GPS',
      theme: ThemeData(
        textSelectionTheme: const TextSelectionThemeData(
          selectionColor: Colors.white30,
          selectionHandleColor: Colors.black,
        ),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6210CC),
        ),
        useMaterial3: true,
      ),
      routes: {
        HomePage.routeName: (_) => const HomePage(),
        GpsPage.routeName: (_) => ChangeNotifierProvider<GpsController>(
              create: (context) => GpsController(),
              child: const GpsPage(),
            ),
      },
    );
  }
}
